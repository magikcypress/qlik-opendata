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
				<div class="objects-container">
					<WidgetObjects @insert-cell="insertCellIntoQuill" />
				</div>
				<div ref="quillEditor" class="quill-editor"></div>
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from 'vue-router';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import WidgetObjects from './widgetsObjects.vue';

// Définir un format personnalisé pour Quill
const Embed = Quill.import('blots/block/embed');

class QlikEmbed extends Embed {
	static create(value) {
		let node = super.create();
		node.setAttribute('ref', 'kpi');
		node.setAttribute('ui', 'analytics/chart');
		node.setAttribute('app-id', value.appId);
		node.setAttribute('object-id', value.objectId);
		return node;
	}

	static value(node) {
		return {
			appId: node.getAttribute('app-id'),
			objectId: node.getAttribute('object-id')
		};
	}
}

// QlikEmbed.blotName = 'qlik-embed';
QlikEmbed.tagName = 'qlik-embed';
Quill.register(QlikEmbed);

const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;

const title = ref("");
const description = ref("");
const author = ref("");
const category = ref("");
const categories = ref([]);
const data = ref("");
const errorMessage = ref(null);
const successMessage = ref(null);
const loadError = ref(null);
const router = useRouter();
const route = useRoute();
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
		if (quillInstance) {
			quillInstance.root.innerHTML = publication.description;
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
				description: quillInstance.root.innerHTML,
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

// const insertCellIntoQuill = (cellName) => {
// 	const range = quillInstance.getSelection();
// 	if (range) {
// 		quillInstance.insertText(range.index, cellName);
// 	}
// };

const insertCellIntoQuill = (cellName) => {
	const range = quillInstance.getSelection();
	if (range) {
		const embedHtml = `<div class="object-kpi"><qlik-embed ref="kpi" ui="analytics/chart" app-id="${qlikAppId}" object-id="${cellName}"></qlik-embed></div>`;
		quillInstance.clipboard.dangerouslyPasteHTML(range.index, embedHtml);
	}
};

onMounted(() => {
	fetchCategories();
	fetchPublication();

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

	quillInstance = new Quill(quillEditor.value, {
		modules: {
			toolbar: toolbarOptions
		},
		theme: 'snow'
	});

	onBeforeUnmount(() => {
		if (quillInstance) {
			quillInstance = null;
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

.object-qlik {
	height: 400px;
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