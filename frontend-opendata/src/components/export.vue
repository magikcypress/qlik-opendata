<template>
	<div>
		<div id="loader" style="display: none;">Loading...</div>
		<button id="exportData" @click="exportData">Export Data</button>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import { auth, reports, tempContents } from "@qlik/api";
import { saveAs } from 'file-saver';

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const oauthClient = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUri = import.meta.env.VITE_QLIK_REDIRECT_URI;

const vizEl = ref(null);
const doc = ref(null);
const theObject = ref(null);
const objLayout = ref(null);

const initialize = async () => {
	vizEl.value = document.getElementById("qeData");
	const appId = vizEl.value.getAttribute("app-id");
	const refApi = await vizEl.value.getRefApi();
	doc.value = await refApi.getDoc();
	theObject.value = await refApi.getObject();
	objLayout.value = await theObject.value.getLayout();

	auth.setDefaultHostConfig({
		host: tenantUrl,
		authType: "Oauth2",
		clientId: oauthClient,
		redirectUri: redirectUri,
		accessTokenStorage: "session",
		autoRedirect: true,
	});
};

const exportData = async () => {
	try {
		showLoader();
		const tempB = await doc.value.createTemporaryBookmark({
			qOptions: {
				qIncludeAllPatches: true,
				qIncludeVariables: true,
				qSaveVariableExpressions: true
			},
			qObjectIdsToPatch: [
				objLayout.value.qInfo.qId
			]
		});

		const reportPayload = {
			type: "sense-data-1.0",
			meta: {
				exportDeadline: "P0Y0M0DT0H8M0S",
				tags: ["qlik-embed-download"]
			},
			senseDataTemplate: {
				appId: vizEl.value.getAttribute("app-id"),
				id: objLayout.value.qInfo.qId,
				selectionType: "temporaryBookmarkV2",
				temporaryBookmarkV2: {
					id: tempB
				}
			},
			output: {
				outputId: "Chart_excel",
				type: "xlsx"
			}
		};

		const reportReq = await reports.createReport(reportPayload);
		let statusURL = reportReq.headers.get("content-location");
		const reportId = extractReportId(statusURL);
		if (!reportId) {
			throw new Error("Invalid report ID");
		}

		const wait = await waitUntil(reportId);
		const downloadId = getDownloadId(wait.location);
		let dle = await tempContents.downloadTempFile(downloadId, { inline: 1 });
		hideLoader();
		saveAs(dle.data, `${createFileName(wait.filename)}.xlsx`);
	} catch (err) {
		console.log(err);
		hideLoader();
	}
};

const showLoader = () => {
	document.getElementById("loader").style.display = "block";
};

const hideLoader = () => {
	document.getElementById("loader").style.display = "none";
};

const createFileName = (additionalInfo) => {
	const currentDateTime = new Date().toISOString();
	return `${additionalInfo}-${currentDateTime}`;
};

const waitUntil = async (reportId) => {
	return await new Promise(resolve => {
		const interval = setInterval(() => {
			reports.getReportStatus(reportId).then((status) => {
				console.log(status);
				console.log(`Current status: ${status.data.status}`);
				if (status.data.status === "done") {
					console.log(status);
					let result = {
						location: status.data.results[0].location,
						filename: status.data.results[0].outputId,
					};
					clearInterval(interval);
					resolve(result);
				}
			});
		}, 5000);
	});
};

const extractReportId = (url) => {
	const regex = /reports\/(.*?)\/status/;
	const match = url.match(regex);
	if (match && match[1]) {
		return match[1];
	}
	return null;
};

const getDownloadId = (url) => {
	const regex = /\/([^\/?#]+)(?:[?#]|$)/;
	const matches = url.match(regex);
	return matches ? matches[1] : null;
};

onMounted(() => {
	initialize();
});
</script>

<style scoped>
#loader {
	display: none;
}
</style>