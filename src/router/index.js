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
import AccountantDashboardView from '@/views/AccountantDashboardView.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { title: 'Sign In', public: true } },
  { path: '/', redirect: '/accountant' },
  { path: '/superadmin', name: 'SuperAdmin', component: SuperAdminView, meta: { title: 'SuperAdmin Center', minLevel: 4 } },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { title: 'Executive Dashboard', minLevel: 3 } },
  { path: '/purchasing', name: 'Purchasing', component: PurchasingView, meta: { title: 'Purchasing & Imports', minLevel: 3 } },
  { path: '/sales', name: 'Sales', component: SalesView, meta: { title: 'Sales & Outbound POS', minLevel: 2 } },
  { path: '/analytics', name: 'Analytics', component: AnalyticsView, meta: { title: 'ERP Reports & Graphs', minLevel: 2 } },
  { path: '/accountant', name: 'AccountantDashboard', component: AccountantDashboardView, meta: { title: 'Accountant Container Hub & Sales', minLevel: 1 } },
  { path: '/inventory', name: 'Inventory', component: InventoryView, meta: { title: 'Inventory & Storage', minLevel: 1 } },
  { path: '/serials', name: 'SerialTracker', component: SerialTrackerView, meta: { title: 'Serial Number Registry', minLevel: 1 } },
  { path: '/universal-search', name: 'UniversalSearch', component: UniversalSearchView, meta: { title: '360° Universal Search', minLevel: 1 } },
  { path: '/customer-ledger', name: 'CustomerLedger', component: CustomerLedgerView, meta: { title: 'Customer Ledger', minLevel: 1 } },
  { path: '/payments', name: 'PaymentIn', component: PaymentInView, meta: { title: 'Payment In Module', minLevel: 1 } },
  { path: '/:pathMatch(.*)*', redirect: '/accountant' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 1. Unauthenticated users cannot view protected routes
  if (!to.meta.public && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (authStore.isAuthenticated) {
    const userRole = authStore.user?.role || 'accountant'
    const homePath = authStore.getDefaultHomeForRole(userRole)

    // 2. Prevent logged-in user from visiting /login
    if (to.path === '/login') {
      return next(homePath)
    }

    // 3. Root path '/' redirects to role-specific authorized home
    if (to.path === '/') {
      return next(homePath)
    }

    // 4. Strict Downward Hierarchy Clearance Check
    const requiredMinLevel = to.meta?.minLevel || 1
    if (authStore.roleLevel < requiredMinLevel) {
      // User role level is insufficient for this page -> redirect to authorized home
      return next(homePath)
    }
  }

  next()
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
