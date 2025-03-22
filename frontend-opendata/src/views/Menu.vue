<template>
	<div class="navbar">
		<el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect">
			<el-menu-item index="1">
				<RouterLink to="/category">Categories</RouterLink>
			</el-menu-item>
			<el-menu-item index="2">
				<RouterLink to="/publications">Publications</RouterLink>
			</el-menu-item>
			<el-menu-item index="3">
				<RouterLink to="/applications">Applications</RouterLink>
			</el-menu-item>
			<el-menu-item index="4">
				<RouterLink to="/sheets">Feuilles</RouterLink>
			</el-menu-item>
			<el-menu-item index="5">
				<RouterLink to="/objects">Objets</RouterLink>
			</el-menu-item>
			<el-menu-item index="6">
				<RouterLink to="/dimensions">Dimensions</RouterLink>
			</el-menu-item>
			<el-menu-item index="7">
				<RouterLink to="/measures">Mesures</RouterLink>
			</el-menu-item>
		</el-menu>
	</div>
</template>

<script setup>
import { ref } from 'vue';

const activeIndex = ref('1');

const handleSelect = (key, keyPath) => {
	console.log(key, keyPath);
};
</script>

<style scoped>
.navbar {
	padding: 1rem;
	margin-bottom: 10px;
}

.el-menu-item {
	color: white;
}

.el-menu-item:hover {
	background-color: #495057;
}

.el-menu-item.is-active a {
	color: black;
}
</style>