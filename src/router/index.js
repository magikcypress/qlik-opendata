import { createRouter, createWebHistory } from 'vue-router'
import Sheets from '@/components/Sheets.vue'

import { useAuth0 } from '@auth0/auth0-vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: Sheets
		},
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

				logout({
					returnTo: window.location.origin
				});
			}
		}
	],
})

export default router
