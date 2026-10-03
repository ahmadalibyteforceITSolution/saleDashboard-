import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { setDynamicFavicon } from '@/utils/dynamicTitleManager'
import { useUiStore } from '@/stores/uiStore'

// Contextual loader title & subtitle generator
function getApiActionContext(url, method) {
  const m = (method || 'GET').toUpperCase()
  const lowerUrl = String(url || '').toLowerCase()

  if (lowerUrl.includes('/sales')) {
    if (m === 'POST') return { title: 'Recording Sale Invoice', subtitle: 'Updating customer balance, inventory stock, and ledger...' }
    if (m === 'PUT') return { title: 'Updating Sale Invoice', subtitle: 'Recalculating items and updating financial records...' }
    if (m === 'DELETE') return { title: 'Reversing Sale Invoice', subtitle: 'Restoring warehouse stock and customer balances...' }
  }
  if (lowerUrl.includes('/purchases')) {
    if (m === 'POST') return { title: 'Registering Purchase Bill', subtitle: 'Adding equipment inventory and updating supplier ledger...' }
    if (m === 'PUT') return { title: 'Updating Purchase Record', subtitle: 'Syncing inward consignment and costing...' }
    if (m === 'DELETE') return { title: 'Cancelling Purchase Bill', subtitle: 'Reversing inventory and ledger entries...' }
  }
  if (lowerUrl.includes('/products') || lowerUrl.includes('/serials')) {
    if (m === 'POST') return { title: 'Saving Medical Equipment', subtitle: 'Registering item catalog, barcodes, and serials...' }
    if (m === 'PUT') return { title: 'Updating Equipment Record', subtitle: 'Synchronizing item specifications across branches...' }
    if (m === 'DELETE') return { title: 'Removing Equipment', subtitle: 'Updating catalog and archive records...' }
  }
  if (lowerUrl.includes('/customers') || lowerUrl.includes('/parties')) {
    if (m === 'POST') return { title: 'Registering Party Account', subtitle: 'Creating customer/supplier profile and credit ledger...' }
    if (m === 'PUT') return { title: 'Updating Account Details', subtitle: 'Updating party terms and contact ledger...' }
  }
  if (lowerUrl.includes('/payments') || lowerUrl.includes('/payments-out')) {
    return { title: 'Processing Voucher Payment', subtitle: 'Recording bank / cash receipt and ledger journal entry...' }
  }
  if (lowerUrl.includes('/transfers')) {
    return { title: 'Dispatching Inter-Branch Transfer', subtitle: 'Relocating medical inventory between warehouse hubs...' }
  }
  if (lowerUrl.includes('/expenses')) {
    return { title: 'Recording Expense Voucher', subtitle: 'Logging operating expenditure and cash voucher...' }
  }
  if (lowerUrl.includes('/reconciliations') || lowerUrl.includes('/audit')) {
    return { title: 'Synchronizing Audit Trails', subtitle: 'Logging verified system operations...' }
  }

  if (m === 'POST' || m === 'PUT' || m === 'PATCH') {
    return { title: 'Saving Changes...', subtitle: 'Securely persisting transaction to server...' }
  }
  if (m === 'DELETE') {
    return { title: 'Deleting Record...', subtitle: 'Updating database and ledger balances...' }
  }

  return { title: 'Processing Request...', subtitle: 'Securely communicating with server...' }
}

// Intercept window.fetch globally to show modern interactive loader on API requests
const originalFetch = window.fetch
window.fetch = async function (...args) {
  const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '')
  const options = args[1] || {}
  const method = (options.method || 'GET').toUpperCase()
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
  const isApi = String(url).includes('/api/')
  const shouldShowLoader = options.showLoader || (isMutating && isApi) || (isMutating && !url.includes('/node_modules'))
  
  let uiStore = null

  if (shouldShowLoader) {
    try {
      uiStore = useUiStore()
      if (uiStore?.startGlobalLoading) {
        const { title, subtitle } = getApiActionContext(url, method)
        uiStore.startGlobalLoading(title, subtitle)
      } else if (uiStore) {
        uiStore.isGlobalLoading = true
      }
    } catch (e) {
      // Ignored if Pinia/store is not ready yet
    }
  }

  try {
    return await originalFetch(...args)
  } finally {
    if (shouldShowLoader && uiStore) {
      if (uiStore.stopGlobalLoading) {
        uiStore.stopGlobalLoading()
      } else {
        uiStore.isGlobalLoading = false
      }
    }
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

setDynamicFavicon(0)

app.mount('#app')
