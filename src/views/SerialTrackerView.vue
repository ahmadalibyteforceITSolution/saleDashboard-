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
              <th>Machine Code</th>
              <th>Product SKU</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Branch Allocation</th>
              <th>Inbound Date</th>
              <th>Sold / Customer</th>
              <th>Invoice Ref</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ser in filteredSerials" :key="ser.serialCode">
              <td class="font-mono font-bold text-primary text-base">{{ ser.serialCode }}</td>
              <td class="font-mono font-bold text-purple-400">{{ ser.machineCode || 'N/A' }}</td>
              <td class="font-mono text-main">{{ ser.sku }}</td>
              <td>
                <span :class="['badge', ser.status === 'Available' ? 'badge-success' : ser.status === 'Defective' ? 'badge-danger' : 'badge-neutral']">
                  {{ ser.status }}
                </span>
              </td>
              <td>
                <span :class="['badge', ser.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger']">
                  {{ ser.paymentStatus || 'Pending' }}
                </span>
              </td>
              <td>
                <span :class="['badge', ser.allocationCity === 'Lahore' ? 'badge-info' : ser.allocationCity === 'Multan' ? 'badge-success' : 'badge-purple']">
                  <Building2 :size="10" />
                  {{ ser.allocationCity || 'Peshawar' }}
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
                  <button class="btn btn-sm btn-primary" @click="router.push({ path: '/universal-search', query: { q: ser.serialCode } })">
                    360° Journey
                  </button>
                  <button class="btn btn-sm btn-secondary" @click="selectedSerialDetail = ser">
                    <History :size="13" />
                    <span>Lineage</span>
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
      <div class="modal-content max-w-lg">
        <div class="modal-header">
          <div>
            <h3 class="font-mono font-bold text-indigo-400 text-lg flex items-center gap-2">
              <span>{{ selectedSerialDetail.serialCode }}</span>
              <span v-if="selectedSerialDetail.machineCode" class="text-xs bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-mono">({{ selectedSerialDetail.machineCode }})</span>
            </h3>
            <span class="text-xs text-subtle">SKU: {{ selectedSerialDetail.sku }} • Branch: {{ selectedSerialDetail.allocationCity || 'Peshawar' }}</span>
          </div>
          <button class="btn-icon text-slate-400 hover:text-white" @click="selectedSerialDetail = null">✕</button>
        </div>

        <div class="modal-body space-y-4">
          <div class="glass-panel p-3.5 space-y-2 border border-slate-800 text-xs">
            <div class="flex justify-between">
              <span class="text-subtle">Machine Code:</span>
              <span class="font-mono font-bold text-purple-400">{{ selectedSerialDetail.machineCode || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-subtle">Bin Location:</span>
              <span class="font-mono text-indigo-300 font-bold">{{ selectedSerialDetail.binLocation || 'HQ-PEW-A01' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-subtle">Payment Status:</span>
              <span :class="['badge', selectedSerialDetail.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning']">
                {{ selectedSerialDetail.paymentStatus || 'Pending' }}
              </span>
            </div>
            <div v-if="selectedSerialDetail.salePrice" class="flex justify-between">
              <span class="text-subtle">Sale Price:</span>
              <span class="font-mono font-bold text-emerald-400">PKR {{ (selectedSerialDetail.salePrice || 0).toLocaleString() }}</span>
            </div>
          </div>

          <div class="serial-history-timeline space-y-4">
            <!-- Step 1: Inbound -->
            <div class="history-step flex gap-3">
              <div class="step-icon bg-emerald-950 text-emerald-400 p-2 rounded-full border border-emerald-800"><PackageCheck :size="14" /></div>
              <div class="step-info text-xs space-y-0.5">
                <div class="step-title font-bold text-white">1. Inbound Stock Registration</div>
                <div class="step-date text-slate-400">Registered on {{ selectedSerialDetail.registeredDate || selectedSerialDetail.purchaseDate || '2026-07-10' }}</div>
                <div class="step-desc text-slate-300">
                  Received under PO <span class="font-mono text-indigo-400 font-bold">{{ selectedSerialDetail.purchaseInvoiceNo || 'PO-2026-901' }}</span>. Allocated to <span class="font-bold text-white">{{ selectedSerialDetail.allocationCity || 'Peshawar' }}</span> depot.
                </div>
              </div>
            </div>

            <!-- Step 2: Current Status / Sale -->
            <div class="history-step flex gap-3">
              <div :class="['step-icon p-2 rounded-full border', selectedSerialDetail.status === 'Sold' ? 'bg-blue-950 text-blue-400 border-blue-800' : selectedSerialDetail.status === 'Defective' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-slate-800 text-amber-400 border-slate-700']">
                <CheckCircle2 v-if="selectedSerialDetail.status === 'Sold'" :size="14" />
                <AlertTriangle v-else-if="selectedSerialDetail.status === 'Defective'" :size="14" />
                <Clock v-else :size="14" />
              </div>
              <div class="step-info text-xs space-y-0.5">
                <div class="step-title font-bold text-white">2. Current Status: <span class="text-indigo-400">{{ selectedSerialDetail.status }}</span></div>
                <div v-if="selectedSerialDetail.soldDate" class="step-date text-slate-400">Outbound Sold on {{ selectedSerialDetail.soldDate }}</div>
                <div v-if="selectedSerialDetail.customer" class="step-desc text-slate-300">
                  Issued to <span class="font-bold text-white">{{ selectedSerialDetail.customer }}</span> under invoice <span class="font-mono text-indigo-400 font-bold">{{ selectedSerialDetail.invoiceNo }}</span>.
                  <div v-if="selectedSerialDetail.paymentReceiptNo" class="text-emerald-400 mt-1">Receipt: {{ selectedSerialDetail.paymentReceiptNo }}</div>
                </div>
                <div v-else-if="selectedSerialDetail.status === 'Defective'" class="step-desc text-red-300">
                  Unit flagged as defective. Moved to RMA Hold bin for technical inspection.
                </div>
                <div v-else class="step-desc text-slate-400">
                  Unit in active available stock in <span class="text-white font-bold">{{ selectedSerialDetail.allocationCity || 'Peshawar' }}</span> depot.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer flex justify-between items-center">
          <div class="flex items-center gap-2">
            <button v-if="selectedSerialDetail.status === 'Available'" @click="updateSerialStatusHandler(selectedSerialDetail, 'Defective')" class="btn btn-xs btn-danger">
              <AlertTriangle :size="12" />
              <span>Flag Defective</span>
            </button>
            <button v-if="selectedSerialDetail.status === 'Defective'" @click="updateSerialStatusHandler(selectedSerialDetail, 'Available')" class="btn btn-xs btn-success">
              <CheckCircle2 :size="12" />
              <span>Restore Available</span>
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" @click="selectedSerialDetail = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
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

async function updateSerialStatusHandler(serial, newStatus) {
  await dataStore.updateSerialStatus(serial.serialCode, newStatus, authStore.user)
  serial.status = newStatus
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

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.85rem;
  }

  .action-buttons {
    width: 100%;
  }

  .search-box {
    width: 100%;
  }

  .filter-pills {
    width: 100%;
    flex-wrap: wrap;
  }

  .city-select {
    width: 100%;
  }
}
</style>
