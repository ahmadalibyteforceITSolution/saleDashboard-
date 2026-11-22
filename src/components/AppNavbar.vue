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
          placeholder="Search Transactions, Party, Invoice..."
          class="form-input search-input"
          @keyup.enter="handleGlobalSearch"
        />
      </div>
    </div>

    <!-- Center/Right Quick Action Buttons (Vyapar Style) -->
    <div class="navbar-quick-actions flex items-center gap-1 sm:gap-2 shrink-0">
      <!-- Add Sale Button (Red) -->
      <button
        @click="uiStore.openSaleModal()"
        class="vyapar-btn vyapar-btn-sale cursor-pointer"
        title="Create New Sales Invoice / POS"
      >
        <PlusCircle :size="13" class="shrink-0" />
        <span class="btn-text">
          <span class="btn-prefix">Add </span>Sale
        </span>
      </button>

      <!-- Add Purchase Button (Blue) -->
      <button
        @click="uiStore.openPurchaseModal()"
        class="vyapar-btn vyapar-btn-purchase cursor-pointer"
        title="Record New Purchase Bill & BL Import"
      >
        <PlusCircle :size="13" class="shrink-0" />
        <span class="btn-text">
          <span class="btn-prefix">Add </span><span class="btn-term-full">Purchase</span><span class="btn-term-short">Buy</span>
        </span>
      </button>

      <!-- Add More Dropdown Menu -->
      <div class="relative add-more-wrapper shrink-0">
        <button
          @click="showAddMoreMenu = !showAddMoreMenu"
          class="vyapar-btn vyapar-btn-more cursor-pointer"
          title="More Quick Actions"
        >
          <PlusCircle :size="13" class="shrink-0" />
          <span class="btn-text">Add More</span>
          <ChevronDown :size="12" class="ml-0.5 opacity-80 shrink-0" />
        </button>

        <div v-if="showAddMoreMenu" class="add-more-dropdown glass-panel shadow-2xl min-w-[210px] p-1.5" @click="showAddMoreMenu = false">
          <button @click="uiStore.openPaymentInModal()" class="add-more-item">
            <Receipt :size="14" class="text-emerald-400" />
            <span>+ Payment In (Receipt)</span>
          </button>
          <button @click="uiStore.openPaymentOutModal()" class="add-more-item">
            <ArrowUpRight :size="14" class="text-rose-400" />
            <span>↗ Payment Out</span>
          </button>
          <button @click="uiStore.openDeliveryChallanModal()" class="add-more-item">
            <Truck :size="14" class="text-teal-400" />
            <span>+ Delivery Challan</span>
          </button>
          <button @click="uiStore.openSaleReturnModal()" class="add-more-item">
            <RotateCcw :size="14" class="text-amber-400" />
            <span>↩ Sale Return</span>
          </button>
          <button @click="uiStore.openPurchaseReturnModal()" class="add-more-item">
            <RotateCcw :size="14" class="text-cyan-400" />
            <span>↪ Purchase Return</span>
          </button>
          <button @click="uiStore.openPartyToPartyModal()" class="add-more-item">
            <ArrowRightLeft :size="14" class="text-blue-400" />
            <span>⇄ Party to Party</span>
          </button>
          <div class="border-t border-slate-700/60 my-1"></div>
          <button @click="uiStore.openAddPartyModal()" class="add-more-item">
            <Users :size="14" class="text-sky-400" />
            <span>+ Add Customer / Party</span>
          </button>
          <button @click="uiStore.openAddEquipmentModal()" class="add-more-item">
            <PackagePlus :size="14" class="text-amber-400" />
            <span>+ Add New Equipment Item</span>
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

      <!-- User Profile Header Card (Moved from Sidebar) -->
      <div
        class="user-header-card flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 transition-all cursor-pointer select-none shadow-sm"
        @click="authStore.showEditProfileModal = true"
        title="Click to Edit Profile"
      >
        <div class="w-6 h-6 rounded-full overflow-hidden border border-white/40 bg-emerald-700 flex items-center justify-center shrink-0">
          <img
            v-if="authStore.user?.avatar"
            :src="authStore.user.avatar"
            alt="Avatar"
            class="w-full h-full object-cover"
          />
          <User v-else :size="13" class="text-white" />
        </div>
        <div class="user-info min-w-0 hidden md:block">
          <span class="user-name truncate block font-bold text-xs text-white leading-tight">{{ authStore.user?.name || 'Alexander Sterling' }}</span>
          <div class="flex items-center gap-1 mt-0.5">
            <span :class="['badge', `badge-${authStore.isSuperAdmin ? 'purple' : 'success'}`, 'font-bold text-[8px] py-0 px-1 text-white']">
              {{ authStore.isSuperAdmin ? 'SUPERADMIN' : 'SALES PERSON' }}
            </span>
            <span class="badge badge-neutral text-[8px] font-bold py-0 px-1 text-white">
              📍 {{ authStore.userBranch || (authStore.isSuperAdmin ? 'Peshawar' : 'Lahore') }}
            </span>
          </div>
        </div>
        <button
          type="button"
          class="text-white/80 hover:text-white p-0.5 rounded transition-colors shrink-0"
          title="Edit Profile"
        >
          <UserCog :size="14" class="text-white" />
        </button>
      </div>

      <!-- Hotkeys Button (Moved from Sidebar) -->
      <button
        class="icon-btn text-amber-300 hover:text-white hidden lg:flex bg-white/15 border-white/25"
        @click="shortcutStore.toggleShortcutsSidebar()"
        title="Hotkeys & Command Hub (Ctrl + /)"
      >
        <Zap :size="16" />
      </button>

      <!-- Logout Button (Moved from Sidebar) -->
      <button
        class="nav-logout-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-600 border border-rose-400/60 text-white transition-all font-bold text-xs cursor-pointer shadow-sm"
        @click="handleLogout"
        title="Log out of ERP system"
      >
        <LogOut :size="14" class="shrink-0 text-rose-200" />
        <span class="hidden sm:inline font-bold">Logout</span>
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
import { useShortcutStore } from '@/stores/shortcutStore'
import {
  Menu,
  UserCog,
  LogOut,
  Zap,
  Truck,
  RotateCcw,
  ArrowRightLeft,
  ArrowUpRight,
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
const shortcutStore = useShortcutStore()

async function handleLogout() {
  uiStore.closeMobileSidebar()
  await authStore.logout()
  router.push('/login')
}
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
  min-height: 70px;
  height: auto;
  background: linear-gradient(135deg, #136a77 0%, #167a8a 50%, #105963 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 18px rgba(10, 45, 52, 0.25);
  padding: 0.75rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 90;
  flex-wrap: nowrap;
  box-sizing: border-box;
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
    padding: 0 0.75rem;
  }
  .search-box {
    width: 180px;
  }
  .role-label {
    display: none;
  }
}

@media (max-width: 640px) {
  .navbar {
    padding: 0.5rem 0.5rem;
    min-height: 56px;
  }
  .search-box {
    display: none !important;
  }
  .reconcile-pill {
    display: none !important;
  }
  .role-pill {
    display: none !important;
  }
  .notification-dropdown {
    width: calc(100vw - 1.5rem);
    right: -0.5rem;
  }
  .navbar-actions {
    gap: 0.25rem;
  }
  .icon-btn {
    width: 30px;
    height: 30px;
    min-width: 30px;
  }
  .navbar-quick-actions {
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.45rem 0.35rem;
    min-height: 52px;
  }
  .navbar-actions {
    gap: 0.2rem;
  }
  .icon-btn {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
  .navbar-quick-actions {
    gap: 0.2rem;
  }
}

@media (max-width: 360px) {
  .navbar {
    padding: 0.4rem 0.25rem;
    min-height: 50px;
  }
  .navbar-actions {
    gap: 0.15rem;
  }
  .icon-btn {
    width: 26px;
    height: 26px;
    min-width: 26px;
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

.btn-prefix {
  display: inline;
}

.btn-term-full {
  display: inline;
}

.btn-term-short {
  display: none;
}

@media (max-width: 640px) {
  .btn-prefix {
    display: none;
  }
  .vyapar-btn-more .btn-text {
    display: none;
  }
}

@media (max-width: 440px) {
  .btn-term-full {
    display: none;
  }
  .btn-term-short {
    display: inline;
  }
}
</style>
