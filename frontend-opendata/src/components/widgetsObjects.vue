<template>
        <h2>Objets par applications</h2>
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-else-if="loading" class="loading">Chargement...</div>
		<div v-else>

            <div v-for="app in applicationsData" :key="app.qId" class="application">
                <el-link @click.prevent="toggleSheets(app.qId)">
                    <font-awesome-icon :icon="activeSheet === app.qId ? 'chevron-down' : 'chevron-right'" />
                    &nbsp;{{ app.name }}
                </el-link>
				<div  v-if="activeSheet === app.qId">
					<div v-for="object in app.sheets" :key="object.qData.name" class="object">
						<ul>
							<li>
								<ul>
									<li class="cell-item btn">
										<h4>{{ object.qMeta.title }}</h4>
									</li>
									<li v-for="cell in object.qData.cells" :key="cell.name" class="cell-item">
                                        <Tippy interactive theme="custom-tooltip">
                                            <template #content>
                                                <div v-html="getTooltipContent(cell.name)"
                                                    style="width: 200px; height: 100px; padding: 10px;"></div>
                                            </template>
                                            <a href="#" class="link" @click.prevent="insertCellIntoQuill(cell.name)">
                                                {{ cell.type }} <span :class="`lui-icon lui-icon--${cell.type}`" aria-hidden="true"></span>
                                            </a>
                                        </Tippy>
									</li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	
</template>

<script setup>
import { ref, onMounted } from "vue";
import { loadQlikScript } from '@/utils/utils';
import { auth, apps, qix } from "@qlik/api";
import { Tippy } from 'vue-tippy';
import 'tippy.js/dist/tippy.css';

const props = defineProps({
	quillInstance: Object
});

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;
const qlikAppsId = import.meta.env.VITE_QLIK_APPS_ID.split(',');

const loadError = ref(null);
const activeObject = ref(null);
const objectsInDatabase = ref(new Set());
const applicationsInDatabase = ref(new Set());
const sheetsList = ref([]);
const objectsData = ref([]);
const applicationsData = ref([]);
const loading = ref(true);

const emit = defineEmits(['insert-cell']);

const formatCellType = (type) => {
    if (type === "barchart") return "bar-chart";
    if (type === "linechart") return "line-chart";
    if (type === "auto-chart") return "auto-layout";
    if (type === "piechart") return "pie-chart";
    if (type === "combochart") return "combo-chart";
    return type;
};

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

const toggleSheets = (sheetId) => {
	console.log('Toggling sheets:', sheetId);
	activeSheet.value = activeSheet.value === sheetId ? null : sheetId;
};

const toggleKpi = (objectId) => {
	activeObject.value = activeObject.value === objectId ? null : objectId;
};

const toggleObjects = (objectId) => {
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

const insertCellIntoQuill = (cellName) => {
	if (!props.quillInstance) {
		console.error('Quill instance is not initialized');
		return;
	}
	console.log('CellName:', cellName);
	console.log('QuillInstance:', props.quillInstance);
	const range = props.quillInstance.getSelection();
	console.log('Range:', range);
	if (range) {
		const embedHtml = `<qlik-embed ref="kpi" ui="analytics/chart" app-id="${qlikAppId}" object-id="${cellName}"></qlik-embed>`;
		props.quillInstance.clipboard.dangerouslyPasteHTML(range.index, embedHtml);
	}
};

const getTooltipContent = (cellName) => {
	return `<qlik-embed ref="kpi" ui="analytics/chart" app-id="${qlikAppId}" object-id="${cellName}"></qlik-embed>`;
};

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl);
	checkObjectInDatabase();
	fetchApplications();
});
</script>
<style scoped>
.header {
	margin: 20px;
}

.application {
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
    border: #ddd 1px solid;
}

.object {
    display: flex;
    flex-wrap: wrap;
    gap: 1px;
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
}

.cell-item {
    display: flex;
    flex-direction: column; /* Les éléments internes s'alignent verticalement */
    align-items: center;
    justify-content: center;
    background-color: #ddd;
    border-radius: 5px;
    margin: 5px;
    padding: 10px;
    width: 150px; /* Largeur fixe pour chaque boîte */
    height: 100px; /* Hauteur fixe pour chaque boîte */
    text-align: center;
}

.kpi {
	height: 800px;
}

.link-header {
	padding: 5px;
	border-radius: 5px;
	border: 1px solid #ddd;
	padding: 10px;
	margin-right: 2px;
}

.link {
	align-items: center;
	padding: 10px;
	border-radius: 5px;
}

.active-link {
	background-color: #007bff;
	color: white;
}

ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1px;
    list-style: none;
    padding: 0 2px;
    border: 1px solid #ddd;
    background-color: #ffffff;
}

.object-item {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
}

.cell-item {
    align-items: center;
    background-color: #ddd;
    border-radius: 5px;
    margin: 5px;
}

.tippy-box[data-theme~='custom-tooltip'] {
	max-width: 500px;
	height: 300px;
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