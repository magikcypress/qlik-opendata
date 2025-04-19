<template>
	<div class="header">
		<h2>Creer une publication</h2>
		<a href="/publications" class="btn btn-secondary">Retour</a>
	</div>
	<div class="publication-form">
		<div v-if="errorMessage" class="error">{{ errorMessage }}</div>
		<div v-if="successMessage" class="success">{{ successMessage }}</div>
		<form @submit.prevent="submitPublication">
			<div class="form-group">
				<label for="application">Application <span class="mandatory">*</span></label>
				<select id="application" v-model="application" required>
					<option v-for="app in applications" :key="app._id" :value="app.name">{{ app.name }}</option>
				</select>
			</div>
			<div class="form-group">
				<label for="title">Title <span class="mandatory">*</span></label>
				<input type="text" id="title" v-model="title" required />
			</div>
			<div class="form-group">
				<label for="description">Description <span class="mandatory">*</span></label>
				<div ref="quillEditor" class="quill-editor"></div>
			</div>
			<div class="form-group">
				<label for="author">Auteur <span class="mandatory">*</span></label>
				<input type="text" id="author" v-model="author" required />
			</div>
			<div class="form-group">
				<label for="category">Categorie <span class="mandatory">*</span></label>
				<select id="category" v-model="category" required>
					<option v-for="cat in categories" :key="cat._id" :value="cat.title">{{ cat.title }}</option>
				</select>
			</div>
			<div class="form-group">
				<label for="data">Source des données</label>
				<textarea id="data" v-model="data" required></textarea>
			</div>
			<button type="submit" class="btn btn-primary">Envoyer</button>
		</form>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from 'vue-router';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const title = ref("");
const description = ref("");
const author = ref("");
const category = ref("");
const categories = ref("");
const application = ref("");
const applications = ref([]);
const data = ref("");
const errorMessage = ref(null);
const successMessage = ref(null);
const router = useRouter();
const quillEditor = ref(null);
let quillInstance = null;

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

const fetchApplications = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/applications`);
		if (!response.ok) {
			throw new Error('Failed to fetch applications');
		}
		const data = await response.json();
		applications.value = data;
	} catch (error) {
		errorMessage.value = error.message;
	}
};

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
				description: quillInstance.root.innerHTML,
				author: author.value,
				category: category.value,
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
		category.value = "";
		data.value = "";

		// Redirect to the publications list page
		router.push('/publications');
	} catch (error) {
		errorMessage.value = error.message;
		successMessage.value = null;
	}
};

onMounted(() => {
	fetchCategories();
	fetchApplications();
	quillInstance = new Quill(quillEditor.value, {
		theme: 'snow'
	});
});

onBeforeUnmount(() => {
	if (quillInstance) {
		quillInstance = null;
	}
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

.quill-editor {
	height: 200px;
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

.mandatory {
	color: red;
}

.success {
	color: green;
	margin-bottom: 15px;
}
</style>