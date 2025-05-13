<template>
	<div>
		<h2>Publications</h2>
		{{ publications.length }} publication(s) trouvée(s)
		<div v-if="loadError" class="error">
			{{ loadError }}
		</div>
		<div v-else-if="publications.length > 0" class="publications-container">
			
			<div v-for="publication in publications" :key="publication._id" class="publication-item">
				<a :href="`/publication/${publication._id}`">
					<img :src="Jacket" alt="Publication Image" class="publication-image">
				</a>
				<a :href="`/publication/${publication._id}`">
					<h3>{{ publication.title }}</h3>
				</a>
				<div class="date">
					<strong>Author:</strong> {{ publication.author }} •
					<strong>Published At:</strong>
					{{
						new Date(publication.publishedAt).toLocaleDateString(
							'fr',
						)
					}}
				</div>
				<div class="date">
					<strong>Category:</strong> {{ publication.category }}
				</div>
			</div>
		</div>
		<div v-else>
			<p class="info-message">
				Pas de publication pour le moment.
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Jacket from '@/assets/data-template.jpg'

const publications = ref([])
const loadError = ref(null)

const fetchPublications = async () => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/publications`,
		)
		if (!response.ok) {
			throw new Error('Failed to fetch publications')
		}
		const data = await response.json()
		publications.value = data
	} catch (error) {
		loadError.value = error.message
	}
}

onMounted(() => {
	fetchPublications()
})
</script>

<style scoped>
.publications-list {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
	border: 1px solid #ddd;
	border-radius: 5px;
	background-color: #f9f9f9;
}

.publications-container {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

.publication-item {
	flex: 1 1 calc(33.333% - 20px);
	border: 1px solid #ddd;
	border-radius: 5px;
	padding: 20px;
	background-color: #fff;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.publication-item h3 {
	margin-top: 0;
}

.publication-image {
	width: 100%;
	height: auto;
	border-radius: 5px;
	margin-bottom: 15px;
}

.date {
	font-size: small;
}

.error {
	color: red;
	margin-bottom: 15px;
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
