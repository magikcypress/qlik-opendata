<template>
	<div class="publication-form">
		<h2>Create a Publication</h2>
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
				<label for="data">Data</label>
				<textarea id="data" v-model="data" required></textarea>
			</div>
			<button type="submit" class="btn btn-primary">Submit</button>
		</form>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';

const title = ref("");
const description = ref("");
const author = ref("");
const data = ref("");
const errorMessage = ref(null);
const successMessage = ref(null);
const router = useRouter();

const submitPublication = async () => {
	if (!title.value || !author.value || !data.value) {
		errorMessage.value = "Title, Author, and Data fields are required.";
		return;
	}

	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/publications`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title: title.value,
				description: description.value,
				author: author.value,
				data: data.value,
				active: true
			})
		});

		if (!response.ok) {
			throw new Error('Failed to create publication');
		}

		successMessage.value = "Publication created successfully!";
		errorMessage.value = null;
		title.value = "";
		description.value = "";
		author.value = "";
		data.value = "";

		// Redirect to the publications list page
		router.push('/publications');
	} catch (error) {
		errorMessage.value = error.message;
		successMessage.value = null;
	}
};
</script>

<style scoped>
.publication-form {
	max-width: 600px;
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

.error {
	color: red;
	margin-bottom: 15px;
}

.success {
	color: green;
	margin-bottom: 15px;
}
</style>