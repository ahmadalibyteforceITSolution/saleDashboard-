<template>
  <div v-if="uiStore.showGlobalSaleModal" class="modal-backdrop z-50 flex items-center justify-center p-2 sm:p-4" @click.self="uiStore.closeSaleModal">
    <div class="modal-content modal-pos-invoice max-w-5xl flex flex-col overflow-hidden shadow-2xl border border-slate-700 bg-[#0f172a] text-slate-100 rounded-xl" style="width: 94vw !important; max-width: 1220px !important; max-height: 94vh !important;">
      
      <!-- ══════════════════════════════════════════════════════════════
           MODAL TOP HEADER: Vyapar Desktop Sales Bar
      ══════════════════════════════════════════════════════════════ -->
      <div class="px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-1.5">
              <ShoppingCart :size="18" class="text-emerald-400" />
              <span>Sale / Invoice</span>
            </span>
            <!-- Order Type Selector Pills -->
            <div class="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] ml-2">
              <button
                type="button"
                @click="posForm.orderType = 'Invoice'"
                :class="['px-2.5 py-0.5 rounded font-bold transition-all', posForm.orderType === 'Invoice' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white']"
              >
                Invoice
              </button>
              <button
                type="button"
                @click="posForm.orderType = 'Quotation'"
                :class="['px-2.5 py-0.5 rounded font-bold transition-all', posForm.orderType === 'Quotation' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white']"
              >
                Quotation
              </button>
              <button
                type="button"
                @click="posForm.orderType = 'SalesOrder'"
                :class="['px-2.5 py-0.5 rounded font-bold transition-all', posForm.orderType === 'SalesOrder' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white']"
              >
                Order
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Balance Visibility Toggle -->
          <button
            type="button"
            @click="authStore.toggleBalance()"
            :class="[
              'btn btn-xs flex items-center gap-1 font-mono transition-all',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300' : 'btn-warning text-white'
            ]"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Reveal customer balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="12" />
            <Eye v-else :size="12" />
            <span>{{ authStore.isBalanceVisible ? 'Mask Balances' : 'Reveal Balances' }}</span>
          </button>

          <!-- Branch Selector (or Locked badge) -->
          <div class="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs">
            <span class="text-slate-400 font-medium">Sales Branch:</span>
            <span v-if="!authStore.isSuperAdmin" class="font-bold text-emerald-400 flex items-center gap-1">
              <span>📍 {{ authStore.userBranch || 'Lahore' }}</span>
              <span class="text-[10px] text-slate-500">(Locked)</span>
            </span>
            <select v-else v-model="posForm.branch" class="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer">
              <option value="Peshawar" class="bg-slate-900 text-white">Peshawar (HO)</option>
              <option value="Lahore" class="bg-slate-900 text-white">Lahore Branch</option>
              <option value="Multan" class="bg-slate-900 text-white">Multan Branch</option>
              <option value="Islamabad" class="bg-slate-900 text-white">Islamabad Branch</option>
              <option value="Karachi" class="bg-slate-900 text-white">Karachi Branch</option>
            </select>
          </div>

          <button @click="uiStore.closeSaleModal" class="btn btn-ghost text-slate-400 hover:text-white p-1 text-lg">✕</button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           METADATA HEADER: Customer Party, Payment Terms, Dates
      ══════════════════════════════════════════════════════════════ -->
      <div class="px-5 py-3 bg-slate-950/70 border-b border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs shrink-0">
        
        <!-- Customer / Party Select with + Add Party Button -->
        <div class="md:col-span-5">
          <div class="flex items-center justify-between mb-1">
            <label class="font-bold text-slate-300 block text-xs">Customer / Party Account *</label>
            <button
              type="button"
              @click="showAddPartyModal = true"
              class="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
              title="Add New Customer Party"
            >
              <Plus :size="12" />
              <span>Add Party</span>
            </button>
          </div>
          <select
            v-model="posForm.customer"
            required
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none cursor-pointer min-h-[36px]"
          >
            <option value="" disabled>Select Customer / Party Account...</option>
            <option v-for="c in filteredPosPartyList" :key="c.name" :value="c.name">
              {{ c.name }} ({{ c.category || 'REGULAR' }} — Bal: PKR {{ (c.balance || 0).toLocaleString() }})
            </option>
          </select>
        </div>

        <!-- Middle Col: Payment Terms & Delivery Date -->
        <div class="md:col-span-4 grid grid-cols-2 gap-2">
          <div>
            <label class="font-bold text-slate-300 mb-1 block">Payment Terms</label>
            <select
              v-model="posForm.paymentTerms"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-semibold focus:border-emerald-500 focus:outline-none"
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
            <label class="font-bold text-slate-300 mb-1 block">Delivery / Invoice Date *</label>
            <input
              v-model="posForm.deliveryDate"
              type="date"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Right Col: Origin BL Link -->
        <div class="md:col-span-3">
          <label class="font-bold text-slate-300 mb-1 block">Origin BL Consignment</label>
          <select
            v-model="posForm.blNumber"
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:border-emerald-500 focus:outline-none"
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
        <div class="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          <!-- ── FULL WIDTH ITEMS GRID TABLE (Vyapar Style) ── -->
          <div class="border border-slate-700/80 rounded-xl overflow-hidden bg-slate-900/90 shadow-md">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-950 text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-800">
                    <th class="py-2.5 px-3 w-10 text-center">#</th>
                    <th class="py-2.5 px-3 min-w-[280px]">ITEM / EQUIPMENT PRODUCT</th>
                    <th class="py-2.5 px-3 w-44 text-center">SERIAL NUM</th>
                    <th class="py-2.5 px-3 w-28 text-center">QTY</th>
                    <th class="py-2.5 px-3 min-w-[150px]">
                      <div class="flex items-center justify-between">
                        <span>PRICE / UNIT</span>
                        <span class="text-[9px] text-slate-400 font-mono">Without Tax</span>
                      </div>
                    </th>
                    <th class="py-2.5 px-3 w-32 text-center">TAX (%)</th>
                    <th class="py-2.5 px-3 w-36 text-right">AMOUNT (PKR)</th>
                    <th class="py-2.5 px-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  <tr
                    v-for="(row, index) in saleRows"
                    :key="row.id"
                    class="hover:bg-slate-800/40 transition-colors"
                  >
                    <!-- Index -->
                    <td class="py-2 px-3 text-center text-slate-400 font-mono font-bold">{{ index + 1 }}</td>

                    <!-- Product Selector -->
                    <td class="py-2 px-3">
                      <select
                        v-model="row.productId"
                        @change="onSaleProductSelect(row)"
                        required
                        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="" disabled>Select Equipment Item / SKU...</option>
                        <option v-for="p in branchProducts" :key="p.id" :value="p.id">
                          {{ p.name }} ({{ p.sku }}) — PKR {{ (p.sellingPrice || p.costPrice || 0).toLocaleString() }}
                        </option>
                      </select>
                    </td>

                    <!-- SERIAL NO Trigger Button (Opens Vyapar Modal) -->
                    <td class="py-2 px-3 text-center">
                      <button
                        type="button"
                        @click="openSaleSerialModal(index)"
                        class="px-2.5 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 font-mono text-xs font-bold transition-all w-full cursor-pointer"
                        :class="[
                          row.serials.length === row.qty && row.qty > 0
                            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-slate-950 border-slate-700 text-teal-400 hover:border-emerald-500 hover:text-emerald-300'
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
                        class="w-20 text-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-bold text-xs focus:border-emerald-500 focus:outline-none"
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
                        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </td>

                    <!-- TAX (%) -->
                    <td class="py-2 px-3 text-center">
                      <select
                        v-model.number="row.taxRate"
                        @change="calculateSaleRow(row)"
                        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-semibold text-xs focus:border-emerald-500 focus:outline-none"
                      >
                        <option :value="0">NONE (0%)</option>
                        <option :value="18">18% HSN</option>
                        <option :value="5">5% Custom</option>
                      </select>
                    </td>

                    <!-- AMOUNT -->
                    <td class="py-2 px-3 text-right font-mono font-bold text-emerald-400 text-xs">
                      PKR {{ (row.amount || 0).toLocaleString() }}
                    </td>

                    <!-- Action -->
                    <td class="py-2 px-3 text-center">
                      <button
                        v-if="saleRows.length > 1"
                        type="button"
                        @click="removeSaleRow(index)"
                        class="text-red-400 hover:text-red-300 p-1 font-bold rounded hover:bg-red-950/40"
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
            <div class="p-3 bg-slate-950 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                @click="addSaleRow"
                class="btn btn-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-slate-700 flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg"
              >
                <Plus :size="13" />
                <span>ADD ROW</span>
              </button>

              <div class="flex items-center gap-4 text-xs font-bold">
                <span class="text-slate-400 uppercase tracking-wider">TOTAL UNITS: {{ totalSaleUnits }}</span>
                <span class="text-slate-300">SUBTOTAL: <span class="font-mono text-white text-sm">PKR {{ computedSaleSubtotal.toLocaleString() }}</span></span>
              </div>
            </div>
          </div>

          <!-- ── BOTTOM PANEL: Ledger Reconciliation & Financial Summary ── -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <!-- LEFT COLUMN (7 Cols): Customer Ledger Reconciliation & Notes -->
            <div class="lg:col-span-7 space-y-3">
              
              <!-- Customer Ledger Reconciliation Card -->
              <div class="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3 shadow-md">
                <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Receipt :size="14" />
                    <span>Customer Ledger Balance Reconciliation</span>
                  </span>
                  <span class="text-slate-400 font-mono text-[11px]">Party: {{ posForm.customer || 'Select Party' }}</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
                  <div class="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block">Previous Balance</span>
                    <span class="text-xs font-bold text-white block mt-0.5">PKR {{ (selectedPosCustomerObj?.balance || 0).toLocaleString() }}</span>
                  </div>
                  <div class="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-blue-400 block">(+) This Invoice</span>
                    <span class="text-xs font-bold text-blue-300 block mt-0.5">PKR {{ computedSaleGrandTotal.toLocaleString() }}</span>
                  </div>
                  <div class="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-emerald-400 block">(-) Received</span>
                    <span class="text-xs font-bold text-emerald-300 block mt-0.5">PKR {{ Number(posForm.receivedAmount || 0).toLocaleString() }}</span>
                  </div>
                  <div class="p-2.5 bg-amber-950/60 rounded-lg border border-amber-500/40">
                    <span class="text-[10px] uppercase font-bold text-amber-300 block">Total Outstanding</span>
                    <span class="text-xs font-black text-amber-400 block mt-0.5">PKR {{ calculatedFinalBalance.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Type & Description -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-slate-900/90 rounded-xl border border-slate-800 p-3">
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="text-slate-400 font-bold text-xs">Payment Mode</label>
                    <button
                      type="button"
                      @click="showAddSalePaymentMethodModal = true"
                      class="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
                      title="Add Custom Payment Method"
                    >
                      <Plus :size="12" />
                      <span>Add Method</span>
                    </button>
                  </div>
                  <select
                    v-model="posForm.paymentType"
                    class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option v-for="m in paymentMethodsList" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
                <div class="bg-slate-900/90 rounded-xl border border-slate-800 p-3">
                  <label class="text-slate-400 block mb-1.5 font-bold text-xs">Notes / Invoice Terms</label>
                  <input
                    v-model="posForm.description"
                    type="text"
                    placeholder="Enter warranty notes, delivery details..."
                    class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN (5 Cols): Vyapar Financial Summary -->
            <div class="lg:col-span-5 bg-slate-900/95 rounded-xl border border-slate-800 p-4 space-y-2.5 shadow-md flex flex-col justify-between">
              <div class="space-y-2">
                <!-- Subtotal -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <span class="text-slate-400 font-bold">Subtotal</span>
                  <span class="font-mono font-bold text-white">PKR {{ computedSaleSubtotal.toLocaleString() }}</span>
                </div>

                <!-- Discount -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <span class="text-slate-400">Discount (PKR)</span>
                  <input
                    v-model.number="posForm.discount"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-28 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <!-- Tax -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <span class="text-slate-400">Sales Tax (18% HSN)</span>
                  <span class="font-mono text-amber-300 font-bold">+ PKR {{ computedSaleTaxTotal.toLocaleString() }}</span>
                </div>

                <!-- Round Off -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <label class="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                    <input type="checkbox" v-model="posForm.roundOff" class="rounded border-slate-700" />
                    <span>Round Off</span>
                  </label>
                  <span class="font-mono text-slate-400">PKR {{ computedSaleRoundOffAmount }}</span>
                </div>

                <!-- TOTAL -->
                <div class="p-3 bg-slate-950 rounded-lg border border-emerald-500/40 flex items-center justify-between">
                  <span class="font-black uppercase tracking-wider text-xs text-emerald-400">Total Invoice Amount</span>
                  <span class="font-mono font-black text-lg sm:text-xl text-emerald-400">PKR {{ computedSaleGrandTotal.toLocaleString() }}</span>
                </div>

                <!-- Received -->
                <div class="flex items-center justify-between text-xs py-1 pt-2">
                  <span class="text-slate-300 font-bold">Received (PKR)</span>
                  <input
                    v-model.number="posForm.receivedAmount"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-36 text-right bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <!-- Balance Due -->
                <div class="flex items-center justify-between text-xs py-2 px-3 bg-amber-950/30 rounded-lg border border-amber-500/30">
                  <span class="font-bold text-amber-300 uppercase tracking-wider">Balance Due</span>
                  <span class="font-mono font-black text-sm text-amber-400">PKR {{ computedSaleBalanceDue.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════
             FOOTER ACTIONS: Close, Share, Save (Vyapar Desktop Style)
        ══════════════════════════════════════════════════════════════ -->
        <div class="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            @click="uiStore.closeSaleModal"
            class="btn btn-ghost text-slate-400 hover:text-white font-bold text-xs px-4 py-2"
          >
            Cancel
          </button>

          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="handlePreviewInvoice"
              class="btn btn-secondary text-xs font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <span>Share / Print</span>
              <ChevronDown :size="13" />
            </button>

            <button
              type="submit"
              class="btn btn-primary bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle :size="16" />
              <span>Save & Dispatch Invoice</span>
            </button>
          </div>
        </div>
      </form>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: Dedicated Sale Serial Number Modal (Exact Image Layout)
      ══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <div
          v-if="showSaleSerialModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="background-color: rgba(0, 0, 0, 0.78) !important; backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important; width: 100vw !important; height: 100vh !important;"
          @click.self="closeSaleSerialModal"
        >
          <div
            class="w-full max-w-lg border border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100 animate-in zoom-in-95 duration-150 relative z-20"
            style="background-color: #0f172a !important; opacity: 1 !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.95) !important;"
          >
            
            <!-- Serial Modal Header -->
            <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="text-base font-black text-white leading-tight">Sale Item - SERIAL NUM</h3>
                <p class="text-xs text-emerald-400 font-bold mt-0.5 uppercase tracking-wide truncate max-w-xs">
                  {{ activeSaleProductName || 'Equipment Product' }}
                </p>
              </div>
              <button @click="closeSaleSerialModal" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <!-- Serial Modal Body -->
            <div class="p-6 overflow-y-auto space-y-4 text-xs" style="background-color: #0f172a !important;">
              
              <!-- Enter SERIAL NUM Input Box with Blue Check Button and Counter -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between font-bold text-slate-300">
                  <span>Enter SERIAL NUM:</span>
                  <span class="font-mono text-emerald-300 font-black">{{ activeSaleRow?.serials.length }}/{{ activeSaleRow?.qty || 1 }} Entered</span>
                </div>

                <div class="flex items-center gap-2">
                  <input
                    v-model="newSaleSerialInputText"
                    type="text"
                    placeholder="Enter/Scan"
                    @keyup.enter="commitSaleSerialSearch"
                    class="flex-1 rounded-lg px-3 py-2.5 text-white font-mono font-bold text-xs focus:border-blue-500 focus:outline-none"
                    style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                  />
                  <button
                    type="button"
                    @click="commitSaleSerialSearch"
                    class="w-10 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold shadow-md cursor-pointer shrink-0"
                    title="Select Serial"
                  >
                    <Check :size="18" />
                  </button>
                </div>
              </div>

              <!-- Checkbox List of Available In-Stock Serials (Matching User Screenshot) -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Available Serials in {{ posForm.branch }}</span>
                  <span class="text-teal-400">{{ availableSerialsForActiveRow.length }} In Stock</span>
                </div>

                <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  <div
                    v-for="s in availableSerialsForActiveRow"
                    :key="s.serialCode"
                    class="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 hover:border-blue-500/60 transition-colors"
                    style="background-color: #1e293b !important;"
                  >
                    <label class="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        :checked="activeSaleRow?.serials.includes(s.serialCode)"
                        @change="toggleSaleSerial(s.serialCode)"
                        class="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
                      />
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="font-mono font-bold text-white text-xs truncate">{{ s.serialCode }}</span>
                        <span v-if="s.machineCode" class="badge badge-purple text-[9px] py-0 px-1 font-mono">{{ s.machineCode }}</span>
                      </div>
                    </label>

                    <span class="badge badge-success text-[9px] py-0 px-1 font-mono">Available</span>
                  </div>

                  <div v-if="availableSerialsForActiveRow.length === 0" class="p-6 text-center text-slate-400 italic bg-slate-950/60 rounded-lg border border-dashed border-slate-800">
                    No available serial numbers found in {{ posForm.branch }} warehouse for this product.
                  </div>
                </div>
              </div>
            </div>

            <!-- Serial Modal Footer -->
            <div class="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                @click="closeSaleSerialModal"
                class="btn btn-secondary text-xs font-bold px-4 py-2"
              >
                Close
              </button>
              <button
                type="button"
                @click="saveSaleSerialModal"
                class="btn btn-primary bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: + Add New Party Modal (Exact Matching Image Layout)
      ══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <div
          v-if="showAddPartyModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="background-color: rgba(0, 0, 0, 0.78) !important; backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important; width: 100vw !important; height: 100vh !important;"
          @click.self="showAddPartyModal = false"
        >
          <div
            class="w-full max-w-lg border border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col text-slate-100 animate-in zoom-in-95 duration-150 relative z-20"
            style="background-color: #0f172a !important; opacity: 1 !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.95) !important;"
          >
            
            <!-- Modal Header -->
            <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2 text-white font-black text-sm">
                <UserPlus :size="17" class="text-emerald-400" />
                <span>Add New Party</span>
              </div>
              <button type="button" @click="showAddPartyModal = false" class="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-4 text-xs" style="background-color: #0f172a !important;">
              
              <!-- PARTY NAME * -->
              <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Party Name *</label>
                <input
                  v-model="newParty.name"
                  type="text"
                  placeholder="e.g. HOSPITEX RAWALPINDI"
                  class="w-full rounded-lg px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none placeholder:text-slate-500"
                  style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                />
              </div>

              <!-- PARTY TYPE & BRANCH / CITY -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Party Type</label>
                  <select
                    v-model="newParty.type"
                    class="w-full rounded-lg px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none cursor-pointer"
                    style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                  >
                    <option value="Customer (Debtor)">Customer (Debtor)</option>
                    <option value="Supplier / Exporter (Creditor)">Supplier / Exporter (Creditor)</option>
                    <option value="OEM Manufacturer">OEM Manufacturer</option>
                    <option value="Local Vendor">Local Vendor</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Branch / City</label>
                  <select
                    v-model="newParty.branch"
                    class="w-full rounded-lg px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none cursor-pointer"
                    style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
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
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input
                    v-model="newParty.phone"
                    type="text"
                    placeholder="+92 300 1234567"
                    class="w-full rounded-lg px-3.5 py-2.5 text-white font-mono font-medium text-xs focus:outline-none placeholder:text-slate-500"
                    style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    v-model="newParty.email"
                    type="email"
                    placeholder="accounts@clinic.com"
                    class="w-full rounded-lg px-3.5 py-2.5 text-white font-mono font-medium text-xs focus:outline-none placeholder:text-slate-500"
                    style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                  />
                </div>
              </div>

              <!-- CREDIT LIMIT & OPENING BALANCE -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Credit Limit (PKR)</label>
                  <input
                    v-model.number="newParty.baseCreditLimit"
                    type="number"
                    placeholder="1000000"
                    class="w-full rounded-lg px-3.5 py-2.5 text-white font-mono font-bold text-xs focus:outline-none placeholder:text-slate-500"
                    style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Opening Balance (PKR)</label>
                  <input
                    v-model.number="newParty.openingBalance"
                    type="number"
                    placeholder="0"
                    class="w-full rounded-lg px-3.5 py-2.5 text-white font-mono font-bold text-xs focus:outline-none placeholder:text-slate-500"
                    style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                  />
                </div>
              </div>

              <!-- ADDRESS / NOTES -->
              <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Address / Notes</label>
                <textarea
                  v-model="newParty.address"
                  rows="2"
                  placeholder="Full clinic address..."
                  class="w-full rounded-lg px-3.5 py-2 text-white text-xs focus:outline-none placeholder:text-slate-500 resize-none"
                  style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                ></textarea>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="showAddPartyModal = false"
                class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
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
          class="fixed inset-0 z-[9999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="background-color: rgba(0, 0, 0, 0.78) !important; backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important; width: 100vw !important; height: 100vh !important;"
          @click.self="showAddSalePaymentMethodModal = false"
        >
          <div
            class="w-full max-w-md border border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col text-slate-100 animate-in zoom-in-95 duration-150 relative z-20"
            style="background-color: #0f172a !important; opacity: 1 !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.95) !important;"
          >
            
            <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2 text-white font-black text-sm">
                <CreditCard :size="17" class="text-emerald-400" />
                <span>Add Payment Method</span>
              </div>
              <button type="button" @click="showAddSalePaymentMethodModal = false" class="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div class="p-6 space-y-4 text-xs" style="background-color: #0f172a !important;">
              <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Payment Method Name *</label>
                <input
                  v-model="newSalePaymentMethodName"
                  type="text"
                  placeholder="e.g. Meezan Bank (Sales A/C 9901) or EasyPaisa"
                  @keyup.enter="handleSaveSalePaymentMethod"
                  class="w-full rounded-lg px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none placeholder:text-slate-500"
                  style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                />
              </div>

              <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Method Type / Channel</label>
                <select
                  v-model="newSalePaymentMethodType"
                  class="w-full rounded-lg px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none cursor-pointer"
                  style="background-color: #1e293b !important; color: #ffffff !important; border: 1px solid #334155 !important;"
                >
                  <option value="Bank Account">Bank Account / Direct Transfer</option>
                  <option value="Cash Counter">Cash Counter / Till</option>
                  <option value="Digital Wallet">Digital Wallet (JazzCash / EasyPaisa / Raast)</option>
                  <option value="Cheque / Pay Order">Cheque / Pay Order</option>
                  <option value="Credit Terms">Customer Credit Terms</option>
                </select>
              </div>
            </div>

            <div class="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="showAddSalePaymentMethodModal = false"
                class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
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
  CreditCard
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const isPosCustomerDropdownOpen = ref(false)
const posPartySearchQuery = ref('')
const showAddPartyModal = ref(false)

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
  branch: authStore.userBranch || 'Lahore',
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
  branch: authStore.userBranch || 'Peshawar',
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
    const currentBranch = authStore.userBranch || (dataStore.activeBranchFilter && dataStore.activeBranchFilter !== 'All' ? dataStore.activeBranchFilter : 'Lahore')
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
    isPosCustomerDropdownOpen.value = false
    posPartySearchQuery.value = ''
  }
})

const branchProducts = computed(() => {
  const branch = (posForm.value.branch || authStore.userBranch || 'Lahore').toLowerCase()
  return (dataStore.products || []).filter(p => {
    const alloc = String(p.allocationCity || '').toLowerCase()
    return alloc.includes(branch) || branch.includes(alloc) || authStore.isSuperAdmin
  })
})

const filteredPosPartyList = computed(() => {
  let list = dataStore.customers || []
  if (!authStore.isSuperAdmin) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    list = list.filter(c => (c.branch || '').toLowerCase().includes(userCity))
  }
  if (posPartySearchQuery.value.trim()) {
    const q = posPartySearchQuery.value.toLowerCase().trim()
    list = list.filter(c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)) || (c.branch && c.branch.toLowerCase().includes(q)))
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
  const created = {
    id: `cust_${Date.now()}`,
    name: partyName,
    type: newParty.value.type || 'Customer (Debtor)',
    phone: newParty.value.phone || '',
    email: newParty.value.email || '',
    branch: newParty.value.branch || authStore.userBranch || 'Peshawar',
    category: newParty.value.type?.includes('Creditor') || newParty.value.type?.includes('Supplier') ? 'SUPPLIER' : 'REGULAR',
    baseCreditLimit: Number(newParty.value.baseCreditLimit || 1000000),
    creditLimit: Number(newParty.value.baseCreditLimit || 1000000),
    balance: Number(newParty.value.openingBalance || 0),
    openingBalance: Number(newParty.value.openingBalance || 0),
    address: newParty.value.address || ''
  }
  dataStore.customers.unshift(created)
  dataStore.saveState()
  posForm.value.customer = created.name
  showAddPartyModal.value = false
  uiStore.showToast(`Party "${partyName}" registered and selected!`, 'success')
  newParty.value = {
    name: '',
    type: 'Customer (Debtor)',
    branch: posForm.value.branch || 'Peshawar',
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
  const branch = (posForm.value.branch || authStore.userBranch || 'Lahore').toLowerCase()
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
  const q = newSaleSerialInputText.value.trim().toLowerCase()
  if (!q) return
  const match = availableSerialsForActiveRow.value.find(s =>
    s.serialCode.toLowerCase().includes(q) ||
    (s.machineCode && s.machineCode.toLowerCase().includes(q))
  )
  if (match) {
    toggleSaleSerial(match.serialCode)
    newSaleSerialInputText.value = ''
  } else {
    uiStore.showModal('Serial Not In Stock', `Serial "${newSaleSerialInputText.value}" is not available in ${posForm.value.branch} warehouse.`, 'warning')
  }
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
