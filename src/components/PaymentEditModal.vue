<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop edit-modal-backdrop" @click.self="closeModal">
      <div class="modal-content edit-modal-card animate-scale-up">
        <!-- ── Modal Header ── -->
        <div class="edit-header">
          <div class="flex items-center gap-3">
            <div class="edit-icon-box" :class="isPaymentIn ? 'edit-icon-in' : 'edit-icon-out'">
              <Edit3 :size="18" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="superadmin-badge">SUPERADMIN EDIT MODE</span>
                <span :class="['type-badge', isPaymentIn ? 'type-badge-in' : 'type-badge-out']">
                  {{ isPaymentIn ? 'PAYMENT IN' : 'PAYMENT OUT' }}
                </span>
              </div>
              <h3 class="edit-title font-mono">
                Edit Record: {{ docNo }}
              </h3>
            </div>
          </div>
          <button @click="closeModal" class="btn-close-box" title="Close">✕</button>
        </div>

        <!-- ── Form Body ── -->
        <form @submit.prevent="handleSave" class="edit-form-body">
          <!-- PAYMENT IN FORM FIELDS -->
          <template v-if="isPaymentIn">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Customer / Hospital -->
              <div class="form-group space-y-1">
                <label class="field-label">Customer / Hospital Name *</label>
                <input
                  v-model="editForm.customer"
                  type="text"
                  required
                  list="edit-cust-list"
                  placeholder="e.g. Northwest General Hospital"
                  class="styled-input font-bold"
                />
                <datalist id="edit-cust-list">
                  <option v-for="c in customerList" :key="c" :value="c">{{ c }}</option>
                </datalist>
              </div>

              <!-- Payment Date -->
              <div class="form-group space-y-1">
                <label class="field-label">Payment Date *</label>
                <input
                  v-model="editForm.paymentDate"
                  type="date"
                  required
                  class="styled-input font-mono"
                />
              </div>

              <!-- Payment Method -->
              <div class="form-group space-y-1">
                <label class="field-label">Payment Method *</label>
                <select v-model="editForm.paymentType" required class="styled-select font-semibold">
                  <option value="Cash Payment">💵 Cash Payment (Immediate Inflow)</option>
                  <option value="Bank Payment (HBL)">🏦 Bank Transfer (HBL)</option>
                  <option value="Bank Payment (Meezan Bank)">🏦 Bank Transfer (Meezan Bank)</option>
                  <option value="Bank Payment (Cheque)">🧾 Cheque Payment</option>
                  <option value="Bank Payment">🏦 General Bank Transfer</option>
                </select>
              </div>

              <!-- Branch -->
              <div class="form-group space-y-1">
                <label class="field-label">Receiving Branch *</label>
                <select v-model="editForm.branch" :disabled="!authStore.isSuperAdmin" required class="styled-select font-semibold disabled:opacity-80">
                  <option v-if="authStore.isSuperAdmin" value="Peshawar">🏢 Peshawar HO</option>
                  <option v-if="authStore.isSuperAdmin || (authStore.userBranch || '').toLowerCase() === 'lahore'" value="Lahore">🏢 Lahore Office</option>
                  <option v-if="authStore.isSuperAdmin || (authStore.userBranch || '').toLowerCase() === 'multan'" value="Multan">🏢 Multan Branch</option>
                  <option v-if="authStore.isSuperAdmin || (authStore.userBranch || '').toLowerCase() === 'islamabad'" value="Islamabad">🏢 Islamabad Branch</option>
                  <option v-if="authStore.isSuperAdmin || (authStore.userBranch || '').toLowerCase() === 'karachi'" value="Karachi">🏢 Karachi Branch</option>
                </select>
              </div>
            </div>

            <!-- Amount -->
            <div class="form-group space-y-1">
              <label class="field-label text-emerald-600 dark:text-emerald-400 font-extrabold">Payment Amount Received (PKR) *</label>
              <input
                v-model.number="editForm.amount"
                type="number"
                min="1"
                required
                class="styled-input font-mono font-black text-xl text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <!-- Machine Serials Allocation List -->
            <div class="serials-box space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="field-label text-slate-700 dark:text-slate-200 font-bold mb-0">Allocated Machines / Serials</label>
                <button
                  type="button"
                  @click="addSerialRow"
                  class="btn-add-serial"
                >
                  <Plus :size="12" />
                  <span>Add Machine</span>
                </button>
              </div>

              <div v-if="editForm.paidSerials && editForm.paidSerials.length > 0" class="space-y-2">
                <div
                  v-for="(sRow, idx) in editForm.paidSerials"
                  :key="idx"
                  class="serial-row-grid"
                >
                  <div class="col-span-4">
                    <input
                      v-model="sRow.serialCode"
                      placeholder="Serial (US10-8803)"
                      class="styled-input-xs font-mono font-bold"
                    />
                  </div>
                  <div class="col-span-3">
                    <input
                      v-model="sRow.machineCode"
                      placeholder="Code (MC-103)"
                      class="styled-input-xs font-mono text-purple-600 dark:text-purple-400 font-bold"
                    />
                  </div>
                  <div class="col-span-4">
                    <input
                      v-model.number="sRow.amountAllocated"
                      type="number"
                      placeholder="Amount"
                      class="styled-input-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold"
                    />
                  </div>
                  <div class="col-span-1 text-center">
                    <button
                      type="button"
                      @click="removeSerialRow(idx)"
                      class="btn-remove-row"
                      title="Remove row"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-serials-notice">
                No specific machine serials linked to this receipt.
              </div>
            </div>

            <!-- Description -->
            <div class="form-group space-y-1">
              <label class="field-label">Payment Description / Transaction Ref #</label>
              <textarea
                v-model="editForm.description"
                rows="2"
                class="styled-textarea"
                placeholder="Enter transaction details..."
              ></textarea>
            </div>
          </template>

          <!-- PAYMENT OUT FORM FIELDS -->
          <template v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Payee -->
              <div class="form-group space-y-1">
                <label class="field-label">Payee / Recipient Name *</label>
                <input
                  v-model="editForm.payee"
                  type="text"
                  required
                  placeholder="e.g. Hospital name or vendor..."
                  class="styled-input font-bold"
                />
              </div>

              <!-- Outflow Category -->
              <div class="form-group space-y-1">
                <label class="field-label">Outflow Category *</label>
                <select v-model="editForm.category" required class="styled-select font-semibold">
                  <option value="Customer Refund">Customer Return Refund</option>
                  <option value="Vendor Payment">Vendor / Manufacturer Purchase Payment</option>
                  <option value="Operational Expense">Operational / Logistics Expense</option>
                  <option value="Branch Disbursement">Branch Cash Disbursement</option>
                  <option value="Staff Commission">Staff Commission & Travel</option>
                  <option value="Other">Other Outflow</option>
                </select>
              </div>

              <!-- Payment Date -->
              <div class="form-group space-y-1">
                <label class="field-label">Voucher Date *</label>
                <input
                  v-model="editForm.paymentDate"
                  type="date"
                  required
                  class="styled-input font-mono"
                />
              </div>

              <!-- Payment Method -->
              <div class="form-group space-y-1">
                <label class="field-label">Payment Method *</label>
                <select v-model="editForm.paymentType" required class="styled-select font-semibold">
                  <option value="Cash Payment">💵 Cash Payment (Petty Cash)</option>
                  <option value="Bank Transfer (HBL)">🏦 Bank Transfer (HBL)</option>
                  <option value="Bank Transfer (Meezan Bank)">🏦 Bank Transfer (Meezan Bank)</option>
                  <option value="Cheque Disbursement">🧾 Cheque Disbursement</option>
                  <option value="Bank Transfer">🏦 General Bank Transfer</option>
                </select>
              </div>

              <!-- Branch -->
              <div class="form-group space-y-1">
                <label class="field-label">Disbursing Branch *</label>
                <select v-model="editForm.branch" :disabled="!authStore.isSuperAdmin" required class="styled-select font-semibold disabled:opacity-80">
                  <option v-if="authStore.isSuperAdmin" value="Peshawar">🏢 Peshawar HO</option>
                  <option v-if="authStore.isSuperAdmin || (authStore.userBranch || '').toLowerCase() === 'lahore'" value="Lahore">🏢 Lahore Office</option>
                  <option v-if="authStore.isSuperAdmin || (authStore.userBranch || '').toLowerCase() === 'multan'" value="Multan">🏢 Multan Branch</option>
                  <option v-if="authStore.isSuperAdmin || (authStore.userBranch || '').toLowerCase() === 'islamabad'" value="Islamabad">🏢 Islamabad Branch</option>
                  <option v-if="authStore.isSuperAdmin || (authStore.userBranch || '').toLowerCase() === 'karachi'" value="Karachi">🏢 Karachi Branch</option>
                </select>
              </div>

              <!-- Ref Invoice / PO / Return # -->
              <div class="form-group space-y-1">
                <label class="field-label">Ref Invoice / PO / Return #</label>
                <input
                  v-model="editForm.refInvoiceNo"
                  type="text"
                  placeholder="e.g. RET-2026-001 or PO-2026-01"
                  class="styled-input font-mono"
                />
              </div>
            </div>

            <!-- Amount -->
            <div class="form-group space-y-1">
              <label class="field-label text-red-600 dark:text-red-400 font-extrabold">Disbursement Amount (PKR) *</label>
              <input
                v-model.number="editForm.amount"
                type="number"
                min="1"
                required
                class="styled-input font-mono font-black text-xl text-red-600 dark:text-red-400"
              />
            </div>

            <!-- Description -->
            <div class="form-group space-y-1">
              <label class="field-label">Payment Out Reason / Remarks *</label>
              <textarea
                v-model="editForm.description"
                rows="2.5"
                required
                placeholder="State the detailed reason for disbursement..."
                class="styled-textarea"
              ></textarea>
            </div>
          </template>

          <!-- Governance Notice -->
          <div class="governance-notice">
            <ShieldAlert :size="16" class="shrink-0 text-amber-500 mt-0.5" />
            <div class="text-xs text-amber-800 dark:text-amber-200">
              <strong>SuperAdmin Governance:</strong> Modifying financial records updates the centralized cash flow ledger and logs an official SuperAdmin modification in the audit trail.
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="edit-modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary text-xs font-semibold px-4 py-2">
              Cancel
            </button>
            <button type="submit" class="btn-save-record">
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

<style scoped>
.edit-modal-backdrop {
  z-index: 3000 !important;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.edit-modal-card {
  z-index: 3001 !important;
  max-width: 44rem;
  width: 100%;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  color: var(--text-main, #0f172a);
}

.edit-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface, #f8fafc);
}

.edit-icon-box {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.edit-icon-in {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.edit-icon-out {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.superadmin-badge {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 0.15rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.type-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}
.type-badge-in {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.type-badge-out {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.edit-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main, #0f172a);
  margin-top: 0.15rem;
}

.btn-close-box {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
}
.btn-close-box:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #0f172a;
}

.edit-form-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(92vh - 135px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
}
[data-theme="dark"] .field-label {
  color: #94a3b8;
}

.styled-input,
.styled-select,
.styled-textarea {
  width: 100%;
  padding: 0.55rem 0.85rem;
  border-radius: 0.65rem;
  font-size: 0.8rem;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-color, #cbd5e1);
  color: var(--text-main, #0f172a);
  outline: none;
  transition: all 0.15s ease;
}

.styled-input:focus,
.styled-select:focus,
.styled-textarea:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.styled-input-xs {
  width: 100%;
  padding: 0.35rem 0.6rem;
  border-radius: 0.45rem;
  font-size: 0.75rem;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #cbd5e1);
  color: var(--text-main, #0f172a);
}

.serials-box {
  padding: 0.85rem 1rem;
  background: var(--bg-surface, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.85rem;
}

.btn-add-serial {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #059669;
  background: transparent;
  border: none;
  cursor: pointer;
}
.btn-add-serial:hover {
  text-decoration: underline;
}

.serial-row-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0.65rem;
  border-radius: 0.5rem;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
}

.btn-remove-row {
  color: #ef4444;
  font-weight: 800;
  cursor: pointer;
  background: transparent;
  border: none;
}
.btn-remove-row:hover {
  color: #b91c1c;
}

.empty-serials-notice {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
  padding: 0.5rem 0;
}

.governance-notice {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
[data-theme="dark"] .governance-notice {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.edit-modal-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.btn-save-record {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: #f59e0b;
  color: #ffffff;
  border: 1px solid #d97706;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease;
}
.btn-save-record:hover {
  background: #d97706;
}

/* Dark mode overrides */
[data-theme="dark"] .edit-modal-card {
  background: #0f172a;
  border-color: #1e293b;
}
[data-theme="dark"] .edit-header {
  background: #0b1120;
  border-color: #1e293b;
}
[data-theme="dark"] .styled-input,
[data-theme="dark"] .styled-select,
[data-theme="dark"] .styled-textarea,
[data-theme="dark"] .serials-box,
[data-theme="dark"] .serial-row-grid {
  background: #1e293b;
  border-color: #334155;
  color: #f8fafc;
}
[data-theme="dark"] .styled-input-xs {
  background: #0f172a;
  border-color: #334155;
  color: #f8fafc;
}
[data-theme="dark"] .edit-modal-footer {
  border-color: #1e293b;
}
</style>
