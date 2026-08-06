import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import SuperAdminView from '@/views/SuperAdminView.vue'
import InventoryView from '@/views/InventoryView.vue'
import SerialTrackerView from '@/views/SerialTrackerView.vue'
import PurchasingView from '@/views/PurchasingView.vue'
import SalesView from '@/views/SalesView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/superadmin', name: 'SuperAdmin', component: SuperAdminView, meta: { requiresSuperAdmin: true } },
  { path: '/inventory', name: 'Inventory', component: InventoryView },
  { path: '/serials', name: 'SerialTracker', component: SerialTrackerView },
  { path: '/purchasing', name: 'Purchasing', component: PurchasingView },
  { path: '/sales', name: 'Sales', component: SalesView },
  { path: '/analytics', name: 'Analytics', component: AnalyticsView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    alert('Access Restricted: SuperAdmin privileges are required to open the Check & Balance Control Center.')
    next('/dashboard')
  } else {
    next()
  }
})

export default router
