<template>
  <div v-if="uiStore.showGlobalPurchaseModal" class="modal-backdrop z-50 flex items-center justify-center p-2 sm:p-4" @click.self="uiStore.closePurchaseModal">
    <div class="modal-content modal-pos-invoice max-w-5xl flex flex-col overflow-hidden shadow-2xl border border-slate-700 bg-[#0f172a] text-slate-100 rounded-xl" style="width: 94vw !important; max-width: 1220px !important; max-height: 94vh !important;">
      
      <!-- ══════════════════════════════════════════════════════════════
           MODAL TOP HEADER: Vyapar Desktop Invoice Bar
      ══════════════════════════════════════════════════════════════ -->
      <div class="px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-1.5">
              <Anchor :size="18" class="text-teal-400" />
              <span>Purchase / Bill of Lading (BL)</span>
            </span>
            <span class="badge badge-info text-[10px] font-mono py-0.5 px-2">IMPORT & INVENTORY</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Branch Selector (or Locked badge) -->
          <div class="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs">
            <span class="text-slate-400 font-medium">Warehouse:</span>
            <span v-if="!authStore.isSuperAdmin" class="font-bold text-teal-400 flex items-center gap-1">
              <span>📍 {{ authStore.userBranch || 'Lahore' }}</span>
              <span class="text-[10px] text-slate-500">(Locked)</span>
            </span>
            <select v-else v-model="form.branch" class="bg-transparent text-teal-300 font-bold focus:outline-none cursor-pointer">
              <option value="Peshawar" class="bg-slate-900 text-white">Peshawar HO</option>
              <option value="Lahore" class="bg-slate-900 text-white">Lahore Branch</option>
              <option value="Multan" class="bg-slate-900 text-white">Multan Branch</option>
              <option value="Islamabad" class="bg-slate-900 text-white">Islamabad Branch</option>
              <option value="Karachi" class="bg-slate-900 text-white">Karachi Branch</option>
            </select>
          </div>

          <button @click="uiStore.closePurchaseModal" class="btn btn-ghost text-slate-400 hover:text-white p-1 text-lg">✕</button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           METADATA HEADER: Party Selection, Payment Terms, Dates, BL No
      ══════════════════════════════════════════════════════════════ -->
      <div class="px-5 py-3 bg-slate-950/70 border-b border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs shrink-0">
        
        <!-- Left Col: Supplier / Party Select with + Add Party Button -->
        <div class="md:col-span-5">
          <label class="font-bold text-slate-300 mb-1 block">Supplier / Exporter Party *</label>
          <div class="flex items-center gap-2">
            <select
              v-model="form.supplier"
              required
              class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs focus:border-teal-500 focus:outline-none cursor-pointer min-h-[36px]"
            >
              <option value="" disabled>Select Supplier / Exporter Party...</option>
              <option v-for="s in allSuppliers" :key="s.name" :value="s.name">
                {{ s.name }} ({{ s.type || 'Supplier' }} — {{ s.branch || 'Global' }})
              </option>
            </select>
            <button
              type="button"
              @click="showAddSupplierModal = true"
              class="btn btn-xs bg-teal-700 hover:bg-teal-600 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer min-h-[36px]"
            >
              <Plus :size="13" />
              <span>+ Add Party</span>
            </button>
          </div>
        </div>

        <!-- Middle Col: BL Number & Origin Port -->
        <div class="md:col-span-4 grid grid-cols-2 gap-2">
          <div>
            <label class="font-bold text-slate-300 mb-1 block">Bill / BL No *</label>
            <input
              v-model="form.blNumber"
              type="text"
              required
              placeholder="e.g. BL-MED-2026-04"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="font-bold text-slate-300 mb-1 block">Shipment / Port</label>
            <input
              v-model="form.shipmentDetails"
              type="text"
              placeholder="e.g. MAERSK 40ft / Karachi"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Right Col: Payment Terms & Bill Date -->
        <div class="md:col-span-3 grid grid-cols-2 gap-2">
          <div>
            <label class="font-bold text-slate-300 mb-1 block">Payment Terms</label>
            <select
              v-model="form.paymentTerms"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-semibold focus:border-teal-500 focus:outline-none"
            >
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Net 15">Net 15 Days</option>
              <option value="Net 30">Net 30 Days</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Import LC">Import LC (Bank)</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-300 mb-1 block">Bill / Due Date *</label>
            <input
              v-model="form.blDate"
              type="date"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-bold focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           MAIN BODY (SCROLLABLE): Full Width Items Grid & Calculations
      ══════════════════════════════════════════════════════════════ -->
      <form @submit.prevent="handleCreateBL" class="flex flex-col flex-1 overflow-hidden m-0">
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
                    v-for="(row, index) in rows"
                    :key="row.id"
                    class="hover:bg-slate-800/40 transition-colors"
                  >
                    <!-- Column 1: Row Index -->
                    <td class="py-2 px-3 text-center text-slate-400 font-mono font-bold">{{ index + 1 }}</td>

                    <!-- Column 2: Item Name / SKU Selector + Scan Barcode & Add New Part Inline -->
                    <td class="py-2 px-3">
                      <div class="space-y-1.5">
                        <!-- Mode Selector (Existing SKU vs New Part) -->
                        <div class="flex items-center gap-2">
                          <div v-if="!row.isNewPart" class="flex-1">
                            <select
                              v-model="row.productId"
                              @change="onProductSelect(row)"
                              required
                              class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-teal-500 focus:outline-none"
                            >
                              <option value="" disabled>Select Equipment Item / SKU...</option>
                              <option v-for="p in dataStore.products" :key="p.id" :value="p.id">
                                {{ p.name }} ({{ p.sku }}) — Standard Cost: PKR {{ (p.costPrice || 0).toLocaleString() }}
                              </option>
                            </select>
                          </div>

                          <!-- If inline New Part mode is activated for this row -->
                          <div v-else class="flex-1 grid grid-cols-2 gap-2">
                            <input
                              v-model="row.newPartName"
                              type="text"
                              placeholder="New Part / Equipment Name"
                              class="bg-slate-950 border border-amber-500/60 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none"
                            />
                            <input
                              v-model="row.newPartSku"
                              type="text"
                              placeholder="SKU Code (e.g. PRB-US12)"
                              class="bg-slate-950 border border-amber-500/60 rounded-lg px-2.5 py-1.5 text-white font-mono uppercase font-bold text-xs focus:outline-none"
                            />
                          </div>

                          <!-- Action Toggles: Scan Barcode & Toggle New Part -->
                          <div class="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              @click="openProductBarcodeScan(index)"
                              class="btn btn-xs bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-bold flex items-center gap-1"
                              title="Scan Product Barcode"
                            >
                              <QrCode :size="12" />
                              <span class="hidden sm:inline">Scan</span>
                            </button>
                            <button
                              type="button"
                              @click="row.isNewPart = !row.isNewPart"
                              :class="[
                                'btn btn-xs font-bold border transition-colors',
                                row.isNewPart ? 'bg-amber-900/80 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                              ]"
                              :title="row.isNewPart ? 'Switch to Existing SKU' : 'Add New Equipment Part'"
                            >
                              {{ row.isNewPart ? '📦 Existing' : '+ New Part' }}
                            </button>
                          </div>
                        </div>

                        <!-- Barcode Scanner Input for Row -->
                        <div v-if="row.showBarcodeScan" class="p-2 bg-indigo-950/60 rounded-lg border border-indigo-500/60 flex items-center gap-2">
                          <input
                            v-model="row.barcodeScanText"
                            type="text"
                            placeholder="Scan or enter Barcode / SKU / HSN..."
                            @keyup.enter="handleRowBarcodeScan(row)"
                            class="flex-1 bg-slate-950 border border-indigo-400 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                          <button
                            type="button"
                            @click="handleRowBarcodeScan(row)"
                            class="btn btn-xs btn-primary font-bold"
                          >
                            Lookup
                          </button>
                          <button
                            type="button"
                            @click="row.showBarcodeScan = false"
                            class="text-slate-400 hover:text-white text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </td>

                    <!-- Column 3: SERIAL NO Trigger Button (Opens Vyapar-style Modal) -->
                    <td class="py-2 px-3 text-center">
                      <button
                        type="button"
                        @click="openSerialModal(index)"
                        class="px-2.5 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 font-mono text-xs font-bold transition-all w-full cursor-pointer"
                        :class="[
                          row.serials.length >= row.qty && row.qty > 0
                            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-slate-950 border-slate-700 text-teal-400 hover:border-teal-500 hover:text-teal-300'
                        ]"
                      >
                        <!-- 1 2 3 Icon -->
                        <span class="flex items-center gap-0.5 text-[10px] tracking-tighter opacity-80">
                          <span>1</span><span>2</span><span>3</span><span class="font-sans">≡</span>
                        </span>
                        <span>{{ row.serials.length }} / {{ row.qty }} Serials</span>
                      </button>
                    </td>

                    <!-- Column 4: QTY -->
                    <td class="py-2 px-3 text-center">
                      <input
                        v-model.number="row.qty"
                        type="number"
                        min="1"
                        max="1000"
                        required
                        @input="onQtyChange(row)"
                        class="w-20 text-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-bold text-xs focus:border-teal-500 focus:outline-none"
                      />
                    </td>

                    <!-- Column 5: PRICE / UNIT -->
                    <td class="py-2 px-3">
                      <input
                        v-model.number="row.unitPrice"
                        type="number"
                        min="0"
                        required
                        @input="calculateRow(row)"
                        placeholder="PKR 0"
                        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-xs focus:border-teal-500 focus:outline-none"
                      />
                    </td>

                    <!-- Column 6: TAX (%) -->
                    <td class="py-2 px-3 text-center">
                      <select
                        v-model.number="row.taxRate"
                        @change="calculateRow(row)"
                        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-semibold text-xs focus:border-teal-500 focus:outline-none"
                      >
                        <option :value="0">NONE (0%)</option>
                        <option :value="18">18% HSN</option>
                        <option :value="5">5% Custom</option>
                        <option :value="10">10% Tariff</option>
                      </select>
                    </td>

                    <!-- Column 7: ROW AMOUNT -->
                    <td class="py-2 px-3 text-right font-mono font-bold text-emerald-400 text-xs">
                      PKR {{ (row.amount || 0).toLocaleString() }}
                    </td>

                    <!-- Column 8: Delete Row Button -->
                    <td class="py-2 px-3 text-center">
                      <button
                        v-if="rows.length > 1"
                        type="button"
                        @click="removeRow(index)"
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

            <!-- Table Footer: + Add Row Button and Subtotal -->
            <div class="p-3 bg-slate-950 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                @click="addRow"
                class="btn btn-xs bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold border border-slate-700 flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg"
              >
                <Plus :size="13" />
                <span>+ ADD ROW</span>
              </button>

              <div class="flex items-center gap-4 text-xs font-bold">
                <span class="text-slate-400 uppercase tracking-wider">TOTAL ITEMS: {{ totalItemsCount }}</span>
                <span class="text-slate-300">SUBTOTAL: <span class="font-mono text-white text-sm">PKR {{ computedSubtotal.toLocaleString() }}</span></span>
              </div>
            </div>
          </div>

          <!-- ── BOTTOM PANEL: Left Inbound Details & Right Financial Summary ── -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <!-- LEFT COLUMN (7 Cols): Payment Type, Inbound Expenses Breakdown, Description -->
            <div class="lg:col-span-7 space-y-3">
              
              <!-- Direct & Indirect Expenses Tabs / Accordion -->
              <div class="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3 shadow-md">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span class="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Truck :size="14" class="text-blue-400" />
                    <span>Inbound Landed Cost Expenditures</span>
                  </span>
                  <div class="flex items-center gap-2 font-mono text-[11px]">
                    <span class="badge badge-info font-bold">Direct: PKR {{ computedDirectExpenses.toLocaleString() }}</span>
                    <span class="badge badge-purple font-bold">Indirect: PKR {{ computedIndirectExpenses.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- Direct Inbound Expenses Fields -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label class="text-slate-400 block mb-1">Customs Duty & Tariffs</label>
                    <input
                      v-model.number="form.directCustomsDuty"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label class="text-slate-400 block mb-1">Freight & Port Clearance</label>
                    <input
                      v-model.number="form.directFreightPort"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label class="text-slate-400 block mb-1">Demurrage / Landing</label>
                    <input
                      v-model.number="form.directDemurrageLanding"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <!-- Indirect Operating & Overhead Expenses Fields -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800/60">
                  <div>
                    <label class="text-slate-400 block mb-1">Inland Transportation</label>
                    <input
                      v-model.number="form.indirectTransportation"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-purple-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label class="text-slate-400 block mb-1">Marine Transit Insurance</label>
                    <input
                      v-model.number="form.indirectInsurance"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-purple-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label class="text-slate-400 block mb-1">Warehousing & Misc</label>
                    <input
                      v-model.number="form.indirectWarehousingMisc"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-purple-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <!-- Live Landed Cost Unit Metrics Bar -->
                <div class="p-2.5 bg-slate-950 rounded-lg border border-teal-500/30 flex items-center justify-between text-xs font-mono">
                  <span class="text-slate-400">Total Landed Cost: <span class="text-white font-bold">PKR {{ computedTotalLandedCost.toLocaleString() }}</span></span>
                  <span class="text-teal-400 font-bold">Landed Cost / Unit: PKR {{ computedLandedCostPerUnit.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Payment Type & Description -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-slate-900/90 rounded-xl border border-slate-800 p-3">
                  <label class="text-slate-400 block mb-1 font-bold">Payment Type</label>
                  <select
                    v-model="form.paymentType"
                    class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold focus:border-teal-500 focus:outline-none"
                  >
                    <option value="Cash">Cash Payment</option>
                    <option value="Bank Transfer">Bank Transfer (Meezan / HBL)</option>
                    <option value="Cheque">Cheque / Pay Order</option>
                    <option value="Credit / LC">Credit / Import Letter of Credit</option>
                  </select>
                </div>
                <div class="bg-slate-900/90 rounded-xl border border-slate-800 p-3">
                  <label class="text-slate-400 block mb-1 font-bold">Inbound Notes / Description</label>
                  <input
                    v-model="form.description"
                    type="text"
                    placeholder="Enter vessel notes, container seal #, etc."
                    class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN (5 Cols): Vyapar Financial Summary & Balance Matrix -->
            <div class="lg:col-span-5 bg-slate-900/95 rounded-xl border border-slate-800 p-4 space-y-2.5 shadow-md flex flex-col justify-between">
              <div class="space-y-2">
                <!-- Subtotal Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <span class="text-slate-400 font-bold">Subtotal (Base Value)</span>
                  <span class="font-mono font-bold text-white">PKR {{ computedSubtotal.toLocaleString() }}</span>
                </div>

                <!-- Discount Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <span class="text-slate-400">Discount (PKR)</span>
                  <input
                    v-model.number="form.discount"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-28 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <!-- Total Direct & Indirect Inbound Expenses Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <span class="text-slate-400">Inbound Landing Expenses</span>
                  <span class="font-mono text-blue-300 font-bold">+ PKR {{ (computedDirectExpenses + computedIndirectExpenses).toLocaleString() }}</span>
                </div>

                <!-- Total Tax Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <span class="text-slate-400">Total Tax / HSN</span>
                  <span class="font-mono text-amber-300 font-bold">+ PKR {{ computedTaxTotal.toLocaleString() }}</span>
                </div>

                <!-- Round Off Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                  <label class="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                    <input type="checkbox" v-model="form.roundOff" class="rounded border-slate-700" />
                    <span>Round Off</span>
                  </label>
                  <span class="font-mono text-slate-400">PKR {{ computedRoundOffAmount }}</span>
                </div>

                <!-- GRAND TOTAL -->
                <div class="p-3 bg-slate-950 rounded-lg border border-teal-500/40 flex items-center justify-between">
                  <span class="font-black uppercase tracking-wider text-xs text-teal-400">Total Bill Amount</span>
                  <span class="font-mono font-black text-lg sm:text-xl text-emerald-400">PKR {{ computedGrandTotal.toLocaleString() }}</span>
                </div>

                <!-- Paid Amount Field -->
                <div class="flex items-center justify-between text-xs py-1 pt-2">
                  <span class="text-slate-300 font-bold">Paid / Advance (PKR)</span>
                  <input
                    v-model.number="form.paidAmount"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-36 text-right bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <!-- Balance Due -->
                <div class="flex items-center justify-between text-xs py-2 px-3 bg-amber-950/30 rounded-lg border border-amber-500/30">
                  <span class="font-bold text-amber-300 uppercase tracking-wider">Balance Due</span>
                  <span class="font-mono font-black text-sm text-amber-400">PKR {{ computedBalanceDue.toLocaleString() }}</span>
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
            @click="uiStore.closePurchaseModal"
            class="btn btn-ghost text-slate-400 hover:text-white font-bold text-xs px-4 py-2"
          >
            Cancel
          </button>

          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="handlePreviewBill"
              class="btn btn-secondary text-xs font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <span>Share / Print</span>
              <ChevronDown :size="13" />
            </button>

            <button
              type="submit"
              class="btn btn-primary bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Check :size="16" />
              <span>Save & Register Bill</span>
            </button>
          </div>
        </div>
      </form>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: Dedicated Serial Number Modal (Exact Image Layout)
      ══════════════════════════════════════════════════════════════ -->
      <div v-if="showSerialModal" class="modal-backdrop z-50 flex items-center justify-center p-3 bg-black/75" @click.self="closeSerialModal">
        <div class="modal-content w-full max-w-lg bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100 animate-in fade-in zoom-in duration-150">
          
          <!-- Serial Modal Header -->
          <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 class="text-base font-black text-white leading-tight">Purchase Item - SERIAL NUM</h3>
              <p class="text-xs text-teal-400 font-bold mt-0.5 uppercase tracking-wide truncate max-w-xs">
                {{ activeSerialRow?.isNewPart ? (activeSerialRow?.newPartName || 'New Equipment Part') : (activeProductName || 'Medical Device') }}
              </p>
            </div>
            <button @click="closeSerialModal" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
          </div>

          <!-- Serial Modal Body -->
          <div class="p-6 overflow-y-auto space-y-4 text-xs">
            
            <!-- Enter SERIAL NUM Input Box with Blue Check Button and Counter -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between font-bold text-slate-300">
                <span>Enter SERIAL NUM:</span>
                <span class="font-mono text-teal-300 font-black">{{ activeRowSerials.length }}/{{ activeSerialRow?.qty || 1 }} Entered</span>
              </div>

              <div class="flex items-center gap-2">
                <input
                  ref="serialInputRef"
                  v-model="newSerialInputText"
                  type="text"
                  placeholder="Enter/Scan"
                  @keyup.enter="commitNewSerial"
                  class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono font-bold text-xs focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  @click="commitNewSerial"
                  class="w-10 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold shadow-md cursor-pointer shrink-0"
                  title="Add Serial"
                >
                  <Check :size="18" />
                </button>
              </div>
            </div>

            <!-- Fast Generator / Bulk Paste Helpers -->
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <span class="text-slate-400 flex items-center gap-1">
                  <Layers :size="12" class="text-teal-400" />
                  <span>Sequential Auto-Generator</span>
                </span>
                <button
                  type="button"
                  @click="generateSequentialSerials"
                  class="text-teal-400 hover:text-teal-300 font-bold text-[10px]"
                >
                  ⚡ Generate All {{ activeSerialRow?.qty }} Serials
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[10px] text-slate-500 block mb-0.5">Machine Code Prefix</label>
                  <input
                    v-model="serialGenerator.machineCodePrefix"
                    type="text"
                    placeholder="MC-101"
                    class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label class="text-[10px] text-slate-500 block mb-0.5">Start Serial Number</label>
                  <input
                    v-model.number="serialGenerator.startSerialNum"
                    type="number"
                    placeholder="1001"
                    class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <!-- Checkbox List of Serial Numbers (Matching User Screenshot) -->
            <div class="space-y-1.5">
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered / Active Serial List</div>

              <div class="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                <div
                  v-for="(s, sIdx) in activeRowSerials"
                  :key="sIdx"
                  class="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500/60 transition-colors"
                >
                  <label class="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked
                      @change="removeSerialItem(sIdx)"
                      class="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
                    />
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="font-mono font-bold text-white text-xs truncate">{{ s.serialCode }}</span>
                      <span v-if="s.machineCode" class="badge badge-purple text-[9px] py-0 px-1 font-mono">{{ s.machineCode }}</span>
                    </div>
                  </label>

                  <button
                    type="button"
                    @click="removeSerialItem(sIdx)"
                    class="text-red-400 hover:text-red-300 font-bold p-1 text-xs"
                    title="Delete serial"
                  >
                    ✕
                  </button>
                </div>

                <div v-if="activeRowSerials.length === 0" class="p-6 text-center text-slate-500 italic bg-slate-950/60 rounded-lg border border-dashed border-slate-800">
                  No serial numbers added yet. Type a serial number above or click "Generate All".
                </div>
              </div>
            </div>
          </div>

          <!-- Serial Modal Footer -->
          <div class="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              @click="closeSerialModal"
              class="btn btn-secondary text-xs font-bold px-4 py-2"
            >
              Close
            </button>
            <button
              type="button"
              @click="saveSerialModal"
              class="btn btn-primary bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: + Add Supplier / Party Modal
      ══════════════════════════════════════════════════════════════ -->
      <div v-if="showAddSupplierModal" class="modal-backdrop z-50 flex items-center justify-center p-3 bg-black/70" @click.self="showAddSupplierModal = false">
        <div class="modal-content w-full max-w-md bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden p-5 space-y-4 text-xs text-slate-100">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 class="font-bold text-white text-sm flex items-center gap-1.5">
              <Users :size="16" class="text-teal-400" />
              <span>Add New Supplier / Party Account</span>
            </h3>
            <button @click="showAddSupplierModal = false" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="form-label font-bold mb-1 block">Party / Supplier Name *</label>
              <input v-model="newSupplierObj.name" type="text" placeholder="e.g. Mindray Medical Shenzhen" class="form-input w-full p-2 border rounded font-bold" />
            </div>
            <div>
              <label class="form-label font-bold mb-1 block">Party Type</label>
              <select v-model="newSupplierObj.type" class="form-select w-full p-2 border rounded font-bold">
                <option value="International Exporter">International Exporter</option>
                <option value="Local Vendor">Local Vendor</option>
                <option value="OEM Manufacturer">OEM Manufacturer</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
            <div>
              <label class="form-label font-bold mb-1 block">Contact Phone / Email</label>
              <input v-model="newSupplierObj.contact" type="text" placeholder="+86 755 8188 8998" class="form-input w-full p-2 border rounded" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" @click="showAddSupplierModal = false" class="btn btn-secondary text-xs">Cancel</button>
            <button type="button" @click="handleSaveNewSupplier" class="btn btn-primary text-xs font-bold">Save Party</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { useUiStore } from '../stores/uiStore'
import {
  Anchor,
  FileText,
  Package,
  Plus,
  QrCode,
  Truck,
  Layers,
  ChevronDown,
  Search,
  Check,
  Users
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()

// ── Header & Consignment Form State ──
const form = ref({
  blNumber: '',
  blDate: new Date().toISOString().substring(0, 10),
  supplier: '',
  shipmentDetails: 'Vessel MAERSK 40ft HQ / Karachi Port',
  branch: 'Karachi',
  paymentTerms: 'Due on Receipt',
  paymentType: 'Cash',
  description: '',
  directCustomsDuty: 120000,
  directFreightPort: 80000,
  directDemurrageLanding: 0,
  indirectTransportation: 40000,
  indirectInsurance: 25000,
  indirectWarehousingMisc: 15000,
  discount: 0,
  roundOff: false,
  paidAmount: 0
})

// ── Multi-Item Rows ──
const rows = ref([
  {
    id: 'row_1',
    productId: '',
    isNewPart: false,
    newPartName: '',
    newPartSku: '',
    newPartCategory: 'Ultrasound Machines',
    newPartSellingPrice: 0,
    newPartMinStock: 2,
    qty: 5,
    unitPrice: 450000,
    taxRate: 0,
    taxAmount: 0,
    amount: 2250000,
    showBarcodeScan: false,
    barcodeScanText: '',
    serials: [] // Array of { serialCode, machineCode }
  }
])

// ── Supplier Search & Party Modal ──
const isSupplierDropdownOpen = ref(false)
const supplierSearchQuery = ref('')
const showAddSupplierModal = ref(false)
const newSupplierObj = ref({
  name: '',
  type: 'International Exporter',
  contact: '',
  branch: 'Global'
})

// ── Serial Number Modal State (Center popup) ──
const showSerialModal = ref(false)
const activeSerialRowIndex = ref(0)
const newSerialInputText = ref('')
const serialInputRef = ref(null)
const serialGenerator = ref({
  machineCodePrefix: 'MC-101',
  startSerialNum: 1001
})

// Reset on Modal Open
watch(() => uiStore.showGlobalPurchaseModal, (isOpen) => {
  if (isOpen) {
    const currentBranch = authStore.userBranch || (dataStore.activeBranchFilter && dataStore.activeBranchFilter !== 'All' ? dataStore.activeBranchFilter : 'Karachi')
    const blCount = (dataStore.blList?.length || 0) + 1
    form.value.blNumber = `BL-MED-2026-${String(blCount).padStart(2, '0')}`
    form.value.blDate = new Date().toISOString().substring(0, 10)
    form.value.supplier = 'Mindray Global Imports'
    form.value.shipmentDetails = 'Vessel MAERSK 40ft HQ / Karachi Port'
    form.value.branch = currentBranch
    form.value.paymentTerms = 'Due on Receipt'
    form.value.paymentType = 'Cash'
    form.value.description = ''
    form.value.directCustomsDuty = 120000
    form.value.directFreightPort = 80000
    form.value.directDemurrageLanding = 0
    form.value.indirectTransportation = 40000
    form.value.indirectInsurance = 25000
    form.value.indirectWarehousingMisc = 15000
    form.value.discount = 0
    form.value.roundOff = false
    form.value.paidAmount = 0

    const defaultProd = dataStore.products?.[0]
    rows.value = [
      {
        id: `row_${Date.now()}`,
        productId: defaultProd?.id || '',
        isNewPart: false,
        newPartName: '',
        newPartSku: '',
        newPartCategory: 'Ultrasound Machines',
        newPartSellingPrice: defaultProd?.sellingPrice || 650000,
        newPartMinStock: 2,
        qty: 5,
        unitPrice: defaultProd?.costPrice || 450000,
        taxRate: 0,
        taxAmount: 0,
        amount: (defaultProd?.costPrice || 450000) * 5,
        showBarcodeScan: false,
        barcodeScanText: '',
        serials: []
      }
    ]
    isSupplierDropdownOpen.value = false
    supplierSearchQuery.value = ''
  }
})

// ── Party Search Computation ──
const allSuppliers = computed(() => {
  const map = new Map()
  const seededSuppliers = [
    { name: 'Mindray Global Imports', type: 'International Exporter', branch: 'Global Hub' },
    { name: 'Siemens Healthineers Germany', type: 'OEM Manufacturer', branch: 'Europe HQ' },
    { name: 'Philips Medical Netherlands', type: 'OEM Manufacturer', branch: 'Europe HQ' },
    { name: 'Canon Medical Systems Japan', type: 'OEM Manufacturer', branch: 'Tokyo Hub' },
    { name: 'GE Healthcare USA', type: 'International Exporter', branch: 'Chicago Hub' },
    { name: 'Al-Madina Medical Supplies', type: 'Local Vendor', branch: 'Karachi Port' },
    { name: 'Khyber Surgical Imports', type: 'Distributor', branch: 'Peshawar' }
  ]
  seededSuppliers.forEach(s => map.set(s.name.trim().toLowerCase(), s))
  ;(dataStore.customers || []).forEach(c => {
    if (c.name) {
      const key = c.name.trim().toLowerCase()
      if (!map.has(key)) {
        map.set(key, { name: c.name, type: 'Registered Party', branch: c.branch || 'Pakistan' })
      }
    }
  })
  return Array.from(map.values())
})

const filteredSuppliersList = computed(() => {
  if (!supplierSearchQuery.value.trim()) return allSuppliers.value
  const q = supplierSearchQuery.value.trim().toLowerCase()
  return allSuppliers.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.type && s.type.toLowerCase().includes(q)) ||
    (s.branch && s.branch.toLowerCase().includes(q))
  )
})

function selectSupplier(name) {
  form.value.supplier = name
  isSupplierDropdownOpen.value = false
  supplierSearchQuery.value = ''
}

function createAndSelectSupplier(name) {
  if (!name.trim()) return
  form.value.supplier = name.trim()
  isSupplierDropdownOpen.value = false
  supplierSearchQuery.value = ''
}

function handleSaveNewSupplier() {
  if (!newSupplierObj.value.name.trim()) return
  const sName = newSupplierObj.value.name.trim()
  form.value.supplier = sName
  showAddSupplierModal.value = false
  newSupplierObj.value = { name: '', type: 'International Exporter', contact: '', branch: 'Global' }
}

// ── Row Manipulations & Calculation ──
function addRow() {
  const defaultProd = dataStore.products?.[0]
  rows.value.push({
    id: `row_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    productId: defaultProd?.id || '',
    isNewPart: false,
    newPartName: '',
    newPartSku: '',
    newPartCategory: 'Ultrasound Machines',
    newPartSellingPrice: defaultProd?.sellingPrice || 0,
    newPartMinStock: 2,
    qty: 1,
    unitPrice: defaultProd?.costPrice || 100000,
    taxRate: 0,
    taxAmount: 0,
    amount: defaultProd?.costPrice || 100000,
    showBarcodeScan: false,
    barcodeScanText: '',
    serials: []
  })
}

function removeRow(index) {
  if (rows.value.length > 1) {
    rows.value.splice(index, 1)
  }
}

function onProductSelect(row) {
  const prod = (dataStore.products || []).find(p => p.id === row.productId)
  if (prod) {
    row.unitPrice = prod.costPrice || 0
    row.newPartSellingPrice = prod.sellingPrice || 0
    calculateRow(row)
  }
}

function onQtyChange(row) {
  calculateRow(row)
}

function calculateRow(row) {
  const base = (Number(row.qty) || 0) * (Number(row.unitPrice) || 0)
  const tax = Math.round(base * ((Number(row.taxRate) || 0) / 100))
  row.taxAmount = tax
  row.amount = base + tax
}

function openProductBarcodeScan(index) {
  rows.value[index].showBarcodeScan = !rows.value[index].showBarcodeScan
}

function handleRowBarcodeScan(row) {
  const raw = (row.barcodeScanText || '').trim().toLowerCase()
  if (!raw) return
  const match = (dataStore.products || []).find(p =>
    (p.barcode && p.barcode.toLowerCase() === raw) ||
    (p.sku && p.sku.toLowerCase() === raw) ||
    (p.hsnCode && p.hsnCode.toLowerCase() === raw) ||
    (p.name && p.name.toLowerCase().includes(raw))
  )
  if (match) {
    row.productId = match.id
    row.isNewPart = false
    onProductSelect(row)
    row.showBarcodeScan = false
    row.barcodeScanText = ''
  } else {
    uiStore.showModal('Barcode Not Found', `No equipment SKU matched "${row.barcodeScanText}".`, 'warning')
  }
}

// ── Serial Number Modal Handlers ──
const activeSerialRow = computed(() => rows.value[activeSerialRowIndex.value])
const activeRowSerials = computed(() => activeSerialRow.value?.serials || [])
const activeProductName = computed(() => {
  if (!activeSerialRow.value) return ''
  if (activeSerialRow.value.isNewPart) return activeSerialRow.value.newPartName || 'New Equipment Part'
  const p = (dataStore.products || []).find(prod => prod.id === activeSerialRow.value.productId)
  return p ? `${p.name} (${p.sku})` : 'Medical Equipment'
})

function openSerialModal(index) {
  activeSerialRowIndex.value = index
  const row = rows.value[index]
  const p = (dataStore.products || []).find(prod => prod.id === row.productId)
  const sku = row.isNewPart ? (row.newPartSku || 'MED') : (p?.sku || 'MED')
  serialGenerator.value.machineCodePrefix = `MC-${101 + (dataStore.serials?.length || 0)}`
  serialGenerator.value.startSerialNum = 1001

  showSerialModal.value = true
  nextTick(() => {
    serialInputRef.value?.focus()
  })
}

function closeSerialModal() {
  showSerialModal.value = false
  newSerialInputText.value = ''
}

function saveSerialModal() {
  showSerialModal.value = false
  newSerialInputText.value = ''
}

function commitNewSerial() {
  const code = newSerialInputText.value.trim().replace(/^SN-/i, '')
  if (!code) return
  const row = activeSerialRow.value
  if (!row) return

  const mCode = `${serialGenerator.value.machineCodePrefix || 'MC'}-${row.serials.length + 1}`
  row.serials.push({ serialCode: code, machineCode: mCode })
  newSerialInputText.value = ''
  nextTick(() => {
    serialInputRef.value?.focus()
  })
}

function removeSerialItem(idx) {
  const row = activeSerialRow.value
  if (row && row.serials) {
    row.serials.splice(idx, 1)
  }
}

function generateSequentialSerials() {
  const row = activeSerialRow.value
  if (!row) return
  const targetQty = Number(row.qty) || 1
  const p = (dataStore.products || []).find(prod => prod.id === row.productId)
  const sku = row.isNewPart ? (row.newPartSku || 'MED').trim().toUpperCase() : (p?.sku || 'MED').trim().toUpperCase()

  const list = []
  const startNum = Number(serialGenerator.value.startSerialNum) || 1001
  const mPrefix = (serialGenerator.value.machineCodePrefix || 'MC').trim()

  for (let i = 0; i < targetQty; i++) {
    const sCode = `SN${sku}${startNum + i}`
    const mCode = `${mPrefix}-${i + 1}`
    list.push({ serialCode: sCode, machineCode: mCode })
  }
  row.serials = list
}

// ── Totals & Financial Calculations ──
const totalItemsCount = computed(() => rows.value.reduce((sum, r) => sum + (Number(r.qty) || 0), 0))

const computedSubtotal = computed(() => {
  return rows.value.reduce((sum, r) => sum + ((Number(r.qty) || 0) * (Number(r.unitPrice) || 0)), 0)
})

const computedTaxTotal = computed(() => {
  return rows.value.reduce((sum, r) => sum + (Number(r.taxAmount) || 0), 0)
})

const computedDirectExpenses = computed(() => {
  return Number(form.value.directCustomsDuty || 0) +
         Number(form.value.directFreightPort || 0) +
         Number(form.value.directDemurrageLanding || 0)
})

const computedIndirectExpenses = computed(() => {
  return Number(form.value.indirectTransportation || 0) +
         Number(form.value.indirectInsurance || 0) +
         Number(form.value.indirectWarehousingMisc || 0)
})

const computedTotalLandedCost = computed(() => {
  return computedSubtotal.value + computedDirectExpenses.value + computedIndirectExpenses.value
})

const computedLandedCostPerUnit = computed(() => {
  const count = totalItemsCount.value || 1
  return Math.round(computedTotalLandedCost.value / count)
})

const computedRoundOffAmount = computed(() => {
  if (!form.value.roundOff) return 0
  const raw = computedSubtotal.value - (Number(form.value.discount) || 0) + computedTaxTotal.value + computedDirectExpenses.value + computedIndirectExpenses.value
  const rounded = Math.round(raw)
  return rounded - raw
})

const computedGrandTotal = computed(() => {
  const base = computedSubtotal.value - (Number(form.value.discount) || 0) + computedTaxTotal.value + computedDirectExpenses.value + computedIndirectExpenses.value
  return Math.max(0, form.value.roundOff ? Math.round(base) : base)
})

const computedBalanceDue = computed(() => {
  return Math.max(0, computedGrandTotal.value - (Number(form.value.paidAmount) || 0))
})

// ── Submit & Register Bill ──
async function handleCreateBL() {
  if (!form.value.blNumber.trim()) {
    uiStore.showModal('Validation Error', 'Please specify a valid BL Number.', 'warning')
    return
  }
  if (!form.value.supplier.trim()) {
    uiStore.showModal('Validation Error', 'Please select or enter a Supplier / Exporter.', 'warning')
    return
  }

  const generatedSerialsList = []
  const poItems = []
  const containerItems = []

  for (const r of rows.value) {
    let targetProduct = null

    if (r.isNewPart) {
      if (!r.newPartName.trim() || !r.newPartSku.trim()) {
        uiStore.showModal('Validation Error', 'Please enter New Part Name and SKU code.', 'warning')
        return
      }
      const cleanSku = r.newPartSku.trim().toUpperCase()
      targetProduct = {
        id: `prd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        sku: cleanSku,
        name: r.newPartName.trim(),
        category: r.newPartCategory || 'Parts & Accessories',
        division: 'Medimage Services',
        hsnCode: '9018.9000',
        taxRatio: r.taxRate || 18,
        allocationCity: form.value.branch,
        allocationCities: [form.value.branch],
        storageBin: `BIN-${cleanSku.replace(/[^A-Z0-9]/gi, '')}-01`,
        costPrice: Number(r.unitPrice) || 100000,
        sellingPrice: Number(r.newPartSellingPrice) || (Number(r.unitPrice) * 1.35),
        stockQty: Number(r.qty),
        minStock: Number(r.newPartMinStock || 2),
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
      }
      dataStore.products.unshift(targetProduct)
    } else {
      if (!r.productId) {
        uiStore.showModal('Validation Error', 'Please select a valid Equipment Product SKU for all rows.', 'warning')
        return
      }
      targetProduct = dataStore.products.find(p => p.id === r.productId)
      if (targetProduct) {
        targetProduct.stockQty = (targetProduct.stockQty || 0) + Number(r.qty)
        if (!targetProduct.allocationCities) targetProduct.allocationCities = [targetProduct.allocationCity]
        if (!targetProduct.allocationCities.includes(form.value.branch)) targetProduct.allocationCities.push(form.value.branch)
        targetProduct.allocationCity = targetProduct.allocationCities.join(', ')
      }
    }

    if (!targetProduct) continue

    // Serials for this row
    const rowQty = Number(r.qty) || 1
    const serialCount = r.serials.length
    for (let i = 0; i < rowQty; i++) {
      const sItem = r.serials[i]
      const serialCode = sItem?.serialCode || `SN${targetProduct.sku}${1000 + i + 1}`
      const machineCode = sItem?.machineCode || `MC-${100 + (dataStore.serials?.length || 0) + i + 1}`

      const serialDoc = {
        serialCode,
        machineCode,
        productId: targetProduct.id,
        sku: targetProduct.sku,
        status: 'Available',
        allocationCity: form.value.branch,
        binLocation: targetProduct.storageBin || 'HQ-PEW-01',
        registeredDate: form.value.blDate,
        purchaseInvoiceNo: form.value.blNumber,
        purchaseDate: form.value.blDate,
        blNumber: form.value.blNumber,
        containerNo: form.value.blNumber,
        costPrice: Number(r.unitPrice),
        paymentStatus: form.value.paidAmount >= computedGrandTotal.value ? 'Paid' : 'Pending',
        hsnCode: targetProduct.hsnCode || '9018.9000',
        taxRatio: r.taxRate || 18,
        salePrice: targetProduct.sellingPrice || 0
      }

      if (!dataStore.checkDuplicateSerial(serialCode)) {
        dataStore.serials.unshift(serialDoc)
        generatedSerialsList.push(serialDoc)
      }
    }

    poItems.push({
      productId: targetProduct.id,
      productName: targetProduct.name,
      sku: targetProduct.sku,
      qty: rowQty,
      unitCost: Number(r.unitPrice)
    })

    containerItems.push({
      productId: targetProduct.id,
      name: targetProduct.name,
      sku: targetProduct.sku,
      quantity: rowQty,
      costPrice: Number(r.unitPrice),
      totalCost: r.amount
    })
  }

  // Register Container Consignment
  const newContainer = {
    id: `con_${Date.now()}`,
    containerNo: form.value.blNumber,
    blNumber: form.value.blNumber,
    blDate: form.value.blDate,
    companyName: form.value.supplier,
    supplierName: form.value.supplier,
    shipmentDetails: form.value.shipmentDetails,
    destinationCity: form.value.branch,
    branch: form.value.branch,
    receivingDate: form.value.blDate,
    arrivalDate: form.value.blDate,
    status: 'In Stock',
    blStatus: 'In Process',
    directExpenses: {
      customsDuty: Number(form.value.directCustomsDuty || 0),
      freightPort: Number(form.value.directFreightPort || 0),
      demurrageLanding: Number(form.value.directDemurrageLanding || 0),
      totalDirect: computedDirectExpenses.value
    },
    indirectExpenses: {
      transportation: Number(form.value.indirectTransportation || 0),
      insurance: Number(form.value.indirectInsurance || 0),
      warehousingMisc: Number(form.value.indirectWarehousingMisc || 0),
      totalIndirect: computedIndirectExpenses.value
    },
    basePurchaseCost: computedSubtotal.value,
    landingCost: computedDirectExpenses.value + computedIndirectExpenses.value,
    totalCostValue: computedGrandTotal.value,
    totalUnits: totalItemsCount.value,
    items: containerItems
  }
  dataStore.containers.unshift(newContainer)

  // Register Purchase Order
  await dataStore.createPurchaseOrder({
    poNumber: `PO-${form.value.blNumber}`,
    supplier: form.value.supplier,
    allocationCity: form.value.branch,
    blNumber: form.value.blNumber,
    orderDate: form.value.blDate,
    items: poItems,
    generatedSerials: generatedSerialsList,
    totalAmount: computedGrandTotal.value
  }, authStore.user)

  uiStore.showModal(
    'Bill Saved Successfully',
    `Purchase Bill & BL Consignment ${form.value.blNumber} for ${form.value.supplier} saved with ${totalItemsCount.value} units (Total: PKR ${computedGrandTotal.value.toLocaleString()}).`,
    'success'
  )

  uiStore.closePurchaseModal()
}

function handlePreviewBill() {
  uiStore.showModal(
    'Print & Share Bill',
    `Bill ${form.value.blNumber || 'Draft'} ready for printing / sharing with ${form.value.supplier || 'Party'}. Total: PKR ${computedGrandTotal.value.toLocaleString()}`,
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
