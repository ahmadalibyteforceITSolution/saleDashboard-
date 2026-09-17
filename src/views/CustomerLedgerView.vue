<template>
  <div class="page-wrapper space-y-6">
    <!-- Header -->
    <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-info font-mono">CLIENT GOVERNANCE</span>
          <span class="badge badge-success font-mono">ITEMIZED LEDGERS</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">Customer Financial Ledger</h1>
        <p class="text-slate-300 text-sm mt-1">
          Separate categorized sections for Sales Invoices, Payment In Receipts, Equipment History, and Paid vs Pending Machine tracking.
        </p>
      </div>

      <!-- Actions: Customer Selector & View/Hide Balance Button -->
      <div class="flex items-end gap-3 w-full sm:w-auto">
        <!-- Customer Selector -->
        <div class="w-full sm:w-auto min-w-[240px]">
          <label class="form-label mb-1.5 block">Select Customer Account</label>
          <div class="relative">
            <select
              v-model="selectedCustomerName"
              @change="loadLedger"
              class="form-select font-bold text-white h-11 !min-h-0 py-0 px-3.5"
            >
              <option v-if="customerOptions.length === 0" value="" disabled>
                No Customer Accounts Available
              </option>
              <option v-for="cust in customerOptions" :key="cust" :value="cust">
                {{ cust }}
              </option>
            </select>
          </div>
        </div>

        <!-- View / Hide Balance Security Button -->
        <div class="shrink-0">
          <button
            @click="handleBalanceToggle"
            :class="[
              'btn font-bold flex items-center justify-center gap-2 shadow-lg transition-all h-11 !min-h-0 px-4 whitespace-nowrap',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
            ]"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Login verification required to reveal balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="18" />
            <Eye v-else :size="18" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View / Check Balance' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Ledger Display -->
    <div v-if="ledger" class="space-y-6">
      <!-- Customer Credit Governance & Limit Status Banner (Requirements 10-16) -->
      <div
        class="glass-panel p-5 border-l-4 space-y-4"
        :class="customerCreditStatus.isLocked ? 'border-l-red-500 bg-red-950/20' : customerCreditStatus.status === 'Critical' ? 'border-l-amber-500 bg-amber-950/20' : customerCreditStatus.status === 'Warning' ? 'border-l-yellow-500 bg-yellow-950/20' : 'border-l-emerald-500 bg-emerald-950/20'"
      >
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center gap-3">
            <ShieldAlert
              :size="26"
              :class="customerCreditStatus.isLocked ? 'text-red-400' : customerCreditStatus.status === 'Critical' ? 'text-amber-400' : 'text-emerald-400'"
            />
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-base font-bold text-white">{{ selectedCustomerName }} — Credit Governance</h3>
                <span :class="['badge font-bold', customerCategoryBadgeClass]">
                  Category {{ customerData?.categoryCode || 'C' }}
                </span>
                <span v-if="customerCreditStatus.isLocked" class="badge badge-danger font-mono font-bold animate-pulse">
                  CREDIT LOCKED
                </span>
                <span v-else :class="['badge font-mono font-bold', customerCreditStatus.status === 'Critical' ? 'badge-danger' : customerCreditStatus.status === 'Warning' ? 'badge-warning' : 'badge-success']">
                  {{ customerCreditStatus.status.toUpperCase() }}
                </span>
              </div>
              <p class="text-xs text-slate-300 mt-1">
                Credit Limit: <strong class="font-mono text-white">{{ formatBalance(customerCreditStatus.limit) }}</strong> | 
                Allowed Credit Term: <strong class="font-mono text-white">{{ customerData?.allowedDays || 30 }} Days</strong> | 
                Exposure: <strong class="font-mono" :class="customerCreditStatus.percentage >= 90 ? 'text-red-400 font-bold' : 'text-emerald-400'">{{ customerCreditStatus.percentage }}%</strong>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button @click="openOverrideModal" class="btn btn-xs btn-primary font-bold">
              Override Limit
            </button>
            <button @click="toggleLock" :class="['btn btn-xs font-bold', customerCreditStatus.isLocked ? 'btn-success' : 'btn-danger']">
              {{ customerCreditStatus.isLocked ? 'Unlock Customer' : 'Lock Credit' }}
            </button>
            <button @click="openReminderModal" class="btn btn-xs btn-warning font-bold flex items-center gap-1">
              <Send :size="12" />
              <span>Send Reminder</span>
            </button>
          </div>
        </div>

        <!-- Progress bar of credit exposure -->
        <div>
          <div class="flex justify-between text-xs mb-1 font-mono">
            <span class="text-slate-400">Current Balance: <strong class="text-white">{{ formatBalance(customerCreditStatus.balance) }}</strong></span>
            <span :class="customerCreditStatus.percentage >= 90 ? 'text-red-400 font-bold' : 'text-slate-300'">
              Remaining Credit: {{ formatBalance(customerCreditStatus.remainingCredit) }}
            </span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              class="h-2.5 rounded-full transition-all duration-500"
              :class="customerCreditStatus.percentage >= 100 ? 'bg-red-500' : customerCreditStatus.percentage >= 90 ? 'bg-amber-500' : customerCreditStatus.percentage >= 75 ? 'bg-yellow-400' : 'bg-emerald-500'"
              :style="{ width: Math.min(100, customerCreditStatus.percentage) + '%' }"
            ></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>0% (Safe)</span>
            <span>75% Warning</span>
            <span>90% Critical Alert</span>
            <span>100% Auto-Lock</span>
          </div>
        </div>

        <!-- Overdue Aging Notice if any -->
        <div v-if="customerCreditStatus.overdueDays >= 30" class="p-2.5 rounded bg-red-950/50 border border-red-800/60 text-xs text-red-300 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <AlertCircle :size="16" class="text-red-400 shrink-0" />
            <span>Customer has deliveries exceeding 30-day payment term ({{ customerCreditStatus.overdueDays }} days elapsed). Automatic block is in effect.</span>
          </div>
          <span class="badge badge-danger font-mono font-bold">{{ customerCreditStatus.overdueDays }} DAYS OVERDUE</span>
        </div>
      </div>

      <!-- Financial Summary Metric Cards -->
      <div class="kpi-grid">
        <!-- Total Invoiced -->
        <div class="kpi-card glass-panel p-5">
          <div class="flex items-center justify-between">
            <span class="kpi-title">Total Invoiced Sales</span>
            <FileText :size="20" class="text-blue-400" />
          </div>
          <div class="kpi-value text-white mt-1">{{ formatBalance(ledger.totalInvoiced) }}</div>
          <div class="kpi-subtitle">
            <TrendingUp :size="12" class="text-blue-400" />
            <span>{{ ledger.invoices.length }} Sale Invoices Issued</span>
          </div>
        </div>

        <!-- Total Payments Received -->
        <div class="kpi-card kpi-success glass-panel p-5">
          <div class="flex items-center justify-between">
            <span class="kpi-title">Total Payment Received</span>
            <Receipt :size="20" class="text-emerald-400" />
          </div>
          <div class="kpi-value text-emerald-400 mt-1">{{ formatBalance(ledger?.totalPaid) }}</div>
          <div class="kpi-subtitle text-emerald-400">
            <CheckCircle2 :size="12" />
            <span>{{ ledger.receipts.length }} Cash / Bank Receipts</span>
          </div>
        </div>

        <!-- Outstanding Balance -->
        <div class="kpi-card kpi-danger glass-panel p-5">
          <div class="flex items-center justify-between">
            <span class="kpi-title">Outstanding Balance</span>
            <DollarSign :size="20" class="text-red-400" />
          </div>
          <div :class="['kpi-value mt-1', (ledger?.outstandingBalance || 0) > 0 ? 'text-red-400' : 'text-emerald-400']">
            {{ formatBalance(ledger?.outstandingBalance) }}
          </div>
          <div class="kpi-subtitle text-red-400">
            <Clock :size="12" />
            <span>Unpaid Balance Due</span>
          </div>
        </div>

        <!-- Machine Paid vs Pending Count -->
        <div class="kpi-card kpi-purple glass-panel p-5">
          <div class="flex items-center justify-between">
            <span class="kpi-title">Machine Payment Ratio</span>
            <Tag :size="20" class="text-purple-400" />
          </div>
          <div class="kpi-value text-white mt-1 flex items-center gap-2">
            <span class="text-emerald-400 font-bold">{{ ledger.paidMachines.length }} Paid</span>
            <span class="text-slate-500">/</span>
            <span class="text-red-400 font-bold">{{ ledger.pendingMachines.length }} Pending</span>
          </div>
          <div class="kpi-subtitle">
            <span>Total Units: {{ ledger.customerMachines.length }}</span>
          </div>
        </div>
      </div>

      <!-- Tab Navigation Bar -->
      <div class="glass-panel p-2 flex flex-wrap gap-2">
        <button
          @click="activeTab = 'invoices'"
          :class="['btn', activeTab === 'invoices' ? 'btn-primary' : 'btn-ghost']"
        >
          <FileText :size="16" />
          <span>Sales Invoices ({{ ledger.invoices.length }})</span>
        </button>

        <button
          @click="activeTab = 'payments'"
          :class="['btn', activeTab === 'payments' ? 'btn-primary' : 'btn-ghost']"
        >
          <Receipt :size="16" />
          <span>Payment In Receipts ({{ ledger.receipts.length }})</span>
        </button>

        <button
          @click="activeTab = 'paid'"
          :class="['btn', activeTab === 'paid' ? 'btn-success text-white' : 'btn-ghost']"
        >
          <CheckCircle2 :size="16" />
          <span>Paid Machines ({{ ledger.paidMachines.length }})</span>
        </button>

        <button
          @click="activeTab = 'unpaid'"
          :class="['btn', activeTab === 'unpaid' ? 'btn-danger text-white' : 'btn-ghost']"
        >
          <Clock :size="16" />
          <span>Unpaid Machines ({{ ledger.pendingMachines.length }})</span>
        </button>

        <button
          @click="activeTab = 'returns'"
          :class="['btn', activeTab === 'returns' ? 'btn-warning text-white' : 'btn-ghost']"
        >
          <RotateCcw :size="16" />
          <span>Sales Returns ({{ (ledger.returns || []).length }})</span>
        </button>

        <button
          @click="activeTab = 'paymentOut'"
          :class="['btn', activeTab === 'paymentOut' ? 'btn-primary' : 'btn-ghost']"
        >
          <DollarSign :size="16" />
          <span>Payment Out ({{ (ledger.paymentsOut || []).length }})</span>
        </button>

        <button
          @click="activeTab = 'equipment'"
          :class="['btn', activeTab === 'equipment' ? 'btn-primary' : 'btn-ghost']"
        >
          <Package :size="16" />
          <span>Equipment History ({{ ledger.purchasedItems?.length || 0 }})</span>
        </button>
      </div>

      <!-- Tab 1: Sales Invoices -->
      <div v-if="activeTab === 'invoices'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <FileText :size="20" class="text-blue-400" />
            <span>Sales Invoices</span>
          </h3>
          <span class="badge badge-neutral font-mono">{{ ledger.invoices.length }} Invoices</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Branch</th>
                <th>Items Purchased</th>
                <th>Grand Total</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in ledger.invoices" :key="inv.invoiceNo">
                <td class="font-mono font-bold text-blue-400">{{ inv.invoiceNo }}</td>
                <td class="font-bold text-white">{{ inv.customer || selectedCustomerName }}</td>
                <td class="font-mono text-xs text-subtle">{{ inv.saleDate }}</td>
                <td>
                  <span class="badge badge-purple">
                    <Building2 :size="10" />
                    {{ inv.branch || 'Peshawar' }}
                  </span>
                </td>
                <td>
                  <div v-for="item in inv.items" :key="item.productName" class="text-xs py-0.5">
                    <span class="font-bold text-white">{{ item.qty }}x</span> {{ item.productName }}
                    <span v-if="item.serials?.length" class="text-slate-400 font-mono">({{ item.serials.join(', ') }})</span>
                  </div>
                </td>
                <td class="font-bold text-emerald-400">{{ formatBalance(inv.grandTotal) }}</td>
                <td>
                  <span class="badge badge-neutral">{{ inv.paymentMethod }}</span>
                </td>
              </tr>
              <tr v-if="ledger.invoices.length === 0">
                <td colspan="7" class="p-6 text-center text-subtle italic">No sales invoices recorded for this customer.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Payment In Receipts -->
      <div v-if="activeTab === 'payments'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Receipt :size="20" class="text-emerald-400" />
            <span>Payment In Receipts</span>
          </h3>
          <span class="badge badge-success font-mono">{{ ledger.receipts.length }} Receipts</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Type</th>
                <th>Branch</th>
                <th>Allocated Machines</th>
                <th>Amount Received</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rcp in ledger.receipts" :key="rcp.receiptNo">
                <td class="font-mono font-bold text-emerald-400">{{ rcp.receiptNo }}</td>
                <td class="font-bold text-white">{{ rcp.customer || selectedCustomerName }}</td>
                <td class="font-mono text-xs text-subtle">{{ rcp.paymentDate }}</td>
                <td>
                  <span :class="['badge', (rcp.paymentType || rcp.paymentMethod) === 'Cash Payment' ? 'badge-warning' : 'badge-info']">
                    {{ rcp.paymentType || rcp.paymentMethod || 'Cash Payment' }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-purple">
                    <Building2 :size="10" />
                    {{ rcp.branch || 'Peshawar' }}
                  </span>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="item in rcp.paidSerials" :key="item.serialCode" class="badge badge-neutral font-mono text-xs">
                      {{ item.machineCode }} ({{ (item.serialCode || '').replace(/^SN-/i, '') }})
                    </span>
                  </div>
                </td>
                <td class="font-bold text-emerald-400">{{ formatBalance(rcp.amount || rcp.amountReceived) }}</td>
                <td class="text-xs text-subtle">{{ rcp.description }}</td>
              </tr>
              <tr v-if="ledger.receipts.length === 0">
                <td colspan="8" class="p-6 text-center text-subtle italic">No payment receipts recorded for this customer.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Dedicated PAID Machines Tab -->
      <div v-if="activeTab === 'paid'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 :size="20" />
              <span>Paid Machines & Cleared Equipment</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              All equipment units for {{ selectedCustomerName }} that have been fully paid.
            </p>
          </div>
          <span class="badge badge-success font-mono">{{ ledger.paidMachines.length }} Fully Paid</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Machine Code</th>
                <th>Serial Number</th>
                <th>Equipment Name</th>
                <th>Customer Name</th>
                <th>Paid Amount</th>
                <th>Payment Date</th>
                <th>Receipt / Ref #</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in ledger.paidMachines" :key="m.serialCode">
                <td class="font-mono font-bold text-purple-400">{{ m.machineCode }}</td>
                <td class="font-mono text-xs text-primary font-bold">{{ (m.serialCode || '').replace(/^SN-/i, '') }}</td>
                <td class="text-sm font-semibold text-white">{{ m.productName || m.sku }}</td>
                <td class="font-bold text-slate-200">{{ m.customer || selectedCustomerName }}</td>
                <td class="font-bold text-emerald-400">{{ formatBalance(m.paymentAmount || m.salePrice) }}</td>
                <td class="font-mono text-xs text-subtle">{{ m.paymentDate || m.unpaidDate || 'N/A' }}</td>
                <td class="font-mono text-xs text-emerald-300 font-bold">{{ m.paymentReceiptNo || 'PAID (Cash Sale)' }}</td>
                <td>
                  <span class="badge badge-success flex items-center gap-1 w-max">
                    <CheckCircle2 :size="11" />
                    PAID
                  </span>
                </td>
              </tr>
              <tr v-if="ledger.paidMachines.length === 0">
                <td colspan="8" class="p-8 text-center text-subtle italic">No cleared/paid machines logged for this customer yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 4: Dedicated UNPAID Machines Tab -->
      <div v-if="activeTab === 'unpaid'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-red-400 flex items-center gap-2">
              <Clock :size="20" />
              <span>Unpaid & Pending Equipment Machines</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Outstanding equipment machines pending settlement. Shows exact unpaid date and invoice source.
            </p>
          </div>
          <span class="badge badge-danger font-mono">{{ ledger.pendingMachines.length }} Pending Due</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Machine Code</th>
                <th>Serial Number</th>
                <th>Equipment Name</th>
                <th>Customer Name</th>
                <th>Unpaid Due Amount</th>
                <th>Invoice #</th>
                <th>Unpaid Date</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in ledger.pendingMachines" :key="m.serialCode">
                <td class="font-mono font-bold text-purple-400">{{ m.machineCode }}</td>
                <td class="font-mono text-xs text-primary font-bold">{{ (m.serialCode || '').replace(/^SN-/i, '') }}</td>
                <td class="text-sm font-semibold text-white">{{ m.productName || m.sku }}</td>
                <td class="font-bold text-slate-200">{{ m.customer || selectedCustomerName }}</td>
                <td class="font-bold text-red-400">{{ formatBalance(m.salePrice) }}</td>
                <td class="font-mono text-xs text-blue-400 font-bold">{{ m.invoiceNo || 'N/A' }}</td>
                <td class="font-mono text-xs text-amber-400 font-bold">
                  {{ m.unpaidDate || 'N/A' }}
                </td>
                <td>
                  <span class="badge badge-purple text-xs">
                    <Building2 :size="10" />
                    {{ m.allocationCity || 'Peshawar' }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-danger flex items-center gap-1 w-max">
                    <Clock :size="11" />
                    UNPAID DUE
                  </span>
                </td>
                <td>
                  <router-link
                    :to="`/payment-in?customer=${encodeURIComponent(selectedCustomerName)}`"
                    class="btn btn-sm btn-primary text-xs flex items-center gap-1"
                  >
                    <Receipt :size="12" />
                    <span>Pay Due</span>
                  </router-link>
                </td>
              </tr>
              <tr v-if="ledger.pendingMachines.length === 0">
                <td colspan="10" class="p-8 text-center text-emerald-400 font-bold italic">
                  🎉 Great news! All machines are fully paid for {{ selectedCustomerName }}. No pending due machines.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 5: Sales & Purchase Returns -->
      <div v-if="activeTab === 'returns'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw :size="20" class="text-amber-400" />
              <span>Sales Returns & Credit Notes</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Returned products restocked to available inventory under distinct Return IDs (RET-2026-xxx).
            </p>
          </div>
          <span class="badge badge-warning font-mono">{{ (ledger.returns || []).length }} Returns</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Original Invoice #</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Returned Machines / Serials</th>
                <th>Refund Amount</th>
                <th>Reason</th>
                <th>Restock Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ret in (ledger.returns || [])" :key="ret.returnNo">
                <td class="font-mono font-bold text-amber-400">{{ ret.returnNo }}</td>
                <td class="font-mono text-xs text-blue-400 font-bold">{{ ret.invoiceNo }}</td>
                <td class="font-mono text-xs text-subtle">{{ ret.returnDate }}</td>
                <td class="font-bold text-white">{{ ret.customer || selectedCustomerName }}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="s in ret.returnedSerials" :key="s.serialCode" class="badge badge-neutral font-mono text-xs">
                      {{ s.machineCode || '' }} ({{ s.serialCode }}) - {{ s.productName }}
                    </span>
                  </div>
                </td>
                <td class="font-bold text-emerald-400">{{ formatBalance(ret.totalRefundAmount) }}</td>
                <td class="text-xs text-slate-300">{{ ret.reason }}</td>
                <td>
                  <span class="badge badge-success text-xs">
                    Restocked to Available
                  </span>
                </td>
              </tr>
              <tr v-if="!ledger.returns || ledger.returns.length === 0">
                <td colspan="8" class="p-6 text-center text-subtle italic">No product returns or credit notes recorded for {{ selectedCustomerName }}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 6: Payment Out (Refunds / Customer Disbursements) -->
      <div v-if="activeTab === 'paymentOut'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign :size="20" class="text-amber-400" />
              <span>Payment Out (Refunds & Customer Disbursements)</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Outflow vouchers recorded for customer refund payout or account debit.
            </p>
          </div>
          <span class="badge badge-warning font-mono">{{ (ledger.paymentsOut || []).length }} Vouchers</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Voucher #</th>
                <th>Date</th>
                <th>Payee</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th>Branch</th>
                <th>Amount Out</th>
                <th>Description / Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vou in (ledger.paymentsOut || [])" :key="vou.voucherNo">
                <td class="font-mono font-bold text-amber-400">{{ vou.voucherNo }}</td>
                <td class="font-mono text-xs text-subtle">{{ vou.paymentDate }}</td>
                <td class="font-bold text-white">{{ vou.payee || selectedCustomerName }}</td>
                <td>
                  <span class="badge badge-neutral text-xs">{{ vou.category }}</span>
                </td>
                <td>
                  <span class="badge badge-info text-xs">{{ vou.paymentType || 'Cash Payment' }}</span>
                </td>
                <td>
                  <span class="badge badge-purple text-xs">{{ vou.branch || 'Peshawar' }}</span>
                </td>
                <td class="font-bold text-red-400">{{ formatBalance(vou.amount) }}</td>
                <td class="text-xs text-slate-300">{{ vou.description }}</td>
              </tr>
              <tr v-if="!ledger.paymentsOut || ledger.paymentsOut.length === 0">
                <td colspan="8" class="p-6 text-center text-subtle italic">No payment out vouchers or refund debits recorded for {{ selectedCustomerName }}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 7: Equipment Purchase History -->
      <div v-if="activeTab === 'equipment'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Package :size="20" class="text-blue-400" />
            <span>Equipment Purchase Breakdown History (Since Last Year)</span>
          </h3>
          <span class="badge badge-info font-mono">{{ ledger.purchasedItems?.length || 0 }} Items</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Total Units Purchased</th>
                <th>Total Invoiced Amount</th>
                <th>Latest Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="eq in ledger.purchasedItems" :key="eq.productName">
                <td class="font-bold text-main">{{ eq.productName }}</td>
                <td class="font-mono font-bold text-primary">{{ eq.totalQty }} units</td>
                <td class="font-bold text-emerald-400">{{ formatBalance(eq.totalAmount) }}</td>
                <td class="font-mono text-xs text-subtle">{{ eq.lastPurchaseDate }}</td>
              </tr>
              <tr v-if="!ledger.purchasedItems || ledger.purchasedItems.length === 0">
                <td colspan="4" class="p-6 text-center text-subtle italic">No equipment purchase breakdown found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State when no customer / transactions exist -->
    <div v-else class="glass-panel p-12 text-center space-y-3 shadow-xl">
      <div class="w-16 h-16 rounded-full bg-slate-800/70 mx-auto flex items-center justify-center text-slate-400">
        <FileText :size="28" />
      </div>
      <h3 class="text-lg font-bold text-white">No Customer Ledger Found</h3>
      <p class="text-slate-400 text-sm max-w-md mx-auto">
        There are currently no customer transaction records in the system. As soon as you issue a sales invoice or record a payment, the customer ledger will automatically appear here.
      </p>
    </div>
    <!-- Modal: Management Credit Limit Override -->
    <div v-if="showOverrideModal" class="modal-backdrop" @click.self="showOverrideModal = false">
      <div class="modal-content max-w-lg">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <ShieldAlert :size="20" class="text-purple-400" />
            <h3 class="text-lg font-bold text-white">Management Credit Override</h3>
          </div>
          <button @click="showOverrideModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleSaveOverride" class="p-5 space-y-4">
          <div class="p-3 bg-purple-950/40 border border-purple-800/60 rounded-lg text-xs text-purple-200">
            Authorizing executive credit limit override for <strong>{{ selectedCustomerName }}</strong>.
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-2.5 bg-slate-900 rounded border border-slate-800">
              <span class="text-slate-400 block">Current Balance</span>
              <strong class="font-mono text-red-400">{{ formatBalance(customerCreditStatus.balance) }}</strong>
            </div>
            <div class="p-2.5 bg-slate-900 rounded border border-slate-800">
              <span class="text-slate-400 block">Base Credit Limit</span>
              <strong class="font-mono text-white">{{ formatBalance(customerCreditStatus.limit) }}</strong>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Additional Credit Headroom (PKR) *</label>
            <input
              v-model.number="overrideForm.additionalLimit"
              type="number"
              step="50000"
              min="10000"
              required
              class="form-input font-mono font-bold text-emerald-400"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Authorization Reason *</label>
            <select v-model="overrideForm.reason" class="form-select font-bold">
              <option value="Executive Director Discretion">Executive Director Discretion</option>
              <option value="Urgent Government Hospital Order">Urgent Government Hospital Order</option>
              <option value="Verified Promissory Note Received">Verified Promissory Note Received</option>
              <option value="High-Volume Repeat Client">High-Volume Repeat Client</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Executive Remarks</label>
            <textarea
              v-model="overrideForm.remarks"
              rows="2"
              placeholder="Enter management justification and terms..."
              class="form-textarea text-xs"
            ></textarea>
          </div>

          <div class="modal-footer pt-3 border-t border-slate-800">
            <button type="button" @click="showOverrideModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary font-bold">
              Confirm & Unlock Headroom
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Payment Reminder -->
    <div v-if="showReminderModal" class="modal-backdrop" @click.self="showReminderModal = false">
      <div class="modal-content max-w-lg">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <Send :size="20" class="text-amber-400" />
            <h3 class="text-lg font-bold text-white">Send Payment Notice / Reminder</h3>
          </div>
          <button @click="showReminderModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleSendReminder" class="p-5 space-y-4">
          <div class="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-xs text-amber-200">
            Dispatching payment reminder to <strong>{{ selectedCustomerName }}</strong> for outstanding balance of <strong>{{ formatBalance(customerCreditStatus.balance) }}</strong>.
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label">Notification Channel</label>
              <select v-model="reminderForm.channel" class="form-select font-bold">
                <option value="WhatsApp">WhatsApp Business API</option>
                <option value="SMS">Direct GSM SMS</option>
                <option value="Email">Official Corporate Email</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Recipient Contact</label>
              <input v-model="reminderForm.recipient" type="text" class="form-input font-mono" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Notice Message Text</label>
            <textarea
              v-model="reminderForm.message"
              rows="4"
              class="form-textarea text-xs font-mono"
            ></textarea>
          </div>

          <div class="modal-footer pt-3 border-t border-slate-800">
            <button type="button" @click="showReminderModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-warning text-white font-bold flex items-center gap-1.5">
              <Send :size="14" />
              <span>Dispatch Reminder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  FileText,
  Receipt,
  Tag,
  Package,
  DollarSign,
  CheckCircle2,
  Clock,
  Building2,
  TrendingUp,
  RotateCcw,
  Eye,
  EyeOff,
  ShieldAlert,
  AlertCircle,
  Send,
  Lock,
  Unlock
} from 'lucide-vue-next'

const route = useRoute()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const selectedCustomerName = ref('')
const activeTab = ref('invoices')
const ledger = ref(null)

function handleBalanceToggle() {
  authStore.toggleBalance()
}

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

const customerOptions = computed(() => {
  const set = new Set()
  dataStore.salesInvoices.forEach(s => { 
    if (s.customer) set.add(s.customer) 
    if (s.customerName) set.add(s.customerName)
  })
  dataStore.serials.forEach(s => { if (s.customer) set.add(s.customer) })
  return Array.from(set)
})

const customerData = computed(() => {
  if (!selectedCustomerName.value) return null
  return (dataStore.customers || []).find(c => c.name.toLowerCase() === selectedCustomerName.value.toLowerCase())
})

const customerCreditStatus = computed(() => {
  if (!selectedCustomerName.value) {
    return { isLocked: false, status: 'Normal', percentage: 0, balance: 0, limit: 1000000, remainingCredit: 1000000, overdueDays: 0 }
  }
  return dataStore.getCustomerCreditStatus(selectedCustomerName.value, 0)
})

const customerCategoryBadgeClass = computed(() => {
  const code = customerData.value?.categoryCode || 'C'
  const map = {
    'A': 'badge-purple font-bold',
    'B': 'badge-info font-bold',
    'C': 'badge-warning font-bold',
    'D': 'badge-danger font-bold'
  }
  return map[code] || 'badge-secondary'
})

function toggleLock() {
  const userName = authStore.user?.username || 'Finance Admin'
  if (customerCreditStatus.value.isLocked) {
    dataStore.unlockCustomer(selectedCustomerName.value, 'Admin unlocked from Customer Ledger', userName)
    uiStore.showModal('Customer Unlocked', `${selectedCustomerName.value} has been unblocked for new credit sales.`, 'success')
  } else {
    dataStore.lockCustomer(selectedCustomerName.value, 'Manual credit lock triggered from Customer Ledger', userName)
    uiStore.showModal('Customer Locked', `${selectedCustomerName.value} has been restricted from credit sales.`, 'warning')
  }
}

// ── Credit Override Modal State ──────────────────────────────
const showOverrideModal = ref(false)
const overrideForm = ref({
  additionalLimit: 250000,
  reason: 'Executive Director Discretion',
  remarks: ''
})

function openOverrideModal() {
  overrideForm.value = {
    additionalLimit: 250000,
    reason: 'Executive Director Discretion',
    remarks: 'Approved for urgent clinic installation.'
  }
  showOverrideModal.value = true
}

function handleSaveOverride() {
  const res = dataStore.overrideCustomerCredit(
    selectedCustomerName.value,
    overrideForm.value.additionalLimit,
    overrideForm.value.reason,
    overrideForm.value.remarks,
    authStore.user?.username || 'Superadmin'
  )
  if (res.success) {
    uiStore.showModal('Credit Limit Overridden', res.message, 'success')
    showOverrideModal.value = false
  } else {
    uiStore.showModal('Override Failed', res.message, 'danger')
  }
}

// ── Reminder Modal State ─────────────────────────────────────
const showReminderModal = ref(false)
const reminderForm = ref({
  channel: 'WhatsApp',
  recipient: '+92 300 1234567',
  message: ''
})

function openReminderModal() {
  reminderForm.value = {
    channel: 'WhatsApp',
    recipient: customerData.value?.phone || '+92 300 1234567',
    message: `Respected ${selectedCustomerName.value}, your account has an outstanding balance of PKR ${Number(customerCreditStatus.value.balance).toLocaleString()} under MedImage ERP credit terms. Please expedite clearance.`
  }
  showReminderModal.value = true
}

function handleSendReminder() {
  const invNo = ledger.value?.invoices?.[0]?.invoiceNo || 'LEDGER-REM'
  dataStore.sendPaymentReminder(
    invNo,
    reminderForm.value.channel,
    reminderForm.value.message,
    authStore.user?.username || 'Finance Admin'
  )
  uiStore.showModal(
    'Reminder Dispatched',
    `Payment notice sent via ${reminderForm.value.channel} to ${selectedCustomerName.value}.`,
    'success'
  )
  showReminderModal.value = false
}

watch(customerOptions, (opts) => {
  if (opts.length > 0) {
    if (!selectedCustomerName.value || !opts.includes(selectedCustomerName.value)) {
      selectedCustomerName.value = opts[0]
      loadLedger()
    }
  } else {
    selectedCustomerName.value = ''
    ledger.value = null
  }
}, { immediate: true })

onMounted(() => {
  if (route.query.customer) {
    selectedCustomerName.value = route.query.customer
  }
  loadLedger()
})

function loadLedger() {
  if (!selectedCustomerName.value) {
    ledger.value = null
    return
  }
  ledger.value = dataStore.getCustomerLedger(selectedCustomerName.value)
}
</script>
