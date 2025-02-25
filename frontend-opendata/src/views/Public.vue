<template>
	<div>
		<h1>Public Sheets</h1>
		<PublicSheets />
	</div>
</template>

<script>
import PublicSheets from '@/components/public-sheets.vue';

export default {
	name: 'Public',
	components: {
		PublicSheets
	}
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin-bottom: 20px;
}
</style>