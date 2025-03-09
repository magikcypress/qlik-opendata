<script setup>
import { ref, onMounted } from "vue";
import { useJsonRepair } from "@/composables/useJsonRepair";
import { loadQlikScript } from '@/utils/utils';

import { auth, apps, spaces, qix } from "@qlik/api";

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;
const qlikAppsId = import.meta.env.VITE_QLIK_APPS_ID.split(',');

const loadError = ref(null);
const jsonError = ref(null);
const activeSheet = ref(null);
const sheetsInDatabase = ref(new Set());
const applicationsInDatabase = ref(new Set());
const sheetsList = ref([]);
const sheetsData = ref([]);
const applicationsData = ref([]);
const loading = ref(true);

const fetchApplications = async () => {
	try {
		auth.setDefaultHostConfig({
			host: tenantUrl,
			authType: "Oauth2",
			clientId: qlikClientId,
			redirectUri: redirectUrl,
			accessTokenStorage: "session",
			autoRedirect: true,
		});

		for await (const apps of qlikAppsId) {
			console.log('AppsId:', apps);
			const AppsId = checkApplicationInDatabase(apps);

			const fetchedApps = [];
			for await (const appId of AppsId) {
				const response = await apps.getAppInfo(appId);
				fetchedApps.push(response.data);
			}
			apps.value = fetchedApps;
		}

	} catch (error) {
		loadError.value = error.message;
	} finally {
		loading.value = false;
	}
};

const checkSheetsApplications = async (app) => {
	try {
		auth.setDefaultHostConfig({
			host: tenantUrl,
			authType: "Oauth2",
			clientId: qlikClientId,
			redirectUri: redirectUrl,
			accessTokenStorage: "session",
			autoRedirect: true,
		});

		const session = qix.openAppSession({ appId: app });
		const QlikApp = await session.getDoc();
		const sheetsList = await QlikApp.getSheetList();
		console.log('sheetsList:', sheetsList);

	} catch (error) {
		console.error('Error fetching sheets from qlik:', error);
	}
};

const toggleKpi = (sheetId) => {
	activeSheet.value = activeSheet.value === sheetId ? null : sheetId;
};


const checkApplicationInDatabase = async (app) => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/applications`);
		if (!response.ok) {
			throw new Error('Failed to fetch applications from database');
		}
		const data = await response.json();

		applicationsData.value = data;
		data.forEach(application => {
			applicationsInDatabase.value.add(application.qId);
			checkSheetsApplications(application.qId);
		});

		console.log('applicationsInDatabase:', applicationsInDatabase);
	} catch (error) {
		console.error('Error fetching applications from database:', error);
	}
};

const addSheetToMongoDB = async (sheet) => {
	try {
		console.log('Adding sheet to MongoDB:', sheet);
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/sheets`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				qId: sheet.qInfo.qId,
				title: sheet.qMeta.title,
				description: sheet.qMeta.description,
				approved: sheet.qMeta.approved,
				published: sheet.qMeta.published,
				owner: sheet.qMeta.owner,
				ownerId: sheet.qMeta.ownerId,
				createdDate: sheet.qMeta.createdDate,
				modifiedDate: sheet.qMeta.modifiedDate,
				publishTime: sheet.qMeta.publishTime,
				active: true
			})
		});

		console.log('response:', response);
		if (!response.ok) {
			throw new Error('Failed to add sheet to MongoDB');
		}
		alert('Sheet added to MongoDB successfully');
		sheetsInDatabase.value.add(sheet.qInfo.qId); // Add to the set of sheets in the database
	} catch (error) {
		console.error('Error adding sheet to MongoDB:', error);
		alert('Error adding sheet to MongoDB');
	}
};

const removeSheetFromMongoDB = async (sheet) => {
	try {
		console.log('Removing sheet from MongoDB:', sheet);
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/sheets/${sheet.qInfo.qId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		console.log('response:', response);
		if (!response.ok) {
			throw new Error('Failed to remove sheet from MongoDB');
		}
		alert('Sheet removed from MongoDB successfully');
		sheetsInDatabase.value.delete(sheet.qInfo.qId); // Remove from the set of sheets in the database
	} catch (error) {
		console.error('Error removing sheet from MongoDB:', error);
		alert('Error removing sheet from MongoDB');
	}
};

const toggleSheetActive = async (sheet) => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/sheets/${sheet.qInfo.qId}/active`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) {
			throw new Error('Failed to toggle sheet active state');
		}
		const updatedSheet = await response.json();
		sheet.active = updatedSheet.active;
	} catch (error) {
		console.error('Error toggling sheet active state:', error);
		alert('Error toggling sheet active state');
	}
};

const checkSheetInDatabase = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/sheets`);
		if (!response.ok) {
			throw new Error('Failed to fetch sheets from database');
		}
		const data = await response.json();
		sheetsData.value = data;
		data.forEach(sheet => {
			sheetsInDatabase.value.add(sheet.qId);
		});
	} catch (error) {
		console.error('Error fetching sheets from database:', error);
	}
};

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl);
	checkSheetInDatabase();
	fetchApplications();

});
</script>

<template>
	<div>
		<h2>Sheets</h2>
		{{ sheetsList }}


		<div v-for="application in applicationsData" :key="application.qId">

			<div v-if="jsonError" class="error">{{ jsonError }}</div>
			<div v-else>
				<qlik-embed ui="analytics/selections" :app-id="`${application.qId}`"></qlik-embed>
				<h3>{{ application.name }}</h3>

				<div v-for="sheet in sheetsList" :key="sheet.qInfo.qId" class="sheet">
					<ul>
						<li class="sheet-item">
							<!-- {{sheetsData.some(dbSheet => dbSheet.qId === sheet.qInfo.qId)}} -->
							<a href="#" @click.prevent="toggleKpi(sheet.qInfo.qId)" class="link">{{ sheet.qMeta.title
							}}</a>
							<div class="button-container">
								<button v-if="!sheetsInDatabase.has(sheet.qInfo.qId)" @click="addSheetToMongoDB(sheet)"
									class="btn btn-primary">Add to Public page</button>
								<button v-else @click="removeSheetFromMongoDB(sheet)" class="btn btn-danger">Remove from
									Public page</button>
								<!-- <label class="switch" v-if="sheetsInDatabase.has(sheet.qInfo.qId)">
								<input type="checkbox" @change="toggleSheetActive(sheet)"
									v-if="sheetsData.some(dbSheet => dbSheet.qId === sheet.qInfo.qId)"
									checked="{{ sheetsData.active ? false : true }}">
								<span class="slider round"></span>
							</label> -->
							</div>
						</li>
					</ul>
					<div v-if="activeSheet === sheet.qInfo.qId" class="kpi">
						<qlik-embed ref="kpi" ui="analytics/sheet" :app-id="qlikAppId"
							:object-id="sheet.qMeta.id"></qlik-embed>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.sheet {
	border: 1px solid #ddd;
	padding: 10px;
	margin: 10px 0;
	border-radius: 5px;
}

.details {
	padding-left: 20px;
}

.kpi {
	height: 800px;
}

.link {
	padding: 5px 350px 5px 5px;
	border-radius: 5px;
}

ul {
	list-style: none;
	padding: 0 2px;
}

.sheet-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.button-container {
	display: flex;
	gap: 10px;
}

.btn {
	padding: 10px 20px;
	background-color: #007bff;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

.btn-primary {
	background-color: #007bff;
}

.btn-primary:hover {
	background-color: #0056b3;
}

.btn-danger {
	background-color: #df6e7a;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	margin-left: 10px;
}

.btn-danger:hover {
	background-color: #bf0a1c;
}

.activate-button {
	background-color: #4CAF50;
	/* Green */
	border: none;
	color: white;
	padding: 10px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	cursor: pointer;
	border-radius: 5px;
	transition: background-color 0.3s ease;
}

.activate-button:hover {
	background-color: #45a049;
}

.deactivate-button {
	background-color: #f44336;
	/* Red */
	border: none;
	color: white;
	padding: 10px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	cursor: pointer;
	border-radius: 5px;
	transition: background-color 0.3s ease;
}

.deactivate-button:hover {
	background-color: #e53935;
}

.switch {
	position: relative;
	display: inline-block;
	width: 60px;
	height: 34px;
}

.switch input {
	opacity: 0;
	width: 0;
	height: 0;
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	transition: .4s;
	border-radius: 34px;
}

.slider:before {
	position: absolute;
	content: "";
	height: 26px;
	width: 26px;
	left: 4px;
	bottom: 4px;
	background-color: white;
	transition: .4s;
	border-radius: 50%;
}

input:checked+.slider {
	background-color: #4CAF50;
}

input:checked+.slider:before {
	transform: translateX(26px);
}

.slider.round {
	border-radius: 34px;
}

.slider.round:before {
	border-radius: 50%;
}

.error {
	color: red;
	font-weight: bold;
}
</style>