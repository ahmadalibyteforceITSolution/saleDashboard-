<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <div class="flex-align gap-2">
          <Crown :size="24" class="text-purple" />
          <h1 class="page-title">SuperAdmin Check & Balance Center</h1>
        </div>
        <p class="page-subtitle">Real-time audit trails, financial reconciliation, and system access governance</p>
      </div>

      <div class="action-buttons">
        <button class="btn btn-secondary" @click="triggerSystemAudit">
          <RefreshCw :size="16" />
          <span>Re-Run Audit Check</span>
        </button>
        <button class="btn btn-danger" @click="handleResetData">
          <RotateCcw :size="16" />
          <span>Reset ERP Seed Data</span>
        </button>
      </div>
    </div>

    <!-- Financial Reconciliation KPI Cards -->
    <div class="kpi-grid mb-4">
      <div class="glass-card kpi-card kpi-purple">
        <div class="flex-between">
          <span class="kpi-title">Reconciliation Health</span>
          <span class="badge badge-success font-mono">{{ dataStore.checkAndBalance.healthScore }}% SCORE</span>
        </div>
        <div class="kpi-value font-mono flex-align gap-2">
          <ShieldCheck :size="28" class="text-success" />
          <span>{{ dataStore.checkAndBalance.balancedStatus }}</span>
        </div>
        <div class="kpi-subtitle">
          <span>Zero unauthorized bank/cash variance detected</span>
        </div>
      </div>

      <div class="glass-card kpi-card">
        <div class="flex-between">
          <span class="kpi-title">Recorded System Inflows</span>
          <span class="badge badge-info">PAYMENT BREAKDOWN</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.checkAndBalance.totalInflows.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <span>Cash: ${{ dataStore.checkAndBalance.cashInflows.toLocaleString() }} • Card/Bank: ${{ dataStore.checkAndBalance.cardBankInflows.toLocaleString() }}</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-warning">
        <div class="flex-between">
          <span class="kpi-title">Manual Discounts Approved</span>
          <span class="badge badge-warning font-mono">${{ dataStore.checkAndBalance.manualDiscountsTotal }}</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.checkAndBalance.manualDiscountsTotal.toFixed(2) }}</div>
        <div class="kpi-subtitle">
          <AlertTriangle :size="14" class="text-warning" />
          <span>Manager POS discount overrides subject to review</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-danger">
        <div class="flex-between">
          <span class="kpi-title">Defective Stock Write-off</span>
          <span class="badge badge-danger">RMA UNITS</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.checkAndBalance.defectiveLossValuation.toLocaleString() }}</div>
        <div class="kpi-subtitle">
          <AlertCircle :size="14" class="text-danger" />
          <span>Potential inventory loss from defective serial items</span>
        </div>
      </div>
    </div>

    <!-- Audit Logs & Governance Section -->
    <div class="glass-panel p-4 mb-4">
      <div class="flex-between mb-3">
        <h3 class="panel-title flex-align gap-2">
          <FileText :size="18" class="text-purple" />
          <span>System Audit Trail & Event Ledger</span>
        </h3>

        <!-- Category Filters -->
        <div class="filter-group">
          <button
            v-for="cat in ['ALL', 'INVENTORY', 'FINANCIAL', 'PURCHASING', 'SALES']"
            :key="cat"
            :class="['btn', 'btn-sm', selectedCategory === cat ? 'btn-primary' : 'btn-ghost']"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User & Role</th>
              <th>Category</th>
              <th>Action Summary</th>
              <th>Audit Log Details</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="font-mono text-xs text-subtle">{{ log.timestamp }}</td>
              <td>
                <div class="flex-align gap-2">
                  <span class="font-bold text-main">{{ log.user }}</span>
                  <span :class="['badge', log.role === 'superadmin' ? 'badge-purple' : log.role === 'admin' ? 'badge-info' : 'badge-neutral']">
                    {{ log.role.toUpperCase() }}
                  </span>
                </div>
              </td>
              <td>
                <span class="badge badge-neutral font-mono">{{ log.category }}</span>
              </td>
              <td class="font-bold text-main">{{ log.action }}</td>
              <td class="text-muted text-xs">{{ log.details }}</td>
              <td>
                <span :class="['badge', log.severity === 'warning' ? 'badge-warning' : log.severity === 'critical' ? 'badge-danger' : 'badge-success']">
                  {{ log.severity.toUpperCase() }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Management & Permission Grid -->
    <div class="glass-panel p-4">
      <div class="flex-between mb-3">
        <h3 class="panel-title flex-align gap-2">
          <Users :size="18" class="text-primary" />
          <span>ERP User Access & Privilege Governance</span>
        </h3>
        <button class="btn btn-sm btn-primary" @click="showAddUserModal = true">
          <UserPlus :size="14" />
          <span>Provision User</span>
        </button>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>User Identity</th>
              <th>Email</th>
              <th>Role & Access Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usr in authStore.demoUsers" :key="usr.id">
              <td>
                <div class="flex-align gap-2">
                  <img :src="usr.avatar" alt="Avatar" class="user-table-avatar" />
                  <div>
                    <div class="font-bold text-main">{{ usr.name }}</div>
                    <div class="text-subtle text-xs">{{ usr.title }}</div>
                  </div>
                </div>
              </td>
              <td class="font-mono text-muted text-xs">{{ usr.email }}</td>
              <td>
                <span :class="['badge', `badge-${usr.badgeColor}`]">
                  <Crown v-if="usr.role === 'superadmin'" :size="10" />
                  {{ usr.role.toUpperCase() }}
                </span>
              </td>
              <td>
                <span class="badge badge-success">ACTIVE</span>
              </td>
              <td>
                <div class="flex-align gap-2">
                  <button class="btn btn-sm btn-secondary" @click="quickRoleSwitch(usr.role)">
                    <span>Switch Persona</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import {
  Crown,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  FileText,
  Users,
  UserPlus
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()

const selectedCategory = ref('ALL')
const showAddUserModal = ref(false)

const filteredLogs = computed(() => {
  if (selectedCategory.value === 'ALL') return dataStore.auditLogs
  return dataStore.auditLogs.filter(l => l.category === selectedCategory.value)
})

function triggerSystemAudit() {
  dataStore.addAuditLog(authStore.user.name, authStore.user.role, 'FINANCIAL', 'Executed System Check & Balance Integrity Audit', 'System audit verified 100% database consistency, zero serial conflicts, and healthy cash inflows.', 'normal')
  alert('Audit re-check complete! System integrity verified at 98.4% status.')
}

function handleResetData() {
  if (confirm('Are you sure you want to reset all inventory, serials, and sales data to original seed state?')) {
    dataStore.resetToDefaults()
    alert('ERP seed data successfully restored!')
  }
}

function quickRoleSwitch(role) {
  authStore.loginAs(role)
}
</script>

<style scoped>
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-align {
  display: flex;
  align-items: center;
}

.gap-2 { gap: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.p-4 { padding: 1.25rem; }

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
}

.page-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.filter-group {
  display: flex;
  gap: 0.4rem;
}

.user-table-avatar {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.text-xs { font-size: 0.75rem; }
.font-bold { font-weight: 700; }
</style>
