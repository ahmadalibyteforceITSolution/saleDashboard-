<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop receipt-modal-backdrop" @click.self="closeModal">
      <div class="modal-content receipt-modal-card animate-scale-up">
        <!-- ── Modal Header ── -->
        <div class="receipt-header" :class="isPaymentIn ? 'receipt-header-in' : 'receipt-header-out'">
          <div class="flex items-center gap-3">
            <div class="header-icon-box" :class="isPaymentIn ? 'header-icon-in' : 'header-icon-out'">
              <ArrowDownLeft v-if="isPaymentIn" :size="20" />
              <ArrowUpRight v-else :size="20" />
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="type-pill" :class="isPaymentIn ? 'type-pill-in' : 'type-pill-out'">
                  {{ isPaymentIn ? '💰 MONEY IN • OFFICIAL RECEIPT' : '💸 MONEY OUT • DISBURSEMENT VOUCHER' }}
                </span>
                <span class="branch-pill">
                  <Building2 :size="11" />
                  <span>{{ payment?.branch || 'Peshawar' }}</span>
                </span>
              </div>
              <h3 class="receipt-title-ref font-mono">
                {{ docNo }}
              </h3>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="canEdit"
              @click="triggerEdit"
              class="btn-action-edit"
              title="Edit Payment Record (SuperAdmin / Admin)"
            >
              <Edit3 :size="14" />
              <span class="hidden sm:inline">Edit</span>
            </button>
            <button
              @click="handlePrint"
              class="btn-action-print"
              title="Print Formatted Document"
            >
              <Printer :size="14" />
              <span>Print</span>
            </button>
            <button @click="closeModal" class="btn-close-box" title="Close">✕</button>
          </div>
        </div>

        <!-- ── Modal Body (Scrollable) ── -->
        <div class="receipt-body">
          <!-- 1. Hero Amount Card -->
          <div class="hero-amount-card" :class="isPaymentIn ? 'hero-amount-in' : 'hero-amount-out'">
            <div class="space-y-0.5">
              <span class="hero-amount-label">
                {{ isPaymentIn ? 'Total Payment Amount Received' : 'Total Disbursement Amount' }}
              </span>
              <div class="hero-amount-val font-mono" :class="isPaymentIn ? 'text-in-color' : 'text-out-color'">
                {{ isPaymentIn ? '+' : '-' }} {{ formatBalance(payment?.amount) }}
              </div>
            </div>
            <div class="flex flex-col sm:items-end gap-1.5">
              <span class="method-tag">
                {{ payment?.paymentMethod || payment?.paymentType || 'Cash Payment' }}
              </span>
              <span class="date-tag font-mono">
                Date: {{ payment?.paymentDate || payment?.date || 'N/A' }}
              </span>
            </div>
          </div>

          <!-- 2. Structured 2-Column Info Grid -->
          <div class="info-grid-container">
            <!-- Left Column -->
            <div class="info-column-card">
              <div class="info-row">
                <span class="info-label">{{ isPaymentIn ? 'Customer / Hospital:' : 'Payee / Recipient:' }}</span>
                <span class="info-val font-bold text-highlight">{{ payment?.customer || payment?.payee || payment?.partyName || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Category:</span>
                <span class="info-val category-badge">{{ payment?.category || (isPaymentIn ? 'Customer Sales Receipt' : 'Disbursement') }}</span>
              </div>
              <div class="info-row border-none">
                <span class="info-label">Location / Branch:</span>
                <span class="info-val font-semibold text-branch">{{ payment?.branch || 'Peshawar' }}</span>
              </div>
            </div>

            <!-- Right Column -->
            <div class="info-column-card">
              <div class="info-row">
                <span class="info-label">Document / Ref #:</span>
                <span class="info-val font-mono font-bold text-ref">{{ docNo }}</span>
              </div>
              <div v-if="!isPaymentIn && payment?.refInvoiceNo" class="info-row">
                <span class="info-label">Linked Doc / PO / Return:</span>
                <span class="info-val font-mono font-bold text-link">{{ payment.refInvoiceNo }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ isPaymentIn ? 'Received By (Staff):' : 'Disbursed By (Staff):' }}</span>
                <span class="info-val">{{ payment?.receivedBy || payment?.disbursedBy || payment?.user || 'admin' }}</span>
              </div>
              <div class="info-row border-none">
                <span class="info-label">Audit Status:</span>
                <span class="info-val status-verified">
                  <CheckCircle2 :size="13" />
                  <span>Verified & Posted</span>
                </span>
              </div>
            </div>
          </div>

          <!-- 3. Machine / Equipment Serials Allocation Breakdown (For Payment In) -->
          <div v-if="isPaymentIn" class="allocation-section">
            <div class="allocation-header">
              <div class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs section-heading">
                <Package :size="15" class="text-emerald-500" />
                <span>Machines Paid Against (Allocation Breakdown)</span>
              </div>
              <span class="serials-count-badge font-mono">{{ allocatedSerials.length }} Serials</span>
            </div>

            <div v-if="allocatedSerials.length > 0" class="allocation-table-wrapper">
              <table class="allocation-table">
                <thead>
                  <tr>
                    <th class="text-left">Serial Code</th>
                    <th class="text-left">Machine Code</th>
                    <th class="text-left">Equipment Name</th>
                    <th class="text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in allocatedSerials" :key="item.serialCode">
                    <td class="font-mono font-bold text-serial">{{ (item.serialCode || '').replace(/^SN-/i, '') }}</td>
                    <td><span class="code-pill font-mono">{{ item.machineCode || '—' }}</span></td>
                    <td class="text-equip">{{ item.productName || item.sku || 'Equipment Unit' }}</td>
                    <td class="text-right font-mono font-bold text-in-color">
                      PKR {{ Number(item.amountAllocated || item.salePrice || 0).toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="empty-allocation-box">
              <span>No specific serial allocations attached. Payment logged as direct customer advance or general ledger settlement.</span>
            </div>
          </div>

          <!-- 4. Description & Remarks -->
          <div class="description-section">
            <div class="section-heading-sub">
              <span>Description / Remarks / Transaction Ref:</span>
            </div>
            <div class="description-box">
              {{ payment?.description || 'Payment Recorded' }}
            </div>
          </div>

          <!-- 5. Digital Verification & ERP Stamp -->
          <div class="stamp-footer">
            <div>
              <div class="font-extrabold text-sm brand-name">Medimage Services ERP System</div>
              <div class="font-mono text-xs text-subtle">Official Cash Flow Record • NTN: 7291823-1</div>
            </div>
            <div>
              <span class="stamp-badge">
                <Check :size="12" />
                <span>AUTHENTICATED LEDGER ENTRY</span>
              </span>
            </div>
          </div>
        </div>

        <!-- ── Modal Footer Actions ── -->
        <div class="receipt-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary text-xs font-semibold px-4 py-2">
            Close
          </button>
          <div class="flex items-center gap-2">
            <button
              v-if="canEdit"
              type="button"
              @click="triggerEdit"
              class="btn-footer-edit"
            >
              <Edit3 :size="14" />
              <span>Edit Record</span>
            </button>
            <button
              type="button"
              @click="handlePrint"
              :class="['btn-footer-print', isPaymentIn ? 'btn-print-in' : 'btn-print-out']"
            >
              <Printer :size="14" />
              <span>Print Official {{ isPaymentIn ? 'Receipt' : 'Voucher' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Edit3,
  CheckCircle2,
  Package,
  Building2,
  Check
} from 'lucide-vue-next'
import { printPaymentReceipt, printPaymentOutVoucher } from '@/utils/reportExporter'

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

const emit = defineEmits(['update:modelValue', 'edit'])

const authStore = useAuthStore()
const dataStore = useDataStore()

const isPaymentIn = computed(() => {
  if (!props.payment) return true
  if (props.payment.direction) {
    return props.payment.direction === 'IN'
  }
  const no = props.payment.receiptNo || props.payment.voucherOrReceiptNo || ''
  return no.toUpperCase().startsWith('RCT') || Boolean(props.payment.customer)
})

const docNo = computed(() => {
  return props.payment?.receiptNo || props.payment?.voucherNo || props.payment?.voucherOrReceiptNo || 'PREVIEW-REF'
})

const canEdit = computed(() => {
  const role = (authStore.user?.role || '').toLowerCase()
  return role === 'superadmin' || role === 'admin' || role === 'accountant'
})

const allocatedSerials = computed(() => {
  if (!props.payment) return []
  if (Array.isArray(props.payment.paidSerials) && props.payment.paidSerials.length > 0) {
    return props.payment.paidSerials
  }
  if (Array.isArray(props.payment.allocatedSerials) && props.payment.allocatedSerials.length > 0) {
    return props.payment.allocatedSerials
  }
  const found = dataStore.paymentReceipts.find(r => r.receiptNo === docNo.value)
  if (found && Array.isArray(found.paidSerials)) {
    return found.paidSerials
  }
  return []
})

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${Number(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

function closeModal() {
  emit('update:modelValue', false)
}

function triggerEdit() {
  emit('edit', props.payment)
  closeModal()
}

function handlePrint() {
  if (isPaymentIn.value) {
    printPaymentReceipt({
      ...props.payment,
      receiptNo: docNo.value,
      paidSerials: allocatedSerials.value
    })
  } else {
    printPaymentOutVoucher({
      ...props.payment,
      voucherNo: docNo.value
    })
  }
}
</script>

<style scoped>
.receipt-modal-backdrop {
  z-index: 3000 !important;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.receipt-modal-card {
  z-index: 3001 !important;
  max-width: 48rem;
  width: 100%;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  flex-col: column;
  max-height: 92vh;
  color: var(--text-main, #0f172a);
}

/* Header */
.receipt-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.receipt-header-in {
  background: rgba(16, 185, 129, 0.08);
}

.receipt-header-out {
  background: rgba(239, 68, 68, 0.08);
}

.header-icon-box {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.header-icon-in {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.header-icon-out {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.type-pill {
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.type-pill-in {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.type-pill-out {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.branch-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.65rem;
  font-weight: 700;
  background: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

.receipt-title-ref {
  font-size: 1.15rem;
  font-weight: 800;
  margin-top: 0.15rem;
  color: var(--text-main, #0f172a);
}

.btn-action-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-action-edit:hover {
  background: #fef3c7;
  color: #92400e;
}

.btn-action-print {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.85rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: #4f46e5;
  color: #ffffff;
  border: 1px solid #4338ca;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
}
.btn-action-print:hover {
  background: #4338ca;
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
  font-size: 1rem;
}
.btn-close-box:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #0f172a;
}

/* Modal Body */
.receipt-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(92vh - 135px);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Hero Amount Card */
.hero-amount-card {
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
}
@media (min-width: 640px) {
  .hero-amount-card {
    flex-direction: row;
    align-items: center;
  }
}

.hero-amount-in {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #ffffff;
  border: 1px solid #059669;
  box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.2);
}

.hero-amount-out {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff;
  border: 1px solid #dc2626;
  box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.2);
}

.hero-amount-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.hero-amount-val {
  font-size: 1.85rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #ffffff !important;
}

.method-tag {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.65rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.date-tag {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Info Grid */
.info-grid-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 640px) {
  .info-grid-container {
    grid-template-columns: 1fr 1fr;
  }
}

.info-column-card {
  background: var(--bg-surface, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.85rem;
  padding: 0.85rem 1.15rem;
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  font-size: 0.75rem;
  gap: 0.75rem;
}

.info-label {
  color: #64748b;
  font-weight: 600;
  flex-shrink: 0;
}

.info-val {
  text-align: right;
  color: var(--text-main, #0f172a);
}

.text-highlight {
  color: #0f172a;
}
[data-theme="dark"] .text-highlight {
  color: #f8fafc;
}

.category-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  font-weight: 600;
}
[data-theme="dark"] .category-badge {
  background: #1e293b;
  color: #cbd5e1;
}

.text-branch {
  color: #059669;
  font-weight: 700;
}

.text-ref {
  color: #d97706;
}

.text-link {
  color: #0284c7;
}

.status-verified {
  color: #059669;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

/* Allocation Table */
.allocation-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.allocation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-heading {
  color: var(--text-main, #1e293b);
}

.serials-count-badge {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.15rem 0.5rem;
  border-radius: 0.35rem;
  font-size: 0.65rem;
  font-weight: 700;
}
[data-theme="dark"] .serials-count-badge {
  background: #1e293b;
  color: #94a3b8;
  border-color: #334155;
}

.allocation-table-wrapper {
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--bg-card, #ffffff);
}

.allocation-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.allocation-table th {
  background: var(--bg-surface, #f8fafc);
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.allocation-table td {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
}

.allocation-table tr:last-child td {
  border-bottom: none;
}

.text-serial {
  color: #0f172a;
}
[data-theme="dark"] .text-serial {
  color: #f8fafc;
}

.code-pill {
  background: #f3e8ff;
  color: #7e22ce;
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  font-weight: 700;
  font-size: 0.7rem;
}

.text-equip {
  color: #475569;
}
[data-theme="dark"] .text-equip {
  color: #94a3b8;
}

.text-in-color {
  color: #059669;
}

.empty-allocation-box {
  padding: 0.75rem 1rem;
  background: var(--bg-surface, #f8fafc);
  border: 1px dashed var(--border-color, #cbd5e1);
  border-radius: 0.65rem;
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
}

/* Description */
.description-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.section-heading-sub {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.description-box {
  padding: 0.75rem 1rem;
  background: var(--bg-surface, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.65rem;
  font-size: 0.75rem;
  color: var(--text-main, #1e293b);
  line-height: 1.4;
  min-height: 2.75rem;
}

/* Stamp Footer */
.stamp-footer {
  padding-top: 0.85rem;
  border-top: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.brand-name {
  color: var(--text-main, #0f172a);
}

.stamp-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  background: #ecfdf5;
  border: 1px solid #86efac;
  color: #047857;
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

/* Modal Footer */
.receipt-footer {
  padding: 1rem 1.5rem;
  background: var(--bg-surface, #f8fafc);
  border-top: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.btn-footer-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: #f59e0b;
  color: #ffffff;
  border: 1px solid #d97706;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-footer-edit:hover {
  background: #d97706;
}

.btn-footer-print {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1.15rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease;
}

.btn-print-in {
  background: #059669;
  border: 1px solid #047857;
}
.btn-print-in:hover {
  background: #047857;
}

.btn-print-out {
  background: #dc2626;
  border: 1px solid #b91c1c;
}
.btn-print-out:hover {
  background: #b91c1c;
}

/* Dark theme specifics */
[data-theme="dark"] .receipt-modal-card {
  background: #0f172a;
  border-color: #1e293b;
}
[data-theme="dark"] .info-column-card,
[data-theme="dark"] .allocation-table-wrapper,
[data-theme="dark"] .description-box,
[data-theme="dark"] .empty-allocation-box {
  background: #1e293b;
  border-color: #334155;
}
[data-theme="dark"] .allocation-table th {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}
[data-theme="dark"] .allocation-table td {
  border-color: #334155;
}
[data-theme="dark"] .info-row {
  border-color: #334155;
}
[data-theme="dark"] .receipt-footer {
  background: #0b1120;
  border-color: #1e293b;
}
</style>
