import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useDataStore } from '@/stores/dataStore'
import { setDynamicTitle, setDynamicFavicon } from '@/utils/dynamicTitleManager'

import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import SuperAdminView from '@/views/SuperAdminView.vue'
import InventoryView from '@/views/InventoryView.vue'
import SerialTrackerView from '@/views/SerialTrackerView.vue'
import PurchasingView from '@/views/PurchasingView.vue'
import SalesView from '@/views/SalesView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'
import UniversalSearchView from '@/views/UniversalSearchView.vue'
import CustomerLedgerView from '@/views/CustomerLedgerView.vue'
import PaymentInView from '@/views/PaymentInView.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { title: 'Sign In', public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { title: 'Executive Dashboard' } },
  { path: '/superadmin', name: 'SuperAdmin', component: SuperAdminView, meta: { title: 'SuperAdmin Center' } },
  { path: '/inventory', name: 'Inventory', component: InventoryView, meta: { title: 'Inventory & Storage' } },
  { path: '/serials', name: 'SerialTracker', component: SerialTrackerView, meta: { title: 'Serial Number Registry' } },
  { path: '/purchasing', name: 'Purchasing', component: PurchasingView, meta: { title: 'Purchasing & Imports' } },
  { path: '/sales', name: 'Sales', component: SalesView, meta: { title: 'Sales & Outbound POS' } },
  { path: '/analytics', name: 'Analytics', component: AnalyticsView, meta: { title: 'ERP Reports & Graphs' } },
  { path: '/universal-search', name: 'UniversalSearch', component: UniversalSearchView, meta: { title: '360° Universal Search' } },
  { path: '/customer-ledger', name: 'CustomerLedger', component: CustomerLedgerView, meta: { title: 'Customer Ledger' } },
  { path: '/payments', name: 'PaymentIn', component: PaymentInView, meta: { title: 'Payment In Module' } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach((to) => {
  try {
    const dataStore = useDataStore()
    const alertCount = dataStore.lowStockProducts ? dataStore.lowStockProducts.length : 0
    setDynamicTitle(to.meta?.title || to.name, alertCount)
    setDynamicFavicon(alertCount)
  } catch (e) {
    setDynamicTitle(to.meta?.title || to.name, 0)
    setDynamicFavicon(0)
  }
})

export default router
