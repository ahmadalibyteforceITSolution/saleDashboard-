<template>
  <div v-if="uiStore.showGlobalPurchaseModal" class="modal-backdrop z-50 flex items-center justify-center p-1 sm:p-3" @click.self="uiStore.closePurchaseModal">
    <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-xl" style="width: 98vw !important; max-width: 1560px !important; max-height: 96vh !important; height: 96vh !important;">
      
      <!-- ══════════════════════════════════════════════════════════════
           MODAL TOP HEADER: Vyapar Desktop Invoice Bar
      ══════════════════════════════════════════════════════════════ -->
      <div class="px-3 sm:px-5 py-2.5 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <span class="text-sm sm:text-base md:text-lg font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
              <Anchor :size="18" class="text-teal-600 dark:text-teal-400" />
              <span>Purchase / Bill of Lading (BL)</span>
            </span>
            <span :class="['badge text-[9px] sm:text-[10px] font-mono py-0.5 px-2 font-bold', uiStore.editingPurchaseData ? 'badge-warning' : 'badge-info']">
              {{ uiStore.editingPurchaseData ? `EDITING: ${form.blNumber}` : 'IMPORT & INVENTORY' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Branch Selector (or Locked badge) -->
          <div class="flex items-center gap-1.5 sm:gap-2 bg-slate-200 dark:bg-slate-950 px-2 sm:px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[11px] sm:text-xs">
            <span class="text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">Warehouse:</span>
            <span v-if="!authStore.isSuperAdmin" class="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <span>📍 {{ authStore.userBranch || 'Lahore' }}</span>
              <span class="text-[10px] text-slate-500">(Locked)</span>
            </span>
            <select v-else v-model="form.branch" class="bg-transparent text-teal-700 dark:text-teal-300 font-bold focus:outline-none cursor-pointer">
              <option value="Peshawar" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Peshawar HO</option>
              <option value="Lahore" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lahore Branch</option>
              <option value="Multan" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Multan Branch</option>
              <option value="Islamabad" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Islamabad Branch</option>
              <option value="Karachi" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Karachi Branch</option>
            </select>
          </div>

          <button @click="uiStore.closePurchaseModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-lg font-bold">✕</button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           METADATA HEADER: Party Selection, BL No, Purchasing Date
      ══════════════════════════════════════════════════════════════ -->
      <div class="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3 text-xs shrink-0">
        
        <!-- Left Col: Supplier / Party Select with + Add Party Button Above -->
        <div class="sm:col-span-2 md:col-span-6">
          <div class="flex items-center justify-between mb-1">
            <label class="font-bold text-slate-700 dark:text-slate-300">Supplier / Exporter Party *</label>
            <button
              type="button"
              @click="showAddSupplierModal = true"
              class="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Plus :size="12" />
              <span>Add Party</span>
            </button>
          </div>
          <select
            v-model="form.supplier"
            required
            class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:border-teal-500 focus:outline-none cursor-pointer min-h-[36px]"
          >
            <option value="" disabled>Select Supplier / Exporter Party...</option>
            <option v-for="s in allSuppliers" :key="s.name" :value="s.name">
              {{ s.name }} ({{ s.type || 'Supplier' }} — {{ s.branch || 'Global' }})
            </option>
          </select>
        </div>

        <!-- Middle Col: BL Number -->
        <div class="sm:col-span-1 md:col-span-3">
          <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Bill / BL No *</label>
          <input
            v-model="form.blNumber"
            type="text"
            required
            placeholder="e.g. BL-MED-2026-04"
            class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-teal-500 focus:outline-none min-h-[36px]"
          />
        </div>

        <!-- Right Col: Purchasing Date -->
        <div class="sm:col-span-1 md:col-span-3">
          <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Purchasing Date *</label>
          <input
            v-model="form.blDate"
            type="date"
            required
            class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-teal-500 focus:outline-none min-h-[36px]"
          />
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           MAIN BODY (SCROLLABLE): Full Width Items Grid & Calculations
      ══════════════════════════════════════════════════════════════ -->
      <form @submit.prevent="handleCreateBL" class="flex flex-col flex-1 overflow-hidden m-0">
        <div class="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50 dark:bg-transparent">
          
          <!-- ── FULL WIDTH ITEMS GRID TABLE (Vyapar Style) ── -->
          <div class="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900/90 shadow-md">
            <div class="overflow-x-auto min-w-full">
              <table class="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr class="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th class="py-2.5 px-3 w-10 text-center">#</th>
                    <th class="py-2.5 px-3 min-w-[320px]">ITEM / EQUIPMENT PRODUCT</th>
                    <th class="py-2.5 px-3 w-48 text-center">SERIAL NUM</th>
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
                    v-for="(row, index) in rows"
                    :key="row.id"
                    class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <!-- Column 1: Row Index -->
                    <td class="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-mono font-bold">{{ index + 1 }}</td>

                    <!-- Column 2: Item Name / Category Selector + Scan Barcode & Add New Equipment Above -->
                    <td class="py-2.5 px-3">
                      <div class="space-y-1.5">
                        <!-- Top Action Row above the selector -->
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                            {{ row.isNewPart ? 'New Equipment Entry' : 'Select From Catalog' }}
                          </span>
                          <div class="flex items-center gap-1.5">
                            <button
                              type="button"
                              @click="openScannerModal(index)"
                              class="text-[10px] text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-500/40 cursor-pointer"
                              title="Scan Product Barcode"
                            >
                              <QrCode :size="11" />
                              <span>Scan</span>
                            </button>
                            <button
                              type="button"
                              @click="openAddProductModal(index)"
                              class="text-[10px] text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-500/40 cursor-pointer"
                              title="Register and Add New Equipment Item"
                            >
                              <Plus :size="11" />
                              <span>Add Equipment</span>
                            </button>
                            <button
                              type="button"
                              @click="row.isNewPart = !row.isNewPart"
                              :class="[
                                'text-[10px] font-bold border transition-colors px-2 py-0.5 rounded cursor-pointer flex items-center gap-1',
                                row.isNewPart ? 'bg-amber-100 dark:bg-amber-900/80 border-amber-300 dark:border-amber-500 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                              ]"
                              :title="row.isNewPart ? 'Switch to Existing SKU' : 'Quick Inline Entry'"
                            >
                              <span>{{ row.isNewPart ? '📦 Select Existing' : '⚡ Quick Inline' }}</span>
                            </button>
                          </div>
                        </div>

                        <!-- Full Width Selector (Existing SKU vs New Equipment) -->
                        <div v-if="!row.isNewPart">
                          <select
                            v-model="row.productId"
                            @change="onProductSelect(row)"
                            required
                            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-bold text-xs focus:border-teal-500 focus:outline-none min-h-[34px] cursor-pointer"
                          >
                            <option value="" disabled>Select Equipment Item / SKU...</option>
                            <option v-for="p in dataStore.products" :key="p.id" :value="p.id">
                              {{ p.name }} ({{ p.sku }}) — Standard Cost: PKR {{ (p.costPrice || 0).toLocaleString() }}
                            </option>
                          </select>
                        </div>

                        <!-- If inline New Equipment mode is activated for this row -->
                        <div v-else class="grid grid-cols-2 gap-2">
                          <input
                            v-model="row.newPartName"
                            type="text"
                            placeholder="New Equipment Name"
                            class="bg-slate-50 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/60 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-bold text-xs focus:outline-none min-h-[34px]"
                          />
                          <select
                            v-model="row.newPartCategory"
                            class="bg-slate-50 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/60 rounded-lg px-2.5 py-1.5 text-amber-700 dark:text-amber-300 font-bold text-xs focus:outline-none min-h-[34px] cursor-pointer"
                          >
                            <option value="Ultrasound Machines">Ultrasound Machines</option>
                            <option value="X-Ray & Radiology">X-Ray & Radiology</option>
                            <option value="Patient Monitors">Patient Monitors</option>
                            <option value="Surgical Devices">Surgical Devices</option>
                            <option value="Endoscopy Systems">Endoscopy Systems</option>
                            <option value="CT & MRI Imaging">CT & MRI Imaging</option>
                            <option value="Laboratory Equipment">Laboratory Equipment</option>
                            <option value="Parts & Accessories">Parts & Accessories</option>
                            <option value="Consumables & Supplies">Consumables & Supplies</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    <!-- Column 3: SERIAL NO Trigger Button (Opens Dedicated Modal) -->
                    <td class="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        @click="openSerialModal(index)"
                        class="px-2.5 py-1.5 rounded-lg border flex items-center justify-center gap-1.5 font-mono text-xs font-bold transition-all w-full cursor-pointer min-h-[34px]"
                        :class="[
                          row.serials.length >= row.qty && row.qty > 0
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-teal-700 dark:text-teal-400 hover:border-teal-500 hover:text-teal-600'
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
                    <td class="py-2.5 px-3 text-center">
                      <input
                        v-model.number="row.qty"
                        type="number"
                        min="1"
                        max="1000"
                        required
                        @input="onQtyChange(row)"
                        class="w-20 text-center bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-teal-500 focus:outline-none min-h-[34px]"
                      />
                    </td>

                    <!-- Column 5: PRICE / UNIT -->
                    <td class="py-2.5 px-3">
                      <input
                        v-model.number="row.unitPrice"
                        type="number"
                        min="0"
                        required
                        @input="calculateRow(row)"
                        placeholder="PKR 0"
                        class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs focus:border-teal-500 focus:outline-none min-h-[34px]"
                      />
                    </td>

                    <!-- Column 6: TAX (%) -->
                    <td class="py-2.5 px-3 text-center">
                      <select
                        v-model.number="row.taxRate"
                        @change="calculateRow(row)"
                        class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-mono font-semibold text-xs focus:border-teal-500 focus:outline-none min-h-[34px]"
                      >
                        <option :value="0">NONE (0%)</option>
                        <option :value="18">18% HSN</option>
                        <option :value="5">5% Custom</option>
                        <option :value="10">10% Tariff</option>
                      </select>
                    </td>

                    <!-- Column 7: ROW AMOUNT -->
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      PKR {{ (row.amount || 0).toLocaleString() }}
                    </td>

                    <!-- Column 8: Delete Row Button -->
                    <td class="py-2.5 px-3 text-center">
                      <button
                        v-if="rows.length > 1"
                        type="button"
                        @click="removeRow(index)"
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

            <!-- Table Footer: + Add Row Button and Subtotal -->
            <div class="p-3 bg-slate-50 dark:bg-slate-950 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                @click="addRow"
                class="btn btn-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg"
              >
                <Plus :size="13" />
                <span>ADD ROW</span>
              </button>

              <div class="flex items-center gap-4 text-xs font-bold">
                <span class="text-slate-600 dark:text-slate-400 uppercase tracking-wider">TOTAL ITEMS: {{ totalItemsCount }}</span>
                <span class="text-slate-700 dark:text-slate-300">SUBTOTAL: <span class="font-mono text-slate-900 dark:text-white text-sm">PKR {{ computedSubtotal.toLocaleString() }}</span></span>
              </div>
            </div>
          </div>

          <!-- ── BOTTOM PANEL: Left Inbound Details & Right Financial Summary ── -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <!-- LEFT COLUMN (7 Cols): Payment Type, Inbound Expenses Breakdown, Description -->
            <div class="lg:col-span-7 space-y-3">
              
              <!-- Direct & Indirect Expenses Tabs / Accordion -->
              <div class="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-md">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span class="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Truck :size="14" class="text-blue-500" />
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
                    <label class="text-slate-600 dark:text-slate-400 block mb-1">Customs Duty & Tariffs</label>
                    <input
                      v-model.number="form.directCustomsDuty"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-700 dark:text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label class="text-slate-600 dark:text-slate-400 block mb-1">Freight & Port Clearance</label>
                    <input
                      v-model.number="form.directFreightPort"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-700 dark:text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label class="text-slate-600 dark:text-slate-400 block mb-1">Demurrage / Landing</label>
                    <input
                      v-model.number="form.directDemurrageLanding"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-700 dark:text-amber-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <!-- Indirect Operating & Overhead Expenses Fields -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200 dark:border-slate-800/60">
                  <div>
                    <label class="text-slate-600 dark:text-slate-400 block mb-1">Inland Transportation</label>
                    <input
                      v-model.number="form.indirectTransportation"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-purple-700 dark:text-purple-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label class="text-slate-600 dark:text-slate-400 block mb-1">Marine Transit Insurance</label>
                    <input
                      v-model.number="form.indirectInsurance"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-purple-700 dark:text-purple-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label class="text-slate-600 dark:text-slate-400 block mb-1">Warehousing & Misc</label>
                    <input
                      v-model.number="form.indirectWarehousingMisc"
                      type="number"
                      min="0"
                      placeholder="PKR 0"
                      class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-purple-700 dark:text-purple-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <!-- Live Landed Cost Unit Metrics Bar -->
                <div class="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-teal-300 dark:border-teal-500/30 flex items-center justify-between text-xs font-mono">
                  <span class="text-slate-600 dark:text-slate-400">Total Landed Cost: <span class="text-slate-900 dark:text-white font-bold">PKR {{ computedTotalLandedCost.toLocaleString() }}</span></span>
                  <span class="text-teal-700 dark:text-teal-400 font-bold">Landed Cost / Unit: PKR {{ computedLandedCostPerUnit.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Payment Type & Description -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="text-slate-700 dark:text-slate-400 font-bold text-xs">Payment Type</label>
                    <button
                      type="button"
                      @click="showAddPaymentMethodModal = true"
                      class="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
                      title="Add Custom Payment Method"
                    >
                      <Plus :size="12" />
                      <span>Add Method</span>
                    </button>
                  </div>
                  <select
                    v-model="form.paymentType"
                    class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-bold text-xs focus:border-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option v-for="m in paymentMethodsList" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
                <div class="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
                  <label class="text-slate-700 dark:text-slate-400 block mb-1.5 font-bold text-xs">Inbound Notes / Description</label>
                  <input
                    v-model="form.description"
                    type="text"
                    placeholder="Enter vessel notes, container seal #, etc."
                    class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN (5 Cols): Vyapar Financial Summary & Balance Matrix -->
            <div class="lg:col-span-5 bg-white dark:bg-slate-900/95 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 shadow-md flex flex-col justify-between">
              <div class="space-y-2">
                <!-- Subtotal Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span class="text-slate-600 dark:text-slate-400 font-bold">Subtotal (Base Value)</span>
                  <span class="font-mono font-bold text-slate-900 dark:text-white">PKR {{ computedSubtotal.toLocaleString() }}</span>
                </div>

                <!-- Discount Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span class="text-slate-600 dark:text-slate-400">Discount (PKR)</span>
                  <input
                    v-model.number="form.discount"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-28 text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white font-mono text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <!-- Total Direct & Indirect Inbound Expenses Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span class="text-slate-600 dark:text-slate-400">Inbound Landing Expenses</span>
                  <span class="font-mono text-blue-600 dark:text-blue-300 font-bold">+ PKR {{ (computedDirectExpenses + computedIndirectExpenses).toLocaleString() }}</span>
                </div>

                <!-- Total Tax Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <span class="text-slate-600 dark:text-slate-400">Total Tax / HSN</span>
                  <span class="font-mono text-amber-600 dark:text-amber-300 font-bold">+ PKR {{ computedTaxTotal.toLocaleString() }}</span>
                </div>

                <!-- Round Off Row -->
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-800/80">
                  <label class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input type="checkbox" v-model="form.roundOff" class="rounded border-slate-300 dark:border-slate-700" />
                    <span>Round Off</span>
                  </label>
                  <span class="font-mono text-slate-500 dark:text-slate-400">PKR {{ computedRoundOffAmount }}</span>
                </div>

                <!-- GRAND TOTAL -->
                <div class="p-3 bg-teal-50/80 dark:bg-slate-950 rounded-lg border border-teal-300 dark:border-teal-500/40 flex items-center justify-between">
                  <span class="font-black uppercase tracking-wider text-xs text-teal-800 dark:text-teal-400">Total Bill Amount</span>
                  <span class="font-mono font-black text-lg sm:text-xl text-teal-700 dark:text-emerald-400">PKR {{ computedGrandTotal.toLocaleString() }}</span>
                </div>

                <!-- Paid Amount Field -->
                <div class="flex items-center justify-between text-xs py-1 pt-2">
                  <span class="text-slate-700 dark:text-slate-300 font-bold">Paid / Advance (PKR)</span>
                  <input
                    v-model.number="form.paidAmount"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-36 text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <!-- Balance Due -->
                <div class="flex items-center justify-between text-xs py-2 px-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-500/30">
                  <span class="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Balance Due</span>
                  <span class="font-mono font-black text-sm text-amber-700 dark:text-amber-400">PKR {{ computedBalanceDue.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════
             FOOTER ACTIONS: Close, Share, Save (Vyapar Desktop Style)
        ══════════════════════════════════════════════════════════════ -->
        <div class="px-5 py-3.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            @click="uiStore.closePurchaseModal"
            class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
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
              class="btn btn-primary bg-teal-600 hover:bg-teal-500 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Check :size="16" />
              <span>{{ uiStore.editingPurchaseData ? 'Update & Save BL Record' : 'Save & Register Bill' }}</span>
            </button>
          </div>
        </div>
      </form>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: Dedicated Barcode & SKU Scanner Modal
      ══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <div
          v-if="showScannerModal"
          class="fixed inset-0 z-[99999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background-color: rgba(15, 23, 42, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important;"
          @click.self="showScannerModal = false"
        >
          <div
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150 relative"
            style="width: 92% !important; max-width: 500px !important; margin: auto !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
          >
            <div class="px-5 py-3.5 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <QrCode :size="18" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">Equipment Barcode & SKU Scanner</h3>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">Scan hardware barcode or type SKU / Model</p>
                </div>
              </div>
              <button @click="showScannerModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
            </div>

            <div class="p-5 space-y-4 text-xs bg-white dark:bg-[#0f172a]">
              <div class="relative">
                <input
                  ref="scannerInputRef"
                  v-model="scannerSearchQuery"
                  type="text"
                  placeholder="Scan or type Barcode / SKU / Equipment Name..."
                  @keyup.enter="handleScanSubmit"
                  class="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 border-2 border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  @click="handleScanSubmit"
                  class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg"
                >
                  Lookup
                </button>
              </div>

              <div class="space-y-2">
                <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Matching Equipment Catalog ({{ filteredScannerProducts.length }})
                </div>
                <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  <div
                    v-for="p in filteredScannerProducts"
                    :key="p.id"
                    @click="selectScannedProduct(p)"
                    class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1e293b] hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div class="min-w-0 flex-1">
                      <div class="font-bold text-slate-900 dark:text-white text-xs truncate">{{ p.name }}</div>
                      <div class="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        <span class="text-teal-600 dark:text-teal-400 font-bold">SKU: {{ p.sku }}</span>
                        <span v-if="p.barcode">| Barcode: {{ p.barcode }}</span>
                        <span v-if="p.hsnCode">| HSN: {{ p.hsnCode }}</span>
                      </div>
                    </div>
                    <div class="text-right shrink-0 ml-3">
                      <div class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">PKR {{ (p.costPrice || 0).toLocaleString() }}</div>
                      <button type="button" class="btn btn-xs bg-teal-600 hover:bg-teal-500 text-white text-[10px] py-0.5 px-2 rounded mt-1">Select</button>
                    </div>
                  </div>

                  <div v-if="filteredScannerProducts.length === 0" class="p-6 text-center text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-dashed border-slate-300 dark:border-slate-800">
                    No matching equipment found for "{{ scannerSearchQuery }}".
                  </div>
                </div>
              </div>
            </div>

            <div class="px-5 py-3 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400 text-[11px]">Hardware laser scanners automatically trigger lookup on scan.</span>
              <button type="button" @click="showScannerModal = false" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: Dedicated Serial Number Modal
      ══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <div
          v-if="showSerialModal"
          class="fixed inset-0 z-[99999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background-color: rgba(15, 23, 42, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important;"
          @click.self="closeSerialModal"
        >
          <div
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150 relative"
            style="width: 92% !important; max-width: 520px !important; margin: auto !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
          >
            <!-- Serial Modal Header -->
            <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white leading-tight">Purchase Item - SERIAL NUM</h3>
                <p class="text-xs text-teal-600 dark:text-teal-400 font-bold mt-0.5 uppercase tracking-wide truncate max-w-xs">
                  {{ activeSerialRow?.isNewPart ? (activeSerialRow?.newPartName || 'New Equipment') : (activeProductName || 'Medical Device') }}
                </p>
              </div>
              <button @click="closeSerialModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold">✕</button>
            </div>

            <!-- Serial Modal Body -->
            <div class="p-6 overflow-y-auto space-y-4 text-xs bg-white dark:bg-[#0f172a]">
              <!-- Enter SERIAL NUM Input Box -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Enter SERIAL NUM:</span>
                  <span class="font-mono text-teal-600 dark:text-teal-300 font-black">{{ activeRowSerials.length }}/{{ activeSerialRow?.qty || 1 }} Entered</span>
                </div>

                <div class="flex items-center gap-2">
                  <input
                    ref="serialInputRef"
                    v-model="newSerialInputText"
                    type="text"
                    placeholder="Enter/Scan"
                    @keyup.enter="commitNewSerial"
                    class="flex-1 rounded-lg px-3 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
              <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div class="flex items-center justify-between text-[11px] font-bold">
                  <span class="text-slate-700 dark:text-slate-400 flex items-center gap-1">
                    <Layers :size="12" class="text-teal-600 dark:text-teal-400" />
                    <span>Sequential Auto-Generator</span>
                  </span>
                  <button
                    type="button"
                    @click="generateSequentialSerials"
                    class="text-teal-700 dark:text-teal-400 hover:text-teal-800 font-bold text-[10px] flex items-center gap-1 bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-500/30 px-2 py-1 rounded cursor-pointer"
                  >
                    ⚡ Generate All {{ activeSerialRow?.qty }} Serials
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">Machine Code Prefix (e.g. WD-35)</label>
                    <input
                      v-model="serialGenerator.machineCodePrefix"
                      type="text"
                      placeholder="e.g. WD-35"
                      class="w-full rounded px-2 py-1 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono text-[11px] border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500"
                    />
                    <div v-if="previewMachineCodeRange" class="text-[10px] text-teal-600 dark:text-teal-400 font-mono mt-1 truncate">
                      Range: {{ previewMachineCodeRange }}
                    </div>
                  </div>
                  <div>
                    <label class="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">Start Serial Number</label>
                    <input
                      v-model.number="serialGenerator.startSerialNum"
                      type="number"
                      placeholder="1001"
                      class="w-full rounded px-2 py-1 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono text-[11px] border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500"
                    />
                    <div class="text-[10px] text-slate-500 font-mono mt-1">
                      Auto-generated codes
                    </div>
                  </div>
                </div>
              </div>

              <!-- Registered Serial List -->
              <div class="space-y-1.5">
                <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered / Active Serial List</div>

                <div class="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  <div
                    v-for="(s, sIdx) in activeRowSerials"
                    :key="sIdx"
                    class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1e293b] hover:border-blue-500/60 transition-colors"
                  >
                    <label class="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked
                        @change="removeSerialItem(sIdx)"
                        class="w-4 h-4 rounded text-blue-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                      />
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="font-mono font-bold text-slate-900 dark:text-white text-xs truncate">{{ s.machineCode || s.serialCode }}</span>
                        <span class="badge badge-purple text-[9px] py-0 px-1 font-mono">Unit #{{ sIdx + 1 }}</span>
                      </div>
                    </label>

                    <button
                      type="button"
                      @click="removeSerialItem(sIdx)"
                      class="text-rose-500 hover:text-rose-700 font-bold p-1 text-xs"
                      title="Delete serial"
                    >
                      ✕
                    </button>
                  </div>

                  <div v-if="activeRowSerials.length === 0" class="p-6 text-center text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-dashed border-slate-300 dark:border-slate-800">
                    No serial numbers added yet. Type a serial number above or click "Generate All".
                  </div>
                </div>
              </div>
            </div>

            <!-- Serial Modal Footer -->
            <div class="px-6 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                @click="closeSerialModal"
                class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                @click="saveSerialModal"
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
          v-if="showAddSupplierModal"
          class="fixed inset-0 z-[99999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background-color: rgba(15, 23, 42, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important;"
          @click.self="showAddSupplierModal = false"
        >
          <div
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150 relative"
            style="width: 92% !important; max-width: 540px !important; margin: auto !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
          >
            <!-- Modal Header -->
            <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <UserPlus :size="17" class="text-teal-600 dark:text-teal-400" />
                <span>Add New Party</span>
              </div>
              <button type="button" @click="showAddSupplierModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-4 text-xs bg-white dark:bg-[#0f172a]">
              <!-- PARTY NAME * -->
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Party Name *</label>
                <input
                  v-model="newSupplierObj.name"
                  type="text"
                  placeholder="e.g. HOSPITEX RAWALPINDI"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <!-- PARTY TYPE & BRANCH / CITY -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Party Type</label>
                  <select
                    v-model="newSupplierObj.type"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
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
                  <div v-if="!authStore.isSuperAdmin" class="w-full rounded-lg px-3.5 py-2.5 bg-slate-100 dark:bg-[#1e293b] text-teal-600 dark:text-teal-400 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-between min-h-[38px]">
                    <span class="flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{{ authStore.userBranch || form.branch || 'Karachi' }}</span>
                    </span>
                    <span class="text-[10px] text-slate-400 font-normal">(Locked)</span>
                  </div>
                  <select
                    v-else
                    v-model="newSupplierObj.branch"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer min-h-[38px]"
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
                    v-model="newSupplierObj.phone"
                    type="text"
                    placeholder="+92 300 1234567"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-medium text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    v-model="newSupplierObj.email"
                    type="email"
                    placeholder="accounts@clinic.com"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-medium text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <!-- CREDIT LIMIT & OPENING BALANCE -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Credit Limit (PKR)</label>
                  <input
                    v-model.number="newSupplierObj.creditLimit"
                    type="number"
                    placeholder="1000000"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Opening Balance (PKR)</label>
                  <input
                    v-model.number="newSupplierObj.openingBalance"
                    type="number"
                    placeholder="0"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <!-- ADDRESS / NOTES -->
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Address / Notes</label>
                <textarea
                  v-model="newSupplierObj.address"
                  rows="2"
                  placeholder="Full clinic address..."
                  class="w-full rounded-lg px-3.5 py-2 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="showAddSupplierModal = false"
                class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSaveNewSupplier"
                class="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Party
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: + Add Payment Method Modal
      ══════════════════════════════════════════════════════════════ -->
      <Teleport to="body">
        <div
          v-if="showAddPaymentMethodModal"
          class="fixed inset-0 z-[99999] flex items-center justify-center p-3 animate-in fade-in duration-150"
          style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 99999 !important; background-color: rgba(15, 23, 42, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important;"
          @click.self="showAddPaymentMethodModal = false"
        >
          <div
            class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150 relative"
            style="width: 92% !important; max-width: 480px !important; margin: auto !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
          >
            <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <CreditCard :size="17" class="text-teal-600 dark:text-teal-400" />
                <span>Add Payment Method</span>
              </div>
              <button type="button" @click="showAddPaymentMethodModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
            </div>

            <div class="p-6 space-y-4 text-xs bg-white dark:bg-[#0f172a]">
              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Payment Method Name *</label>
                <input
                  v-model="newPaymentMethodName"
                  type="text"
                  placeholder="e.g. Meezan Bank (Corp A/C 9901) or JazzCash Corporate"
                  @keyup.enter="handleSaveNewPaymentMethod"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Method Type / Channel</label>
                <select
                  v-model="newPaymentMethodType"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="Bank Account">Bank Account / Direct Wire</option>
                  <option value="Cash Counter">Cash Counter / Till</option>
                  <option value="Digital Wallet">Digital Wallet (JazzCash / EasyPaisa / Raast)</option>
                  <option value="Cheque / Pay Order">Cheque / Pay Order</option>
                  <option value="Letter of Credit">Letter of Credit (LC / LC at Sight)</option>
                </select>
              </div>
            </div>

            <div class="px-6 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="showAddPaymentMethodModal = false"
                class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSaveNewPaymentMethod"
                class="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Save Method
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ══════════════════════════════════════════════════════════════
           POPUP: + Add New Equipment Modal (Purchases)
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
                <Package :size="17" class="text-teal-600 dark:text-teal-400" />
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
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  v-model="newProductObj.category"
                  class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
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
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Selling Price (PKR)</label>
                  <input
                    v-model.number="newProductObj.sellingPrice"
                    type="number"
                    placeholder="650000"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">HSN / Tariff Code</label>
                  <input
                    v-model="newProductObj.hsnCode"
                    type="text"
                    placeholder="9018.1200"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-medium text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Barcode / UPC</label>
                  <input
                    v-model="newProductObj.barcode"
                    type="text"
                    placeholder="MED-8800-44"
                    class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-medium text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
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
                class="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
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
  Users,
  UserPlus,
  CreditCard
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()

// ── Payment Methods State & Modal ──
const paymentMethodsList = ref([
  'Cash Payment',
  'Bank Transfer (Meezan / HBL)',
  'Cheque / Pay Order',
  'Credit / Import Letter of Credit',
  'Direct Wire / TT Transfer',
  'Digital Wallet'
])
const showAddPaymentMethodModal = ref(false)
const newPaymentMethodName = ref('')
const newPaymentMethodType = ref('Bank Account')

function handleSaveNewPaymentMethod() {
  if (!newPaymentMethodName.value.trim()) {
    uiStore.showModal('Validation Error', 'Payment Method Name is required.', 'warning')
    return
  }
  const name = newPaymentMethodName.value.trim()
  if (!paymentMethodsList.value.includes(name)) {
    paymentMethodsList.value.push(name)
  }
  form.value.paymentType = name
  showAddPaymentMethodModal.value = false
  uiStore.showToast(`Payment method "${name}" added and selected!`, 'success')
  newPaymentMethodName.value = ''
}

// ── Add Equipment Product State & Modal ──
const showAddProductModal = ref(false)
const activeProductRowIndex = ref(0)
const newProductObj = ref({
  name: '',
  category: 'Ultrasound Machines',
  sku: '',
  costPrice: 450000,
  sellingPrice: 650000,
  stockQty: 1,
  minStock: 2,
  hsnCode: '9018.1200',
  barcode: ''
})

function openAddProductModal(index = 0) {
  activeProductRowIndex.value = index
  newProductObj.value = {
    name: '',
    category: 'Ultrasound Machines',
    sku: `SKU-${Date.now().toString().slice(-4)}`,
    costPrice: 450000,
    sellingPrice: 650000,
    stockQty: 1,
    minStock: 2,
    hsnCode: '9018.1200',
    barcode: ''
  }
  showAddProductModal.value = true
}

function handleSaveNewProduct() {
  if (!newProductObj.value.name.trim()) {
    uiStore.showModal('Validation Error', 'Equipment Product Name is required.', 'warning')
    return
  }
  const name = newProductObj.value.name.trim()
  const targetBranch = !authStore.isSuperAdmin
    ? (form.value.branch || authStore.userBranch || 'Karachi')
    : (form.value.branch || 'Karachi')

  const createdProd = {
    id: `prod_${Date.now()}`,
    name: name,
    category: newProductObj.value.category || 'General Equipment',
    sku: newProductObj.value.sku || `SKU-${Date.now().toString().slice(-4)}`,
    barcode: newProductObj.value.barcode || '',
    hsnCode: newProductObj.value.hsnCode || '9018.9000',
    allocationCity: targetBranch,
    allocationCities: [targetBranch],
    costPrice: Number(newProductObj.value.costPrice) || 0,
    sellingPrice: Number(newProductObj.value.sellingPrice) || 0,
    stockQty: 0,
    minStock: Number(newProductObj.value.minStock) || 2,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
  }

  dataStore.products.unshift(createdProd)
  dataStore.saveState()

  // API Call to save equipment in MongoDB Atlas
  try {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createdProd)
    }).catch(() => {})
  } catch (e) {}

  if (rows.value[activeProductRowIndex.value]) {
    rows.value[activeProductRowIndex.value].productId = createdProd.id
    rows.value[activeProductRowIndex.value].isNewPart = false
    onProductSelect(rows.value[activeProductRowIndex.value])
  }

  showAddProductModal.value = false
  uiStore.showToast(`Equipment "${name}" registered for ${targetBranch}!`, 'success')
}

// ── Header & Consignment Form State ──
const form = ref({
  blNumber: '',
  blDate: new Date().toISOString().substring(0, 10),
  supplier: '',
  shipmentDetails: 'Vessel MAERSK 40ft HQ / Karachi Port',
  branch: 'Karachi',
  paymentTerms: 'Due on Receipt',
  paymentType: 'Cash Payment',
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
    serials: [] // Array of { serialCode, machineCode }
  }
])

// ── Supplier Search & Party Modal ──
const isSupplierDropdownOpen = ref(false)
const supplierSearchQuery = ref('')
const showAddSupplierModal = ref(false)
const newSupplierObj = ref({
  name: '',
  type: 'Supplier / Exporter (Creditor)',
  branch: 'Peshawar',
  phone: '',
  email: '',
  creditLimit: 1000000,
  openingBalance: 0,
  address: ''
})

// ── Barcode Scanner Modal State ──
const showScannerModal = ref(false)
const activeScannerRowIndex = ref(0)
const scannerSearchQuery = ref('')
const scannerInputRef = ref(null)

// ── Serial Number Modal State (Center popup) ──
const showSerialModal = ref(false)
const activeSerialRowIndex = ref(0)
const newSerialInputText = ref('')
const serialInputRef = ref(null)
const serialGenerator = ref({
  machineCodePrefix: 'WD-35',
  startSerialNum: 1001
})

// Reset / Populate on Modal Open
watch(() => uiStore.showGlobalPurchaseModal, (isOpen) => {
  if (isOpen) {
    if (uiStore.editingPurchaseData) {
      const edit = uiStore.editingPurchaseData
      form.value.blNumber = edit.blNumber || edit.containerNo || ''
      form.value.blDate = edit.blDate || edit.arrivalDate || edit.receivingDate || new Date().toISOString().substring(0, 10)
      form.value.supplier = edit.supplierName || edit.supplier || edit.companyName || 'Mindray Global Imports'
      form.value.shipmentDetails = edit.shipmentDetails || 'Vessel MAERSK 40ft HQ / Karachi Port'
      form.value.branch = edit.branch || edit.destinationCity || authStore.userBranch || 'Karachi'
      form.value.paymentTerms = edit.paymentTerms || 'Due on Receipt'
      form.value.paymentType = edit.paymentType || 'Cash Payment'
      form.value.description = edit.description || edit.notes || ''

      const directExp = edit.directExpenses || {}
      const indirectExp = edit.indirectExpenses || {}
      form.value.directCustomsDuty = directExp.customsDuty || edit.directCustomsDuty || Math.round((edit.landingCost || 0) * 0.4)
      form.value.directFreightPort = directExp.freightPort || edit.directFreightPort || Math.round((edit.landingCost || 0) * 0.3)
      form.value.directDemurrageLanding = directExp.demurrageLanding || edit.directDemurrageLanding || 0
      form.value.indirectTransportation = indirectExp.transportation || edit.indirectTransportation || Math.round((edit.landingCost || 0) * 0.15)
      form.value.indirectInsurance = indirectExp.insurance || edit.indirectInsurance || Math.round((edit.landingCost || 0) * 0.1)
      form.value.indirectWarehousingMisc = indirectExp.warehousingMisc || edit.indirectWarehousingMisc || Math.round((edit.landingCost || 0) * 0.05)
      form.value.discount = edit.discount || 0
      form.value.roundOff = false
      form.value.paidAmount = edit.paidAmount || edit.amountPaid || 0

      // Populate item rows
      if (edit.items && edit.items.length > 0) {
        rows.value = edit.items.map((it, idx) => {
          const prod = dataStore.products.find(p => p.id === it.productId || p.sku === (it.sku || it.productCode))
          const qty = Number(it.quantity || it.qty || 1)
          const unitPrice = Number(it.costPrice || it.unitPrice || it.unitCost || (prod ? prod.costPrice : 450000))
          const serials = (it.serials || []).map(s => typeof s === 'string' ? { serialCode: s, machineCode: '' } : s)
          return {
            id: `row_${Date.now()}_${idx}`,
            productId: prod?.id || it.productId || '',
            isNewPart: false,
            newPartName: '',
            newPartSku: '',
            newPartCategory: 'Ultrasound Machines',
            newPartSellingPrice: prod?.sellingPrice || 650000,
            newPartMinStock: 2,
            qty,
            unitPrice,
            taxRate: it.taxRate || 0,
            taxAmount: it.taxAmount || 0,
            amount: qty * unitPrice,
            serials
          }
        })
      } else {
        const prod = dataStore.products.find(p => p.sku === edit.productCode || p.name === edit.productName) || dataStore.products?.[0]
        const qty = Number(edit.totalUnits || edit.quantity || 5)
        const unitPrice = Number(edit.purchaseCost ? (edit.purchaseCost / qty) : (prod?.costPrice || 450000))
        const serialsList = (edit.serialNumbers || edit.serials || []).map(s => typeof s === 'string' ? { serialCode: s, machineCode: '' } : s)
        rows.value = [{
          id: `row_${Date.now()}`,
          productId: prod?.id || '',
          isNewPart: false,
          newPartName: '',
          newPartSku: '',
          newPartCategory: 'Ultrasound Machines',
          newPartSellingPrice: prod?.sellingPrice || 650000,
          newPartMinStock: 2,
          qty,
          unitPrice,
          taxRate: 0,
          taxAmount: 0,
          amount: qty * unitPrice,
          serials: serialsList
        }]
      }
    } else {
      const currentBranch = authStore.userBranch || (dataStore.activeBranchFilter && dataStore.activeBranchFilter !== 'All' ? dataStore.activeBranchFilter : 'Karachi')
      const blCount = (dataStore.blList?.length || 0) + 1
      form.value.blNumber = `BL-MED-2026-${String(blCount).padStart(2, '0')}`
      form.value.blDate = new Date().toISOString().substring(0, 10)
      form.value.supplier = 'Mindray Global Imports'
      form.value.shipmentDetails = 'Vessel MAERSK 40ft HQ / Karachi Port'
      form.value.branch = currentBranch
      form.value.paymentTerms = 'Due on Receipt'
      form.value.paymentType = 'Cash Payment'
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
          serials: []
        }
      ]
    }
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
    { name: 'Al-Madina Medical Supplies', type: 'Local Vendor', branch: 'Karachi' },
    { name: 'Khyber Surgical Imports', type: 'Distributor', branch: 'Peshawar' },
    { name: 'Lahore Surgical Trading', type: 'Local Vendor', branch: 'Lahore' },
    { name: 'Multan Medix Traders', type: 'Local Vendor', branch: 'Multan' },
    { name: 'Islamabad Diagnostic Supplies', type: 'Local Vendor', branch: 'Islamabad' }
  ]
  seededSuppliers.forEach(s => map.set(s.name.trim().toLowerCase(), s))
  ;(dataStore.customers || []).forEach(c => {
    if (c.name) {
      const key = c.name.trim().toLowerCase()
      if (!map.has(key)) {
        map.set(key, { name: c.name, type: c.type || 'Registered Party', branch: c.branch || 'Pakistan' })
      }
    }
  })
  const all = Array.from(map.values())
  if (authStore.isSuperAdmin) {
    return all
  }
  const currentBranch = (form.value.branch || authStore.userBranch || 'Lahore').toLowerCase()
  return all.filter(s => {
    const sBranch = (s.branch || '').toLowerCase()
    return sBranch.includes(currentBranch) ||
           currentBranch.includes(sBranch) ||
           sBranch.includes('global') ||
           sBranch.includes('europe') ||
           sBranch.includes('tokyo') ||
           sBranch.includes('chicago') ||
           sBranch.includes('pakistan') ||
           sBranch.includes('oem') ||
           sBranch.includes('port') ||
           !sBranch
  })
})

function handleSaveNewSupplier() {
  if (!newSupplierObj.value.name.trim()) {
    uiStore.showModal('Validation Error', 'Party name is required.', 'warning')
    return
  }
  const sName = newSupplierObj.value.name.trim()
  const partyBranch = !authStore.isSuperAdmin 
    ? (form.value.branch || authStore.userBranch || 'Karachi') 
    : (newSupplierObj.value.branch || form.value.branch || 'Karachi')

  const partyDoc = {
    id: `cust_${Date.now()}`,
    name: sName,
    type: newSupplierObj.value.type || 'Supplier / Exporter (Creditor)',
    branch: partyBranch,
    phone: newSupplierObj.value.phone || '',
    email: newSupplierObj.value.email || '',
    creditLimit: Number(newSupplierObj.value.creditLimit || 1000000),
    balance: Number(newSupplierObj.value.openingBalance || 0),
    openingBalance: Number(newSupplierObj.value.openingBalance || 0),
    address: newSupplierObj.value.address || '',
    category: newSupplierObj.value.type?.includes('Debtor') ? 'REGULAR' : 'SUPPLIER'
  }

  dataStore.customers.unshift(partyDoc)
  dataStore.saveState()

  // API Call to save supplier/party in MongoDB Atlas
  try {
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partyDoc)
    }).catch(() => {})
  } catch (e) {}

  form.value.supplier = sName
  showAddSupplierModal.value = false
  uiStore.showToast(`Party "${sName}" registered for ${partyBranch}!`, 'success')
  newSupplierObj.value = {
    name: '',
    type: 'Supplier / Exporter (Creditor)',
    branch: partyBranch,
    phone: '',
    email: '',
    creditLimit: 1000000,
    openingBalance: 0,
    address: ''
  }
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

// ── Barcode Scanner Modal Logic ──
function openScannerModal(index) {
  activeScannerRowIndex.value = index
  scannerSearchQuery.value = ''
  showScannerModal.value = true
  nextTick(() => {
    scannerInputRef.value?.focus()
  })
}

const filteredScannerProducts = computed(() => {
  const list = dataStore.products || []
  const q = (scannerSearchQuery.value || '').trim().toLowerCase()
  if (!q) return list.slice(0, 15)
  return list.filter(p =>
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.sku && p.sku.toLowerCase().includes(q)) ||
    (p.barcode && p.barcode.toLowerCase().includes(q)) ||
    (p.hsnCode && p.hsnCode.toLowerCase().includes(q)) ||
    (p.category && p.category.toLowerCase().includes(q))
  )
})

function selectScannedProduct(prod) {
  const targetRow = rows.value[activeScannerRowIndex.value]
  if (targetRow && prod) {
    targetRow.productId = prod.id
    targetRow.isNewPart = false
    onProductSelect(targetRow)
  }
  showScannerModal.value = false
}

function handleScanSubmit() {
  const q = (scannerSearchQuery.value || '').trim().toLowerCase()
  if (!q) return
  const match = (dataStore.products || []).find(p =>
    (p.barcode && p.barcode.toLowerCase() === q) ||
    (p.sku && p.sku.toLowerCase() === q) ||
    (p.hsnCode && p.hsnCode.toLowerCase() === q) ||
    (p.name && p.name.toLowerCase() === q) ||
    (p.name && p.name.toLowerCase().includes(q))
  )
  if (match) {
    selectScannedProduct(match)
  } else {
    uiStore.showModal('Barcode Not Found', `No equipment SKU matched "${scannerSearchQuery.value}".`, 'warning')
  }
}

// ── Serial Number Modal Handlers ──
const activeSerialRow = computed(() => rows.value[activeSerialRowIndex.value])
const activeRowSerials = computed(() => activeSerialRow.value?.serials || [])
const activeProductName = computed(() => {
  if (!activeSerialRow.value) return ''
  if (activeSerialRow.value.isNewPart) return activeSerialRow.value.newPartName || 'New Equipment'
  const p = (dataStore.products || []).find(prod => prod.id === activeSerialRow.value.productId)
  return p ? `${p.name} (${p.sku})` : 'Medical Equipment'
})

const previewMachineCodeRange = computed(() => {
  const row = activeSerialRow.value
  const qty = Number(row?.qty) || 1
  const rawPrefix = (serialGenerator.value.machineCodePrefix || '').trim()
  if (!rawPrefix) return ''
  const match = rawPrefix.match(/^(.*?)(\d+)$/)
  if (match) {
    const base = match[1]
    const startNum = parseInt(match[2], 10)
    const pad = match[2].length
    const firstCode = `${base}${String(startNum).padStart(pad, '0')}`
    const lastCode = `${base}${String(startNum + qty - 1).padStart(pad, '0')}`
    return qty > 1 ? `${firstCode} to ${lastCode}` : firstCode
  }
  return `${rawPrefix}-1 to ${rawPrefix}-${qty}`
})

function openSerialModal(index) {
  activeSerialRowIndex.value = index
  const row = rows.value[index]
  const p = (dataStore.products || []).find(prod => prod.id === row.productId)
  const sku = row.isNewPart ? (row.newPartSku || 'WD') : (p?.sku || 'WD')
  const cleanSku = sku.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  
  if (!serialGenerator.value.machineCodePrefix || serialGenerator.value.machineCodePrefix === 'MC-101') {
    serialGenerator.value.machineCodePrefix = `${cleanSku || 'WD'}-35`
  }
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

  const rawPrefix = (serialGenerator.value.machineCodePrefix || 'WD-35').trim()
  const match = rawPrefix.match(/^(.*?)(\d+)$/)
  let mCode = ''
  if (match) {
    const base = match[1]
    const num = parseInt(match[2], 10)
    const pad = match[2].length
    mCode = `${base}${String(num + row.serials.length).padStart(pad, '0')}`
  } else {
    mCode = `${rawPrefix}-${row.serials.length + 1}`
  }

  row.serials.push({ serialCode: code || mCode, machineCode: mCode })
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

  const list = []
  const rawPrefix = (serialGenerator.value.machineCodePrefix || 'WD-35').trim()
  const match = rawPrefix.match(/^(.*?)(\d+)$/)

  for (let i = 0; i < targetQty; i++) {
    let mCode = ''
    if (match) {
      const base = match[1]
      const startNum = parseInt(match[2], 10)
      const pad = match[2].length
      mCode = `${base}${String(startNum + i).padStart(pad, '0')}`
    } else {
      mCode = `${rawPrefix}-${i + 1}`
    }
    // Machine code is the primary identifier
    list.push({ serialCode: mCode, machineCode: mCode })
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

  try {
    const generatedSerialsList = []
    const poItems = []
    const containerItems = []
    const blNo = form.value.blNumber.trim().toUpperCase()
    const partyName = form.value.supplier.trim()
    const branchName = form.value.branch || 'Karachi'
    const blDate = form.value.blDate || new Date().toISOString().substring(0, 10)

    for (const r of rows.value) {
      let targetProduct = null

      if (r.isNewPart) {
        if (!r.newPartName.trim()) {
          uiStore.showModal('Validation Error', 'Please enter New Equipment Name.', 'warning')
          return
        }
        const rawName = r.newPartName.trim()
        const cleanSku = (r.newPartSku && r.newPartSku.trim()) 
          ? r.newPartSku.trim().toUpperCase() 
          : (rawName.replace(/[^A-Za-z0-9]/g, '').substring(0, 8).toUpperCase() || 'EQP-MED')
        
        targetProduct = {
          id: `prd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          sku: cleanSku,
          name: rawName,
          category: r.newPartCategory || 'Ultrasound Machines',
          division: 'Medimage Services',
          hsnCode: '9018.9000',
          taxRatio: r.taxRate || 18,
          allocationCity: branchName,
          allocationCities: [branchName],
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
          if (!targetProduct.allocationCities) targetProduct.allocationCities = [targetProduct.allocationCity || branchName]
          if (!targetProduct.allocationCities.includes(branchName)) targetProduct.allocationCities.push(branchName)
          targetProduct.allocationCity = targetProduct.allocationCities.join(', ')
        }
      }

      if (!targetProduct) continue

      // Serials for this row
      const rowQty = Number(r.qty) || 1
      const rawPrefix = (serialGenerator.value.machineCodePrefix || 'WD-35').trim()
      const match = rawPrefix.match(/^(.*?)(\d+)$/)

      for (let i = 0; i < rowQty; i++) {
        const sItem = r.serials[i]
        let machineCode = sItem?.machineCode
        if (!machineCode) {
          if (match) {
            const base = match[1]
            const startNum = parseInt(match[2], 10)
            const pad = match[2].length
            machineCode = `${base}${String(startNum + i).padStart(pad, '0')}`
          } else {
            machineCode = `${rawPrefix}-${i + 1}`
          }
        }
        const serialCode = sItem?.serialCode || machineCode

        const serialDoc = {
          serialCode,
          machineCode,
          productId: targetProduct.id,
          sku: targetProduct.sku,
          status: 'Available',
          allocationCity: branchName,
          binLocation: targetProduct.storageBin || 'HQ-PEW-01',
          registeredDate: blDate,
          purchaseInvoiceNo: blNo,
          purchaseDate: blDate,
          blNumber: blNo,
          containerNo: blNo,
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

    if (uiStore.editingPurchaseData) {
      const origId = uiStore.editingPurchaseData.blNumber || uiStore.editingPurchaseData.id
      await dataStore.updateBL(origId, {
        blNumber: blNo,
        blDate: blDate,
        supplier: partyName,
        supplierName: partyName,
        companyName: partyName,
        shipmentDetails: form.value.shipmentDetails || `${branchName} Inbound Warehouse Consignment`,
        destinationCity: branchName,
        branch: branchName,
        receivingDate: blDate,
        arrivalDate: blDate,
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
        purchaseCost: computedSubtotal.value,
        landingCost: computedDirectExpenses.value + computedIndirectExpenses.value,
        totalCostValue: computedGrandTotal.value,
        totalUnits: totalItemsCount.value,
        items: containerItems,
        serialNumbers: generatedSerialsList.map(s => s.serialCode)
      }, authStore.user)

      uiStore.closePurchaseModal()
      uiStore.showModal(
        'BL Consignment Updated',
        `Consignment ${blNo} for ${partyName} updated successfully! Total Cost: PKR ${computedGrandTotal.value.toLocaleString()}`,
        'success'
      )
      return
    }

    // Register Container Consignment
    const newContainer = {
      id: `con_${Date.now()}`,
      containerNo: blNo,
      blNumber: blNo,
      blDate: blDate,
      companyName: partyName,
      supplierName: partyName,
      shipmentDetails: form.value.shipmentDetails || `${branchName} Inbound Warehouse Consignment`,
      destinationCity: branchName,
      branch: branchName,
      receivingDate: blDate,
      arrivalDate: blDate,
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
      purchaseCost: computedSubtotal.value,
      landingCost: computedDirectExpenses.value + computedIndirectExpenses.value,
      totalCostValue: computedGrandTotal.value,
      totalUnits: totalItemsCount.value,
      items: containerItems
    }
    dataStore.containers.unshift(newContainer)

    // Register Purchase Order
    await dataStore.createPurchaseOrder({
      poNumber: `PO-${blNo}`,
      supplier: partyName,
      allocationCity: branchName,
      branch: branchName,
      blNumber: blNo,
      orderDate: blDate,
      items: poItems,
      generatedSerials: generatedSerialsList,
      alreadyUpdatedStock: true,
      totalAmount: computedGrandTotal.value,
      paidAmount: Number(form.value.paidAmount) || 0,
      paymentType: form.value.paymentType,
      description: form.value.description
    }, authStore.user)

    dataStore.saveState()

    // Automatically and immediately close the modal
    uiStore.closePurchaseModal()
    uiStore.showToast(`Purchase Bill & BL Consignment ${blNo} saved successfully!`, 'success')
  } catch (err) {
    uiStore.showModal('Save Error', err.message || 'An unexpected error occurred while saving the bill.', 'danger')
  }
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
