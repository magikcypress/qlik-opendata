<template>
<div class="container">
	<menuVertical class="menu" />
	<div class="wrapper">
		<h2>Objets par applications</h2>
		<div v-if="loadError" class="error">
			{{ loadError }}
		</div>
		<div v-else-if="loading" class="loading">
			Chargement...
		</div>
		<div v-else>
			<div v-for="app in applicationsData" :key="app.qId" class="application">
				
				<el-link @click.prevent="toggleSheets(app.qId)">
					<font-awesome-icon :icon="activeSheet === app.qId
						? 'chevron-down'
						: 'chevron-right'
						" />
					&nbsp;{{ app.name }}
				</el-link>
				<div v-if="activeSheet === app.qId">
					<qlik-embed ui="analytics/selections" :app-id="app.qId" />
					<div v-for="object in app.sheets" :key="object.qData.name" class="object">
						<ul>
							<li>
								<ul>
									<li>
										<h4>{{ object.qMeta.title }}</h4>
									</li>
									<li v-for="cell in object.qData.cells" :key="cell.name">
										<div class="object-item">
											<el-link href="#" class="link" @click.prevent="
												toggleKpi(cell.name)
												">
												{{ formatCellType(cell.type) }} &nbsp;
												<span :class="`lui-icon lui-icon--${formatCellType(cell.type)}`"
													aria-hidden="true" />
											</el-link>

											<div class="button-container">
												<button class="btn-copy" @click="handleCopy(cell.name, $event)">
													<font-awesome-icon icon="clipboard" aria-hidden="true" title="Copier ID de la feuille" />
												</button>
												<button v-if="
													!objectsInDatabase.has(
														cell.name,
													)
												" class="btn btn-primary" @click="
													addObjectToMongoDB(cell)
													">
													Ajouter sur la page
													publique
												</button>
												<button v-else class="btn btn-danger" @click="
													removeObjectFromMongoDB(
														cell,
													)
													">
													Supprimer de la page
													publique
												</button>
											</div>
										</div>
										<div v-if="activeObject === cell.name" class="kpi">
											<qlik-embed ref="kpi" ui="analytics/chart" :app-id="app.qId"
												:object-id="cell.name" />
										</div>
									</li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadQlikScript, copyToClipboard } from '@/utils/utils'
import { auth, apps, qix } from '@qlik/api'
import menuVertical from '@/views/menuVertical.vue'

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID
const qlikAppsId = import.meta.env.VITE_QLIK_APPS_ID.split(',')

const loadError = ref(null)
const jsonError = ref(null)
const activeSheet = ref(null)
const activeObject = ref(null)
const objectsInDatabase = ref(new Set())
const applicationsInDatabase = ref(new Set())
const sheetsList = ref([])
const objectsData = ref([])
const applicationsData = ref([])
const loading = ref(true)

const formatCellType = type => {
	if (type === 'barchart') return 'bar-chart'
	if (type === 'linechart') return 'line-chart'
	if (type === 'auto-chart') return 'auto-layout'
	if (type === 'piechart') return 'pie-chart'
	if (type === 'combochart') return 'combo-chart'
	return type
}

const checkObjectsApplications = async app => {
	try {
		auth.setDefaultHostConfig({
			host: tenantUrl,
			authType: 'Oauth2',
			clientId: qlikClientId,
			redirectUri: redirectUrl,
			accessTokenStorage: 'session',
			autoRedirect: true,
		})

		const session = qix.openAppSession({ appId: app })
		const QlikApp = await session.getDoc()
		const sheetsListResponse = await QlikApp.getSheetList()

		if (Array.isArray(sheetsListResponse)) {
			sheetsList.value = sheetsListResponse
		} else {
			throw new Error('Invalid sheets list format')
		}

		const fetchedApplications = []
		for (const appId of qlikAppsId) {
			const session = qix.openAppSession({ appId })
			const QlikApp = await session.getDoc()
			const appLayout = await QlikApp.getAppLayout()
			const sheetsListResponse = await QlikApp.getSheetList()

			if (Array.isArray(sheetsListResponse)) {
				fetchedApplications.push({
					qId: appId,
					name: appLayout.qTitle,
					sheets: sheetsListResponse,
				})
			} else {
				throw new Error('Invalid sheets list format')
			}
		}
		applicationsData.value = fetchedApplications
	} catch (error) {
		console.error('Error fetching objects from qlik:', error)
	}
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

		for (const appId of qlikAppsId) {
			await checkApplicationInDatabase(appId)
		}
	} catch (error) {
		loadError.value = error.message
	} finally {
		loading.value = false
	}
}

const toggleSheets = sheetId => {
	console.log('Toggling sheets:', sheetId)
	activeSheet.value = activeSheet.value === sheetId ? null : sheetId
}

const toggleKpi = objectId => {
	activeObject.value = activeObject.value === objectId ? null : objectId
}

const checkApplicationInDatabase = async app => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/applications`,
		)
		if (!response.ok) {
			throw new Error('Failed to fetch applications from database')
		}
		const data = await response.json()

		applicationsData.value = data
		data.forEach(application => {
			applicationsInDatabase.value.add(application.qId)
			checkObjectsApplications(application.qId)
		})
	} catch (error) {
		console.error('Error fetching applications from database:', error)
	}
}

const addObjectToMongoDB = async object => {
	console.log('Adding object to MongoDB:', object)
	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/objects`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					qId: object.name,
					name: object.name,
					type: object.type,
					col: object.col,
					row: object.row,
					colspan: object.colspan,
					rowspan: object.rowspan,
					bounds: object.bounds,
					active: true,
				}),
			},
		)

		if (!response.ok) {
			throw new Error('Failed to add object to MongoDB')
		}
		alert('Object added to MongoDB successfully')
		objectsInDatabase.value.add(object.name) // Add to the set of objects in the database
	} catch (error) {
		console.error('Error adding object to MongoDB:', error)
		alert('Error adding object to MongoDB')
	}
}

const removeObjectFromMongoDB = async object => {
	try {
		console.log('Removing object from MongoDB:', object)
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/objects/${object.name}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
		console.log('response:', response)
		if (!response.ok) {
			throw new Error('Failed to remove object from MongoDB')
		}
		alert('Object removed from MongoDB successfully')
		objectsInDatabase.value.delete(object.name) // Remove from the set of objects in the database
	} catch (error) {
		console.error('Error removing object from MongoDB:', error)
		alert('Error removing object from MongoDB')
	}
}

const toggleObjectActive = async object => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/objects/${object.qInfo.qId}/active`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
		if (!response.ok) {
			throw new Error('Failed to toggle object active state')
		}
		const updatedObject = await response.json()
		object.active = updatedObject.active
	} catch (error) {
		console.error('Error toggling object active state:', error)
		alert('Error toggling object active state')
	}
}

const checkObjectInDatabase = async () => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/objects`,
		)
		if (!response.ok) {
			throw new Error('Failed to fetch objects from database')
		}
		const data = await response.json()
		objectsData.value = data
		data.forEach(object => {
			objectsInDatabase.value.add(object.name)
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
	checkObjectInDatabase()
	fetchApplications()
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

.application {
	padding: 10px;
	margin: 10px 0;
	border: 1px solid #ddd;
	border-radius: 5px;
	background-color: #f9f9f9;
}

.object {
	padding: 10px;
	margin: 10px 0;
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

.object-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px;
	border-radius: 5px;
	border: 1px solid #ddd;
	margin-bottom: 10px;
}

.button-container {
	display: flex;
	gap: 10px;
}

.loading {
	text-align: center;
	font-size: 1.2em;
	color: #666;
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

.activate-button {
	background-color: #4caf50;
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
	transition: 0.4s;
	border-radius: 34px;
}

.slider:before {
	position: absolute;
	content: '';
	height: 26px;
	width: 26px;
	left: 4px;
	bottom: 4px;
	background-color: white;
	transition: 0.4s;
	border-radius: 50%;
}

input:checked+.slider {
	background-color: #4caf50;
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
