<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <div class="flex-align gap-2">
          <QrCode :size="24" class="text-secondary" />
          <h1 class="page-title">Serial Number Registry & Lineage</h1>
        </div>
        <p class="page-subtitle">Granular unit tracking from supplier inbound PO to city allocations (Lahore, Multan, Peshawar) & customer invoices</p>
      </div>

      <div class="action-buttons">
        <div class="stat-pill font-mono">
          <span class="text-muted">Total Units Registered:</span>
          <span class="text-primary font-bold ml-1">{{ dataStore.serials.length }}</span>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="glass-panel p-3 mb-4 flex-between flex-wrap gap-3">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Serial Number (e.g. SN-MAC), Customer, City, Invoice..."
          class="form-input search-input"
        />
      </div>

      <div class="filter-pills flex-align gap-2">
        <select v-model="selectedCity" class="form-select city-select">
          <option value="ALL">All Allocation Cities</option>
          <option value="Lahore">Lahore</option>
          <option value="Multan">Multan</option>
          <option value="Peshawar">Peshawar</option>
        </select>

        <button
          v-for="st in ['ALL', 'Available', 'Sold', 'Defective']"
          :key="st"
          :class="['btn', 'btn-sm', selectedStatus === st ? 'btn-primary' : 'btn-ghost']"
          @click="selectedStatus = st"
        >
          {{ st }}
        </button>
      </div>
    </div>

    <!-- Serial Numbers Master Table -->
    <div class="glass-panel p-4">
      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Product SKU</th>
              <th>Status</th>
              <th>City Allocation</th>
              <th>Bin Location</th>
              <th>Inbound Date</th>
              <th>Sold / Customer</th>
              <th>Invoice Ref</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ser in filteredSerials" :key="ser.serialCode">
              <td class="font-mono font-bold text-primary text-base">{{ ser.serialCode }}</td>
              <td class="font-mono text-main">{{ ser.sku }}</td>
              <td>
                <span :class="['badge', ser.status === 'Available' ? 'badge-success' : ser.status === 'Defective' ? 'badge-danger' : 'badge-neutral']">
                  {{ ser.status }}
                </span>
              </td>
              <td>
                <span :class="['badge', ser.allocationCity === 'Lahore' ? 'badge-info' : ser.allocationCity === 'Multan' ? 'badge-success' : 'badge-purple']">
                  <Building2 :size="10" />
                  {{ ser.allocationCity || 'Lahore' }}
                </span>
              </td>
              <td>
                <span class="font-mono badge badge-neutral">
                  <MapPin :size="10" />
                  {{ ser.binLocation }}
                </span>
              </td>
              <td class="font-mono text-xs text-subtle">{{ ser.registeredDate }}</td>
              <td class="text-xs">
                <span v-if="ser.customer" class="font-semibold text-main">{{ ser.customer }}</span>
                <span v-else class="text-subtle">Not Sold</span>
              </td>
              <td class="font-mono text-xs text-secondary">
                {{ ser.invoiceNo || 'N/A' }}
              </td>
              <td>
                <div class="flex-align gap-2">
                  <button class="btn btn-sm btn-secondary" @click="selectedSerialDetail = ser">
                    <History :size="13" />
                    <span>Lineage</span>
                  </button>
                  <button
                    v-if="ser.status !== 'Sold'"
                    class="btn btn-sm btn-ghost text-warning"
                    @click="toggleDefective(ser)"
                  >
                    <AlertTriangle :size="13" />
                    <span>{{ ser.status === 'Defective' ? 'Clear Defect' : 'Flag Defect' }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Serial Lineage Detail Modal -->
    <div v-if="selectedSerialDetail" class="modal-backdrop" @click.self="selectedSerialDetail = null">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h3 class="font-mono font-bold text-primary text-lg">{{ selectedSerialDetail.serialCode }}</h3>
            <span class="text-xs text-muted">SKU: {{ selectedSerialDetail.sku }} • Allocation: {{ selectedSerialDetail.allocationCity || 'Lahore' }}</span>
          </div>
          <button class="btn btn-ghost btn-sm" @click="selectedSerialDetail = null">&times;</button>
        </div>

        <div class="modal-body">
          <div class="serial-history-timeline">
            <div class="history-step">
              <div class="step-icon bg-success"><PackageCheck :size="14" /></div>
              <div class="step-info">
                <div class="step-title">Inbound Warehouse Receipt</div>
                <div class="step-date">Registered on {{ selectedSerialDetail.registeredDate }}</div>
                <div class="step-desc">
                  Allocated to <span class="font-bold text-main">{{ selectedSerialDetail.allocationCity || 'Lahore' }}</span> in Bin <span class="font-mono text-primary">{{ selectedSerialDetail.binLocation }}</span>
                </div>
              </div>
            </div>

            <div class="history-step">
              <div :class="['step-icon', selectedSerialDetail.status === 'Sold' ? 'bg-primary' : selectedSerialDetail.status === 'Defective' ? 'bg-danger' : 'bg-neutral']">
                <CheckCircle2 v-if="selectedSerialDetail.status === 'Sold'" :size="14" />
                <AlertTriangle v-else-if="selectedSerialDetail.status === 'Defective'" :size="14" />
                <Clock v-else :size="14" />
              </div>
              <div class="step-info">
                <div class="step-title">Current Unit Status: {{ selectedSerialDetail.status }}</div>
                <div v-if="selectedSerialDetail.soldDate" class="step-date">Outbound Sold on {{ selectedSerialDetail.soldDate }}</div>
                <div v-if="selectedSerialDetail.customer" class="step-desc">
                  Issued to <span class="font-bold text-main">{{ selectedSerialDetail.customer }}</span> under invoice <span class="font-mono text-secondary">{{ selectedSerialDetail.invoiceNo }}</span>
                </div>
                <div v-else-if="selectedSerialDetail.status === 'Defective'" class="step-desc text-danger">
                  Unit flagged as defective. Moved to RMA Hold bin.
                </div>
                <div v-else class="step-desc text-muted">
                  Unit currently in stock and ready for POS sale in {{ selectedSerialDetail.allocationCity || 'Lahore' }}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import {
  QrCode,
  Search,
  MapPin,
  Building2,
  History,
  AlertTriangle,
  PackageCheck,
  CheckCircle2,
  Clock
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()

const searchQuery = ref('')
const selectedCity = ref('ALL')
const selectedStatus = ref('ALL')
const selectedSerialDetail = ref(null)

const filteredSerials = computed(() => {
  return dataStore.serials.filter(s => {
    const matchesSearch = s.serialCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          s.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          (s.allocationCity && s.allocationCity.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
                          (s.customer && s.customer.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesCity = selectedCity.value === 'ALL' || s.allocationCity === selectedCity.value
    const matchesStatus = selectedStatus.value === 'ALL' || s.status === selectedStatus.value
    return matchesSearch && matchesCity && matchesStatus
  })
})

function toggleDefective(serial) {
  const newStatus = serial.status === 'Defective' ? 'Available' : 'Defective'
  dataStore.updateSerialStatus(serial.serialCode, newStatus, authStore.user)
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-2 { gap: 0.5rem; }
.mb-4 { margin-bottom: 1.25rem; }
.p-3 { padding: 0.85rem 1.25rem; }
.p-4 { padding: 1.25rem; }
.ml-1 { margin-left: 0.25rem; }

.search-box { position: relative; width: 340px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); }
.search-input { padding-left: 2.2rem; }
.city-select { width: 175px; }

.stat-pill {
  padding: 0.4rem 0.85rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.serial-history-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.history-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.bg-success { background: var(--success); }
.bg-primary { background: var(--primary); }
.bg-danger { background: var(--danger); }
.bg-neutral { background: var(--text-subtle); }

.step-title { font-weight: 700; font-size: 0.9rem; color: var(--text-main); }
.step-date { font-size: 0.75rem; color: var(--text-muted); margin: 2px 0; }
.step-desc { font-size: 0.82rem; color: var(--text-muted); }
.text-xs { font-size: 0.75rem; }
.text-base { font-size: 0.95rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
</style>
