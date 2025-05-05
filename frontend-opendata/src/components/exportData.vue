<template>
	<h3>Les données</h3>
	<div class="wrapper">
		<qlik-embed ref="qeData" ui="analytics/chart" :app-id="`${publication.qId}`" object-id="NYhV" />

		<div id="loader" style="display: none">
			Chargement...
		</div>
		<button id="exportSheet" class="btn btn-primary btn-display" style="text-wrap: nowrap">
			Report
		</button>
		<button id="exportPNG" class="btn btn-primary btn-display" style="text-wrap: nowrap">
			Chart
		</button>
		<button id="exportData" class="btn btn-primary btn-display" style="text-wrap: nowrap">
			Data
		</button>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { auth, reports, tempContents } from '@qlik/api'
import { saveAs } from 'file-saver'

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL
const oauthClient = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID
const redirectUri = import.meta.env.VITE_QLIK_REDIRECT_URI

const qeData = ref(null)
const doc = ref(null)
const theObject = ref(null)
const objLayout = ref(null)
//const publication = ref(null)

const props = defineProps({
	publication: {
		type: Object,
		required: true,
	},
})

const fetchPublication = async () => {
	const id = route.params.id
	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/publications/${id}`,
		)
		if (!response.ok) {
			throw new Error('Failed to fetch publication')
		}
		const data = await response.json()
		publication.value = data
	} catch (error) {
		loadError.value = error.message
	}
}

const initialize = async () => {
	const vizEl = qeData.value
	const appId = vizEl.getAttribute('app-id')
	const refApi = await vizEl.getRefApi()
	doc.value = await refApi.getDoc()
	theObject.value = await refApi.getObject()
	objLayout.value = await theObject.value.getLayout()

	// auth.setDefaultHostConfig({
	// 	host: tenantUrl,
	// 	authType: 'Oauth2',
	// 	clientId: oauthClient,
	// 	redirectUri: redirectUri,
	// 	accessTokenStorage: 'session',
	// 	autoRedirect: true,
	// })

	document
		.getElementById('exportData')
		.addEventListener('click', async function () {
			exportData(doc, objLayout, '.xlsx')
		})

	document
		.getElementById('exportPNG')
		.addEventListener('click', async function () {
			exportData(doc, objLayout, '.png')
		})

	document
		.getElementById('exportSheet')
		.addEventListener('click', async function () {
			exportData(docSheet, objLayoutSheet, '.pdf')
		})

	await fetchPublication()

}

const exportData = async () => {
	try {
		showLoader()
		const tempB = await doc.value.createTemporaryBookmark({
			qOptions: {
				qIncludeAllPatches: true,
				qIncludeVariables: true,
				qSaveVariableExpressions: true,
			},
			qObjectIdsToPatch: [objLayout.value.qInfo.qId],
		})

		const reportPayload = {
			type: 'sense-data-1.0',
			meta: {
				exportDeadline: 'P0Y0M0DT0H8M0S',
				tags: ['qlik-embed-download'],
			},
			senseDataTemplate: {
				appId: vizEl.value.getAttribute('app-id'),
				id: objLayout.value.qInfo.qId,
				selectionType: 'temporaryBookmarkV2',
				temporaryBookmarkV2: {
					id: tempB,
				},
			},
			output: {
				outputId: 'Chart_excel',
				type: 'xlsx',
			},
		}

		const reportReq = await reports.createReport(reportPayload)
		let statusURL = reportReq.headers.get('content-location')
		const reportId = extractReportId(statusURL)
		if (!reportId) {
			throw new Error('Invalid report ID')
		}

		const wait = await waitUntil(reportId)
		const downloadId = getDownloadId(wait.location)
		let dle = await tempContents.downloadTempFile(downloadId, { inline: 1 })
		hideLoader()
		saveAs(dle.data, `${createFileName(wait.filename)}.xlsx`)
	} catch (err) {
		console.log(err)
		hideLoader()
	}
}

const showLoader = () => {
	document.getElementById('loader').style.display = 'block'
}

const hideLoader = () => {
	document.getElementById('loader').style.display = 'none'
}

const createFileName = additionalInfo => {
	const currentDateTime = new Date().toISOString()
	return `${additionalInfo}-${currentDateTime}`
}

const waitUntil = async reportId => {
	return await new Promise(resolve => {
		const interval = setInterval(() => {
			reports.getReportStatus(reportId).then(status => {
				console.log(status)
				console.log(`Current status: ${status.data.status}`)
				if (status.data.status === 'done') {
					console.log(status)
					let result = {
						location: status.data.results[0].location,
						filename: status.data.results[0].outputId,
					}
					clearInterval(interval)
					resolve(result)
				}
			})
		}, 5000)
	})
}

const extractReportId = url => {
	const regex = /reports\/(.*?)\/status/
	const match = url.match(regex)
	if (match && match[1]) {
		return match[1]
	}
	return null
}

const getDownloadId = url => {
	const regex = /\/([^\/?#]+)(?:[?#]|$)/
	const matches = url.match(regex)
	return matches ? matches[1] : null
}

onMounted(() => {
	initialize()
})
</script>

<style scoped>
.wrapper {
	margin: 10px;
}

#loader {
	display: none;
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

.btn-display {
	margin-right: 20px;
}
</style>
