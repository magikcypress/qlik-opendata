<template>
	<div>
		<el-row>
			<el-col :span="24">
				<qlik-embed ref="home" ui="analytics/sheet" :app-id="qlikAppIdHome"
					object-id="67337df6d74d0eec20159270"></qlik-embed>
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

const qlikAppIdHome = import.meta.env.VITE_QLIK_APP_ID_HOME;

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