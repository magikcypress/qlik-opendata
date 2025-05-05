<template>
	<h2>Objets par applications</h2>
	<div v-if="loadError" class="error">
		{{ loadError }}
	</div>
	<div v-else-if="loading" class="loading">
		Chargement...
	</div>
	<div v-else>
		<div v-if="filteredApplications.length === 0" class="no-application">
			Aucune application correspondante trouvée. Veuillez vérifier que
			vous avez bien choisi une application dans la liste déroulante.
		</div>
		<div v-for="app in filteredApplications" :key="app.qId" class="application">
			<el-link @click.prevent="toggleSheets(app.qId)">
				<font-awesome-icon :icon="activeSheet === app.qId
					? 'chevron-down'
					: 'chevron-right'
					" />
				&nbsp;{{ app.name }}
			</el-link>
			<div v-if="activeSheet === app.qId">
				<div v-if="Array.isArray(app.sheets) && app.sheets.length > 0">
					<div v-for="sheet in app.sheets" :key="sheet.qData.name" class="object">
						<ul>
							<li>
								<ul>
									<li class="cell-item btn">
										<h4>{{ sheet.qMeta.title }}</h4>
									</li>
									<li v-for="cell in sheet.qData.cells" :key="cell.name" class="cell-item">
										<Tippy interactive theme="custom-tooltip">
											<template #content>
												<div class="tooltip-content" v-html="getTooltipContent(
													cell.name,
												)
													" />
											</template>
											<a href="#" class="link" @click.prevent="
												insertCellIntoQuill(
													cell.name,
												)
												">
												{{ cell.type }}
												<span :class="`lui-icon lui-icon--${cell.type}`" aria-hidden="true" />
											</a>
										</Tippy>
									</li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
				<div v-else>
					<p class="no-application">Aucune application correspondante trouvée.<br /> Veuillez vérifier que
						vous avez bien choisi une application dans la liste déroulante.</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { loadQlikScriptAnon } from '@/utils/utils'
import { auth } from '@qlik/api'
import { Tippy } from 'vue-tippy'
import 'tippy.js/dist/tippy.css'

// Props
const props = defineProps({
	quillInstance: Object,
	application: String,
})

// Emits
const emits = defineEmits(['insert-cell'])

// Reactive variables
const loadError = ref(null)
const loading = ref(true)
const activeSheet = ref(null)
const applicationsData = ref([])

// Environnement Variables
const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_ANON_CLIENT_ID
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI

// Computed property to filter applications
const filteredApplications = computed(() =>
	applicationsData.value.filter(app => app.name === props.application),
)

// Methods
const toggleSheets = sheetId => {
	activeSheet.value = activeSheet.value === sheetId ? null : sheetId
}

const insertCellIntoQuill = cellName => {
	if (!props.quillInstance) {
		console.error('Quill instance is not initialized')
		return
	}
	emits('insert-cell', cellName) // Emit the event with the cell name
}

const getTooltipContent = cellName => {
	return `<qlik-embed ref="kpi" ui="analytics/chart" app-id="${props.application}" object-id="${cellName}"></qlik-embed>`
}

const fetchApplications = async () => {
	try {
		auth.setDefaultHostConfig({
			host: tenantUrl,
			authType: 'Oauth2',
			clientId: qlikClientId,
			redirectUri: redirectUrl,
			accessTokenStorage: 'session',
			autoRedirect: true,
		})

		// Fetch applications from the backend
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/applications`,
		)
		if (!response.ok) throw new Error('Failed to fetch applications')
		const data = await response.json()

		// Ensure each application has a `sheets` property
		applicationsData.value = data.map(app => ({
			...app,
			sheets: app.sheets || [],
		}))
		console.log(applicationsData.value)
	} catch (error) {
		loadError.value = error.message
	} finally {
		loading.value = false
	}
}

// Lifecycle hooks
onMounted(() => {
	console.log(applicationsData)
	loadQlikScriptAnon(tenantUrl, qlikClientId, applicationsData.value.eac)
	fetchApplications()
})
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
