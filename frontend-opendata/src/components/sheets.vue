<script setup>
import { ref, onMounted } from "vue";
import { useJsonRepair } from "@/composables/useJsonRepair";
import { loadQlikScript } from '@/utils/utils';

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;

const qlikData = ref([]);
const loadError = ref(null);
const jsonError = ref(null);
const activeSheet = ref(null);
const sheetDetails = ref(null);
const sheetsInDatabase = ref(new Set());

const { jsonData, error, validateAndRepairJSON } = useJsonRepair();

const toggleKpi = (sheetId) => {
	activeSheet.value = activeSheet.value === sheetId ? null : sheetId;
};

const addSheetToMongoDB = async (sheet) => {
	try {
		console.log('Adding sheet to MongoDB:', sheet);
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/sheets`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				qId: sheet.qInfo.qId,
				title: sheet.qMeta.title,
				description: sheet.qMeta.description,
				tags: sheet.qMeta.tags,
				createdAt: sheet.qMeta.createdAt,
				updatedAt: sheet.qMeta.updatedAt,
				active: false
			})
		});
		console.log('response:', response);
		if (!response.ok) {
			throw new Error('Failed to add sheet to MongoDB');
		}
		alert('Sheet added to MongoDB successfully');
		sheetsInDatabase.value.add(sheet.qInfo.qId); // Add to the set of sheets in the database
	} catch (error) {
		console.error('Error adding sheet to MongoDB:', error);
		alert('Error adding sheet to MongoDB');
	}
};

const removeSheetFromMongoDB = async (sheet) => {
	try {
		console.log('Removing sheet from MongoDB:', sheet);
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/${sheet.qInfo.qId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		console.log('response:', response);
		if (!response.ok) {
			throw new Error('Failed to remove sheet from MongoDB');
		}
		alert('Sheet removed from MongoDB successfully');
		sheetsInDatabase.value.delete(sheet.qInfo.qId); // Remove from the set of sheets in the database
	} catch (error) {
		console.error('Error removing sheet from MongoDB:', error);
		alert('Error removing sheet from MongoDB');
	}
};

const toggleSheetActive = async (sheet) => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/${sheet.qInfo.qId}/active`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) {
			throw new Error('Failed to toggle sheet active state');
		}
		const updatedSheet = await response.json();
		sheet.active = updatedSheet.active; // Update the local state
	} catch (error) {
		console.error('Error toggling sheet active state:', error);
		alert('Error toggling sheet active state');
	}
};

const checkSheetInDatabase = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/sheets`);
		if (!response.ok) {
			throw new Error('Failed to fetch sheets from database');
		}
		const data = await response.json();
		console.log('Sheets in database:', data);
		data.forEach(sheet => {
			sheetsInDatabase.value.add(sheet.qId);
		});
	} catch (error) {
		console.error('Error fetching sheets from database:', error);
	}
};

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl);
	checkSheetInDatabase();

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
					<li class="sheet-item">
						<a href="#" @click.prevent="toggleKpi(sheet.qInfo.qId)" class="link">{{ sheet.qMeta.title }}</a>
						<div class="button-container">
							<button v-if="!sheetsInDatabase.has(sheet.qInfo.qId)" @click="addSheetToMongoDB(sheet)"
								class="btn btn-primary">Add to Public page</button>
							<button v-else @click="removeSheetFromMongoDB(sheet)" class="btn btn-danger">Remove from
								Public page</button>
							<button v-if="sheetsInDatabase.has(sheet.qInfo.qId)" @click="toggleSheetActive(sheet)"
								:class="sheet.active ? 'deactivate-button' : 'activate-button'">
								{{ sheet.active ? 'Deactivate' : 'Activate' }}
							</button>
						</div>
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

.link {
	padding: 5px 400px 5px 5px;
	border-radius: 5px;
}

ul {
	list-style: none;
	padding: 0 2px;
}

.sheet-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.button-container {
	display: flex;
	gap: 10px;
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

.btn-danger {
	background-color: #df6e7a;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	margin-left: 10px;
}

.btn-danger:hover {
	background-color: #bf0a1c;
}

.activate-button {
	background-color: #4CAF50;
	/* Green */
	border: none;
	color: white;
	padding: 10px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	cursor: pointer;
	border-radius: 5px;
	transition: background-color 0.3s ease;
}

.activate-button:hover {
	background-color: #45a049;
}

.deactivate-button {
	background-color: #f44336;
	/* Red */
	border: none;
	color: white;
	padding: 10px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	cursor: pointer;
	border-radius: 5px;
	transition: background-color 0.3s ease;
}

.deactivate-button:hover {
	background-color: #e53935;
}

.error {
	color: red;
	font-weight: bold;
}
</style>