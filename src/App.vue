<template>
  <div v-if="isLoginPage" class="login-layout">
    <router-view />
  </div>
  <div v-else class="app-container">
    <AppSidebar />
    <div class="main-content">
      <AppNavbar />
      <router-view />
    </div>
  </div>

  <!-- Global Modal & Toast Component -->
  <NotificationModal />

  <!-- Global Direct Sale & Purchase Modals (Open anywhere without redirect) -->
  <GlobalSaleModal />
  <GlobalPurchaseModal />

  <!-- Global API Interactive Modern Holographic Loader -->
  <GlobalApiLoader />
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
import GlobalApiLoader from '@/components/GlobalApiLoader.vue'

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
