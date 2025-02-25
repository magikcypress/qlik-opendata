<template>
	<div class="wrapper" v-if="isAuthenticated">
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
			<div v-if="!activeSection">
				<div class="home">
					<h1>Bienvenue sur l'application Qlik OpenData</h1>
					<p>Cette application vous permet de visualiser et d'interagir avec les données de Qlik Sense.</p>
					<h2>Fonctionnalités</h2>
					<ul>
						<li><strong>Sheets :</strong> Affiche les différentes feuilles de données disponibles.</li>
						<li><strong>Objects :</strong> Affiche les objets de données disponibles.</li>
						<li><strong>Dimensions :</strong> Affiche les dimensions de données disponibles.</li>
						<li><strong>Measures :</strong> Affiche les mesures de données disponibles.</li>
					</ul>
					<h2>Comment utiliser</h2>
					<p>Pour commencer, utilisez le menu de gauche pour naviguer entre les différentes sections de
						l'application :
					</p>
					<ul>
						<li><strong>Sheets :</strong> Cliquez pour afficher les feuilles de données.</li>
						<li><strong>Objects :</strong> Cliquez pour afficher les objets de données.</li>
						<li><strong>Dimensions :</strong> Cliquez pour afficher les dimensions de données.</li>
						<li><strong>Measures :</strong> Cliquez pour afficher les mesures de données.</li>
					</ul>
					<p>Vous devez être connecté pour accéder à certaines fonctionnalités. Utilisez le bouton de
						connexion pour vous authentifier.</p>
				</div>
			</div>

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
				<qlik-embed ref="kpi" ui="analytics/sheet" :app-id="qlikAppId" :object-id="activeSheet"></qlik-embed>
			</div>

		</section>
	</div>
</template>

<script>
import { ref } from 'vue';
import Home from '@/views/Home.vue';
import Sheets from '@/components/sheets.vue';
import Objects from '@/components/objects.vue';
import Dimensions from '@/components/dimensions.vue';
import Measures from '@/components/measures.vue';
import { useAuth0 } from '@auth0/auth0-vue';

export default {
	name: 'Console',
	components: {
		Home,
		Sheets,
		Objects,
		Dimensions,
		Measures
	},
	setup() {
		const { isAuthenticated } = useAuth0();
		const activeSection = ref(null);
		const activeSheet = ref(null);

		const toggleSection = (section) => {
			activeSection.value = activeSection.value === section ? null : section;
		};

		const toggleKpi = (sheetId) => {
			activeSheet.value = activeSheet.value === sheetId ? null : sheetId;
		};

		return { isAuthenticated, activeSection, toggleSection, activeSheet, toggleKpi };
	}
};
</script>

<style scoped>
.wrapper {
	display: flex;
	flex-flow: row wrap;
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