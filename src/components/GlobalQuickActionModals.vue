<template>
  <div>
    <!-- ══════════════════════════════════════════════════════════════
      1. DELIVERY CHALLAN MODAL (DISPATCH & GATE PASS WITH BL)
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showDeliveryChallanModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closeDeliveryChallanModal">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full sm:w-[98vw] max-w-[1600px] h-[100dvh] sm:h-[92vh] max-h-[100dvh] sm:max-h-[92vh]">

        <!-- ── TOP HEADER BAR ── -->
        <div class="px-2.5 sm:px-5 py-2 sm:py-3 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
              <Truck :size="16" class="text-teal-600 dark:text-teal-400 shrink-0" />
              <span class="hidden sm:inline">Delivery Challan (DC)</span>
              <span class="sm:hidden">DC</span>
            </span>
            <span class="badge badge-info text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold">DISPATCH &amp; GATE PASS</span>
            <!-- Challan number pill -->
            <span class="hidden sm:inline text-[11px] font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800/40">{{ dcForm.dcNumber }}</span>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div class="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 px-1.5 sm:px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] sm:text-xs">
              <span v-if="!authStore.isSuperAdmin" class="font-bold text-teal-600 dark:text-teal-400">📍 {{ authStore.userBranch || 'Peshawar' }}</span>
              <select v-else v-model="dcForm.branch" class="bg-transparent text-teal-700 dark:text-teal-300 font-bold focus:outline-none cursor-pointer">
                <option>Peshawar</option><option>Lahore</option><option>Multan</option><option>Islamabad</option><option>Karachi</option>
              </select>
            </div>
            <button @click="uiStore.closeDeliveryChallanModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-base sm:text-lg font-bold cursor-pointer">✕</button>
          </div>
        </div>

        <!-- ── METADATA HEADER BAND (Customer / Date / BL) ── -->
        <div class="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3 text-xs shrink-0" @click="isDcCustomerDropdownOpen = false; isDcBlDropdownOpen = false">

          <!-- Customer (6 cols) with + Add Party -->
          <div class="sm:col-span-2 md:col-span-6 relative" @click.stop>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-slate-700 dark:text-slate-300 block text-xs">Customer / Consignee Party *</label>
              <button
                type="button"
                @click="uiStore.openAddPartyModal()"
                class="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
                title="Add New Customer Party"
              >
                <Plus :size="12" />
                <span>Add Party</span>
              </button>
            </div>
            <div class="flex items-center w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 gap-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all min-h-[36px]">
              <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
              <input
                v-model="dcForm.customer"
                type="text"
                @focus="isDcCustomerDropdownOpen = true"
                @click="isDcCustomerDropdownOpen = true"
                @input="isDcCustomerDropdownOpen = true"
                @change="onDcCustomerChange"
                placeholder="Type or select Customer / Consignee Party..."
                autocomplete="off"
                required
                style="border:none!important;outline:none!important;box-shadow:none!important;background:transparent!important;padding:0!important;min-height:auto!important;height:auto!important;font-size:12px!important;"
                class="flex-1 bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none min-w-0"
              />
              <button v-if="dcForm.customer" type="button" @click.stop="dcForm.customer='';dcForm.deliveryAddress='';isDcCustomerDropdownOpen=false" class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded cursor-pointer shrink-0">✕</button>
              <button type="button" @click.stop="isDcCustomerDropdownOpen=!isDcCustomerDropdownOpen" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer shrink-0">
                <ChevronDown :size="14" :class="{'rotate-180':isDcCustomerDropdownOpen}" class="transition-transform" />
              </button>
            </div>
            <!-- Customer dropdown (Opaque background with high z-index) -->
            <div v-if="isDcCustomerDropdownOpen && filteredDcCustomers.length > 0"
              class="absolute left-0 top-full mt-1.5 z-[999999] bg-white dark:bg-[#0f172a] border-2 border-teal-500 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 w-full"
              style="box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); z-index: 999999 !important;"
            >
              <div v-for="c in filteredDcCustomers" :key="c._id||c.name"
                @click="dcForm.customer=c.name;onDcCustomerChange();isDcCustomerDropdownOpen=false"
                class="p-2.5 bg-white hover:bg-teal-50 dark:bg-[#0f172a] dark:hover:bg-teal-950/60 cursor-pointer transition-colors flex items-center justify-between gap-2 text-xs">
                <div class="min-w-0">
                  <div class="font-bold text-slate-900 dark:text-white truncate">{{ c.name }}</div>
                  <div v-if="c.phone||c.city" class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ c.phone }}{{ c.city ? ' · '+c.city : '' }}</div>
                </div>
                <span v-if="c.type" class="text-[9px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/40 shrink-0">{{ c.type }}</span>
              </div>
            </div>
          </div>

          <!-- Dispatch Date (3 cols) -->
          <div class="sm:col-span-1 md:col-span-3">
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dispatch / Delivery Date *</label>
            <input v-model="dcForm.deliveryDate" type="date" required class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-teal-500 focus:outline-none min-h-[36px]" />
          </div>

          <!-- Origin BL Consignment (3 cols) -->
          <div class="sm:col-span-1 md:col-span-3 relative" @click.stop>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span>Origin BL Consignment</span>
                <span class="text-[10px] text-slate-400 font-normal font-mono">(Typeable)</span>
              </span>
              <span v-if="dcForm.blNumber" class="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-bold">Auto Matched</span>
            </label>
            <div class="flex items-center w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 gap-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all min-h-[36px]">
              <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
              <input v-model="dcForm.blNumber" type="text" @focus="isDcBlDropdownOpen=true" @click="isDcBlDropdownOpen=true" placeholder="Type or search BL consignment..." autocomplete="off"
                style="border:none!important;outline:none!important;box-shadow:none!important;background:transparent!important;padding:0!important;min-height:auto!important;height:auto!important;font-size:12px!important;"
                class="flex-1 bg-transparent text-slate-900 dark:text-white font-mono font-bold focus:outline-none min-w-0" />
              <button v-if="dcForm.blNumber" type="button" @click.stop="dcForm.blNumber=''" class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded cursor-pointer shrink-0">✕</button>
              <button type="button" @click.stop="isDcBlDropdownOpen=!isDcBlDropdownOpen" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer shrink-0">
                <ChevronDown :size="14" :class="{'rotate-180':isDcBlDropdownOpen}" class="transition-transform" />
              </button>
            </div>
            <div v-if="isDcBlDropdownOpen"
              class="absolute left-0 top-full mt-1.5 z-[999999] bg-white dark:bg-[#0f172a] border-2 border-teal-500 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 w-full"
              style="box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);z-index:999999!important;">
              <div @click="dcForm.blNumber='';isDcBlDropdownOpen=false" class="p-2.5 bg-white hover:bg-teal-50 dark:bg-[#0f172a] dark:hover:bg-teal-950/60 cursor-pointer text-slate-500 dark:text-slate-400 text-xs italic">Direct Stock Consignment (None)</div>
              <div v-for="bl in filteredDcBlList" :key="bl.blNumber" @click="dcForm.blNumber=bl.blNumber;isDcBlDropdownOpen=false"
                class="p-2.5 bg-white hover:bg-teal-50 dark:bg-[#0f172a] dark:hover:bg-teal-950/60 cursor-pointer flex items-center justify-between gap-2 text-xs">
                <div class="min-w-0">
                  <div class="font-mono font-bold text-slate-900 dark:text-white truncate">{{ bl.blNumber }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ bl.supplierName || 'Import Consignment' }}</div>
                </div>
                <span v-if="bl.branch" class="text-[9px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/40 shrink-0">{{ bl.branch }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── SCROLLABLE BODY ── -->
        <form @submit.prevent="handleSaveDeliveryChallan" class="flex flex-col flex-1 overflow-hidden m-0">
          <div @click="isDcCustomerDropdownOpen=false;isDcBlDropdownOpen=false;activeDcComboboxIndex=null" class="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50 dark:bg-transparent custom-scrollbar">

            <!-- ── FULL WIDTH ITEMS GRID TABLE (Sale & Purchase Style) ── -->
            <div class="border border-slate-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-900/90 shadow-md min-h-[380px] overflow-visible">
              <div class="w-full overflow-visible">
                <table class="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr class="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th class="py-3 px-3 w-10 text-center">#</th>
                      <th class="py-3 px-3 w-[40%]">
                        <div class="flex items-center justify-between">
                          <span>ITEM / EQUIPMENT PRODUCT</span>
                          <button
                            type="button"
                            @click="uiStore.openAddEquipmentModal()"
                            class="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors font-sans"
                            title="Add New Equipment Product to Catalog"
                          >
                            <Plus :size="10" />
                            <span>Add Equipment</span>
                          </button>
                        </div>
                      </th>
                      <th class="py-3 px-3 w-[24%] text-center">SERIAL NUM &amp; MACHINE CODE</th>
                      <th class="py-3 px-2 w-[10%] text-center">QTY</th>
                      <th class="py-3 px-3 w-[22%]">VEHICLE / COURIER / DRIVER</th>
                      <th class="py-3 px-2 w-8 text-center"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0f172a]">
                    <tr
                      v-for="(row, idx) in dcRows"
                      :key="row.id"
                      :class="[
                        'transition-colors',
                        activeDcComboboxIndex === idx ? 'relative z-50 bg-teal-50/20 dark:bg-slate-800/60' : 'relative z-10 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      ]"
                    >
                      <td class="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-mono font-bold">{{ idx + 1 }}</td>
                      <td class="py-2.5 px-3">
                        <div class="space-y-1">
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Equipment Item</span>
                          </div>
                          <div class="relative w-full" @click.stop>
                            <div class="flex items-center w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 px-2.5 py-1 gap-2 transition-all min-h-[38px]">
                              <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
                              <input
                                v-model="row.itemDescription"
                                type="text"
                                @focus="activeDcComboboxIndex = idx"
                                @click="activeDcComboboxIndex = idx"
                                @input="activeDcComboboxIndex = idx"
                                placeholder="Search equipment catalog or type name..."
                                autocomplete="off"
                                style="border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; padding: 0 !important; min-height: auto !important; height: auto !important; font-size: 12px !important;"
                                class="flex-1 bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none min-w-0"
                              />
                              <button
                                v-if="row.itemDescription"
                                type="button"
                                @click.stop="row.itemDescription = ''; row.productId = ''; row.productObj = null; activeDcComboboxIndex = null"
                                class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded cursor-pointer shrink-0"
                              >✕</button>
                              <button
                                type="button"
                                @click.stop="activeDcComboboxIndex = activeDcComboboxIndex === idx ? null : idx"
                                class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer shrink-0"
                              >
                                <ChevronDown :size="14" :class="{ 'rotate-180': activeDcComboboxIndex === idx }" class="transition-transform" />
                              </button>
                            </div>

                            <!-- Floating Equipment Suggestions Dropdown -->
                            <div
                              v-if="activeDcComboboxIndex === idx"
                              class="absolute left-0 top-full mt-1.5 z-[999999] bg-white dark:bg-[#0f172a] border-2 border-teal-500 rounded-xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 text-left w-full min-w-[380px]"
                              style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); z-index: 999999 !important;"
                            >
                              <div
                                v-for="p in getFilteredDcProducts(row.itemDescription)"
                                :key="p.id"
                                @click="onSelectDcProductItem(row, p)"
                                class="p-2.5 bg-white hover:bg-teal-50 dark:bg-[#0f172a] dark:hover:bg-teal-950/60 cursor-pointer transition-colors flex items-center justify-between gap-2"
                              >
                                <div class="min-w-0 flex-1">
                                  <div class="font-bold text-slate-900 dark:text-white text-xs truncate">{{ p.name }}</div>
                                  <div class="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                                    <span v-if="p.sku" class="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1 py-0.2 rounded border border-teal-200 dark:border-teal-800/40">{{ p.sku }}</span>
                                    <span v-if="p.containerNo || p.blNumber" class="text-[9px] font-mono text-purple-600 dark:text-purple-400">BL: {{ p.containerNo || p.blNumber }}</span>
                                  </div>
                                </div>
                                <div class="text-right shrink-0">
                                  <span :class="['badge text-[9px] font-mono py-0.2 px-1.5 font-bold', (p.stockQty || 0) > 0 ? 'badge-success' : 'badge-danger']">
                                    {{ p.stockQty || 0 }} in Stock
                                  </span>
                                </div>
                              </div>
                              <div v-if="getFilteredDcProducts(row.itemDescription).length === 0" class="p-3 text-center text-xs text-slate-500 dark:text-slate-400 italic">
                                No catalog equipment found. You can keep typing custom equipment name.
                              </div>
                            </div>

                            <!-- Live SKU & Stock chip under input if equipment matched -->
                            <div v-if="row.productObj" class="flex items-center gap-1.5 flex-wrap text-[10px] mt-1 pt-0.5">
                              <span v-if="row.productObj.sku" class="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-200 dark:border-teal-800/40">
                                {{ row.productObj.sku }}
                              </span>
                              <span class="badge badge-info text-[9px] font-mono py-0.2 px-1.5 font-bold">
                                {{ row.productObj.stockQty !== undefined ? row.productObj.stockQty : 0 }} in Stock
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="py-2.5 px-3 text-center">
                        <div class="space-y-1">
                          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">Serial Numbers</span>
                          <input
                            v-model="row.serials"
                            type="text"
                            placeholder="MC-WD-35 | SN-1001"
                            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-teal-500 focus:outline-none text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[38px] text-center"
                          />
                        </div>
                      </td>
                      <td class="py-2.5 px-2 text-center">
                        <div class="space-y-1">
                          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">Qty</span>
                          <input
                            v-model.number="row.qty"
                            type="number"
                            min="1"
                            class="w-20 mx-auto text-center bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:border-teal-500 focus:outline-none text-xs font-mono font-bold text-teal-700 dark:text-teal-300 min-h-[38px]"
                          />
                        </div>
                      </td>
                      <td class="py-2.5 px-3">
                        <div class="space-y-1">
                          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">Vehicle / Driver</span>
                          <input
                            v-model="row.vehicleNo"
                            type="text"
                            placeholder="Courier Cargo / Driver Ali"
                            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-teal-500 focus:outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[38px]"
                          />
                        </div>
                      </td>
                      <td class="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          @click="removeDcRow(idx)"
                          v-if="dcRows.length > 1"
                          class="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer mt-4"
                          title="Remove Row"
                        >✕</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Table Footer: Add Row Button and Subtotal (Like Sale Modal) -->
              <div class="p-3 bg-slate-50 dark:bg-slate-950 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  @click="addDcRow"
                  class="btn btn-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg"
                >
                  <Plus :size="13" />
                  <span>ADD ROW</span>
                </button>
                <div class="flex items-center gap-4 text-xs font-bold">
                  <span class="text-slate-600 dark:text-slate-400 uppercase tracking-wider">TOTAL UNITS: {{ dcRows.reduce((s,r)=>s+(Number(r.qty)||0),0) }}</span>
                  <span class="text-slate-500 dark:text-slate-400 font-mono">{{ dcRows.length }} item(s)</span>
                </div>
              </div>
            </div>

            <!-- ── BOTTOM PANEL: Address + Notes ── -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <!-- Left (8 cols): Address + Notes -->
              <div class="lg:col-span-8 space-y-3">
                <!-- Delivery Address -->
                <div class="p-3 sm:p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <label class="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                    <MapPin :size="13" />
                    <span>Delivery Destination / Facility Address</span>
                  </label>
                  <input v-model="dcForm.deliveryAddress" type="text" placeholder="Hospital ward, clinic address, city..." class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:border-teal-500 focus:outline-none" />
                </div>
                <!-- Notes -->
                <div class="p-3 sm:p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <label class="text-xs font-bold text-slate-700 dark:text-slate-400">Notes / Invoice Terms</label>
                  <input v-model="dcForm.remarks" type="text" placeholder="Enter warranty notes, delivery details..." class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:border-teal-500 focus:outline-none" />
                </div>
              </div>

              <!-- Right (4 cols): Dispatch Summary -->
              <div class="lg:col-span-4">
                <div class="p-3 sm:p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                    <Truck :size="13" />
                    <span>Dispatch Summary</span>
                  </span>
                  <div class="space-y-2 text-xs">
                    <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span class="text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Challan #</span>
                      <span class="font-mono font-bold text-teal-700 dark:text-teal-300">{{ dcForm.dcNumber }}</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span class="text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Date</span>
                      <span class="font-mono font-bold text-slate-900 dark:text-white">{{ dcForm.deliveryDate }}</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span class="text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Origin BL</span>
                      <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[140px]">{{ dcForm.blNumber || '—' }}</span>
                    </div>
                    <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span class="text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Items</span>
                      <span class="font-mono font-bold text-slate-900 dark:text-white">{{ dcRows.length }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total Units</span>
                      <span class="font-mono font-bold text-teal-700 dark:text-teal-300 text-sm">{{ dcRows.reduce((s,r)=>s+(Number(r.qty)||0),0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── FOOTER BAR ── -->
          <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button type="button" @click="uiStore.closeDeliveryChallanModal" class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer">
              Cancel
            </button>
            <div class="flex items-center gap-2">
              <button type="button" @click="handlePrintDeliveryChallan" class="btn btn-secondary text-xs font-bold px-4 py-2 flex items-center gap-1.5 border border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 cursor-pointer rounded-lg">
                <Printer :size="14" />
                <span>Print DC</span>
              </button>
              <button type="submit" class="btn btn-primary bg-teal-600 hover:bg-teal-500 text-white font-black text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer">
                <Check :size="15" />
                <span>Save &amp; Issue DC</span>
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
      4. SALE RETURN MODAL (CREDIT NOTE) - DESKTOP VYAPAR DESIGN
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showSaleReturnModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closeSaleReturnModal">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full sm:w-[98vw] max-w-[1600px] h-[100dvh] sm:h-[92vh] max-h-[100dvh] sm:max-h-[92vh]">
        
        <!-- Header Bar -->
        <div class="px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
              <RotateCcw :size="18" class="text-amber-500 shrink-0" />
              <span>Sale Return &amp; Credit Note</span>
            </span>
            <span class="badge badge-warning text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold truncate">
              CREDIT NOTE &amp; RESTOCK
            </span>
            <span class="hidden sm:inline text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/40">
              {{ saleReturnForm.creditNoteNo || 'CRN-2026-001' }}
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

        <!-- Metadata Header Band -->
        <div class="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3 text-xs shrink-0" @click="isSrCustomerDropdownOpen=false;isSrInvoiceDropdownOpen=false;isSrBlDropdownOpen=false">
          <!-- Customer Party (4 cols) -->
          <div class="sm:col-span-2 md:col-span-4 relative" @click.stop>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Customer Party *</label>
              <button
                type="button"
                @click="uiStore.openAddPartyModal()"
                class="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Plus :size="12" />
                <span>Add Party</span>
              </button>
            </div>
            <div class="flex items-center w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 gap-2 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all min-h-[36px]">
              <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
              <input
                v-model="saleReturnForm.customer"
                type="text"
                @focus="isSrCustomerDropdownOpen = true"
                @click="isSrCustomerDropdownOpen = true"
                @input="isSrCustomerDropdownOpen = true; onSaleReturnCustomerChange()"
                @change="onSaleReturnCustomerChange"
                placeholder="Type or select customer..."
                autocomplete="off"
                required
                style="border:none!important;outline:none!important;box-shadow:none!important;background:transparent!important;padding:0!important;min-height:auto!important;height:auto!important;font-size:12px!important;"
                class="flex-1 bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none min-w-0"
              />
              <button v-if="saleReturnForm.customer" type="button" @click.stop="saleReturnForm.customer='';isSrCustomerDropdownOpen=false" class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded cursor-pointer shrink-0">✕</button>
              <button type="button" @click.stop="isSrCustomerDropdownOpen=!isSrCustomerDropdownOpen" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer shrink-0">
                <ChevronDown :size="14" :class="{'rotate-180':isSrCustomerDropdownOpen}" class="transition-transform" />
              </button>
            </div>
            <!-- Customer Dropdown -->
            <div v-if="isSrCustomerDropdownOpen && filteredSrCustomers.length > 0"
              class="absolute left-0 top-full mt-1.5 z-[999999] bg-white dark:bg-[#0f172a] border-2 border-amber-500 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 w-full"
              style="box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); z-index: 999999 !important;"
            >
              <div v-for="c in filteredSrCustomers" :key="c._id||c.name"
                @click="saleReturnForm.customer=c.name;onSaleReturnCustomerChange();isSrCustomerDropdownOpen=false"
                class="p-2.5 bg-white hover:bg-amber-50 dark:bg-[#0f172a] dark:hover:bg-amber-950/60 cursor-pointer transition-colors flex items-center justify-between gap-2 text-xs">
                <div class="min-w-0">
                  <div class="font-bold text-slate-900 dark:text-white truncate">{{ c.name }}</div>
                  <div v-if="c.phone||c.city" class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ c.phone }}{{ c.city ? ' · '+c.city : '' }}</div>
                </div>
                <span v-if="c.balance" class="text-[9px] font-mono text-slate-500">Bal: {{ Number(c.balance).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Original Invoice # (3 cols) -->
          <div class="sm:col-span-1 md:col-span-3 relative" @click.stop>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Original Invoice #</span>
              <span v-if="saleReturnForm.invoiceNo" class="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">Auto Matched</span>
            </label>
            <div class="flex items-center w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 gap-2 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all min-h-[36px]">
              <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
              <input
                v-model="saleReturnForm.invoiceNo"
                type="text"
                @focus="isSrInvoiceDropdownOpen=true"
                @click="isSrInvoiceDropdownOpen=true"
                @input="isSrInvoiceDropdownOpen=true; onSaleReturnInvoiceChange()"
                @change="onSaleReturnInvoiceChange"
                placeholder="Search invoice..."
                autocomplete="off"
                style="border:none!important;outline:none!important;box-shadow:none!important;background:transparent!important;padding:0!important;min-height:auto!important;height:auto!important;font-size:12px!important;"
                class="flex-1 bg-transparent text-slate-900 dark:text-white font-mono font-bold focus:outline-none min-w-0"
              />
              <button v-if="saleReturnForm.invoiceNo" type="button" @click.stop="saleReturnForm.invoiceNo=''" class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded cursor-pointer shrink-0">✕</button>
              <button type="button" @click.stop="isSrInvoiceDropdownOpen=!isSrInvoiceDropdownOpen" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer shrink-0">
                <ChevronDown :size="14" :class="{'rotate-180':isSrInvoiceDropdownOpen}" class="transition-transform" />
              </button>
            </div>
            <!-- Invoice Dropdown -->
            <div v-if="isSrInvoiceDropdownOpen && filteredSrInvoices.length > 0"
              class="absolute left-0 top-full mt-1.5 z-[999999] bg-white dark:bg-[#0f172a] border-2 border-amber-500 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 w-full"
              style="box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);z-index:999999!important;">
              <div v-for="inv in filteredSrInvoices" :key="inv.invoiceNo||inv.id"
                @click="saleReturnForm.invoiceNo=inv.invoiceNo;onSaleReturnInvoiceChange();isSrInvoiceDropdownOpen=false"
                class="p-2.5 bg-white hover:bg-amber-50 dark:bg-[#0f172a] dark:hover:bg-amber-950/60 cursor-pointer flex items-center justify-between gap-2 text-xs">
                <div class="min-w-0">
                  <div class="font-mono font-bold text-slate-900 dark:text-white truncate">{{ inv.invoiceNo }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ inv.customer || inv.customerName }} · PKR {{ Number(inv.grandTotal || inv.totalAmount || 0).toLocaleString() }}</div>
                </div>
                <span class="text-[9px] font-mono text-amber-600 dark:text-amber-400">{{ inv.date || inv.saleDate }}</span>
              </div>
            </div>
          </div>

          <!-- BL Consignment Number (3 cols) -->
          <div class="sm:col-span-1 md:col-span-3 relative" @click.stop>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>BL Consignment #</span>
              <span v-if="saleReturnForm.blNumber" class="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">Auto Matched</span>
            </label>
            <div class="flex items-center w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 gap-2 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all min-h-[36px]">
              <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
              <input
                v-model="saleReturnForm.blNumber"
                type="text"
                @focus="isSrBlDropdownOpen=true"
                @click="isSrBlDropdownOpen=true"
                placeholder="BL Consignment..."
                autocomplete="off"
                style="border:none!important;outline:none!important;box-shadow:none!important;background:transparent!important;padding:0!important;min-height:auto!important;height:auto!important;font-size:12px!important;"
                class="flex-1 bg-transparent text-slate-900 dark:text-white font-mono font-bold focus:outline-none min-w-0"
              />
              <button v-if="saleReturnForm.blNumber" type="button" @click.stop="saleReturnForm.blNumber=''" class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded cursor-pointer shrink-0">✕</button>
            </div>
          </div>

          <!-- Return Date (2 cols) -->
          <div class="sm:col-span-1 md:col-span-2">
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Return Date *</label>
            <input v-model="saleReturnForm.returnDate" type="date" required class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-amber-500 focus:outline-none min-h-[36px]" />
          </div>
        </div>

        <!-- Body: Items Grid Table -->
        <form @submit.prevent="handleSaveSaleReturn" class="flex flex-col flex-1 overflow-hidden m-0">
          <div @click="isSrCustomerDropdownOpen=false;isSrInvoiceDropdownOpen=false;isSrBlDropdownOpen=false;activeSrComboboxIndex=null" class="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50 dark:bg-transparent custom-scrollbar">
            
            <div class="border border-slate-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-900/90 shadow-md min-h-[380px] overflow-visible">
              <div class="w-full overflow-visible">
                <table class="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr class="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th class="py-3 px-3 w-10 text-center">#</th>
                      <th class="py-3 px-3 w-[42%]">
                        <div class="flex items-center justify-between">
                          <span>ITEM / EQUIPMENT PRODUCT</span>
                          <button
                            type="button"
                            @click="uiStore.openAddEquipmentModal()"
                            class="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors font-sans"
                          >
                            <Plus :size="10" />
                            <span>Add Equipment</span>
                          </button>
                        </div>
                      </th>
                      <th class="py-3 px-3 w-[22%] text-center">SERIAL NO</th>
                      <th class="py-3 px-2 w-[10%] text-center">QTY</th>
                      <th class="py-3 px-3 w-[13%] text-right">REFUND PRICE (PKR)</th>
                      <th class="py-3 px-3 w-[13%] text-right">TOTAL (PKR)</th>
                      <th class="py-3 px-2 w-8 text-center"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0f172a]">
                    <tr
                      v-for="(row, idx) in saleReturnRows"
                      :key="row.id"
                      :class="[
                        'transition-colors',
                        activeSrComboboxIndex === idx ? 'relative z-50 bg-amber-50/20 dark:bg-slate-800/60' : 'relative z-10 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      ]"
                    >
                      <td class="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-mono font-bold">{{ idx + 1 }}</td>
                      <td class="py-2.5 px-3">
                        <div class="space-y-1">
                          <input
                            v-model="row.itemDescription"
                            type="text"
                            placeholder="Equipment product name..."
                            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-bold text-xs focus:border-amber-500 focus:outline-none min-h-[36px]"
                          />
                          <div v-if="row.sku" class="text-[10px] font-mono text-slate-400">SKU: {{ row.sku }}</div>
                        </div>
                      </td>

                      <!-- SERIAL NO Column (Matching Sale & Purchase Modals) -->
                      <td class="py-2 px-2 text-center">
                        <div class="space-y-1">
                          <button
                            type="button"
                            @click="openSrSerialModal(idx)"
                            class="px-2 py-1.5 rounded-lg border flex items-center justify-center gap-1 font-mono text-xs font-bold transition-all w-full cursor-pointer min-h-[34px]"
                            :class="[
                              (row.serials || []).length >= (row.qty || 1) && (row.qty || 1) > 0
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-amber-700 dark:text-amber-400 hover:border-amber-500 hover:text-amber-600'
                            ]"
                          >
                            <span class="flex items-center gap-0.5 text-[10px] tracking-tighter opacity-80">
                              <span>1</span><span>2</span><span>3</span><span class="font-sans">≡</span>
                            </span>
                            <span>{{ (row.serials || []).length }} / {{ row.qty || 1 }} Serials</span>
                          </button>

                          <!-- In-Row Preview (Max 2 units) -->
                          <div v-if="row.serials && row.serials.length > 0" class="flex flex-col gap-1 items-center max-w-[200px] mx-auto pt-0.5">
                            <div
                              v-for="(s, sIdx) in row.serials.slice(0, 2)"
                              :key="sIdx"
                              class="w-full text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 flex items-center justify-between gap-1 shadow-2xs truncate"
                            >
                              <span class="text-purple-600 dark:text-purple-400 font-bold truncate">MC: {{ s.machineCode || '-' }}</span>
                              <span class="text-teal-600 dark:text-teal-400 font-bold truncate">SN: {{ s.serialCode }}</span>
                            </div>
                            <span v-if="row.serials.length > 2" class="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                              +{{ row.serials.length - 2 }} more units
                            </span>
                          </div>
                        </div>
                      </td>

                      <td class="py-2.5 px-2 text-center">
                        <input
                          v-model.number="row.qty"
                          type="number"
                          min="1"
                          class="w-16 mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs text-center focus:border-amber-500 focus:outline-none min-h-[36px]"
                        />
                      </td>
                      <td class="py-2.5 px-3 text-right">
                        <input
                          v-model.number="row.unitCost"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="w-28 ml-auto bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs text-right focus:border-amber-500 focus:outline-none min-h-[36px]"
                        />
                      </td>
                      <td class="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                        PKR {{ ((row.qty || 1) * (row.unitCost || 0)).toLocaleString() }}
                      </td>
                      <td class="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          @click="removeSaleReturnRow(idx)"
                          class="text-slate-400 hover:text-rose-500 p-1 rounded cursor-pointer transition-colors"
                          title="Remove row"
                        >
                          <Trash2 :size="15" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Add Row Bar -->
              <div class="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  @click="addSaleReturnRow"
                  class="btn btn-sm bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 font-bold text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Plus :size="14" />
                  <span>Add Line Item</span>
                </button>
                <span class="text-xs text-slate-500 dark:text-slate-400">Total Lines: {{ saleReturnRows.length }}</span>
              </div>
            </div>

          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div class="flex-1 max-w-md">
              <input
                v-model="saleReturnForm.reason"
                type="text"
                placeholder="Return Reason / Remarks (e.g. Client exchange / Cancellation / Defect)..."
                class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div class="flex items-center gap-4 shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-500 dark:text-slate-400 font-bold">Total Units: <span class="font-mono text-slate-900 dark:text-white">{{ saleReturnTotalQty }}</span></span>
                <span class="text-xs text-slate-400">|</span>
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Total Refund:</span>
                <span class="text-base sm:text-lg font-black font-mono text-amber-600 dark:text-amber-400">PKR {{ saleReturnTotalAmount.toLocaleString() }}</span>
              </div>

              <div class="flex items-center gap-2">
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
            </div>
          </div>
        </form>
      </div>

      <!-- Dedicated Return Item Serial Identification Modal (Sale Return) -->
      <div v-if="showSrSerialModal" class="modal-backdrop z-[999999] flex items-center justify-center p-3" @click.self="closeSrSerialModal">
        <div class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100" style="width: 92% !important; max-width: 540px !important;">
          <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 class="text-base font-black text-slate-900 dark:text-white leading-tight">Sale Return Item - SERIAL NUM</h3>
              <p class="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5 uppercase tracking-wide truncate max-w-xs">
                {{ activeSrSerialRow?.itemDescription || 'Medical Equipment' }}
              </p>
            </div>
            <button @click="closeSrSerialModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold">✕</button>
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs bg-white dark:bg-[#0f172a] custom-scrollbar">
            <!-- 1. Enter Unit Identification -->
            <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                <span class="flex items-center gap-1.5">
                  <span>Enter Unit Identification</span>
                  <span class="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-normal">(Machine Code & Serial #)</span>
                </span>
                <span class="font-mono text-emerald-600 dark:text-emerald-300 font-black">
                  {{ (activeSrSerialRow?.serials || []).length }}/{{ activeSrSerialRow?.qty || 1 }} Entered
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div class="sm:col-span-5">
                  <div class="flex items-center justify-between mb-0.5">
                    <label class="text-[10px] text-slate-600 dark:text-slate-400 font-bold">Machine Code</label>
                    <span class="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold">Auto</span>
                  </div>
                  <input
                    v-model="srNewMachineCode"
                    type="text"
                    placeholder="e.g. WD-35"
                    @keyup.enter="commitSrSerial"
                    class="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div class="sm:col-span-7">
                  <label class="text-[10px] text-slate-600 dark:text-slate-400 font-bold block mb-0.5">Serial Number</label>
                  <div class="flex items-center gap-1.5">
                    <input
                      v-model="srNewSerialCode"
                      type="text"
                      placeholder="Enter / Scan Serial #"
                      @keyup.enter="commitSrSerial"
                      class="flex-1 rounded-lg px-3 py-2 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      @click="commitSrSerial"
                      class="w-9 h-8 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center justify-center font-bold shadow-md cursor-pointer shrink-0"
                    >
                      <Check :size="16" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Available Units from Invoice / Customer (Click to toggle) -->
            <div v-if="activeSrSerialRow?.availableSerialsList && activeSrSerialRow.availableSerialsList.length > 0" class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <span class="text-slate-700 dark:text-slate-300">Available Units from Invoice (Click to Select)</span>
                <span class="text-[10px] font-mono text-amber-600 dark:text-amber-400">{{ activeSrSerialRow.availableSerialsList.length }} units</span>
              </div>
              <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                <div
                  v-for="unit in activeSrSerialRow.availableSerialsList"
                  :key="unit.serialCode"
                  @click="toggleSrSerialUnit(unit)"
                  class="flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors"
                  :class="isSrSerialSelected(unit) ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-200 font-bold' : 'bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300'"
                >
                  <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="isSrSerialSelected(unit)" class="rounded text-amber-600 pointer-events-none" />
                    <span class="font-mono font-bold">SN: {{ unit.serialCode }}</span>
                    <span class="font-mono text-purple-600 dark:text-purple-400" v-if="unit.machineCode">MC: {{ unit.machineCode }}</span>
                  </div>
                  <span class="text-[10px] font-bold" :class="isSrSerialSelected(unit) ? 'text-amber-600' : 'text-slate-400'">
                    {{ isSrSerialSelected(unit) ? 'Selected' : '+ Select' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 3. Registered / Selected Serial List -->
            <div class="space-y-1.5">
              <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Registered / Active Serial List</span>
                <span class="font-mono text-teal-600 dark:text-teal-400 font-bold">{{ (activeSrSerialRow?.serials || []).length }} registered</span>
              </div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                <div
                  v-for="(s, sIdx) in (activeSrSerialRow?.serials || [])"
                  :key="sIdx"
                  class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1e293b]"
                >
                  <div class="flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center">{{ sIdx + 1 }}</span>
                    <span class="font-mono font-bold text-slate-900 dark:text-white">SN: {{ s.serialCode }}</span>
                    <span class="font-mono text-purple-600 dark:text-purple-400" v-if="s.machineCode">MC: {{ s.machineCode }}</span>
                  </div>
                  <button type="button" @click="removeSrSerial(sIdx)" class="text-slate-400 hover:text-rose-500 p-1">✕</button>
                </div>
                <div v-if="!activeSrSerialRow?.serials || activeSrSerialRow.serials.length === 0" class="p-3 text-center text-slate-400 italic">
                  No serial numbers selected yet.
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button type="button" @click="closeSrSerialModal" class="btn btn-secondary text-xs px-4 py-2">Close</button>
            <button type="button" @click="closeSrSerialModal" class="btn bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2 rounded-lg">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
      5. PURCHASE RETURN MODAL (DEBIT NOTE) - DESKTOP VYAPAR DESIGN
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="uiStore.showPurchaseReturnModal" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="uiStore.closePurchaseReturnModal">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full sm:w-[98vw] max-w-[1600px] h-[100dvh] sm:h-[92vh] max-h-[100dvh] sm:max-h-[92vh]">
        
        <!-- Header Bar -->
        <div class="px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
              <RotateCcw :size="18" class="text-cyan-500 shrink-0" />
              <span>Purchase Return &amp; Debit Note</span>
            </span>
            <span class="badge badge-info text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold truncate">
              DEBIT NOTE &amp; PAYABLE DEDUCT
            </span>
            <span class="hidden sm:inline text-[11px] font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800/40">
              {{ purchaseReturnForm.debitNoteNo || 'DRN-2026-001' }}
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

        <!-- Metadata Header Band -->
        <div class="px-3 sm:px-5 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3 text-xs shrink-0" @click="isPrSupplierDropdownOpen=false;isPrBlDropdownOpen=false">
          
          <!-- Supplier / Exporter Party (5 cols) -->
          <div class="sm:col-span-2 md:col-span-5 relative" @click.stop>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Supplier / Exporter Party *</label>
              <button
                type="button"
                @click="uiStore.openAddPartyModal()"
                class="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Plus :size="12" />
                <span>Add Party</span>
              </button>
            </div>
            <div class="flex items-center w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 gap-2 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all min-h-[36px]">
              <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
              <input
                v-model="purchaseReturnForm.supplier"
                type="text"
                @focus="isPrSupplierDropdownOpen = true"
                @click="isPrSupplierDropdownOpen = true"
                @input="isPrSupplierDropdownOpen = true; onPurchaseReturnSupplierChange()"
                @change="onPurchaseReturnSupplierChange"
                placeholder="Type or select supplier/party..."
                autocomplete="off"
                required
                style="border:none!important;outline:none!important;box-shadow:none!important;background:transparent!important;padding:0!important;min-height:auto!important;height:auto!important;font-size:12px!important;"
                class="flex-1 bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none min-w-0"
              />
              <button v-if="purchaseReturnForm.supplier" type="button" @click.stop="purchaseReturnForm.supplier='';isPrSupplierDropdownOpen=false" class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded cursor-pointer shrink-0">✕</button>
              <button type="button" @click.stop="isPrSupplierDropdownOpen=!isPrSupplierDropdownOpen" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer shrink-0">
                <ChevronDown :size="14" :class="{'rotate-180':isPrSupplierDropdownOpen}" class="transition-transform" />
              </button>
            </div>
            <!-- Supplier Dropdown -->
            <div v-if="isPrSupplierDropdownOpen && filteredPurchaseReturnSuppliers.length > 0"
              class="absolute left-0 top-full mt-1.5 z-[999999] bg-white dark:bg-[#0f172a] border-2 border-cyan-500 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 w-full"
              style="box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); z-index: 999999 !important;"
            >
              <div v-for="s in filteredPurchaseReturnSuppliers" :key="s._id||s.name||s"
                @click="purchaseReturnForm.supplier=(s.name||s);onPurchaseReturnSupplierChange();isPrSupplierDropdownOpen=false"
                class="p-2.5 bg-white hover:bg-cyan-50 dark:bg-[#0f172a] dark:hover:bg-cyan-950/60 cursor-pointer transition-colors flex items-center justify-between gap-2 text-xs">
                <div class="min-w-0">
                  <div class="font-bold text-slate-900 dark:text-white truncate">{{ s.name || s }}</div>
                  <div v-if="s.phone||s.city" class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ s.phone }}{{ s.city ? ' · '+s.city : '' }}</div>
                </div>
                <span v-if="s.type" class="text-[9px] font-mono text-cyan-600 dark:text-cyan-400">{{ s.type }}</span>
              </div>
            </div>
          </div>

          <!-- BL Consignment / Invoice # (4 cols) -->
          <div class="sm:col-span-1 md:col-span-4 relative" @click.stop>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span>BL Consignment / Invoice #</span>
                <span class="text-[10px] text-slate-400 font-normal font-mono">(Typeable)</span>
              </span>
              <span v-if="purchaseReturnForm.blNumber" class="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">Auto Matched</span>
            </label>
            <div class="flex items-center w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 gap-2 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all min-h-[36px]">
              <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
              <input
                v-model="purchaseReturnForm.blNumber"
                type="text"
                @focus="isPrBlDropdownOpen=true"
                @click="isPrBlDropdownOpen=true"
                @input="isPrBlDropdownOpen=true; onPurchaseReturnBlChange()"
                @change="onPurchaseReturnBlChange"
                placeholder="Search or enter BL consignment..."
                autocomplete="off"
                style="border:none!important;outline:none!important;box-shadow:none!important;background:transparent!important;padding:0!important;min-height:auto!important;height:auto!important;font-size:12px!important;"
                class="flex-1 bg-transparent text-slate-900 dark:text-white font-mono font-bold focus:outline-none min-w-0"
              />
              <button v-if="purchaseReturnForm.blNumber" type="button" @click.stop="purchaseReturnForm.blNumber=''" class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded cursor-pointer shrink-0">✕</button>
              <button type="button" @click.stop="isPrBlDropdownOpen=!isPrBlDropdownOpen" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer shrink-0">
                <ChevronDown :size="14" :class="{'rotate-180':isPrBlDropdownOpen}" class="transition-transform" />
              </button>
            </div>
            <!-- BL Dropdown -->
            <div v-if="isPrBlDropdownOpen && filteredPurchaseReturnBlList.length > 0"
              class="absolute left-0 top-full mt-1.5 z-[999999] bg-white dark:bg-[#0f172a] border-2 border-cyan-500 rounded-xl shadow-2xl max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 w-full"
              style="box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);z-index:999999!important;">
              <div v-for="bl in filteredPurchaseReturnBlList" :key="bl.blNumber"
                @click="purchaseReturnForm.blNumber=bl.blNumber;onPurchaseReturnBlChange();isPrBlDropdownOpen=false"
                class="p-2.5 bg-white hover:bg-cyan-50 dark:bg-[#0f172a] dark:hover:bg-cyan-950/60 cursor-pointer flex items-center justify-between gap-2 text-xs">
                <div class="min-w-0">
                  <div class="font-mono font-bold text-slate-900 dark:text-white truncate">{{ bl.blNumber }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ bl.supplierName || 'Consignment' }}</div>
                </div>
                <span v-if="bl.branch" class="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40 shrink-0">{{ bl.branch }}</span>
              </div>
            </div>
          </div>

          <!-- Return Date (3 cols) -->
          <div class="sm:col-span-1 md:col-span-3">
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Return Date *</label>
            <input v-model="purchaseReturnForm.returnDate" type="date" required class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-cyan-500 focus:outline-none min-h-[36px]" />
          </div>
        </div>

        <!-- Body: Items Grid Table -->
        <form @submit.prevent="handleSavePurchaseReturn" class="flex flex-col flex-1 overflow-hidden m-0">
          <div @click="isPrSupplierDropdownOpen=false;isPrBlDropdownOpen=false;activePrComboboxIndex=null" class="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50 dark:bg-transparent custom-scrollbar">
            
            <div class="border border-slate-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-900/90 shadow-md min-h-[380px] overflow-visible">
              <div class="w-full overflow-visible">
                <table class="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr class="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th class="py-3 px-3 w-10 text-center">#</th>
                      <th class="py-3 px-3 w-[42%]">
                        <div class="flex items-center justify-between">
                          <span>ITEM / EQUIPMENT PRODUCT</span>
                          <button
                            type="button"
                            @click="uiStore.openAddEquipmentModal()"
                            class="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-colors font-sans"
                            title="Add New Equipment Product to Catalog"
                          >
                            <Plus :size="10" />
                            <span>Add Equipment</span>
                          </button>
                        </div>
                      </th>
                      <th class="py-3 px-3 w-[22%] text-center">SERIAL NO</th>
                      <th class="py-3 px-2 w-[10%] text-center">QTY</th>
                      <th class="py-3 px-3 w-[13%] text-right">UNIT COST (PKR)</th>
                      <th class="py-3 px-3 w-[13%] text-right">TOTAL (PKR)</th>
                      <th class="py-3 px-2 w-8 text-center"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0f172a]">
                    <tr
                      v-for="(row, idx) in purchaseReturnRows"
                      :key="row.id"
                      :class="[
                        'transition-colors',
                        activePrComboboxIndex === idx ? 'relative z-50 bg-cyan-50/20 dark:bg-slate-800/60' : 'relative z-10 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      ]"
                    >
                      <td class="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-mono font-bold">{{ idx + 1 }}</td>
                      <td class="py-2.5 px-3">
                        <div class="space-y-1">
                          <div class="relative w-full" @click.stop>
                            <div class="flex items-center w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 px-2.5 py-1 gap-2 transition-all min-h-[38px]">
                              <Search :size="14" class="text-slate-400 shrink-0 pointer-events-none" />
                              <input
                                v-model="row.itemDescription"
                                type="text"
                                @focus="activePrComboboxIndex = idx"
                                @click="activePrComboboxIndex = idx"
                                @input="activePrComboboxIndex = idx"
                                placeholder="Search equipment or type name..."
                                autocomplete="off"
                                style="border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; padding: 0 !important; min-height: auto !important; height: auto !important; font-size: 12px !important;"
                                class="flex-1 bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none min-w-0"
                              />
                              <button
                                v-if="row.itemDescription"
                                type="button"
                                @click.stop="row.itemDescription = ''; row.productId = ''; activePrComboboxIndex = null"
                                class="text-slate-400 hover:text-rose-500 text-xs p-0.5 rounded cursor-pointer shrink-0"
                              >✕</button>
                              <button
                                type="button"
                                @click.stop="activePrComboboxIndex = activePrComboboxIndex === idx ? null : idx"
                                class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer shrink-0"
                              >
                                <ChevronDown :size="14" :class="{ 'rotate-180': activePrComboboxIndex === idx }" class="transition-transform" />
                              </button>
                            </div>

                            <!-- Dropdown for Equipment Suggestions -->
                            <div
                              v-if="activePrComboboxIndex === idx"
                              class="absolute left-0 top-full mt-1.5 z-[999999] bg-white dark:bg-[#0f172a] border-2 border-cyan-500 rounded-xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 text-left w-full min-w-[380px]"
                              style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); z-index: 999999 !important;"
                            >
                              <div
                                v-for="p in getFilteredDcProducts(row.itemDescription)"
                                :key="p.id"
                                @click="onSelectPurchaseReturnProductItem(row, p)"
                                class="p-2.5 bg-white hover:bg-cyan-50 dark:bg-[#0f172a] dark:hover:bg-cyan-950/60 cursor-pointer transition-colors flex items-center justify-between gap-2"
                              >
                                <div class="min-w-0 flex-1">
                                  <div class="font-bold text-slate-900 dark:text-white text-xs truncate">{{ p.name }}</div>
                                  <div class="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                                    <span v-if="p.sku" class="font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-200 dark:border-cyan-800/40">{{ p.sku }}</span>
                                    <span v-if="p.costPrice" class="font-mono text-emerald-600 dark:text-emerald-400">Cost: PKR {{ Number(p.costPrice).toLocaleString() }}</span>
                                    <span v-if="p.containerNo || p.blNumber" class="text-[9px] font-mono text-purple-600 dark:text-purple-400">BL: {{ p.containerNo || p.blNumber }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div v-if="row.sku" class="text-[10px] font-mono text-slate-400">SKU: {{ row.sku }}</div>
                        </div>
                      </td>

                      <!-- SERIAL NO Column (Matching Sale & Purchase Modals) -->
                      <td class="py-2 px-2 text-center">
                        <div class="space-y-1">
                          <button
                            type="button"
                            @click="openPrSerialModal(idx)"
                            class="px-2 py-1.5 rounded-lg border flex items-center justify-center gap-1 font-mono text-xs font-bold transition-all w-full cursor-pointer min-h-[34px]"
                            :class="[
                              (row.serials || []).length >= (row.qty || 1) && (row.qty || 1) > 0
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-teal-700 dark:text-teal-400 hover:border-cyan-500 hover:text-cyan-600'
                            ]"
                          >
                            <span class="flex items-center gap-0.5 text-[10px] tracking-tighter opacity-80">
                              <span>1</span><span>2</span><span>3</span><span class="font-sans">≡</span>
                            </span>
                            <span>{{ (row.serials || []).length }} / {{ row.qty || 1 }} Serials</span>
                          </button>

                          <!-- In-Row Preview (Max 2 units) -->
                          <div v-if="row.serials && row.serials.length > 0" class="flex flex-col gap-1 items-center max-w-[200px] mx-auto pt-0.5">
                            <div
                              v-for="(s, sIdx) in row.serials.slice(0, 2)"
                              :key="sIdx"
                              class="w-full text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 flex items-center justify-between gap-1 shadow-2xs truncate"
                            >
                              <span class="text-purple-600 dark:text-purple-400 font-bold truncate">MC: {{ s.machineCode || '-' }}</span>
                              <span class="text-teal-600 dark:text-teal-400 font-bold truncate">SN: {{ s.serialCode }}</span>
                            </div>
                            <span v-if="row.serials.length > 2" class="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                              +{{ row.serials.length - 2 }} more units
                            </span>
                          </div>
                        </div>
                      </td>

                      <!-- Qty -->
                      <td class="py-2.5 px-2 text-center">
                        <input
                          v-model.number="row.qty"
                          type="number"
                          min="1"
                          class="w-16 mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs text-center focus:border-cyan-500 focus:outline-none min-h-[36px]"
                        />
                      </td>

                      <!-- Unit Cost -->
                      <td class="py-2.5 px-3 text-right">
                        <input
                          v-model.number="row.unitCost"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="w-28 ml-auto bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs text-right focus:border-cyan-500 focus:outline-none min-h-[36px]"
                        />
                      </td>

                      <!-- Total -->
                      <td class="py-2.5 px-3 text-right font-mono font-bold text-cyan-600 dark:text-cyan-400 text-xs">
                        PKR {{ ((row.qty || 1) * (row.unitCost || 0)).toLocaleString() }}
                      </td>

                      <!-- Remove -->
                      <td class="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          @click="removePurchaseReturnRow(idx)"
                          class="text-slate-400 hover:text-rose-500 p-1 rounded cursor-pointer transition-colors"
                          title="Remove row"
                        >
                          <Trash2 :size="15" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Add Row Bar -->
              <div class="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  @click="addPurchaseReturnRow"
                  class="btn btn-sm bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60 font-bold text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-cyan-100 transition-colors cursor-pointer"
                >
                  <Plus :size="14" />
                  <span>Add Line Item</span>
                </button>
                <span class="text-xs text-slate-500 dark:text-slate-400">Total Lines: {{ purchaseReturnRows.length }}</span>
              </div>
            </div>

          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div class="flex-1 max-w-md">
              <input
                v-model="purchaseReturnForm.reason"
                type="text"
                placeholder="Return Reason / Damage Notes (e.g. Defective Consignment Unit)..."
                class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div class="flex items-center gap-4 shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-500 dark:text-slate-400 font-bold">Total Units: <span class="font-mono text-slate-900 dark:text-white">{{ purchaseReturnTotalQty }}</span></span>
                <span class="text-xs text-slate-400">|</span>
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Total Return:</span>
                <span class="text-base sm:text-lg font-black font-mono text-cyan-600 dark:text-cyan-400">PKR {{ purchaseReturnTotalAmount.toLocaleString() }}</span>
              </div>

              <div class="flex items-center gap-2">
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
            </div>
          </div>
        </form>
      </div>

      <!-- Dedicated Return Item Serial Identification Modal (Purchase Return - Matches Second Screenshot) -->
      <div v-if="showPrSerialModal" class="modal-backdrop z-[999999] flex items-center justify-center p-3" @click.self="closePrSerialModal">
        <div class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100" style="width: 92% !important; max-width: 540px !important;">
          <!-- Header -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 class="text-base font-black text-slate-900 dark:text-white leading-tight">Purchase Return - SERIAL NUM</h3>
              <p class="text-xs text-teal-600 dark:text-teal-400 font-bold mt-0.5 uppercase tracking-wide truncate max-w-xs">
                {{ activePrSerialRow?.itemDescription || 'Medical Equipment' }}
              </p>
            </div>
            <button @click="closePrSerialModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold">✕</button>
          </div>

          <!-- Body -->
          <div class="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs bg-white dark:bg-[#0f172a] custom-scrollbar">
            <!-- 1. Enter Unit Identification -->
            <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                <span class="flex items-center gap-1.5">
                  <span>Enter Unit Identification</span>
                  <span class="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-normal">(Machine Code & Serial #)</span>
                </span>
                <span class="font-mono text-teal-600 dark:text-teal-300 font-black">
                  {{ (activePrSerialRow?.serials || []).length }}/{{ activePrSerialRow?.qty || 1 }} Entered
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div class="sm:col-span-5">
                  <div class="flex items-center justify-between mb-0.5">
                    <label class="text-[10px] text-slate-600 dark:text-slate-400 font-bold">Machine Code</label>
                    <span class="text-[9px] text-teal-600 dark:text-teal-400 font-mono font-bold">Auto</span>
                  </div>
                  <input
                    v-model="prNewMachineCode"
                    type="text"
                    placeholder="e.g. WD-35"
                    @keyup.enter="commitPrSerial"
                    class="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div class="sm:col-span-7">
                  <label class="text-[10px] text-slate-600 dark:text-slate-400 font-bold block mb-0.5">Serial Number</label>
                  <div class="flex items-center gap-1.5">
                    <input
                      v-model="prNewSerialCode"
                      type="text"
                      placeholder="Enter / Scan Serial #"
                      @keyup.enter="commitPrSerial"
                      class="flex-1 rounded-lg px-3 py-2 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      @click="commitPrSerial"
                      class="w-9 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold shadow-md cursor-pointer shrink-0"
                    >
                      <Check :size="16" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Available Units from BL (Click to toggle) -->
            <div v-if="activePrSerialRow?.availableSerialsList && activePrSerialRow.availableSerialsList.length > 0" class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <span class="text-slate-700 dark:text-slate-300">Available Units in BL (Click to Select / Return)</span>
                <span class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">{{ activePrSerialRow.availableSerialsList.length }} units</span>
              </div>
              <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                <div
                  v-for="unit in activePrSerialRow.availableSerialsList"
                  :key="unit.serialCode"
                  @click="togglePrSerialUnit(unit)"
                  class="flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors"
                  :class="isPrSerialSelected(unit) ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-cyan-800 dark:text-cyan-200 font-bold' : 'bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300'"
                >
                  <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="isPrSerialSelected(unit)" class="rounded text-cyan-600 pointer-events-none" />
                    <span class="font-mono font-bold">SN: {{ unit.serialCode }}</span>
                    <span class="font-mono text-purple-600 dark:text-purple-400" v-if="unit.machineCode">MC: {{ unit.machineCode }}</span>
                  </div>
                  <span class="text-[10px] font-bold" :class="isPrSerialSelected(unit) ? 'text-cyan-600' : 'text-slate-400'">
                    {{ isPrSerialSelected(unit) ? 'Selected' : '+ Select' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 3. Registered / Active Serial List -->
            <div class="space-y-1.5">
              <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Registered / Active Serial List</span>
                <span class="font-mono text-teal-600 dark:text-teal-400 font-bold">{{ (activePrSerialRow?.serials || []).length }} registered</span>
              </div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                <div
                  v-for="(s, sIdx) in (activePrSerialRow?.serials || [])"
                  :key="sIdx"
                  class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1e293b]"
                >
                  <div class="flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center">{{ sIdx + 1 }}</span>
                    <span class="font-mono font-bold text-slate-900 dark:text-white">SN: {{ s.serialCode }}</span>
                    <span class="font-mono text-purple-600 dark:text-purple-400" v-if="s.machineCode">MC: {{ s.machineCode }}</span>
                  </div>
                  <button type="button" @click="removePrSerial(sIdx)" class="text-slate-400 hover:text-rose-500 p-1">✕</button>
                </div>
                <div v-if="!activePrSerialRow?.serials || activePrSerialRow.serials.length === 0" class="p-3 text-center text-slate-400 italic">
                  No serial numbers selected yet.
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button type="button" @click="closePrSerialModal" class="btn btn-secondary text-xs px-4 py-2">Close</button>
            <button type="button" @click="closePrSerialModal" class="btn bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-2 rounded-lg">Save</button>
          </div>
        </div>
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
import { ref, computed, watch } from 'vue'
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
  ChevronDown,
  Plus,
  MapPin,
  Trash2,
  Camera,
  Layers
} from 'lucide-vue-next'

const uiStore = useUiStore()
const dataStore = useDataStore()
const authStore = useAuthStore()

// 1. Delivery Challan Form & Line Items
const dcForm = ref({
  dcNumber: `DC-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
  deliveryDate: new Date().toISOString().substring(0, 10),
  blNumber: '',
  customer: '',
  branch: authStore.userBranch || 'Peshawar',
  vehicleNo: '',
  itemDescription: '',
  qty: 1,
  serials: '',
  deliveryAddress: '',
  remarks: ''
})

const dcRows = ref([
  {
    id: `dc_row_${Date.now()}`,
    itemDescription: '',
    serials: '',
    qty: 1,
    vehicleNo: ''
  }
])

function addDcRow() {
  dcRows.value.push({
    id: `dc_row_${Date.now()}_${Math.random()}`,
    itemDescription: '',
    serials: '',
    qty: 1,
    vehicleNo: ''
  })
}

function removeDcRow(idx) {
  if (dcRows.value.length > 1) {
    dcRows.value.splice(idx, 1)
  }
}

const isDcBlDropdownOpen = ref(false)
const isDcCustomerDropdownOpen = ref(false)
const activeDcComboboxIndex = ref(null)

function getFilteredDcProducts(query) {
  const list = dataStore.products || []
  if (!query || !query.trim()) return list.slice(0, 50)
  const q = query.trim().toLowerCase()
  return list.filter(p =>
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.sku && p.sku.toLowerCase().includes(q)) ||
    (p.containerNo && p.containerNo.toLowerCase().includes(q)) ||
    (p.blNumber && p.blNumber.toLowerCase().includes(q))
  ).slice(0, 50)
}

function onSelectDcProductItem(row, p) {
  row.productId = p.id
  row.itemDescription = p.name
  row.productObj = p
  row.qty = 1
  activeDcComboboxIndex.value = null

  // Auto-detect & Select Origin BL Consignment
  const foundBL = p.containerNo || p.blNumber ||
    (dataStore.containers || []).find(c => c.containerNo === p.containerNo || (c.items && c.items.some(it => it.sku === p.sku || it.name === p.name)))?.containerNo ||
    (dataStore.containers || []).find(c => c.containerNo === p.containerNo || (c.items && c.items.some(it => it.sku === p.sku || it.name === p.name)))?.blNumber

  if (foundBL && !dcForm.value.blNumber) {
    dcForm.value.blNumber = foundBL
  }

  // Pre-fill available serial if in stock
  const availSerials = (dataStore.serials || []).filter(s => (s.productId === p.id || s.sku === p.sku) && s.status !== 'Sold')
  if (availSerials.length > 0) {
    row.serials = availSerials.slice(0, 1).map(s => s.serialCode || s.code).join(' | ')
  }
}

const filteredDcCustomers = computed(() => {
  const raw = String(dcForm.value.customer || '').trim()
  const q = raw.replace(/\s+/g, ' ').toLowerCase()
  const list = dataStore.customers || []
  if (!q) return list
  return list.filter(c => {
    const cName = String(c.name || '').replace(/\s+/g, ' ').toLowerCase()
    const cPhone = String(c.phone || '').toLowerCase()
    const cCity = String(c.city || '').toLowerCase()
    return cName.includes(q) || cPhone.includes(q) || cCity.includes(q)
  })
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
  const rawCustomer = String(dcForm.value.customer || '').trim()
  if (!rawCustomer) return

  // Normalize whitespace: replace multiple consecutive spaces with a single space
  const cleanQ = rawCustomer.replace(/\s+/g, ' ').toLowerCase()

  // 1. Auto-fill delivery address from customer record (strict or normalized match)
  const customerRecord = (dataStore.customers || []).find(c => {
    if (!c || !c.name) return false
    const cNorm = c.name.replace(/\s+/g, ' ').toLowerCase()
    return cNorm === cleanQ || cleanQ.includes(cNorm) || cNorm.includes(cleanQ)
  })

  if (customerRecord) {
    // Preserve canonical customer name
    dcForm.value.customer = customerRecord.name
    if (customerRecord.address) {
      dcForm.value.deliveryAddress = customerRecord.address
    }
    if (customerRecord.branch && !dcForm.value.branch) {
      dcForm.value.branch = customerRecord.branch
    }
  }

  // 2. Find matching sales invoices for this customer (normalized search)
  const customerSales = (dataStore.salesInvoices || [])
    .filter(inv => {
      if (!inv) return false
      const invCust = String(inv.customer || inv.customerName || inv.party || '').replace(/\s+/g, ' ').toLowerCase()
      const invNo = String(inv.invoiceNo || inv.id || '').toLowerCase()
      return invCust === cleanQ ||
        cleanQ.includes(invCust) ||
        (invCust && invCust.includes(cleanQ)) ||
        (invNo && cleanQ.includes(invNo))
    })
    .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))

  if (customerSales.length > 0) {
    const lastSale = customerSales[0]

    // 3. Auto-fill Origin BL from last sale
    if (lastSale.blNumber) {
      dcForm.value.blNumber = lastSale.blNumber
    }

    // 4. Auto-fill Branch & Destination Address
    if (lastSale.branch) {
      dcForm.value.branch = lastSale.branch
    }
    if ((lastSale.deliveryAddress || lastSale.address) && !dcForm.value.deliveryAddress) {
      dcForm.value.deliveryAddress = lastSale.deliveryAddress || lastSale.address
    }

    // 5. Populate dcRows with items, products, and serial numbers from the sale
    const saleItems = lastSale.items || []
    if (saleItems.length > 0) {
      dcRows.value = saleItems.map((it, idx) => {
        const prod = (dataStore.products || []).find(p => p.id === it.productId || p.sku === it.sku || p.name === it.productName)
        const serialStrings = []
        const sArr = it.serials || it.serialNumbers || []
        sArr.forEach(s => {
          if (!s) return
          if (typeof s === 'string') {
            serialStrings.push(s)
          } else if (typeof s === 'object') {
            const code = s.serialCode || s.code || s.serialNumber || ''
            const mCode = s.machineCode || ''
            if (code) {
              serialStrings.push(mCode ? `${code} (${mCode})` : code)
            }
          }
        })

        // If no serials stored in invoice, check dataStore.serials
        if (serialStrings.length === 0 && prod) {
          const matchedSerials = (dataStore.serials || []).filter(s => (s.productId === prod.id || s.sku === prod.sku))
          matchedSerials.slice(0, Number(it.qty || 1)).forEach(s => {
            serialStrings.push(s.machineCode ? `${s.serialCode} (${s.machineCode})` : s.serialCode)
          })
        }

        return {
          id: `dc_row_${Date.now()}_${idx}`,
          productId: prod?.id || it.productId || '',
          productObj: prod || null,
          itemDescription: it.productName || it.name || it.description || (prod ? prod.name : ''),
          serials: serialStrings.join(' | '),
          qty: Number(it.qty || it.quantity || 1),
          vehicleNo: lastSale.vehicleNo || it.vehicleNo || dcForm.value.vehicleNo || ''
        }
      })

      // Sync legacy single fields from first row
      const firstRow = dcRows.value[0]
      dcForm.value.itemDescription = firstRow.itemDescription
      dcForm.value.serials = firstRow.serials
      dcForm.value.qty = firstRow.qty
      if (firstRow.vehicleNo) dcForm.value.vehicleNo = firstRow.vehicleNo
    }
  } else {
    // If no past sale found, check if a BL matches this customer's branch or name
    if (!dcForm.value.blNumber && dataStore.blList && dataStore.blList.length > 0) {
      const matchedBl = dataStore.blList.find(b =>
        (b.customer && b.customer.toLowerCase().includes(cleanQ)) ||
        (b.branch && b.branch.toLowerCase() === (dcForm.value.branch || '').toLowerCase())
      )
      if (matchedBl) dcForm.value.blNumber = matchedBl.blNumber
    }
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

  const rowsHtml = dcRows.value.map((row, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${row.itemDescription || 'Equipment'}</strong></td>
      <td><code>${row.serials || 'N/A'}</code></td>
      <td style="text-align: center; font-weight: bold;">${row.qty || 1}</td>
      <td>${row.vehicleNo || dcForm.value.vehicleNo || 'Self Dispatch'}</td>
    </tr>
  `).join('')

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
            <div><strong>Dispatch Branch:</strong> ${dcForm.value.branch || authStore.userBranch || 'Peshawar'} Depot</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Item / Equipment Description</th>
              <th>Serial Numbers &amp; Machine Codes</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th>Vehicle / Courier</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
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

// 4. Sale Return Form & Line Items
const saleReturnForm = ref({
  customer: '',
  invoiceNo: '',
  blNumber: '',
  creditNoteNo: `CRN-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
  returnDate: new Date().toISOString().substring(0, 10),
  refundAmount: 0,
  serialCode: '',
  reason: 'Customer Equipment Return'
})

const saleReturnRows = ref([
  {
    id: `sr_row_${Date.now()}`,
    productId: '',
    sku: '',
    itemDescription: '',
    serials: [],
    availableSerialsList: [],
    qty: 1,
    unitCost: 0
  }
])

const isSrCustomerDropdownOpen = ref(false)
const isSrInvoiceDropdownOpen = ref(false)
const isSrBlDropdownOpen = ref(false)
const activeSrComboboxIndex = ref(null)

// Dedicated Serial Modal State for Sale Return
const showSrSerialModal = ref(false)
const activeSrSerialRowIndex = ref(0)
const srNewMachineCode = ref('')
const srNewSerialCode = ref('')

const activeSrSerialRow = computed(() => saleReturnRows.value[activeSrSerialRowIndex.value] || null)

function openSrSerialModal(idx) {
  activeSrSerialRowIndex.value = idx
  srNewMachineCode.value = ''
  srNewSerialCode.value = ''
  showSrSerialModal.value = true
}

function closeSrSerialModal() {
  showSrSerialModal.value = false
}

function commitSrSerial() {
  const code = srNewSerialCode.value.trim()
  const m = srNewMachineCode.value.trim()
  if (!code && !m) return
  if (!activeSrSerialRow.value) return
  if (!Array.isArray(activeSrSerialRow.value.serials)) activeSrSerialRow.value.serials = []

  const exists = activeSrSerialRow.value.serials.some(s => s.serialCode === code || (m && s.machineCode === m))
  if (!exists) {
    activeSrSerialRow.value.serials.push({
      serialCode: code || m,
      machineCode: m || code
    })
  }
  srNewSerialCode.value = ''
  srNewMachineCode.value = ''
}

function removeSrSerial(sIdx) {
  if (activeSrSerialRow.value && activeSrSerialRow.value.serials) {
    activeSrSerialRow.value.serials.splice(sIdx, 1)
  }
}

function isSrSerialSelected(unit) {
  if (!activeSrSerialRow.value || !activeSrSerialRow.value.serials) return false
  return activeSrSerialRow.value.serials.some(s => s.serialCode === unit.serialCode)
}

function toggleSrSerialUnit(unit) {
  if (!activeSrSerialRow.value) return
  if (!Array.isArray(activeSrSerialRow.value.serials)) activeSrSerialRow.value.serials = []

  const idx = activeSrSerialRow.value.serials.findIndex(s => s.serialCode === unit.serialCode)
  if (idx !== -1) {
    activeSrSerialRow.value.serials.splice(idx, 1)
  } else {
    activeSrSerialRow.value.serials.push({
      serialCode: unit.serialCode,
      machineCode: unit.machineCode || unit.serialCode
    })
  }
}

const filteredSrCustomers = computed(() => {
  const raw = String(saleReturnForm.value.customer || '').trim()
  const q = raw.replace(/\s+/g, ' ').toLowerCase()
  const list = dataStore.customers || []
  if (!q) return list
  return list.filter(c => {
    const cName = String(c.name || '').replace(/\s+/g, ' ').toLowerCase()
    return cName.includes(q)
  })
})

const filteredSrInvoices = computed(() => {
  const q = String(saleReturnForm.value.invoiceNo || '').trim().toLowerCase()
  const list = dataStore.salesInvoices || []
  if (!q) return list.slice(0, 30)
  return list.filter(inv =>
    (inv.invoiceNo && inv.invoiceNo.toLowerCase().includes(q)) ||
    (inv.customer && inv.customer.toLowerCase().includes(q)) ||
    (inv.customerName && inv.customerName.toLowerCase().includes(q))
  ).slice(0, 30)
})

const saleReturnTotalQty = computed(() => {
  return saleReturnRows.value.reduce((acc, r) => acc + Number(r.qty || 1), 0)
})

const saleReturnTotalAmount = computed(() => {
  return saleReturnRows.value.reduce((acc, r) => acc + (Number(r.qty || 1) * Number(r.unitCost || 0)), 0)
})

function addSaleReturnRow() {
  saleReturnRows.value.push({
    id: `sr_row_${Date.now()}_${Math.random()}`,
    productId: '',
    sku: '',
    itemDescription: '',
    serials: [],
    availableSerialsList: [],
    qty: 1,
    unitCost: 0
  })
}

function removeSaleReturnRow(idx) {
  if (saleReturnRows.value.length > 1) {
    saleReturnRows.value.splice(idx, 1)
  }
}

function populateSaleReturnFromInvoice(inv) {
  if (!inv) return
  saleReturnForm.value.invoiceNo = inv.invoiceNo || ''
  if (inv.customer || inv.customerName) {
    saleReturnForm.value.customer = inv.customer || inv.customerName
  }
  if (inv.blNumber) {
    saleReturnForm.value.blNumber = inv.blNumber
  }

  const items = inv.items || []
  if (items.length > 0) {
    saleReturnRows.value = items.map((it, idx) => {
      const prod = (dataStore.products || []).find(p => p.id === it.productId || p.sku === it.sku || p.name === it.productName)
      
      let availableList = []
      if (it.serials && it.serials.length > 0) {
        availableList = it.serials.map(s => {
          if (typeof s === 'string') return { serialCode: s, machineCode: s }
          return {
            serialCode: s.serialCode || s.code || '',
            machineCode: s.machineCode || s.serialCode || s.code || ''
          }
        }).filter(s => s.serialCode)
      }

      // Query dataStore.serials by productId, sku, or customer/inv
      const matched = (dataStore.serials || []).filter(s =>
        (s.invoiceNo && s.invoiceNo === inv.invoiceNo) ||
        (it.productId && s.productId === it.productId) ||
        (it.sku && s.sku === it.sku) ||
        (prod && (s.productId === prod.id || s.sku === prod.sku))
      )
      
      matched.forEach(m => {
        if (!availableList.some(a => a.serialCode === m.serialCode)) {
          availableList.push({
            serialCode: m.serialCode,
            machineCode: m.machineCode || m.serialCode
          })
        }
      })

      if (matched.length > 0 && matched[0].blNumber && !saleReturnForm.value.blNumber) {
        saleReturnForm.value.blNumber = matched[0].blNumber
      }

      // Default selected: first item (matching qty)
      const selectedSerials = availableList.slice(0, Number(it.qty || 1))

      return {
        id: `sr_row_${Date.now()}_${idx}`,
        productId: it.productId || prod?.id || '',
        sku: it.sku || prod?.sku || '',
        itemDescription: it.productName || it.name || prod?.name || 'Equipment Item',
        availableSerialsList: availableList,
        serials: selectedSerials,
        qty: Number(it.qty || it.quantity || 1),
        unitCost: Number(it.unitPrice || it.salePrice || (it.total ? it.total / (it.qty || 1) : 0) || 0)
      }
    })

    saleReturnForm.value.refundAmount = saleReturnTotalAmount.value
  }
}

function onSaleReturnCustomerChange() {
  const rawCustomer = String(saleReturnForm.value.customer || '').trim()
  if (!rawCustomer) return
  const cleanQ = rawCustomer.replace(/\s+/g, ' ').toLowerCase()

  const customerSales = (dataStore.salesInvoices || [])
    .filter(inv => {
      if (!inv) return false
      const invCust = String(inv.customer || inv.customerName || inv.party || '').replace(/\s+/g, ' ').toLowerCase()
      return invCust === cleanQ || cleanQ.includes(invCust) || (invCust && invCust.includes(cleanQ))
    })
    .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))

  if (customerSales.length > 0) {
    populateSaleReturnFromInvoice(customerSales[0])
  } else {
    const custSerials = (dataStore.serials || []).filter(s => {
      const sCust = String(s.customer || '').replace(/\s+/g, ' ').toLowerCase()
      return sCust && (sCust === cleanQ || cleanQ.includes(sCust))
    })
    if (custSerials.length > 0) {
      saleReturnForm.value.blNumber = custSerials[0].blNumber || ''
      const allAvail = custSerials.map(s => ({
        serialCode: s.serialCode,
        machineCode: s.machineCode || s.serialCode
      }))
      saleReturnRows.value = [{
        id: `sr_row_${Date.now()}`,
        productId: custSerials[0].productId || '',
        sku: custSerials[0].sku || '',
        itemDescription: custSerials[0].productName || 'Equipment Item',
        availableSerialsList: allAvail,
        serials: allAvail.slice(0, 1),
        qty: 1,
        unitCost: Number(custSerials[0].salePrice || custSerials[0].sellingPrice || 0)
      }]
      saleReturnForm.value.refundAmount = saleReturnTotalAmount.value
    }
  }
}

function onSaleReturnInvoiceChange() {
  const invNo = String(saleReturnForm.value.invoiceNo || '').trim().toLowerCase()
  if (!invNo) return
  const matchedInv = (dataStore.salesInvoices || []).find(inv =>
    inv.invoiceNo && inv.invoiceNo.toLowerCase() === invNo
  )
  if (matchedInv) {
    populateSaleReturnFromInvoice(matchedInv)
  }
}

async function handleSaveSaleReturn() {
  if (!saleReturnForm.value.customer) {
    uiStore.showToast('Please select a Customer', 'warning')
    return
  }

  const totalRefund = saleReturnTotalAmount.value || saleReturnForm.value.refundAmount || 0
  const returnSerials = []
  saleReturnRows.value.forEach(row => {
    (row.serials || []).forEach(s => {
      returnSerials.push({
        serialCode: s.serialCode,
        machineCode: s.machineCode,
        refundAmount: Number(row.unitCost || 0)
      })
    })
  })

  await dataStore.processSalesReturn({
    customer: saleReturnForm.value.customer,
    invoiceNo: saleReturnForm.value.invoiceNo || 'DIRECT-RET',
    blNumber: saleReturnForm.value.blNumber || '',
    branch: authStore.userBranch || 'Peshawar',
    serials: returnSerials,
    items: saleReturnRows.value.map(r => ({
      productName: r.itemDescription,
      sku: r.sku || '',
      qty: Number(r.qty || 1),
      unitPrice: Number(r.unitCost || 0),
      totalPrice: Number(r.qty || 1) * Number(r.unitCost || 0),
      serials: (r.serials || []).map(s => s.serialCode)
    })),
    totalRefundAmount: totalRefund,
    reason: saleReturnForm.value.reason,
    payoutRefund: true,
    paymentMethod: 'Cash Payment'
  })
  uiStore.showToast(`Sales Return recorded & credit note issued!`, 'success')
  uiStore.closeSaleReturnModal()
}

// 5. Purchase Return Form & Line Items (Debit Note)
const purchaseReturnForm = ref({
  supplier: '',
  blNumber: '',
  debitNoteNo: `DRN-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
  returnDate: new Date().toISOString().substring(0, 10),
  totalReturnAmount: 0,
  serialCode: '',
  reason: 'Defective Consignment Unit'
})

const purchaseReturnRows = ref([
  {
    id: `pr_row_${Date.now()}`,
    productId: '',
    sku: '',
    itemDescription: '',
    serials: [],
    availableSerialsList: [],
    qty: 1,
    unitCost: 0
  }
])

const isPrSupplierDropdownOpen = ref(false)
const isPrBlDropdownOpen = ref(false)
const activePrComboboxIndex = ref(null)

// Dedicated Serial Modal State for Purchase Return
const showPrSerialModal = ref(false)
const activePrSerialRowIndex = ref(0)
const prNewMachineCode = ref('')
const prNewSerialCode = ref('')

const activePrSerialRow = computed(() => purchaseReturnRows.value[activePrSerialRowIndex.value] || null)

function openPrSerialModal(idx) {
  activePrSerialRowIndex.value = idx
  prNewMachineCode.value = ''
  prNewSerialCode.value = ''
  showPrSerialModal.value = true
}

function closePrSerialModal() {
  showPrSerialModal.value = false
}

function commitPrSerial() {
  const code = prNewSerialCode.value.trim()
  const m = prNewMachineCode.value.trim()
  if (!code && !m) return
  if (!activePrSerialRow.value) return
  if (!Array.isArray(activePrSerialRow.value.serials)) activePrSerialRow.value.serials = []

  const exists = activePrSerialRow.value.serials.some(s => s.serialCode === code || (m && s.machineCode === m))
  if (!exists) {
    activePrSerialRow.value.serials.push({
      serialCode: code || m,
      machineCode: m || code
    })
  }
  prNewSerialCode.value = ''
  prNewMachineCode.value = ''
}

function removePrSerial(sIdx) {
  if (activePrSerialRow.value && activePrSerialRow.value.serials) {
    activePrSerialRow.value.serials.splice(sIdx, 1)
  }
}

function isPrSerialSelected(unit) {
  if (!activePrSerialRow.value || !activePrSerialRow.value.serials) return false
  return activePrSerialRow.value.serials.some(s => s.serialCode === unit.serialCode)
}

function togglePrSerialUnit(unit) {
  if (!activePrSerialRow.value) return
  if (!Array.isArray(activePrSerialRow.value.serials)) activePrSerialRow.value.serials = []

  const idx = activePrSerialRow.value.serials.findIndex(s => s.serialCode === unit.serialCode)
  if (idx !== -1) {
    activePrSerialRow.value.serials.splice(idx, 1)
  } else {
    activePrSerialRow.value.serials.push({
      serialCode: unit.serialCode,
      machineCode: unit.machineCode || unit.serialCode
    })
  }
}

const filteredPurchaseReturnSuppliers = computed(() => {
  const raw = String(purchaseReturnForm.value.supplier || '').trim()
  const q = raw.replace(/\s+/g, ' ').toLowerCase()
  const combined = [...(dataStore.suppliers || []), ...(dataStore.customers || [])]
  const seen = new Set()
  const unique = []
  combined.forEach(s => {
    const sName = String(s.name || s).trim()
    if (sName && !seen.has(sName)) {
      seen.add(sName)
      unique.push(s)
    }
  })
  if (!q) return unique
  return unique.filter(s => {
    const sName = String(s.name || s).replace(/\s+/g, ' ').toLowerCase()
    return sName.includes(q)
  })
})

const filteredPurchaseReturnBlList = computed(() => {
  const q = String(purchaseReturnForm.value.blNumber || '').trim().toLowerCase()
  const list = [...(dataStore.blList || [])]
  const seen = new Set(list.map(b => b.blNumber))
  ;(dataStore.containers || []).forEach(c => {
    const bl = c.blNumber || c.containerNo
    if (bl && !seen.has(bl)) {
      seen.add(bl)
      list.push({ blNumber: bl, supplierName: c.supplierName, branch: c.branch })
    }
  })
  ;(dataStore.serials || []).forEach(s => {
    const bl = s.blNumber || s.containerNo
    if (bl && !seen.has(bl)) {
      seen.add(bl)
      list.push({ blNumber: bl, supplierName: s.supplierName, branch: s.allocationCity })
    }
  })
  if (!q) return list
  return list.filter(bl =>
    (bl.blNumber && bl.blNumber.toLowerCase().includes(q)) ||
    (bl.supplierName && bl.supplierName.toLowerCase().includes(q))
  )
})

const purchaseReturnTotalQty = computed(() => {
  return purchaseReturnRows.value.reduce((acc, r) => acc + Number(r.qty || 1), 0)
})

const purchaseReturnTotalAmount = computed(() => {
  return purchaseReturnRows.value.reduce((acc, r) => acc + (Number(r.qty || 1) * Number(r.unitCost || 0)), 0)
})

function addPurchaseReturnRow() {
  purchaseReturnRows.value.push({
    id: `pr_row_${Date.now()}_${Math.random()}`,
    productId: '',
    sku: '',
    itemDescription: '',
    serials: [],
    availableSerialsList: [],
    qty: 1,
    unitCost: 0
  })
}

function removePurchaseReturnRow(idx) {
  if (purchaseReturnRows.value.length > 1) {
    purchaseReturnRows.value.splice(idx, 1)
  }
}

function onSelectPurchaseReturnProductItem(row, p) {
  row.productId = p.id
  row.sku = p.sku || ''
  row.itemDescription = p.name
  row.qty = 1
  row.unitCost = Number(p.costPrice || p.unitCost || 0)
  activePrComboboxIndex.value = null

  if (p.containerNo || p.blNumber) {
    if (!purchaseReturnForm.value.blNumber) {
      purchaseReturnForm.value.blNumber = p.containerNo || p.blNumber
    }
  }

  const matchedSerials = (dataStore.serials || []).filter(s =>
    (s.productId === p.id || s.sku === p.sku) &&
    (!purchaseReturnForm.value.blNumber || s.blNumber === purchaseReturnForm.value.blNumber || s.containerNo === purchaseReturnForm.value.blNumber)
  )
  row.availableSerialsList = matchedSerials.map(s => ({
    serialCode: s.serialCode,
    machineCode: s.machineCode || s.serialCode
  }))
  row.serials = row.availableSerialsList.slice(0, 1)
  purchaseReturnForm.value.totalReturnAmount = purchaseReturnTotalAmount.value
}

function populatePurchaseReturnItemsFromBl(blRef, supplierStr) {
  const cleanBL = String(blRef || '').trim().toUpperCase()
  const cleanSupp = String(supplierStr || '').replace(/\s+/g, ' ').toLowerCase()
  const codeMatch = String(supplierStr || '').match(/([A-Z0-9_-]{5,})/i)
  const extractedCode = codeMatch ? codeMatch[1].toUpperCase() : ''

  const allSerials = dataStore.serials || []
  const matchingSerials = allSerials.filter(s => {
    if (!s) return false
    const sBl = String(s.blNumber || s.containerNo || s.purchaseInvoiceNo || '').toUpperCase()
    const sSupp = String(s.supplierName || s.companyName || '').replace(/\s+/g, ' ').toLowerCase()
    
    if (cleanBL && (sBl === cleanBL || sBl.includes(cleanBL))) return true
    if (extractedCode && (sBl === extractedCode || sBl.includes(extractedCode))) return true
    if (cleanSupp && sSupp && (sSupp === cleanSupp || cleanSupp.includes(sSupp) || sSupp.includes(cleanSupp))) return true
    return false
  })

  const matchedContainer = (dataStore.containers || []).find(c =>
    (cleanBL && (c.blNumber === cleanBL || c.containerNo === cleanBL)) ||
    (extractedCode && (c.blNumber === extractedCode || c.containerNo === extractedCode))
  )

  if (matchingSerials.length > 0) {
    const groups = {}
    matchingSerials.forEach(s => {
      const key = s.productId || s.sku || s.productName || 'unknown'
      if (!groups[key]) {
        const prod = (dataStore.products || []).find(p => p.id === s.productId || p.sku === s.sku || p.name === s.productName)
        groups[key] = {
          productId: s.productId || prod?.id || '',
          sku: s.sku || prod?.sku || '',
          itemDescription: s.productName || prod?.name || s.sku || 'Equipment Item',
          unitCost: Number(s.costPrice || prod?.costPrice || 0),
          allSerials: []
        }
      }
      const sCode = s.serialCode || s.code || ''
      const mCode = s.machineCode || ''
      if (sCode && !groups[key].allSerials.some(x => x.serialCode === sCode)) {
        groups[key].allSerials.push({
          serialCode: sCode,
          machineCode: mCode || sCode
        })
      }
    })

    const newRows = Object.values(groups).map((g, idx) => ({
      id: `pr_row_${Date.now()}_${idx}`,
      productId: g.productId,
      sku: g.sku,
      itemDescription: g.itemDescription,
      availableSerialsList: g.allSerials,
      serials: g.allSerials.slice(0, 1),
      qty: 1,
      unitCost: g.unitCost
    }))

    if (newRows.length > 0) {
      purchaseReturnRows.value = newRows
      purchaseReturnForm.value.totalReturnAmount = purchaseReturnTotalAmount.value
      return
    }
  }

  if (matchedContainer && matchedContainer.items && matchedContainer.items.length > 0) {
    purchaseReturnRows.value = matchedContainer.items.map((it, idx) => {
      const prod = (dataStore.products || []).find(p => p.id === it.productId || p.sku === it.sku || p.name === it.name)
      const serialsList = (it.serialNumbers || it.serials || []).map(s => {
        if (typeof s === 'string') return { serialCode: s, machineCode: s }
        return {
          serialCode: s.serialCode || s.code || '',
          machineCode: s.machineCode || s.serialCode || s.code || ''
        }
      }).filter(s => s.serialCode)

      return {
        id: `pr_row_${Date.now()}_${idx}`,
        productId: it.productId || prod?.id || '',
        sku: it.sku || prod?.sku || '',
        itemDescription: it.name || it.productName || prod?.name || 'Equipment Item',
        availableSerialsList: serialsList,
        serials: serialsList.slice(0, 1),
        qty: 1,
        unitCost: Number(it.unitCost || it.costPrice || prod?.costPrice || 0)
      }
    })
    purchaseReturnForm.value.totalReturnAmount = purchaseReturnTotalAmount.value
  }
}

function onPurchaseReturnSupplierChange() {
  const rawSupplier = String(purchaseReturnForm.value.supplier || '').trim()
  if (!rawSupplier) return

  const cleanQ = rawSupplier.replace(/\s+/g, ' ').toLowerCase()
  const codeMatch = rawSupplier.match(/([A-Z0-9_-]{5,})/i)
  const extractedCode = codeMatch ? codeMatch[1].toUpperCase() : ''

  const containerList = dataStore.containers || []
  const blList = dataStore.blList || []
  const poList = dataStore.purchaseOrders || []

  let matchedBl = ''

  const cByCode = containerList.find(c =>
    (extractedCode && (c.blNumber === extractedCode || c.containerNo === extractedCode)) ||
    (c.supplierName && c.supplierName.toLowerCase().includes(cleanQ))
  )
  const blByCode = blList.find(b =>
    (extractedCode && b.blNumber === extractedCode) ||
    (b.supplierName && b.supplierName.toLowerCase().includes(cleanQ))
  )
  const poByCode = poList.find(p =>
    (extractedCode && (p.blNumber === extractedCode || p.poNumber === extractedCode)) ||
    (p.supplierName && p.supplierName.toLowerCase().includes(cleanQ))
  )

  if (cByCode) {
    matchedBl = cByCode.blNumber || cByCode.containerNo
  } else if (blByCode) {
    matchedBl = blByCode.blNumber
  } else if (poByCode) {
    matchedBl = poByCode.blNumber || poByCode.poNumber
  } else if (extractedCode) {
    const hasSerials = (dataStore.serials || []).some(s =>
      s.blNumber === extractedCode || s.containerNo === extractedCode || s.purchaseInvoiceNo === extractedCode
    )
    if (hasSerials) {
      matchedBl = extractedCode
    }
  }

  if (matchedBl) {
    purchaseReturnForm.value.blNumber = matchedBl
  }

  populatePurchaseReturnItemsFromBl(matchedBl || extractedCode, rawSupplier)
}

function onPurchaseReturnBlChange() {
  const blVal = String(purchaseReturnForm.value.blNumber || '').trim()
  if (!blVal) return
  populatePurchaseReturnItemsFromBl(blVal, purchaseReturnForm.value.supplier)
}

async function handleSavePurchaseReturn() {
  if (!purchaseReturnForm.value.supplier) {
    uiStore.showToast('Please select a Supplier / Exporter', 'warning')
    return
  }

  const serialItems = []
  purchaseReturnRows.value.forEach(row => {
    (row.serials || []).forEach(s => {
      serialItems.push({
        serialCode: s.serialCode,
        machineCode: s.machineCode,
        costPrice: Number(row.unitCost || 0)
      })
    })
  })

  const totalReturnVal = purchaseReturnTotalAmount.value || purchaseReturnForm.value.totalReturnAmount || 0

  await dataStore.processPurchaseReturn({
    supplier: purchaseReturnForm.value.supplier,
    blNumber: purchaseReturnForm.value.blNumber || 'BL-RETURN',
    returnDate: purchaseReturnForm.value.returnDate || new Date().toISOString().substring(0, 10),
    branch: authStore.userBranch || 'Peshawar',
    serials: serialItems,
    items: purchaseReturnRows.value.map(r => ({
      productName: r.itemDescription,
      sku: r.sku || '',
      qty: Number(r.qty || 1),
      unitCost: Number(r.unitCost || 0),
      totalCost: Number(r.qty || 1) * Number(r.unitCost || 0),
      serials: (r.serials || []).map(s => s.serialCode)
    })),
    totalReturnAmount: totalReturnVal,
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

watch(() => uiStore.showSaleReturnModal, (isOpen) => {
  if (isOpen) {
    if (uiStore.saleReturnInitialData) {
      populateSaleReturnFromInvoice(uiStore.saleReturnInitialData)
    }
  }
})

watch(() => uiStore.showPurchaseReturnModal, (isOpen) => {
  if (isOpen) {
    if (uiStore.purchaseReturnInitialData) {
      const data = uiStore.purchaseReturnInitialData
      if (data.supplier) purchaseReturnForm.value.supplier = data.supplier
      if (data.blNumber) purchaseReturnForm.value.blNumber = data.blNumber
      populatePurchaseReturnItemsFromBl(data.blNumber || '', data.supplier || '')
    }
  }
})

</script>
