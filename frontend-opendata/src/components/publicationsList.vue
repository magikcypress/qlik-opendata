<template>
	<Menu />
	<div class="wrapper">
		<div class="header">
			<h2>Publications</h2>
			<div class="add-new-publication">
				<router-link to="/publicationsadd" class="btn btn-primary">
					Ajout Publication
				</router-link>
			</div>
		</div>
		<div v-if="loadError" class="error">
			{{ loadError }}
		</div>
		<div v-else>
			<div v-if="publications.length > 0">
				<ul>
					<li v-for="publication in publications" :key="publication._id" class="publication-item">
						<div class="publication-header">
							<h3>{{ publication.title }}</h3>
							<div class="buttons">
								<div class="details-article">
									<p>
										<strong>Application:</strong>
										{{ publication.application }}
									</p>
									<p>
										<strong>Categorie:</strong>
										{{ publication.category }}
									</p>
									<p>
										<strong>Auteur:</strong>
										{{ publication.author }}
									</p>
									<p>
										<strong>Publié le:</strong>
										{{
											formatDate(publication.publishedAt)
										}}
									</p>
								</div>
								<router-link :to="`/publications/edit/${publication._id}`" class="btn btn-secondary">
									Edition
								</router-link>
								<button class="btn btn-danger" @click="deletePublication(publication._id)">
									Supprimer
								</button>
							</div>
						</div>
						<p v-html="publication.description" />
						<p>
							<strong>Source: &nbsp;</strong>
							<span v-if="isValidUrl(publication.data)">
								<a :href="publication.data" target="_blank" rel="noopener noreferrer">
									{{ publication.data }}
								</a>
							</span>
							<span v-else>
								{{ publication.data }}
							</span>
						</p>
					</li>
				</ul>
			</div>
			<div v-else>
				<p class="info-message">
					Pas de publication pour le moment.
				</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Menu from '../views/menuNav.vue'

// Reactive variables
const publications = ref([])
const loadError = ref(null)

// Utility functions
const isValidUrl = string => {
	try {
		new URL(string)
		return true
	} catch (_) {
		return false
	}
}

const formatDate = dateString => {
	return new Date(dateString).toLocaleString()
}

// Fetch publications
const fetchPublications = async () => {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/publications`,
		)
		if (!response.ok) throw new Error('Failed to fetch publications')
		publications.value = await response.json()
	} catch (error) {
		loadError.value = error.message
	}
}

// Delete publication
const deletePublication = async id => {
	if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?'))
		return

	try {
		const response = await fetch(
			`${import.meta.env.VITE_BACKEND_URI}/publications/${id}`,
			{
				method: 'DELETE',
			},
		)
		if (!response.ok) throw new Error('Failed to delete publication')

		// Remove the deleted publication from the list
		publications.value = publications.value.filter(
			publication => publication._id !== id,
		)
	} catch (error) {
		alert(error.message)
	}
}

// Lifecycle hook
onMounted(() => {
	fetchPublications()
})
</script>

<style scoped>
.wrapper {
	margin: 10px;
}

.publications-list {
	padding: 20px;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.publication-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.details-article p {
	margin: 5px 0;
}

.buttons {
	display: flex;
	gap: 25px;
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

strong {
	font-weight: bold;
	padding-right: 0.2em;
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

.btn {
	padding: 10px 20px;
	background-color: #007bff;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	margin-right: 10px;
	height: 50px;
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
</style>
