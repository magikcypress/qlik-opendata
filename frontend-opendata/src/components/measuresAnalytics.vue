<template>
<div class="container">
	<menuVertical class="menu" />
	<div class="wrapper">
		<h2>Mesures</h2>
		<div v-if="loadError" class="error">
			{{ loadError }}
		</div>
		<div v-else-if="jsonError" class="error">
			{{ jsonError }}
		</div>
		<div v-else>
			<!--qlik-embed ui="analytics/selections" :app-id="qlikAppsId" /-->
			<div v-for="app in applicationsMeasures" :key="app.qId" class="dimension">
				<ul>
					<li>
						<el-link href="#" @click.prevent="toggleKpi(app.qId)">
							<font-awesome-icon :icon="activeApplication === app.qId
								? 'chevron-down'
								: 'chevron-right'
								" />
							&nbsp;
							{{ app.name }}
						</el-link>
					</li>
				</ul>
				<div v-if="activeApplication === app.qId">
					{{ applicationsMeasures.qMeta}}
					<div v-for="measure in applicationsMeasures" :key="measure.qId">
						<div v-if="app.qId === measure.qId" v-for="mea in measure.dimensions" :key="measure.qId" class="dimension">
							{{ mea.qData.title }}
							<button class="btn-copy" @click="handleCopy(mea.qInfo.qId, $event)">
								<font-awesome-icon icon="clipboard" aria-hidden="true" title="Copier ID de la feuille" />
							</button>
							<!-- <qlik-embed
								ui="analytics/field"
								:app-id="app.qId"
								:library-id="mea.qInfo.qId"
								type="measure"
							></qlik-embed> -->
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useJsonRepair } from '@/composables/useJsonRepair'
import { loadQlikScript, copyToClipboard } from '@/utils/utils'
import menuVertical from '@/views/menuVertical.vue'
import { auth, qix } from '@qlik/api'

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI
const qlikAppsId = import.meta.env.VITE_QLIK_APPS_ID.split(',')

const loadError = ref(null)
const jsonError = ref(null)
const activeApplication = ref(null)
const loading = ref(true)
const applicationsMeasures = ref([])

const toggleKpi = appId => {
	activeApplication.value =
		activeApplication.value === appId ? null : appId
}

const fetchApplicationsAndMeasures = async () => {
	try {
		auth.setDefaultHostConfig({
			host: tenantUrl,
			authType: 'Oauth2',
			clientId: qlikClientId,
			redirectUri: redirectUrl,
			accessTokenStorage: 'session',
			autoRedirect: true,
		})

		const fetchedMeasures = []
		for (const appId of qlikAppsId) {
			console.log('appId:', appId)
			const session = qix.openAppSession({ appId })
			const QlikApp = await session.getDoc()
			const appLayout = await QlikApp.getAppLayout()
			console.log('appLayout:', appLayout)
			const measuresListResponse = await QlikApp.getMeasureList()
			console.log('measuresListResponse:', measuresListResponse)

			if (Array.isArray(measuresListResponse)) {
				fetchedMeasures.push({
					qId: appId,
					name: appLayout.qTitle,
					dimensions: measuresListResponse,
				})
				console.log('fetchedMeasures:', fetchedMeasures)
			} else {
				throw new Error('Invalid measure applciations')
			}
		}
		applicationsMeasures.value = fetchedMeasures
	} catch (error) {
		loadError.value = error.message
	} finally {
		loading.value = false
	}
}

const checkMeasuresInDatabase = async () => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/measures`,
		)
		if (!response.ok) {
			throw new Error('Failed to fetch measures from database')
		}
		const data = await response.json()
		console.log('Measures in database:', data)
		data.forEach(dimension => {
			dimensionInDatabase.value.add(dimension.qId)
		})
	} catch (error) {
		console.error('Error fetching measures from database:', error)
	}
}

const handleCopy = (text, event) => {
    const targetElement = event.target.parentElement;
    copyToClipboard(text, targetElement);
};

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl)
	checkMeasuresInDatabase()
	fetchApplicationsAndMeasures()

	// Fetch JSON data from the local file
	// fetch(`${import.meta.env.VITE_BACKEND_URI}/data/dimensions.json`)
	// 	.then(response => response.text()) // Ensure the response is treated as text
	// 	.then(data => {
	// 		console.log('data:', data)
	// 		if (validateAndRepairJSON(data)) {
	// 			console.log('jsonData:', data)
	// 			qlikData.value = jsonData.value
	// 			jsonError.value = null
	// 		} else {
	// 			jsonError.value = error.value
	// 		}
	// 	})
	// 	.catch(err => {
	// 		console.error('Error loading JSON file:', err)
	// 		loadError.value = 'Error loading JSON file'
	// 	})
})
</script>

<style scoped>
.container {
    display: flex;
}

.menu {
    width: 20%;
    background-color: #f4f4f4;
    padding: 10px;
    border-right: 1px solid #ddd;
}

.wrapper {
    flex: 1;
    padding: 20px;
}

.dimension {
	border: 1px solid #ddd;
	padding: 5px;
	margin: 8px 0;
	border-radius: 5px;
	background-color: #f9f9f9;
}

.selection {
	height: 400px;
	display: block;
	overflow: auto;
}

ul {
	list-style: none;
	padding: 0 2px;
}

.btn-copy {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
}

.btn-copy:hover {
    background-color: #0056b3;
}

.error {
	color: red;
	font-weight: bold;
}
</style>
