<template>
	<div class="navbar">
		<el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect" class="el-menu">
			
			<span class="green"><img src="@/assets/logo-qlik.svg" alt="Qlik Logo" class="qlik-logo" /></span>
			
			<el-menu-item index="/applications" class="green">
				<RouterLink to="/applications">
					Applications
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/sheets" class="green">
				<RouterLink to="/sheets">
					Feuilles
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/objects" class="green">
				<RouterLink to="/objects">
					Objets
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/dimensions" class="green">
				<RouterLink to="/dimensions">
					Dimensions
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/measures" class="green">
				<RouterLink to="/measures">
					Mesures
				</RouterLink>
			</el-menu-item>

			<span class="grey"></span>
			
			<el-menu-item index="/category" class="grey">
				<RouterLink to="/category">
					Categories
				</RouterLink>
			</el-menu-item>
			<el-menu-item index="/publications" class="grey">
				<RouterLink to="/publications">
					Publications
				</RouterLink>
			</el-menu-item>
		</el-menu>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Location } from '@element-plus/icons-vue'

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
	padding: 0 1rem;
	margin-bottom: 10px;
}

.qlik-logo {
	padding-top: 5px;
	padding-left: 5px;
    height: 20px;
    margin-right: 10px;
}

.green {
	background-color:rgb(192, 234, 177);
	border: none;
}

.grey {
	background-color: #f9f9f9;
	border: none;
	width: auto;
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
