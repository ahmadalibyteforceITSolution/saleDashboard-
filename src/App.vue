<template>
  <div v-if="isLoginPage" class="login-layout">
    <router-view />
  </div>
  <div v-else class="app-container">
    <AppSidebar />
    <div class="main-content">
      <AppNavbar />
      <div class="flex-1">
        <router-view />
      </div>
      <!-- Global Responsive ERP Footer -->
      <footer class="app-footer px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 mt-8">
        <div class="flex items-center gap-2 flex-wrap text-center sm:text-left justify-center sm:justify-start">
          <span class="font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">MedImage ERP</span>
          <span class="hidden sm:inline text-slate-400">·</span>
          <span>Advanced Medical Equipment Sales, Imports & Inventory Suite</span>
        </div>
        <div class="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            MongoDB Live
          </span>
          <span class="text-slate-400 dark:text-slate-500 font-mono text-[11px]">v2.4.0 · Multi-Depot Synchronized</span>
        </div>
      </footer>
    </div>
  </div>

  <!-- Global Modal & Toast Component -->
  <NotificationModal />

  <!-- Global Direct Sale & Purchase Modals (Open anywhere without redirect) -->
  <GlobalSaleModal />
  <GlobalPurchaseModal />
  <GlobalQuickActionModals />

  <!-- Global API Interactive Modern Holographic Loader -->
  <GlobalApiLoader />

  <!-- Global Command & Shortcuts Slide-Out Sidebar -->
  <ShortcutsSidebar />
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import { setDynamicTitle, setDynamicFavicon } from '@/utils/dynamicTitleManager'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import NotificationModal from '@/components/NotificationModal.vue'
import GlobalSaleModal from '@/components/GlobalSaleModal.vue'
import GlobalPurchaseModal from '@/components/GlobalPurchaseModal.vue'
import GlobalQuickActionModals from '@/components/GlobalQuickActionModals.vue'
import GlobalApiLoader from '@/components/GlobalApiLoader.vue'
import ShortcutsSidebar from '@/components/ShortcutsSidebar.vue'

const route = useRoute()
const dataStore = useDataStore()
const uiStore = useUiStore()

const isLoginPage = computed(() => route.name === 'Login')

watchEffect(() => {
  const pageTitle = route.meta?.title || route.name || 'Executive Dashboard'
  const alertCount = dataStore.lowStockProducts ? dataStore.lowStockProducts.length : 0
  setDynamicTitle(pageTitle, alertCount)
  setDynamicFavicon(alertCount)
})
</script>

<style>
.login-layout {
  min-height: 100vh;
  width: 100%;
}
</style>
