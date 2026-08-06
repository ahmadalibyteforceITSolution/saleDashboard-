<template>
  <header class="app-navbar glass-panel">
    <!-- Global Quick Search Input -->
    <div class="search-container">
      <Search :size="18" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search SKU, Product, Serial No (e.g. SN-MAC), Invoice..."
        class="search-input"
        @focus="showSearchResults = true"
        @blur="handleSearchBlur"
      />
      <!-- Dropdown Results Preview -->
      <div v-if="showSearchResults && searchQuery.trim()" class="search-results-popover glass-panel">
        <div class="search-section-title">SEARCH RESULTS</div>
        
        <div v-if="filteredProducts.length" class="result-group">
          <div class="result-group-header">Products</div>
          <div
            v-for="prod in filteredProducts.slice(0, 3)"
            :key="prod.id"
            class="result-item"
            @click="navigateTo('/inventory')"
          >
            <Package :size="14" />
            <span>{{ prod.name }}</span>
            <span class="font-mono text-muted">{{ prod.sku }}</span>
          </div>
        </div>

        <div v-if="filteredSerials.length" class="result-group">
          <div class="result-group-header">Serial Numbers</div>
          <div
            v-for="serial in filteredSerials.slice(0, 3)"
            :key="serial.serialCode"
            class="result-item"
            @click="navigateTo('/serials')"
          >
            <QrCode :size="14" />
            <span class="font-mono text-primary">{{ serial.serialCode }}</span>
            <span :class="['badge', serial.status === 'Available' ? 'badge-success' : 'badge-neutral']">{{ serial.status }}</span>
          </div>
        </div>

        <div v-if="!filteredProducts.length && !filteredSerials.length" class="no-results">
          No records matching "{{ searchQuery }}"
        </div>
      </div>
    </div>

    <!-- Right Header Actions -->
    <div class="header-actions">
      <!-- Locked Active Role Badge (Strict Security - Cannot be changed from Navbar) -->
      <div class="active-role-badge">
        <span class="role-title-label">SECURE ROLE:</span>
        <span :class="['badge', `badge-${authStore.user?.badgeColor || 'purple'}`]">
          <Crown v-if="authStore.isSuperAdmin" :size="12" />
          <ShieldAlert v-else-if="authStore.isAdmin" :size="12" />
          <User v-else :size="12" />
          {{ authStore.user?.role.toUpperCase() }}
        </span>
      </div>

      <!-- System Health Indicator -->
      <div class="health-pill" title="SuperAdmin Financial & Audit Balance Status">
        <Activity :size="14" class="text-success" />
        <span class="font-mono text-success">98.4% BALANCED</span>
      </div>

      <!-- Notifications Bell Popover -->
      <div class="notifications-wrapper">
        <button class="btn-icon btn-ghost relative" @click="toggleNotifications">
          <Bell :size="19" />
          <span v-if="unreadCount" class="notification-dot"></span>
        </button>

        <div v-if="showNotifications" class="notifications-popover glass-panel">
          <div class="popover-header">
            <span>System Alerts & Notifications</span>
            <span class="badge badge-purple">{{ unreadCount }} New</span>
          </div>

          <div class="notifications-list">
            <div
              v-for="log in dataStore.auditLogs.slice(0, 5)"
              :key="log.id"
              class="notification-item"
            >
              <div class="notif-icon">
                <AlertTriangle v-if="log.severity === 'warning'" :size="15" class="text-warning" />
                <Info v-else :size="15" class="text-info" />
              </div>
              <div class="notif-content">
                <div class="notif-title">{{ log.action }}</div>
                <div class="notif-details">{{ log.details }}</div>
                <div class="notif-time">{{ log.timestamp }} • {{ log.user }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import {
  Search,
  Package,
  QrCode,
  Activity,
  Bell,
  AlertTriangle,
  Info,
  Crown,
  ShieldAlert,
  User
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const router = useRouter()

const searchQuery = ref('')
const showSearchResults = ref(false)
const showNotifications = ref(false)

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase()
  return dataStore.products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
})

const filteredSerials = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase()
  return dataStore.serials.filter(s => s.serialCode.toLowerCase().includes(q) || (s.customer && s.customer.toLowerCase().includes(q)))
})

const unreadCount = computed(() => dataStore.auditLogs.filter(l => l.severity === 'warning').length)

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
}

function handleSearchBlur() {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

function navigateTo(path) {
  router.push(path)
  showSearchResults.value = false
  searchQuery.value = ''
}
</script>

<style scoped>
.app-navbar {
  height: 68px;
  padding: 0 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  border-radius: 0;
  position: sticky;
  top: 0;
  z-index: 90;
  background: rgba(11, 15, 25, 0.85);
}

[data-theme="light"] .app-navbar {
  background: rgba(255, 255, 255, 0.9);
}

.search-container {
  position: relative;
  width: 380px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-subtle);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.55rem 0.9rem 0.55rem 2.3rem;
  background: var(--bg-dark-800);
  border: 1px solid var(--border-color-strong);
  border-radius: var(--radius-full);
  color: var(--text-main);
  font-size: 0.85rem;
  transition: var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.search-results-popover {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: var(--bg-dark-800);
  border: 1px solid var(--border-color-strong);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  z-index: 200;
  box-shadow: var(--shadow-lg);
}

.search-section-title {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-subtle);
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.result-group-header {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0.4rem 0 0.2rem 0;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.82rem;
  transition: var(--transition-fast);
}

.result-item:hover {
  background: rgba(99, 102, 241, 0.1);
}

.no-results {
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: 0.5rem;
  text-align: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.active-role-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-card);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color-strong);
  box-shadow: var(--shadow-sm);
}

.role-title-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--text-subtle);
  letter-spacing: 0.05em;
}

.health-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}

.notifications-wrapper {
  position: relative;
}

.notification-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--danger);
  border-radius: 50%;
}

.notifications-popover {
  position: absolute;
  right: 0;
  top: 120%;
  width: 340px;
  background: var(--bg-dark-800);
  border: 1px solid var(--border-color-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 200;
}

.popover-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 700;
}

.notifications-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-line);
  transition: var(--transition-fast);
}

.notification-item:hover {
  background: rgba(15, 23, 42, 0.05);
}

.notif-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-main);
}

.notif-details {
  font-size: 0.73rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.notif-time {
  font-size: 0.65rem;
  color: var(--text-subtle);
  margin-top: 4px;
}
</style>
