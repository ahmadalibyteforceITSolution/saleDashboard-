<template>
  <div v-if="uiStore.showGlobalPurchaseModal" class="modal-backdrop" @click.self="uiStore.closePurchaseModal">
    <div class="modal-content max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700">
      <!-- Modal Header -->
      <div class="modal-header flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Anchor :size="18" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-white leading-tight">Register New Bill of Lading (BL) Import</h3>
            <p class="text-[11px] text-slate-400">Add equipment parts, direct/indirect expenses, barcode scanner & serials</p>
          </div>
        </div>
        <button @click="uiStore.closePurchaseModal" class="btn btn-ghost text-slate-400 hover:text-white">✕</button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <form @submit.prevent="handleCreateBL" class="flex flex-col flex-1 overflow-hidden m-0">
        <div class="modal-body p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
          
          <!-- ── SECTION 1: Consignment Logistics ── -->
          <div class="space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <FileText :size="13" />
                <span>1. Consignment Logistics & BL Metadata</span>
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-bold mb-1 block">BL Number *</label>
                <input v-model="form.blNumber" type="text" required placeholder="e.g. BL-MED-2026-04" class="form-input w-full p-2 border rounded font-mono font-bold" />
              </div>
              <div class="form-group">
                <label class="form-label font-bold mb-1 block">BL Date *</label>
                <input v-model="form.blDate" type="date" required class="form-input w-full p-2 border rounded font-mono font-bold" />
              </div>
            </div>

            <!-- Supplier / Exporter with Custom Searchable Dropdown & + Add Party Button -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-group relative">
                <div class="flex items-center justify-between mb-1">
                  <label class="form-label font-bold mb-0">Supplier / Exporter *</label>
                  <button
                    type="button"
                    @click="showAddSupplierModal = true"
                    class="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus :size="12" />
                    <span>+ Add Party</span>
                  </button>
                </div>

                <!-- Custom Clickable Dropdown Trigger -->
                <div
                  @click="isSupplierDropdownOpen = !isSupplierDropdownOpen"
                  class="form-select flex items-center justify-between cursor-pointer text-xs font-bold w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white min-h-[38px] hover:border-teal-500 transition-all"
                  :class="{ 'border-teal-500 ring-1 ring-teal-500/40': isSupplierDropdownOpen }"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span v-if="form.supplier" class="font-bold text-white truncate">{{ form.supplier }}</span>
                    <span v-else class="text-slate-400 flex items-center gap-1.5">
                      <Search :size="13" class="text-slate-500" />
                      <span>Select or search supplier party...</span>
                    </span>
                  </div>

                  <div class="flex items-center gap-1 text-slate-400 ml-2 shrink-0">
                    <button
                      v-if="form.supplier"
                      type="button"
                      @click.stop="form.supplier = ''"
                      class="hover:text-red-400 p-0.5 text-xs font-bold"
                    >
                      ✕
                    </button>
                    <ChevronDown :size="14" class="transition-transform duration-200" :class="{ 'rotate-180 text-teal-400': isSupplierDropdownOpen }" />
                  </div>
                </div>

                <!-- Expandable Searchable Parties List -->
                <div
                  v-if="isSupplierDropdownOpen"
                  class="absolute z-50 left-0 right-0 mt-1 bg-[#0b1329] border border-teal-500/60 rounded-xl p-2.5 space-y-2 shadow-2xl"
                >
                  <div class="relative">
                    <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      v-model="supplierSearchQuery"
                      type="text"
                      placeholder="Search supplier name, country, city..."
                      class="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>

                  <div class="overflow-y-auto space-y-1 pr-1 max-h-48 custom-scrollbar">
                    <div
                      v-for="s in filteredSuppliersList"
                      :key="s.name"
                      @click="selectSupplier(s.name)"
                      class="p-2 rounded-lg hover:bg-slate-800/90 cursor-pointer transition-colors flex items-center justify-between gap-2 border border-slate-800/80 hover:border-teal-500/60"
                      :class="{ 'bg-teal-950/70 border-teal-500/80': form.supplier === s.name }"
                    >
                      <div class="min-w-0 flex-1">
                        <span class="font-bold text-white text-xs block truncate">{{ s.name }}</span>
                        <span class="text-[10px] text-slate-400">{{ s.type || 'International Exporter' }} • {{ s.branch || 'Global Hub' }}</span>
                      </div>
                      <span class="badge badge-info text-[9px] py-0 px-1 font-mono">SUPPLIER</span>
                    </div>

                    <div v-if="filteredSuppliersList.length === 0" class="p-3 text-center text-xs text-slate-400 space-y-1.5">
                      <p>No party matches "{{ supplierSearchQuery }}"</p>
                      <button
                        type="button"
                        @click="createAndSelectSupplier(supplierSearchQuery)"
                        class="btn btn-xs btn-primary font-bold text-xs"
                      >
                        + Add "{{ supplierSearchQuery }}" as Supplier
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Shipment Details / Origin Port *</label>
                <input v-model="form.shipmentDetails" type="text" required placeholder="e.g. Vessel MAERSK 40ft HQ / Karachi Port" class="form-input w-full p-2 border rounded" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-bold mb-1 block flex items-center justify-between">
                  <span>Destination Branch / Warehouse *</span>
                  <span v-if="!authStore.isSuperAdmin" class="text-[10px] text-emerald-400 font-semibold">🔒 Locked</span>
                </label>
                <div
                  v-if="!authStore.isSuperAdmin"
                  class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white font-bold text-xs flex items-center justify-between select-none cursor-not-allowed"
                >
                  <span class="flex items-center gap-1.5 text-slate-200">
                    <span>📍</span>
                    <span>{{ authStore.userBranch || 'Lahore' }} Depot</span>
                  </span>
                  <span class="badge badge-success text-[10px] py-0 px-1.5 font-mono">Assigned</span>
                </div>
                <select v-else v-model="form.branch" class="form-select w-full p-2 border rounded font-bold">
                  <option value="Peshawar">Peshawar HO</option>
                  <option value="Multan">Multan Branch</option>
                  <option value="Lahore">Lahore Branch</option>
                  <option value="Islamabad">Islamabad Branch</option>
                  <option value="Karachi">Karachi Branch</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Receiving / Arrival Date *</label>
                <input v-model="form.receivingDate" type="date" required class="form-input w-full p-2 border rounded font-mono font-bold" />
              </div>
            </div>
          </div>

          <!-- ── SECTION 2: Equipment / Part Selection with Barcode Scanner & Add New Part ── -->
          <div class="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Package :size="13" />
                <span>2. Equipment Product / Part Selection</span>
              </span>

              <div class="flex items-center gap-2">
                <!-- Scan Barcode Button -->
                <button
                  type="button"
                  @click="showProductBarcodeScanner = !showProductBarcodeScanner"
                  class="btn btn-xs bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold flex items-center gap-1 cursor-pointer"
                  title="Scan Product / Carton Barcode"
                >
                  <QrCode :size="12" />
                  <span>Scan Barcode</span>
                </button>

                <!-- Toggle: Choose Existing vs Add New Part -->
                <div class="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    @click="partMode = 'existing'"
                    :class="['px-2.5 py-1 rounded text-xs font-bold transition-all', partMode === 'existing' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white']"
                  >
                    📦 Existing Product
                  </button>
                  <button
                    type="button"
                    @click="partMode = 'new'"
                    :class="['px-2.5 py-1 rounded text-xs font-bold transition-all', partMode === 'new' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white']"
                  >
                    ➕ Add New Part / Equipment
                  </button>
                </div>
              </div>
            </div>

            <!-- Barcode Scanner Input Box -->
            <div v-if="showProductBarcodeScanner" class="p-3 bg-indigo-950/40 rounded-lg border border-indigo-500/40 space-y-2">
              <div class="flex items-center justify-between text-xs text-indigo-300 font-bold">
                <span class="flex items-center gap-1.5">
                  <QrCode :size="14" />
                  <span>Live Product Barcode / SKU Scanner</span>
                </span>
                <span class="text-[10px] text-slate-400">Ready for USB/Camera Scanner</span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  ref="barcodeInputRef"
                  v-model="scannedBarcodeText"
                  type="text"
                  placeholder="Scan product barcode, HSN, or SKU code (e.g. AN-BC-WRM01 or US10-8800)..."
                  @keyup.enter="handleBarcodeScanned"
                  class="form-input flex-1 p-2 bg-slate-950 border border-indigo-500 rounded font-mono text-xs text-white"
                />
                <button
                  type="button"
                  @click="handleBarcodeScanned"
                  class="btn btn-primary btn-xs font-bold px-3"
                >
                  Lookup
                </button>
              </div>
            </div>

            <!-- Mode A: Select Existing Product -->
            <div v-if="partMode === 'existing'" class="form-group">
              <label class="form-label font-bold mb-1 block">Select Equipment Product SKU *</label>
              <select v-model="form.productId" required class="form-select w-full p-2.5 border rounded font-bold bg-slate-950 text-white">
                <option value="" disabled>Choose Product SKU...</option>
                <option v-for="p in dataStore.products" :key="p.id" :value="p.id">
                  {{ p.name }} (SKU: {{ p.sku }}) — Current Cost: PKR {{ (p.costPrice || 0).toLocaleString() }}
                </option>
              </select>
            </div>

            <!-- Mode B: Inline Add New Part / Equipment -->
            <div v-if="partMode === 'new'" class="space-y-3 bg-amber-950/20 p-3.5 rounded-lg border border-amber-500/30">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="sm:col-span-2 form-group">
                  <label class="form-label font-bold mb-1 block text-amber-300">New Part / Equipment Name *</label>
                  <input v-model="newPart.name" type="text" placeholder="e.g. 12 Inch Portable Ultrasound Scanner Probe" class="form-input w-full p-2 border rounded font-bold" />
                </div>
                <div class="form-group">
                  <label class="form-label font-bold mb-1 block text-amber-300">Part SKU / Code *</label>
                  <input v-model="newPart.sku" type="text" placeholder="e.g. PRB-US12-01" class="form-input w-full p-2 border rounded font-mono font-bold uppercase" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="form-group">
                  <label class="form-label font-bold mb-1 block text-amber-300">Category *</label>
                  <select v-model="newPart.category" class="form-select w-full p-2 border rounded font-bold">
                    <option value="Ultrasound Machines">Ultrasound Machines</option>
                    <option value="Laser Systems">Laser Systems</option>
                    <option value="Cardiology Equipment">Cardiology Equipment</option>
                    <option value="Hospital Furniture">Hospital Furniture</option>
                    <option value="Neonatal Care Equipment">Neonatal Care Equipment</option>
                    <option value="Surgical Equipment">Surgical Equipment</option>
                    <option value="Respiratory Care">Respiratory Care</option>
                    <option value="Parts & Accessories">Parts & Accessories</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label font-bold mb-1 block text-amber-300">Selling Price (PKR)</label>
                  <input v-model.number="newPart.sellingPrice" type="number" min="0" placeholder="e.g. 350000" class="form-input w-full p-2 border rounded font-mono font-bold text-emerald-400" />
                </div>
                <div class="form-group">
                  <label class="form-label font-bold mb-1 block text-amber-300">Min Stock Alert</label>
                  <input v-model.number="newPart.minStock" type="number" min="1" class="form-input w-full p-2 border rounded font-mono" />
                </div>
              </div>
            </div>
          </div>

          <!-- ── SECTION 3: Procurement Quantity & Base Purchase Cost ── -->
          <div class="space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Coins :size="13" />
                <span>3. Procurement Quantity & Base Cost</span>
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Import Quantity (Units) *</label>
                <input v-model.number="form.quantity" type="number" min="1" max="1000" required class="form-input w-full p-2 border rounded font-mono font-bold text-sky-400" />
              </div>
              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Total Purchase Base Cost (PKR) *</label>
                <input v-model.number="form.purchaseCost" type="number" min="0" required class="form-input w-full p-2 border rounded font-mono font-bold text-emerald-400" />
              </div>
            </div>
          </div>

          <!-- ── SECTION 4: Direct Expenses ── -->
          <div class="space-y-3 bg-blue-950/20 p-4 rounded-xl border border-blue-500/20">
            <div class="flex items-center justify-between border-b border-blue-500/30 pb-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Truck :size="13" />
                <span>4. Direct Inbound Expenses</span>
              </span>
              <span class="badge badge-info font-mono text-[11px] font-bold">
                Direct Total: PKR {{ computedDirectExpenses.toLocaleString() }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="form-group">
                <label class="form-label font-bold mb-1 block text-slate-300">Customs Duty & Tariffs (PKR)</label>
                <input v-model.number="form.directCustomsDuty" type="number" min="0" class="form-input w-full p-2 border rounded font-mono text-amber-300" />
              </div>
              <div class="form-group">
                <label class="form-label font-bold mb-1 block text-slate-300">Freight & Port Clearance (PKR)</label>
                <input v-model.number="form.directFreightPort" type="number" min="0" class="form-input w-full p-2 border rounded font-mono text-amber-300" />
              </div>
              <div class="form-group">
                <label class="form-label font-bold mb-1 block text-slate-300">Demurrage / Landing Charges (PKR)</label>
                <input v-model.number="form.directDemurrageLanding" type="number" min="0" class="form-input w-full p-2 border rounded font-mono text-amber-300" />
              </div>
            </div>
          </div>

          <!-- ── SECTION 5: Indirect Expenses ── -->
          <div class="space-y-3 bg-purple-950/20 p-4 rounded-xl border border-purple-500/20">
            <div class="flex items-center justify-between border-b border-purple-500/30 pb-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Calculator :size="13" />
                <span>5. Indirect Operating & Overhead Expenses</span>
              </span>
              <span class="badge badge-purple font-mono text-[11px] font-bold">
                Indirect Total: PKR {{ computedIndirectExpenses.toLocaleString() }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="form-group">
                <label class="form-label font-bold mb-1 block text-slate-300">Inland Transportation (PKR)</label>
                <input v-model.number="form.indirectTransportation" type="number" min="0" class="form-input w-full p-2 border rounded font-mono text-purple-300" />
              </div>
              <div class="form-group">
                <label class="form-label font-bold mb-1 block text-slate-300">Marine Transit Insurance (PKR)</label>
                <input v-model.number="form.indirectInsurance" type="number" min="0" class="form-input w-full p-2 border rounded font-mono text-purple-300" />
              </div>
              <div class="form-group">
                <label class="form-label font-bold mb-1 block text-slate-300">Warehousing, Labor & Misc (PKR)</label>
                <input v-model.number="form.indirectWarehousingMisc" type="number" min="0" class="form-input w-full p-2 border rounded font-mono text-purple-300" />
              </div>
            </div>
          </div>

          <!-- ── SECTION 6: Live Reactive Landed Cost Summary Card ── -->
          <div class="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 rounded-xl border border-teal-500/40 shadow-inner">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
              <div class="p-2 bg-slate-950/60 rounded border border-slate-800">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Base Cost</span>
                <span class="text-xs font-bold text-white block mt-0.5">PKR {{ (form.purchaseCost || 0).toLocaleString() }}</span>
              </div>
              <div class="p-2 bg-slate-950/60 rounded border border-slate-800">
                <span class="text-[10px] uppercase font-bold text-blue-400 block">+ Direct Exp</span>
                <span class="text-xs font-bold text-blue-300 block mt-0.5">PKR {{ computedDirectExpenses.toLocaleString() }}</span>
              </div>
              <div class="p-2 bg-slate-950/60 rounded border border-slate-800">
                <span class="text-[10px] uppercase font-bold text-purple-400 block">+ Indirect Exp</span>
                <span class="text-xs font-bold text-purple-300 block mt-0.5">PKR {{ computedIndirectExpenses.toLocaleString() }}</span>
              </div>
              <div class="p-2 bg-teal-950/80 rounded border border-teal-500/50">
                <span class="text-[10px] uppercase font-bold text-teal-300 block">= Total Landed Cost</span>
                <span class="text-sm font-black text-teal-400 block mt-0.5">PKR {{ computedTotalLandedCost.toLocaleString() }}</span>
                <span class="text-[10px] text-teal-200 block font-sans font-semibold">PKR {{ computedLandedCostPerUnit.toLocaleString() }} / unit</span>
              </div>
            </div>
          </div>

          <!-- ── SECTION 7: Machine Code & Serial Number Allocation ── -->
          <div class="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 flex-wrap gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <QrCode :size="13" />
                <span>6. Machine Codes & Unique Serial Numbers</span>
              </span>

              <div class="flex items-center gap-2">
                <!-- Scan Serial Barcode Button -->
                <button
                  type="button"
                  @click="showSerialBarcodeScanner = !showSerialBarcodeScanner"
                  class="btn btn-xs bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <QrCode :size="12" />
                  <span>Scan Serial Barcode</span>
                </button>

                <span class="text-[11px] font-mono text-sky-400 font-bold">
                  {{ form.quantity || 0 }} Units to allocate
                </span>
              </div>
            </div>

            <!-- Serial Barcode Scanner Input Box -->
            <div v-if="showSerialBarcodeScanner" class="p-3 bg-indigo-950/40 rounded-lg border border-indigo-500/40 space-y-2">
              <div class="flex items-center justify-between text-xs text-indigo-300 font-bold">
                <span class="flex items-center gap-1.5">
                  <QrCode :size="14" />
                  <span>Live Serial Barcode Rapid Scanner (Scan machine labels sequentially)</span>
                </span>
                <span class="text-[10px] font-mono text-emerald-400">Scanned: {{ scannedSerialCodesList.length }} / {{ form.quantity }}</span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  v-model="singleSerialScanInput"
                  type="text"
                  placeholder="Scan serial barcode on machine box and press Enter..."
                  @keyup.enter="handleSerialBarcodeScanned"
                  class="form-input flex-1 p-2 bg-slate-950 border border-indigo-500 rounded font-mono text-xs text-white"
                />
                <button
                  type="button"
                  @click="handleSerialBarcodeScanned"
                  class="btn btn-primary btn-xs font-bold px-3"
                >
                  Add Serial
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Starting Machine Code *</label>
                <input
                  v-model="form.startingMachineCode"
                  type="text"
                  placeholder="e.g. MC-101 or WD-35"
                  required
                  class="form-input w-full p-2 border rounded font-mono font-bold uppercase text-purple-300"
                />
              </div>

              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Serial Number Entry Method</label>
                <div class="flex items-center gap-3 pt-1.5">
                  <label class="flex items-center gap-1.5 cursor-pointer text-slate-200 text-xs font-semibold">
                    <input type="radio" value="sequential" v-model="form.serialInputMode" class="text-teal-600" />
                    <span>Auto Sequential</span>
                  </label>
                  <label class="flex items-center gap-1.5 cursor-pointer text-slate-200 text-xs font-semibold">
                    <input type="radio" value="bulkPaste" v-model="form.serialInputMode" class="text-teal-600" />
                    <span>Paste Bulk Serials</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Mode 1: Auto Sequential -->
            <div v-if="form.serialInputMode === 'sequential'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Serial Prefix</label>
                <input v-model="form.serialPrefix" type="text" placeholder="e.g. US10- or SN-" class="form-input w-full p-2 border rounded font-mono uppercase" />
              </div>
              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Starting Serial #</label>
                <input v-model.number="form.startSerialNum" type="number" min="1" class="form-input w-full p-2 border rounded font-mono font-bold" />
              </div>
            </div>

            <!-- Mode 2: Bulk Paste -->
            <div v-if="form.serialInputMode === 'bulkPaste'" class="form-group">
              <label class="form-label font-bold mb-1 block">Paste Serial Numbers (one per line or comma-separated)</label>
              <textarea
                v-model="form.bulkSerialsRawText"
                rows="3"
                placeholder="Paste serial numbers here:&#10;SN-8801&#10;SN-8802&#10;SN-8803..."
                class="form-textarea w-full p-2 border rounded font-mono text-xs"
              ></textarea>
            </div>

            <!-- Live Unit Mapping Grid Preview -->
            <div v-if="computedBLUnitMapping.length > 0" class="glass-panel p-3 text-xs space-y-2 border border-teal-500/20 bg-slate-950/80 rounded-lg">
              <div class="flex justify-between items-center font-bold text-slate-300">
                <span>Unit Mapping Preview ({{ computedBLUnitMapping.length }} units):</span>
                <span class="text-teal-400 font-mono text-[11px]">📍 {{ form.branch }} Depot</span>
              </div>
              <div class="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono">
                <div
                  v-for="(unit, idx) in computedBLUnitMapping.slice(0, 12)"
                  :key="idx"
                  class="flex justify-between items-center py-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-[11px]"
                >
                  <span class="text-purple-400 font-bold">Code: {{ unit.machineCode }}</span>
                  <span class="text-slate-500">↔</span>
                  <span class="text-teal-300 font-bold">Serial: {{ unit.serialCode }}</span>
                </div>
                <div v-if="computedBLUnitMapping.length > 12" class="text-center text-[10px] text-slate-400 italic py-0.5">
                  ... and {{ computedBLUnitMapping.length - 12 }} more units
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="modal-footer px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button type="button" @click="uiStore.closePurchaseModal" class="btn btn-secondary text-xs font-bold py-2 px-4">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary text-xs font-bold py-2 px-5 flex items-center gap-1.5 shadow-lg cursor-pointer">
            <Anchor :size="14" />
            <span>Confirm & Register BL Consignment</span>
          </button>
        </div>
      </form>
    </div>

    <!-- ── SUB-MODAL: Add Supplier / Exporter Party Inline ── -->
    <div v-if="showAddSupplierModal" class="modal-backdrop" style="z-index: 10000;" @click.self="showAddSupplierModal = false">
      <div class="modal-content max-w-md p-5 space-y-4 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <UserPlus :size="16" class="text-teal-400" />
            <span>Add New Supplier / Vendor Party</span>
          </h4>
          <button @click="showAddSupplierModal = false" class="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="form-label font-bold mb-1 block">Party / Supplier Name *</label>
            <input v-model="newSupplierForm.name" type="text" placeholder="e.g. Shenzhen MedTech Global" class="form-input w-full p-2 border rounded font-bold bg-slate-950 text-white" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="form-label font-bold mb-1 block">Party Type</label>
              <select v-model="newSupplierForm.type" class="form-select w-full p-2 border rounded font-bold bg-slate-950 text-white">
                <option value="Supplier / Exporter">Supplier / Exporter</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Local Vendor">Local Vendor</option>
              </select>
            </div>
            <div>
              <label class="form-label font-bold mb-1 block">Branch / Hub</label>
              <input v-model="newSupplierForm.branch" type="text" placeholder="e.g. Karachi / Global" class="form-input w-full p-2 border rounded font-bold bg-slate-950 text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="form-label font-bold mb-1 block">Phone / Contact</label>
              <input v-model="newSupplierForm.phone" type="text" placeholder="+86 755 889900" class="form-input w-full p-2 border rounded bg-slate-950 text-white" />
            </div>
            <div>
              <label class="form-label font-bold mb-1 block">Origin Port / City</label>
              <input v-model="newSupplierForm.city" type="text" placeholder="e.g. Shenzhen, China" class="form-input w-full p-2 border rounded bg-slate-950 text-white" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" @click="showAddSupplierModal = false" class="btn btn-secondary btn-xs">Cancel</button>
          <button type="button" @click="handleSaveNewSupplier" class="btn btn-primary btn-xs font-bold">Save Party</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  Anchor,
  FileText,
  Package,
  Coins,
  Truck,
  Calculator,
  QrCode,
  Plus,
  Search,
  ChevronDown,
  UserPlus
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const partMode = ref('existing') // 'existing' | 'new'
const isSupplierDropdownOpen = ref(false)
const supplierSearchQuery = ref('')
const showAddSupplierModal = ref(false)

const showProductBarcodeScanner = ref(false)
const scannedBarcodeText = ref('')
const barcodeInputRef = ref(null)

const showSerialBarcodeScanner = ref(false)
const singleSerialScanInput = ref('')
const scannedSerialCodesList = ref([])

const form = ref({
  blNumber: '',
  blDate: new Date().toISOString().substring(0, 10),
  supplier: 'Mindray Global Imports',
  shipmentDetails: 'Vessel MAERSK 40ft HQ / Karachi Port',
  branch: authStore.userBranch || 'Karachi',
  receivingDate: new Date().toISOString().substring(0, 10),
  productId: '',
  quantity: 5,
  purchaseCost: 2250000,
  directCustomsDuty: 120000,
  directFreightPort: 80000,
  directDemurrageLanding: 0,
  indirectTransportation: 40000,
  indirectInsurance: 25000,
  indirectWarehousingMisc: 15000,
  startingMachineCode: 'MC-101',
  serialInputMode: 'sequential',
  serialPrefix: '',
  startSerialNum: 1001,
  bulkSerialsRawText: ''
})

const newPart = ref({
  name: '',
  sku: '',
  category: 'Ultrasound Machines',
  sellingPrice: 350000,
  minStock: 2
})

const newSupplierForm = ref({
  name: '',
  type: 'Supplier / Exporter',
  branch: 'Karachi',
  phone: '',
  city: ''
})

// Initialize form whenever modal opens
watch(() => uiStore.showGlobalPurchaseModal, (isOpen) => {
  if (isOpen) {
    const currentBranch = authStore.userBranch || (dataStore.activeBranchFilter && dataStore.activeBranchFilter !== 'All' ? dataStore.activeBranchFilter : 'Karachi')
    const blCount = (dataStore.blList?.length || 0) + 1
    form.value.blNumber = `BL-MED-2026-${String(blCount).padStart(2, '0')}`
    form.value.blDate = new Date().toISOString().substring(0, 10)
    form.value.supplier = 'Mindray Global Imports'
    form.value.shipmentDetails = 'Vessel MAERSK 40ft HQ / Karachi Port'
    form.value.branch = currentBranch
    form.value.receivingDate = new Date().toISOString().substring(0, 10)
    form.value.productId = dataStore.products?.[0]?.id || ''
    form.value.quantity = 5
    form.value.purchaseCost = 2250000
    form.value.directCustomsDuty = 120000
    form.value.directFreightPort = 80000
    form.value.directDemurrageLanding = 0
    form.value.indirectTransportation = 40000
    form.value.indirectInsurance = 25000
    form.value.indirectWarehousingMisc = 15000
    form.value.startingMachineCode = `MC-${400 + (dataStore.serials?.length || 0)}`
    form.value.serialInputMode = 'sequential'
    form.value.serialPrefix = ''
    form.value.startSerialNum = 1001
    form.value.bulkSerialsRawText = ''
    partMode.value = 'existing'
    isSupplierDropdownOpen.value = false
    supplierSearchQuery.value = ''
    showProductBarcodeScanner.value = false
    showSerialBarcodeScanner.value = false
    scannedSerialCodesList.value = []
  }
})

// Supplier List Computation
const allSuppliers = computed(() => {
  const map = new Map()
  const seededSuppliers = [
    { name: 'Mindray Global Imports', type: 'International Exporter', branch: 'Global Hub' },
    { name: 'Ahmad Son company', type: 'Equipment Manufacturer', branch: 'Karachi Depot' },
    { name: 'Shenzhen MedTech Global', type: 'Laser & Ultrasound OEM', branch: 'Shenzhen Hub' },
    { name: 'Siemens Healthineers GmbH', type: 'Radiology Systems OEM', branch: 'Germany Hub' },
    { name: 'Philips Healthcare Netherlands', type: 'Cardiology Equipment OEM', branch: 'Netherlands' },
    { name: 'Olympus Medical Systems Tokyo', type: 'Endoscopy & Surgical OEM', branch: 'Tokyo, Japan' },
    { name: 'GE Healthcare Chicago USA', type: 'Ultrasound & MRI Systems', branch: 'Chicago, USA' },
    { name: 'Canon Medical Systems Japan', type: 'Diagnostic Imaging OEM', branch: 'Japan' },
    { name: 'Draeger Medical Germany', type: 'Anesthesia & ICU OEM', branch: 'Germany' },
    { name: 'Shanghai Medical Instruments Co', type: 'Hospital Equipment OEM', branch: 'Shanghai' },
    { name: 'Covidien Medtronic Ireland', type: 'Surgical & Monitoring', branch: 'Ireland' },
    { name: 'Stryker Surgical USA', type: 'Surgical Equipment', branch: 'USA' },
    { name: 'Karl Storz Endoscopy Germany', type: 'Endoscopy Systems', branch: 'Germany' },
    { name: 'Shimadzu Medical Japan', type: 'X-Ray & Radiology', branch: 'Japan' },
    { name: 'Hitachi Aloka Medical', type: 'Ultrasound Diagnostic', branch: 'Japan' },
    { name: 'Samsung Medison Korea', type: '4D Ultrasound Systems', branch: 'Korea' },
    { name: 'SonoScape Medical China', type: 'Ultrasound & Endoscopy', branch: 'China' }
  ]

  seededSuppliers.forEach(s => map.set(s.name.toLowerCase(), s))

  ;(dataStore.customers || []).forEach(c => {
    if (c.name && !map.has(c.name.toLowerCase())) {
      map.set(c.name.toLowerCase(), {
        name: c.name,
        type: c.category || 'Registered Party',
        branch: c.branch || 'Karachi Depot'
      })
    }
  })

  return Array.from(map.values())
})

const filteredSuppliersList = computed(() => {
  if (!supplierSearchQuery.value.trim()) return allSuppliers.value
  const q = supplierSearchQuery.value.toLowerCase().trim()
  return allSuppliers.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.type && s.type.toLowerCase().includes(q)) ||
    (s.branch && s.branch.toLowerCase().includes(q))
  )
})

function selectSupplier(name) {
  form.value.supplier = name
  isSupplierDropdownOpen.value = false
}

function createAndSelectSupplier(name) {
  if (!name.trim()) return
  form.value.supplier = name.trim()
  isSupplierDropdownOpen.value = false
}

function handleSaveNewSupplier() {
  if (!newSupplierForm.value.name.trim()) return
  const created = {
    id: `supp_${Date.now()}`,
    name: newSupplierForm.value.name.trim(),
    phone: newSupplierForm.value.phone || '',
    branch: newSupplierForm.value.branch || form.value.branch || 'Karachi',
    category: newSupplierForm.value.type || 'Supplier / Exporter',
    address: newSupplierForm.value.city || '',
    balance: 0
  }
  dataStore.customers.unshift(created)
  form.value.supplier = created.name
  showAddSupplierModal.value = false
  uiStore.showToast(`Supplier ${created.name} registered and selected!`, 'success')
}

// ── Barcode Scanning Helpers ──
function handleBarcodeScanned() {
  const code = (scannedBarcodeText.value || '').trim().toLowerCase()
  if (!code) return

  const match = (dataStore.products || []).find(p =>
    (p.sku && p.sku.toLowerCase() === code) ||
    (p.barcode && p.barcode.toLowerCase() === code) ||
    (p.hsnCode && p.hsnCode.toLowerCase() === code) ||
    (p.name && p.name.toLowerCase().includes(code))
  )

  if (match) {
    partMode.value = 'existing'
    form.value.productId = match.id
    uiStore.showToast(`Product matched: ${match.name} (${match.sku})`, 'success')
    scannedBarcodeText.value = ''
    showProductBarcodeScanner.value = false
  } else {
    uiStore.showModal('Barcode Not Found', `No registered product found for code "${scannedBarcodeText.value}". You can add it as a new part.`, 'warning')
  }
}

function handleSerialBarcodeScanned() {
  const sn = (singleSerialScanInput.value || '').trim().replace(/^SN-/i, '')
  if (!sn) return

  if (scannedSerialCodesList.value.includes(sn)) {
    uiStore.showToast(`Serial ${sn} already scanned!`, 'warning')
    singleSerialScanInput.value = ''
    return
  }

  scannedSerialCodesList.value.push(sn)
  form.value.serialInputMode = 'bulkPaste'
  form.value.bulkSerialsRawText = scannedSerialCodesList.value.join('\n')
  singleSerialScanInput.value = ''
  uiStore.showToast(`Scanned Serial: ${sn} (${scannedSerialCodesList.value.length} total)`, 'success')
}

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
  return Number(form.value.purchaseCost || 0) +
         computedDirectExpenses.value +
         computedIndirectExpenses.value
})

const computedLandedCostPerUnit = computed(() => {
  const qty = Number(form.value.quantity || 1)
  if (qty <= 0) return 0
  return Math.round(computedTotalLandedCost.value / qty)
})

function parseMachineCode(input) {
  if (!input || typeof input !== 'string') {
    return { prefix: 'MC-', startNum: 101, padLen: 0 }
  }
  const trimmed = input.trim()
  const match = trimmed.match(/^(.*?)(\d+)$/)
  if (match) {
    const prefix = match[1]
    const numStr = match[2]
    const startNum = parseInt(numStr, 10)
    const padLen = numStr.length
    return { prefix, startNum, padLen }
  }
  return { prefix: trimmed.endsWith('-') ? trimmed : `${trimmed}-`, startNum: 1, padLen: 0 }
}

const computedBLUnitMapping = computed(() => {
  const qty = Math.max(1, Math.min(1000, Number(form.value.quantity || 1)))
  const machineParsed = parseMachineCode(form.value.startingMachineCode || 'MC-101')
  
  let currentProductSku = 'PRD'
  if (partMode.value === 'new') {
    currentProductSku = (newPart.value.sku || 'NEW').trim().toUpperCase()
  } else {
    const p = (dataStore.products || []).find(prod => prod.id === form.value.productId)
    currentProductSku = p ? p.sku : 'PRD'
  }

  const list = []
  
  if (form.value.serialInputMode === 'bulkPaste') {
    const raw = form.value.bulkSerialsRawText || ''
    const pasted = raw.split(/[\n,;]+/).map(s => s.trim().replace(/^SN-/i, '')).filter(Boolean)
    for (let i = 0; i < qty; i++) {
      const numStr = machineParsed.padLen > 0
        ? String(machineParsed.startNum + i).padStart(machineParsed.padLen, '0')
        : String(machineParsed.startNum + i)
      const machineCode = `${machineParsed.prefix}${numStr}`
      const serialCode = pasted[i] || `${currentProductSku}-${machineParsed.startNum + i}`
      list.push({ machineCode, serialCode, unitIndex: i + 1 })
    }
  } else {
    const pfx = (form.value.serialPrefix || `${currentProductSku}-`).trim().toUpperCase()
    const startS = Number(form.value.startSerialNum || 1001)
    for (let i = 0; i < qty; i++) {
      const numStr = machineParsed.padLen > 0
        ? String(machineParsed.startNum + i).padStart(machineParsed.padLen, '0')
        : String(machineParsed.startNum + i)
      const machineCode = `${machineParsed.prefix}${numStr}`
      const serialCode = `${pfx}${startS + i}`
      list.push({ machineCode, serialCode, unitIndex: i + 1 })
    }
  }
  return list
})

async function handleCreateBL() {
  if (!form.value.blNumber.trim()) {
    uiStore.showModal('Validation Error', 'Please specify a valid BL Number.', 'warning')
    return
  }
  if (!form.value.supplier.trim()) {
    uiStore.showModal('Validation Error', 'Please specify or select a Supplier / Exporter.', 'warning')
    return
  }

  let prod = null

  if (partMode.value === 'new') {
    if (!newPart.value.name.trim() || !newPart.value.sku.trim()) {
      uiStore.showModal('Validation Error', 'Please specify the New Part Name and SKU Code.', 'warning')
      return
    }
    const cleanSku = newPart.value.sku.trim().toUpperCase()
    prod = {
      id: `prd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sku: cleanSku,
      name: newPart.value.name.trim(),
      category: newPart.value.category || 'Parts & Accessories',
      division: 'Medimage Services',
      hsnCode: '9018.9000',
      taxRatio: 18,
      allocationCity: form.value.branch,
      allocationCities: [form.value.branch],
      storageBin: `BIN-${cleanSku.replace(/[^A-Z0-9]/gi, '')}-01`,
      costPrice: computedLandedCostPerUnit.value,
      sellingPrice: Number(newPart.value.sellingPrice || computedLandedCostPerUnit.value * 1.35),
      stockQty: Number(form.value.quantity),
      minStock: Number(newPart.value.minStock || 2),
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
    }
    dataStore.products.unshift(prod)
  } else {
    if (!form.value.productId) {
      uiStore.showModal('Validation Error', 'Please select an Equipment Product SKU.', 'warning')
      return
    }
    prod = dataStore.products.find(p => p.id === form.value.productId)
    if (prod) {
      prod.stockQty = (prod.stockQty || 0) + Number(form.value.quantity)
      prod.costPrice = computedLandedCostPerUnit.value
      if (!prod.allocationCities) prod.allocationCities = [prod.allocationCity]
      if (!prod.allocationCities.includes(form.value.branch)) prod.allocationCities.push(form.value.branch)
      prod.allocationCity = prod.allocationCities.join(', ')
    }
  }

  if (!prod) return

  // 1. Generate & Register Serial Items with Machine Codes
  const newSerials = []
  computedBLUnitMapping.value.forEach(u => {
    const serialObj = {
      serialCode: u.serialCode,
      machineCode: u.machineCode,
      productId: prod.id,
      sku: prod.sku,
      status: 'Available',
      allocationCity: form.value.branch,
      binLocation: prod.storageBin || 'HQ-PEW-01',
      registeredDate: form.value.receivingDate,
      purchaseInvoiceNo: form.value.blNumber,
      purchaseDate: form.value.receivingDate,
      blNumber: form.value.blNumber,
      containerNo: form.value.blNumber,
      costPrice: computedLandedCostPerUnit.value,
      paymentStatus: 'Pending',
      hsnCode: prod.hsnCode || '9018.9000',
      taxRatio: prod.taxRatio || 18,
      salePrice: prod.sellingPrice || 0
    }
    if (!dataStore.checkDuplicateSerial(u.serialCode)) {
      dataStore.serials.unshift(serialObj)
      newSerials.push(serialObj)
    }
  })

  // 2. Register Container Consignment in dataStore.containers
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
    receivingDate: form.value.receivingDate,
    arrivalDate: form.value.receivingDate,
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
    basePurchaseCost: Number(form.value.purchaseCost || 0),
    landingCost: computedDirectExpenses.value + computedIndirectExpenses.value,
    totalCostValue: computedTotalLandedCost.value,
    totalUnits: Number(form.value.quantity),
    items: [{
      productId: prod.id,
      name: prod.name,
      sku: prod.sku,
      quantity: Number(form.value.quantity),
      costPrice: computedLandedCostPerUnit.value,
      totalCost: computedTotalLandedCost.value
    }]
  }
  dataStore.containers.unshift(newContainer)

  // 3. Register Purchase Order in dataStore.purchaseOrders
  await dataStore.createPurchaseOrder({
    poNumber: `PO-${form.value.blNumber}`,
    supplier: form.value.supplier,
    allocationCity: form.value.branch,
    blNumber: form.value.blNumber,
    orderDate: form.value.blDate,
    items: [{
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      qty: Number(form.value.quantity),
      unitCost: computedLandedCostPerUnit.value
    }],
    generatedSerials: newSerials,
    totalAmount: computedTotalLandedCost.value
  }, authStore.user)

  uiStore.showModal(
    'BL Registered Successfully',
    `Import Consignment ${form.value.blNumber} for ${form.value.supplier} logged with ${form.value.quantity} machine units and mapped to ${form.value.branch} warehouse (Total Landed: PKR ${computedTotalLandedCost.value.toLocaleString()}).`,
    'success'
  )

  uiStore.closePurchaseModal()
}
</script>
