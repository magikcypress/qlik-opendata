<template>
    <div>
        <Menu />
        <div class="header">
            <h2>Qlik Sense Applications</h2>
        </div>
        <div v-if="loadError" class="error">{{ loadError }}</div>
        <div v-else-if="loading" class="loading">Chargement...</div>
        <div v-else>
            <ul>
                <li v-for="app in apps.value" :key="app.attributes.id" class="app-item">
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <img :src="`${tenantUrl}${app.attributes.thumbnail}`" alt="thumbnail" class="thumbnail"/>
                        </el-col>
                        <el-col :span="18">
                            <h3>{{ app.attributes.name }}</h3>
                            <div class="app-description">{{ app.attributes.description }}</div>
                            <div class="buttons">
                                <button v-if="!applicationInDatabase.has(app.attributes.id)"
                                    @click="addApplicationToMongoDB(app)" class="btn btn-primary">Ajouter une application</button>
                                <button v-else @click="removeApplicationFromMongoDB(app)" class="btn btn-danger">Supprimer application</button>
                            </div>
                        </el-col>
                    </el-row>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth, apps, qix } from "@qlik/api";

import Menu from '@/views/Menu.vue';

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;
const qlikAppsId = import.meta.env.VITE_QLIK_APPS_ID.split(',');

const loadError = ref(null);
const loading = ref(true);
const applicationInDatabase = ref(new Set());
const applicationData = ref([]);

const fetchApps = async () => {
	try {
		auth.setDefaultHostConfig({
			host: tenantUrl,
			authType: "Oauth2",
			clientId: qlikClientId,
			redirectUri: redirectUrl,
			accessTokenStorage: "session",
			autoRedirect: true,
		});

		const fetchedApps = [];
		for await (const appId of qlikAppsId) {
			const response = await apps.getAppInfo(appId);
			const r = qix.openAppSession({ appId });
			const QlikApp = await r.getDoc();
			const layout = await QlikApp.getAppLayout();
			console.log('response:', layout);
			fetchedApps.push(response.data);
		}
		apps.value = fetchedApps;

	} catch (error) {
		loadError.value = error.message;
	} finally {
		loading.value = false;
	}
};

const addApplicationToMongoDB = async (app) => {
	try {
		console.log('Adding application to MongoDB:', app);
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/applications`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				qId: app.attributes.id,
				name: app.attributes.name,
				description: app.attributes.description,
				active: true
			})
		});

		if (!response.ok) {
			throw new Error('Failed to add application to MongoDB');
		}
		alert('Application added to MongoDB successfully');
		applicationInDatabase.value.add(app.attributes.id); // Add to the set of applications in the database
	} catch (error) {
		console.error('Error adding application to MongoDB:', error);
		alert('Error adding application to MongoDB');
	}
};

const removeApplicationFromMongoDB = async (app) => {
	try {
		console.log('Removing application from MongoDB:', app);
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/applications/${app.attributes.id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		console.log('response:', response);
		if (!response.ok) {
			throw new Error('Failed to remove applications from MongoDB');
		}
		alert('Applications removed from MongoDB successfully');
		applicationInDatabase.value.delete(app.attributes.id); // Remove from the set of applications in the database
	} catch (error) {
		console.error('Error removing applications from MongoDB:', error);
		alert('Error removing sheet from MongoDB');
	}
};

const checkApplicationInDatabase = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/applications`);
		if (!response.ok) {
			throw new Error('Failed to fetch applications from database');
		}
		const data = await response.json();
		applicationData.value = data;

		data.forEach(application => {
			applicationInDatabase.value.add(application.qId);
		});
	} catch (error) {
		console.error('Error fetching sheets from database:', error);
	}
};

onMounted(() => {
	fetchApps();
	checkApplicationInDatabase();
});
</script>

<style scoped>
.qlik-apps-list {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
	border: 1px solid #ddd;
	border-radius: 5px;
}

.app-container {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

.app-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.app-item {
	flex: 1 1 calc(33.333% - 20px);
	border: 1px solid #ddd;
	border-radius: 5px;
	padding: 20px;
	background-color: #fff;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-item h3 {
	margin-top: 0;
}

.app-description {
	width: 80%;
}

.loading {
	text-align: center;
	font-size: 1.2em;
	color: #666;
}

h1 {
	text-align: center;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	border: 1px solid #ddd;
	padding: 10px;
	margin: 10px 0;
	border-radius: 5px;
}

.thumbnail {
	width: 100px;
	height: auto;
	border-radius: 5px;
	margin-left: 20px;
}

.buttons {
	text-align: right;
}

.btn {
	padding: 10px 20px;
	background-color: #007bff;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	margin-right: 10px;
}

.btn-primary {
	background-color: #007bff;
}

.btn-primary:hover {
	background-color: #0056b3;
}

.btn-secondary {
	background-color: #6c757d;
}

.btn-secondary:hover {
	background-color: #5a6268;
}

.btn-danger {
	background-color: #dc3545;
}

.btn-danger:hover {
	background-color: #c82333;
}

.error {
	color: red;
	margin-bottom: 15px;
}

.btn {
	padding: 10px 20px;
	background-color: #007bff;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	margin-right: 10px;
}

.btn-primary {
	background-color: #007bff;
}

.btn-primary:hover {
	background-color: #0056b3;
}

.btn-secondary {
	background-color: #6c757d;
}

.btn-secondary:hover {
	background-color: #5a6268;
}

.btn-danger {
	background-color: #dc3545;
}

.btn-danger:hover {
	background-color: #c82333;
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