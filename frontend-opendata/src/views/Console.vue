<template>
	<div class="wrapper" v-if="isAuthenticated">
		<div class="header">
			<Menu />
		</div>

		<section class="content">
			<div v-if="!activeSection">
				<div class="home">
					<h1>Bienvenue sur l'application Qlik OpenData</h1>
					<p>Cette application vous permet de visualiser et d'interagir avec les données de Qlik Sense.</p>
					<h2>Fonctionnalités</h2>
					<ul>
						<li><strong>Publications :</strong> Affiche les différentes publications de données disponibles.
						</li>
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
						<li><strong>Publications :</strong>Cliquez pour afficher les publications de données
							disponibles.</li>
						<li><strong>Sheets :</strong> Cliquez pour afficher les feuilles de données.</li>
						<li><strong>Objects :</strong> Cliquez pour afficher les objets de données.</li>
						<li><strong>Dimensions :</strong> Cliquez pour afficher les dimensions de données.</li>
						<li><strong>Measures :</strong> Cliquez pour afficher les mesures de données.</li>
					</ul>
					<p>Vous devez être connecté pour accéder à certaines fonctionnalités. Utilisez le bouton de
						connexion pour vous authentifier.</p>
				</div>
			</div>

		</section>
	</div>
</template>

<script>
import { ref } from 'vue';
import Home from '@/views/Home.vue';
import Menu from '@/views/Menu.vue';
import Applications from '@/components/applications.vue';
import Sheets from '@/components/sheets.vue';
import Objects from '@/components/objects.vue';
import Dimensions from '@/components/dimensions.vue';
import Measures from '@/components/measures.vue';
import PublicationsList from '@/components/publicationsList.vue';
import CategoryList from '@/components/CategoryList.vue';
import { useAuth0 } from '@auth0/auth0-vue';

export default {
	name: 'Console',
	components: {
		Home,
		Menu,
		Applications,
		CategoryList,
		PublicationsList,
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
.content {
	padding: 20px;
}

.content h1 {
	margin-top: 0;
}
</style>