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
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { setDynamicTitle, setDynamicFavicon } from '@/utils/dynamicTitleManager'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import NotificationModal from '@/components/NotificationModal.vue'

const route = useRoute()
const dataStore = useDataStore()

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
