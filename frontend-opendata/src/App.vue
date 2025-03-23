<template>
	<div class="wrapper">
		<el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
			<el-menu-item>
				<RouterLink to="/">Home</RouterLink>
			</el-menu-item>
			<el-menu-item v-if="!isAuthenticated" index="2">
				<RouterLink to="/login">Login with Auth0</RouterLink>
			</el-menu-item>
			<el-menu-item v-if="isAuthenticated" index="3">
				<RouterLink to="/console">Console</RouterLink>
			</el-menu-item>
			<el-menu-item v-if="isAuthenticated" index="4">
				<RouterLink to="/logout">Logout</RouterLink>
			</el-menu-item>
		</el-menu>

		<div class="main-content">
			<section class="content">
				<RouterView />
			</section>
		</div>

		<el-footer>
			Site OpenData avec Qlik Sense Cloud - MIT Licence
		</el-footer>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import Logo from '@/assets/logo-mini.png';

const { isAuthenticated } = useAuth0();
const activeIndex = ref('1');

const handleSelect = (key, keyPath) => {
	console.log(key, keyPath);
};
</script>

<style scoped>
.wrapper {
	display: flex;
	flex-direction: column;
	height: 100vh;
}

.logo {
	display: block;
	width: 100px;
	height: auto;
}

.main-content {
	display: flex;
	flex: 1;
}

.content {
	flex: 1;
	padding: 1rem;
}

.content h1 {
	margin-top: 0;
}
</style>