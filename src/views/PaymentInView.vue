<template>
  <div class="page-wrapper space-y-6">
    <!-- Header -->
    <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-success font-mono">PAYMENT GOVERNANCE</span>
          <span class="badge badge-info font-mono">MACHINE-WISE ALLOCATION</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">Payment In Module</h1>
        <p class="text-slate-300 text-sm mt-1">
          Record Cash and Bank payments received against specific medical machines (Serial Numbers & Internal Machine Codes).
        </p>
      </div>

      <button
        @click="showCreateModal = true"
        class="btn btn-success btn-lg shadow-xl"
      >
        <Plus :size="18" />
        <span>Record New Payment In</span>
      </button>
    </div>

    <!-- Payment Receipts Table -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Receipt :size="20" class="text-emerald-400" />
          <span>Payment In History</span>
        </h3>
        <span class="badge badge-neutral font-mono">Total Receipts: {{ dataStore.paymentReceipts.length }}</span>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment Method</th>
              <th>Branch</th>
              <th>Allocated Machines</th>
              <th>Amount</th>
              <th>Received By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rct in dataStore.paymentReceipts" :key="rct.receiptNo">
              <td class="font-mono font-bold text-emerald-400">{{ rct.receiptNo }}</td>
              <td class="font-mono text-xs text-subtle">{{ rct.paymentDate }}</td>
              <td class="font-bold text-main">{{ rct.customer }}</td>
              <td>
                <span :class="['badge', rct.paymentType === 'Cash Payment' ? 'badge-warning' : 'badge-info']">
                  {{ rct.paymentType }}
                </span>
              </td>
              <td>
                <span class="badge badge-purple">
                  <Building2 :size="10" />
                  {{ rct.branch }}
                </span>
              </td>
              <td>
                <div v-for="ps in rct.paidSerials" :key="ps.serialCode" class="text-xs font-mono py-0.5">
                  <span class="text-purple-400 font-bold">{{ ps.machineCode }}</span> ({{ (ps.serialCode || '').replace(/^SN-/i, '') }})
                </div>
              </td>
              <td class="font-bold text-emerald-400">PKR {{ (rct.amount || 0).toLocaleString() }}</td>
              <td class="text-xs text-subtle">{{ rct.receivedBy }}</td>
            </tr>
            <tr v-if="dataStore.paymentReceipts.length === 0">
              <td colspan="8" class="p-6 text-center text-subtle italic">No payment receipts logged yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Payment In Modal -->
    <div v-if="showCreateModal" class="modal-backdrop" @click.self="showCreateModal = false">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign :size="22" class="text-emerald-400" />
            <span>Record Machine Payment In</span>
          </h3>
          <button @click="showCreateModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="submitPayment" class="modal-body space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Customer -->
            <div class="form-group">
              <label class="form-label">Select Customer *</label>
              <select v-model="form.customer" @change="fetchCustomerPendingMachines" required class="form-select font-bold">
                <option value="" disabled>Choose Client...</option>
                <option v-for="cust in customerList" :key="cust" :value="cust">{{ cust }}</option>
              </select>
            </div>

            <!-- Payment Type -->
            <div class="form-group">
              <label class="form-label">Payment Method *</label>
              <select v-model="form.paymentType" required class="form-select">
                <option value="Cash Payment">Cash Payment</option>
                <option value="Bank Payment">Bank Payment (Online Transfer / Cheque)</option>
              </select>
            </div>

            <!-- Amount -->
            <div class="form-group">
              <label class="form-label">Amount Received (PKR) *</label>
              <input v-model.number="form.amount" type="number" required min="1" class="form-input font-bold" />
            </div>

            <!-- Branch -->
            <div class="form-group">
              <label class="form-label">Receiving Branch *</label>
              <select v-model="form.branch" required class="form-select">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Office</option>
              </select>
            </div>
          </div>

          <!-- Unpaid Machine Allocation Selector -->
          <div v-if="form.customer" class="form-group pt-2 border-t border-slate-800">
            <label class="form-label">Select Machines Paid Against (Serial / Code) *</label>
            <div v-if="pendingMachinesForCustomer.length > 0" class="space-y-2 max-h-48 overflow-y-auto glass-panel p-3">
              <div v-for="m in pendingMachinesForCustomer" :key="m.serialCode" class="flex items-center justify-between p-2 hover:bg-slate-800/60 rounded border border-slate-800">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" :value="m.serialCode" v-model="selectedSerialCodes" class="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500" />
                  <div>
                    <span class="font-mono text-sm font-bold text-white">{{ (m.serialCode || '').replace(/^SN-/i, '') }}</span>
                    <span class="ml-2 font-mono text-xs text-purple-400 font-bold">({{ m.machineCode }})</span>
                    <div class="text-xs text-slate-400">{{ m.sku }} - Inv: {{ m.invoiceNo }}</div>
                  </div>
                </label>
                <div class="text-xs font-bold text-amber-400">PKR {{ (m.salePrice || 0).toLocaleString() }}</div>
              </div>
            </div>
            <div v-else class="text-xs text-emerald-400 p-3 bg-emerald-950/40 rounded-lg border border-emerald-800">
              All machines for this customer are already fully paid!
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Payment Description / Ref #</label>
            <textarea v-model="form.description" rows="2" placeholder="e.g. Received via Meezan Bank Online Transfer Ref # MB-9901..." class="form-textarea text-sm"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showCreateModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-success">
              <Check :size="16" />
              <span>Save Payment Receipt</span>
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
  DollarSign,
  Plus,
  Receipt,
  Building2,
  Check
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const showCreateModal = ref(false)

const form = ref({
  customer: '',
  paymentType: 'Cash Payment',
  amount: 0,
  branch: 'Peshawar',
  description: ''
})

const selectedSerialCodes = ref([])

const customerList = computed(() => {
  const set = new Set()
  dataStore.salesInvoices.forEach(i => { if (i.customer) set.add(i.customer) })
  return Array.from(set)
})

const pendingMachinesForCustomer = computed(() => {
  if (!form.value.customer) return []
  return dataStore.serials.filter(s => 
    s.customer && 
    s.customer.trim().toLowerCase() === form.value.customer.trim().toLowerCase() && 
    s.paymentStatus !== 'Paid'
  )
})

function fetchCustomerPendingMachines() {
  selectedSerialCodes.value = []
}

async function submitPayment() {
  if (!form.value.customer || !form.value.amount) {
    uiStore.showModal('Input Error', 'Please select customer and enter valid payment amount.', 'warning')
    return
  }

  const allocatedSerials = selectedSerialCodes.value.map(code => {
    const s = dataStore.serials.find(x => x.serialCode === code)
    return {
      serialCode: code,
      machineCode: s ? s.machineCode : '',
      productName: s ? s.sku : '',
      amountAllocated: s ? s.salePrice : 0
    }
  })

  await dataStore.recordPaymentIn({
    ...form.value,
    allocatedSerials
  }, authStore.user)

  uiStore.showModal(
    'Payment Recorded',
    `Successfully saved Payment In receipt and updated ${allocatedSerials.length} machine payment status(es) to Paid.`,
    'success'
  )

  showCreateModal.value = false
  form.value = { customer: '', paymentType: 'Cash Payment', amount: 0, branch: 'Peshawar', description: '' }
  selectedSerialCodes.value = []
}
</script>
