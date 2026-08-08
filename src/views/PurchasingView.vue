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
        <div class="kpi-value text-white mt-2">PKR {{ dataStore.totalPurchasesCost.toLocaleString() }}</div>
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
                    {{ s.machineCode }} ({{ s.serialCode }})
                  </span>
                </div>
              </td>
              <td class="font-bold text-emerald-400">PKR {{ po.totalAmount.toLocaleString() }}</td>
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
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <Truck :size="22" class="text-blue-400" />
            <span>New Bulk Equipment Purchase Entry</span>
          </h3>
          <button @click="showPOModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="submitPO" class="modal-body space-y-4">
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
                {{ p.name }} (Cost: PKR {{ p.costPrice.toLocaleString() }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="form-group">
              <label class="form-label">Import Quantity *</label>
              <input v-model.number="itemQty" type="number" min="1" max="500" required class="form-input font-bold" />
            </div>

            <div class="form-group">
              <label class="form-label">Machine Code Prefix *</label>
              <input v-model="machinePrefix" type="text" required placeholder="e.g. MC-" class="form-input font-mono uppercase" />
            </div>

            <div class="form-group">
              <label class="form-label">Starting Code # *</label>
              <input v-model.number="startMachineCode" type="number" min="1" required class="form-input font-mono font-bold" />
            </div>
          </div>

          <!-- Preview Machine Codes -->
          <div v-if="itemQty > 0" class="glass-panel p-3 text-xs space-y-1">
            <div class="font-bold text-slate-300">Generated Machine Codes Preview:</div>
            <div class="font-mono text-purple-400 font-bold">
              {{ machinePrefix }}{{ startMachineCode }} to {{ machinePrefix }}{{ startMachineCode + itemQty - 1 }}
              <span class="text-subtle font-normal">({{ itemQty }} unique units)</span>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showPOModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <Check :size="16" />
              <span>Confirm Equipment Import</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
const startMachineCode = ref(101)

const form = ref({
  supplier: 'Mindray Global Imports',
  allocationCity: 'Peshawar'
})

async function submitPO() {
  if (!selectedProductId.value || !form.value.supplier || itemQty.value < 1) {
    uiStore.showModal('Validation Error', 'Please complete all required fields.', 'warning')
    return
  }

  const prod = dataStore.products.find(p => p.id === selectedProductId.value)
  if (!prod) return

  const serialsToCreate = []
  for (let i = 0; i < itemQty.value; i++) {
    const mCode = `${machinePrefix.value}${startMachineCode.value + i}`
    const sCode = `SN-${prod.sku.substring(4, 8)}-${Math.floor(1000 + Math.random() * 9000)}`

    if (dataStore.checkDuplicateSerial(sCode)) {
      uiStore.showModal('Duplicate Error', `Serial Number ${sCode} already exists in database! Serial numbers must be unique across the system.`, 'danger')
      return
    }

    if (dataStore.checkDuplicateMachineCode(mCode)) {
      uiStore.showModal('Duplicate Error', `Machine Code ${mCode} already exists in database! Machine codes must be unique across the system.`, 'danger')
      return
    }

    serialsToCreate.push({
      serialCode: sCode,
      machineCode: mCode,
      productId: prod.id,
      sku: prod.sku,
      status: 'Available',
      allocationCity: form.value.allocationCity,
      binLocation: 'BIN-MAIN-01',
      registeredDate: new Date().toISOString().split('T')[0]
    })
  }

  await dataStore.createPurchaseOrder({
    supplier: form.value.supplier,
    allocationCity: form.value.allocationCity,
    items: [{ productId: prod.id, productName: prod.name, qty: itemQty.value, unitCost: prod.costPrice }],
    generatedSerials: serialsToCreate,
    totalAmount: itemQty.value * prod.costPrice
  }, authStore.user)

  uiStore.showModal(
    'Import Created',
    `Successfully created Purchase Order and generated ${serialsToCreate.length} unit Machine Codes (${machinePrefix.value}${startMachineCode.value} to ${machinePrefix.value}${startMachineCode.value + itemQty.value - 1}).`,
    'success'
  )

  showPOModal.value = false
}
</script>
