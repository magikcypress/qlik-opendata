<template>
	<div class="home">
		<qlik-embed ref="console" ui="analytics/sheet" app-id="3ab28c9d-56e6-40d8-8931-8f80fe76dbae"
			object-id="CMUJpN" />
	</div>
</template>

<script>
export default {
	name: 'HomePage',
}
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
