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
const activeObject = ref(null);
const objectDetails = ref(null);
const objectsInDatabase = ref(new Set());

const { jsonData, error, validateAndRepairJSON } = useJsonRepair();

const toggleKpi = (objectId) => {
	activeObject.value = activeObject.value === objectId ? null : objectId;
};

const addObjectToMongoDB = async (object) => {
	try {
		console.log('Adding object to MongoDB:', object);
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/objects`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: object.name,
				type: object.type,
				col: object.col,
				row: object.row,
				colspan: object.colspan,
				rowspan: object.rowspan,
				bounds: object.bounds,
				active: false
			})
		});
		console.log('response:', response);
		if (!response.ok) {
			throw new Error('Failed to add object to MongoDB');
		}
		alert('Object added to MongoDB successfully');
		objectsInDatabase.value.add(object.name); // Add to the set of objects in the database
	} catch (error) {
		console.error('Error adding object to MongoDB:', error);
		alert('Error adding object to MongoDB');
	}
};

const removeObjectFromMongoDB = async (object) => {
	try {
		console.log('Removing object from MongoDB:', object);
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/objects/${object.name}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		console.log('response:', response);
		if (!response.ok) {
			throw new Error('Failed to remove object from MongoDB');
		}
		alert('Object removed from MongoDB successfully');
		objectsInDatabase.value.delete(object.name); // Remove from the set of objects in the database
	} catch (error) {
		console.error('Error removing object from MongoDB:', error);
		alert('Error removing object from MongoDB');
	}
};

const toggleObjectActive = async (object) => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/objects/${object.name}/active`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) {
			throw new Error('Failed to toggle object active state');
		}
		const updatedObject = await response.json();
		object.active = updatedObject.active; // Update the local state
	} catch (error) {
		console.error('Error toggling object active state:', error);
		alert('Error toggling object active state');
	}
};

const checkObjectInDatabase = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/objects`);
		if (!response.ok) {
			throw new Error('Failed to fetch objects from database');
		}
		const data = await response.json();
		console.log('Objects in database:', data);
		data.forEach(object => {
			objectsInDatabase.value.add(object.name);
		});
	} catch (error) {
		console.error('Error fetching objects from database:', error);
	}
};

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl);
	checkObjectInDatabase();

	// Fetch JSON data from the local file
	fetch(`${import.meta.env.VITE_BACKEND_URI}/data/objects.json`)
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
		<h2>Objects</h2>
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-else-if="jsonError" class="error">{{ jsonError }}</div>
		<div v-else>
			<qlik-embed ui="analytics/selections" :app-id="qlikAppId"></qlik-embed>
			<div v-for="object in qlikData" :key="object.name" class="object">
				<ul>
					<li class="object-item">
						<a href="#" @click.prevent="toggleKpi(object.name)" class="link">{{ object.type }} • [{{
							object.name }}]</a>
						<div class="button-container">
							<button v-if="!objectsInDatabase.has(object.name)" @click="addObjectToMongoDB(object)"
								class="btn btn-primary">Add to Public page</button>
							<button v-else @click="removeObjectFromMongoDB(object)" class="btn btn-danger">Remove from
								Public page</button>
							<label class="switch" v-if="objectsInDatabase.has(object.name)">
								<input type="checkbox" @change="toggleObjectActive(object)"
									checked="{{ object.active ? false : true }}">
								<span class="slider round"></span>
							</label>
						</div>
					</li>
				</ul>
				<div v-if="activeObject === object.name" class="kpi">
					<qlik-embed ref="kpi" ui="analytics/sheet" :app-id="qlikAppId"
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

.kpi {
	height: 800px;
}

.link {
	padding: 5px 500px 5px 5px;
	border-radius: 5px;
}

ul {
	list-style: none;
	padding: 0 2px;
}

.object-item {
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

.switch {
	position: relative;
	display: inline-block;
	width: 60px;
	height: 34px;
}

.switch input {
	opacity: 0;
	width: 0;
	height: 0;
}

.slider {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	transition: .4s;
	border-radius: 34px;
}

.slider:before {
	position: absolute;
	content: "";
	height: 26px;
	width: 26px;
	left: 4px;
	bottom: 4px;
	background-color: white;
	transition: .4s;
	border-radius: 50%;
}

input:checked+.slider {
	background-color: #4CAF50;
}

input:checked+.slider:before {
	transform: translateX(26px);
}

.slider.round {
	border-radius: 34px;
}

.slider.round:before {
	border-radius: 50%;
}

.error {
	color: red;
	font-weight: bold;
}
</style>