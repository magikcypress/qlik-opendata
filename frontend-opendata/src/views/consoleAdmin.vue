<template>
	<div v-if="isAuthenticated" class="wrapper">
		<div class="header">
			<menuNav />
		</div>
		<section class="content">
			<qlik-embed ref="console" ui="analytics/sheet" :app-id="qlikAppIdHome" object-id="CMUJpN" />
		</section>
	</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import menuNav from '@/views/menuNav.vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { loadQlikScript } from '@/utils/utils'

const qlikAppIdHome = import.meta.env.VITE_QLIK_APP_ID_HOME
const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_ANON_CLIENT_ID
const redirectUrl = import.meta.env.VITE_QLIK_REDIRECT_URI

export default {
	name: 'ConsoleAdmin',
	components: {
		menuNav,
	},
	setup() {
		const { isAuthenticated } = useAuth0()
		const activeSection = ref(null)
		const activeSheet = ref(null)

		const toggleSection = section => {
			activeSection.value =
				activeSection.value === section ? null : section
		}

		const toggleKpi = sheetId => {
			activeSheet.value = activeSheet.value === sheetId ? null : sheetId
		}

		onMounted(() => {
			loadQlikScript(tenantUrl, qlikClientId, redirectUrl)
		})

		return {
			isAuthenticated,
			activeSection,
			toggleSection,
			activeSheet,
			toggleKpi,
			qlikAppIdHome
		}
	},
}
</script>

<style scoped>
.content {
	padding: 20px;
}

.content h1 {
	margin-top: 0;
}
</style>