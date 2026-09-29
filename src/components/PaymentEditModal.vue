<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="closeModal">
      <div class="modal-content max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-up text-slate-100 flex flex-col max-h-[92vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0', isPaymentIn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30']">
              <Edit3 :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="badge badge-warning text-[10px] font-mono font-bold tracking-wider uppercase">SUPERADMIN EDIT MODE</span>
                <span :class="['badge text-[10px] font-mono font-bold uppercase', isPaymentIn ? 'badge-success' : 'badge-danger']">
                  {{ isPaymentIn ? 'PAYMENT IN' : 'PAYMENT OUT' }}
                </span>
              </div>
              <h3 class="text-lg font-extrabold text-white mt-0.5 tracking-tight font-mono">
                Edit Record: {{ docNo }}
              </h3>
            </div>
          </div>
          <button @click="closeModal" class="btn btn-ghost btn-sm text-slate-400 hover:text-white">✕</button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSave" class="p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-140px)]">
          <!-- PAYMENT IN FORM FIELDS -->
          <template v-if="isPaymentIn">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Customer / Hospital -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Customer / Hospital Name *</label>
                <input
                  v-model="editForm.customer"
                  type="text"
                  required
                  list="edit-cust-list"
                  class="form-input font-bold text-white bg-slate-950 border-slate-700"
                />
                <datalist id="edit-cust-list">
                  <option v-for="c in customerList" :key="c" :value="c">{{ c }}</option>
                </datalist>
              </div>

              <!-- Payment Date -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Payment Date *</label>
                <input
                  v-model="editForm.paymentDate"
                  type="date"
                  required
                  class="form-input font-mono text-white bg-slate-950 border-slate-700"
                />
              </div>

              <!-- Payment Method -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Payment Method *</label>
                <select v-model="editForm.paymentType" required class="form-select font-bold text-white bg-slate-950 border-slate-700">
                  <option value="Cash Payment">💵 Cash Payment (Counter / Immediate)</option>
                  <option value="Bank Payment (HBL)">🏦 Bank Transfer (HBL)</option>
                  <option value="Bank Payment (Meezan Bank)">🏦 Bank Transfer (Meezan Bank)</option>
                  <option value="Bank Payment (Cheque)">🧾 Cheque Payment</option>
                  <option value="Bank Payment">🏦 General Bank Transfer</option>
                </select>
              </div>

              <!-- Branch -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Receiving Branch *</label>
                <select v-model="editForm.branch" required class="form-select font-bold text-white bg-slate-950 border-slate-700">
                  <option value="Peshawar">🏢 Peshawar HO</option>
                  <option value="Multan">🏢 Multan Branch</option>
                  <option value="Lahore">🏢 Lahore Office</option>
                </select>
              </div>
            </div>

            <!-- Amount -->
            <div class="form-group">
              <label class="form-label text-xs font-bold text-emerald-400">Payment Amount Received (PKR) *</label>
              <input
                v-model.number="editForm.amount"
                type="number"
                min="1"
                required
                class="form-input font-mono font-black text-xl text-emerald-400 bg-slate-950 border-slate-700"
              />
            </div>

            <!-- Machine Serials Allocation List -->
            <div class="form-group pt-2 border-t border-slate-800">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label text-xs font-bold text-slate-300 mb-0">Allocated Machines / Serials</label>
                <button
                  type="button"
                  @click="addSerialRow"
                  class="btn btn-ghost btn-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                >
                  <Plus :size="12" />
                  <span>Add Machine</span>
                </button>
              </div>

              <div v-if="editForm.paidSerials && editForm.paidSerials.length > 0" class="space-y-2">
                <div
                  v-for="(sRow, idx) in editForm.paidSerials"
                  :key="idx"
                  class="grid grid-cols-12 gap-2 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 items-center text-xs"
                >
                  <div class="col-span-4">
                    <input
                      v-model="sRow.serialCode"
                      placeholder="Serial (e.g. US10-8803)"
                      class="form-input text-xs font-mono font-bold py-1"
                    />
                  </div>
                  <div class="col-span-3">
                    <input
                      v-model="sRow.machineCode"
                      placeholder="Code (MC-103)"
                      class="form-input text-xs font-mono py-1 text-purple-400 font-bold"
                    />
                  </div>
                  <div class="col-span-4">
                    <input
                      v-model.number="sRow.amountAllocated"
                      type="number"
                      placeholder="Amount"
                      class="form-input text-xs font-mono py-1 text-emerald-400 font-bold"
                    />
                  </div>
                  <div class="col-span-1 text-center">
                    <button
                      type="button"
                      @click="removeSerialRow(idx)"
                      class="text-red-400 hover:text-red-300 p-1 font-bold"
                      title="Remove row"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-xs text-slate-400 italic p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                No specific machine serials linked to this receipt.
              </div>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label text-xs font-bold text-slate-300">Payment Description / Ref #</label>
              <textarea
                v-model="editForm.description"
                rows="2"
                class="form-textarea text-xs bg-slate-950 border-slate-700"
              ></textarea>
            </div>
          </template>

          <!-- PAYMENT OUT FORM FIELDS -->
          <template v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Payee -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Payee / Recipient Name *</label>
                <input
                  v-model="editForm.payee"
                  type="text"
                  required
                  class="form-input font-bold text-white bg-slate-950 border-slate-700"
                />
              </div>

              <!-- Outflow Category -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Outflow Category *</label>
                <select v-model="editForm.category" required class="form-select font-bold text-white bg-slate-950 border-slate-700">
                  <option value="Customer Refund">Customer Return Refund</option>
                  <option value="Vendor Payment">Vendor / Manufacturer Purchase Payment</option>
                  <option value="Operational Expense">Operational / Logistics Expense</option>
                  <option value="Branch Disbursement">Branch Cash Disbursement</option>
                  <option value="Staff Commission">Staff Commission & Travel</option>
                  <option value="Other">Other Outflow</option>
                </select>
              </div>

              <!-- Payment Date -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Voucher Date *</label>
                <input
                  v-model="editForm.paymentDate"
                  type="date"
                  required
                  class="form-input font-mono text-white bg-slate-950 border-slate-700"
                />
              </div>

              <!-- Payment Method -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Payment Method *</label>
                <select v-model="editForm.paymentType" required class="form-select font-bold text-white bg-slate-950 border-slate-700">
                  <option value="Cash Payment">💵 Cash Payment (Petty Cash)</option>
                  <option value="Bank Transfer (HBL)">🏦 Bank Transfer (HBL)</option>
                  <option value="Bank Transfer (Meezan Bank)">🏦 Bank Transfer (Meezan Bank)</option>
                  <option value="Cheque Disbursement">🧾 Cheque Disbursement</option>
                  <option value="Bank Transfer">🏦 General Bank Transfer</option>
                </select>
              </div>

              <!-- Branch -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Disbursing Branch *</label>
                <select v-model="editForm.branch" required class="form-select font-bold text-white bg-slate-950 border-slate-700">
                  <option value="Peshawar">🏢 Peshawar HO</option>
                  <option value="Multan">🏢 Multan Branch</option>
                  <option value="Lahore">🏢 Lahore Office</option>
                </select>
              </div>

              <!-- Ref Invoice / PO / Return # -->
              <div class="form-group">
                <label class="form-label text-xs font-bold text-slate-300">Ref Invoice / PO / Return #</label>
                <input
                  v-model="editForm.refInvoiceNo"
                  type="text"
                  placeholder="e.g. RET-2026-001 or PO-2026-01"
                  class="form-input font-mono text-white bg-slate-950 border-slate-700"
                />
              </div>
            </div>

            <!-- Amount -->
            <div class="form-group">
              <label class="form-label text-xs font-bold text-red-400">Disbursement Amount (PKR) *</label>
              <input
                v-model.number="editForm.amount"
                type="number"
                min="1"
                required
                class="form-input font-mono font-black text-xl text-red-400 bg-slate-950 border-slate-700"
              />
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label text-xs font-bold text-slate-300">Payment Out Reason / Remarks *</label>
              <textarea
                v-model="editForm.description"
                rows="2.5"
                required
                class="form-textarea text-xs bg-slate-950 border-slate-700"
              ></textarea>
            </div>
          </template>

          <!-- Audit Warning -->
          <div class="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <ShieldAlert :size="16" class="shrink-0 mt-0.5" />
            <div>
              <strong>SuperAdmin Governance:</strong> Modifying financial records updates the centralized cash flow ledger and logs an official SuperAdmin modification in the audit trail.
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button type="button" @click="closeModal" class="btn btn-secondary text-xs">
              Cancel
            </button>
            <button type="submit" class="btn btn-warning text-xs font-bold flex items-center gap-1.5 shadow-lg">
              <Save :size="14" />
              <span>Save & Update Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import {
  Edit3,
  Save,
  Plus,
  ShieldAlert
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  payment: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()

const editForm = ref({})

const isPaymentIn = computed(() => {
  if (!props.payment) return true
  if (props.payment.direction) {
    return props.payment.direction === 'IN'
  }
  const no = props.payment.receiptNo || props.payment.voucherOrReceiptNo || ''
  return no.toUpperCase().startsWith('RCT') || Boolean(props.payment.customer)
})

const docNo = computed(() => {
  return props.payment?.receiptNo || props.payment?.voucherNo || props.payment?.voucherOrReceiptNo || 'REF'
})

const customerList = computed(() => {
  const set = new Set()
  dataStore.salesInvoices.forEach(i => { if (i.customer) set.add(i.customer) })
  dataStore.customers.forEach(c => { if (c.name) set.add(c.name) })
  return Array.from(set)
})

watch(() => props.payment, (val) => {
  if (val) {
    initForm(val)
  }
}, { immediate: true, deep: true })

function initForm(p) {
  const inFlow = isPaymentIn.value
  let serialsList = []
  if (Array.isArray(p.paidSerials)) {
    serialsList = JSON.parse(JSON.stringify(p.paidSerials))
  } else if (Array.isArray(p.allocatedSerials)) {
    serialsList = JSON.parse(JSON.stringify(p.allocatedSerials))
  }

  if (inFlow) {
    editForm.value = {
      receiptNo: p.receiptNo || p.voucherOrReceiptNo,
      customer: p.customer || p.partyName || '',
      paymentDate: p.paymentDate || p.date || new Date().toISOString().substring(0, 10),
      paymentType: p.paymentType || p.paymentMethod || 'Cash Payment',
      amount: Number(p.amount || 0),
      branch: p.branch || 'Peshawar',
      description: p.description || '',
      paidSerials: serialsList
    }
  } else {
    editForm.value = {
      voucherNo: p.voucherNo || p.voucherOrReceiptNo,
      payee: p.payee || p.partyName || '',
      category: p.category || 'Customer Refund',
      paymentDate: p.paymentDate || p.date || new Date().toISOString().substring(0, 10),
      paymentType: p.paymentType || p.paymentMethod || 'Cash Payment',
      amount: Number(p.amount || 0),
      branch: p.branch || 'Peshawar',
      refInvoiceNo: p.refInvoiceNo || '',
      description: p.description || ''
    }
  }
}

function addSerialRow() {
  if (!editForm.value.paidSerials) {
    editForm.value.paidSerials = []
  }
  editForm.value.paidSerials.push({
    serialCode: '',
    machineCode: '',
    productName: '',
    amountAllocated: 0
  })
}

function removeSerialRow(idx) {
  if (editForm.value.paidSerials) {
    editForm.value.paidSerials.splice(idx, 1)
  }
}

function closeModal() {
  emit('update:modelValue', false)
}

async function handleSave() {
  try {
    if (isPaymentIn.value) {
      if (!editForm.value.customer || !editForm.value.amount) {
        uiStore.showModal('Validation Error', 'Customer name and payment amount are required.', 'warning')
        return
      }
      await dataStore.updatePaymentIn(docNo.value, editForm.value, authStore.user)
      uiStore.showModal(
        'Payment Receipt Updated',
        `Receipt ${docNo.value} has been updated successfully.`,
        'success'
      )
    } else {
      if (!editForm.value.payee || !editForm.value.amount) {
        uiStore.showModal('Validation Error', 'Payee name and disbursement amount are required.', 'warning')
        return
      }
      await dataStore.updatePaymentOut(docNo.value, editForm.value, authStore.user)
      uiStore.showModal(
        'Disbursement Voucher Updated',
        `Voucher ${docNo.value} has been updated successfully.`,
        'success'
      )
    }

    emit('saved', editForm.value)
    closeModal()
  } catch (err) {
    uiStore.showModal('Update Failed', err.message || 'Failed to update payment record.', 'error')
  }
}
</script>
