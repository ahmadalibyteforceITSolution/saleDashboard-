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
  ChevronDown,
  Plus,
  MapPin
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
