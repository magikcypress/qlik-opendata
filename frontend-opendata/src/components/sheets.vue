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
const activeSheet = ref(null);

const toggleKpi = (sheetId) => {
	activeSheet.value = activeSheet.value === sheetId ? null : sheetId;
};

const addSheetToMongoDB = async (sheet) => {
	try {
		const response = await fetch('http://localhost:5000/api/sheets', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				qId: sheet.qInfo.qId,
				title: sheet.qMeta.title
			})
		});
		if (!response.ok) {
			throw new Error('Failed to add sheet to MongoDB');
		}
		alert('Sheet added to MongoDB successfully');
	} catch (error) {
		console.error('Error adding sheet to MongoDB:', error);
		alert('Error adding sheet to MongoDB');
	}
};

onMounted(() => {
	loadQlikScript();

	// Fetch JSON data from the local file
	fetch('../../data/sheets.json')
		.then(response => response.text()) // Ensure the response is treated as text
		.then(data => {
			if (validateAndRepairJSON(data)) {
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
		<h2>Sheets</h2>
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-else-if="jsonError" class="error">{{ jsonError }}</div>
		<div v-else>
			<qlik-embed ui="analytics/selections" :app-id="qlikAppId"></qlik-embed>
			<div v-for="sheet in qlikData" :key="sheet.qInfo.qId" class="sheet">
				<ul>
					<li>
						<a href="#" @click.prevent="toggleKpi(sheet.qInfo.qId)">{{ sheet.qMeta.title }}</a>
						<button @click="addSheetToMongoDB(sheet)">Add to MongoDB</button>
					</li>
				</ul>
				<div v-if="activeSheet === sheet.qInfo.qId" class="kpi">
					<qlik-embed ref="kpi" ui="analytics/sheet" :app-id="qlikAppId"
						:object-id="sheet.qMeta.id"></qlik-embed>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.sheet {
	border: 1px solid #ddd;
	padding: 10px;
	margin: 10px 0;
	border-radius: 5px;
}

.details {
	padding-left: 20px;
}

.kpi {
	height: 800px;
}

ul {
	list-style: none;
	padding: 0 2px;
}

.error {
	color: red;
	font-weight: bold;
}
</style>