<template>
  <div>
    <!-- ════════════════════════════════════════════
      1. DELIVERY CHALLAN MODAL
    ════════════════════════════════════════════ -->
    <div v-if="uiStore.showDeliveryChallanModal" class="modal-backdrop" @click.self="uiStore.closeDeliveryChallanModal">
      <div class="modal-content max-w-2xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Truck :size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Issue Delivery Challan (DC)</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Generate and print equipment dispatch dispatch voucher</p>
            </div>
          </div>
          <button @click="uiStore.closeDeliveryChallanModal" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <form @submit.prevent="handleSaveDeliveryChallan" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Challan Number</label>
              <input v-model="dcForm.dcNumber" type="text" class="form-input w-full font-mono font-bold" required />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dispatch / Delivery Date</label>
              <input v-model="dcForm.deliveryDate" type="date" class="form-input w-full font-bold" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Customer / Party Name *</label>
              <input v-model="dcForm.customer" list="dc-party-list" type="text" placeholder="Select or type customer..." class="form-input w-full font-bold" required />
              <datalist id="dc-party-list">
                <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">{{ c.name }}</option>
              </datalist>
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Vehicle / Courier / Driver</label>
              <input v-model="dcForm.vehicleNo" type="text" placeholder="e.g. Courier Cargo / Driver Ali" class="form-input w-full" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Equipment / Item Description</label>
              <input v-model="dcForm.itemDescription" type="text" placeholder="e.g. 12D HIFU Machine PH12" class="form-input w-full font-bold" required />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantity</label>
              <input v-model.number="dcForm.qty" type="number" min="1" class="form-input w-full font-mono font-bold" required />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Serial Numbers / Machine Codes</label>
            <input v-model="dcForm.serials" type="text" placeholder="e.g. SN-8801, SN-8802" class="form-input w-full font-mono" />
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Delivery Facility / Hospital Address</label>
            <input v-model="dcForm.deliveryAddress" type="text" placeholder="Hospital address / ward / clinic..." class="form-input w-full" />
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Special Delivery Remarks / Instructions</label>
            <textarea v-model="dcForm.remarks" rows="2" placeholder="Inspection notes, warranty stamp..." class="form-input w-full"></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="uiStore.closeDeliveryChallanModal" class="btn btn-secondary btn-sm">Cancel</button>
            <button type="button" @click="handlePrintDeliveryChallan" class="btn btn-secondary btn-sm flex items-center gap-1.5 text-teal-400 border border-teal-500/40">
              <Printer :size="13" />
              <span>Print DC</span>
            </button>
            <button type="submit" class="btn btn-primary btn-sm font-bold flex items-center gap-1.5">
              <Check :size="13" />
              <span>Save & Issue DC</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      2. PAYMENT OUT MODAL (DISBURSEMENT / VOUCHER)
    ════════════════════════════════════════════ -->
    <div v-if="uiStore.showPaymentOutModal" class="modal-backdrop" @click.self="uiStore.closePaymentOutModal">
      <div class="modal-content max-w-xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ArrowUpRight :size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Record Payment Out (Disbursement)</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Post vendor payment, expense disbursement or refund</p>
            </div>
          </div>
          <button @click="uiStore.closePaymentOutModal" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <form @submit.prevent="handleSavePaymentOut" class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payee / Vendor / Party *</label>
            <input v-model="paymentOutForm.payee" list="payment-out-payee-list" type="text" placeholder="Type or select payee..." class="form-input w-full font-bold" required />
            <datalist id="payment-out-payee-list">
              <option v-for="s in dataStore.suppliers" :key="s.name || s" :value="s.name || s">{{ s.name || s }} (Supplier)</option>
              <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">{{ c.name }} (Customer)</option>
            </datalist>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount Paid (PKR) *</label>
              <input v-model.number="paymentOutForm.amount" type="number" min="1" placeholder="PKR Amount" class="form-input w-full font-mono font-bold text-rose-500 text-sm" required />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Date *</label>
              <input v-model="paymentOutForm.paymentDate" type="date" class="form-input w-full font-bold" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
              <select v-model="paymentOutForm.paymentMethod" class="form-select w-full font-bold">
                <option value="Cash Payment">Cash Payment</option>
                <option value="Bank Account">Bank Account (Meezan/HBL)</option>
                <option value="Cheque / RTGS">Cheque / RTGS</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
              <select v-model="paymentOutForm.category" class="form-select w-full">
                <option value="Vendor Payment">Vendor / Supplier Payment</option>
                <option value="BL Consignment Outflow">BL Consignment Outflow</option>
                <option value="Workshop Parts Inward">Workshop Parts Inward</option>
                <option value="Operational Expense">Operational Expense</option>
                <option value="Customer Refund">Customer Refund</option>
              </select>
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reference / Cheque # / Notes</label>
            <input v-model="paymentOutForm.description" type="text" placeholder="Cheque ref, BL invoice #, receipt notes..." class="form-input w-full" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="uiStore.closePaymentOutModal" class="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" class="btn btn-danger btn-sm font-bold flex items-center gap-1.5">
              <Check :size="13" />
              <span>Save Payment Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      3. PAYMENT IN MODAL (RECEIPT)
    ════════════════════════════════════════════ -->
    <div v-if="uiStore.showPaymentInModal" class="modal-backdrop" @click.self="uiStore.closePaymentInModal">
      <div class="modal-content max-w-xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Receipt :size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Record Payment In (Receipt)</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Receive cash or bank collection from party</p>
            </div>
          </div>
          <button @click="uiStore.closePaymentInModal" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <form @submit.prevent="handleSavePaymentIn" class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Customer / Party Name *</label>
            <input v-model="paymentInForm.customer" list="payment-in-party-list" type="text" placeholder="Type or select customer..." class="form-input w-full font-bold" required />
            <datalist id="payment-in-party-list">
              <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">
                {{ c.name }} (Bal: PKR {{ (c.balance || 0).toLocaleString() }})
              </option>
            </datalist>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount Received (PKR) *</label>
              <input v-model.number="paymentInForm.amount" type="number" min="1" placeholder="PKR Amount" class="form-input w-full font-mono font-bold text-emerald-500 text-sm" required />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Receipt Date *</label>
              <input v-model="paymentInForm.paymentDate" type="date" class="form-input w-full font-bold" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Mode</label>
              <select v-model="paymentInForm.paymentMethod" class="form-select w-full font-bold">
                <option value="Cash Payment">Cash Payment</option>
                <option value="Bank Account">Bank Account (Meezan/HBL)</option>
                <option value="Cheque / RTGS">Cheque / RTGS</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Depot Branch</label>
              <select v-model="paymentInForm.branch" class="form-select w-full">
                <option value="Peshawar">Peshawar</option>
                <option value="Lahore">Lahore</option>
                <option value="Multan">Multan</option>
                <option value="Karachi">Karachi</option>
              </select>
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reference / Cheque No / Notes</label>
            <input v-model="paymentInForm.description" type="text" placeholder="Cheque ref, deposit slip, invoice reference..." class="form-input w-full" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="uiStore.closePaymentInModal" class="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" class="btn btn-success btn-sm font-bold flex items-center gap-1.5">
              <Check :size="13" />
              <span>Record Payment In</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      4. SALE RETURN MODAL (CREDIT NOTE)
    ════════════════════════════════════════════ -->
    <div v-if="uiStore.showSaleReturnModal" class="modal-backdrop" @click.self="uiStore.closeSaleReturnModal">
      <div class="modal-content max-w-xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <RotateCcw :size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Issue Sale Return & Credit Note</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Process returned machine, restock serial, and issue refund</p>
            </div>
          </div>
          <button @click="uiStore.closeSaleReturnModal" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <form @submit.prevent="handleSaveSaleReturn" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Customer Party *</label>
              <input v-model="saleReturnForm.customer" list="sr-customer-list" type="text" placeholder="Select customer..." class="form-input w-full font-bold" required />
              <datalist id="sr-customer-list">
                <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">{{ c.name }}</option>
              </datalist>
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Original Invoice #</label>
              <input v-model="saleReturnForm.invoiceNo" type="text" placeholder="e.g. INV-2026-001" class="form-input w-full font-mono font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Refund Amount (PKR) *</label>
              <input v-model.number="saleReturnForm.refundAmount" type="number" min="0" placeholder="PKR Refund" class="form-input w-full font-mono font-bold text-amber-500" required />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Returned Serial / Machine Code</label>
              <input v-model="saleReturnForm.serialCode" type="text" placeholder="e.g. SN-9011" class="form-input w-full font-mono" />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Return Reason</label>
            <input v-model="saleReturnForm.reason" type="text" placeholder="e.g. Client exchange / Cancellation / Defect" class="form-input w-full" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="uiStore.closeSaleReturnModal" class="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" class="btn btn-warning btn-sm font-bold flex items-center gap-1.5">
              <Check :size="13" />
              <span>Issue Credit Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      5. PURCHASE RETURN MODAL (DEBIT NOTE)
    ════════════════════════════════════════════ -->
    <div v-if="uiStore.showPurchaseReturnModal" class="modal-backdrop" @click.self="uiStore.closePurchaseReturnModal">
      <div class="modal-content max-w-xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <RotateCcw :size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Record Purchase Return / Debit Note</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Return items to vendor / consignor and deduct from payable ledger</p>
            </div>
          </div>
          <button @click="uiStore.closePurchaseReturnModal" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <form @submit.prevent="handleSavePurchaseReturn" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Supplier / Vendor *</label>
              <input v-model="purchaseReturnForm.supplier" list="pr-supplier-list" type="text" placeholder="Select supplier..." class="form-input w-full font-bold" required />
              <datalist id="pr-supplier-list">
                <option v-for="s in dataStore.suppliers" :key="s.name || s" :value="s.name || s">{{ s.name || s }}</option>
              </datalist>
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">BL Consignment / Invoice #</label>
              <input v-model="purchaseReturnForm.blNumber" type="text" placeholder="e.g. BL-MED-2026-01" class="form-input w-full font-mono font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Return Amount (PKR) *</label>
              <input v-model.number="purchaseReturnForm.totalReturnAmount" type="number" min="0" placeholder="PKR Amount" class="form-input w-full font-mono font-bold text-cyan-400" required />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Returned Serial / Item Code</label>
              <input v-model="purchaseReturnForm.serialCode" type="text" placeholder="e.g. US10-8803" class="form-input w-full font-mono" />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Return Reason / Damage Notes</label>
            <input v-model="purchaseReturnForm.reason" type="text" placeholder="e.g. Defective casing / Transport damage" class="form-input w-full" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="uiStore.closePurchaseReturnModal" class="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm font-bold flex items-center gap-1.5">
              <Check :size="13" />
              <span>Issue Debit Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      6. PARTY TO PARTY TRANSFER MODAL
    ════════════════════════════════════════════ -->
    <div v-if="uiStore.showPartyToPartyModal" class="modal-backdrop" @click.self="uiStore.closePartyToPartyModal">
      <div class="modal-content max-w-xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <ArrowRightLeft :size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Party to Party Transfer</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Transfer credit or balance between two parties</p>
            </div>
          </div>
          <button @click="uiStore.closePartyToPartyModal" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <form @submit.prevent="handleSavePartyToParty" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer From (Source Party) *</label>
              <input v-model="partyTransferForm.fromParty" list="p2p-from-list" type="text" placeholder="Select source party..." class="form-input w-full font-bold" required />
              <datalist id="p2p-from-list">
                <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">
                  {{ c.name }} (Bal: PKR {{ (c.balance || 0).toLocaleString() }})
                </option>
              </datalist>
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer To (Destination Party) *</label>
              <input v-model="partyTransferForm.toParty" list="p2p-to-list" type="text" placeholder="Select destination party..." class="form-input w-full font-bold" required />
              <datalist id="p2p-to-list">
                <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">
                  {{ c.name }} (Bal: PKR {{ (c.balance || 0).toLocaleString() }})
                </option>
              </datalist>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer Amount (PKR) *</label>
              <input v-model.number="partyTransferForm.amount" type="number" min="1" placeholder="PKR Amount" class="form-input w-full font-mono font-bold text-blue-500 text-sm" required />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer Date *</label>
              <input v-model="partyTransferForm.date" type="date" class="form-input w-full font-bold" required />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer Remarks / Description</label>
            <input v-model="partyTransferForm.remarks" type="text" placeholder="e.g. Account settlement / Credit adjustment" class="form-input w-full" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="uiStore.closePartyToPartyModal" class="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm font-bold flex items-center gap-1.5">
              <Check :size="13" />
              <span>Execute Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      7. ADD PARTY MODAL
    ════════════════════════════════════════════ -->
    <div v-if="uiStore.showAddPartyModal" class="modal-backdrop" @click.self="uiStore.closeAddPartyModal">
      <div class="modal-content max-w-xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Users :size="18" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Add New Customer / Party</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Create new debtor, vendor or hospital account</p>
            </div>
          </div>
          <button @click="uiStore.closeAddPartyModal" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <form @submit.prevent="handleSaveNewParty" class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Party Name *</label>
            <input v-model="newPartyForm.name" type="text" placeholder="e.g. Dr. Ayesha Clinic / Shifa Hospital" class="form-input w-full font-bold" required />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Party Type</label>
              <select v-model="newPartyForm.type" class="form-select w-full font-bold">
                <option value="Customer (Debtor)">Customer (Debtor)</option>
                <option value="Supplier (Creditor)">Supplier (Creditor)</option>
                <option value="Hospital / Corporate">Hospital / Corporate</option>
                <option value="Distributor / Reseller">Distributor / Reseller</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Branch / City</label>
              <select v-model="newPartyForm.city" class="form-select w-full font-bold">
                <option value="Peshawar">Peshawar</option>
                <option value="Lahore">Lahore</option>
                <option value="Multan">Multan</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
              <input v-model="newPartyForm.phone" type="text" placeholder="0300-1234567" class="form-input w-full font-mono" />
            </div>
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Opening Balance (PKR)</label>
              <input v-model.number="newPartyForm.openingBalance" type="number" placeholder="0" class="form-input w-full font-mono" />
            </div>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Facility Address</label>
            <input v-model="newPartyForm.address" type="text" placeholder="Clinic / hospital address..." class="form-input w-full" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="uiStore.closeAddPartyModal" class="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm font-bold flex items-center gap-1.5">
              <Check :size="13" />
              <span>Create Party</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      8. ADD EQUIPMENT MODAL
    ════════════════════════════════════════════ -->
    <AddEquipmentModal :show="uiStore.showAddEquipmentModal" @close="uiStore.closeAddEquipmentModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import AddEquipmentModal from '@/components/AddEquipmentModal.vue'
import {
  Truck,
  ArrowUpRight,
  Receipt,
  RotateCcw,
  ArrowRightLeft,
  Users,
  Check,
  Printer
} from 'lucide-vue-next'

const uiStore = useUiStore()
const dataStore = useDataStore()
const authStore = useAuthStore()

// 1. Delivery Challan Form
const dcForm = ref({
  dcNumber: `DC-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
  deliveryDate: new Date().toISOString().substring(0, 10),
  customer: '',
  vehicleNo: '',
  itemDescription: '',
  qty: 1,
  serials: '',
  deliveryAddress: '',
  remarks: ''
})

function handleSaveDeliveryChallan() {
  uiStore.showToast(`Delivery Challan ${dcForm.value.dcNumber} issued successfully!`, 'success')
  uiStore.closeDeliveryChallanModal()
}

function handlePrintDeliveryChallan() {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    uiStore.showToast('Please allow popups to print Delivery Challan', 'warning')
    return
  }
  printWindow.document.write(`
    <html>
      <head>
        <title>Delivery Challan - ${dcForm.value.dcNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; color: #0d9488; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f8fafc; font-weight: bold; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; border-top: 1px dashed #cbd5e1; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">MedImage ERP — Delivery Challan (DC)</div>
            <div style="font-size: 12px; color: #64748b;">Medical Equipment Sales & Dispatch Division</div>
          </div>
          <div style="text-align: right; font-size: 13px;">
            <div>Challan #: <strong>${dcForm.value.dcNumber}</strong></div>
            <div>Date: <strong>${dcForm.value.deliveryDate}</strong></div>
          </div>
        </div>
        <div class="grid">
          <div>
            <div><strong>Consignee / Customer:</strong> ${dcForm.value.customer}</div>
            <div><strong>Delivery Facility:</strong> ${dcForm.value.deliveryAddress || 'Customer Premises'}</div>
          </div>
          <div>
            <div><strong>Vehicle / Driver:</strong> ${dcForm.value.vehicleNo || 'Self Dispatch'}</div>
            <div><strong>Dispatch Branch:</strong> ${authStore.userBranch || 'Peshawar'} Depot</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item / Equipment Description</th>
              <th>Serial Numbers</th>
              <th style="text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><strong>${dcForm.value.itemDescription}</strong></td>
              <td><code>${dcForm.value.serials || 'N/A'}</code></td>
              <td style="text-align: center; font-weight: bold;">${dcForm.value.qty}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 16px; font-size: 12px; color: #475569;">
          <strong>Remarks:</strong> ${dcForm.value.remarks || 'Received equipment in sealed and operational condition.'}
        </div>
        <div class="footer">
          <div>Prepared By: <strong>${authStore.user?.name || 'Administrator'}</strong></div>
          <div>Receiver's Signature & Stamp: _______________________</div>
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 300)
}

// 2. Payment Out Form
const paymentOutForm = ref({
  payee: '',
  amount: null,
  paymentDate: new Date().toISOString().substring(0, 10),
  paymentMethod: 'Cash Payment',
  category: 'Vendor Payment',
  description: ''
})

async function handleSavePaymentOut() {
  if (!paymentOutForm.value.payee || !paymentOutForm.value.amount) return
  await dataStore.recordPaymentOut({
    payee: paymentOutForm.value.payee,
    amount: paymentOutForm.value.amount,
    paymentDate: paymentOutForm.value.paymentDate,
    paymentMethod: paymentOutForm.value.paymentMethod,
    category: paymentOutForm.value.category,
    description: paymentOutForm.value.description
  }, authStore.user)
  uiStore.showToast(`Payment Out of PKR ${Number(paymentOutForm.value.amount).toLocaleString()} recorded!`, 'success')
  uiStore.closePaymentOutModal()
}

// 3. Payment In Form
const paymentInForm = ref({
  customer: '',
  amount: null,
  paymentDate: new Date().toISOString().substring(0, 10),
  paymentMethod: 'Cash Payment',
  branch: authStore.userBranch || 'Peshawar',
  description: ''
})

async function handleSavePaymentIn() {
  if (!paymentInForm.value.customer || !paymentInForm.value.amount) return
  await dataStore.recordPaymentIn({
    customer: paymentInForm.value.customer,
    amount: paymentInForm.value.amount,
    paymentDate: paymentInForm.value.paymentDate,
    paymentType: paymentInForm.value.paymentMethod,
    paymentMethod: paymentInForm.value.paymentMethod,
    branch: paymentInForm.value.branch,
    description: paymentInForm.value.description
  }, authStore.user)
  uiStore.showToast(`Payment In of PKR ${Number(paymentInForm.value.amount).toLocaleString()} received!`, 'success')
  uiStore.closePaymentInModal()
}

// 4. Sale Return Form
const saleReturnForm = ref({
  customer: '',
  invoiceNo: '',
  refundAmount: 0,
  serialCode: '',
  reason: 'Customer Equipment Return'
})

async function handleSaveSaleReturn() {
  if (!saleReturnForm.value.customer) return
  await dataStore.processSalesReturn({
    customer: saleReturnForm.value.customer,
    invoiceNo: saleReturnForm.value.invoiceNo || 'DIRECT-RET',
    branch: authStore.userBranch || 'Peshawar',
    serials: saleReturnForm.value.serialCode ? [{ serialCode: saleReturnForm.value.serialCode, refundAmount: saleReturnForm.value.refundAmount }] : [],
    totalRefundAmount: saleReturnForm.value.refundAmount,
    reason: saleReturnForm.value.reason,
    payoutRefund: true,
    paymentMethod: 'Cash Payment'
  })
  uiStore.showToast(`Sales Return recorded & credit note issued!`, 'success')
  uiStore.closeSaleReturnModal()
}

// 5. Purchase Return Form
const purchaseReturnForm = ref({
  supplier: '',
  blNumber: '',
  totalReturnAmount: 0,
  serialCode: '',
  reason: 'Defective Consignment Unit'
})

async function handleSavePurchaseReturn() {
  if (!purchaseReturnForm.value.supplier) return
  await dataStore.processPurchaseReturn({
    supplier: purchaseReturnForm.value.supplier,
    blNumber: purchaseReturnForm.value.blNumber || 'BL-RETURN',
    returnDate: new Date().toISOString().substring(0, 10),
    branch: authStore.userBranch || 'Peshawar',
    serials: purchaseReturnForm.value.serialCode ? [{ serialCode: purchaseReturnForm.value.serialCode, costPrice: purchaseReturnForm.value.totalReturnAmount }] : [],
    totalReturnAmount: purchaseReturnForm.value.totalReturnAmount,
    reason: purchaseReturnForm.value.reason,
    refundMethod: 'Vendor Credit Balance'
  })
  uiStore.showToast(`Purchase Return recorded & Debit Note generated!`, 'success')
  uiStore.closePurchaseReturnModal()
}

// 6. Party to Party Form
const partyTransferForm = ref({
  fromParty: '',
  toParty: '',
  amount: null,
  date: new Date().toISOString().substring(0, 10),
  remarks: 'Account balance settlement transfer'
})

function handleSavePartyToParty() {
  if (!partyTransferForm.value.fromParty || !partyTransferForm.value.toParty || !partyTransferForm.value.amount) return
  const amt = Number(partyTransferForm.value.amount)
  const fromP = dataStore.customers.find(c => c.name === partyTransferForm.value.fromParty)
  const toP = dataStore.customers.find(c => c.name === partyTransferForm.value.toParty)

  if (fromP) {
    fromP.balance = Math.max(0, (Number(fromP.balance) || 0) - amt)
  }
  if (toP) {
    toP.balance = (Number(toP.balance) || 0) + amt
  }

  uiStore.showToast(`Transferred PKR ${amt.toLocaleString()} from ${partyTransferForm.value.fromParty} to ${partyTransferForm.value.toParty}!`, 'success')
  uiStore.closePartyToPartyModal()
}

// 7. Add Party Form
const newPartyForm = ref({
  name: '',
  type: 'Customer (Debtor)',
  city: authStore.userBranch || 'Peshawar',
  phone: '',
  openingBalance: 0,
  address: ''
})

async function handleSaveNewParty() {
  if (!newPartyForm.value.name.trim()) return
  const partyObj = {
    id: `cust_${Date.now()}`,
    name: newPartyForm.value.name.trim(),
    type: newPartyForm.value.type,
    city: newPartyForm.value.city,
    branch: newPartyForm.value.city,
    phone: newPartyForm.value.phone,
    balance: Number(newPartyForm.value.openingBalance || 0),
    openingBalance: Number(newPartyForm.value.openingBalance || 0),
    address: newPartyForm.value.address
  }
  dataStore.customers.unshift(partyObj)
  if (newPartyForm.value.type.includes('Supplier') || newPartyForm.value.type.includes('Creditor')) {
    dataStore.suppliers.unshift(partyObj)
  }
  uiStore.showToast(`Party ${partyObj.name} created successfully!`, 'success')
  uiStore.closeAddPartyModal()
}
</script>
