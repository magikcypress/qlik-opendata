<template>
	<Menu />
	<div class="header">
		<h2>Ajout d'une Categorie</h2>
		<a href="/category" class="btn btn-secondary">Retour</a>
	</div>
	<div class="category-form">
		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-if="errorMessage" class="error">{{ errorMessage }}</div>
		<div v-if="successMessage" class="success">{{ successMessage }}</div>
		<form @submit.prevent="submitCategory">
			<div class="form-group">
				<label for="title">Titre</label>
				<input type="text" id="title" v-model="title" required />
			</div>
			<div class="form-group">
				<label for="description">Description</label>
				<textarea id="description" v-model="description"></textarea>
			</div>
			<button type="submit" class="btn btn-primary">Envoyer</button>
		</form>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';

import Menu from '@/views/Menu.vue';

const title = ref("");
const description = ref("");
const errorMessage = ref(null);
const successMessage = ref(null);
const loadError = ref(null);
const router = useRouter();

const submitCategory = async () => {
	if (!title.value) {
		errorMessage.value = "Title field is required.";
		return;
	}

	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/categories`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title: title.value,
				description: description.value,
				active: true
			})
		});

		if (!response.ok) {
			throw new Error('Failed to add category');
		}

		successMessage.value = "Category added successfully!";
		errorMessage.value = null;

		// Redirect to the categories list page
		router.push('/category');
	} catch (error) {
		errorMessage.value = error.message;
		successMessage.value = null;
	}
};
</script>

<style scoped>
.category-form {
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
.form-group textarea {
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