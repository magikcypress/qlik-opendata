<template>
	<div>
		<h1>Public Sheets</h1>
		<PublicPublicationsList />
		<PublicObjects />
		<PublicSheets />
	</div>
</template>

<script>
import PublicSheets from '@/components/public-sheets.vue';
import PublicObjects from '@/components/public-objects.vue';
import PublicPublicationsList from '@/components/public-publicationsList.vue';

export default {
	name: 'Public',
	components: {
		PublicSheets,
		PublicObjects,
		PublicPublicationsList
	}
};
</script>

<style scoped>
h1 {
	text-align: left;
	margin-bottom: 20px;
}
</style>