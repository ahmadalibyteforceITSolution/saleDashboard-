<template>
  <div class="page-wrapper space-y-6">
    <!-- Header -->
    <div class="header-card">
      <div>
        <div class="pill-group">
          <span class="badge badge-info font-mono">MEDIMAGE SERVICES ERP</span>
          <span class="badge badge-success font-mono">360° JOURNEY TRACKER</span>
        </div>
        <h1 class="header-title">Universal Machine Search</h1>
        <p class="header-subtitle">
          Search by exact <strong class="text-white">Serial Number</strong> or <strong class="text-white font-mono">Machine Code</strong> to instantly reveal complete purchase, branch, sale, and payment history.
        </p>
      </div>
    </div>

    <!-- Search Box Card -->
    <div class="glass-panel p-6 shadow-2xl">
      <form @submit.prevent="executeSearch" class="search-form">
        <div class="input-wrapper">
          <div class="search-icon-box">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Enter exact Serial Number or Machine Code (e.g. SN-US10-8803 or MC-103)..."
            class="custom-search-input font-mono"
          />
          <button
            type="button"
            @click="triggerBarcodeSim"
            class="scan-barcode-btn"
            title="Scan Barcode"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Scan Barcode</span>
          </button>
        </div>

        <button type="submit" class="btn btn-primary btn-lg submit-search-btn">
          <span>Search Journey</span>
        </button>
      </form>

      <!-- Quick Chips for Testing -->
      <div class="quick-samples flex flex-wrap items-center gap-2 mt-4 text-xs">
        <span class="font-bold text-slate-300 uppercase">Quick Test Samples:</span>
        <button
          v-for="sample in sampleCodes"
          :key="sample"
          @click="selectSample(sample)"
          class="sample-chip font-mono"
        >
          {{ sample }}
        </button>
      </div>
    </div>

    <!-- Error / Not Found Alert -->
    <div v-if="searchError" class="p-5 bg-red-950/60 border border-red-800 rounded-2xl text-red-200 flex items-start gap-4 shadow-xl">
      <div class="p-2 bg-red-900/80 rounded-lg text-red-300">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div>
        <h3 class="font-bold text-lg text-white">Machine Not Found</h3>
        <p class="text-sm mt-1 text-red-200">{{ searchError }}</p>
      </div>
    </div>

    <!-- Machine Journey Results Card -->
    <div v-if="result" class="space-y-6">
      <!-- Main Overview Banner -->
      <div class="glass-panel p-6 shadow-2xl space-y-6">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-3">
              <span class="badge badge-purple font-mono">
                HSN: {{ result.serial.hsnCode || '9018.1200' }}
              </span>
              <span class="badge badge-neutral">
                Division: {{ result.serial.division || 'Medimage Services' }}
              </span>
            </div>
            <h2 class="text-3xl font-extrabold text-white mt-2">{{ result.product?.name || result.serial.sku }}</h2>
            <div class="flex flex-wrap items-center gap-4 mt-2 font-mono text-sm">
              <span class="text-blue-400 font-bold bg-blue-950 px-3 py-1 rounded-md border border-blue-800">
                Serial #: {{ result.serial.serialCode }}
              </span>
              <span class="text-purple-400 font-bold bg-purple-950 px-3 py-1 rounded-md border border-purple-800">
                Machine Code: {{ result.serial.machineCode || 'N/A' }}
              </span>
            </div>
          </div>

          <!-- Status Badges -->
          <div class="flex flex-wrap items-center gap-3">
            <span
              :class="[
                'badge font-bold uppercase text-sm px-4 py-2',
                result.serial.status === 'Available' ? 'badge-success' :
                result.serial.status === 'Sold' ? 'badge-info' : 'badge-warning'
              ]"
            >
              Status: {{ result.serial.status }}
            </span>

            <span
              :class="[
                'badge font-bold uppercase text-sm px-4 py-2',
                result.serial.paymentStatus === 'Paid' ? 'badge-success' :
                result.serial.paymentStatus === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
              ]"
            >
              Payment: {{ result.serial.paymentStatus || 'Pending' }}
            </span>
          </div>
        </div>

        <!-- Printable Barcode Preview -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400 uppercase font-semibold">Barcode Tag</div>
              <div class="font-mono text-lg text-white font-bold mt-1">{{ result.serial.serialCode }}</div>
              <div class="text-xs text-slate-500">Internal Machine Code: {{ result.serial.machineCode }}</div>
            </div>
            <div class="bg-white p-2.5 rounded-lg text-slate-900 font-mono text-xs text-center font-bold border border-slate-300">
              |||||||||||||||||||||||<br>
              <span class="text-[10px] text-slate-700 tracking-tighter">{{ result.serial.serialCode }}</span>
            </div>
          </div>

          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400 uppercase font-semibold">Current Branch Location</div>
              <div class="font-bold text-lg text-emerald-400 mt-1">{{ result.serial.allocationCity }} Branch</div>
              <div class="text-xs text-slate-400">Bin: {{ result.serial.binLocation || 'HQ-MAIN-01' }}</div>
            </div>
            <div class="p-3 bg-emerald-950/60 rounded-xl text-emerald-400 border border-emerald-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 Lifecycle Step Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Step 1: Purchase Import -->
        <div class="glass-card space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="text-xs font-bold uppercase text-blue-400 tracking-wider">1. Purchase / Import</span>
            <span class="badge badge-info font-mono">
              {{ result.serial.purchaseInvoiceNo || 'PO-RECORDED' }}
            </span>
          </div>
          <div>
            <div class="text-xs text-slate-400">Import Purchase Date</div>
            <div class="text-sm font-bold text-white mt-0.5">{{ result.serial.purchaseDate || result.serial.registeredDate }}</div>
          </div>
          <div>
            <div class="text-xs text-slate-400">Supplier</div>
            <div class="text-sm font-semibold text-slate-200">{{ result.purchaseOrder?.supplier || 'Imported Equipment Supplier' }}</div>
          </div>
          <div>
            <div class="text-xs text-slate-400">Cost Price</div>
            <div class="text-sm font-bold text-emerald-400">PKR {{ (result.product?.costPrice || 0).toLocaleString() }}</div>
          </div>
        </div>

        <!-- Step 2: Branch Inventory -->
        <div class="glass-card space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="text-xs font-bold uppercase text-indigo-400 tracking-wider">2. Branch Stock</span>
            <span class="badge badge-purple font-mono">
              {{ result.serial.allocationCity }}
            </span>
          </div>
          <div>
            <div class="text-xs text-slate-400">Assigned Branch</div>
            <div class="text-sm font-bold text-white mt-0.5">{{ result.serial.allocationCity }} Office</div>
          </div>
          <div>
            <div class="text-xs text-slate-400">Storage Rack / Bin</div>
            <div class="text-sm font-mono text-slate-300">{{ result.serial.binLocation }}</div>
          </div>
          <div>
            <div class="text-xs text-slate-400">Stock Status</div>
            <div class="text-sm font-semibold text-blue-300">{{ result.serial.status }}</div>
          </div>
        </div>

        <!-- Step 3: Sales Invoice -->
        <div class="glass-card space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="text-xs font-bold uppercase text-purple-400 tracking-wider">3. Sale Details</span>
            <span v-if="result.serial.invoiceNo" class="badge badge-purple font-mono">
              {{ result.serial.invoiceNo }}
            </span>
            <span v-else class="text-xs text-slate-500 italic">Unsold</span>
          </div>
          <template v-if="result.serial.invoiceNo">
            <div>
              <div class="text-xs text-slate-400">Customer Name</div>
              <div class="text-sm font-bold text-white mt-0.5">{{ result.serial.customer }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400">Sale Date</div>
              <div class="text-sm font-medium text-slate-300">{{ result.serial.soldDate }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400">Unit Sale Price</div>
              <div class="text-sm font-bold text-amber-400">PKR {{ (result.serial.salePrice || result.product?.sellingPrice || 0).toLocaleString() }}</div>
            </div>
          </template>
          <template v-else>
            <div class="py-4 text-center text-slate-500 text-xs italic">
              Machine currently in available branch stock.
            </div>
          </template>
        </div>

        <!-- Step 4: Machine Payment Tracking -->
        <div class="glass-card space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="text-xs font-bold uppercase text-emerald-400 tracking-wider">4. Payment Track</span>
            <span
              :class="[
                'badge font-bold uppercase',
                result.serial.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'
              ]"
            >
              {{ result.serial.paymentStatus || 'Pending' }}
            </span>
          </div>
          <template v-if="result.serial.paymentReceiptNo">
            <div>
              <div class="text-xs text-slate-400">Receipt #</div>
              <div class="text-sm font-mono font-bold text-emerald-300 mt-0.5">{{ result.serial.paymentReceiptNo }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400">Payment Date & Notes</div>
              <div class="text-sm text-slate-300">{{ result.serial.paymentDate }}</div>
              <div class="text-xs text-slate-500 italic truncate">{{ result.serial.paymentNotes }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400">Received Amount</div>
              <div class="text-sm font-bold text-emerald-400">PKR {{ (result.serial.paymentAmount || 0).toLocaleString() }}</div>
            </div>
          </template>
          <template v-else>
            <div class="py-4 text-center text-red-400/80 text-xs italic font-medium">
              Payment Pending for Machine Code {{ result.serial.machineCode }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'

const route = useRoute()
const dataStore = useDataStore()
const uiStore = useUiStore()

const searchQuery = ref('')
const result = ref(null)
const searchError = ref('')

const sampleCodes = ['SN-US10-8803', 'MC-103', 'MC-104', 'SN-LSR-9902', 'MC-202']

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q
    executeSearch()
  }
})

function selectSample(code) {
  searchQuery.value = code
  executeSearch()
}

function executeSearch() {
  searchError.value = ''
  result.value = null

  if (!searchQuery.value || !searchQuery.value.trim()) {
    searchError.value = 'Please enter a Serial Number or Machine Code to search.'
    return
  }

  const found = dataStore.searchMachineJourney(searchQuery.value)
  if (found) {
    result.value = found
  } else {
    searchError.value = `No equipment matching "${searchQuery.value}" was found in the ERP database. Please check exact spelling or barcode.`
  }
}

function triggerBarcodeSim() {
  uiStore.showModal(
    'Barcode Scanner Active',
    'Barcode scanner listener initialized. Ready to receive scan input from hardware scanner or mobile camera.',
    'info',
    'Ready'
  )
}
</script>

<style scoped>
.header-card {
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pill-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.header-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0.25rem 0;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #93c5fd;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .search-form {
    flex-direction: row;
  }
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.search-icon-box {
  position: absolute;
  top: 50%;
  left: 1.2rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.custom-search-input {
  width: 100%;
  padding-left: 3.5rem;
  padding-right: 11rem;
  padding-top: 1.1rem;
  padding-bottom: 1.1rem;
  min-height: 3.5rem;
  background-color: var(--bg-dark-900);
  border: 1px solid var(--border-color-strong);
  border-radius: 0.75rem;
  color: var(--text-main);
  font-size: 1.05rem;
  transition: all 0.2s;
}

[data-theme="light"] .custom-search-input {
  background-color: #ffffff !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}

.custom-search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.scan-barcode-btn {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.55rem 1rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  border: 1px solid #1e40af !important;
  border-radius: 0.5rem;
  color: #ffffff !important;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
  transition: all 0.2s ease;
  z-index: 10;
}

.scan-barcode-btn svg,
.scan-barcode-btn span {
  color: #ffffff !important;
  stroke: #ffffff;
}

.scan-barcode-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.6);
}

[data-theme="light"] .scan-barcode-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  border-color: #1e40af !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
}

[data-theme="light"] .scan-barcode-btn svg,
[data-theme="light"] .scan-barcode-btn span {
  color: #ffffff !important;
  stroke: #ffffff;
}

.submit-search-btn {
  padding-left: 2rem;
  padding-right: 2rem;
}

.sample-chip {
  padding: 0.3rem 0.75rem;
  background: var(--bg-dark-700);
  border: 1px solid var(--border-color-strong);
  border-radius: 0.375rem;
  color: #93c5fd;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

[data-theme="light"] .sample-chip {
  background: #e2e8f0 !important;
  border-color: #cbd5e1 !important;
  color: #1e293b !important;
}

.sample-chip:hover {
  background: var(--primary) !important;
  color: #ffffff !important;
  border-color: var(--primary) !important;
}
</style>
