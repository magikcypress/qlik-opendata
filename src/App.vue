<template>
	<div id="app">
		<h1>Qlik Sense Dashboard</h1>
		<div class="columns">
			<div class="left-column">
				<Sheets />
				<Objects />
			</div>
			<div class="right-column">
				<Dimensions />
				<Measures />
			</div>
		</div>
	</div>
</template>

<script>
import Sheets from '@/components/sheets.vue';
import Objects from '@/components/objects.vue';
import Dimensions from '@/components/dimensions.vue';
import Measures from '@/components/measures.vue';

export default {
	name: 'App',
	components: {
		Sheets,
		// Objects,
		// Dimensions,
		// Measures
	}
}
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

.columns {
	display: flex;
	justify-content: space-between;
	margin-top: 20px;
}

.left-column {
	width: 65%;
	margin-right: 15px;
}

.right-column {
	width: 45%;
	margin-left: 15px;
}

.sheet {
	width: 100%;
}
</style>