<template>
	<div class="wrapper">
		<header>
			<nav>
				<img :src="Logo" alt="Logo" class="logo" />
				<RouterLink to="/">Home</RouterLink>
				<RouterLink v-if="!isAuthenticated" to="/login">Login with Auth0</RouterLink>
				<RouterLink v-if="isAuthenticated" to="/dashboard">Dashboard</RouterLink>
				<RouterLink v-if="isAuthenticated" to="/logout">Logout</RouterLink>
			</nav>
		</header>

		<div class="main-content">
			<aside class="sidebar">
				<h2>Menu</h2>
				<ul>
					<li><a href="#" @click.prevent="toggleSection('sheets')" class="clickable">Sheets</a></li>
					<li><a href="#" @click.prevent="toggleSection('objects')" class="clickable">Objects</a></li>
					<li><a href="#" @click.prevent="toggleSection('dimensions')" class="clickable">Dimensions</a></li>
					<li><a href="#" @click.prevent="toggleSection('measures')" class="clickable">Measures</a></li>
				</ul>
			</aside>

			<section class="content">
				<h1>Qlik Sense Dashboard</h1>
				<qlik-embed ui="analytics/selections" :app-id="qlikAppId"></qlik-embed>
				<div v-if="activeSection === 'sheets'">
					<Sheets :activeSheet="activeSheet" @toggleKpi="toggleKpi" />
				</div>
				<div v-if="activeSection === 'objects'">
					<Objects />
				</div>
				<div v-if="activeSection === 'dimensions'">
					<Dimensions />
				</div>
				<div v-if="activeSection === 'measures'">
					<Measures />
				</div>
				<div v-if="activeSheet">
					<qlik-embed ref="kpi" ui="analytics/sheet" :app-id="qlikAppId"
						:object-id="activeSheet"></qlik-embed>
				</div>
			</section>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue';
import Sheets from '@/components/sheets.vue';
import Objects from '@/components/objects.vue';
import Dimensions from '@/components/dimensions.vue';
import Measures from '@/components/measures.vue';
import Logo from '@/assets/logo.png';

const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;

export default {
	name: 'App',
	components: {
		Sheets,
		Objects,
		Dimensions,
		Measures
	},
	setup() {
		const activeSection = ref(null);
		const activeSheet = ref(null);

		const toggleSection = (section) => {
			activeSection.value = activeSection.value === section ? null : section;
		};

		const toggleKpi = (sheetId) => {
			activeSheet.value = activeSheet.value === sheetId ? null : sheetId;
		};

		return { Logo, activeSection, toggleSection, activeSheet, toggleKpi };
	}
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
	margin: 0 auto 1rem;
}

nav {
	display: flex;
	justify-content: center;
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