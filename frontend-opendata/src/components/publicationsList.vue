<template>
	<div>
		<div class="header">
			<h2>Publications</h2>
			<div class="add-new-publication">
				<router-link to="/publicationsadd" class="btn btn-primary">Add New Publication</router-link>
			</div>
		</div>
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-else>
			<ul class="publications-list">
				<li v-for="publication in publications" :key="publication._id" class="publication-item">
					<div class="publication-header">
						<h3>{{ publication.title }}</h3>
						<div class="buttons">
							<router-link :to="`/publications/edit/${publication._id}`"
								class="btn btn-secondary">Edit</router-link>
							<button @click="deletePublication(publication._id)" class="btn btn-danger">Delete</button>
						</div>
					</div>
					<p>{{ publication.description }}</p>
					<p><strong>Author:</strong> {{ publication.author }}</p>
					<p><strong>Published At:</strong> {{ new Date(publication.publishedAt).toLocaleString() }}</p>
					<p><strong>Data:</strong> {{ publication.data }}</p>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const publications = ref([]);
const loadError = ref(null);

const fetchPublications = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/publications`);
		if (!response.ok) {
			throw new Error('Failed to fetch publications');
		}
		const data = await response.json();
		publications.value = data;
	} catch (error) {
		loadError.value = error.message;
	}
};

const deletePublication = async (id) => {
	if (!confirm('Are you sure you want to delete this publication?')) {
		return;
	}

	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/publications/${id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error('Failed to delete publication');
		}

		// Remove the deleted publication from the list
		publications.value = publications.value.filter(publication => publication._id !== id);
	} catch (error) {
		alert(error.message);
	}
};

onMounted(() => {
	fetchPublications();
});
</script>

<style scoped>
.publications-list {
	max-width: 800px;
	margin: 0 auto;
	padding: 20px;
	border-bottom: 1px solid #ddd;
	border-radius: 5px;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.publication-item {
	border-bottom: 1px solid #ddd;
	padding: 10px 0;
	position: relative;
}

.publication-item:last-child {
	border-bottom: none;
}

.publication-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.buttons {
	display: flex;
	gap: 10px;
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
</style>