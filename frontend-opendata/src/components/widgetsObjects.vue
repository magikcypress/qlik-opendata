<template>
	<h2>Objets par applications</h2>
	<div v-if="loadError" class="error">{{ loadError }}</div>
	<div v-else-if="loading" class="loading">Chargement...</div>
	<div v-else>
		<div v-if="filteredApplications.length === 0" class="no-application">
			Aucune application correspondante trouvée.
		</div>
		<div v-for="app in filteredApplications" :key="app.qId" class="application">
			<el-link @click.prevent="toggleSheets(app.qId)">
				<font-awesome-icon :icon="activeSheet === app.qId ? 'chevron-down' : 'chevron-right'" />
				&nbsp;{{ app.name }}
			</el-link>
			<div v-if="activeSheet === app.qId">
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
											<div v-html="getTooltipContent(cell.name)" class="tooltip-content"></div>
										</template>
										<a href="#" class="link" @click.prevent="insertCellIntoQuill(cell.name)">
											{{ cell.type }}
											<span :class="`lui-icon lui-icon--${cell.type}`" aria-hidden="true"></span>
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
import { ref, onMounted, computed } from "vue";
import { loadQlikScript } from '@/utils/utils';
import { auth, qix } from "@qlik/api";
import { Tippy } from 'vue-tippy';
import 'tippy.js/dist/tippy.css';

// Props
const props = defineProps({
	quillInstance: Object,
	application: String
});

const emits = defineEmits(["insert-cell"]);

// Reactive variables
const loadError = ref(null);
const loading = ref(true);
const activeSheet = ref(null);
const applicationsData = ref([]);

const filteredApplications = computed(() =>
	applicationsData.value.filter(app => app.name === props.application)
);

console.log(filteredApplications);

// Methods
const toggleSheets = (sheetId) => {
	activeSheet.value = activeSheet.value === sheetId ? null : sheetId;
};

const insertCellIntoQuill = (cellName) => {
	if (!props.quillInstance) {
		console.error("Quill instance is not initialized");
		return;
	}
	emits("insert-cell", cellName); // Émet l'événement avec le nom de la cellule
};

const getTooltipContent = (cellName) => {
	return `<qlik-embed ref="kpi" ui="analytics/chart" app-id="${props.application}" object-id="${cellName}"></qlik-embed>`;
};

const fetchApplications = async () => {
	try {
		auth.setDefaultHostConfig({
			host: import.meta.env.VITE_QLIK_TENANT_URL,
			authType: "Oauth2",
			clientId: import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID,
			redirectUri: import.meta.env.VITE_QLIK_REDIRECT_URI,
			accessTokenStorage: "session",
			autoRedirect: true,
		});

		// Fetch applications from the backend
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/applications`);
		if (!response.ok) throw new Error('Failed to fetch applications');
		applicationsData.value = await response.json();
	} catch (error) {
		loadError.value = error.message;
	} finally {
		loading.value = false;
	}
};

// Lifecycle hooks
onMounted(() => {
	loadQlikScript(import.meta.env.VITE_QLIK_TENANT_URL, import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID, import.meta.env.VITE_QLIK_REDIRECT_URI);
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
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #ddd;
	border-radius: 5px;
	margin: 5px;
	padding: 10px;
	width: 150px;
	height: 100px;
	text-align: center;
}

.tooltip-content {
	width: 200px;
	height: 100px;
	padding: 10px;
}

.no-application {
	color: #ff0000;
	margin: 10px 0;
	border-bottom: #ddd 1px solid;
}
</style>