<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="closeModal">
      <div class="modal-content max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-up text-slate-100 flex flex-col max-h-[92vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between" :class="isPaymentIn ? 'bg-emerald-950/30' : 'bg-red-950/30'">
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0', isPaymentIn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30']">
              <ArrowDownLeft v-if="isPaymentIn" :size="22" />
              <ArrowUpRight v-else :size="22" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span :class="['badge text-[10px] font-mono font-bold tracking-wider uppercase', isPaymentIn ? 'badge-success' : 'badge-danger']">
                  {{ isPaymentIn ? 'MONEY IN • PAYMENT RECEIPT' : 'MONEY OUT • DISBURSEMENT VOUCHER' }}
                </span>
                <span class="badge badge-purple font-mono text-[10px]">{{ payment?.branch || 'Peshawar' }}</span>
              </div>
              <h3 class="text-lg font-extrabold text-white mt-0.5 tracking-tight font-mono">
                {{ docNo }}
              </h3>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="canEdit"
              @click="triggerEdit"
              class="btn btn-secondary btn-sm flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
              title="Edit Payment Record (SuperAdmin / Admin)"
            >
              <Edit3 :size="14" />
              <span class="hidden sm:inline">Edit</span>
            </button>
            <button
              @click="handlePrint"
              class="btn btn-primary btn-sm flex items-center gap-1 font-bold shadow-sm"
              title="Print Formatted Document"
            >
              <Printer :size="14" />
              <span>Print</span>
            </button>
            <button @click="closeModal" class="btn btn-ghost btn-sm text-slate-400 hover:text-white" title="Close">✕</button>
          </div>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-140px)]">
          <!-- Main Amount Callout Card -->
          <div :class="['p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg', isPaymentIn ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-700/50' : 'bg-gradient-to-r from-red-950/60 to-slate-900 border-red-700/50']">
            <div>
              <span class="text-xs uppercase tracking-wider font-semibold text-slate-400">
                {{ isPaymentIn ? 'Total Payment Amount Received' : 'Total Amount Disbursed' }}
              </span>
              <div :class="['text-3xl font-black font-mono mt-1 tracking-tight', isPaymentIn ? 'text-emerald-400' : 'text-red-400']">
                {{ isPaymentIn ? '+' : '-' }} {{ formatBalance(payment?.amount) }}
              </div>
            </div>
            <div class="flex flex-col sm:items-end gap-1">
              <span class="badge badge-neutral text-xs font-mono">
                {{ payment?.paymentMethod || payment?.paymentType || 'Cash Payment' }}
              </span>
              <span class="text-[11px] text-slate-400 font-mono">Date: {{ payment?.paymentDate || payment?.date || 'N/A' }}</span>
            </div>
          </div>

          <!-- Key Meta Information Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div class="space-y-2">
              <div class="flex justify-between pb-1.5 border-b border-slate-800/80">
                <span class="text-slate-400">{{ isPaymentIn ? 'Customer / Hospital:' : 'Payee / Recipient:' }}</span>
                <span class="font-bold text-white text-right">{{ payment?.customer || payment?.payee || payment?.partyName || 'N/A' }}</span>
              </div>
              <div class="flex justify-between pb-1.5 border-b border-slate-800/80">
                <span class="text-slate-400">Category:</span>
                <span class="font-semibold text-purple-300 text-right">{{ payment?.category || (isPaymentIn ? 'Customer Sales Receipt' : 'Disbursement') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Location / Branch:</span>
                <span class="font-bold text-emerald-400">{{ payment?.branch || 'Peshawar' }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between pb-1.5 border-b border-slate-800/80">
                <span class="text-slate-400">Document / Ref #:</span>
                <span class="font-mono font-bold text-amber-400 text-right">{{ docNo }}</span>
              </div>
              <div v-if="!isPaymentIn && payment?.refInvoiceNo" class="flex justify-between pb-1.5 border-b border-slate-800/80">
                <span class="text-slate-400">Linked Invoice / PO / Return:</span>
                <span class="font-mono font-bold text-cyan-400 text-right">{{ payment.refInvoiceNo }}</span>
              </div>
              <div class="flex justify-between pb-1.5 border-b border-slate-800/80">
                <span class="text-slate-400">{{ isPaymentIn ? 'Received By (Staff):' : 'Disbursed By (Staff):' }}</span>
                <span class="font-semibold text-slate-200 text-right">{{ payment?.receivedBy || payment?.disbursedBy || payment?.user || 'Authorized Staff' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Audit Status:</span>
                <span class="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 :size="13" />
                  <span>Verified & Posted</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Machine / Equipment Serials Allocation (For Payment In) -->
          <div v-if="isPaymentIn" class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Package :size="14" class="text-emerald-400" />
                <span>Machines Paid Against (Allocation Breakdown)</span>
              </h4>
              <span class="badge badge-neutral text-[10px] font-mono">{{ allocatedSerials.length }} Serials</span>
            </div>

            <div v-if="allocatedSerials.length > 0" class="border border-slate-800 rounded-xl overflow-hidden">
              <table class="w-full text-xs">
                <thead class="bg-slate-800/70 text-slate-300 text-[11px] uppercase font-bold">
                  <tr>
                    <th class="py-2.5 px-3 text-left">Serial Code</th>
                    <th class="py-2.5 px-3 text-left">Machine Code</th>
                    <th class="py-2.5 px-3 text-left">Equipment Name</th>
                    <th class="py-2.5 px-3 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 bg-slate-950/40 font-mono">
                  <tr v-for="item in allocatedSerials" :key="item.serialCode" class="hover:bg-slate-800/40">
                    <td class="py-2 px-3 font-bold text-white">{{ (item.serialCode || '').replace(/^SN-/i, '') }}</td>
                    <td class="py-2 px-3 text-purple-400 font-bold">{{ item.machineCode || '—' }}</td>
                    <td class="py-2 px-3 font-sans text-slate-300">{{ item.productName || item.sku || 'Equipment Unit' }}</td>
                    <td class="py-2 px-3 text-right text-emerald-400 font-bold">
                      PKR {{ Number(item.amountAllocated || item.salePrice || 0).toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-xs text-slate-400 italic">
              No specific serial allocations attached. Payment logged as direct customer advance or general ledger reconciliation.
            </div>
          </div>

          <!-- Description / Remarks -->
          <div class="space-y-1.5">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Description / Remarks / Transaction Ref:
            </h4>
            <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed min-h-[48px]">
              {{ payment?.description || 'No additional remarks provided.' }}
            </div>
          </div>

          <!-- Signatures & Verification Footer -->
          <div class="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              <div class="font-bold text-slate-300">Medimage Services ERP System</div>
              <div class="font-mono text-[10px]">Official Cash Flow Record • NTN: 7291823-1</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono font-bold text-[10px]">
                AUTHENTICATED LEDGER ENTRY
              </span>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button type="button" @click="closeModal" class="btn btn-secondary text-xs">
            Close
          </button>
          <div class="flex items-center gap-2">
            <button
              v-if="canEdit"
              type="button"
              @click="triggerEdit"
              class="btn btn-warning text-xs font-bold flex items-center gap-1.5"
            >
              <Edit3 :size="14" />
              <span>Edit Record</span>
            </button>
            <button
              type="button"
              @click="handlePrint"
              :class="['btn text-xs font-bold flex items-center gap-1.5 text-white', isPaymentIn ? 'btn-success' : 'btn-danger']"
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
  Package
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
  // Try finding by receipt in store
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
