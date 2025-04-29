import { createRouter, createWebHistory } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

// Import des vues et composants
import ConsoleAdmin from '@/views/consoleAdmin.vue'
import PublicSite from '@/views/publicSite.vue'
import ApplicationsAnalytics from '@/components/applicationsAnalytics.vue'
import PublicationsList from '@/components/publicationsList.vue'
import PublicationsAdd from '@/components/publicationsAdd.vue'
import PublicationsEdit from '@/components/publicationsEdit.vue'
import CategoryList from '@/components/categoryList.vue'
import CategoryAdd from '@/components/categoryAdd.vue'
import CategoryEdit from '@/components/categoryEdit.vue'
import SheetsAnalytics from '@/components/sheetsAnalytics.vue'
import ObjectsAnalytics from '@/components/objectsAnalytics.vue'
import DimensionsAnalytics from '@/components/dimensionsAnalytics.vue'
import MeasuresAnalytics from '@/components/measuresAnalytics.vue'
import ExportDate from '@/components/exportData.vue'

// Création du routeur
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		// Routes publiques
		{
			path: '/',
			name: 'public',
			component: PublicSite,
		},
		{
			path: '/console',
			name: 'console',
			component: ConsoleAdmin,
		},
		{
			path: '/applications',
			name: 'applications',
			component: ApplicationsAnalytics,
		},
		{
			path: '/publications',
			name: 'publications-list',
			component: PublicationsList,
		},
		{
			path: '/publicationsadd',
			name: 'publications-add',
			component: PublicationsAdd,
		},
		{
			path: '/publications/edit/:id',
			name: 'publications-edit',
			component: PublicationsEdit,
		},
		{
			path: '/category',
			name: 'category-list',
			component: CategoryList,
		},
		{
			path: '/categoryadd',
			name: 'category-add',
			component: CategoryAdd,
		},
		{
			path: '/category/edit/:id',
			name: 'category-edit',
			component: CategoryEdit,
		},
		{
			path: '/sheets',
			name: 'sheets',
			component: SheetsAnalytics,
		},
		{
			path: '/objects',
			name: 'objects',
			component: ObjectsAnalytics,
		},
		{
			path: '/dimensions',
			name: 'dimensions',
			component: DimensionsAnalytics,
		},
		{
			path: '/measures',
			name: 'measures',
			component: MeasuresAnalytics,
		},
		{
			path: '/export',
			name: 'export',
			component: ExportDate,
		},

		// Routes pour l'authentification
		{
			path: '/login',
			name: 'login',
			beforeEnter: () => {
				const { loginWithRedirect } = useAuth0()
				loginWithRedirect()
			},
		},
		{
			path: '/logout',
			name: 'logout',
			beforeEnter: () => {
				const { logout } = useAuth0()
				logout({ returnTo: window.location.origin })
			},
		},

		// Redirections
		{ path: '/publication/:id', redirect: '/publications' },
		{ path: '/', redirect: '/publications' },
	],
})

export default router