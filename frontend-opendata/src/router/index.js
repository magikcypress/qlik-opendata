import { createRouter, createWebHistory } from 'vue-router';
import Console from '@/views/Console.vue';
import Public from '@/views/Public.vue';
import PublicationsList from '@/components/publicationsList.vue';
import PublicationsAdd from '@/components/publicationsAdd.vue';
import PublicationsEdit from '@/components/publicationsEdit.vue';
import CategoryList from '@/components/CategoryList.vue';
import CategoryAdd from '@/components/CategoryAdd.vue';
import CategoryEdit from '@/components/CategoryEdit.vue';

import { useAuth0 } from '@auth0/auth0-vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'public',
			component: Public
		},
		{
			path: '/console',
			name: 'console',
			component: Console
		},
		{ path: '/publications', component: PublicationsList },
		{ path: '/publicationsadd', component: PublicationsAdd },
		{ path: '/publications/edit/:id', component: PublicationsEdit },
		{ path: '/', redirect: '/publications' },
		{ path: '/category', component: CategoryList },
		{ path: '/categoryadd', component: CategoryAdd },
		{ path: '/category/edit/:id', component: CategoryEdit },
		{ path: '/', redirect: '/category' },
		{
			path: '/login',
			name: 'login',
			beforeEnter: (to, from, next) => {
				const { loginWithRedirect } = useAuth0();
				loginWithRedirect();
			}
		},
		{
			path: '/logout',
			name: 'logout',
			beforeEnter: (to, from, next) => {
				const { logout } = useAuth0();
				logout({ returnTo: window.location.origin });
			}
		}
	]
});

export default router;