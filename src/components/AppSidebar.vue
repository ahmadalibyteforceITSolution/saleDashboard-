<template>
  <aside :class="['sidebar', { 'collapsed': isCollapsed }]">
    <!-- Brand Logo Header -->
    <div class="sidebar-header">
      <div class="logo-box">
        <div class="logo-icon">
          <Layers class="icon-brand" />
        </div>
        <div v-if="!isCollapsed" class="logo-text">
          <span class="brand-title">NEXIS</span>
          <span class="brand-subtitle">ENTERPRISE ERP</span>
        </div>
      </div>
      <button class="btn-collapse" @click="toggleCollapse" title="Toggle Sidebar">
        <ChevronLeft v-if="!isCollapsed" :size="18" />
        <ChevronRight v-else :size="18" />
      </button>
    </div>

    <!-- Active User Role Badge -->
    <div v-if="!isCollapsed" class="user-role-card">
      <img :src="authStore.user?.avatar" alt="Avatar" class="user-avatar" />
      <div class="user-info">
        <span class="user-name">{{ authStore.user?.name }}</span>
        <span :class="['badge', `badge-${authStore.user?.badgeColor || 'purple'}`]">
          <ShieldAlert v-if="authStore.isSuperAdmin" :size="12" />
          {{ authStore.user?.role.toUpperCase() }}
        </span>
      </div>
    </div>

    <div class="line-divider"></div>

    <!-- Navigation Links -->
    <nav class="sidebar-nav">
      <div v-if="!isCollapsed" class="nav-section-title">CORE OPERATIONS</div>

      <router-link to="/dashboard" class="nav-item" active-class="active">
        <LayoutDashboard :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Dashboard</span>
      </router-link>

      <router-link v-if="authStore.isSuperAdmin" to="/superadmin" class="nav-item nav-superadmin" active-class="active">
        <Crown :size="20" class="nav-icon crown-icon" />
        <span v-if="!isCollapsed" class="nav-label">SuperAdmin Center</span>
        <span v-if="!isCollapsed" class="badge badge-purple font-mono">AUDIT</span>
      </router-link>

      <router-link to="/inventory" class="nav-item" active-class="active">
        <Package :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Inventory & Storage</span>
        <span v-if="!isCollapsed && dataStore.lowStockProducts.length > 0" class="badge badge-warning font-mono">
          {{ dataStore.lowStockProducts.length }}
        </span>
      </router-link>

      <router-link to="/serials" class="nav-item" active-class="active">
        <QrCode :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Serial Number Registry</span>
      </router-link>

      <div v-if="!isCollapsed" class="nav-section-title">FINANCIAL & TRANSACTIONS</div>

      <router-link to="/sales" class="nav-item" active-class="active">
        <ShoppingCart :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Sales & Outbound POS</span>
      </router-link>

      <router-link to="/purchasing" class="nav-item" active-class="active">
        <Truck :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Purchasing & POs</span>
      </router-link>

      <router-link to="/analytics" class="nav-item" active-class="active">
        <TrendingUp :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">Revenue & Profit</span>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
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
  Sun,
  Moon,
  LogOut
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const router = useRouter()

const isCollapsed = ref(false)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 260px;
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
  width: 80px;
}

.sidebar-header {
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-line);
}

.logo-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.brand-subtitle {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--primary);
  margin-top: 2px;
}

.btn-collapse {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-collapse:hover {
  color: var(--text-main);
  background: var(--primary);
}

.user-role-card {
  margin: 1rem;
  padding: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--primary);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: hidden;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.sidebar-nav {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  overflow-y: auto;
}

.nav-section-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-subtle);
  letter-spacing: 0.08em;
  padding: 0.75rem 0.5rem 0.25rem 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.7rem 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 500;
  position: relative;
  transition: var(--transition-fast);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.nav-item:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.04);
}

.nav-item.active {
  color: #ffffff;
  background: linear-gradient(90deg, var(--primary-glow), transparent);
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
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
</style>
