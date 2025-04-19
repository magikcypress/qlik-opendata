<template>
	<Menu />
	<div class="wrapper">
		<h2>Applications et Feuilles</h2>
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-else-if="loading" class="loading">Chargement...</div>
		<div v-else>
			<qlik-embed ui="analytics/selections" :app-id="qlikAppId"></qlik-embed>
			<div v-for="app in applicationsData" :key="app.qId" class="application">
				<h3>{{ app.name }}</h3>
				<div v-for="sheet in app.sheets" :key="sheet.qInfo.qId" class="sheet">
					<ul>
						<li class="sheet-item">
							<el-link @click.prevent="toggleKpi(sheet.qInfo.qId)">
								<font-awesome-icon
									:icon="activeSheet === sheet.qInfo.qId ? 'chevron-down' : 'chevron-right'" />
								&nbsp;{{ sheet.qMeta.title }}</el-link>
							<div class="button-container">
								<button v-if="!sheetsInDatabase.has(sheet.qInfo.qId)" @click="addSheetToMongoDB(sheet)"
									class="btn btn-primary">Ajouter sur la page publique</button>
								<button v-else @click="removeSheetFromMongoDB(sheet)" class="btn btn-danger">Supprimer
									de la
									page publique</button>
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

<script setup>
import { ref, onMounted } from "vue";
import { loadQlikScript } from '@/utils/utils';
import { auth, qix } from "@qlik/api";
import Menu from "@/views/Menu.vue";

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;
const qlikAppsId = import.meta.env.VITE_QLIK_APPS_ID.split(',');

const loadError = ref(null);
const activeSheet = ref(null);
const sheetsInDatabase = ref(new Set());
const applicationsData = ref([]);
const loading = ref(true);

const fetchApplicationsAndSheets = async () => {
	try {
		auth.setDefaultHostConfig({
			host: tenantUrl,
			authType: "Oauth2",
			clientId: qlikClientId,
			redirectUri: redirectUrl,
			accessTokenStorage: "session",
			autoRedirect: true,
		});

		const fetchedApplications = [];
		for (const appId of qlikAppsId) {
			const session = qix.openAppSession({ appId });
			const QlikApp = await session.getDoc();
			const appLayout = await QlikApp.getAppLayout();
			const sheetsListResponse = await QlikApp.getSheetList();

			if (Array.isArray(sheetsListResponse)) {
				fetchedApplications.push({
					qId: appId,
					name: appLayout.qTitle,
					sheets: sheetsListResponse
				});
			} else {
				throw new Error('Invalid sheets list format');
			}
		}
		applicationsData.value = fetchedApplications;

	} catch (error) {
		loadError.value = error.message;
	} finally {
		loading.value = false;
	}
};

const toggleKpi = (sheetId) => {
	activeSheet.value = activeSheet.value === sheetId ? null : sheetId;
};

const addSheetToMongoDB = async (sheet) => {
	try {
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
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/sheets/${sheet.qInfo.qId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
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

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl);
	fetchApplicationsAndSheets();
});
</script>

<style scoped>
.wrapper {
	margin: 10px;
}

.application {
	margin-top: 20px;
	margin-bottom: 20px;
}

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

ul {
	list-style: none;
	padding: 0 2px;
}

.sheet-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.loading {
	text-align: center;
	font-size: 1.2em;
	color: #666;
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

.error {
	color: red;
	font-weight: bold;
}
</style>