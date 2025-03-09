<template>
	<div>
		<h1>Category List</h1>
		<div class="header">
			<h2>Publications</h2>
			<div class="add-new-category">
				<router-link to="/categoryadd" class="btn btn-primary">Add New Category</router-link>
			</div>
		</div>
		<div v-if="categories.length > 0">
			<ul>
				<li v-for="category in categories" :key="category._id">
					<div class="category-header">
						<h3>{{ category.title }}</h3>
						<div class="buttons">
							<router-link :to="`/category/edit/${category._id}`"
								class="btn btn-secondary">Edit</router-link>
							<button @click="deleteCategory(category._id)" class="btn btn-danger">Delete</button>
						</div>
					</div>
					<p>{{ category.description }}</p>
					<p>Created At: {{ new Date(category.createdAt).toLocaleString() }}</p>
					<p>Updated At: {{ new Date(category.updatedAt).toLocaleString() }}</p>
				</li>
			</ul>
		</div>
		<div v-else>
			<p class="info-message">No categories available.</p>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const categories = ref([]);

const fetchCategories = async () => {
	try {
		const response = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/categories`);
		categories.value = response.data;
	} catch (error) {
		console.error('Error fetching categories:', error);
	}
};

const toggleActive = async (id) => {
	try {
		const category = categories.value.find(cat => cat._id === id);
		if (category) {
			await axios.put(`${import.meta.env.VITE_BACKEND_URI}/categories/${id}/active`);
			category.active = !category.active;
		}
	} catch (error) {
		console.error('Error toggling active state:', error);
	}
};

const deleteCategory = async (id) => {
	try {
		await axios.delete(`${import.meta.env.VITE_BACKEND_URI}/categories/${id}`);
		categories.value = categories.value.filter(cat => cat._id !== id);
	} catch (error) {
		console.error('Error deleting category:', error);
	}
};

onMounted(() => {
	fetchCategories();
});
</script>

<style scoped>
h1 {
	text-align: center;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.category-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
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

.info-message {
	background-color: #fff3cd;
	color: #856404;
	border: 1px solid #ffeeba;
	padding: 10px;
	border-radius: 5px;
	margin: 10px 0;
	font-weight: bold;
}
</style>