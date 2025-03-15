<template>
	<div>
		<h2>Objects</h2>
		<div v-for="object in sheetsList" :key="object.qData.name" class="object">
			<h2>{{ object.qMeta.title }}</h2>
			<ul class="object-list">
				<li v-for="cell in object.qData.cells" :key="cell.name" class="cell-item">
					<div class="object-item">
						<a href="#" class="link" @click.prevent="insertCell(cell.name)" ref="tooltip"
							:data-tippy-content="getTooltipContent(cell.name)">
							{{ cell.type }}</a>
						<span class="lui-icon lui-icon--filterpane" aria-hidden="true"></span>
						<!--div class="button-container">
							<qlik-embed ref="kpi" ui="analytics/chart" :app-id="qlikAppId"
								:object-id="cell.name"></qlik-embed>
						</div-->
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { loadQlikScript } from '@/utils/utils';
import { auth, apps, qix } from "@qlik/api";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;
const qlikAppsId = import.meta.env.VITE_QLIK_APPS_ID.split(',');

const loadError = ref(null);
const jsonError = ref(null);
const activeObject = ref(null);
const objectsInDatabase = ref(new Set());
const applicationsInDatabase = ref(new Set());
const sheetsList = ref([]);
const objectsData = ref([]);
const applicationsData = ref([]);
const loading = ref(true);

const emit = defineEmits(['insert-cell']);

const checkObjectsApplications = async (app) => {
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
		const sheetsListResponse = await QlikApp.getSheetList();

		if (Array.isArray(sheetsListResponse)) {
			sheetsList.value = sheetsListResponse;
		} else {
			throw new Error('Invalid sheets list format');
		}

	} catch (error) {
		console.error('Error fetching objects from qlik:', error);
	}
};

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

		for (const appId of qlikAppsId) {
			console.log('AppId:', appId);
			await checkApplicationInDatabase(appId);
		}

	} catch (error) {
		loadError.value = error.message;
	} finally {
		loading.value = false;
	}
};

const toggleKpi = (objectId) => {
	activeObject.value = activeObject.value === objectId ? null : objectId;
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
			checkObjectsApplications(application.qId);
		});

	} catch (error) {
		console.error('Error fetching applications from database:', error);
	}
};

const checkObjectInDatabase = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/objects`);
		if (!response.ok) {
			throw new Error('Failed to fetch objects from database');
		}
		const data = await response.json();
		objectsData.value = data;
		data.forEach(object => {
			objectsInDatabase.value.add(object.name);
		});
	} catch (error) {
		console.error('Error fetching objects from database:', error);
	}
};

const insertCell = (cellName) => {
	emit('insert-cell', cellName);
};

const getTooltipContent = (cellName) => {
	return `<qlik-embed ref="kpi" ui="analytics/chart" app-id="${qlikAppId}" object-id="${cellName}"></qlik-embed>`;
};

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl);
	checkObjectInDatabase();
	fetchApplications();

	nextTick(() => {
		tippy('[ref="tooltip"]', {
			allowHTML: true,
			interactive: true,
			appendTo: document.body,
		});
	});
});

</script>

<style scoped>
.object {
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
	border-radius: 5px;
}

ul {
	display: flex;
	flex-wrap: wrap;
	/* Permet de passer à la ligne si besoin */
	gap: 1px;
	/* Espacement entre les rectangles */

	list-style: none;
	padding: 0 2px;
}

.object-item {
	padding: 10px;
	border-radius: 5px;
	border: 1px solid #ddd;
	margin-bottom: 10px;
}

.cell-item {
	align-items: center;
	padding: 10px;
}

.button-container {
	display: none;
}

.btn {
	padding: 10px 20px;
	background-color: #007bff;
	color: white;
}
</style>