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
          <span class="brand-subtitle">Software Requirements</span>
        </div>
      </div>
      <button class="btn-collapse" @click="toggleCollapse" title="Toggle Sidebar">
        <ChevronLeft v-if="!isCollapsed" :size="18" />
        <ChevronRight v-else :size="18" />
      </button>
    </div>

    <!-- Active User Role Badge with Downward Hierarchy Tier -->
    <div v-if="!isCollapsed" class="user-role-card">
      <img :src="authStore.user?.avatar" alt="Avatar" class="user-avatar" />
      <div class="user-info">
        <span class="user-name">{{ authStore.user?.name }}</span>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span :class="['badge', `badge-${authStore.user?.badgeColor || 'purple'}`]">
            <Crown v-if="authStore.isSuperAdmin" :size="12" />
            <Calculator v-else-if="authStore.isAccountant" :size="12" />
            <ShieldAlert v-else-if="authStore.isAdmin" :size="12" />
            <ShoppingBag v-else-if="authStore.isManager" :size="12" />
            <User v-else :size="12" />
            {{ (authStore.user?.role || 'accountant').toUpperCase() }}
          </span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold" title="Hierarchy Level">
            L{{ authStore.roleLevel }}
          </span>
        </div>
      </div>
    </div>

    <div class="line-divider"></div>

    <!-- Navigation Links filtered strictly by 4-Tier Downward Hierarchy -->
    <nav class="sidebar-nav">
      <div v-if="!isCollapsed" class="nav-section-title">
        <template v-if="authStore.roleLevel === 4">SUPERADMIN ALL-LEVEL (L4)</template>
        <template v-else-if="authStore.roleLevel === 3">ADMIN OPERATIONS (L3)</template>
        <template v-else-if="authStore.roleLevel === 2">MANAGER POS & OPS (L2)</template>
        <template v-else>ACCOUNTANT DESK (L1)</template>
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

      <!-- 5. ERP Reports & Graphs (Level 2, 3 & 4: SuperAdmin + Admin + Manager) -->
      <router-link
        v-if="authStore.canSeeManager"
        to="/analytics"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeMobileSidebar"
      >
        <TrendingUp :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">ERP Reports & Graphs</span>
        <span v-if="!isCollapsed" class="badge badge-info font-mono">GRAPHS</span>
      </router-link>

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
  Calculator,
  ShoppingBag
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()
const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)

watch(() => route.path, () => {
  uiStore.closeMobileSidebar()
})

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function handleLogout() {
  uiStore.closeMobileSidebar()
  authStore.logout()
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
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(79, 70, 229, 0.2));
  border: 1px solid rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  font-weight: 700;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 15%;
  height: 70%;
  width: 4px;
  background: var(--primary);
  border-radius: var(--radius-full);
}

.nav-superadmin.active::before {
  background: var(--purple);
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
