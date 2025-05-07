import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { createAuth0 } from '@auth0/auth0-vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
	faPlus,
	faMinus,
	faTrash,
	faShoppingBasket,
	faComment,
	faClose,
	faInfoCircle,
	faChevronDown,
	faChevronRight,
	faClipboard,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
	faPlus,
	faMinus,
	faTrash,
	faShoppingBasket,
	faComment,
	faClose,
	faInfoCircle,
	faChevronDown,
	faChevronRight,
	faClipboard
)

const app = createApp(App)
app.config.compilerOptions.isCustomElement = tag => tag.startsWith('qlik-embed')

app.use(
	createAuth0({
		domain: import.meta.env.VITE_AUTH0_DOMAIN,
		clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
		authorizationParams: {
			redirect_uri: window.location.origin,
		},
		cacheLocation: 'localstorage',
	}),
)

app.use(createPinia())
app.use(router)
app.use(FloatingVue)
app.use(ElementPlus)
app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')
