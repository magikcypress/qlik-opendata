<script setup>
import { ref, onMounted } from "vue";
import { loadQlikScript } from '@/utils/utils';

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;

const sheets = ref([]);
const activeSheets = ref([]);

const fetchSheets = async () => {
	try {
		const response = await fetch('http://localhost:3000/sheets');
		if (!response.ok) {
			throw new Error('Failed to fetch sheets');
		}
		const data = await response.json();
		sheets.value = data;
		activeSheets.value = data.filter(sheet => sheet.active);
	} catch (error) {
		console.error('Error fetching sheets:', error);
	}
};

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl);
	fetchSheets();
});
</script>

<template>
	<div>
		<div v-if="activeSheets.length > 0">
			<qlik-embed ui="analytics/selections" :app-id="qlikAppId"></qlik-embed>
			<div v-for="sheet in activeSheets" :key="sheet.qId" class="sheet">
				<qlik-embed ui="analytics/sheet" :app-id="qlikAppId" :object-id="sheet.qId"></qlik-embed>
			</div>
		</div>
		<div v-else>
			<p class="info-message">No active sheets are available.</p>
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

.sheet {
	height: 800px;
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

.info-message {
	background-color: #fff3cd;
	color: #856404;
	border: 1px solid #ffeeba;
	padding: 10px;
	border-radius: 5px;
	margin: 10px 0;
	font-weight: bold;
}
</style>