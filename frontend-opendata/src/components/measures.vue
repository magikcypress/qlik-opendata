<script setup>
import { ref, onMounted } from "vue";
import { useJsonRepair } from "@/composables/useJsonRepair";

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;

// Créer le script et définir les attributs
const loadQlikScript = () => {
	if (!document.querySelector('script[src="https://cdn.jsdelivr.net/npm/@qlik/embed-web-components"]')) {
		const script = document.createElement('script');
		script.crossOrigin = 'anonymous';
		script.type = 'application/javascript';
		script.src = 'https://cdn.jsdelivr.net/npm/@qlik/embed-web-components';
		script.setAttribute('data-host', tenantUrl);
		script.setAttribute('data-client-id', qlikClientId);
		script.setAttribute('data-redirect-uri', redirectUrl);
		script.setAttribute('data-access-token-storage', 'session');
		script.setAttribute('data-cross-site-cookies', 'true');
		script.setAttribute('data-auto-redirect', 'true');

		// Ajouter le script au document
		document.body.appendChild(script);
	}
};

const { jsonData, error, validateAndRepairJSON } = useJsonRepair();
const qlikData = ref([]);
const loadError = ref(null);
const jsonError = ref(null);
const activeMeasure = ref(null);

const toggleKpi = (measureId) => {
	activeMeasure.value = activeMeasure.value === measureId ? null : measureId;
};

onMounted(() => {
	loadQlikScript();

	// Fetch JSON data from the local file
	fetch(`${import.meta.env.VITE_BACKEND_URI}/data/measures.json`)
		.then(response => response.text()) // Ensure the response is treated as text
		.then(data => {
			validateAndRepairJSON(data);
			qlikData.value = jsonData.value;
			jsonError.value = null;
		})
		.catch(error => {
			console.error('Error loading JSON file:', error);
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
				<div v-if="activeMeasure === measure.qMeta.id" class="kpi">
					<qlik-embed ui="analytics/chart" :app-id="qlikAppId" type="kpi"
						:measures='`["${measure.qMeta.title}"]`'></qlik-embed>

				</div>
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