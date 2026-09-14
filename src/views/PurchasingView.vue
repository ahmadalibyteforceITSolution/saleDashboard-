<template>
  <div class="page-wrapper space-y-6">
    <!-- Header Banner -->
    <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-info font-mono">MEDIMAGE IMPORT MANAGEMENT</span>
          <span class="badge badge-success font-mono">BULK MACHINE GENERATOR</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">Import Purchase Orders</h1>
        <p class="text-slate-300 text-sm mt-1">
          Register bulk medical device imports (Ultrasound, Laser Devices), internal machine codes (e.g. 1-20, 21-50), and HSN tax codes.
        </p>
      </div>

      <button @click="showPOModal = true" class="btn btn-primary btn-lg shadow-xl">
        <Truck :size="18" />
        <span>New Equipment Purchase</span>
      </button>
    </div>

    <!-- PO Summary KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card glass-panel p-5">
        <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
          <span>Total Inbound Expenditures</span>
          <span class="badge badge-info font-mono">MEDIMAGE ERP</span>
        </div>
        <div class="kpi-value text-white mt-2">PKR {{ (dataStore.totalPurchasesCost || 0).toLocaleString() }}</div>
        <div class="kpi-subtitle text-subtle">Equipment import vendor purchases</div>
      </div>

      <div class="kpi-card kpi-success glass-panel p-5">
        <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
          <span>Completed Orders</span>
          <span class="badge badge-success font-mono">FULFILLED</span>
        </div>
        <div class="kpi-value text-emerald-400 mt-2">{{ dataStore.purchaseOrders.length }} Orders</div>
        <div class="kpi-subtitle text-subtle">All serial numbers & machine codes registered</div>
      </div>
    </div>

    <!-- Purchase Orders Table -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Truck :size="20" class="text-blue-400" />
          <span>Purchase Orders & Machine Imports</span>
        </h3>
        <span class="badge badge-neutral font-mono">{{ dataStore.purchaseOrders.length }} POs</span>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Order Date</th>
              <th>Branch</th>
              <th>Equipment Items</th>
              <th>Generated Serials & Machine Codes</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="po in dataStore.purchaseOrders" :key="po.poNumber">
              <td class="font-mono font-bold text-blue-400">{{ po.poNumber }}</td>
              <td class="font-bold text-main">{{ po.supplier }}</td>
              <td class="font-mono text-xs text-subtle">{{ po.orderDate }}</td>
              <td>
                <span class="badge badge-purple">
                  <Building2 :size="10" />
                  {{ po.allocationCity || 'Peshawar' }}
                </span>
              </td>
              <td>
                <div v-for="item in po.items" :key="item.productName" class="text-xs py-0.5">
                  <span class="font-bold text-white">{{ item.qty }}x</span> {{ item.productName }}
                </div>
              </td>
              <td>
                <div class="flex flex-wrap gap-1 max-w-xs max-h-16 overflow-y-auto">
                  <span v-for="s in po.generatedSerials" :key="s.serialCode" class="badge badge-neutral font-mono text-[11px]">
                    {{ s.machineCode }} ({{ (s.serialCode || '').replace(/^SN-/i, '') }})
                  </span>
                </div>
              </td>
              <td class="font-bold text-emerald-400">PKR {{ (po.totalAmount || 0).toLocaleString() }}</td>
            </tr>
            <tr v-if="dataStore.purchaseOrders.length === 0">
              <td colspan="7" class="p-6 text-center text-subtle italic">No purchase orders logged.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create PO Modal -->
    <div v-if="showPOModal" class="modal-backdrop" @click.self="showPOModal = false">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <h3 class="text-xl font-bold text-main flex items-center gap-2">
            <Truck :size="22" class="text-primary" />
            <span>New Bulk Equipment Purchase Entry</span>
          </h3>
          <button @click="showPOModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="submitPO" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="modal-body space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Supplier Name *</label>
                <input v-model="form.supplier" type="text" required placeholder="e.g. Siemens Healthcare GmbH..." class="form-input font-bold" />
              </div>

              <div class="form-group">
                <label class="form-label">Target Branch *</label>
                <select v-model="form.allocationCity" required class="form-select font-bold">
                  <option value="Peshawar">Peshawar HO</option>
                  <option value="Multan">Multan Branch</option>
                  <option value="Lahore">Lahore Branch</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Select Equipment Product *</label>
              <select v-model="selectedProductId" required class="form-select font-bold">
                <option value="" disabled>Choose Product SKU...</option>
                <option v-for="p in dataStore.products" :key="p.id" :value="p.id">
                  {{ p.name }} (Cost: PKR {{ (p.costPrice || 0).toLocaleString() }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="form-group">
                <label class="form-label">Import Quantity *</label>
                <input v-model.number="itemQty" type="number" min="1" max="1000" required class="form-input font-bold" />
              </div>

              <div class="form-group">
                <label class="form-label">Machine Code Prefix</label>
                <input v-model="machinePrefix" type="text" placeholder="e.g. MC- or leave empty for numbers" class="form-input font-mono uppercase" />
              </div>

              <div class="form-group">
                <label class="form-label">Start Machine Code # *</label>
                <input v-model.number="startMachineCode" type="number" min="1" required class="form-input font-mono font-bold" />
              </div>
            </div>

            <!-- Serial Entry Mode Toggle -->
            <div class="form-group">
              <label class="form-label">Serial Number Entry Method</label>
              <div class="flex items-center gap-4 text-xs font-semibold">
                <label class="flex items-center gap-1.5 cursor-pointer text-slate-200">
                  <input type="radio" value="sequential" v-model="serialInputMode" class="text-indigo-600" />
                  <span>Sequential Prefix / Range (e.g. US10-8801 to US10-9100)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer text-slate-200">
                  <input type="radio" value="bulkPaste" v-model="serialInputMode" class="text-indigo-600" />
                  <span>Paste Bulk Serial Numbers (Comma / Newline separated)</span>
                </label>
              </div>
            </div>

            <!-- Mode A: Sequential Prefix -->
            <div v-if="serialInputMode === 'sequential'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Serial Prefix</label>
                <input v-model="serialPrefix" type="text" placeholder="e.g. US10- or SN-" class="form-input font-mono uppercase" />
              </div>
              <div class="form-group">
                <label class="form-label">Starting Serial Number #</label>
                <input v-model.number="startSerialNum" type="number" min="1" class="form-input font-mono font-bold" />
              </div>
            </div>

            <!-- Mode B: Bulk Paste -->
            <div v-if="serialInputMode === 'bulkPaste'" class="form-group">
              <div class="flex justify-between items-center mb-1">
                <label class="form-label mb-0">Paste Serial Numbers (one per line or comma separated)</label>
                <span class="text-xs font-mono font-bold" :class="pastedSerialsList.length === itemQty ? 'text-emerald-400' : 'text-amber-400'">
                  {{ pastedSerialsList.length }} / {{ itemQty }} entered
                </span>
              </div>
              <textarea
                v-model="bulkSerialsRawText"
                rows="3"
                placeholder="Paste 300 serial numbers here, e.g.:&#10;US10-9001&#10;US10-9002&#10;US10-9003..."
                class="form-textarea font-mono text-xs"
              ></textarea>
            </div>

            <!-- Machine Code <-> Serial Number Mapping Preview -->
            <div v-if="computedUnitMapping.length > 0" class="glass-panel p-3 text-xs space-y-2 border border-indigo-500/20">
              <div class="flex justify-between items-center font-bold text-slate-300">
                <span>Machine Code ↔ Serial Number Mapping Preview ({{ computedUnitMapping.length }} units):</span>
                <span class="text-indigo-400 font-mono text-[11px]">Branch: {{ form.allocationCity }}</span>
              </div>
              <div class="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono">
                <div
                  v-for="(unit, idx) in computedUnitMapping.slice(0, 15)"
                  :key="idx"
                  class="flex justify-between items-center py-0.5 px-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]"
                >
                  <span class="text-purple-400 font-bold">Code: {{ unit.machineCode }}</span>
                  <span class="text-slate-500">↔</span>
                  <span class="text-blue-300 font-bold">SN: {{ unit.serialCode }}</span>
                </div>
                <div v-if="computedUnitMapping.length > 15" class="text-center text-[10px] text-slate-400 italic py-1">
                  ... and {{ computedUnitMapping.length - 15 }} more units (Codes: {{ computedUnitMapping[0].machineCode }} to {{ computedUnitMapping[computedUnitMapping.length - 1].machineCode }})
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showPOModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <Check :size="16" />
              <span>Confirm Equipment Import ({{ computedUnitMapping.length }} Units)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  Truck,
  Building2,
  Check
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const showPOModal = ref(false)
const selectedProductId = ref('')
const itemQty = ref(10)
const machinePrefix = ref('MC-')
const startMachineCode = ref(1)

const serialInputMode = ref('sequential') // 'sequential' | 'bulkPaste'
const serialPrefix = ref('')
const startSerialNum = ref(1001)
const bulkSerialsRawText = ref('')

const form = ref({
  supplier: 'Mindray Global Imports',
  allocationCity: 'Peshawar'
})

const pastedSerialsList = computed(() => {
  if (!bulkSerialsRawText.value) return []
  return bulkSerialsRawText.value
    .split(/[\n,]+/)
    .map(s => s.trim().replace(/^SN-/i, ''))
    .filter(Boolean)
})

const computedUnitMapping = computed(() => {
  const prod = dataStore.products.find(p => p.id === selectedProductId.value)
  const defaultSku = prod ? (prod.sku || 'MED').replace(/^SN-/i, '') : 'MED'
  const count = Number(itemQty.value) || 0
  const mapping = []

  for (let i = 0; i < count; i++) {
    const mCode = `${machinePrefix.value || ''}${startMachineCode.value + i}`
    let sCode = ''

    if (serialInputMode.value === 'bulkPaste') {
      sCode = pastedSerialsList.value[i] || `${defaultSku}-${startMachineCode.value + i}`
    } else {
      const pfx = serialPrefix.value || `${defaultSku}-`
      sCode = `${pfx}${startSerialNum.value + i}`
    }

    mapping.push({
      machineCode: mCode,
      serialCode: sCode
    })
  }

  return mapping
})

async function submitPO() {
  if (!selectedProductId.value || !form.value.supplier || itemQty.value < 1) {
    uiStore.showModal('Validation Error', 'Please select product, supplier, and quantity.', 'warning')
    return
  }

  const prod = dataStore.products.find(p => p.id === selectedProductId.value)
  if (!prod) return

  const mapping = computedUnitMapping.value
  if (mapping.length === 0) {
    uiStore.showModal('Validation Error', 'No machines to import.', 'warning')
    return
  }

  // Strict Duplicate Validation across entire system
  for (const item of mapping) {
    if (dataStore.checkDuplicateSerial(item.serialCode)) {
      uiStore.showModal(
        'Duplicate Serial Error ⚠️',
        `Serial Number "${item.serialCode}" already exists in the database! Every machine must have a strictly unique Serial Number.`,
        'danger'
      )
      return
    }

    if (dataStore.checkDuplicateMachineCode(item.machineCode)) {
      uiStore.showModal(
        'Duplicate Machine Code Error ⚠️',
        `Internal Machine Code "${item.machineCode}" already exists in the database! Machine codes must be unique.`,
        'danger'
      )
      return
    }
  }

  const serialsToCreate = mapping.map(item => ({
    serialCode: item.serialCode,
    machineCode: item.machineCode,
    productId: prod.id,
    sku: prod.sku,
    status: 'Available',
    allocationCity: form.value.allocationCity,
    binLocation: 'BIN-MAIN-01',
    registeredDate: new Date().toISOString().split('T')[0]
  }))

  await dataStore.createPurchaseOrder({
    supplier: form.value.supplier,
    allocationCity: form.value.allocationCity,
    items: [{ productId: prod.id, productName: prod.name, qty: mapping.length, unitCost: prod.costPrice }],
    generatedSerials: serialsToCreate,
    totalAmount: mapping.length * prod.costPrice
  }, authStore.user)

  uiStore.showModal(
    'Import Created ✅',
    `Successfully imported ${serialsToCreate.length} units of "${prod.name}" under PO with unique Serial Numbers and Machine Codes mapped.`,
    'success'
  )

  showPOModal.value = false
  bulkSerialsRawText.value = ''
}
</script>
