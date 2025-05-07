<template>
<div class="container">
	<menuVertical class="menu" />
	<div class="wrapper">
		<h2>Dimensions</h2>
		<div v-if="loadError" class="error">
			{{ loadError }}
		</div>
		<div v-else-if="jsonError" class="error">
			{{ jsonError }}
		</div>
		<div v-else>							
			<!--qlik-embed ui="analytics/selections" :app-id="qlikAppsId" /-->
			<div v-for="app in applicationsDimensions" :key="app.qId" class="dimension">
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
				<div v-if="activeApplication === app.qId" class="kpi">
					<div v-for="dimension in applicationsDimensions" :key="dimension.qId">
						<div v-if="app.qId === dimension.qId" v-for="dim in dimension.dimensions" :key="dimension.qId" class="dimension selection">
							{{ dim.qData.title }}
							<button class="btn-copy" @click="handleCopy(dim.qInfo.qId, $event)">
								<font-awesome-icon icon="clipboard" aria-hidden="true" title="Copier ID de la feuille" />
							</button>
							<qlik-embed
								ui="analytics/field"
								:app-id="app.qId"
								:library-id="dim.qInfo.qId"
								type="dimension"
							></qlik-embed>
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
const applicationsDimensions = ref([])

const toggleKpi = appId => {
	activeApplication.value =
		activeApplication.value === appId ? null : appId
}

const fetchApplicationsAndDimensions = async () => {
	try {
		auth.setDefaultHostConfig({
			host: tenantUrl,
			authType: 'Oauth2',
			clientId: qlikClientId,
			redirectUri: redirectUrl,
			accessTokenStorage: 'session',
			autoRedirect: true,
		})

		const fetchedDimensions = []
		for (const appId of qlikAppsId) {
			console.log('appId:', appId)
			const session = qix.openAppSession({ appId })
			const QlikApp = await session.getDoc()
			const appLayout = await QlikApp.getAppLayout()
			const dimensionsListResponse = await QlikApp.getDimensionList()

			if (Array.isArray(dimensionsListResponse)) {
				fetchedDimensions.push({
					qId: appId,
					name: appLayout.qTitle,
					dimensions: dimensionsListResponse,
				})
			} else {
				throw new Error('Invalid dimensions applciations')
			}
		}
		applicationsDimensions.value = fetchedDimensions
	} catch (error) {
		loadError.value = error.message
	} finally {
		loading.value = false
	}
}

const checkDimensionsInDatabase = async () => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/dimensions`,
		)
		if (!response.ok) {
			throw new Error('Failed to fetch dimensions from database')
		}
		const data = await response.json()
		console.log('Dimensions in database:', data)
		data.forEach(dimension => {
			dimensionInDatabase.value.add(dimension.qId)
		})
	} catch (error) {
		console.error('Error fetching objects from database:', error)
	}
}

const handleCopy = (text, event) => {
    const targetElement = event.target.parentElement;
    copyToClipboard(text, targetElement);
};

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl)
	checkDimensionsInDatabase()
	fetchApplicationsAndDimensions()

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
