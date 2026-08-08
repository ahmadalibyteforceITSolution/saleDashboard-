import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { setDynamicFavicon } from '@/utils/dynamicTitleManager'

const app = createApp(App)

app.use(createPinia())
app.use(router)

setDynamicFavicon(0)

app.mount('#app')
