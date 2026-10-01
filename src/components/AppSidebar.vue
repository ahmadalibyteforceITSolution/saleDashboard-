<template>
  <!-- Mobile Backdrop Overlay -->
  <div
    v-if="uiStore.isMobileSidebarOpen"
    class="sidebar-mobile-backdrop"
    @click="uiStore.closeMobileSidebar"
  ></div>

  <aside :class="['sidebar', { 'collapsed': isCollapsed, 'mobile-open': uiStore.isMobileSidebarOpen }]">
    <!-- Brand Logo Header -->
    <div class="sidebar-header">
      <div class="logo-box">
        <div class="logo-icon">
          <Layers class="icon-brand" />
        </div>
        <div v-if="!isCollapsed" class="logo-text">
          <span class="brand-title">Medical Equipment ERP</span>
          <span class="brand-subtitle">ENTERPRISE SYSTEM</span>
        </div>
      </div>
      <button class="btn-collapse" @click="toggleCollapse" title="Toggle Sidebar">
        <ChevronLeft v-if="!isCollapsed" :size="18" />
        <ChevronRight v-else :size="18" />
      </button>
    </div>

    <!-- Active User Role Badge with Downward Hierarchy Tier & Edit Profile Button -->
    <div
      v-if="!isCollapsed"
      class="user-role-card flex items-center justify-between group cursor-pointer hover:bg-slate-800/60 transition-all"
      @click="authStore.showEditProfileModal = true"
      title="Click to Edit Profile"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <img :src="authStore.user?.avatar" alt="Avatar" class="user-avatar shrink-0" />
        <div class="user-info min-w-0">
          <span class="user-name truncate block font-bold text-xs">{{ authStore.user?.name }}</span>
          <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span :class="['badge', `badge-${authStore.isSuperAdmin ? 'purple' : 'success'}`, 'font-bold flex items-center gap-1 text-[10px] py-0.5 px-1.5']">
              <Crown v-if="authStore.isSuperAdmin" :size="11" />
              <ShoppingBag v-else :size="11" />
              <span>{{ authStore.isSuperAdmin ? 'SUPERADMIN' : 'SALES PERSON' }}</span>
            </span>
            <span class="badge badge-neutral text-[9px] font-bold py-0.5 px-1">
              📍 {{ authStore.userBranch || (authStore.isSuperAdmin ? 'Peshawar' : 'Lahore') }}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        class="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/60 transition-colors shrink-0"
        title="Edit Profile"
      >
        <UserCog :size="15" />
      </button>
    </div>

    <div class="line-divider"></div>

    <!-- Navigation Links -->
    <nav class="sidebar-nav">
      <!-- 1. Home / Executive Dashboard -->
      <router-link
        to="/dashboard"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <LayoutDashboard :size="18" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Home</span>
      </router-link>

      <!-- 2. Parties / Customer & Vendor Ledger -->
      <router-link
        to="/customer-ledger"
        class="nav-item flex items-center justify-between"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <div class="flex items-center gap-3">
          <Users :size="18" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-label">Parties</span>
        </div>
        <Plus v-if="!isCollapsed" :size="14" class="opacity-60 hover:opacity-100" />
      </router-link>

      <!-- 3. Items / Inventory & Storage -->
      <router-link
        to="/inventory"
        class="nav-item flex items-center justify-between"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <div class="flex items-center gap-3">
          <Package :size="18" class="nav-icon" />
          <span v-if="!isCollapsed" class="nav-label">Items</span>
        </div>
        <span v-if="!isCollapsed && dataStore.lowStockProducts.length > 0" class="badge badge-warning font-mono text-[9px] py-0 px-1">
          {{ dataStore.lowStockProducts.length }}
        </span>
      </router-link>

      <!-- 4. Sale Section with Submenu Dropdown -->
      <div class="nav-group">
        <div
          class="nav-item flex items-center justify-between cursor-pointer"
          :class="{ 'active': route.path === '/sales' && (!route.query.type || route.query.type === 'invoice') }"
          @click="toggleSaleMenu"
        >
          <div class="flex items-center gap-3">
            <Receipt :size="18" class="nav-icon" />
            <span v-if="!isCollapsed" class="nav-label">Sale</span>
          </div>
          <div v-if="!isCollapsed" class="flex items-center gap-1">
            <Plus :size="14" class="opacity-60 hover:opacity-100" @click.stop="router.push('/sales'); uiStore.closeMobileSidebar()" />
            <ChevronDown :size="13" class="opacity-60 transition-transform duration-200" :class="{ 'rotate-180': isSaleMenuOpen }" />
          </div>
        </div>

        <div v-if="!isCollapsed && isSaleMenuOpen" class="sidebar-submenu">
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/sales' && (!route.query.type || route.query.type === 'invoice') }"
            @click="router.push('/sales?type=invoice'); uiStore.closeMobileSidebar()"
          >
            <span>Sale Invoices</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/sales' && (route.query.type === 'estimate' || route.query.type === 'quotation') }"
            @click="router.push('/sales?type=estimate'); uiStore.closeMobileSidebar()"
          >
            <span>Estimate / Quotation</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/payments' && route.query.type === 'in' }"
            @click="router.push('/payments?type=in'); uiStore.closeMobileSidebar()"
          >
            <span>Payment In</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/sales' && route.query.type === 'order' }"
            @click="router.push('/sales?type=order'); uiStore.closeMobileSidebar()"
          >
            <span>Sale Order</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/sales' && route.query.type === 'return' }"
            @click="router.push('/sales?type=return'); uiStore.closeMobileSidebar()"
          >
            <span>Sale Return / Cr. Note</span>
          </button>
        </div>
      </div>

      <!-- 5. Purchase Section with Submenu Dropdown -->
      <div class="nav-group">
        <div
          class="nav-item flex items-center justify-between cursor-pointer"
          :class="{ 'active': route.path === '/purchasing' }"
          @click="togglePurchaseMenu"
        >
          <div class="flex items-center gap-3">
            <ShoppingCart :size="18" class="nav-icon" />
            <span v-if="!isCollapsed" class="nav-label">Purchase</span>
          </div>
          <div v-if="!isCollapsed" class="flex items-center gap-1">
            <Plus :size="14" class="opacity-60 hover:opacity-100" @click.stop="uiStore.openPurchaseModal(); uiStore.closeMobileSidebar()" />
            <ChevronDown :size="13" class="opacity-60 transition-transform duration-200" :class="{ 'rotate-180': isPurchaseMenuOpen }" />
          </div>
        </div>

        <div v-if="!isCollapsed && isPurchaseMenuOpen" class="sidebar-submenu">
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/purchasing' && (!route.query.type || route.query.type === 'bills') }"
            @click="router.push('/purchasing'); uiStore.closeMobileSidebar()"
          >
            <span class="flex items-center justify-between w-full">
              <span>Purchase Bills & Import Hub</span>
              <span class="badge badge-info text-[9px] py-0 px-1 font-mono">BL Registry</span>
            </span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/payments' && route.query.type === 'out' }"
            @click="router.push('/payments?type=out'); uiStore.closeMobileSidebar()"
          >
            <span>Payment Out</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/purchasing' && route.query.type === 'return' }"
            @click="router.push('/purchasing?type=return'); uiStore.closeMobileSidebar()"
          >
            <span>Purchase Return / Dr. Note</span>
          </button>
        </div>
      </div>

      <!-- 6. Expenses / Payments -->
      <button
        type="button"
        class="nav-item"
        :class="{ 'active': route.path === '/payments' && (route.query.type === 'expenses' || (!route.query.type && !isSaleMenuOpen && !isPurchaseMenuOpen)) }"
        @click="router.push('/payments?type=expenses'); uiStore.closeMobileSidebar()"
      >
        <CreditCard :size="18" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Expenses</span>
      </button>

      <!-- 7. Cash & Bank / Liquidity Accounts -->
      <router-link
        to="/cash-bank"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <Landmark :size="18" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Cash & Bank</span>
      </router-link>

      <!-- 8. Reports & Analytics -->
      <router-link
        to="/analytics"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <TrendingUp :size="18" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Reports</span>
      </router-link>

      <!-- 9. Serial Number Registry -->
      <router-link
        to="/serials"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <QrCode :size="18" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Serial Registry</span>
      </router-link>

      <!-- 10. SuperAdmin Center (Level 4 ONLY) -->
      <router-link
        v-if="authStore.canSeeSuperAdmin"
        to="/superadmin"
        class="nav-item nav-superadmin"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <Crown :size="18" class="nav-icon crown-icon" />
        <span v-if="!isCollapsed" class="nav-label">SuperAdmin HQ</span>
        <span v-if="!isCollapsed" class="badge badge-purple font-mono text-[9px]">L4</span>
      </router-link>
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <div class="grid grid-cols-2 gap-1 mb-1" v-if="!isCollapsed">
        <button class="btn-footer-tool" @click="uiStore.showToast('Data Synced with Cloud', 'success')">
          <RefreshCw :size="12" />
          <span>Sync</span>
        </button>
        <button class="btn-footer-tool" @click="router.push('/universal-search')">
          <Search :size="12" />
          <span>Search</span>
        </button>
      </div>

      <button class="nav-item btn-theme-toggle" @click="authStore.toggleTheme">
        <Sun v-if="authStore.theme === 'dark'" :size="18" class="nav-icon" />
        <Moon v-else :size="18" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">{{ authStore.theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <button class="nav-item btn-logout" @click="handleLogout">
        <LogOut :size="18" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  LayoutDashboard,
  Crown,
  Package,
  QrCode,
  ShoppingCart,
  Truck,
  TrendingUp,
  Search,
  FileText,
  DollarSign,
  Sun,
  Moon,
  LogOut,
  User,
  UserCog,
  Calculator,
  ShoppingBag,
  ChevronDown,
  Users,
  Receipt,
  CreditCard,
  Landmark,
  Plus,
  RefreshCw
} from 'lucide-vue-next'
import { computed } from 'vue'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()
const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)
const isReportsMenuOpen = ref(false)
const isSaleMenuOpen = ref(false)
const isPurchaseMenuOpen = ref(false)

function isSubitemActive(path, typeQuery) {
  if (route.path !== path) return false
  if (!typeQuery) {
    return !route.query.type
  }
  return route.query.type === typeQuery
}

const isReportsActive = computed(() => {
  return route.path === '/analytics'
})

function toggleSaleMenu() {
  if (isCollapsed.value) {
    isCollapsed.value = false
    isSaleMenuOpen.value = true
  } else {
    isSaleMenuOpen.value = !isSaleMenuOpen.value
  }
}

function togglePurchaseMenu() {
  if (isCollapsed.value) {
    isCollapsed.value = false
    isPurchaseMenuOpen.value = true
  } else {
    isPurchaseMenuOpen.value = !isPurchaseMenuOpen.value
  }
}

function toggleReportsMenu() {
  if (isCollapsed.value) {
    isCollapsed.value = false
    isReportsMenuOpen.value = true
  } else {
    isReportsMenuOpen.value = !isReportsMenuOpen.value
  }
}

watch(() => route.path, () => {
  uiStore.closeMobileSidebar()
  if (route.path.startsWith('/sales')) {
    isSaleMenuOpen.value = true
  } else if (route.path.startsWith('/purchasing')) {
    isPurchaseMenuOpen.value = true
  } else if (route.path === '/analytics') {
    isReportsMenuOpen.value = true
  }
})

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

async function handleLogout() {
  uiStore.closeMobileSidebar()
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: var(--bg-dark-800);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: var(--transition-normal);
}

.sidebar.collapsed {
  width: 84px;
}

.sidebar-header {
  padding: 1.5rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-line);
}

.logo-box {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logo-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.3rem;
  letter-spacing: 0.06em;
  color: var(--text-main);
  line-height: 1;
}

.brand-subtitle {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: var(--primary);
  margin-top: 3px;
}

.btn-collapse {
  background: rgba(15, 23, 42, 0.06);
  border: 1px solid var(--border-color);
  color: var(--text-subtle);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
}

[data-theme="dark"] .btn-collapse {
  background: rgba(255, 255, 255, 0.06);
}

.btn-collapse:hover {
  color: #ffffff;
  background: var(--primary);
}

.user-role-card {
  margin: 1.25rem 1rem 0.75rem 1rem;
  padding: 0.85rem 1rem;
  background: var(--bg-card-solid);
  border: 1px solid var(--border-color-strong);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: 0.85rem;
  box-shadow: var(--shadow-sm);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--primary);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.sidebar-nav {
  padding: 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
  overflow-y: auto;
}

.nav-section-title {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-subtle);
  letter-spacing: 0.1em;
  padding: 1rem 0.5rem 0.4rem 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  padding: 0.8rem 1rem;
  margin: 0.1rem 0;
  color: var(--text-subtle);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  position: relative;
  transition: var(--transition-fast);
  background: transparent;
  border: 1px solid transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.nav-item:hover {
  color: var(--text-main);
  background: rgba(20, 125, 142, 0.12);
  border-color: rgba(20, 125, 142, 0.25);
}

.nav-item.active {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(20, 125, 142, 0.45), rgba(15, 102, 116, 0.3));
  border: 1px solid rgba(20, 125, 142, 0.5);
  box-shadow: 0 2px 8px rgba(20, 125, 142, 0.25);
  font-weight: 700;
}

.nav-superadmin.active {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(147, 51, 234, 0.2));
  border-color: rgba(168, 85, 247, 0.45);
}

.crown-icon {
  color: #c084fc;
}

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid var(--border-line);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.btn-logout {
  color: var(--danger);
}

.btn-logout:hover {
  background: var(--danger-glow);
  color: #f87171;
}

.sidebar-mobile-backdrop {
  display: none;
}

/* ── Dark Theme (Default) ──────────────────────────────────────────────── */
.sidebar {
  background: #1e2530 !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #94a3b8;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.brand-title {
  color: #ffffff !important;
}

.brand-subtitle {
  color: #94a3b8 !important;
}

.user-role-card {
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.user-name {
  color: #ffffff !important;
}

.nav-item {
  color: #94a3b8 !important;
}

.nav-item:hover {
  color: #ffffff !important;
  background: rgba(20, 125, 142, 0.18) !important;
}

.nav-item.active {
  color: #ffffff !important;
  background: #147d8e !important;
  border: 1px solid #147d8e !important;
  box-shadow: 0 2px 8px rgba(20, 125, 142, 0.35) !important;
  font-weight: 700 !important;
}

.nav-item.active * {
  color: #ffffff !important;
}

.sidebar-submenu {
  padding-left: 2rem;
  padding-right: 0.65rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-subitem {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.4rem 0.75rem;
  font-size: 0.775rem;
  font-weight: 500;
  color: #94a3b8 !important;
  border-radius: 4px;
  text-decoration: none !important;
  transition: all 0.15s ease;
  background: transparent !important;
  border: 1px solid transparent !important;
  cursor: pointer;
}

.nav-subitem:hover {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.nav-subitem.subitem-active {
  color: #38bdf8 !important;
  background: rgba(56, 189, 248, 0.12) !important;
  border-left: 3px solid #38bdf8 !important;
  font-weight: 700 !important;
}

.btn-footer-tool {
  padding: 0.4rem 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #94a3b8;
  font-size: 0.75rem;
  border-radius: 6px;
  transition: all 0.15s ease;
  background: rgba(255, 255, 255, 0.05);
}

.btn-footer-tool:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* ── Light Theme Overrides ──────────────────────────────────────────────── */
[data-theme="light"] .sidebar {
  background: #ffffff !important;
  border-right: 1px solid #e2e8f0 !important;
  color: #475569 !important;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.04) !important;
}

[data-theme="light"] .sidebar-header {
  border-bottom: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
}

[data-theme="light"] .brand-title {
  color: #0f172a !important;
}

[data-theme="light"] .brand-subtitle {
  color: #64748b !important;
}

[data-theme="light"] .user-role-card {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

[data-theme="light"] .user-name {
  color: #0f172a !important;
}

[data-theme="light"] .nav-item {
  color: #475569 !important;
}

[data-theme="light"] .nav-item:hover {
  color: #0f172a !important;
  background: #f1f5f9 !important;
}

[data-theme="light"] .nav-item.active {
  color: #ffffff !important;
  background: #147d8e !important;
  border: 1px solid #147d8e !important;
  box-shadow: 0 2px 8px rgba(20, 125, 142, 0.3) !important;
  font-weight: 700 !important;
}

[data-theme="light"] .nav-item.active * {
  color: #ffffff !important;
}

[data-theme="light"] .nav-subitem {
  color: #64748b !important;
}

[data-theme="light"] .nav-subitem:hover {
  color: #0f172a !important;
  background: #f1f5f9 !important;
}

[data-theme="light"] .nav-subitem.subitem-active {
  color: #0284c7 !important;
  background: #e0f2fe !important;
  border-left: 3px solid #0284c7 !important;
  font-weight: 700 !important;
}

[data-theme="light"] .btn-footer-tool {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border: 1px solid #e2e8f0 !important;
}

[data-theme="light"] .btn-footer-tool:hover {
  background: #e2e8f0 !important;
  color: #0f172a !important;
}

[data-theme="light"] .sidebar-footer {
  border-top: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
}

[data-theme="light"] .nav-item.btn-theme-toggle {
  color: #475569 !important;
}

[data-theme="light"] .nav-item.btn-theme-toggle:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}

[data-theme="light"] .btn-logout {
  color: #dc2626 !important;
}

[data-theme="light"] .btn-logout:hover {
  background: #fef2f2 !important;
  color: #b91c1c !important;
}

@media (max-width: 1024px) {
  .sidebar-mobile-backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(3, 7, 18, 0.7);
    backdrop-filter: blur(4px);
    z-index: 998;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 999;
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);
    width: 260px !important;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .btn-collapse {
    display: none;
  }
}
</style>
