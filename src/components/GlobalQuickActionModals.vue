<template>
  <div>
    <!-- ══════════════════════════════════════════════════════════════
      1. DELIVERY CHALLAN MODAL (DISPATCH & GATE PASS WITH BL)
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showDeliveryChallanModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closeDeliveryChallanModal">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full max-w-2xl max-h-[100dvh] sm:max-h-[92vh]">
        
        <!-- Header Bar -->
        <div class="px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
              <Truck :size="18" class="text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Delivery Challan (DC)</span>
            </span>
            <span class="badge badge-info text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold truncate">
              DISPATCH & GATE PASS
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div class="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] sm:text-xs">
              <span class="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                <span>📍 {{ authStore.userBranch || 'Peshawar' }} Depot</span>
              </span>
            </div>
            <button @click="uiStore.closeDeliveryChallanModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-base sm:text-lg font-bold cursor-pointer">✕</button>
          </div>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSaveDeliveryChallan" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-3 sm:p-5 space-y-3.5 text-xs bg-slate-50/50 dark:bg-transparent flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            
            <!-- Challan # & Delivery Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Challan Number *</label>
                <input v-model="dcForm.dcNumber" type="text" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-teal-500 shadow-sm" required />
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dispatch / Delivery Date *</label>
                <input v-model="dcForm.deliveryDate" type="date" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-teal-500 shadow-sm" required />
              </div>
            </div>

            <!-- Customer & Origin BL Consignment (Typeable) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Customer custom searchable dropdown -->
              <div class="relative" @click.stop>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Customer / Consignee Party *</label>
                <div class="flex items-center w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 gap-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all min-h-[36px]">
                  <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
                  <input
                    v-model="dcForm.customer"
                    type="text"
                    @focus="isDcCustomerDropdownOpen = true"
                    @click="isDcCustomerDropdownOpen = true"
                    @input="isDcCustomerDropdownOpen = true"
                    placeholder="Select or type customer..."
                    autocomplete="off"
                    required
                    style="border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; padding: 0 !important; min-height: auto !important; height: auto !important; font-size: 12px !important;"
                    class="flex-1 bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none min-w-0"
                  />
                  <button
                    v-if="dcForm.customer"
                    type="button"
                    @click.stop="dcForm.customer = ''; dcForm.deliveryAddress = ''; isDcCustomerDropdownOpen = false"
                    class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    title="Clear"
                  >✕</button>
                  <button
                    type="button"
                    @click.stop="isDcCustomerDropdownOpen = !isDcCustomerDropdownOpen"
                    class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  >
                    <ChevronDown :size="14" :class="{ 'rotate-180': isDcCustomerDropdownOpen }" class="transition-transform" />
                  </button>
                </div>
                <!-- Floating Customer Suggestions -->
                <div
                  v-if="isDcCustomerDropdownOpen && filteredDcCustomers.length > 0"
                  class="absolute left-0 top-full mt-1 z-[99999] bg-white dark:bg-[#0f172a] border border-teal-500 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 text-left w-full"
                  style="box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4); z-index: 99999 !important;"
                >
                  <div
                    v-for="c in filteredDcCustomers"
                    :key="c._id || c.name"
                    @click="dcForm.customer = c.name; onDcCustomerChange(); isDcCustomerDropdownOpen = false"
                    class="p-2.5 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer transition-colors flex items-center justify-between gap-2 text-xs"
                  >
                    <div class="min-w-0">
                      <div class="font-bold text-slate-900 dark:text-white truncate">{{ c.name }}</div>
                      <div v-if="c.phone || c.city" class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ c.phone }}{{ c.city ? ' · ' + c.city : '' }}</div>
                    </div>
                    <span v-if="c.type" class="text-[9px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/40 shrink-0 truncate max-w-[80px]">{{ c.type }}</span>
                  </div>
                </div>
              </div>

              <!-- Origin BL Consignment Field (Typeable & Searchable) -->
              <div class="relative" @click.stop>
                <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <span>Origin BL Consignment</span>
                    <span class="text-[10px] text-slate-400 font-normal font-mono">(Typeable)</span>
                  </span>
                  <span v-if="dcForm.blNumber" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">Auto Matched</span>
                </label>
                <div class="flex items-center w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 gap-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all min-h-[36px]">
                  <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
                  <input
                    v-model="dcForm.blNumber"
                    type="text"
                    @focus="isDcBlDropdownOpen = true"
                    @click="isDcBlDropdownOpen = true"
                    placeholder="Type or search BL consignment..."
                    autocomplete="off"
                    style="border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; padding: 0 !important; min-height: auto !important; height: auto !important; font-size: 12px !important;"
                    class="flex-1 bg-transparent text-slate-900 dark:text-white font-mono font-bold focus:outline-none min-w-0"
                  />
                  <button
                    v-if="dcForm.blNumber"
                    type="button"
                    @click.stop="dcForm.blNumber = ''"
                    class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    title="Clear BL"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    @click.stop="isDcBlDropdownOpen = !isDcBlDropdownOpen"
                    class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  >
                    <ChevronDown :size="14" :class="{ 'rotate-180': isDcBlDropdownOpen }" class="transition-transform" />
                  </button>
                </div>

                <!-- Floating Suggestions Dropdown -->
                <div
                  v-if="isDcBlDropdownOpen"
                  class="absolute left-0 top-full mt-1 z-[99999] bg-white dark:bg-[#0f172a] border border-teal-500 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 text-left w-full min-w-[260px]"
                  style="box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4); z-index: 99999 !important;"
                >
                  <div
                    @click="dcForm.blNumber = ''; isDcBlDropdownOpen = false"
                    class="p-2 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer transition-colors text-slate-500 dark:text-slate-400 text-xs italic"
                  >
                    Direct Stock Consignment (None)
                  </div>
                  <div
                    v-for="bl in filteredDcBlList"
                    :key="bl.blNumber"
                    @click="dcForm.blNumber = bl.blNumber; isDcBlDropdownOpen = false"
                    class="p-2 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer transition-colors flex items-center justify-between gap-2 text-xs"
                  >
                    <div class="min-w-0">
                      <div class="font-mono font-bold text-slate-900 dark:text-white truncate">{{ bl.blNumber }}</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ bl.supplierName || 'Import Consignment' }}</div>
                    </div>
                    <span v-if="bl.branch" class="text-[9px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/40 shrink-0">
                      {{ bl.branch }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Item & Qty -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Equipment / Item Description *</label>
                <input v-model="dcForm.itemDescription" type="text" placeholder="e.g. 12D HIFU Machine PH12 with 5 Cartridges" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-teal-500 shadow-sm" required />
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantity *</label>
                <input v-model.number="dcForm.qty" type="number" min="1" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-teal-500 shadow-sm" required />
              </div>
            </div>

            <!-- Serials & Vehicle -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Serial Numbers / Machine Codes</label>
                <input v-model="dcForm.serials" type="text" placeholder="e.g. MC-WD-35 | SN-1001, MC-WD-36 | SN-1002" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-teal-500 shadow-sm" />
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Vehicle / Courier / Driver</label>
                <input v-model="dcForm.vehicleNo" type="text" placeholder="e.g. Courier Cargo / Driver Ali (LEA-4521)" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-sm" />
              </div>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Delivery Destination / Facility Address</label>
              <input v-model="dcForm.deliveryAddress" type="text" placeholder="Hospital ward, clinic address, city..." class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-teal-500 shadow-sm" />
            </div>

            <!-- Notes / Invoice Terms (Matching Screenshot media_1795373776508.png) -->
            <div class="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
              <label class="text-slate-700 dark:text-slate-400 block mb-1.5 font-bold text-xs">Notes / Invoice Terms</label>
              <input
                v-model="dcForm.remarks"
                type="text"
                placeholder="Enter warranty notes, delivery details..."
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              @click="uiStore.closeDeliveryChallanModal"
              class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="handlePrintDeliveryChallan"
                class="btn btn-secondary text-xs font-bold px-4 py-2 flex items-center gap-1.5 border border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 cursor-pointer"
              >
                <Printer :size="14" />
                <span>Print DC</span>
              </button>
              <button
                type="submit"
                class="btn btn-primary bg-teal-600 hover:bg-teal-500 text-white font-black text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check :size="15" />
                <span>Save & Issue DC</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
      2. PAYMENT OUT MODAL (DISBURSEMENT / VOUCHER)
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showPaymentOutModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closePaymentOutModal">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full max-w-xl max-h-[100dvh] sm:max-h-[92vh]">
        
        <!-- Header Bar -->
        <div class="px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
              <ArrowUpRight :size="18" class="text-rose-500 shrink-0" />
              <span>Record Payment Out</span>
            </span>
            <span class="badge badge-warning text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold truncate">
              DISBURSEMENT & VOUCHER
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div class="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] sm:text-xs">
              <span class="font-bold text-rose-500 flex items-center gap-0.5">
                <span>📍 {{ authStore.userBranch || 'Lahore' }} Depot</span>
              </span>
            </div>
            <button @click="uiStore.closePaymentOutModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-base sm:text-lg font-bold cursor-pointer">✕</button>
          </div>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSavePaymentOut" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-3 sm:p-5 space-y-3.5 text-xs bg-slate-50/50 dark:bg-transparent flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payee / Vendor / Party *</label>
              <input v-model="paymentOutForm.payee" list="payment-out-payee-list" type="text" placeholder="Type or select payee..." class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-rose-500 shadow-sm" required />
              <datalist id="payment-out-payee-list">
                <option v-for="s in dataStore.suppliers" :key="s.name || s" :value="s.name || s">{{ s.name || s }} (Supplier)</option>
                <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">{{ c.name }} (Customer)</option>
              </datalist>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount Paid (PKR) *</label>
                <input v-model.number="paymentOutForm.amount" type="number" min="1" placeholder="0" class="w-full bg-white dark:bg-[#1e293b] border border-rose-300 dark:border-rose-800 rounded-lg px-3 py-2 text-rose-600 dark:text-rose-400 font-mono font-bold text-sm focus:outline-none focus:border-rose-500 shadow-sm" required />
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Date *</label>
                <input v-model="paymentOutForm.paymentDate" type="date" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-rose-500 shadow-sm" required />
              </div>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
              <select v-model="paymentOutForm.paymentMethod" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-rose-500 shadow-sm cursor-pointer">
                <option value="Cash Payment">Cash Payment</option>
                <option value="Bank Account">Bank Account (Meezan/HBL)</option>
                <option value="Cheque / RTGS">Cheque / RTGS</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reference / Cheque # / Notes</label>
              <input v-model="paymentOutForm.description" type="text" placeholder="Cheque ref, BL invoice #, receipt notes..." class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-rose-500 shadow-sm" />
            </div>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              @click="uiStore.closePaymentOutModal"
              class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn btn-danger bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check :size="15" />
              <span>Save Payment Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
      3. PAYMENT IN MODAL (RECEIPT)
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showPaymentInModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closePaymentInModal">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full max-w-xl max-h-[100dvh] sm:max-h-[92vh]">
        
        <!-- Header Bar -->
        <div class="px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
              <Receipt :size="18" class="text-emerald-500 shrink-0" />
              <span>Record Payment In</span>
            </span>
            <span class="badge badge-success text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold truncate">
              RECEIPT & COLLECTION
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div class="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] sm:text-xs">
              <span class="font-bold text-emerald-500 flex items-center gap-0.5">
                <span>📍 {{ paymentInForm.branch || authStore.userBranch || 'Peshawar' }}</span>
              </span>
            </div>
            <button @click="uiStore.closePaymentInModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-base sm:text-lg font-bold cursor-pointer">✕</button>
          </div>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSavePaymentIn" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-3 sm:p-5 space-y-3.5 text-xs bg-slate-50/50 dark:bg-transparent flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Customer / Party Name *</label>
              <input v-model="paymentInForm.customer" list="payment-in-party-list" type="text" placeholder="Type or select customer..." class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm" required />
              <datalist id="payment-in-party-list">
                <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">
                  {{ c.name }} (Bal: PKR {{ (c.balance || 0).toLocaleString() }})
                </option>
              </datalist>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount Received (PKR) *</label>
                <input v-model.number="paymentInForm.amount" type="number" min="1" placeholder="0" class="w-full bg-white dark:bg-[#1e293b] border border-emerald-300 dark:border-emerald-800 rounded-lg px-3 py-2 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 shadow-sm" required />
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Receipt Date *</label>
                <input v-model="paymentInForm.paymentDate" type="date" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm" required />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Mode</label>
                <select v-model="paymentInForm.paymentMethod" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer">
                  <option value="Cash Payment">Cash Payment</option>
                  <option value="Bank Account">Bank Account (Meezan/HBL)</option>
                  <option value="Cheque / RTGS">Cheque / RTGS</option>
                  <option value="Online Transfer">Online Transfer</option>
                </select>
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Depot Branch</label>
                <select v-model="paymentInForm.branch" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer">
                  <option value="Peshawar">Peshawar HO</option>
                  <option value="Lahore">Lahore Branch</option>
                  <option value="Multan">Multan Branch</option>
                  <option value="Karachi">Karachi Branch</option>
                  <option value="Islamabad">Islamabad Branch</option>
                </select>
              </div>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reference / Cheque No / Notes</label>
              <input v-model="paymentInForm.description" type="text" placeholder="Cheque ref, deposit slip, invoice reference..." class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 shadow-sm" />
            </div>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              @click="uiStore.closePaymentInModal"
              class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn btn-success bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check :size="15" />
              <span>Record Payment In</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
      4. SALE RETURN MODAL (CREDIT NOTE)
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showSaleReturnModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closeSaleReturnModal">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full max-w-xl max-h-[100dvh] sm:max-h-[92vh]">
        
        <!-- Header Bar -->
        <div class="px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
              <RotateCcw :size="18" class="text-amber-500 shrink-0" />
              <span>Sale Return & Credit Note</span>
            </span>
            <span class="badge badge-warning text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold truncate">
              CREDIT NOTE & RESTOCK
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div class="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] sm:text-xs">
              <span class="font-bold text-amber-500 flex items-center gap-0.5">
                <span>📍 {{ authStore.userBranch || 'Peshawar' }} Depot</span>
              </span>
            </div>
            <button @click="uiStore.closeSaleReturnModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-base sm:text-lg font-bold cursor-pointer">✕</button>
          </div>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSaveSaleReturn" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-3 sm:p-5 space-y-3.5 text-xs bg-slate-50/50 dark:bg-transparent flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Customer Party *</label>
                <input v-model="saleReturnForm.customer" list="sr-customer-list" type="text" placeholder="Select customer..." class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-amber-500 shadow-sm" required />
                <datalist id="sr-customer-list">
                  <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">{{ c.name }}</option>
                </datalist>
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Original Invoice #</label>
                <input v-model="saleReturnForm.invoiceNo" type="text" placeholder="e.g. INV-2026-001" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500 shadow-sm" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Refund Amount (PKR) *</label>
                <input v-model.number="saleReturnForm.refundAmount" type="number" min="0" placeholder="0" class="w-full bg-white dark:bg-[#1e293b] border border-amber-300 dark:border-amber-800 rounded-lg px-3 py-2 text-amber-600 dark:text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500 shadow-sm" required />
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Returned Serial / Machine Code</label>
                <input v-model="saleReturnForm.serialCode" type="text" placeholder="e.g. SN-9011 or MC-WD-12" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-amber-500 shadow-sm" />
              </div>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Return Reason</label>
              <input v-model="saleReturnForm.reason" type="text" placeholder="e.g. Client exchange / Cancellation / Defect" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 shadow-sm" />
            </div>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              @click="uiStore.closeSaleReturnModal"
              class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn bg-amber-600 hover:bg-amber-500 text-white font-black text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check :size="15" />
              <span>Issue Credit Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
      5. PURCHASE RETURN MODAL (DEBIT NOTE)
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showPurchaseReturnModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closePurchaseReturnModal">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full max-w-xl max-h-[100dvh] sm:max-h-[92vh]">
        
        <!-- Header Bar -->
        <div class="px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
              <RotateCcw :size="18" class="text-cyan-500 shrink-0" />
              <span>Purchase Return & Debit Note</span>
            </span>
            <span class="badge badge-info text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold truncate">
              DEBIT NOTE & PAYABLE DEDUCT
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div class="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] sm:text-xs">
              <span class="font-bold text-cyan-500 flex items-center gap-0.5">
                <span>📍 {{ authStore.userBranch || 'Peshawar' }} Depot</span>
              </span>
            </div>
            <button @click="uiStore.closePurchaseReturnModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-base sm:text-lg font-bold cursor-pointer">✕</button>
          </div>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSavePurchaseReturn" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-3 sm:p-5 space-y-3.5 text-xs bg-slate-50/50 dark:bg-transparent flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Supplier / Exporter *</label>
                <input v-model="purchaseReturnForm.supplier" list="pr-supplier-list" type="text" placeholder="Select supplier..." class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-cyan-500 shadow-sm" required />
                <datalist id="pr-supplier-list">
                  <option v-for="s in dataStore.suppliers" :key="s.name || s" :value="s.name || s">{{ s.name || s }}</option>
                </datalist>
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">BL Consignment / Invoice #</label>
                <input v-model="purchaseReturnForm.blNumber" type="text" placeholder="e.g. BL-MED-2026-01" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-cyan-500 shadow-sm" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Return Amount (PKR) *</label>
                <input v-model.number="purchaseReturnForm.totalReturnAmount" type="number" min="0" placeholder="0" class="w-full bg-white dark:bg-[#1e293b] border border-cyan-300 dark:border-cyan-800 rounded-lg px-3 py-2 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 shadow-sm" required />
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Returned Serial / Item Code</label>
                <input v-model="purchaseReturnForm.serialCode" type="text" placeholder="e.g. US10-8803 or MC-WD-22" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-cyan-500 shadow-sm" />
              </div>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Return Reason / Damage Notes</label>
              <input v-model="purchaseReturnForm.reason" type="text" placeholder="e.g. Defective casing / Transport damage" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 shadow-sm" />
            </div>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              @click="uiStore.closePurchaseReturnModal"
              class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check :size="15" />
              <span>Issue Debit Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
      6. PARTY TO PARTY TRANSFER MODAL (CONTRA ENTRY)
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showPartyToPartyModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closePartyToPartyModal">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full max-w-xl max-h-[100dvh] sm:max-h-[92vh]">
        
        <!-- Header Bar -->
        <div class="px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
              <ArrowRightLeft :size="18" class="text-blue-500 shrink-0" />
              <span>Party to Party Transfer</span>
            </span>
            <span class="badge badge-info text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold truncate">
              CONTRA LEDGER ADJUSTMENT
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div class="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] sm:text-xs">
              <span class="font-bold text-blue-500 flex items-center gap-0.5">
                <span>📍 {{ authStore.userBranch || 'Lahore' }}</span>
              </span>
            </div>
            <button @click="uiStore.closePartyToPartyModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-base sm:text-lg font-bold cursor-pointer">✕</button>
          </div>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSavePartyToParty" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-3 sm:p-5 space-y-3.5 text-xs bg-slate-50/50 dark:bg-transparent flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer From (Source Party) *</label>
                <input v-model="partyTransferForm.fromParty" list="p2p-from-list" type="text" placeholder="Select source party..." class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-blue-500 shadow-sm" required />
                <datalist id="p2p-from-list">
                  <option v-for="c in dataStore.customers" :key="c.name" :value="c.name">
                    {{ c.name }} (Bal: PKR {{ (c.balance || 0).toLocaleString() }})
                  </option>
                </datalist>
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer To (Destination Party) *</label>
                <input v-model="partyTransferForm.toParty" list="p2p-to-list" type="text" placeholder="Select destination party..." class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-blue-500 shadow-sm" required />
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
                <input v-model.number="partyTransferForm.amount" type="number" min="1" placeholder="0" class="w-full bg-white dark:bg-[#1e293b] border border-blue-300 dark:border-blue-800 rounded-lg px-3 py-2 text-blue-600 dark:text-blue-400 font-mono font-bold text-sm focus:outline-none focus:border-blue-500 shadow-sm" required />
              </div>
              <div>
                <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer Date *</label>
                <input v-model="partyTransferForm.date" type="date" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-blue-500 shadow-sm" required />
              </div>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Transfer Remarks / Description</label>
              <input v-model="partyTransferForm.remarks" type="text" placeholder="e.g. Account settlement / Credit adjustment" class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 shadow-sm" />
            </div>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              @click="uiStore.closePartyToPartyModal"
              class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check :size="15" />
              <span>Execute Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
      7. ADD CUSTOMER / PARTY MODAL (EXACT MATCH TO media_1795373489375.png)
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showAddPartyModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closeAddPartyModal">
      <div class="w-full max-w-lg bg-white dark:bg-[#1e2530] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 relative">
        
        <!-- Header matching Screenshot media_1795373489375.png -->
        <div class="px-6 py-4 bg-white dark:bg-[#1e2530] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <UserPlus :size="18" class="text-slate-800 dark:text-white" />
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Add New Party</h3>
          </div>
          <button @click="uiStore.closeAddPartyModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSaveNewParty" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-6 space-y-4 text-xs bg-white dark:bg-[#1e2530] flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            
            <!-- PARTY NAME * -->
            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Party Name *</label>
              <input
                v-model="newPartyForm.name"
                type="text"
                required
                placeholder="e.g. HOSPITEX RAWALPINDI"
                class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400"
              />
            </div>

            <!-- PARTY TYPE & BRANCH / CITY -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Party Type</label>
                <select
                  v-model="newPartyForm.type"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <optgroup label="Sales Parties (Customers)">
                    <option value="Customer (Debtor)">Customer (Debtor)</option>
                    <option value="Hospital / Clinic">Hospital / Clinic</option>
                    <option value="Diagnostic Center / Lab">Diagnostic Center / Lab</option>
                  </optgroup>
                  <optgroup label="Purchase Parties (Vendors / Suppliers)">
                    <option value="Supplier / Exporter (Creditor)">Supplier / Exporter (Creditor)</option>
                    <option value="OEM Manufacturer">OEM Manufacturer</option>
                    <option value="Local Vendor">Local Vendor</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Clearing Agent / Freight Forwarder">Clearing Agent / Freight Forwarder</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Branch / City</span>
                  <span v-if="!authStore.isSuperAdmin" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">🔒 Locked</span>
                </label>
                <div
                  v-if="!authStore.isSuperAdmin"
                  class="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-bold text-xs flex items-center justify-between select-none cursor-not-allowed"
                >
                  <span>📍 {{ authStore.userBranch || 'Peshawar' }}</span>
                  <span class="badge badge-success text-[10px] py-0 px-1.5 font-mono">Assigned</span>
                </div>
                <select
                  v-else
                  v-model="newPartyForm.city"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="Peshawar">Peshawar</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Multan">Multan</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Karachi">Karachi</option>
                </select>
              </div>
            </div>

            <!-- PHONE NUMBER & EMAIL -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input
                  v-model="newPartyForm.phone"
                  type="text"
                  placeholder="+92 300 1234567"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  v-model="newPartyForm.email"
                  type="email"
                  placeholder="accounts@clinic.com"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            <!-- CREDIT LIMIT (PKR) & OPENING BALANCE (PKR) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Credit Limit (PKR)</label>
                <input
                  v-model.number="newPartyForm.creditLimit"
                  type="number"
                  step="100000"
                  placeholder="1000000"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Opening Balance (PKR)</label>
                <input
                  v-model.number="newPartyForm.openingBalance"
                  type="number"
                  placeholder="0"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            <!-- ADDRESS / NOTES -->
            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Address / Notes</label>
              <textarea
                v-model="newPartyForm.address"
                rows="3"
                placeholder="Full clinic address..."
                class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Footer matching Screenshot media_1795373489375.png -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              @click="uiStore.closeAddPartyModal"
              class="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-black text-xs shadow-sm hover:shadow transition-all cursor-pointer"
            >
              Save Party
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
      8. ADD EQUIPMENT MODAL
    ══════════════════════════════════════════════════════════════ -->
    <AddEquipmentModal :show="uiStore.showAddEquipmentModal" @close="uiStore.closeAddEquipmentModal" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
  UserPlus,
  Check,
  Printer,
  Search,
  ChevronDown
} from 'lucide-vue-next'

const uiStore = useUiStore()
const dataStore = useDataStore()
const authStore = useAuthStore()

// 1. Delivery Challan Form
const dcForm = ref({
  dcNumber: `DC-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
  deliveryDate: new Date().toISOString().substring(0, 10),
  blNumber: '',
  customer: '',
  vehicleNo: '',
  itemDescription: '',
  qty: 1,
  serials: '',
  deliveryAddress: '',
  remarks: ''
})

const isDcBlDropdownOpen = ref(false)
const isDcCustomerDropdownOpen = ref(false)

const filteredDcCustomers = computed(() => {
  const q = String(dcForm.value.customer || '').trim().toLowerCase()
  const list = dataStore.customers || []
  if (!q) return list
  return list.filter(c =>
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.phone && c.phone.toLowerCase().includes(q)) ||
    (c.city && c.city.toLowerCase().includes(q))
  )
})

const filteredDcBlList = computed(() => {
  const q = String(dcForm.value.blNumber || '').trim().toLowerCase()
  const list = dataStore.blList || []
  if (!q) return list
  return list.filter(bl => 
    (bl.blNumber && bl.blNumber.toLowerCase().includes(q)) ||
    (bl.supplierName && bl.supplierName.toLowerCase().includes(q)) ||
    (bl.branch && bl.branch.toLowerCase().includes(q))
  )
})

function onDcCustomerChange() {
  const found = dataStore.customers.find(c => c.name === dcForm.value.customer)
  if (found) {
    if (found.address && !dcForm.value.deliveryAddress) dcForm.value.deliveryAddress = found.address
    if (found.city && !dcForm.value.vehicleNo) dcForm.value.vehicleNo = ''
  }
}

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
            ${dcForm.value.blNumber ? `<div>Origin BL: <strong>${dcForm.value.blNumber}</strong></div>` : ''}
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

// 7. Add Party Form (Matching media_1795373489375.png)
const newPartyForm = ref({
  name: '',
  type: 'Customer (Debtor)',
  city: authStore.userBranch || 'Peshawar',
  phone: '',
  email: '',
  creditLimit: 1000000,
  openingBalance: 0,
  address: ''
})

async function handleSaveNewParty() {
  if (!newPartyForm.value.name.trim()) return
  const isSupplier = ['Supplier', 'Supplier / Exporter (Creditor)', 'OEM Manufacturer', 'Local Vendor', 'Distributor', 'Clearing Agent / Freight Forwarder'].includes(newPartyForm.value.type)
  const partyObj = {
    id: `cust_${Date.now()}`,
    name: newPartyForm.value.name.trim(),
    category: isSupplier ? 'SUPPLIER' : 'REGULAR',
    partyType: newPartyForm.value.type,
    type: newPartyForm.value.type,
    branch: newPartyForm.value.city || authStore.userBranch || 'Peshawar',
    city: newPartyForm.value.city || authStore.userBranch || 'Peshawar',
    phone: newPartyForm.value.phone || '',
    email: newPartyForm.value.email || '',
    address: newPartyForm.value.address || '',
    baseCreditLimit: Number(newPartyForm.value.creditLimit || 1000000),
    creditLimit: Number(newPartyForm.value.creditLimit || 1000000),
    balance: Number(newPartyForm.value.openingBalance || 0),
    openingBalance: Number(newPartyForm.value.openingBalance || 0),
    paymentDays: 30,
    status: 'active',
    overrides: []
  }

  await dataStore.addCustomer(partyObj, authStore.user)
  if (isSupplier) {
    if (!dataStore.suppliers) dataStore.suppliers = []
    if (!(dataStore.suppliers || []).some(s => (typeof s === 'string' ? s : s.name).toLowerCase() === partyObj.name.toLowerCase())) {
      dataStore.suppliers.push({
        id: `supp_${Date.now()}`,
        name: partyObj.name,
        branch: partyObj.branch,
        category: 'SUPPLIER'
      })
    }
  }

  uiStore.showToast(`Party "${partyObj.name}" created and saved!`, 'success')
  uiStore.closeAddPartyModal()
  
  // Reset form
  newPartyForm.value = {
    name: '',
    type: 'Customer (Debtor)',
    city: authStore.userBranch || 'Peshawar',
    phone: '',
    email: '',
    creditLimit: 1000000,
    openingBalance: 0,
    address: ''
  }
}
</script>
