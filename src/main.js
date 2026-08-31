import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { setDynamicFavicon } from '@/utils/dynamicTitleManager'
import { useUiStore } from '@/stores/uiStore'

// Intercept window.fetch globally to show loading indicator on POST requests
const originalFetch = window.fetch
window.fetch = async function (...args) {
  const options = args[1]
  const isPost = options && options.method && options.method.toUpperCase() === 'POST'
  let uiStore = null

  if (isPost) {
    try {
      uiStore = useUiStore()
      if (uiStore) {
        uiStore.isGlobalLoading = true
      }
    } catch (e) {
      // Ignored if Pinia/store is not ready yet
    }
  }

  try {
    return await originalFetch(...args)
  } finally {
    if (isPost && uiStore) {
      uiStore.isGlobalLoading = false
    }
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

setDynamicFavicon(0)

app.mount('#app')
