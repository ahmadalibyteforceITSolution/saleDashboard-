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

  <!-- Global API POST Loader -->
  <div v-if="uiStore.isGlobalLoading" class="global-loader-backdrop">
    <div class="global-loader-container">
      <div class="global-loader-spinner"></div>
      <div class="global-loader-text">PROCESSING REQUEST...</div>
    </div>
  </div>
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

.global-loader-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(11, 15, 25, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.global-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  background: rgba(22, 32, 50, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 3.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.global-loader-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: global-spin 1s linear infinite;
}

@keyframes global-spin {
  to {
    transform: rotate(360deg);
  }
}

.global-loader-text {
  color: var(--text-main);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
}
</style>
