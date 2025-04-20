<template>
	<div class="navbar">
		<el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect">
			<el-menu-item index="/category">
				<RouterLink to="/category">
					Categories
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/publications">
				<RouterLink to="/publications">
					Publications
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/applications">
				<RouterLink to="/applications">
					Applications
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/sheets">
				<RouterLink to="/sheets">
					Feuilles
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/objects">
				<RouterLink to="/objects">
					Objets
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/dimensions">
				<RouterLink to="/dimensions">
					Dimensions
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/measures">
				<RouterLink to="/measures">
					Mesures
				</RouterLink>
			</el-menu-item>
		</el-menu>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeIndex = ref(route.path)

watch(
	() => route.path,
	newPath => {
		activeIndex.value = newPath
	},
)

const handleSelect = key => {
	router.push(key);
}
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
