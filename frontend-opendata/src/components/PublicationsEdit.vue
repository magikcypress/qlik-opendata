<template>
	<div class="header">
		<h2>Publication Edition</h2>
		<a href="/publications" class="btn btn-secondary">Retour</a>
	</div>
	<div class="publication-form">
		<div v-if="loadError" class="error">{{ loadError }}</div>
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
				<label for="title">Titre <span class="mandatory">*</span></label>
				<input type="text" id="title" v-model="title" required />
			</div>
			<div class="form-group">
				<label for="description">Description <span class="mandatory">*</span></label>
				<div class="editor-container">
					<div ref="quillEditor" class="quill-editor"></div>
					<WidgetObjects @insert-cell="insertCellIntoQuill" :quill-instance="quillInstance" />
				</div>
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
import { useRouter, useRoute } from 'vue-router';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import { loadQlikScriptAnon } from '@/utils/utils';
import WidgetObjects from './widgetsObjects.vue';

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
const router = useRouter();
const route = useRoute();
const quillEditor = ref(null);
const quillInstance = ref(null);

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_ANON_CLIENT_ID;

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
		application.value = publication.application;
		data.value = publication.data;
		if (quillInstance.value) {
			quillInstance.value.root.innerHTML = publication.description;
		}
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
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/publications/${route.params.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title: title.value,
				description: quillInstance.value.root.innerHTML,
				author: author.value,
				category: category.value,
				application: application.value,
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

const insertCellIntoQuill = (cellName) => {
	if (!quillInstance.value) {
		console.error('Quill instance is not initialized');
		return;
	}
	const range = quillInstance.value.getSelection();
	if (range) {
		const embedHtml = `<qlik-embed ref="kpi" ui="analytics/chart" app-id="${import.meta.env.VITE_QLIK_APP_ID}" object-id="${cellName}"></qlik-embed>`;
		quillInstance.value.clipboard.dangerouslyPasteHTML(range.index, embedHtml);
	}
};

onMounted(() => {
	fetchCategories();
	fetchApplications();
	fetchPublication();
	loadQlikScriptAnon(tenantUrl, qlikClientId, applications.eac);
	console.log('applications:', applications.eac);

	const toolbarOptions = [
		[{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
		[{ 'font': [] }],
		[{ 'align': [] }],

		['bold', 'italic', 'underline', 'strike'],        // toggled buttons
		['blockquote', 'code-block'],
		['link', 'image', 'video', 'formula'],

		[{ 'header': 1 }, { 'header': 2 }],               // custom button values
		[{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
		[{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
		[{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
		[{ 'direction': 'rtl' }],                         // text direction

		['clean']                                         // remove formatting button
	];

	quillInstance.value = new Quill(quillEditor.value, {
		modules: {
			toolbar: toolbarOptions
		},
		theme: 'snow'
	});

	onBeforeUnmount(() => {
		if (quillInstance.value) {
			quillInstance.value = null;
		}
	});
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