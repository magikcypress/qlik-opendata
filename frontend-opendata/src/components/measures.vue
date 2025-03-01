<script setup>
import { ref, onMounted } from "vue";
import { useJsonRepair } from "@/composables/useJsonRepair";
import { loadQlikScript } from '@/utils/utils';

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;

const { jsonData, error, validateAndRepairJSON } = useJsonRepair();
const qlikData = ref([]);
const loadError = ref(null);
const jsonError = ref(null);
const activeMeasure = ref(null);

const toggleKpi = (measureId) => {
	activeMeasure.value = activeMeasure.value === measureId ? null : measureId;
};

const checkMeasuresInDatabase = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/measures`);
		if (!response.ok) {
			throw new Error('Failed to fetch measures from database');
		}
		const data = await response.json();
		console.log('Measures in database:', data);
		data.forEach(measure => {
			measureInDatabase.value.add(measure.qId);
		});
	} catch (error) {
		console.error('Error fetching objects from database:', error);
	}
};

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl);
	checkMeasuresInDatabase();

	// Fetch JSON data from the local file
	fetch(`${import.meta.env.VITE_BACKEND_URI}/data/measures.json`)
		.then(response => response.text()) // Ensure the response is treated as text
		.then(data => {
			console.log('data:', data);
			if (validateAndRepairJSON(data)) {
				console.log('jsonData:', data);
				qlikData.value = jsonData.value;
				jsonError.value = null;
			} else {
				jsonError.value = error.value;
			}
		})
		.catch(err => {
			console.error('Error loading JSON file:', err);
			loadError.value = 'Error loading JSON file';
		});
});
</script>


<template>
	<div>
		<h2>Measures</h2>
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-else-if="jsonError" class="error">{{ jsonError }}</div>
		<div v-else>
			<qlik-embed ui="analytics/selections" :app-id="qlikAppId"></qlik-embed>
			<div v-for="measure in qlikData" :key="measure.qMeta.id" class="measure">
				<ul>
					<li><a href="#" @click.prevent="toggleKpi(measure.qMeta.id)">{{
						measure.qMeta.title }}</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style scoped>
.measure {
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