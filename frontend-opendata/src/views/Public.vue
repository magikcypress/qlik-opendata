<template>
	<div>
		<el-row>
			<el-col :span="12">
				<div class="grid-content ep-bg-purple">
					<h1>Partout où il y a des données, il y a de la <span class="green">puissance</span></h1>

					<div class="title-1">Qlik® vous aide à utiliser vos données pour résoudre des problèmes, atteindre de nouveaux objectifs et répondre aux besoins critiques de l'entreprise. Tout commence ici. Avec le leader du secteur des solutions d'intégration de données et d'analyse qui soutiennent votre stratégie d'IA.</div>
				</div>
			</el-col>
			<el-col :span="12">
				<img :src="Picture" alt="Design" class="ep-img" />
			</el-col>
		</el-row>

		<el-row>
			<el-col :span="24">
				<PublicPublicationsList />
			</el-col>
		</el-row>
		<el-row>	
			<el-col :span="24">
				<PublicSheets />
			</el-col>	
		</el-row>
	</div>
</template>

<script>
import PublicSheets from '@/components/public/sheets.vue';
import PublicPublicationsList from '@/components/public/publicationsList.vue';

const qlikAppId = import.meta.env.VITE_QLIK_APP_ID;

import Picture from '@/assets/home-design.png';

export default {
	name: 'Public',
	components: {
		PublicSheets,
		PublicPublicationsList
	},
    data() {
        return {
            Picture
        };
    }
};
</script>

<style scoped>
h1 {
	font-size: 4rem;
    letter-spacing: -.2rem;
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

.ep-img	{
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