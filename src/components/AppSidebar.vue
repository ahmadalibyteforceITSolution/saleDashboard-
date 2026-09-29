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
      <div v-if="!isCollapsed" class="nav-section-title">
        <template v-if="authStore.isSuperAdmin">👑 SUPERADMIN HQ CONTROL</template>
        <template v-else>💼 BRANCH SALES WORKSPACE</template>
      </div>

      <!-- 1. SuperAdmin Center (Level 4 ONLY: SuperAdmin alone can see) -->
      <router-link
        v-if="authStore.canSeeSuperAdmin"
        to="/superadmin"
        class="nav-item nav-superadmin"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <Crown :size="20" class="nav-icon crown-icon" />
        <span v-if="!isCollapsed" class="nav-label">SuperAdmin Center</span>
        <span v-if="!isCollapsed" class="badge badge-purple font-mono">L4 AUDIT</span>
      </router-link>

      <!-- 2. Executive Dashboard (Level 3 & 4: SuperAdmin + Admin) -->
      <router-link
        v-if="authStore.canSeeAdmin"
        to="/dashboard"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <LayoutDashboard :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Executive Dashboard</span>
      </router-link>

      <!-- 3. Purchasing & Imports (Level 3 & 4: SuperAdmin + Admin) -->
      <router-link
        v-if="authStore.canSeeAdmin"
        to="/purchasing"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <Truck :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Purchasing & Imports</span>
      </router-link>

      <!-- 4. Sales & Outbound POS (Level 2, 3 & 4: SuperAdmin + Admin + Manager) -->
      <router-link
        v-if="authStore.canSeeManager"
        to="/sales"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <ShoppingCart :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Sales & Outbound POS</span>
      </router-link>

      <!-- 5. ERP Reports & Graphs with Dropdown Submenu (Level 2, 3 & 4) -->
      <div v-if="authStore.canSeeManager" class="nav-group">
        <div
          class="nav-item cursor-pointer flex items-center justify-between select-none"
          :class="{ 'active': isReportsActive }"
          @click="toggleReportsMenu"
          title="Click to expand ERP Reports Menu"
        >
          <div class="flex items-center gap-3 min-w-0">
            <TrendingUp :size="20" class="nav-icon" />
            <span v-if="!isCollapsed" class="nav-label">ERP Reports</span>
          </div>
          <div v-if="!isCollapsed" class="flex items-center gap-1.5 shrink-0">
            <span class="badge badge-info font-mono text-[9px] py-0 px-1">8 ALL</span>
            <ChevronDown :size="14" :class="['transition-transform duration-200 text-slate-400', { 'rotate-180': isReportsMenuOpen }]" />
          </div>
        </div>

        <!-- Submenu Items -->
        <div v-if="!isCollapsed && isReportsMenuOpen" class="pl-3 pr-1 py-1 space-y-1 border-l-2 border-indigo-500/40 ml-4 my-1">
          <router-link
            to="/analytics"
            class="nav-subitem flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            :class="{ 'nav-subitem-active !bg-indigo-600/30 !text-indigo-200 font-bold border border-indigo-500/40 shadow-sm': route.path === '/analytics' && !route.query.report }"
            @click="uiStore.closeMobileSidebar"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
              <span>Overview & Charts</span>
            </span>
          </router-link>

          <router-link
            to="/analytics?report=sales"
            class="nav-subitem flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            :class="{ 'nav-subitem-active !bg-indigo-600/30 !text-indigo-200 font-bold border border-indigo-500/40 shadow-sm': route.query.report === 'sales' }"
            @click="uiStore.closeMobileSidebar"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></span>
              <span>Sales & POS Invoices</span>
            </span>
          </router-link>

          <router-link
            to="/analytics?report=payment_in"
            class="nav-subitem flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            :class="{ 'nav-subitem-active !bg-emerald-600/30 !text-emerald-200 font-bold border border-emerald-500/40 shadow-sm': route.query.report === 'payment_in' }"
            @click="uiStore.closeMobileSidebar"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span>Payment In Receipts</span>
            </span>
          </router-link>

          <router-link
            to="/analytics?report=payment_out"
            class="nav-subitem flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            :class="{ 'nav-subitem-active !bg-amber-600/30 !text-amber-200 font-bold border border-amber-500/40 shadow-sm': route.query.report === 'payment_out' }"
            @click="uiStore.closeMobileSidebar"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
              <span>Payment Out / Expenses</span>
            </span>
          </router-link>

          <router-link
            to="/analytics?report=inventory"
            class="nav-subitem flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            :class="{ 'nav-subitem-active !bg-teal-600/30 !text-teal-200 font-bold border border-teal-500/40 shadow-sm': route.query.report === 'inventory' }"
            @click="uiStore.closeMobileSidebar"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-teal-400 shrink-0"></span>
              <span>Stock & Valuation</span>
            </span>
          </router-link>

          <router-link
            to="/analytics?report=credit"
            class="nav-subitem flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            :class="{ 'nav-subitem-active !bg-purple-600/30 !text-purple-200 font-bold border border-purple-500/40 shadow-sm': route.query.report === 'credit' }"
            @click="uiStore.closeMobileSidebar"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
              <span>Customer Credit Ledger</span>
            </span>
          </router-link>

          <router-link
            to="/analytics?report=containers"
            class="nav-subitem flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            :class="{ 'nav-subitem-active !bg-cyan-600/30 !text-cyan-200 font-bold border border-cyan-500/40 shadow-sm': route.query.report === 'containers' }"
            @click="uiStore.closeMobileSidebar"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
              <span>Containers & BL Import</span>
            </span>
          </router-link>

          <router-link
            to="/analytics?report=serials"
            class="nav-subitem flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            :class="{ 'nav-subitem-active !bg-rose-600/30 !text-rose-200 font-bold border border-rose-500/40 shadow-sm': route.query.report === 'serials' }"
            @click="uiStore.closeMobileSidebar"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
              <span>Serial Number Registry</span>
            </span>
          </router-link>

          <router-link
            to="/analytics?report=profit"
            class="nav-subitem flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
            :class="{ 'nav-subitem-active !bg-emerald-600/30 !text-emerald-200 font-bold border border-emerald-500/40 shadow-sm': route.query.report === 'profit' }"
            @click="uiStore.closeMobileSidebar"
          >
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span>P&L Profit Margin</span>
            </span>
          </router-link>
        </div>
      </div>

      <!-- 6. Accountant Hub (Level 1, 2, 3 & 4: Accessible across all tiers as higher levels oversee accountant) -->
      <router-link
        v-if="authStore.canSeeAccountant"
        to="/accountant"
        class="nav-item nav-accountant"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <Calculator :size="20" class="nav-icon text-emerald-400" />
        <span v-if="!isCollapsed" class="nav-label">Accountant Hub</span>
        <span v-if="!isCollapsed" class="badge badge-emerald font-mono">CONTAINERS</span>
      </router-link>

      <!-- 7. Inventory & Storage (Level 1, 2, 3 & 4) -->
      <router-link
        v-if="authStore.canSeeAccountant"
        to="/inventory"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <Package :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Inventory & Storage</span>
        <span v-if="!isCollapsed && dataStore.lowStockProducts.length > 0" class="badge badge-warning font-mono">
          {{ dataStore.lowStockProducts.length }}
        </span>
      </router-link>

      <!-- 8. Serial Number Registry (Level 1, 2, 3 & 4) -->
      <router-link
        v-if="authStore.canSeeAccountant"
        to="/serials"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <QrCode :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Serial Number Registry</span>
      </router-link>

      <!-- 9. Customer Ledger (Level 1, 2, 3 & 4) -->
      <router-link
        v-if="authStore.canSeeAccountant"
        to="/customer-ledger"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <FileText :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Customer Ledger</span>
      </router-link>

      <!-- 10. Payment In Module (Level 1, 2, 3 & 4) -->
      <router-link
        v-if="authStore.canSeeAccountant"
        to="/payments"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <DollarSign :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Payment In Module</span>
      </router-link>

      <!-- 11. 360° Universal Search (Level 1, 2, 3 & 4) -->
      <router-link
        v-if="authStore.canSeeAccountant"
        to="/universal-search"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <Search :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">360° Universal Search</span>
      </router-link>
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <button class="nav-item btn-theme-toggle" @click="authStore.toggleTheme">
        <Sun v-if="authStore.theme === 'dark'" :size="20" class="nav-icon" />
        <Moon v-else :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">{{ authStore.theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
      </button>

      <button class="nav-item btn-logout" @click="handleLogout">
        <LogOut :size="20" class="nav-icon" />
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
  ChevronDown
} from 'lucide-vue-next'
import { computed } from 'vue'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()
const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)
const isReportsMenuOpen = ref(true)

const isReportsActive = computed(() => {
  return route.path === '/analytics'
})

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
  if (route.path === '/analytics') {
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
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
}

.nav-item.active {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(79, 70, 229, 0.25));
  border: 1px solid rgba(99, 102, 241, 0.45);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
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

/* ── Light Mode International Design Overrides ──────────────── */
[data-theme="light"] .sidebar {
  background: #ffffff !important;
  border-right-color: #e2e8f0 !important;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.02);
}

[data-theme="light"] .sidebar-header {
  border-bottom-color: #f1f5f9 !important;
}

[data-theme="light"] .sidebar-footer {
  border-top-color: #f1f5f9 !important;
}

[data-theme="light"] .brand-title {
  color: #0f172a !important;
}

[data-theme="light"] .btn-collapse {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #64748b !important;
}

[data-theme="light"] .btn-collapse:hover {
  background: #eef2ff !important;
  color: #4f46e5 !important;
  border-color: #c7d2fe !important;
}

[data-theme="light"] .user-role-card {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

[data-theme="light"] .user-name {
  color: #0f172a !important;
}

[data-theme="light"] .nav-section-title {
  color: #64748b !important;
}

[data-theme="light"] .nav-item {
  color: #475569 !important;
}

[data-theme="light"] .nav-item:hover {
  color: #0f172a !important;
  background: #f1f5f9 !important;
}

[data-theme="light"] .nav-item.active {
  color: #4338ca !important;
  background: #eef2ff !important;
  border-color: #c7d2fe !important;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.12) !important;
}

[data-theme="light"] .nav-item.active svg {
  color: #4f46e5 !important;
}

[data-theme="light"] .nav-item.active .badge {
  background: #e0e7ff !important;
  color: #3730a3 !important;
  border-color: #c7d2fe !important;
}

[data-theme="light"] .nav-item.active::before {
  background: #4f46e5 !important;
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

.nav-subitem {
  text-decoration: none !important;
  font-weight: 600;
}

[data-theme="light"] .nav-subitem {
  color: #475569 !important;
}

[data-theme="light"] .nav-subitem:hover {
  color: #0f172a !important;
  background: #f1f5f9 !important;
}

[data-theme="light"] .nav-subitem-active {
  color: #4338ca !important;
  background: #eef2ff !important;
  border: 1px solid #c7d2fe !important;
  font-weight: 700 !important;
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
