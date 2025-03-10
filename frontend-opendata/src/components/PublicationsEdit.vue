<template>
	<div class="header">
		<h2>Edit Publication</h2>
		<a href="/publications" class="btn btn-secondary">return</a>
	</div>
	<div class="publication-form">
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-if="errorMessage" class="error">{{ errorMessage }}</div>
		<div v-if="successMessage" class="success">{{ successMessage }}</div>
		<form @submit.prevent="submitPublication">
			<div class="form-group">
				<label for="title">Title</label>
				<input type="text" id="title" v-model="title" required />
			</div>
			<div class="form-group">
				<label for="description">Description</label>
				<textarea id="description" v-model="description"></textarea>
			</div>
			<div class="form-group">
				<label for="author">Author</label>
				<input type="text" id="author" v-model="author" required />
			</div>
			<div class="form-group">
				<label for="category">Category</label>
				<select id="category" v-model="category" required>
					<option v-for="cat in categories" :key="cat._id" :value="cat.title">{{ cat.title }}</option>
				</select>
			</div>
			<div class="form-group">
				<label for="data">Data</label>
				<textarea id="data" v-model="data" required></textarea>
			</div>
			<button type="submit" class="btn btn-primary">Submit</button>
		</form>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from 'vue-router';

const title = ref("");
const description = ref("");
const author = ref("");
const category = ref("");
const categories = ref("");
const data = ref("");
const errorMessage = ref(null);
const successMessage = ref(null);
const loadError = ref(null);
const router = useRouter();
const route = useRoute();

const fetchCategories = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/categories`);
		if (!response.ok) {
			throw new Error('Failed to fetch categories');
		}
		const data = await response.json();
		categories.value = data;
	} catch (error) {
		errorMessage.value = error.message;
	}
};

const fetchPublication = async () => {
	const id = route.params.id;
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/publications/${route.params.id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch publication');
		}
		const publication = await response.json();
		title.value = publication.title;
		description.value = publication.description;
		author.value = publication.author;
		category.value = publication.category;
		data.value = publication.data;
	} catch (error) {
		loadError.value = error.message;
	}
};

const submitPublication = async () => {
	if (!title.value || !author.value || !category.value || !data.value) {
		errorMessage.value = "Title, Author, and Data fields are required.";
		return;
	}

	try {
		const id = route.params.id;
		console.log(id);
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/publications/${route.params.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title: title.value,
				description: description.value,
				author: author.value,
				category: category.value,
				data: data.value,
				active: true
			})
		});

		if (!response.ok) {
			throw new Error('Failed to update publication');
		}

		successMessage.value = "Publication updated successfully!";
		errorMessage.value = null;

		// Redirect to the publications list page
		router.push('/publications');
	} catch (error) {
		errorMessage.value = error.message;
		successMessage.value = null;
	}
};

onMounted(() => {
	fetchCategories();
	fetchPublication();
});
</script>

<style scoped>
.publication-form {
	margin: 0 auto;
	padding: 20px;
	border: 1px solid #ddd;
	border-radius: 5px;
	background-color: #f9f9f9;
}

.form-group {
	margin-bottom: 15px;
}

.form-group label {
	display: block;
	margin-bottom: 5px;
}

.form-group input,
.form-group textarea,
.form-group select {
	width: 100%;
	padding: 10px;
	border: 1px solid #ccc;
	border-radius: 4px;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
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

.btn-secondary {
	background-color: #6c757d;
}

.btn-secondary:hover {
	background-color: #5a6268;
}

.error {
	color: red;
	margin-bottom: 15px;
}

.success {
	color: green;
	margin-bottom: 15px;
}
</style>