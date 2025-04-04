<template>
	<div>
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-else-if="publication">
			<h2>{{ publication.title }}</h2>
			<span class="date"><strong>Auteur:</strong> {{ publication.author }} • <strong>Publier le:</strong>
				{{ new Date(publication.publishedAt).toLocaleDateString() }}</span>
			<div class="date"><strong>Categorie:</strong> {{ publication.category }}</div>

			<div class="content" v-html="publication.description"></div>
			<Export />
		</div>
		<div v-else class="loading">Chargement...</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router';

import Export from '@/components/export.vue';

const publication = ref(null);
const loadError = ref(null);
const route = useRoute();

const fetchPublication = async () => {
	const id = route.params.id;
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/publications/${id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch publication');
		}
		const data = await response.json();
		publication.value = data;
	} catch (error) {
		loadError.value = error.message;
	}
};

onMounted(() => {
	fetchPublication();
});
</script>

<style scoped>
.publication-details {
	max-width: 800px;
	margin: 0 auto;
	padding: 20px;
	border: 1px solid #ddd;
	border-radius: 5px;
	background-color: #f9f9f9;
}

.publication-image {
	width: 100%;
	height: auto;
	border-radius: 5px;
	margin-bottom: 15px;
}

.error {
	color: red;
	margin-bottom: 15px;
}

.date {
	font-size: small;
}

.content {
	margin-top: 15px;
}

.loading {
	text-align: center;
	font-size: 1.2em;
	color: #666;
}
</style>