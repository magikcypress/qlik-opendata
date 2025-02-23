<script setup>
import { ref, onMounted } from "vue";
import { useJsonRepair } from "@/composables/useJsonRepair";

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;

// Créer le script et définir les attributs
const loadQlikScript = () => {
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
};

const { jsonData, error, validateAndRepairJSON } = useJsonRepair();
const qlikData = ref([]);

onMounted(() => {
	loadQlikScript();

	// Fetch JSON data from the local file
	fetch('../../data/measures.json')
		.then(response => response.text()) // Ensure the response is treated as text
		.then(data => {
			validateAndRepairJSON(data);
			qlikData.value = jsonData.value;
		})
		.catch(error => {
			console.error('Error loading JSON file:', error);
		});
});
</script>


<template>
	<div>
		<h2>Measures</h2>
		<div v-for="measure in qlikData" class="measure">
			<h2>{{ measure.qMeta.title }}</h2>
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
</style>