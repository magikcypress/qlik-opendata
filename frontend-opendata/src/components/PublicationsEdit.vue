<template>
	<div class="header">
		<h2>Publication Editions</h2>
		<a href="/publications" class="btn btn-secondary">Retour</a>
	</div>
	<div class="publication-form">

		<div v-if="loadError" class="error">{{ loadError }}</div>
		<div v-if="errorMessage" class="error">{{ errorMessage }}</div>
		<div v-if="successMessage" class="success">{{ successMessage }}</div>
		<form @submit.prevent="submitPublication">
			<!-- Application -->
			<div class="form-group">
				<label for="application">Application <span class="mandatory">*</span></label>
				<select id="application" v-model="application" required>
					<option v-for="app in applications" :key="app._id" :value="app.name">{{ app.name }}</option>
				</select>
			</div>

			<!-- Title -->
			<div class="form-group">
				<label for="title">Titre <span class="mandatory">*</span></label>
				<input type="text" id="title" v-model="title" required />
			</div>

			<!-- Description -->
			<div class="form-group">
				<label for="description">Description <span class="mandatory">*</span></label>
				<div class="editor-container">
					<div ref="quillEditor" class="quill-editor"></div>

					<WidgetObjects @insert-cell="insertCellIntoQuill" :quill-instance="quillInstance"
						:application="application" />
				</div>
			</div>

			<!-- Author -->
			<div class="form-group">
				<label for="author">Auteur <span class="mandatory">*</span></label>
				<input type="text" id="author" v-model="author" required />
			</div>

			<!-- Category -->
			<div class="form-group">
				<label for="category">Categorie <span class="mandatory">*</span></label>
				<select id="category" v-model="category" required>
					<option v-for="cat in categories" :key="cat._id" :value="cat.title">{{ cat.title }}</option>
				</select>
			</div>

			<!-- Data -->
			<div class="form-group">
				<label for="data">Source des données</label>
				<textarea id="data" v-model="data" required></textarea>
			</div>

			<!-- Submit -->
			<button type="submit" class="btn btn-primary">Envoyer</button>
		</form>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import { loadQlikScriptAnon } from "@/utils/utils";
import WidgetObjects from "./widgetsObjects.vue";

// Reactive variables
const title = ref("");
const description = ref("");
const author = ref("");
const category = ref("");
const categories = ref([]);
const application = ref("");
const applications = ref([]);
const data = ref("");
const errorMessage = ref(null);
const successMessage = ref(null);
const loadError = ref(null);
const quillEditor = ref(null);
const quillInstance = ref(null);

console.log("Valeur de application dans le parent :", application);

// Router and route
const router = useRouter();
const route = useRoute();

// Environment variables
const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_ANON_CLIENT_ID;

// Fetch categories
const fetchCategories = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/categories`);
		if (!response.ok) throw new Error("Failed to fetch categories");
		categories.value = await response.json();
	} catch (error) {
		errorMessage.value = error.message;
	}
};

// Fetch applications
const fetchApplications = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/applications`);
		if (!response.ok) throw new Error("Failed to fetch applications");
		applications.value = await response.json();
	} catch (error) {
		errorMessage.value = error.message;
	}
};

// Fetch publication
const fetchPublication = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/publications/${route.params.id}`);
		if (!response.ok) throw new Error("Failed to fetch publication");
		const publication = await response.json();
		title.value = publication.title;
		description.value = publication.description;
		author.value = publication.author;
		category.value = publication.category;
		application.value = publication.application;
		data.value = publication.data;
		if (quillInstance.value) {
			quillInstance.value.root.innerHTML = publication.description;
		}
	} catch (error) {
		loadError.value = error.message;
	}
};

// Submit publication
const submitPublication = async () => {
	if (!title.value || !author.value || !category.value || !data.value) {
		errorMessage.value = "Title, Author, and Data fields are required.";
		return;
	}

	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/publications/${route.params.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: title.value,
				description: quillInstance.value.root.innerHTML,
				author: author.value,
				category: category.value,
				application: application.value,
				data: data.value,
				active: true,
			}),
		});

		if (!response.ok) throw new Error("Failed to update publication");

		successMessage.value = "Publication updated successfully!";
		errorMessage.value = null;
		router.push("/publications");
	} catch (error) {
		errorMessage.value = error.message;
		successMessage.value = null;
	}
};

// Insert cell into Quill editor
const insertCellIntoQuill = (cellName) => {
	if (!quillInstance.value) {
		console.error("Quill instance is not initialized");
		return;
	}
	const range = quillInstance.value.getSelection();
	if (range) {
		const embedHtml = `<qlik-embed ref="kpi" ui="analytics/chart" app-id="${import.meta.env.VITE_QLIK_APP_ID}" object-id="${cellName}"></qlik-embed>`;
		quillInstance.value.clipboard.dangerouslyPasteHTML(range.index, embedHtml);
	}
};

// Lifecycle hooks
onMounted(() => {
	fetchCategories();
	fetchApplications();
	fetchPublication();
	loadQlikScriptAnon(tenantUrl, qlikClientId);

	quillInstance.value = new Quill(quillEditor.value, {
		modules: { toolbar: [["bold", "italic", "underline"], ["link", "image"]] },
		theme: "snow",
	});
});

onBeforeUnmount(() => {
	if (quillInstance.value) quillInstance.value = null;
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
	height: 400px;
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