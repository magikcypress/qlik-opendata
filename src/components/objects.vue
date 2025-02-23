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
const activeObject = ref(null);

const toggleKpi = (objectId) => {
	activeObject.value = activeObject.value === objectId ? null : objectId;
};

onMounted(() => {
	loadQlikScript();

	// Fetch JSON data from the local file
	fetch('../../data/objects.json')
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
		<h2>Objects</h2>
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-else-if="jsonError" class="error">{{ jsonError }}</div>
		<div v-else>
			<qlik-embed ui="analytics/selections" :app-id="qlikAppId"></qlik-embed>
			<div v-for="object in qlikData" class="object">
				<ul>
					<li><a href="#" @click.prevent="toggleKpi(object.name)">{{ object.name }}</a> ({{ object.type }})
					</li>
				</ul>
				<div v-if="activeObject === object.name" class="kpi">
					<qlik-embed ref="kpi" ui="analytics/chart" :app-id="qlikAppId"
						:object-id="object.name"></qlik-embed>
				</div>
			</div>
		</div>
	</div>
</template>

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