<template>
	<Menu />
	<div class="wrapper">
		<h2>Dimensions</h2>
		<div v-if="loadError" class="error">
			{{ loadError }}
		</div>
		<div v-else-if="jsonError" class="error">
			{{ jsonError }}
		</div>
		<div v-else>
			<qlik-embed ui="analytics/selections" :app-id="qlikAppId" />
			<div v-for="dimension in qlikData" :key="dimension.qInfo.qId" class="dimension">
				<ul>
					<li>
						<el-link href="#" @click.prevent="toggleKpi(dimension.qMeta.id)">
							<font-awesome-icon :icon="activeDimension === dimension.qMeta.id
								? 'chevron-down'
								: 'chevron-right'
								" />
							&nbsp;
							{{ dimension.qMeta.title }}
						</el-link>
					</li>
				</ul>
				<div v-if="activeDimension === dimension.qMeta.id" class="kpi">
					<qlik-embed ui="analytics/field" :app-id="qlikAppId" :library-id="dimension.qMeta.id"
						type="dimension" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useJsonRepair } from '@/composables/useJsonRepair'
import { loadQlikScript, fetchJsonData } from '@/utils/utils'
import Menu from '@/views/menuNav.vue'

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID

const { jsonData, error, validateAndRepairJSON } = useJsonRepair()
const qlikData = ref([])
const loadError = ref(null)
const jsonError = ref(null)
const activeDimension = ref(null)

const toggleKpi = dimensionId => {
	activeDimension.value =
		activeDimension.value === dimensionId ? null : dimensionId
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

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl)
	checkDimensionsInDatabase()

	// Fetch JSON data from the local file
	fetch(`${import.meta.env.VITE_BACKEND_URI}/data/dimensions.json`)
		.then(response => response.text()) // Ensure the response is treated as text
		.then(data => {
			console.log('data:', data)
			if (validateAndRepairJSON(data)) {
				console.log('jsonData:', data)
				qlikData.value = jsonData.value
				jsonError.value = null
			} else {
				jsonError.value = error.value
			}
		})
		.catch(err => {
			console.error('Error loading JSON file:', err)
			loadError.value = 'Error loading JSON file'
		})
})
</script>

<style scoped>
.wrapper {
	margin: 10px;
}

.dimension {
	border: 1px solid #ddd;
	padding: 5px;
	margin: 8px 0;
	border-radius: 5px;
}

ul {
	list-style: none;
	padding: 0 2px;
}

.kpi {
	height: 800px;
}

.error {
	color: red;
	font-weight: bold;
}
</style>
