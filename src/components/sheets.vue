<script setup>
const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID

// Créer le script et définir les attributs
const script = document.createElement('script')
script.crossOrigin = 'anonymous'
script.type = 'application/javascript'
script.src = 'https://cdn.jsdelivr.net/npm/@qlik/embed-web-components'
script.setAttribute('data-host', tenantUrl)
script.setAttribute('data-client-id', qlikClientId)
script.setAttribute('data-redirect-uri', redirectUrl)
script.setAttribute('data-access-token-storage', 'session')
script.setAttribute('data-cross-site-cookies', 'true')
script.setAttribute('data-auto-redirect', 'true')

// Ajouter le script au document
document.body.appendChild(script)

</script>

<template>
	<div>
		<h2>Sheets</h2>
		<div v-for="sheet in qlikData" :key="sheet.qInfo.qId" class="sheet">
			<h2>{{ sheet.qMeta.title }}</h2>
			<div class="kpi">
				<qlik-embed ref="kpi" ui="analytics/sheet" :app-id="qlikAppId" :object-id="sheet.qMeta.id"></qlik-embed>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			qlikData: [] // Initialize with an empty array
		};
	},
	created() {
		// Fetch JSON data from the local file
		fetch('../../data/sheets.json')
			.then(response => response.json())
			.then(data => {
				// Assign the JSON data to qlikData
				this.qlikData = data;
			})
			.catch(error => {
				console.error('Error loading JSON file:', error);
			});
	}
};
</script>

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
</style>