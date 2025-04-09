<template>
	<div class="wrapper" v-if="isAuthenticated">
		<div class="header">
			<Menu />
		</div>

		<section class="content">
			<qlik-embed ref="console" ui="analytics/sheet" :app-id="qlikAppIdHome" object-id="CMUJpN"></qlik-embed>
		</section>
	</div>
</template>

<script>
import { ref, onMounted } from 'vue';
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

const qlikAppIdHome = import.meta.env.VITE_QLIK_APP_ID_HOME;
const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL;
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_ANON_CLIENT_ID;
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI;

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

onMounted(() => {
	loadQlikScript(tenantUrl, qlikClientId, redirectUrl);
});
</script>

<style scoped>
.content {
	padding: 20px;
}

.content h1 {
	margin-top: 0;
}
</style>