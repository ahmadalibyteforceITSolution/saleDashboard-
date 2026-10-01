<template>
  <header class="navbar">
    <div class="navbar-left flex-align gap-3">
      <!-- Mobile Menu Toggle Button -->
      <button class="mobile-menu-btn icon-btn" @click="uiStore.toggleMobileSidebar" title="Toggle Navigation Menu">
        <Menu :size="18" />
      </button>

      <!-- Global / Transaction Search Input -->
      <div class="search-box">
        <Search class="search-icon" :size="15" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Transactions, SKU, Party, Invoice..."
          class="form-input search-input"
          @keyup.enter="handleGlobalSearch"
        />
      </div>
    </div>

    <!-- Center/Right Quick Action Buttons (Vyapar Style) -->
    <div class="navbar-quick-actions flex items-center gap-2">
      <!-- Add Sale Button (Red) -->
      <button
        @click="router.push('/sales')"
        class="vyapar-btn vyapar-btn-sale"
        title="Create New Sales Invoice / POS"
      >
        <PlusCircle :size="14" />
        <span>+ Add Sale</span>
      </button>

      <!-- Add Purchase Button (Blue) -->
      <button
        @click="router.push('/purchasing')"
        class="vyapar-btn vyapar-btn-purchase"
        title="Record New Purchase Bill"
      >
        <PlusCircle :size="14" />
        <span>+ Add Purchase</span>
      </button>

      <!-- Add More Dropdown Menu -->
      <div class="relative add-more-wrapper">
        <button
          @click="showAddMoreMenu = !showAddMoreMenu"
          class="vyapar-btn vyapar-btn-more"
          title="More Quick Actions"
        >
          <PlusCircle :size="14" />
          <span>+ Add More</span>
          <ChevronDown :size="12" class="ml-0.5 opacity-80" />
        </button>

        <div v-if="showAddMoreMenu" class="add-more-dropdown glass-panel shadow-2xl" @click="showAddMoreMenu = false">
          <button @click="router.push('/payments')" class="add-more-item">
            <Receipt :size="15" class="text-emerald-400" />
            <span>+ Payment In (Receipt)</span>
          </button>
          <button @click="router.push('/customer-ledger')" class="add-more-item">
            <Users :size="15" class="text-blue-400" />
            <span>+ Add Customer / Party</span>
          </button>
          <button @click="router.push('/inventory')" class="add-more-item">
            <PackagePlus :size="15" class="text-amber-400" />
            <span>+ Add New Item / SKU</span>
          </button>
        </div>
      </div>
    </div>

    <div class="navbar-actions">
      <!-- Role Indicator Pill with 4-Tier Hierarchy Display (Clickable for Edit Profile) -->
      <button
        type="button"
        @click="authStore.showEditProfileModal = true"
        class="role-pill hidden xl:flex items-center gap-1.5 hover:border-white/50 transition-all cursor-pointer bg-transparent border-0 p-0"
        title="Click to Edit Profile"
      >
        <span class="role-label hidden md:inline">ROLE:</span>
        <span :class="['badge', `badge-${authStore.user?.badgeColor || 'purple'}`]">
          <Crown v-if="authStore.isSuperAdmin" :size="12" />
          <Calculator v-else-if="authStore.isAccountant" :size="12" />
          <ShieldAlert v-else-if="authStore.isAdmin" :size="12" />
          <ShoppingBag v-else-if="authStore.isManager" :size="12" />
          <User v-else :size="12" />
          <span class="role-text">{{ (authStore.user?.role || 'accountant').toUpperCase() }} (L{{ authStore.roleLevel }})</span>
        </span>
      </button>

      <!-- Financial Reconciliation Pill -->
      <div class="reconcile-pill hidden lg:flex">
        <ShieldCheck :size="14" class="text-emerald-300" />
        <span class="font-mono text-xs reconcile-text font-bold">{{ dataStore.checkAndBalance.healthScore }}% BALANCED</span>
      </div>

      <!-- Financial Balance Privacy Toggle -->
      <button
        class="icon-btn"
        @click="authStore.toggleBalance()"
        :title="authStore.isBalanceVisible ? 'Financial Balances Visible (Click to Hide/Mask)' : 'Financial Balances Protected (Click to Verify & View)'"
        :class="authStore.isBalanceVisible ? 'text-white hover:bg-white/20' : 'text-amber-300 bg-amber-500/20 border-amber-400/40 shadow-sm'"
      >
        <EyeOff v-if="authStore.isBalanceVisible" :size="16" />
        <Eye v-else :size="16" />
      </button>

      <!-- Theme Switcher Button (Dark / Light) -->
      <button
        class="icon-btn btn-theme-toggle-nav"
        @click="authStore.toggleTheme()"
        :title="authStore.theme === 'dark' ? 'Switch to Clean Light Theme' : 'Switch to Luxury Dark Theme'"
      >
        <Sun v-if="authStore.theme === 'dark'" :size="16" class="text-amber-300" />
        <Moon v-else :size="16" class="text-white" />
      </button>

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
    <!-- Global Balance Security Login Verification Modal -->
    <BalanceSecurityModal v-model="authStore.showBalanceModal" />

    <!-- Edit Profile Modal -->
    <EditProfileModal v-model="authStore.showEditProfileModal" />
  </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
  Info,
  Eye,
  EyeOff,
  Calculator,
  ShoppingBag,
  Sun,
  Moon,
  PlusCircle,
  ChevronDown,
  Receipt,
  Users,
  PackagePlus
} from 'lucide-vue-next'
import BalanceSecurityModal from '@/components/BalanceSecurityModal.vue'
import EditProfileModal from '@/components/EditProfileModal.vue'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const showNotifications = ref(false)
const showAddMoreMenu = ref(false)

// In-memory set for read notification tracking
try {
  localStorage.removeItem('medimage_read_notif_ids')
} catch (e) {}

const readNotificationIds = ref(new Set())
const saveReadIds = () => {}

watch(() => route.query.q, (newQ) => {
  if (newQ !== undefined) {
    searchQuery.value = newQ
  }
}, { immediate: true })

const notificationsList = computed(() => {
  // Requirement 48: Dynamic live low stock alerts (auto disappear when stock is replenished)
  const lowStockAlerts = (dataStore.lowStockProducts || []).map(p => {
    const minLvl = p.minStock !== undefined ? p.minStock : 5
    const isOut = p.stockQty === 0
    return {
      id: `low_stock_${p.id || p.sku}`,
      title: isOut ? `🚨 Out of Stock: ${p.name}` : `⚠️ Low Stock Alert: ${p.name}`,
      details: `${p.stockQty} unit(s) remaining in stock (Minimum Level: ${minLvl}). ${p.allocationCity || 'Central'} depot. Reorder needed.`,
      timestamp: 'Active Now',
      severity: isOut ? 'critical' : 'warning',
      category: 'INVENTORY',
      isLiveLowStock: true,
      read: false
    }
  })

  // Unread audit logs from system
  const auditList = dataStore.auditLogs
    .filter(log => {
      const logId = log.id || log._id
      return log.read !== true && (!logId || !readNotificationIds.value.has(logId))
    })
    .map(log => ({
      ...log,
      id: log.id || log._id,
      read: false
    }))

  return [...lowStockAlerts, ...auditList].slice(0, 15)
})

const unreadCount = computed(() => {
  const lowStockCount = (dataStore.lowStockProducts || []).length
  const unreadAuditCount = dataStore.auditLogs.filter(log => {
    const logId = log.id || log._id
    return log.read !== true && (!logId || !readNotificationIds.value.has(logId))
  }).length
  return lowStockCount + unreadAuditCount
})

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
}

async function markAsRead(notif) {
  const logId = notif.id || notif._id
  if (logId) {
    readNotificationIds.value.add(logId)
    readNotificationIds.value = new Set(readNotificationIds.value)
    saveReadIds()
    await dataStore.markAuditLogAsRead(logId)
  }
}

async function markAllAsRead() {
  dataStore.auditLogs.forEach(log => {
    const logId = log.id || log._id
    if (logId) {
      readNotificationIds.value.add(logId)
    }
  })
  readNotificationIds.value = new Set(readNotificationIds.value)
  saveReadIds()
  await dataStore.markAllAuditLogsAsRead()
  uiStore.showToast('All notifications marked as read and synced to database', 'success')
}

function handleGlobalSearch() {
  const q = searchQuery.value ? searchQuery.value.trim() : ''
  router.push({ path: '/universal-search', query: { q } })
}
</script>

<style scoped>
.navbar {
  height: 64px;
  background: linear-gradient(135deg, #136a77 0%, #167a8a 50%, #105963 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 18px rgba(10, 45, 52, 0.25);
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 90;
  flex-wrap: nowrap;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 340px;
  min-width: 160px;
}

.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b !important;
  pointer-events: none;
}

.search-input {
  padding-left: 2.25rem !important;
  padding-right: 0.75rem !important;
  height: 34px !important;
  min-height: 34px !important;
  width: 100% !important;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  color: #0f172a !important;
  border-radius: var(--radius-full) !important;
  font-size: 0.825rem !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
}

.search-input::placeholder {
  color: #94a3b8 !important;
  font-weight: 500;
}

.search-input:focus {
  background: #ffffff !important;
  border-color: #0d9488 !important;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25) !important;
  outline: none !important;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  flex-shrink: 0;
  height: 100%;
}

.role-pill, .reconcile-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.65rem;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  height: 34px;
  white-space: nowrap;
  backdrop-filter: blur(4px);
}

.role-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.05em;
}

.reconcile-text {
  color: #ffffff;
}

.notification-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: var(--transition-fast);
  backdrop-filter: blur(4px);
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
  transform: translateY(-1px);
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
