<template>
	<div class="container">
		<div class="content">
			<div v-if="loadError" class="error">
				{{ loadError }}
			</div>
			<div v-else-if="isLoading" class="loading">Chargement...</div>
			<div v-else-if="publication">
				<h2>{{ publication.title }}</h2>
				<span class="date"><strong>Author:</strong> {{ publication.author }} •
					<strong>Published At:</strong>
					{{
						new Date(publication.publishedAt).toLocaleDateString()
					}}</span>
				<div class="date">
					<strong>Category:</strong> {{ publication.category }}
				</div>

				<div class="content" v-html="publication.description" />

				<p class="source">
					<strong>Source:</strong>
					<span v-if="isValidUrl(publication.data)">
						<a :href="publication.data" target="_blank" rel="noopener noreferrer">{{ publication.data }}</a>
					</span>
					<span v-else>
						{{ publication.data }}
					</span>
				</p>

				<onTheFly v-if="publication && Object.keys(publication).length > 0" :publication="publication" />
				<!--exportData v-if="publication && Object.keys(publication).length > 0" :publication="publication" /-->
			</div>
			<div v-else class="loading">
				Loading...
			</div>
		</div>

		<div class="sidebar">
			<h3>Publications</h3>
			<ul>
				<li v-for="pub in filteredPublications" :key="pub._id">
					<RouterLink :to="`/publication/${pub._id}`">{{ pub.title }}</RouterLink>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { loadQlikScriptAnon } from '@/utils/utils'

import exportData from '@/components/exportData.vue'
import onTheFly from '@/components/onTheFly.vue'

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_ANON_CLIENT_ID

const publication = ref(null)
const publications = ref([])
const isLoading = ref(true)
const loadError = ref(null)
const route = useRoute()

const isValidUrl = string => {
	try {
		new URL(string)
		return true
	} catch (_) {
		return false
	}
}

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

// Filtrer les publications pour exclure l'article en cours
const filteredPublications = computed(() => {
	return publications.value.filter(pub => pub._id !== route.params.id)
})

watch(
    () => route.params.id,
    async () => {
        isLoading.value = true
        await fetchPublication()
        isLoading.value = false

        if (publication.value && publication.value.aec) {
            loadQlikScriptAnon(tenantUrl, qlikClientId, publication.value.aec)
        } else {
            console.error('Publication ou AEC non défini')
        }
    },
)

onMounted(async () => {
	await fetchPublication()
	await fetchPublications()
	isLoading.value = false

	if (publication.value && publication.value.aec) {
		loadQlikScriptAnon(tenantUrl, qlikClientId, publication.value.aec)
	} else {
		console.error('Publication ou AEC non défini')
	}
})
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: row;
	gap: 20px;
}

.content {
	flex: 3;
}

.sidebar {
	flex: 1;
	border: 1px solid #ddd;
	border-radius: 5px;
	padding: 15px;
	background-color: #f9f9f9;
}

.sidebar h3 {
	margin-top: 0;
}

.sidebar ul {
	list-style: none;
	padding: 0;
	margin: 0;
}

.sidebar li {
	margin-bottom: 10px;
}

.sidebar li a {
	text-decoration: none;
	color: #007bff;
}

.sidebar li a:hover {
	text-decoration: underline;
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

strong {
	font-weight: bold;
	padding-right: 0.2em;
}

.source {
	padding-bottom: 1em;
	margin-bottom: 1em;
	border-bottom: 1px solid #ddd;
}

.loading {
	text-align: center;
	font-size: 1.2em;
	color: #666;
}
</style>
