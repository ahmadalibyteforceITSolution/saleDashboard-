<template>
  <div v-if="uiStore.showGlobalSaleModal" class="modal-backdrop z-50 flex items-center justify-center p-1 sm:p-3" @click.self="uiStore.closeSaleModal">
    <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-xl" style="width: 98vw !important; max-width: 1400px !important; max-height: 96vh !important; height: 96vh !important;">
      
      <!-- ══════════════════════════════════════════════════════════════
           MODAL TOP HEADER: Vyapar Desktop Sales Bar
      ══════════════════════════════════════════════════════════════ -->
      <div class="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <span class="text-sm sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
              <ShoppingCart :size="18" class="text-emerald-500" />
              <span>Sale / Invoice</span>
            </span>
            <span :class="['badge text-[9px] sm:text-[10px] font-mono py-0.5 px-2 font-bold', uiStore.editingSaleData ? 'badge-warning' : 'badge-info']">
              {{ uiStore.editingSaleData ? `EDITING: ${posForm.invoiceNo || uiStore.editingSaleData.invoiceNo || uiStore.editingSaleData.id}` : 'GST / TAX INVOICE' }}
            </span>
            <!-- Order Type Selector Pills -->
            <div class="flex items-center gap-0.5 sm:gap-1 bg-slate-200 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] sm:text-[11px] ml-1 sm:ml-2">
              <button
                type="button"
                @click="posForm.orderType = 'Invoice'"
                :class="['px-2 sm:px-2.5 py-0.5 rounded font-bold transition-all', posForm.orderType === 'Invoice' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
              >
                Invoice
              </button>
              <button
                type="button"
                @click="posForm.orderType = 'Quotation'"
                :class="['px-2 sm:px-2.5 py-0.5 rounded font-bold transition-all', posForm.orderType === 'Quotation' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
              >
                Quotation
              </button>
              <button
                type="button"
                @click="posForm.orderType = 'SalesOrder'"
                :class="['px-2 sm:px-2.5 py-0.5 rounded font-bold transition-all', posForm.orderType === 'SalesOrder' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
              >
                Order
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Balance Visibility Toggle -->
          <button
            type="button"
            @click="authStore.toggleBalance()"
            :class="[
              'btn btn-xs flex items-center gap-1 font-mono transition-all',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-700 dark:text-slate-300' : 'btn-warning text-white'
            ]"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Reveal customer balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="12" />
            <Eye v-else :size="12" />
            <span class="hidden sm:inline">{{ authStore.isBalanceVisible ? 'Mask Balances' : 'Reveal Balances' }}</span>
          </button>

          <!-- Branch Selector (or Locked badge) -->
          <div class="flex items-center gap-1.5 sm:gap-2 bg-slate-200 dark:bg-slate-950 px-2 sm:px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[11px] sm:text-xs">
            <span class="text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">Sales Branch:</span>
            <span v-if="!authStore.isSuperAdmin" class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>📍 {{ authStore.userBranch || 'Lahore' }}</span>
              <span class="text-[10px] text-slate-500">(Locked)</span>
            </span>
            <select v-else v-model="posForm.branch" class="bg-transparent text-emerald-700 dark:text-emerald-300 font-bold focus:outline-none cursor-pointer">
              <option value="Peshawar" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Peshawar (HO)</option>
              <option value="Lahore" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lahore Branch</option>
              <option value="Multan" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Multan Branch</option>
              <option value="Islamabad" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Islamabad Branch</option>
              <option value="Karachi" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Karachi Branch</option>
            </select>
          </div>

          <button @click="uiStore.closeSaleModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-lg font-bold">✕</button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           METADATA HEADER: Customer Party, Payment Terms, Dates
      ══════════════════════════════════════════════════════════════ -->
      <div class="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3 text-xs shrink-0">
        
        <!-- Customer / Party Select with + Add Party Button -->
        <div class="sm:col-span-2 md:col-span-5">
          <div class="flex items-center justify-between mb-1">
            <label class="font-bold text-slate-700 dark:text-slate-300 block text-xs">Customer / Party Account *</label>
            <button
              type="button"
              @click="openAddPartyModal()"
              class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
              title="Add New Customer Party"
            >
              <Plus :size="12" />
              <span>Add Party</span>
            </button>
          </div>
          <select
            v-model="posForm.customer"
            required
            class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:border-emerald-500 focus:outline-none cursor-pointer min-h-[36px]"
          >
            <option value="" disabled>Select Customer / Party Account...</option>
            <option v-for="c in filteredPosPartyList" :key="c.name" :value="c.name">
              {{ c.name }} ({{ c.category || 'REGULAR' }} — Bal: PKR {{ (c.balance || 0).toLocaleString() }})
            </option>
          </select>
        </div>

        <!-- Middle Col: Payment Terms & Delivery Date -->
        <div class="sm:col-span-2 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Payment Terms</label>
            <select
              v-model="posForm.paymentTerms"
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none min-h-[36px]"
            >
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Cash Payment">Cash Payment</option>
              <option value="Bank Transfer (Meezan Bank)">Bank Transfer (Meezan)</option>
              <option value="Bank Transfer (HBL)">Bank Transfer (HBL)</option>
              <option value="Credit Terms (30 Days)">Credit Terms (30 Days)</option>
              <option value="Installment (3-Months)">Installment (3-Months)</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Delivery / Invoice Date *</label>
            <input
              v-model="posForm.deliveryDate"
              type="date"
              required
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-mono font-bold focus:border-emerald-500 focus:outline-none min-h-[36px]"
            />
          </div>
        </div>

        <!-- Right Col: Origin BL Link -->
        <div class="sm:col-span-2 md:col-span-3">
          <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Origin BL Consignment</label>
          <select
            v-model="posForm.blNumber"
            class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none min-h-[36px]"
          >
            <option value="">Consolidated Warehouse Consignment</option>
            <option v-for="bl in dataStore.blList" :key="bl.blNumber" :value="bl.blNumber">
              {{ bl.blNumber }} ({{ bl.supplierName || 'Import' }})
            </option>
          </select>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           MAIN BODY (SCROLLABLE): Full Width Items Grid & Calculations
      ══════════════════════════════════════════════════════════════ -->
      <form @submit.prevent="handleProcessSale" class="flex flex-col flex-1 overflow-hidden m-0">
        <div class="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50 dark:bg-transparent">
          
          <!-- ── FULL WIDTH ITEMS GRID TABLE (Vyapar Style) ── -->
          <div class="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900/90 shadow-md">
            <div class="overflow-x-auto min-w-full">
              <table class="w-full text-left border-collapse min-w-[780px]">
                <thead>
                  <tr class="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th class="py-2.5 px-3 w-10 text-center">#</th>
                    <th class="py-2.5 px-3 min-w-[280px]">ITEM / EQUIPMENT PRODUCT</th>
                    <th class="py-2.5 px-3 w-44 text-center">SERIAL NUM</th>
                    <th class="py-2.5 px-3 w-28 text-center">QTY</th>
                    <th class="py-2.5 px-3 min-w-[150px]">
                      <div class="flex items-center justify-between">
                        <span>PRICE / UNIT</span>
                        <span class="text-[9px] text-slate-500 dark:text-slate-400 font-mono">Without Tax</span>
                      </div>
                    </th>
                    <th class="py-2.5 px-3 w-32 text-center">TAX (%)</th>
                    <th class="py-2.5 px-3 w-36 text-right">AMOUNT (PKR)</th>
                    <th class="py-2.5 px-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0f172a]">
                  <tr
                    v-for="(row, index) in saleRows"
                    :key="row.id"
                    class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <!-- Index -->
                    <td class="py-2 px-3 text-center text-slate-500 dark:text-slate-400 font-mono font-bold">{{ index + 1 }}</td>

                    <!-- Product Selector -->
                    <td class="py-2 px-3">
                      <div class="space-y-1">
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Equipment Item</span>
                          <button
                            type="button"
                            @click="openAddProductModal(index)"
                            class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
                            title="Add New Equipment Product"
                          >
                            <Plus :size="10" />
                            <span>Add Equipment</span>
                          </button>
                        </div>
                        <select
                          v-model="row.productId"
                          @change="onSaleProductSelect(row)"
                          required
                          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-bold text-xs focus:border-emerald-500 focus:outline-none min-h-[34px] cursor-pointer"
                        >
                          <option value="" disabled>Select Equipment Item / SKU...</option>
                          <option v-for="p in branchProducts" :key="p.id" :value="p.id">
                            {{ p.name }} ({{ p.sku }}) — PKR {{ (p.sellingPrice || p.costPrice || 0).toLocaleString() }}
                          </option>
                        </select>
                      </div>
                    </td>

                    <!-- SERIAL NO Trigger Button (Opens Vyapar Modal) -->
                    <td class="py-2 px-3 text-center">
                      <button
                        type="button"
                        @click="openSaleSerialModal(index)"
                        class="px-2.5 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 font-mono text-xs font-bold transition-all w-full cursor-pointer"
                        :class="[
                          row.serials.length === row.qty && row.qty > 0
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-teal-700 dark:text-teal-400 hover:border-emerald-500 hover:text-emerald-600'
                        ]"
                      >
                        <span class="flex items-center gap-0.5 text-[10px] tracking-tighter opacity-80">
                          <span>1</span><span>2</span><span>3</span><span class="font-sans">≡</span>
                        </span>
                        <span>{{ row.serials.length }} / {{ row.qty }} Serials</span>
                      </button>
                    </td>

                    <!-- QTY -->
                    <td class="py-2 px-3 text-center">
                      <input
                        v-model.number="row.qty"
                        type="number"
                        min="1"
                        max="1000"
                        required
                        @input="onSaleQtyChange(row)"
                        class="w-20 text-center bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </td>

                    <!-- PRICE / UNIT -->
                    <td class="py-2 px-3">
                      <input
                        v-model.number="row.unitPrice"
                        type="number"
                        min="0"
                        required
                        @input="calculateSaleRow(row)"
                        placeholder="PKR 0"
                        class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </td>

                    <!-- TAX (%) -->
                    <td class="py-2 px-3 text-center">
                      <select
                        v-model.number="row.taxRate"
                        @change="calculateSaleRow(row)"
                        class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-mono font-semibold text-xs focus:border-emerald-500 focus:outline-none"
                      >
                        <option :value="0">NONE (0%)</option>
                        <option :value="18">18% HSN</option>
                        <option :value="5">5% Custom</option>
                      </select>
                    </td>

                    <!-- AMOUNT -->
                    <td class="py-2 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      PKR {{ (row.amount || 0).toLocaleString() }}
                    </td>

                    <!-- Action -->
                    <td class="py-2 px-3 text-center">
                      <button
                        v-if="saleRows.length > 1"
                        type="button"
                        @click="removeSaleRow(index)"
                        class="text-rose-500 hover:text-rose-700 p-1 font-bold rounded hover:bg-rose-100 dark:hover:bg-rose-950/40"
                        title="Remove row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Table Footer: Add Row Button and Subtotal -->
            <div class="p-3 bg-slate-50 dark:bg-slate-950 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                @click="addSaleRow"
                class="btn btn-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg"
              >
                <Plus :size="13" />
                <span>ADD ROW</span>
              </button>

              <div class="flex items-center gap-4 text-xs font-bold">
                <span class="text-slate-600 dark:text-slate-400 uppercase tracking-wider">TOTAL UNITS: {{ totalSaleUnits }}</span>
                <span class="text-slate-700 dark:text-slate-300">SUBTOTAL: <span class="font-mono text-slate-900 dark:text-white text-sm">PKR {{ computedSaleSubtotal.toLocaleString() }}</span></span>
              </div>
            </div>
          </div>

          <!-- ── BOTTOM PANEL: Ledger Reconciliation & Financial Summary ── -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <!-- LEFT COLUMN (7 Cols): Customer Ledger Reconciliation & Notes -->
            <div class="lg:col-span-7 space-y-3">
              
              <!-- Customer Ledger Reconciliation Card -->
              <div class="p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                  <span class="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Receipt :size="14" />
                    <span>Customer Ledger Balance Reconciliation</span>
                  </span>
                  <span class="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Party: {{ posForm.customer || 'Select Party' }}</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
                  <div class="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Previous Balance</span>
                    <span class="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">PKR {{ (selectedPosCustomerObj?.balance || 0).toLocaleString() }}</span>
                  </div>
                  <div class="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">(+) This Invoice</span>
                    <span class="text-xs font-bold text-blue-700 dark:text-blue-300 block mt-0.5">PKR {{ computedSaleGrandTotal.toLocaleString() }}</span>
                  </div>
                  <div class="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">(-) Received</span>
                    <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300 block mt-0.5">PKR {{ Number(posForm.receivedAmount || 0).toLocaleString() }}</span>
                  </div>
                  <div class="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-lg border border-amber-200 dark:border-amber-500/40">
                    <span class="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">Total Outstanding</span>
                    <span class="text-xs font-black text-amber-800 dark:text-amber-400 block mt-0.5">PKR {{ calculatedFinalBalance.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Type & Description -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="text-slate-700 dark:text-slate-400 font-bold text-xs">Payment Mode</label>
                    <button
                      type="button"
                      @click="showAddSalePaymentMethodModal = true"
                      class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
                      title="Add Custom Payment Method"
                    >
                      <Plus :size="12" />
                      <span>Add Method</span>
                    </button>
                  </div>
                  <select
                    v-model="posForm.paymentType"
                    class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-bold text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option v-for="m in paymentMethodsList" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
                <div class="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
                  <label class="text-slate-700 dark:text-slate-400 block mb-1.5 font-bold text-xs">Notes / Invoice Terms</label>
                  <input
                    v-model="posForm.description"
                    type="text"
                    placeholder="Enter warranty notes, delivery details..."
                    class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN (5 Cols): Vyapar Financial Summary -->
            <div class="lg:col-span-5 bg-white dark:bg-slate-900/95 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 shadow-md flex flex-col justify-between">
              <div class="space-y-2">
                <!-- Subtotal -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span class="text-slate-600 dark:text-slate-400 font-bold">Subtotal</span>
                  <span class="font-mono font-bold text-slate-900 dark:text-white">PKR {{ computedSaleSubtotal.toLocaleString() }}</span>
                </div>

                <!-- Discount -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span class="text-slate-600 dark:text-slate-400">Discount (PKR)</span>
                  <input
                    v-model.number="posForm.discount"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-28 text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <!-- Tax -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span class="text-slate-600 dark:text-slate-400">Sales Tax (18% HSN)</span>
                  <span class="font-mono text-amber-600 dark:text-amber-300 font-bold">+ PKR {{ computedSaleTaxTotal.toLocaleString() }}</span>
                </div>

                <!-- Round Off -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <label class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input type="checkbox" v-model="posForm.roundOff" class="rounded border-slate-300 dark:border-slate-700" />
                    <span>Round Off</span>
                  </label>
                  <span class="font-mono text-slate-500 dark:text-slate-400">PKR {{ computedSaleRoundOffAmount }}</span>
                </div>

                <!-- TOTAL -->
                <div class="p-3 bg-emerald-50/80 dark:bg-slate-950 rounded-lg border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-between">
                  <span class="font-black uppercase tracking-wider text-xs text-emerald-800 dark:text-emerald-400">Total Invoice Amount</span>
                  <span class="font-mono font-black text-lg sm:text-xl text-emerald-700 dark:text-emerald-400">PKR {{ computedSaleGrandTotal.toLocaleString() }}</span>
                </div>

                <!-- Received -->
                <div class="flex items-center justify-between text-xs py-1 pt-2">
                  <span class="text-slate-700 dark:text-slate-300 font-bold">Received (PKR)</span>
                  <input
                    v-model.number="posForm.receivedAmount"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-36 text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <!-- Balance Due -->
                <div class="flex items-center justify-between text-xs py-2 px-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-500/30">
                  <span class="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Balance Due</span>
                  <span class="font-mono font-black text-sm text-amber-700 dark:text-amber-400">PKR {{ computedSaleBalanceDue.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════
             FOOTER ACTIONS: Close, Share, Save (Vyapar Desktop Style)
        ══════════════════════════════════════════════════════════════ -->
        <div class="px-3 sm:px-5 py-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            @click="uiStore.closeSaleModal"
            class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            Cancel
          </button>

          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              @click="handlePreviewInvoice"
              class="btn btn-secondary text-xs font-bold px-3 sm:px-4 py-2 flex items-center gap-1.5"
            >
              <span>Share / Print</span>
              <ChevronDown :size="13" />
            </button>

            <button
              type="submit"
              class="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle :size="16" />
              <span>{{ uiStore.editingSaleData ? 'Update & Save Sale Invoice' : 'Save & Dispatch Invoice' }}</span>
            </button>
          </div>
        </div>
      </form>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: Dedicated Sale Serial Number Modal
      ══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <div
          v-if="showSaleSerialModal"
          class="fixed inset-0 z-[99999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background-color: rgba(15, 23, 42, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important;"
          @click.self="closeSaleSerialModal"
        >
          <div
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150 relative"
            style="width: 92% !important; max-width: 520px !important; margin: auto !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
          >
            <!-- Serial Modal Header -->
            <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white leading-tight">Sale Item - SERIAL NUM</h3>
                <p class="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 uppercase tracking-wide truncate max-w-xs">
                  {{ activeSaleProductName || 'Equipment Product' }}
                </p>
              </div>
              <button @click="closeSaleSerialModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold">✕</button>
            </div>

            <!-- Serial Modal Body -->
            <div class="p-6 overflow-y-auto space-y-4 text-xs bg-white dark:bg-[#0f172a]">
              <!-- Enter SERIAL NUM Input Box -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Enter SERIAL NUM:</span>
                  <span class="font-mono text-emerald-600 dark:text-emerald-300 font-black">{{ activeSaleRow?.serials.length }}/{{ activeSaleRow?.qty || 1 }} Entered</span>
                </div>

                <div class="flex items-center gap-2">
                  <input
                    v-model="newSaleSerialInputText"
                    type="text"
                    placeholder="Type or scan serial number..."
                    @keyup.enter="commitSaleSerialSearch"
                    class="flex-1 rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    @click="commitSaleSerialSearch"
                    class="w-10 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold shadow-md cursor-pointer shrink-0"
                    title="Add / Select Serial"
                  >
                    <Check :size="18" />
                  </button>
                </div>

                <!-- Selected / Entered Serials Chips List -->
                <div v-if="activeSaleRow?.serials?.length" class="space-y-1 pt-1">
                  <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Assigned Serials ({{ activeSaleRow.serials.length }}):</span>
                  <div class="flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-28 overflow-y-auto">
                    <div
                      v-for="sn in activeSaleRow.serials"
                      :key="sn"
                      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 font-mono font-bold text-[11px]"
                    >
                      <span>{{ sn }}</span>
                      <button
                        type="button"
                        @click="toggleSaleSerial(sn)"
                        class="text-rose-500 hover:text-rose-700 font-black text-xs leading-none"
                        title="Remove serial"
                      >✕</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Checkbox List of Available In-Stock Serials -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Available Serials in {{ posForm.branch }}</span>
                  <span class="text-teal-600 dark:text-teal-400">{{ availableSerialsForActiveRow.length }} In Stock</span>
                </div>

                <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  <div
                    v-for="s in availableSerialsForActiveRow"
                    :key="s.serialCode"
                    class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1e293b] hover:border-blue-500/60 transition-colors"
                  >
                    <label class="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        :checked="activeSaleRow?.serials.includes(s.serialCode)"
                        @change="toggleSaleSerial(s.serialCode)"
                        class="w-4 h-4 rounded text-blue-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                      />
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="font-mono font-bold text-slate-900 dark:text-white text-xs truncate">{{ s.serialCode }}</span>
                        <span v-if="s.machineCode" class="badge badge-purple text-[9px] py-0 px-1 font-mono">{{ s.machineCode }}</span>
                      </div>
                    </label>

                    <span class="badge badge-success text-[9px] py-0 px-1 font-mono">Available</span>
                  </div>

                  <div v-if="availableSerialsForActiveRow.length === 0" class="p-6 text-center text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-dashed border-slate-300 dark:border-slate-800">
                    No available serial numbers found in {{ posForm.branch }} warehouse for this product.
                  </div>
                </div>
              </div>
            </div>

            <!-- Serial Modal Footer -->
            <div class="px-6 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                @click="closeSaleSerialModal"
                class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                @click="saveSaleSerialModal"
                class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: + Add New Party Modal
      ══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <div
          v-if="showAddPartyModal"
          class="fixed inset-0 z-[99999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background-color: rgba(15, 23, 42, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important;"
          @click.self="showAddPartyModal = false"
        >
          <div
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150 relative"
            style="width: 92% !important; max-width: 540px !important; margin: auto !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
          >
            <!-- Modal Header -->
            <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <UserPlus :size="17" class="text-emerald-500" />
                <span>Add New Party</span>
              </div>
              <button type="button" @click="showAddPartyModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-4 text-xs bg-white dark:bg-[#0f172a]">
              <!-- PARTY NAME * -->
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Party Name *</label>
                <input
                  v-model="newParty.name"
                  type="text"
                  placeholder="e.g. HOSPITEX RAWALPINDI"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <!-- PARTY TYPE & BRANCH / CITY -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Party Type</label>
                  <select
                    v-model="newParty.type"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Customer (Debtor)">Customer (Debtor)</option>
                    <option value="Supplier / Exporter (Creditor)">Supplier / Exporter (Creditor)</option>
                    <option value="OEM Manufacturer">OEM Manufacturer</option>
                    <option value="Local Vendor">Local Vendor</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Branch / City</label>
                  <div v-if="!authStore.isSuperAdmin" class="w-full rounded-lg px-3.5 py-2.5 bg-slate-100 dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-between min-h-[38px]">
                    <span class="flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{{ authStore.userBranch || posForm.branch || 'Karachi' }}</span>
                    </span>
                    <span class="text-[10px] text-slate-400 font-normal">(Locked)</span>
                  </div>
                  <select
                    v-else
                    v-model="newParty.branch"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer min-h-[38px]"
                  >
                    <option value="Peshawar">Peshawar (HO)</option>
                    <option value="Lahore">Lahore Branch</option>
                    <option value="Multan">Multan Branch</option>
                    <option value="Islamabad">Islamabad Branch</option>
                    <option value="Karachi">Karachi Branch</option>
                  </select>
                </div>
              </div>

              <!-- PHONE NUMBER & EMAIL -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input
                    v-model="newParty.phone"
                    type="text"
                    placeholder="+92 300 1234567"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-medium text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    v-model="newParty.email"
                    type="email"
                    placeholder="accounts@clinic.com"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-medium text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <!-- CREDIT LIMIT & OPENING BALANCE -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Credit Limit (PKR)</label>
                  <input
                    v-model.number="newParty.baseCreditLimit"
                    type="number"
                    placeholder="1000000"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Opening Balance (PKR)</label>
                  <input
                    v-model.number="newParty.openingBalance"
                    type="number"
                    placeholder="0"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <!-- ADDRESS / NOTES -->
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Address / Notes</label>
                <textarea
                  v-model="newParty.address"
                  rows="2"
                  placeholder="Full clinic address..."
                  class="w-full rounded-lg px-3.5 py-2 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="showAddPartyModal = false"
                class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSaveNewParty"
                class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Party
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: + Add Payment Method Modal (Sales)
      ══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <div
          v-if="showAddSalePaymentMethodModal"
          class="fixed inset-0 z-[99999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background-color: rgba(15, 23, 42, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important;"
          @click.self="showAddSalePaymentMethodModal = false"
        >
          <div
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150 relative"
            style="width: 92% !important; max-width: 480px !important; margin: auto !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
          >
            <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <CreditCard :size="17" class="text-emerald-500" />
                <span>Add Payment Method</span>
              </div>
              <button type="button" @click="showAddSalePaymentMethodModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
            </div>

            <div class="p-6 space-y-4 text-xs bg-white dark:bg-[#0f172a]">
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Payment Method Name *</label>
                <input
                  v-model="newSalePaymentMethodName"
                  type="text"
                  placeholder="e.g. Meezan Bank (Sales A/C 9901) or EasyPaisa"
                  @keyup.enter="handleSaveSalePaymentMethod"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Method Type / Channel</label>
                <select
                  v-model="newSalePaymentMethodType"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Bank Account">Bank Account / Direct Transfer</option>
                  <option value="Cash Counter">Cash Counter / Till</option>
                  <option value="Digital Wallet">Digital Wallet (JazzCash / EasyPaisa / Raast)</option>
                  <option value="Cheque / Pay Order">Cheque / Pay Order</option>
                  <option value="Credit Terms">Customer Credit Terms</option>
                </select>
              </div>
            </div>

            <div class="px-6 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="showAddSalePaymentMethodModal = false"
                class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSaveSalePaymentMethod"
                class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Method
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: + Add New Equipment Modal (Sales)
      ══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <div
          v-if="showAddProductModal"
          class="fixed inset-0 z-[99999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background-color: rgba(15, 23, 42, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important;"
          @click.self="showAddProductModal = false"
        >
          <div
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150 relative"
            style="width: 92% !important; max-width: 560px !important; margin: auto !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
          >
            <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <Package :size="17" class="text-emerald-500" />
                <span>Add New Equipment Product</span>
              </div>
              <button type="button" @click="showAddProductModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
            </div>

            <div class="p-6 space-y-4 text-xs bg-white dark:bg-[#0f172a]">
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Equipment Product Name *</label>
                <input
                  v-model="newProductObj.name"
                  type="text"
                  placeholder="e.g. 10 Inch Portable Ultrasound Scanner System"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  v-model="newProductObj.category"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Ultrasound Machines">Ultrasound Machines</option>
                  <option value="Laser Systems">Laser Systems</option>
                  <option value="X-Ray & Radiology">X-Ray & Radiology</option>
                  <option value="Patient Monitors">Patient Monitors</option>
                  <option value="Cardiology Equipment">Cardiology Equipment</option>
                  <option value="Surgical Equipment">Surgical Equipment</option>
                  <option value="Neonatal Care Equipment">Neonatal Care Equipment</option>
                  <option value="Hospital Furniture">Hospital Furniture</option>
                  <option value="General Equipment">General Equipment</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Cost Price (PKR)</label>
                  <input
                    v-model.number="newProductObj.costPrice"
                    type="number"
                    placeholder="450000"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Selling Price (PKR)</label>
                  <input
                    v-model.number="newProductObj.sellingPrice"
                    type="number"
                    placeholder="650000"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Initial Stock Qty</label>
                  <input
                    v-model.number="newProductObj.stockQty"
                    type="number"
                    placeholder="5"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Branch Warehouse</label>
                  <div v-if="!authStore.isSuperAdmin" class="w-full rounded-lg px-3.5 py-2.5 bg-slate-100 dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-between min-h-[38px]">
                    <span class="flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{{ authStore.userBranch || posForm.branch || 'Karachi' }}</span>
                    </span>
                    <span class="text-[10px] text-slate-400 font-normal">(Locked)</span>
                  </div>
                  <select
                    v-else
                    v-model="newProductObj.branch"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer min-h-[38px]"
                  >
                    <option value="Peshawar">Peshawar (HO)</option>
                    <option value="Lahore">Lahore Branch</option>
                    <option value="Multan">Multan Branch</option>
                    <option value="Islamabad">Islamabad Branch</option>
                    <option value="Karachi">Karachi Branch</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="px-6 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="showAddProductModal = false"
                class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSaveNewProduct"
                class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Equipment
              </button>
            </div>
          </div>
        </div>
      </Teleport>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  ShoppingCart,
  Eye,
  EyeOff,
  Plus,
  Search,
  ChevronDown,
  Receipt,
  CheckCircle,
  UserPlus,
  Check,
  CreditCard,
  Package
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const isPosCustomerDropdownOpen = ref(false)
const posPartySearchQuery = ref('')
const showAddPartyModal = ref(false)

// ── Equipment Product Modal State (Sales) ──
const showAddProductModal = ref(false)
const activeProductRowIndex = ref(0)
const newProductObj = ref({
  name: '',
  category: 'Ultrasound Machines',
  sku: '',
  costPrice: 100000,
  sellingPrice: 150000,
  stockQty: 5,
  minStock: 2,
  branch: 'Lahore'
})

function openAddPartyModal() {
  const currentBranch = posForm.value.branch || authStore.userBranch || 'Karachi'
  newParty.value = {
    name: '',
    type: 'Customer (Debtor)',
    branch: currentBranch,
    phone: '',
    email: '',
    baseCreditLimit: 1000000,
    openingBalance: 0,
    address: ''
  }
  showAddPartyModal.value = true
}

function openAddProductModal(rowIndex = 0) {
  activeProductRowIndex.value = rowIndex
  const currentBranch = posForm.value.branch || authStore.userBranch || 'Karachi'
  newProductObj.value = {
    name: '',
    category: 'Ultrasound Machines',
    sku: `SKU-${Date.now().toString().slice(-4)}`,
    costPrice: 100000,
    sellingPrice: 150000,
    stockQty: 5,
    minStock: 2,
    branch: currentBranch
  }
  showAddProductModal.value = true
}

function handleSaveNewProduct() {
  if (!newProductObj.value.name.trim()) {
    uiStore.showModal('Validation Error', 'Equipment Product Name is required.', 'warning')
    return
  }
  const name = newProductObj.value.name.trim()
  const cleanSku = (newProductObj.value.sku && newProductObj.value.sku.trim())
    ? newProductObj.value.sku.trim().toUpperCase()
    : `SKU-${Date.now().toString().slice(-4)}`

  const targetBranch = !authStore.isSuperAdmin
    ? (posForm.value.branch || authStore.userBranch || 'Karachi')
    : (newProductObj.value.branch || posForm.value.branch || 'Karachi')

  const createdProd = {
    id: `prd_${Date.now()}`,
    sku: cleanSku,
    name: name,
    category: newProductObj.value.category || 'Ultrasound Machines',
    division: 'Medimage Services',
    hsnCode: '9018.9000',
    taxRatio: 18,
    allocationCity: targetBranch,
    allocationCities: [targetBranch],
    storageBin: `BIN-${cleanSku}-01`,
    costPrice: Number(newProductObj.value.costPrice) || 100000,
    sellingPrice: Number(newProductObj.value.sellingPrice) || 150000,
    stockQty: Number(newProductObj.value.stockQty) || 1,
    minStock: Number(newProductObj.value.minStock) || 2,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
  }

  // Generate serials for initial stock
  const generatedSerials = []
  for (let i = 1; i <= createdProd.stockQty; i++) {
    const sCode = `${cleanSku}-${String(Date.now()).slice(-4)}${i}`
    const mCode = `MC-${Math.floor(100 + Math.random() * 900)}`
    const sDoc = {
      serialCode: sCode,
      machineCode: mCode,
      productId: createdProd.id,
      sku: cleanSku,
      status: 'Available',
      allocationCity: targetBranch,
      binLocation: createdProd.storageBin,
      registeredDate: new Date().toISOString().substring(0, 10),
      soldDate: null,
      customer: null,
      invoiceNo: null,
      paymentStatus: 'Pending',
      hsnCode: createdProd.hsnCode,
      taxRatio: 18,
      salePrice: createdProd.sellingPrice
    }
    dataStore.serials.unshift(sDoc)
    generatedSerials.push(sDoc)
  }

  dataStore.products.unshift(createdProd)
  dataStore.saveState()

  // API Call to save product and serials in MongoDB
  try {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createdProd)
    }).catch(() => {})

    if (generatedSerials.length > 0) {
      fetch('/api/serials/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedSerials)
      }).catch(() => {})
    }
  } catch (e) {}

  if (saleRows.value[activeProductRowIndex.value]) {
    saleRows.value[activeProductRowIndex.value].productId = createdProd.id
    onSaleProductSelect(saleRows.value[activeProductRowIndex.value])
  }

  showAddProductModal.value = false
  uiStore.showToast(`Equipment "${name}" registered for ${targetBranch}!`, 'success')
}

// ── Payment Methods State & Modal (Sales) ──
const paymentMethodsList = ref([
  'Cash Payment',
  'Bank Transfer (Meezan / HBL)',
  'Cheque / Pay Order',
  'Credit Terms (30 Days)',
  'Direct Online / Raast',
  'Digital Wallet'
])
const showAddSalePaymentMethodModal = ref(false)
const newSalePaymentMethodName = ref('')
const newSalePaymentMethodType = ref('Bank Account')

function handleSaveSalePaymentMethod() {
  if (!newSalePaymentMethodName.value.trim()) {
    uiStore.showModal('Validation Error', 'Payment Method Name is required.', 'warning')
    return
  }
  const name = newSalePaymentMethodName.value.trim()
  if (!paymentMethodsList.value.includes(name)) {
    paymentMethodsList.value.push(name)
  }
  posForm.value.paymentType = name
  showAddSalePaymentMethodModal.value = false
  uiStore.showToast(`Payment method "${name}" added and selected!`, 'success')
  newSalePaymentMethodName.value = ''
}

const posForm = ref({
  orderType: 'Invoice',
  customer: '',
  branch: authStore.userBranch || 'Karachi',
  deliveryDate: new Date().toISOString().substring(0, 10),
  paymentTerms: 'Due on Receipt',
  paymentType: 'Cash Payment',
  blNumber: '',
  description: '',
  discount: 0,
  roundOff: false,
  receivedAmount: 0
})

const saleRows = ref([
  {
    id: 'srow_1',
    productId: '',
    qty: 1,
    unitPrice: 650000,
    taxRate: 18,
    taxAmount: 117000,
    amount: 767000,
    serials: []
  }
])

const newParty = ref({
  name: '',
  type: 'Customer (Debtor)',
  branch: authStore.userBranch || 'Karachi',
  phone: '',
  email: '',
  baseCreditLimit: 1000000,
  openingBalance: 0,
  address: ''
})

// ── Sale Serial Modal State ──
const showSaleSerialModal = ref(false)
const activeSaleRowIndex = ref(0)
const newSaleSerialInputText = ref('')

watch(() => uiStore.showGlobalSaleModal, (isOpen) => {
  if (isOpen) {
    if (uiStore.editingSaleData) {
      const edit = uiStore.editingSaleData
      posForm.value.invoiceNo = edit.invoiceNo || edit.id || ''
      posForm.value.branch = edit.branch || edit.allocationCity || authStore.userBranch || 'Karachi'
      posForm.value.deliveryDate = edit.deliveryDate || edit.date || edit.saleDate || new Date().toISOString().substring(0, 10)
      posForm.value.orderType = edit.orderType || (edit.quotationNo ? 'Quotation' : 'Invoice')
      posForm.value.customer = edit.customer || edit.customerName || edit.party || ''
      posForm.value.paymentTerms = edit.paymentTerms || 'Due on Receipt'
      posForm.value.paymentType = edit.paymentType || edit.paymentMethod || 'Cash Payment'
      posForm.value.blNumber = edit.blNumber || ''
      posForm.value.description = edit.description || edit.notes || ''
      posForm.value.discount = edit.discount || 0
      posForm.value.roundOff = false
      posForm.value.receivedAmount = edit.paidAmount || edit.amountPaid || edit.receivedAmount || 0

      if (edit.items && edit.items.length > 0) {
        saleRows.value = edit.items.map((it, idx) => {
          const prod = dataStore.products.find(p => p.id === it.productId || p.sku === (it.sku || it.productCode))
          const qty = Number(it.qty || it.quantity || 1)
          const unitPrice = Number(it.unitPrice || it.sellingPrice || it.rate || (prod ? prod.sellingPrice : 650000))
          const taxRate = Number(it.taxRatio !== undefined ? it.taxRatio : (it.taxRate !== undefined ? it.taxRate : 18))
          const taxAmount = Math.round((qty * unitPrice * taxRate) / 100)
          const amount = it.total || it.amount || (qty * unitPrice + taxAmount)
          const serials = (it.serials || []).map(s => typeof s === 'string' ? s : (s.serialCode || s.serialNumber))
          return {
            id: `srow_${Date.now()}_${idx}`,
            productId: prod?.id || it.productId || '',
            qty,
            unitPrice,
            taxRate,
            taxAmount,
            amount,
            serials
          }
        })
      } else {
        const defaultProd = branchProducts.value[0] || dataStore.products?.[0]
        saleRows.value = [
          {
            id: `srow_${Date.now()}`,
            productId: defaultProd?.id || '',
            qty: 1,
            unitPrice: defaultProd?.sellingPrice || 650000,
            taxRate: 18,
            taxAmount: Math.round((defaultProd?.sellingPrice || 650000) * 0.18),
            amount: Math.round((defaultProd?.sellingPrice || 650000) * 1.18),
            serials: []
          }
        ]
      }
    } else {
      const currentBranch = authStore.userBranch || (dataStore.activeBranchFilter && dataStore.activeBranchFilter !== 'All' ? dataStore.activeBranchFilter : 'Karachi')
      posForm.value.invoiceNo = ''
      posForm.value.branch = currentBranch
      posForm.value.deliveryDate = new Date().toISOString().substring(0, 10)
      posForm.value.orderType = 'Invoice'
      posForm.value.customer = (dataStore.customers && dataStore.customers[0]) ? dataStore.customers[0].name : ''
      posForm.value.paymentTerms = 'Due on Receipt'
      posForm.value.paymentType = 'Cash Payment'
      posForm.value.blNumber = ''
      posForm.value.description = ''
      posForm.value.discount = 0
      posForm.value.roundOff = false
      posForm.value.receivedAmount = 0

      const defaultProd = branchProducts.value[0] || dataStore.products?.[0]
      saleRows.value = [
        {
          id: `srow_${Date.now()}`,
          productId: defaultProd?.id || '',
          qty: 1,
          unitPrice: defaultProd?.sellingPrice || 650000,
          taxRate: 18,
          taxAmount: Math.round((defaultProd?.sellingPrice || 650000) * 0.18),
          amount: Math.round((defaultProd?.sellingPrice || 650000) * 1.18),
          serials: []
        }
      ]
    }
    isPosCustomerDropdownOpen.value = false
    posPartySearchQuery.value = ''
  }
})

const branchProducts = computed(() => {
  const branch = (posForm.value.branch || authStore.userBranch || 'Karachi').toLowerCase()
  return (dataStore.products || []).filter(p => {
    if (authStore.isSuperAdmin) return true
    const alloc = String(p.allocationCity || '').toLowerCase()
    const isSelectedInAnyRow = saleRows.value.some(r => r.productId === p.id)
    return isSelectedInAnyRow || alloc.includes(branch) || branch.includes(alloc)
  })
})

const filteredPosPartyList = computed(() => {
  let list = [...(dataStore.customers || [])]
  const activeCity = (posForm.value.branch || authStore.userBranch || 'Karachi').toLowerCase()
  if (!authStore.isSuperAdmin) {
    list = list.filter(c => {
      const cBranch = (c.branch || '').toLowerCase()
      const isSelected = posForm.value.customer && c.name && c.name.toLowerCase() === posForm.value.customer.toLowerCase()
      return isSelected || !cBranch || cBranch === 'all' || cBranch.includes(activeCity) || activeCity.includes(cBranch)
    })
  }
  // Ensure selected customer is always in the list
  if (posForm.value.customer && !list.some(c => c.name.toLowerCase() === posForm.value.customer.toLowerCase())) {
    const existing = (dataStore.customers || []).find(c => c.name.toLowerCase() === posForm.value.customer.toLowerCase())
    if (existing) {
      list.unshift(existing)
    } else {
      list.unshift({
        id: `cust_temp_${Date.now()}`,
        name: posForm.value.customer,
        branch: posForm.value.branch,
        category: 'REGULAR',
        balance: 0
      })
    }
  }
  if (posPartySearchQuery.value.trim()) {
    const q = posPartySearchQuery.value.toLowerCase().trim()
    list = list.filter(c => (c.name || '').toLowerCase().includes(q) || (c.phone && c.phone.includes(q)) || (c.branch && c.branch.toLowerCase().includes(q)))
  }
  return list
})

const selectedPosCustomerObj = computed(() => {
  if (!posForm.value.customer) return null
  return (dataStore.customers || []).find(c => c.name.toLowerCase() === posForm.value.customer.toLowerCase()) || {
    name: posForm.value.customer,
    branch: posForm.value.branch,
    category: 'REGULAR',
    balance: 0
  }
})

function selectCustomer(c) {
  posForm.value.customer = c.name
  if (c.branch && authStore.isSuperAdmin) {
    posForm.value.branch = c.branch
  }
  isPosCustomerDropdownOpen.value = false
}

function handleSaveNewParty() {
  if (!newParty.value.name.trim()) {
    uiStore.showModal('Validation Error', 'Party name is required.', 'warning')
    return
  }
  const partyName = newParty.value.name.trim()
  const partyBranch = !authStore.isSuperAdmin
    ? (posForm.value.branch || authStore.userBranch || 'Karachi')
    : (newParty.value.branch || posForm.value.branch || 'Karachi')

  const created = {
    id: `cust_${Date.now()}`,
    name: partyName,
    type: newParty.value.type || 'Customer (Debtor)',
    phone: newParty.value.phone || '',
    email: newParty.value.email || '',
    branch: partyBranch,
    category: newParty.value.type?.includes('Creditor') || newParty.value.type?.includes('Supplier') ? 'SUPPLIER' : 'REGULAR',
    baseCreditLimit: Number(newParty.value.baseCreditLimit || 1000000),
    creditLimit: Number(newParty.value.baseCreditLimit || 1000000),
    balance: Number(newParty.value.openingBalance || 0),
    openingBalance: Number(newParty.value.openingBalance || 0),
    address: newParty.value.address || ''
  }

  dataStore.customers.unshift(created)
  dataStore.saveState()

  // API Call to save customer/party in MongoDB
  try {
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created)
    }).catch(() => {})
  } catch (e) {}

  posForm.value.customer = created.name
  showAddPartyModal.value = false
  uiStore.showToast(`Party "${partyName}" registered for ${partyBranch}!`, 'success')
  newParty.value = {
    name: '',
    type: 'Customer (Debtor)',
    branch: partyBranch,
    phone: '',
    email: '',
    baseCreditLimit: 1000000,
    openingBalance: 0,
    address: ''
  }
}

// ── Sale Rows Functions ──
function addSaleRow() {
  const defaultProd = branchProducts.value[0] || dataStore.products?.[0]
  saleRows.value.push({
    id: `srow_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    productId: defaultProd?.id || '',
    qty: 1,
    unitPrice: defaultProd?.sellingPrice || 100000,
    taxRate: 18,
    taxAmount: Math.round((defaultProd?.sellingPrice || 100000) * 0.18),
    amount: Math.round((defaultProd?.sellingPrice || 100000) * 1.18),
    serials: []
  })
}

function removeSaleRow(index) {
  if (saleRows.value.length > 1) {
    saleRows.value.splice(index, 1)
  }
}

function onSaleProductSelect(row) {
  const prod = (dataStore.products || []).find(p => p.id === row.productId)
  if (prod) {
    row.unitPrice = prod.sellingPrice || prod.costPrice || 0
    row.serials = []
    calculateSaleRow(row)
  }
}

function onSaleQtyChange(row) {
  calculateSaleRow(row)
}

function calculateSaleRow(row) {
  const base = (Number(row.qty) || 0) * (Number(row.unitPrice) || 0)
  const tax = Math.round(base * ((Number(row.taxRate) || 0) / 100))
  row.taxAmount = tax
  row.amount = base + tax
}

// ── Sale Serial Number Modal ──
const activeSaleRow = computed(() => saleRows.value[activeSaleRowIndex.value])
const activeSaleProductName = computed(() => {
  if (!activeSaleRow.value) return ''
  const p = (dataStore.products || []).find(prod => prod.id === activeSaleRow.value.productId)
  return p ? `${p.name} (${p.sku})` : 'Medical Equipment'
})

const availableSerialsForActiveRow = computed(() => {
  if (!activeSaleRow.value?.productId) return []
  const prod = (dataStore.products || []).find(p => p.id === activeSaleRow.value.productId)
  if (!prod) return []
  const branch = (posForm.value.branch || authStore.userBranch || 'Karachi').toLowerCase()
  return (dataStore.serials || []).filter(s => {
    const isAvail = s.status === 'Available'
    const isProd = s.productId === prod.id || s.sku === prod.sku
    const sCity = String(s.allocationCity || s.branch || '').toLowerCase()
    const isBranch = sCity.includes(branch) || branch.includes(sCity) || authStore.isSuperAdmin
    return isAvail && isProd && isBranch
  })
})

function openSaleSerialModal(index) {
  activeSaleRowIndex.value = index
  showSaleSerialModal.value = true
}

function closeSaleSerialModal() {
  showSaleSerialModal.value = false
  newSaleSerialInputText.value = ''
}

function saveSaleSerialModal() {
  showSaleSerialModal.value = false
  newSaleSerialInputText.value = ''
}

function toggleSaleSerial(serialCode) {
  const row = activeSaleRow.value
  if (!row) return
  const idx = row.serials.indexOf(serialCode)
  if (idx >= 0) {
    row.serials.splice(idx, 1)
  } else {
    if (row.serials.length < row.qty) {
      row.serials.push(serialCode)
    } else {
      // Auto-increase qty or replace
      row.serials.push(serialCode)
      row.qty = row.serials.length
      calculateSaleRow(row)
    }
  }
}

function commitSaleSerialSearch() {
  const raw = newSaleSerialInputText.value.trim()
  if (!raw) return
  const row = activeSaleRow.value
  if (!row) return

  const qLower = raw.toLowerCase()
  const match = availableSerialsForActiveRow.value.find(s =>
    s.serialCode.toLowerCase() === qLower ||
    (s.machineCode && s.machineCode.toLowerCase() === qLower) ||
    s.serialCode.toLowerCase().includes(qLower)
  )

  const serialToAdd = match ? match.serialCode : raw

  if (!row.serials.includes(serialToAdd)) {
    if (row.serials.length < row.qty) {
      row.serials.push(serialToAdd)
    } else {
      row.serials.push(serialToAdd)
      row.qty = row.serials.length
      calculateSaleRow(row)
    }
  }

  // Ensure serial exists in store
  const existingInStore = (dataStore.serials || []).find(s => s.serialCode === serialToAdd)
  if (!existingInStore) {
    const prod = (dataStore.products || []).find(p => p.id === row.productId)
    dataStore.serials.unshift({
      serialCode: serialToAdd,
      machineCode: `MC-${Date.now().toString().slice(-4)}`,
      productId: row.productId,
      sku: prod?.sku || 'MED',
      status: 'Available',
      allocationCity: posForm.value.branch,
      registeredDate: posForm.value.deliveryDate
    })
  }

  newSaleSerialInputText.value = ''
}

// ── Totals & Summary ──
const totalSaleUnits = computed(() => saleRows.value.reduce((sum, r) => sum + (Number(r.qty) || 0), 0))

const computedSaleSubtotal = computed(() => {
  return saleRows.value.reduce((sum, r) => sum + ((Number(r.qty) || 0) * (Number(r.unitPrice) || 0)), 0)
})

const computedSaleTaxTotal = computed(() => {
  return saleRows.value.reduce((sum, r) => sum + (Number(r.taxAmount) || 0), 0)
})

const computedSaleRoundOffAmount = computed(() => {
  if (!posForm.value.roundOff) return 0
  const raw = computedSaleSubtotal.value - (Number(posForm.value.discount) || 0) + computedSaleTaxTotal.value
  const rounded = Math.round(raw)
  return rounded - raw
})

const computedSaleGrandTotal = computed(() => {
  const base = computedSaleSubtotal.value - (Number(posForm.value.discount) || 0) + computedSaleTaxTotal.value
  return Math.max(0, posForm.value.roundOff ? Math.round(base) : base)
})

const computedSaleBalanceDue = computed(() => {
  return Math.max(0, computedSaleGrandTotal.value - (Number(posForm.value.receivedAmount) || 0))
})

const calculatedFinalBalance = computed(() => {
  const prev = Number(selectedPosCustomerObj.value?.balance || 0)
  const inv = Number(computedSaleGrandTotal.value || 0)
  const paid = Number(posForm.value.receivedAmount || 0)
  return Math.max(0, prev + inv - paid)
})

async function handleProcessSale() {
  if (!posForm.value.customer) {
    uiStore.showModal('Validation Error', 'Please select a Customer / Party account.', 'warning')
    return
  }
  if (saleRows.value.length === 0) {
    uiStore.showModal('Validation Error', 'Please add at least one equipment item to the order.', 'warning')
    return
  }

  if (uiStore.editingSaleData) {
    const editInvNo = posForm.value.invoiceNo || uiStore.editingSaleData.invoiceNo || uiStore.editingSaleData.id
    const items = saleRows.value.map(r => {
      const prod = (dataStore.products || []).find(p => p.id === r.productId)
      return {
        productId: r.productId,
        productName: prod ? prod.name : 'Medical Equipment',
        sku: prod ? prod.sku : 'MED',
        qty: Number(r.qty),
        serials: [...r.serials],
        unitPrice: Number(r.unitPrice),
        taxRatio: r.taxRate || 18,
        total: r.amount
      }
    })

    await dataStore.updateSalesInvoice(editInvNo, {
      customer: posForm.value.customer,
      date: posForm.value.deliveryDate,
      deliveryDate: posForm.value.deliveryDate,
      branch: posForm.value.branch,
      paymentTerms: posForm.value.paymentTerms,
      paymentMethod: posForm.value.paymentType,
      blNumber: posForm.value.blNumber || 'Consolidated Depot Stock',
      description: posForm.value.description,
      items,
      subtotal: computedSaleSubtotal.value,
      tax: computedSaleTaxTotal.value,
      discount: Number(posForm.value.discount || 0),
      grandTotal: computedSaleGrandTotal.value,
      totalAmount: computedSaleGrandTotal.value,
      paidAmount: Number(posForm.value.receivedAmount || 0),
      status: posForm.value.receivedAmount >= computedSaleGrandTotal.value ? 'Paid' : posForm.value.receivedAmount > 0 ? 'Partially Paid' : 'Unpaid'
    }, authStore.user)

    const cust = (dataStore.customers || []).find(c => c.name.toLowerCase() === posForm.value.customer.toLowerCase())
    if (cust) {
      cust.balance = calculatedFinalBalance.value
    }

    uiStore.closeSaleModal()
    uiStore.showModal(
      'Sale Invoice Updated',
      `Invoice ${editInvNo} for ${posForm.value.customer} updated successfully! (PKR ${computedSaleGrandTotal.value.toLocaleString()})`,
      'success'
    )
    return
  }

  const invoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const allSerialsUsed = saleRows.value.flatMap(it => it.serials || [])

  // Mark serials as sold in dataStore
  allSerialsUsed.forEach(sn => {
    const sObj = (dataStore.serials || []).find(s => s.serialCode === sn)
    if (sObj) {
      sObj.status = 'Sold'
      sObj.customer = posForm.value.customer
      sObj.invoiceNo = invoiceNo
      sObj.soldDate = posForm.value.deliveryDate
    }
  })

  // Format line items
  const items = saleRows.value.map(r => {
    const prod = (dataStore.products || []).find(p => p.id === r.productId)
    return {
      productId: r.productId,
      productName: prod ? prod.name : 'Medical Equipment',
      sku: prod ? prod.sku : 'MED',
      qty: Number(r.qty),
      serials: [...r.serials],
      unitPrice: Number(r.unitPrice),
      taxRatio: r.taxRate || 18,
      total: r.amount
    }
  })

  // Add invoice
  const newInvoice = {
    invoiceNo,
    customer: posForm.value.customer,
    date: posForm.value.deliveryDate,
    deliveryDate: posForm.value.deliveryDate,
    branch: posForm.value.branch,
    salesPerson: authStore.user?.name || 'Executive Officer',
    paymentTerms: posForm.value.paymentTerms,
    blNumber: posForm.value.blNumber || 'Consolidated Depot Stock',
    items,
    subtotal: computedSaleSubtotal.value,
    tax: computedSaleTaxTotal.value,
    discount: Number(posForm.value.discount || 0),
    totalAmount: computedSaleGrandTotal.value,
    paidAmount: Number(posForm.value.receivedAmount || 0),
    status: posForm.value.receivedAmount >= computedSaleGrandTotal.value ? 'Paid' : posForm.value.receivedAmount > 0 ? 'Partially Paid' : 'Unpaid'
  }
  dataStore.salesInvoices.unshift(newInvoice)

  // Update customer balance
  const cust = (dataStore.customers || []).find(c => c.name.toLowerCase() === posForm.value.customer.toLowerCase())
  if (cust) {
    cust.balance = calculatedFinalBalance.value
  }

  uiStore.showModal(
    'Invoice Saved Successfully',
    `Sales Invoice ${invoiceNo} generated for ${posForm.value.customer} (PKR ${computedSaleGrandTotal.value.toLocaleString()}) under ${posForm.value.branch} Depot.`,
    'success'
  )

  uiStore.closeSaleModal()
}

function handlePreviewInvoice() {
  uiStore.showModal(
    'Print & Share Invoice',
    `Invoice ready for printing / sharing with ${posForm.value.customer || 'Party'}. Total: PKR ${computedSaleGrandTotal.value.toLocaleString()}`,
    'info'
  )
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.5);
  border-radius: 4px;
}
</style>
