<template>
	<Menu />
	<div class="wrapper" />
</template>

<script setup>
import Menu from '@/views/menuNav.vue'

nMounted(async () => {
	try {
		const url = `${import.meta.env.VITE_BACKEND_URI}/data/sheets.json`
		const data = await fetchJsonData(url)
		console.log('data:', data)
		if (validateAndRepairJSON(data)) {
			console.log('jsonData:', data)
			qlikData.value = jsonData.value
			jsonError.value = null
		} else {
			jsonError.value = error.value
		}
	} catch (err) {
		console.error('Error loading JSON file:', err)
		loadError.value = 'Error loading JSON file'
	}
})
</script>
