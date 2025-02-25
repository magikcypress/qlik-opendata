<template>
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
		<p>Pour commencer, utilisez le menu de gauche pour naviguer entre les différentes sections de l'application :
		</p>
		<ul>
			<li><strong>Sheets :</strong> Cliquez pour afficher les feuilles de données.</li>
			<li><strong>Objects :</strong> Cliquez pour afficher les objets de données.</li>
			<li><strong>Dimensions :</strong> Cliquez pour afficher les dimensions de données.</li>
			<li><strong>Measures :</strong> Cliquez pour afficher les mesures de données.</li>
		</ul>
		<p>Vous devez être connecté pour accéder à certaines fonctionnalités. Utilisez le bouton de connexion pour vous
			authentifier.</p>
	</div>
</template>

<script>
export default {
	name: 'Home'
};
</script>

<style scoped>
.home {
	padding: 2rem;
}

h1 {
	text-align: center;
	margin-bottom: 1rem;
}

h2 {
	margin-top: 2rem;
}

ul {
	list-style: none;
	padding: 0;
}

ul li {
	margin: 0.5rem 0;
}

p {
	margin: 1rem 0;
}
</style>