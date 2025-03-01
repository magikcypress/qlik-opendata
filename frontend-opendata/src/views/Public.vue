<template>
	<div>
		<h1>Public Sheets</h1>
		<PublicObjects />
		<PublicSheets />
	</div>
</template>

<script>
import PublicSheets from '@/components/public-sheets.vue';
import PublicObjects from '@/components/public-objects.vue';

export default {
	name: 'Public',
	components: {
		PublicSheets,
		PublicObjects
	}
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin-bottom: 20px;
}
</style>