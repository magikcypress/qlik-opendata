<template>
	<div class="wrapper">
		<header>
			<nav>
				<img :src="Logo" alt="Logo" class="logo" />
				<RouterLink to="/">Home</RouterLink>
				<RouterLink v-if="!isAuthenticated" to="/login">Login with Auth0</RouterLink>
				<RouterLink v-if="isAuthenticated" to="/console">Console</RouterLink>
				<RouterLink v-if="isAuthenticated" to="/logout">Logout</RouterLink>
			</nav>
		</header>

		<div class="main-content">
			<section class="content">
				<RouterView />
			</section>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import Logo from '@/assets/logo-mini.png';
import { useAuth0 } from '@auth0/auth0-vue';

const { isAuthenticated } = useAuth0();
const activeSection = ref(null);
const activeSheet = ref(null);

const toggleSection = (section) => {
	activeSection.value = activeSection.value === section ? null : section;
};

const toggleKpi = (sheetId) => {
	activeSheet.value = activeSheet.value === sheetId ? null : sheetId;
};
</script>

<style scoped>
.wrapper {
	display: flex;
	flex-direction: column;
	height: 100vh;
}

header {
	background-color: #f8f9fa;
	padding: 1rem;
	text-align: center;
}

.logo {
	display: block;
	width: 100px;
	height: auto;
}

nav {
	display: flex;
	justify-content: left;
	gap: 1rem;
}

.main-content {
	display: flex;
	flex: 1;
}

.sidebar {
	flex: 0 0 250px;
	background-color: #343a40;
	color: white;
	padding: 1rem;
}

.sidebar h2 {
	margin-top: 0;
}

.sidebar ul {
	list-style: none;
	padding: 0;
}

.sidebar li {
	margin: 1rem 0;
}

.sidebar li.clickable {
	cursor: pointer;
}

.sidebar a {
	color: white;
	text-decoration: none;
}

.sidebar a:hover {
	text-decoration: underline;
}

.content {
	flex: 1;
	padding: 1rem;
}

.content h1 {
	margin-top: 0;
}
</style>