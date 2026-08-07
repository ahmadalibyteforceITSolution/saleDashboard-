<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <div class="flex-align gap-2">
          <Truck :size="24" class="text-primary" />
          <h1 class="page-title">Purchasing & Vendor Orders</h1>
        </div>
        <p class="page-subtitle">Manage supplier invoices, purchase orders, and city inbound stock allocations (Lahore, Multan, Peshawar)</p>
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary" @click="showPOModal = true">
          <Plus :size="16" />
          <span>Create Purchase Order</span>
        </button>
      </div>
    </div>

    <!-- PO Summary KPI Cards -->
    <div class="kpi-grid mb-4">
      <div class="glass-card kpi-card">
        <div class="flex-between">
          <span class="kpi-title">Total Inbound Expenditures</span>
          <span class="badge badge-info">ALL TIME POs</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.totalPurchasesCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <span>Supplier vendor payments</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-success">
        <div class="flex-between">
          <span class="kpi-title">Completed Orders</span>
          <span class="badge badge-success">FULFILLED</span>
        </div>
        <div class="kpi-value font-mono">{{ dataStore.purchaseOrders.length }} Orders</div>
        <div class="kpi-subtitle">
          <span>Stock received & serials registered</span>
        </div>
      </div>
    </div>

    <!-- Purchase Orders Table -->
    <div class="glass-panel p-4">
      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier Name</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Items Included & Allocation</th>
              <th>Total Cost</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="po in dataStore.purchaseOrders" :key="po.poNumber">
              <td class="font-mono font-bold text-primary">{{ po.poNumber }}</td>
              <td class="font-bold text-main">{{ po.supplier }}</td>
              <td class="font-mono text-xs text-subtle">{{ po.orderDate }}</td>
              <td>
                <span class="badge badge-success">{{ po.status }}</span>
              </td>
              <td>
                <div v-for="item in po.items" :key="item.productId" class="text-xs text-muted mb-1">
                  {{ item.qty }}x <span class="text-main font-semibold">{{ item.productName }}</span>
                  <span class="badge badge-info font-mono ml-1">{{ item.allocationCity || 'Lahore' }}</span>
                </div>
              </td>
              <td class="font-mono font-bold text-main">${{ po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
              <td class="text-xs text-muted">{{ po.createdBy }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Purchase Order Modal -->
    <div v-if="showPOModal" class="modal-backdrop" @click.self="showPOModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="flex-align gap-2">
            <Truck :size="18" class="text-primary" />
            <span>Create New Purchase Order</span>
          </h3>
          <button class="btn btn-ghost btn-sm" @click="showPOModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleCreatePO">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Vendor / Supplier Name</label>
              <input v-model="poForm.supplier" type="text" placeholder="Apple Logistics Int." class="form-input" required />
            </div>

            <div class="line-divider"></div>

            <div class="po-items-section">
              <div class="flex-between mb-2">
                <span class="font-bold text-sm text-main">Order Line Items & Allocation Place</span>
                <button type="button" class="btn btn-sm btn-secondary" @click="addPOLineItem">
                  <Plus :size="12" /> Add Item
                </button>
              </div>

              <div v-for="(item, idx) in poForm.items" :key="idx" class="po-line-item flex-align gap-2 mb-2 flex-wrap">
                <select v-model="item.productId" class="form-select flex-1" @change="onProductSelect(item)">
                  <option v-for="p in dataStore.products" :key="p.id" :value="p.id">
                    {{ p.name }} (SKU: {{ p.sku }})
                  </option>
                </select>

                <select v-model="item.allocationCity" class="form-select w-36">
                  <option value="Lahore">Lahore</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                </select>

                <input v-model.number="item.qty" type="number" min="1" placeholder="Qty" class="form-input w-20" required />
                <input v-model.number="item.unitCost" type="number" step="0.01" placeholder="Cost ($)" class="form-input w-28" required />

                <button type="button" class="btn btn-sm btn-ghost text-danger" @click="removePOLineItem(idx)">&times;</button>
              </div>
            </div>

            <div class="po-total-box flex-between p-3 mt-3 glass-panel">
              <span class="font-bold text-main">Estimated Total PO Cost:</span>
              <span class="font-mono font-bold text-lg text-primary">${{ calculatedPOTotal.toFixed(2) }}</span>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showPOModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Receive Stock & Allocate Serials</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import { Truck, Plus } from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()

const showPOModal = ref(false)

const poForm = ref({
  supplier: 'Sony Electronics Wholesale',
  items: [
    {
      productId: dataStore.products[0]?.id || '',
      productName: dataStore.products[0]?.name || '',
      qty: 5,
      unitCost: dataStore.products[0]?.costPrice || 100,
      allocationCity: dataStore.products[0]?.allocationCity || 'Lahore'
    }
  ]
})

const calculatedPOTotal = computed(() => {
  return poForm.value.items.reduce((acc, item) => acc + ((item.qty || 0) * (item.unitCost || 0)), 0)
})

function addPOLineItem() {
  const p = dataStore.products[0]
  poForm.value.items.push({
    productId: p?.id || '',
    productName: p?.name || '',
    qty: 1,
    unitCost: p?.costPrice || 100,
    allocationCity: p?.allocationCity || 'Lahore'
  })
}

function removePOLineItem(idx) {
  if (poForm.value.items.length > 1) {
    poForm.value.items.splice(idx, 1)
  }
}

function onProductSelect(item) {
  const p = dataStore.products.find(prod => prod.id === item.productId)
  if (p) {
    item.productName = p.name
    item.unitCost = p.costPrice
    item.allocationCity = p.allocationCity || 'Lahore'
  }
}

function handleCreatePO() {
  const po = dataStore.createPurchaseOrder(poForm.value, authStore.user)
  showPOModal.value = false
  uiStore.showToast(`Purchase Order ${po.poNumber} fulfilled! Inbound stock allocated.`, 'success')
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-2 { gap: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1.25rem; }
.mt-3 { margin-top: 0.75rem; }
.ml-1 { margin-left: 0.25rem; }
.p-3 { padding: 0.85rem; }
.p-4 { padding: 1.25rem; }

.flex-1 { flex: 1; }
.w-20 { width: 80px; }
.w-28 { width: 110px; }
.w-36 { width: 140px; }

.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.25rem; }
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

  .action-buttons .btn {
    width: 100%;
  }

  .po-line-item {
    flex-direction: column;
    align-items: stretch;
  }

  .w-20, .w-28, .w-36 {
    width: 100%;
  }
}
</style>
