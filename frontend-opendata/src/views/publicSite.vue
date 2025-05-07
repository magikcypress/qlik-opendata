<template>
	<div>
		<h2>Qlik en quelques chiffres...</h2>
		<el-row>
			<el-col :span="24" style="height: 400px">
				<qlik-embed ref="home" ui="analytics/sheet" app-id="3ab28c9d-56e6-40d8-8931-8f80fe76dbae"
					object-id="PjmFr" />
			</el-col>
		</el-row>

		<el-row>
			<el-col :span="24">
				<PublicPublicationsList />
			</el-col>
		</el-row>
		<!-- <el-row>
			<el-col :span="24">
				<PublicSheets />
			</el-col>
		</el-row> -->
	</div>
</template>

<script>
import { onMounted } from 'vue'
import { loadQlikScriptAnon } from '@/utils/utils'
// import PublicSheets from '@/components/public/pubSheets.vue'
import PublicPublicationsList from '@/components/public/pubPublicationsList.vue'

const tenantUrl = import.meta.env.VITE_QLIK_TENANT_URL
const qlikClientId = import.meta.env.VITE_QLIK_AUTH0_ANON_CLIENT_ID
const qlikEmbedAccessCode = import.meta.env.VITE_QLIK_EMBEDDED_CODE_HOME

import Picture from '@/assets/home-design.png'

export default {
	name: 'PublicSite',
	components: {
		PublicPublicationsList,
	},
	data() {
		return {
			Picture,
		}
	},
	methods: {
        initializeQlik() {
            // Appel direct à la fonction loadQlikScriptAnon
            loadQlikScriptAnon(tenantUrl, qlikClientId, qlikEmbedAccessCode)
        },
    },
    created() {
        // Appel automatique lors de la création du composant
        this.initializeQlik()
    },
}

</script>

<style scoped>
h1 {
	font-size: 4rem;
	letter-spacing: -0.2rem;
	line-height: 1;
	margin-top: 20px;
	margin-bottom: 20px;
}

.green {
	color: rgb(0, 137, 54);
}

.title-1 {
	font-size: 1.5rem;
}

.ep-img {
	width: 100%;
}

.el-row {
	margin-bottom: 20px;
}

.el-row:last-child {
	margin-bottom: 0;
}

.el-col {
	border-radius: 4px;
}

.grid-content {
	border-radius: 4px;
	min-height: 36px;
}
</style>
