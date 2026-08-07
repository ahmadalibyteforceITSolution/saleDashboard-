<template>
  <header class="navbar">
    <div class="navbar-left flex-align gap-2">
      <!-- Mobile Menu Toggle Button -->
      <button class="mobile-menu-btn icon-btn" @click="uiStore.toggleMobileSidebar" title="Toggle Navigation Menu">
        <Menu :size="18" />
      </button>

      <!-- Global Search Input -->
      <div class="search-box">
        <Search class="search-icon" :size="16" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search SKU, Product, Serial No (e.g. SN-MAC), Invoice..."
          class="form-input search-input"
          @keyup.enter="handleGlobalSearch"
        />
      </div>
    </div>

    <div class="navbar-actions">
      <!-- Role Indicator Pill -->
      <div class="role-pill">
        <span class="role-label">SECURE ROLE:</span>
        <span :class="['badge', `badge-${authStore.user?.badgeColor || 'purple'}`]">
          <Crown v-if="authStore.isSuperAdmin" :size="12" />
          <ShieldAlert v-else-if="authStore.isAdmin" :size="12" />
          <User v-else :size="12" />
          <span class="role-text">{{ authStore.user?.role.toUpperCase() }}</span>
        </span>
      </div>

      <!-- Financial Reconciliation Pill -->
      <div class="reconcile-pill">
        <ShieldCheck :size="14" class="text-success" />
        <span class="font-mono text-xs reconcile-text">{{ dataStore.checkAndBalance.healthScore }}% BALANCED</span>
      </div>

      <!-- Notifications Bell Icon Dropdown -->
      <div class="notification-wrapper">
        <button class="icon-btn btn-bell" @click="toggleNotifications" title="System Notifications">
          <Bell :size="16" />
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </button>

        <!-- Notifications Dropdown Menu -->
        <div v-if="showNotifications" class="notification-dropdown glass-panel">
          <div class="notification-header flex-between">
            <h4 class="font-bold text-sm text-main">System Alerts & Notifications</h4>
            <div class="flex-align gap-2">
              <span v-if="unreadCount > 0" class="badge badge-purple font-mono">{{ unreadCount }} NEW</span>
              <button v-if="notificationsList.length" class="btn btn-xs btn-ghost text-xs text-primary" @click="markAllAsRead">
                Mark All Read
              </button>
            </div>
          </div>

          <div class="notification-body">
            <div v-if="!notificationsList.length" class="empty-notifications p-4 text-center text-xs text-subtle">
              No recent notifications or system alerts.
            </div>

            <div
              v-for="notif in notificationsList"
              :key="notif.id"
              :class="['notification-item', notif.read ? 'read-item' : 'unread-item']"
              @click="markAsRead(notif)"
            >
              <div class="notif-icon-box">
                <AlertTriangle v-if="notif.severity === 'warning'" :size="16" class="text-warning" />
                <AlertCircle v-else-if="notif.severity === 'critical'" :size="16" class="text-danger" />
                <CheckCircle2 v-else-if="notif.category === 'SALES'" :size="16" class="text-success" />
                <Info v-else :size="16" class="text-info" />
              </div>

              <div class="notif-content">
                <div class="font-bold text-xs text-main flex-between">
                  <span>{{ notif.action }}</span>
                  <span v-if="!notif.read" class="unread-dot"></span>
                </div>
                <div class="text-xs text-muted leading-snug mt-1">{{ notif.details }}</div>
                <div class="text-xs text-subtle font-mono mt-1">
                  {{ notif.timestamp }} • {{ notif.user }}
                </div>
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
import { useUiStore } from '@/stores/uiStore'
import {
  Menu,
  Search,
  Bell,
  Crown,
  ShieldAlert,
  ShieldCheck,
  User,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()
const router = useRouter()

const searchQuery = ref('')
const showNotifications = ref(false)
const readNotificationIds = ref(new Set())

const notificationsList = computed(() => {
  return dataStore.auditLogs.slice(0, 10).map(log => ({
    ...log,
    read: readNotificationIds.value.has(log.id)
  }))
})

const unreadCount = computed(() => {
  return notificationsList.value.filter(n => !n.read).length
})

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
}

function markAsRead(notif) {
  readNotificationIds.value.add(notif.id)
}

function markAllAsRead() {
  notificationsList.value.forEach(n => readNotificationIds.value.add(n.id))
  uiStore.showToast('All notifications marked as read', 'info')
}

function handleGlobalSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ path: '/universal-search', query: { q: searchQuery.value.trim() } })
}
</script>

<style scoped>
.navbar {
  height: 64px;
  background: var(--bg-dark-800);
  border-bottom: 1px solid var(--border-color);
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 90;
  flex-wrap: nowrap;
}

.search-box {
  position: relative;
  width: 320px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-subtle);
}

.search-input {
  padding-left: 2.2rem;
  height: 36px;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap;
  height: 100%;
}

.role-pill, .reconcile-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.65rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  height: 34px;
  white-space: nowrap;
}

.role-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--text-subtle);
  letter-spacing: 0.05em;
}

.notification-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: var(--transition-fast);
}

.icon-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--danger);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  height: 16px;
  min-width: 16px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--bg-dark-800);
}

.notification-dropdown {
  position: absolute;
  right: 0;
  top: 44px;
  width: 380px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  border-radius: var(--radius-md);
  overflow: hidden;
  animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.notification-header {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-line);
  background: var(--bg-dark-800);
}

.notification-body {
  overflow-y: auto;
  max-height: 400px;
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-line);
  cursor: pointer;
  transition: var(--transition-fast);
}

.notification-item:hover {
  background: rgba(99, 102, 241, 0.06);
}

.notification-item.unread-item {
  background: rgba(99, 102, 241, 0.1);
}

.notification-item.read-item {
  opacity: 0.75;
}

.notif-icon-box {
  margin-top: 2px;
  flex-shrink: 0;
}

.notif-content {
  flex: 1;
}

.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--primary);
}

.mobile-menu-btn {
  display: none;
}

@media (max-width: 1024px) {
  .mobile-menu-btn {
    display: inline-flex;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 0.85rem;
  }
  .search-box {
    width: 200px;
  }
  .role-label {
    display: none;
  }
}

@media (max-width: 640px) {
  .search-box {
    width: 150px;
  }
  .search-input {
    font-size: 0.8rem;
  }
  .reconcile-pill {
    display: none;
  }
  .notification-dropdown {
    width: calc(100vw - 1.5rem);
    right: -0.5rem;
  }
}

@media (max-width: 480px) {
  .search-box {
    display: none;
  }
}

.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.gap-2 { gap: 0.5rem; }
.mt-1 { margin-top: 0.25rem; }
.p-4 { padding: 1rem; }
.text-center { text-align: center; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.font-bold { font-weight: 700; }
</style>
