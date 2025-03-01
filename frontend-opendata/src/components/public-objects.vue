<script setup>
import { ref, onMounted } from "vue";
import { loadQlikScriptAnon } from '@/utils/utils';
import { VueDraggableNext } from 'vue-draggable-next';

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_ANON_CLIENT_ID;
const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;
const qlikEmbedAccessCode = import.meta.env.VITE_QLIK_EMBEDDED_CODE;

const objects = ref([]);
const activeObjects = ref([]);

const fetchObjects = async () => {
	try {
		const response = await fetch('http://localhost:3000/objects');
		if (!response.ok) {
			throw new Error('Failed to fetch objects');
		}
		const data = await response.json();
		objects.value = data;
		activeObjects.value = data.filter(object => object.active);
	} catch (error) {
		console.error('Error fetching objects:', error);
	}
};

onMounted(() => {
	loadQlikScriptAnon(tenantUrl, qlikClientId, qlikEmbedAccessCode);
	fetchObjects();
});
</script>

<template>
	<div>
		<div v-if="activeObjects.length > 0">
			<qlik-embed ui="analytics/selections" :app-id="qlikAppId"></qlik-embed>

            <vue-draggable-next v-model="activeObjects">
                <template v-for="element in activeObjects" :key="element.name" >
                    <div class="object">
                        <qlik-embed ui="analytics/chart" :app-id="qlikAppId" :object-id="element.name"></qlik-embed>
                    </div>
                </template>
            </vue-draggable-next>
			<!-- <div v-for="object in activeObjects" :key="object.name" class="object">
				<qlik-embed ui="analytics/chart" :app-id="qlikAppId" :object-id="object.name"></qlik-embed>
			</div> -->
		</div>
		<div v-else>
			<p class="info-message">No active objects are available.</p>
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

.object {
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