<template>
  <div class="vyapar-items-view flex flex-col h-[calc(100vh-64px)] overflow-hidden">
    
    <!-- ── 1. Top Sub-Header Navigation Bar (Matching Vyapar screenshot) ────── -->
    <div class="vyapar-sub-header flex items-center justify-between px-6 bg-white dark:bg-[#1e2530] border-b border-slate-200 dark:border-slate-700/80 shrink-0 select-none">
      <div class="flex items-center gap-6 sm:gap-8 text-xs font-extrabold uppercase tracking-wider overflow-x-auto">
        <!-- Products (Active Tab) -->
        <button
          @click="activeSubNav = 'products'"
          class="subnav-item py-3 px-1 border-b-2 transition-colors whitespace-nowrap"
          :class="activeSubNav === 'products' ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-black' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'"
        >
          PRODUCTS
        </button>

        <!-- Services -->
        <button
          @click="activeSubNav = 'services'"
          class="subnav-item py-3 px-1 border-b-2 transition-colors whitespace-nowrap"
          :class="activeSubNav === 'services' ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-black' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'"
        >
          SERVICES
        </button>

        <!-- Category -->
        <button
          @click="activeSubNav = 'category'"
          class="subnav-item py-3 px-1 border-b-2 transition-colors whitespace-nowrap"
          :class="activeSubNav === 'category' ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-black' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'"
        >
          CATEGORY
        </button>

        <!-- Units -->
        <button
          @click="activeSubNav = 'units'"
          class="subnav-item py-3 px-1 border-b-2 transition-colors whitespace-nowrap"
          :class="activeSubNav === 'units' ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-black' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'"
        >
          UNITS
        </button>

        <!-- My Online Store -->
        <button
          @click="activeSubNav = 'store'"
          class="subnav-item py-3 px-1 border-b-2 transition-colors whitespace-nowrap"
          :class="activeSubNav === 'store' ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-black' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'"
        >
          MY ONLINE STORE
        </button>
      </div>

      <!-- Right Utility Actions -->
      <div class="flex items-center gap-2">
        <button
          v-if="authStore.isSuperAdmin"
          @click="showTransferModal = true"
          class="btn btn-xs btn-ghost text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
          title="Branch Stock Transfer"
        >
          <ArrowRightLeft :size="12" class="text-indigo-400" />
          <span>Transfer</span>
        </button>
        <button
          @click="showFileImportModal = true"
          class="btn btn-xs btn-ghost text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
          title="Import Products"
        >
          <UploadCloud :size="12" class="text-amber-400" />
          <span>Import</span>
        </button>
      </div>
    </div>

    <!-- ── 2. Main 2-Column Split Workspace ────────────────────────────────── -->
    <div v-if="activeSubNav === 'products'" class="flex-1 flex overflow-hidden bg-[#f1f5f9] dark:bg-[#0f172a]">
      
      <!-- ── LEFT COLUMN: Items Directory (~330px) ─────────────────────────── -->
      <div class="w-80 md:w-88 lg:w-96 flex flex-col bg-white dark:bg-[#1e2530] border-r border-slate-200 dark:border-slate-700/80 shrink-0 h-full">
        
        <!-- Search & + Add Item Action Row -->
        <div class="p-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800">
          <!-- Search input -->
          <div class="relative flex-1">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" :size="14" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search items, SKU..."
              class="w-full pl-8 pr-2.5 py-1.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <!-- + Add Item Button (Orange/Amber Vyapar style with split dropdown) -->
          <div class="relative">
            <button
              @click="showAddModal = true"
              class="vyapar-btn-add-item flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-md shadow-sm active:scale-95 transition-all whitespace-nowrap"
              title="Add New Equipment Product SKU"
            >
              <Plus :size="14" />
              <span>Add Item</span>
              <ChevronDown :size="12" class="opacity-80" />
            </button>
          </div>

          <!-- 3-Dots Menu -->
          <button
            type="button"
            class="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Item Options"
            @click="triggerExportProducts('xlsx')"
          >
            <MoreVertical :size="14" />
          </button>
        </div>

        <!-- List Header with Red Funnel Filter Popover -->
        <div class="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider relative select-none">
          <div class="flex items-center gap-2">
            <span class="cursor-pointer" @click="showFilterPopover = !showFilterPopover">ITEM</span>
            <button
              type="button"
              @click="showFilterPopover = !showFilterPopover"
              class="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              :class="{ 'text-rose-500': itemStockFilter !== 'ALL' }"
              title="Filter by Stock Status"
            >
              <Filter :size="13" class="text-rose-500 fill-rose-500" />
            </button>
          </div>

          <div class="flex items-center gap-2">
            <span>QUANTITY</span>
          </div>

          <!-- Stock Filter Popover -->
          <div
            v-if="showFilterPopover"
            class="filter-popover absolute left-2 top-8 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 w-48 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
          >
            <div class="space-y-1.5 text-xs text-slate-700 dark:text-slate-200 font-semibold">
              <label class="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                <input type="radio" name="itemFilter" value="ALL" v-model="itemStockFilter" class="accent-teal-600" />
                <span>ALL ITEMS</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                <input type="radio" name="itemFilter" value="IN_STOCK" v-model="itemStockFilter" class="accent-teal-600" />
                <span>IN STOCK (> 0)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                <input type="radio" name="itemFilter" value="LOW_STOCK" v-model="itemStockFilter" class="accent-teal-600" />
                <span>LOW STOCK</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                <input type="radio" name="itemFilter" value="OUT_OF_STOCK" v-model="itemStockFilter" class="accent-teal-600" />
                <span>OUT OF STOCK (0)</span>
              </label>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                @click="itemStockFilter = 'ALL'; showFilterPopover = false"
                class="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
              >
                CLEAR
              </button>
              <button
                @click="showFilterPopover = false"
                class="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded shadow-sm"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>

        <!-- Scrollable Item Directory Rows -->
        <div class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          <div
            v-for="item in filteredItemList"
            :key="item.id || item.sku"
            @click="selectItem(item)"
            class="item-row-entry px-3.5 py-3 flex items-center justify-between cursor-pointer transition-colors group relative"
            :class="[
              selectedItem?.sku === item.sku || selectedItem?.id === item.id
                ? 'bg-sky-50 dark:bg-sky-950/30 border-l-4 border-sky-600'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'
            ]"
          >
            <!-- Item Name & Category -->
            <div class="flex-1 min-w-0 pr-2">
              <div class="font-bold text-xs text-slate-800 dark:text-slate-100 truncate uppercase" :title="item.name">
                {{ item.name }}
              </div>
              <div class="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {{ item.sku }} • {{ item.category }}
              </div>
            </div>

            <!-- Item Quantity & 3-Dots -->
            <div class="flex items-center gap-2 shrink-0 text-right">
              <div
                class="font-mono font-bold text-xs"
                :class="item.stockQty > 0 ? 'vyapar-qty-in-stock' : 'vyapar-qty-out-of-stock'"
                :style="{ color: item.stockQty > 0 ? '#16a34a !important' : '#dc2626 !important', fontWeight: '800 !important' }"
              >
                {{ item.stockQty }}
              </div>

              <button
                type="button"
                @click.stop="openViewModal(item)"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded opacity-60 group-hover:opacity-100 transition-opacity"
                title="View SKU"
              >
                <MoreVertical :size="13" />
              </button>
            </div>
          </div>

          <div v-if="filteredItemList.length === 0" class="p-8 text-center text-xs text-slate-400">
            No items found matching filters.
          </div>
        </div>

      </div>

      <!-- ── RIGHT COLUMN: Selected Item Details & Transactions Pane ────────── -->
      <div class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#111827]">
        
        <div v-if="selectedItem" class="flex-1 flex flex-col overflow-hidden">
          
          <!-- Top Item Summary Header Card (Matching Vyapar screenshot) -->
          <div class="bg-white dark:bg-[#1e2530] border-b border-slate-200 dark:border-slate-800 p-5 shrink-0 shadow-xs">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <!-- Left: Item Name & Prices -->
              <div class="space-y-2 flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                    {{ selectedItem.name }}
                  </h2>
                  <button type="button" class="text-slate-400 hover:text-sky-600 transition-colors" title="Share Item">
                    <Share2 :size="15" />
                  </button>
                </div>

                <!-- Price Badges -->
                <div class="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div class="flex items-center gap-1.5">
                    <span class="font-semibold text-slate-500 dark:text-slate-400">SALE PRICE:</span>
                    <strong class="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-bold">
                      Rs {{ formatNumber(selectedItem.sellingPrice || selectedItem.salePrice || 0) }}
                    </strong>
                    <span class="text-[10px] text-slate-400 font-normal">(excl)</span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <span class="font-semibold text-slate-500 dark:text-slate-400">PURCHASE PRICE:</span>
                    <strong class="text-blue-600 dark:text-blue-400 font-mono text-sm font-bold">
                      Rs {{ formatNumber(selectedItem.costPrice || 0) }}
                    </strong>
                    <span class="text-[10px] text-slate-400 font-normal">(excl)</span>
                  </div>

                  <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span class="font-semibold">HSN:</span>
                    <strong class="text-slate-700 dark:text-slate-200 font-mono font-bold">{{ selectedItem.hsnCode || '9018.1200' }}</strong>
                  </div>
                </div>
              </div>

              <!-- Right: Metrics & Adjust Button -->
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                <button
                  @click="openAdjustModal(selectedItem)"
                  class="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-md shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  title="Adjust item stock quantity"
                >
                  <SlidersHorizontal :size="13" />
                  <span>ADJUST ITEM</span>
                </button>

                <div class="text-left sm:text-right space-y-0.5">
                  <div class="text-xs font-bold text-slate-800 dark:text-slate-100">
                    STOCK QUANTITY: <span class="font-mono">{{ selectedItem.stockQty }}</span>
                  </div>
                  <div class="text-xs font-bold text-slate-700 dark:text-slate-300">
                    STOCK VALUE: <span class="text-emerald-600 dark:text-emerald-400 font-mono font-black">Rs {{ formatNumber((selectedItem.stockQty || 0) * (selectedItem.costPrice || 0)) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Switcher Bar (Transactions vs Serials vs Historical Audits) -->
          <div class="px-5 py-2 bg-slate-50 dark:bg-[#1e2530]/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
            <div class="flex items-center gap-2">
              <button
                @click="activeItemDetailTab = 'transactions'"
                :class="[
                  'px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                  activeItemDetailTab === 'transactions'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                ]"
              >
                <FileText :size="13" />
                <span>TRANSACTIONS ({{ itemTransactions.length }})</span>
              </button>

              <button
                @click="activeItemDetailTab = 'serials'"
                :class="[
                  'px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                  activeItemDetailTab === 'serials'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                ]"
              >
                <QrCode :size="13" />
                <span>Serials & Units ({{ getAvailableSerials(selectedItem).length }})</span>
              </button>

              <button
                @click="activeItemDetailTab = 'audits'"
                :class="[
                  'px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                  activeItemDetailTab === 'audits'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                ]"
              >
                <Calendar :size="13" />
                <span>Historical Date Audits</span>
              </button>
            </div>

            <!-- Transaction Search Input (Matching screenshot top right search) -->
            <div v-if="activeItemDetailTab === 'transactions'" class="relative w-48 sm:w-64">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" :size="13" />
              <input
                v-model="txSearchQuery"
                type="text"
                placeholder="Search in transactions..."
                class="w-full pl-8 pr-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <!-- Content Tab Area -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            
            <!-- ── SUB-TAB 1: Vyapar TRANSACTIONS Table ──────────────────────── -->
            <div v-if="activeItemDetailTab === 'transactions'" class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[11px] select-none">
                      <th class="py-2.5 px-3 w-8"></th>
                      <th class="py-2.5 px-3 relative">
                        <div class="flex items-center gap-1 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" @click="showInvTypeFilterDropdown = !showInvTypeFilterDropdown">
                          <span>TYPE</span>
                          <span v-if="invTxTypeFilter !== 'ALL'" class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                          <Filter :size="11" :class="invTxTypeFilter !== 'ALL' ? 'text-sky-500 opacity-100' : 'opacity-60'" />
                          <ArrowUp v-if="invTxSortKey === 'type' && invTxSortOrder === 'asc'" :size="11" class="text-sky-500" />
                          <ArrowDown v-if="invTxSortKey === 'type' && invTxSortOrder === 'desc'" :size="11" class="text-sky-500" />
                        </div>

                        <!-- Backdrop for Outside Click -->
                        <div v-if="showInvTypeFilterDropdown" class="fixed inset-0" style="z-index: 999;" @click="showInvTypeFilterDropdown = false"></div>

                        <!-- Dropdown Popover for Inventory Type Filter -->
                        <div
                          v-if="showInvTypeFilterDropdown"
                          class="absolute left-0 top-full mt-1 border border-slate-700 rounded-lg p-2 min-w-[140px] space-y-1 text-xs"
                          style="background-color: #0b1329 !important; z-index: 1000; box-shadow: 0 20px 40px rgba(0,0,0,0.95); opacity: 1 !important;"
                        >
                          <div class="font-bold text-[10px] text-slate-400 uppercase px-2 py-0.5">Filter Type</div>
                          <button @click="setInvTxTypeFilter('ALL')" :class="['w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between', invTxTypeFilter === 'ALL' ? 'bg-sky-950/80 text-sky-400 font-bold' : 'hover:bg-slate-800 text-slate-200']">
                            <span>All Types</span>
                            <Check v-if="invTxTypeFilter === 'ALL'" :size="12" />
                          </button>
                          <button @click="setInvTxTypeFilter('SALE')" :class="['w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between', invTxTypeFilter === 'SALE' ? 'bg-sky-950/80 text-sky-400 font-bold' : 'hover:bg-slate-800 text-slate-200']">
                            <span>Sale</span>
                            <Check v-if="invTxTypeFilter === 'SALE'" :size="12" />
                          </button>
                          <button @click="setInvTxTypeFilter('PURCHASE')" :class="['w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between', invTxTypeFilter === 'PURCHASE' ? 'bg-sky-950/80 text-sky-400 font-bold' : 'hover:bg-slate-800 text-slate-200']">
                            <span>Purchase</span>
                            <Check v-if="invTxTypeFilter === 'PURCHASE'" :size="12" />
                          </button>
                          <div class="border-t border-slate-800 pt-1 mt-1">
                            <button @click="toggleInvTxSort('type'); showInvTypeFilterDropdown = false" class="w-full text-left px-2.5 py-1 rounded text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1">
                              <span>Sort A-Z / Z-A</span>
                            </button>
                          </div>
                        </div>
                      </th>
                      <th class="py-2.5 px-3">
                        <div class="flex items-center gap-1 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" @click="toggleInvTxSort('partyName')">
                          <span>NAME</span>
                          <ArrowUp v-if="invTxSortKey === 'partyName' && invTxSortOrder === 'asc'" :size="11" class="text-sky-500" />
                          <ArrowDown v-if="invTxSortKey === 'partyName' && invTxSortOrder === 'desc'" :size="11" class="text-sky-500" />
                          <Filter :size="11" class="opacity-60" />
                        </div>
                      </th>
                      <th class="py-2.5 px-3">
                        <div class="flex items-center gap-1 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" @click="toggleInvTxSort('date')">
                          <span>DATE</span>
                          <ArrowUp v-if="invTxSortKey === 'date' && invTxSortOrder === 'asc'" :size="11" class="text-sky-600" />
                          <ArrowDown v-else-if="invTxSortKey === 'date' && invTxSortOrder === 'desc'" :size="11" class="text-sky-600" />
                          <Filter :size="11" class="opacity-60" />
                        </div>
                      </th>
                      <th class="py-2.5 px-3 text-right">
                        <div class="flex items-center justify-end gap-1 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" @click="toggleInvTxSort('qty')">
                          <span>QUANTITY</span>
                          <ArrowUp v-if="invTxSortKey === 'qty' && invTxSortOrder === 'asc'" :size="11" class="text-sky-500" />
                          <ArrowDown v-if="invTxSortKey === 'qty' && invTxSortOrder === 'desc'" :size="11" class="text-sky-500" />
                          <Filter :size="11" class="opacity-60" />
                        </div>
                      </th>
                      <th class="py-2.5 px-3 text-right">
                        <div class="flex items-center justify-end gap-1 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" @click="toggleInvTxSort('unitPrice')">
                          <span>PRICE/ UNIT</span>
                          <ArrowUp v-if="invTxSortKey === 'unitPrice' && invTxSortOrder === 'asc'" :size="11" class="text-sky-500" />
                          <ArrowDown v-if="invTxSortKey === 'unitPrice' && invTxSortOrder === 'desc'" :size="11" class="text-sky-500" />
                          <Filter :size="11" class="opacity-60" />
                        </div>
                      </th>
                      <th class="py-2.5 px-3">
                        <div class="flex items-center gap-1 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400" @click="toggleInvTxSort('status')">
                          <span>STATUS</span>
                          <ArrowUp v-if="invTxSortKey === 'status' && invTxSortOrder === 'asc'" :size="11" class="text-sky-500" />
                          <ArrowDown v-if="invTxSortKey === 'status' && invTxSortOrder === 'desc'" :size="11" class="text-sky-500" />
                          <Filter :size="11" class="opacity-60" />
                        </div>
                      </th>
                      <th class="py-2.5 px-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    <tr
                      v-for="tx in filteredItemTransactions"
                      :key="tx.id"
                      class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <!-- Status Dot (Red for Purchase, Green for Sale) -->
                      <td class="py-3 px-3 text-center">
                        <span
                          class="inline-block w-2.5 h-2.5 rounded-full"
                          :class="[
                            tx.typeCategory === 'PURCHASE'
                              ? 'bg-rose-500'
                              : tx.typeCategory === 'SALE'
                              ? 'bg-emerald-500'
                              : 'bg-cyan-500'
                          ]"
                        ></span>
                      </td>

                      <!-- Type -->
                      <td class="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {{ tx.type }}
                      </td>

                      <!-- Party Name -->
                      <td class="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                        {{ tx.partyName || 'MMS AIR MATTRESS OLD' }}
                      </td>

                      <!-- Date -->
                      <td class="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                        {{ tx.date }}
                      </td>

                      <!-- Quantity -->
                      <td class="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                        {{ tx.qty }}
                      </td>

                      <!-- Price / Unit -->
                      <td class="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                        Rs {{ formatNumber(tx.unitPrice) }}
                      </td>

                      <!-- Status -->
                      <td class="py-3 px-3">
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-bold"
                          :class="tx.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
                        >
                          {{ tx.status || 'Unpaid' }}
                        </span>
                      </td>

                      <!-- 3 dots action menu -->
                      <td class="py-3 px-3 text-center">
                        <button
                          type="button"
                          @click="uiStore.showToast(`Transaction details: ${tx.type} • ${tx.partyName}`, 'info')"
                          class="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Actions"
                        >
                          <MoreVertical :size="14" />
                        </button>
                      </td>
                    </tr>

                    <tr v-if="filteredItemTransactions.length === 0">
                      <td colspan="8" class="py-12 text-center text-slate-400 italic">
                        No transactions recorded for this item.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ── SUB-TAB 2: Serials & Physical Units ──────────────────────── -->
            <div v-if="activeItemDetailTab === 'serials'" class="space-y-4">
              <div class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <QrCode :size="16" class="text-purple-400" />
                    <span>Individual Tracked Serial Numbers</span>
                  </h4>
                  <span class="badge badge-neutral text-xs font-mono">
                    {{ getAvailableSerials(selectedItem).length }} Available Units
                  </span>
                </div>

                <div class="flex flex-wrap gap-2 pt-2">
                  <div
                    v-for="s in getAvailableSerials(selectedItem)"
                    :key="s.serialCode"
                    class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3 text-xs"
                  >
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <div class="font-mono font-bold text-sky-600 dark:text-sky-400">{{ (s.serialCode || '').replace(/^SN-/i, '') }}</div>
                      <div class="text-[10px] text-purple-600 dark:text-purple-400 font-bold" v-if="s.machineCode">{{ s.machineCode }}</div>
                      <div class="text-[10px] text-slate-400">📍 {{ s.allocationCity || s.branch || 'Lahore Depot' }}</div>
                    </div>
                  </div>

                  <div v-if="getAvailableSerials(selectedItem).length === 0" class="p-6 text-center text-slate-400 italic w-full">
                    No physical serial units currently registered in stock.
                  </div>
                </div>
              </div>
            </div>

            <!-- ── SUB-TAB 3: Historical Date Audits ────────────────────────── -->
            <div v-if="activeItemDetailTab === 'audits'" class="space-y-4">
              <div class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-bold text-sm text-slate-800 dark:text-white">Historical Stock Snapshot Audit</h4>
                    <p class="text-xs text-slate-400 mt-0.5">Audit item stock positions across past dates and ledger snapshots.</p>
                  </div>
                  <input v-model="historicalDate" type="date" class="form-input text-xs font-bold p-1.5 border rounded" />
                </div>

                <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border rounded-lg flex items-center justify-between">
                  <div>
                    <span class="text-xs text-slate-500 block">Computed Position on {{ historicalDate }}:</span>
                    <strong class="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">{{ selectedItem.stockQty }} units</strong>
                  </div>
                  <button @click="triggerExportProducts('xlsx')" class="btn btn-sm bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded">
                    Export Audit Snapshot
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Empty Item State -->
        <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <Package :size="48" class="mb-3 opacity-30 text-sky-500" />
          <h3 class="text-base font-bold text-slate-700 dark:text-slate-200">Select an Item to View Stock Ledger</h3>
          <p class="text-xs text-slate-400 mt-1 max-w-sm">
            Choose an item from the left catalog to inspect selling price, purchase price, stock balance, and historical transactions.
          </p>
        </div>

      </div>

    </div>

    <!-- ── 3. SERVICES WORKSPACE ──────────────────────────────────────────── -->
    <div v-else-if="activeSubNav === 'services'" class="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1e2530] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench :size="20" class="text-sky-500" />
            <span>Clinical Engineering & Biomedical Services Catalog</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage AMC maintenance agreements, clinical repair packages, installation fees, and calibration services.
          </p>
        </div>
        <button
          @click="showAddServiceModal = true"
          class="btn bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus :size="14" />
          <span>+ Add New Service</span>
        </button>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="srv in serviceList"
          :key="srv.id"
          class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-sky-500/50 transition-all flex flex-col justify-between space-y-3"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="badge badge-purple text-[10px] font-mono">{{ srv.code }}</span>
              <span class="badge badge-success text-[10px]">{{ srv.status }}</span>
            </div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white leading-snug">{{ srv.name }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{{ srv.description }}</p>
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Service Fee</span>
              <span class="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                PKR {{ Number(srv.price).toLocaleString() }}
              </span>
            </div>
            <span class="text-xs text-slate-500 font-semibold">⏱ {{ srv.duration }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 4. CATEGORY WORKSPACE ──────────────────────────────────────────── -->
    <div v-else-if="activeSubNav === 'category'" class="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1e2530] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Tag :size="20" class="text-amber-500" />
            <span>Product Categories & Inventory Distribution</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Overview of medical equipment classifications, total SKUs, active stock counts, and valuation.
          </p>
        </div>
        <button
          @click="showAddCategoryModal = true"
          class="btn bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus :size="14" />
          <span>+ Add New Category</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="cat in categorySummaries"
          :key="cat.name"
          class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white uppercase">{{ cat.name }}</h3>
            <span class="badge badge-info text-[10px] font-mono">{{ cat.skuCount }} SKUs</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs py-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
            <div>
              <span class="text-[10px] text-slate-400 block uppercase">Stock Units</span>
              <span class="font-mono font-black text-slate-800 dark:text-slate-100 text-sm">{{ cat.totalStock }} units</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block uppercase">Est. Valuation</span>
              <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">PKR {{ cat.valuation.toLocaleString() }}</span>
            </div>
          </div>

          <div class="flex justify-end pt-1">
            <button
              @click="activeSubNav = 'products'; searchQuery = cat.name"
              class="text-xs text-sky-500 hover:text-sky-400 font-bold flex items-center gap-1"
            >
              <span>View Products in Category</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 5. UNITS WORKSPACE ─────────────────────────────────────────────── -->
    <div v-else-if="activeSubNav === 'units'" class="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1e2530] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Ruler :size="20" class="text-emerald-500" />
            <span>Units of Measurement (UOM) Registry</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard measurement units used across sales invoices, purchase manifests, and inventory tracking.
          </p>
        </div>
        <button
          @click="showAddUnitModal = true"
          class="btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus :size="14" />
          <span>+ Add Measurement Unit</span>
        </button>
      </div>

      <div class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table class="table-lined text-xs w-full">
          <thead class="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300">
            <tr>
              <th class="p-3 text-left">Unit Name</th>
              <th class="p-3 text-left">Short Code / Symbol</th>
              <th class="p-3 text-center">Decimal Precision</th>
              <th class="p-3 text-left">Description</th>
              <th class="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="unit in measurementUnits" :key="unit.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td class="p-3 font-bold text-slate-800 dark:text-white">{{ unit.name }}</td>
              <td class="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ unit.symbol }}</td>
              <td class="p-3 text-center font-mono">{{ unit.precision }} Decimals</td>
              <td class="p-3 text-slate-500 dark:text-slate-400">{{ unit.description }}</td>
              <td class="p-3 text-center">
                <span :class="['badge text-[10px] font-mono', unit.isDefault ? 'badge-success' : 'badge-neutral']">
                  {{ unit.isDefault ? 'PRIMARY' : 'ACTIVE' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── 6. MY ONLINE STORE WORKSPACE ───────────────────────────────────── -->
    <div v-else-if="activeSubNav === 'store'" class="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1e2530] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <Globe :size="20" class="text-indigo-500" />
            <h2 class="text-lg font-black text-slate-900 dark:text-white">B2B Medical Equipment Digital Storefront</h2>
            <span class="badge badge-success text-[10px] font-mono">LIVE & ONLINE</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Public digital catalog URL: <strong class="text-indigo-600 dark:text-indigo-400 font-mono">https://medimageservices.com/store/catalog</strong>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="copyStoreLink"
            class="btn btn-secondary text-xs font-bold px-3 py-2 flex items-center gap-1.5"
          >
            <Copy :size="13" />
            <span>Copy Store Link</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Store Settings -->
        <div class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Storefront Configuration
          </h3>
          <div class="space-y-3 text-xs">
            <div>
              <label class="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Company Display Name</label>
              <input type="text" value="MedImage Services Limited" class="form-input w-full p-2 border rounded font-bold" />
            </div>
            <div>
              <label class="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Sales Inquiry WhatsApp</label>
              <input type="text" value="+92 300 1234567" class="form-input w-full p-2 border rounded font-mono" />
            </div>
            <div>
              <label class="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Ordering Mode</label>
              <select class="form-select w-full p-2 border rounded font-bold">
                <option>Request Official Quotation (Proforma Inquiry)</option>
                <option>Direct Order Placement</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Catalog Online Visibility List -->
        <div class="lg:col-span-2 bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">
              Published Online Equipment Items ({{ dataStore.products.length }} Available)
            </h3>
            <span class="text-xs text-slate-400">Toggle public visibility</span>
          </div>

          <div class="overflow-y-auto max-h-96 divide-y divide-slate-100 dark:divide-slate-800">
            <div
              v-for="prod in dataStore.products"
              :key="prod.id || prod.sku"
              class="py-3 flex items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img :src="prod.image" class="w-10 h-10 object-cover rounded border border-slate-200 dark:border-slate-700 shrink-0" />
                <div class="min-w-0">
                  <div class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ prod.name }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ prod.sku }} • {{ prod.category }}</div>
                </div>
              </div>

              <div class="flex items-center gap-4 shrink-0">
                <div class="text-right">
                  <div class="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">PKR {{ Number(prod.sellingPrice || 0).toLocaleString() }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ prod.stockQty }} units</div>
                </div>
                <span class="badge badge-success text-[10px] font-mono">PUBLISHED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL: Add New Item SKU ─────────────────────────────────────────── -->
    <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
      <div class="modal-content max-w-lg bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div class="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <PackagePlus :size="18" class="text-orange-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Add New Equipment Item</h3>
          </div>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateItem" class="p-5 space-y-4 text-xs">
          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Item Name *</label>
            <input v-model="newItemForm.name" type="text" required placeholder="e.g. PORTABLE ULTRASOUND SCANNER" class="form-input w-full p-2 border rounded font-semibold" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">SKU Code *</label>
              <input v-model="newItemForm.sku" type="text" required placeholder="e.g. US10-8800" class="form-input w-full p-2 border rounded font-mono font-bold" />
            </div>
            <div class="form-group">
              <div class="flex items-center justify-between mb-1">
                <label class="form-label font-bold mb-0">Category</label>
                <button
                  type="button"
                  @click="showAddCategoryModal = true"
                  class="text-[11px] text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-0.5"
                >
                  <Plus :size="11" />
                  <span>+ Add Category</span>
                </button>
              </div>
              <select v-model="newItemForm.category" class="form-select w-full p-2 border rounded font-semibold">
                <option v-for="cat in dataStore.productCategories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Purchase Price (PKR) *</label>
              <input v-model.number="newItemForm.costPrice" type="number" required step="5000" class="form-input w-full p-2 border rounded font-mono font-bold" />
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Sale Price (PKR) *</label>
              <input v-model.number="newItemForm.sellingPrice" type="number" required step="5000" class="form-input w-full p-2 border rounded font-mono font-bold text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Opening Stock Quantity</label>
              <input v-model.number="newItemForm.stockQty" type="number" min="0" class="form-input w-full p-2 border rounded font-mono font-bold" />
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">HSN Code</label>
              <input v-model="newItemForm.hsnCode" type="text" placeholder="9018.1200" class="form-input w-full p-2 border rounded font-mono" />
            </div>
          </div>

          <div class="modal-footer pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button type="button" @click="showAddModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded">
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── MODAL: Adjust Stock Item ────────────────────────────────────────── -->
    <div v-if="showAdjustModal" class="modal-backdrop" @click.self="showAdjustModal = false">
      <div class="modal-content max-w-md bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <SlidersHorizontal :size="18" class="text-sky-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Adjust Stock: {{ selectedItem?.name }}</h3>
          </div>
          <button @click="showAdjustModal = false" class="text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleAdjustStock" class="space-y-4 text-xs">
          <div class="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg text-sky-800 dark:text-sky-200 flex justify-between items-center">
            <span>Current Registered Stock:</span>
            <strong class="font-mono text-base">{{ selectedItem?.stockQty }} units</strong>
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">New Physical Stock Quantity *</label>
            <input v-model.number="adjustForm.newQty" type="number" min="0" required class="form-input w-full p-2 border rounded font-mono font-bold text-emerald-600 dark:text-emerald-400" />
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Adjustment Reason *</label>
            <select v-model="adjustForm.reason" class="form-select w-full p-2 border rounded font-bold">
              <option value="Physical Stock Audit Correction">Physical Stock Audit Correction</option>
              <option value="Damaged / Scrapped Unit">Damaged / Scrapped Unit</option>
              <option value="Found Unrecorded Unit">Found Unrecorded Unit</option>
              <option value="Demo / Clinical Trial Deployment">Demo / Clinical Trial Deployment</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="showAdjustModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded">
              Apply Stock Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── MODAL: Branch Stock Transfer ────────────────────────────────────── -->
    <div v-if="showTransferModal" class="modal-backdrop" @click.self="showTransferModal = false">
      <div class="modal-content max-w-md bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <ArrowRightLeft :size="18" class="text-indigo-400" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Branch Stock Transfer</h3>
          </div>
          <button @click="showTransferModal = false" class="text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleStockTransfer" class="space-y-4 text-xs">
          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Select Item to Transfer *</label>
            <select v-model="transferForm.sku" class="form-select w-full p-2 border rounded font-bold">
              <option v-for="p in dataStore.products" :key="p.sku" :value="p.sku">
                {{ p.name }} (Stock: {{ p.stockQty }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">From Branch *</label>
              <select v-model="transferForm.fromBranch" class="form-select w-full p-2 border rounded font-bold">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Lahore">Lahore Depot</option>
                <option value="Multan">Multan Branch</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">To Branch *</label>
              <select v-model="transferForm.toBranch" class="form-select w-full p-2 border rounded font-bold">
                <option value="Lahore">Lahore Depot</option>
                <option value="Multan">Multan Branch</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Karachi">Karachi Hub</option>
                <option value="Islamabad">Islamabad Branch</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Transfer Quantity *</label>
            <input v-model.number="transferForm.qty" type="number" min="1" required class="form-input w-full p-2 border rounded font-mono font-bold text-indigo-600 dark:text-indigo-400" />
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="showTransferModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded">
              Execute Transfer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── MODAL: Import Products Excel/CSV ─────────────────────────────────── -->
    <div v-if="showFileImportModal" class="modal-backdrop" @click.self="showFileImportModal = false">
      <div class="modal-content max-w-md bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <UploadCloud :size="18" class="text-amber-400" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Import Products & SKUs</h3>
          </div>
          <button @click="showFileImportModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <input
          ref="productFileInputRef"
          type="file"
          accept=".csv,.xlsx,.xls,.txt"
          class="hidden"
          @change="handleProductFileUpload"
        />

        <div
          @click="triggerProductFilePicker"
          @dragover.prevent
          @drop.prevent="handleProductFileDrop"
          class="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 rounded-lg text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/40"
        >
          <FileSpreadsheet :size="36" class="mx-auto text-sky-500 mb-2 animate-bounce" />
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200 block">
            {{ uploadedFileName ? `Selected: ${uploadedFileName}` : 'Click or Drop Excel / CSV Catalog File Here' }}
          </span>
          <span class="text-[10px] text-slate-400 block mt-1">Columns: Name, SKU, Category, Cost, Price, Quantity</span>
        </div>

        <div class="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            @click="handleSampleProductImport"
            class="btn btn-ghost btn-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
          >
            <span>+ Load Sample Catalog</span>
          </button>
          <div class="flex items-center gap-2">
            <button @click="showFileImportModal = false" class="btn btn-secondary px-3 py-1.5 text-xs">Cancel</button>
            <button
              @click="confirmFileImport"
              class="btn bg-sky-600 hover:bg-sky-700 text-white font-bold px-3 py-1.5 text-xs rounded"
            >
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL: Add New Category ────────────────────────────────────── -->
    <div v-if="showAddCategoryModal" class="modal-backdrop" style="z-index: 1000;" @click.self="showAddCategoryModal = false">
      <div class="modal-content max-w-sm bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <PackagePlus :size="18" class="text-orange-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Add Equipment Category</h3>
          </div>
          <button @click="showAddCategoryModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleAddCategory" class="space-y-3 text-xs">
          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Category Name *</label>
            <input v-model="newCategoryName" type="text" placeholder="e.g. Endoscopy Equipment" required class="form-input w-full p-2 border rounded font-bold" />
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="showAddCategoryModal = false" class="btn btn-secondary px-3 py-1.5 text-xs">Cancel</button>
            <button type="submit" class="btn bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 text-xs rounded">
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── MODAL: Add New Service ─────────────────────────────────────────── -->
    <div v-if="showAddServiceModal" class="modal-backdrop" @click.self="showAddServiceModal = false">
      <div class="modal-content max-w-md bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <Wrench :size="18" class="text-sky-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Add Biomedical Service / AMC</h3>
          </div>
          <button @click="showAddServiceModal = false" class="text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleAddService" class="space-y-3 text-xs">
          <div>
            <label class="form-label font-bold mb-1 block">Service Name *</label>
            <input v-model="newServiceForm.name" type="text" placeholder="e.g. MRI Quarterly Coil Inspection" required class="form-input w-full p-2 border rounded font-bold" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="form-label font-bold mb-1 block">Service Code</label>
              <input v-model="newServiceForm.code" type="text" placeholder="e.g. AMC-MRI-01" class="form-input w-full p-2 border rounded font-mono font-bold" />
            </div>
            <div>
              <label class="form-label font-bold mb-1 block">Category</label>
              <select v-model="newServiceForm.category" class="form-select w-full p-2 border rounded font-bold">
                <option value="Maintenance">Maintenance / AMC</option>
                <option value="Calibration">Calibration & Testing</option>
                <option value="Repair">Hardware Repair</option>
                <option value="Installation">Installation & Setup</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="form-label font-bold mb-1 block">Service Fee (PKR) *</label>
              <input v-model.number="newServiceForm.price" type="number" min="0" required class="form-input w-full p-2 border rounded font-mono font-bold text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <label class="form-label font-bold mb-1 block">Turnaround Time</label>
              <input v-model="newServiceForm.duration" type="text" placeholder="e.g. 2 Days" class="form-input w-full p-2 border rounded" />
            </div>
          </div>
          <div>
            <label class="form-label font-bold mb-1 block">Description / Scope of Work</label>
            <textarea v-model="newServiceForm.description" rows="2" placeholder="Describe service deliverables..." class="form-input w-full p-2 border rounded"></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="showAddServiceModal = false" class="btn btn-secondary px-3 py-1.5">Cancel</button>
            <button type="submit" class="btn bg-sky-600 hover:bg-sky-700 text-white font-bold px-3 py-1.5 rounded">
              Save Service
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── MODAL: Add New Measurement Unit ────────────────────────────────── -->
    <div v-if="showAddUnitModal" class="modal-backdrop" @click.self="showAddUnitModal = false">
      <div class="modal-content max-w-md bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <Ruler :size="18" class="text-emerald-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Add Measurement Unit (UOM)</h3>
          </div>
          <button @click="showAddUnitModal = false" class="text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleAddUnit" class="space-y-3 text-xs">
          <div>
            <label class="form-label font-bold mb-1 block">Unit Full Name *</label>
            <input v-model="newUnitForm.name" type="text" placeholder="e.g. Liters, Pairs, Kits" required class="form-input w-full p-2 border rounded font-bold" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="form-label font-bold mb-1 block">Symbol / Code *</label>
              <input v-model="newUnitForm.symbol" type="text" placeholder="e.g. LTR, PRS, KIT" required class="form-input w-full p-2 border rounded font-mono font-bold" />
            </div>
            <div>
              <label class="form-label font-bold mb-1 block">Decimal Precision</label>
              <input v-model.number="newUnitForm.precision" type="number" min="0" max="4" class="form-input w-full p-2 border rounded font-mono" />
            </div>
          </div>
          <div>
            <label class="form-label font-bold mb-1 block">Description</label>
            <input v-model="newUnitForm.description" type="text" placeholder="e.g. Volumetric liquid packaging" class="form-input w-full p-2 border rounded" />
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="showAddUnitModal = false" class="btn btn-secondary px-3 py-1.5">Cancel</button>
            <button type="submit" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded">
              Save Unit
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
  Package,
  Search,
  Plus,
  ChevronDown,
  Filter,
  MoreVertical,
  SlidersHorizontal,
  Share2,
  FileText,
  QrCode,
  Calendar,
  ArrowDown,
  ArrowUp,
  Check,
  ArrowRightLeft,
  UploadCloud,
  PackagePlus,
  FileSpreadsheet,
  Wrench,
  Tag,
  Ruler,
  Globe,
  Copy,
  ExternalLink
} from 'lucide-vue-next'

const route = useRoute()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

// Navigation & Tab State
const activeSubNav = ref('products') // 'products' | 'services' | 'category' | 'units' | 'store'
const activeItemDetailTab = ref('transactions') // 'transactions' | 'serials' | 'audits'
const selectedItem = ref(null)
const searchQuery = ref('')
const txSearchQuery = ref('')
const itemStockFilter = ref('ALL') // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
const showFilterPopover = ref(false)
const historicalDate = ref(new Date().toISOString().split('T')[0])

// Services State
const serviceList = ref([
  { id: 'srv_01', name: 'Ultrasound System Annual Maintenance Contract (AMC)', code: 'AMC-US-01', category: 'Maintenance', price: 150000, duration: '12 Months', status: 'Active', description: 'Comprehensive bi-annual calibration, acoustic probe check, and board diagnostic' },
  { id: 'srv_02', name: 'Laser 808nm Optical Diode Calibration', code: 'CAL-LSR-01', category: 'Calibration', price: 85000, duration: '1 Day', status: 'Active', description: 'Laser power output testing, optical alignment, and cooling coolant refill' },
  { id: 'srv_03', name: 'Cardiology ECG Lead & Circuit Repair', code: 'REP-ECG-02', category: 'Repair', price: 45000, duration: '3 Days', status: 'Active', description: 'Internal board soldering, lead connector replacement, and signal testing' },
  { id: 'srv_04', name: 'On-Site Clinical Hospital Installation & Training', code: 'INS-TRN-01', category: 'Installation', price: 65000, duration: '2 Days', status: 'Active', description: 'Biomedical installation, doctor orientation, and commissioning certificate' }
])
const showAddServiceModal = ref(false)
const newServiceForm = ref({
  name: '',
  code: '',
  category: 'Maintenance',
  price: 0,
  duration: '1 Day',
  description: ''
})

function handleAddService() {
  if (!newServiceForm.value.name.trim()) return
  serviceList.value.push({
    id: `srv_${Date.now()}`,
    ...newServiceForm.value,
    status: 'Active'
  })
  showAddServiceModal.value = false
  uiStore.showToast(`Service "${newServiceForm.value.name}" added successfully!`, 'success')
  newServiceForm.value = { name: '', code: '', category: 'Maintenance', price: 0, duration: '1 Day', description: '' }
}

// Category Summaries
const categorySummaries = computed(() => {
  const cats = dataStore.productCategories || []
  const prods = dataStore.products || []
  return cats.map(cName => {
    const matching = prods.filter(p => p.category === cName)
    const skuCount = matching.length
    const totalStock = matching.reduce((sum, p) => sum + (p.stockQty || 0), 0)
    const valuation = matching.reduce((sum, p) => sum + ((p.stockQty || 0) * (p.sellingPrice || 0)), 0)
    return {
      name: cName,
      skuCount,
      totalStock,
      valuation
    }
  })
})

// Units of Measurement State
const measurementUnits = ref([
  { id: 'u_01', name: 'Units / Numbers', symbol: 'UNT', precision: 0, isDefault: true, description: 'Standard whole unit item count' },
  { id: 'u_02', name: 'Pieces', symbol: 'PCS', precision: 0, isDefault: false, description: 'Single individual piece' },
  { id: 'u_03', name: 'Sets', symbol: 'SET', precision: 0, isDefault: false, description: 'Complete system assembly set' },
  { id: 'u_04', name: 'Boxes / Cartons', symbol: 'BOX', precision: 0, isDefault: false, description: 'Bulk shipment carton packaging' },
  { id: 'u_05', name: 'Meters', symbol: 'MTR', precision: 2, isDefault: false, description: 'Linear length for cables & tubing' }
])
const showAddUnitModal = ref(false)
const newUnitForm = ref({
  name: '',
  symbol: '',
  precision: 0,
  description: ''
})

function handleAddUnit() {
  if (!newUnitForm.value.name.trim()) return
  measurementUnits.value.push({
    id: `u_${Date.now()}`,
    ...newUnitForm.value,
    isDefault: false
  })
  showAddUnitModal.value = false
  uiStore.showToast(`Unit "${newUnitForm.value.name}" added!`, 'success')
  newUnitForm.value = { name: '', symbol: '', precision: 0, description: '' }
}

function copyStoreLink() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText('https://medimageservices.com/store/catalog')
    uiStore.showToast('Online Store URL copied to clipboard!', 'success')
  }
}

const invTxSortKey = ref('date')
const invTxSortOrder = ref('desc')
const invTxTypeFilter = ref('ALL') // 'ALL' | 'SALE' | 'PURCHASE'
const showInvTypeFilterDropdown = ref(false)

function toggleInvTxSort(key) {
  if (invTxSortKey.value === key) {
    invTxSortOrder.value = invTxSortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    invTxSortKey.value = key
    invTxSortOrder.value = 'desc'
  }
}

function setInvTxTypeFilter(type) {
  invTxTypeFilter.value = type
  showInvTypeFilterDropdown.value = false
}

// Modals
const showAddModal = ref(false)
const showAdjustModal = ref(false)
const showTransferModal = ref(false)
const showFileImportModal = ref(false)
const showAddCategoryModal = ref(false)
const newCategoryName = ref('')

function handleAddCategory() {
  if (!newCategoryName.value.trim()) return
  const createdCat = dataStore.addProductCategory(newCategoryName.value.trim(), authStore.user)
  newItemForm.value.category = createdCat
  showAddCategoryModal.value = false
  newCategoryName.value = ''
  uiStore.showToast(`Category "${createdCat}" created and selected!`, 'success')
}

const newItemForm = ref({
  name: '',
  sku: '',
  category: 'Ultrasound Machines',
  costPrice: 450000,
  sellingPrice: 650000,
  stockQty: 5,
  hsnCode: '9018.1200'
})

const adjustForm = ref({
  newQty: 0,
  reason: 'Physical Stock Audit Correction'
})

const transferForm = ref({
  sku: '',
  fromBranch: 'Peshawar',
  toBranch: 'Lahore',
  qty: 1
})

function formatNumber(num) {
  return Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Item Catalog List Computation ───────────────────────────
const allItemsList = computed(() => {
  const map = new Map()

  // 1. Products from dataStore
  ;(dataStore.products || []).forEach(p => {
    map.set(p.sku, {
      ...p,
      name: p.name || p.sku,
      stockQty: p.stockQty !== undefined ? p.stockQty : 0,
      costPrice: p.costPrice || 0,
      sellingPrice: p.sellingPrice || p.salePrice || 0,
      category: p.category || 'Equipment'
    })
  })

  // 2. Extra Vyapar seeded sample items to match screenshot density if needed
  const sampleVyaparItems = [
    { name: 'AIR MATTRESS (AM) KAYANG MEDICAL', sku: 'AM-KAYANG-01', stockQty: 1, costPrice: 4200, sellingPrice: 6500, category: 'Hospital Furniture' },
    { name: 'ALUMINIUM SHOWER CHAIR', sku: 'ALU-SHW-01', stockQty: 15, costPrice: 3200, sellingPrice: 5000, category: 'Hospital Furniture' },
    { name: 'AUTOMATIC EXTERNAL DEFIBRILLATOR', sku: 'AED-DEF-01', stockQty: 11, costPrice: 180000, sellingPrice: 260000, category: 'Cardiology Equipment' },
    { name: 'BABY WEIGHT SCALE DIGITAL', sku: 'BBY-SCL-01', stockQty: 0, costPrice: 8500, sellingPrice: 14000, category: 'Neonatal Care Equipment' },
    { name: 'BIPAP MACHINE (DF-30V)', sku: 'BIP-DF30-01', stockQty: 67, costPrice: 95000, sellingPrice: 145000, category: 'Respiratory Care' },
    { name: 'BIPAP MACHINE (DS-8)', sku: 'BIP-DS8-01', stockQty: 27, costPrice: 110000, sellingPrice: 165000, category: 'Respiratory Care' },
    { name: 'BIPAP MACHINE (VM-08)', sku: 'BIP-VM08-01', stockQty: 15, costPrice: 120000, sellingPrice: 175000, category: 'Respiratory Care' },
    { name: 'BIPAP MASK LARGE', sku: 'BIP-MSK-LG', stockQty: 2, costPrice: 3500, sellingPrice: 6000, category: 'Accessories' },
    { name: 'BIPAP MASK MEDIUM', sku: 'BIP-MSK-MD', stockQty: 6, costPrice: 3500, sellingPrice: 6000, category: 'Accessories' },
    { name: 'BLANKET PUMP', sku: 'BLK-PMP-01', stockQty: 0, costPrice: 45000, sellingPrice: 70000, category: 'General Equipment' },
    { name: 'BP APPARATUS (BPL)', sku: 'BP-BPL-01', stockQty: 28, costPrice: 4500, sellingPrice: 7500, category: 'Diagnostic Devices' },
    { name: 'BP APPARATUS (BPX)', sku: 'BP-BPX-01', stockQty: 0, costPrice: 5000, sellingPrice: 8000, category: 'Diagnostic Devices' }
  ]

  sampleVyaparItems.forEach(s => {
    if (!map.has(s.sku)) {
      map.set(s.sku, {
        id: `sample_${s.sku}`,
        ...s,
        hsnCode: '9018.9000'
      })
    }
  })

  return Array.from(map.values())
})

const filteredItemList = computed(() => {
  let list = allItemsList.value

  // Stock Filter
  if (itemStockFilter.value === 'IN_STOCK') {
    list = list.filter(i => i.stockQty > 0)
  } else if (itemStockFilter.value === 'LOW_STOCK') {
    list = list.filter(i => i.stockQty > 0 && i.stockQty <= (i.minStock || 5))
  } else if (itemStockFilter.value === 'OUT_OF_STOCK') {
    list = list.filter(i => i.stockQty <= 0)
  }

  // Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
  }

  return list
})

// ── Selected Item Transactions ──────────────────────────────
const itemTransactions = computed(() => {
  if (!selectedItem.value) return []
  const txList = []
  const sku = selectedItem.value.sku
  const prodName = selectedItem.value.name

  // 1. Sales invoices containing this product
  ;(dataStore.salesInvoices || []).forEach(inv => {
    (inv.items || []).forEach(it => {
      if (it.sku === sku || it.productCode === sku || (it.productName && it.productName.toLowerCase().includes(prodName.toLowerCase()))) {
        txList.push({
          id: `sale_${inv.invoiceNo}_${it.sku}`,
          type: 'Sale',
          typeCategory: 'SALE',
          partyName: inv.customer || 'Customer',
          date: inv.saleDate || '22/08/2025',
          qty: it.qty || 1,
          unitPrice: it.unitPrice || it.sellingPrice || selectedItem.value.sellingPrice,
          status: inv.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'
        })
      }
    })
  })

  // 2. Container consignments / purchase bills
  ;(dataStore.containers || []).forEach(cnt => {
    (cnt.items || []).forEach(it => {
      if (it.sku === sku || it.productCode === sku || (it.name && it.name.toLowerCase().includes(prodName.toLowerCase()))) {
        txList.push({
          id: `pur_${cnt.containerNo}_${it.sku}`,
          type: 'Purchase',
          typeCategory: 'PURCHASE',
          partyName: cnt.supplierName || 'MMS AIR MATTRESS OLD',
          date: cnt.arrivalDate || '22/08/2025, 03:45 PM',
          qty: it.quantity || 1,
          unitPrice: it.costPrice || selectedItem.value.costPrice || 4200,
          status: 'Unpaid'
        })
      }
    })
  })

  // Fallback sample purchase transaction matching Vyapar screenshot
  if (txList.length === 0) {
    txList.push({
      id: 'sample_tx_1',
      type: 'Purchase',
      typeCategory: 'PURCHASE',
      partyName: 'MMS AIR MATTRESS OLD',
      date: '22/08/2025, 03:45 PM',
      qty: 1,
      unitPrice: selectedItem.value.costPrice || 4200,
      status: 'Unpaid'
    })
  }

  return txList
})

const filteredItemTransactions = computed(() => {
  let list = [...itemTransactions.value]

  // 1. Type filter
  if (invTxTypeFilter.value !== 'ALL') {
    list = list.filter(t => t.typeCategory === invTxTypeFilter.value)
  }

  // 2. Search query
  if (txSearchQuery.value.trim()) {
    const q = txSearchQuery.value.toLowerCase().trim()
    list = list.filter(t => 
      (t.type && t.type.toLowerCase().includes(q)) || 
      (t.partyName && t.partyName.toLowerCase().includes(q)) ||
      (t.date && t.date.toLowerCase().includes(q))
    )
  }

  // 3. Sorting
  list.sort((a, b) => {
    let valA = a[invTxSortKey.value]
    let valB = b[invTxSortKey.value]

    if (invTxSortKey.value === 'qty' || invTxSortKey.value === 'unitPrice') {
      valA = Number(valA || 0)
      valB = Number(valB || 0)
    } else {
      valA = String(valA || '').toLowerCase()
      valB = String(valB || '').toLowerCase()
    }

    if (valA < valB) return invTxSortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return invTxSortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return list
})

function getAvailableSerials(item) {
  if (!item) return []
  return (dataStore.serials || []).filter(s => s.sku === item.sku && s.status === 'Available')
}

// ── Methods ─────────────────────────────────────────────────
function selectItem(item) {
  selectedItem.value = item
}

function openViewModal(item) {
  selectItem(item)
  activeItemDetailTab.value = 'transactions'
}

function openAdjustModal(item) {
  selectedItem.value = item
  adjustForm.value = {
    newQty: item.stockQty,
    reason: 'Physical Stock Audit Correction'
  }
  showAdjustModal.value = true
}

function handleAdjustStock() {
  if (!selectedItem.value) return
  const diff = adjustForm.value.newQty - selectedItem.value.stockQty
  selectedItem.value.stockQty = adjustForm.value.newQty

  // Update in dataStore
  const prod = (dataStore.products || []).find(p => p.sku === selectedItem.value.sku)
  if (prod) {
    prod.stockQty = adjustForm.value.newQty
  }

  uiStore.showToast(`Stock for ${selectedItem.value.name} adjusted to ${adjustForm.value.newQty} units (${diff >= 0 ? '+' : ''}${diff})`, 'success')
  showAdjustModal.value = false
}

function handleCreateItem() {
  const item = {
    id: `prd_${Date.now()}`,
    name: newItemForm.value.name.trim(),
    sku: newItemForm.value.sku.trim(),
    category: newItemForm.value.category,
    costPrice: newItemForm.value.costPrice,
    sellingPrice: newItemForm.value.sellingPrice,
    stockQty: newItemForm.value.stockQty,
    hsnCode: newItemForm.value.hsnCode || '9018.1200',
    minStock: 2,
    allocationCity: authStore.userBranch || 'Lahore',
    allocationCities: [authStore.userBranch || 'Lahore']
  }

  if (!dataStore.products) dataStore.products = []
  dataStore.products.push(item)
  selectedItem.value = item
  showAddModal.value = false
  uiStore.showToast(`Item "${item.name}" registered successfully`, 'success')
}

function handleStockTransfer() {
  const res = dataStore.transferBranchStock(
    transferForm.value.sku,
    transferForm.value.fromBranch,
    transferForm.value.toBranch,
    transferForm.value.qty,
    authStore.user?.username || 'Superadmin'
  )
  if (res.success) {
    uiStore.showToast(`Transferred ${transferForm.value.qty} units of ${transferForm.value.sku} to ${transferForm.value.toBranch}`, 'success')
    showTransferModal.value = false
  } else {
    uiStore.showModal('Transfer Notice', res.message, 'info')
    showTransferModal.value = false
  }
}

const productFileInputRef = ref(null)
const uploadedFileName = ref('')
const parsedImportProducts = ref([])

function triggerProductFilePicker() {
  if (productFileInputRef.value) {
    productFileInputRef.value.click()
  }
}

function parseCSVContent(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const items = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    if (cols[0]) {
      items.push({
        id: `prd_imp_${Date.now()}_${i}`,
        name: cols[0],
        sku: cols[1] || `SKU-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
        category: cols[2] || 'Medical Equipment',
        costPrice: Number(cols[3]) || 50000,
        sellingPrice: Number(cols[4]) || 80000,
        stockQty: Number(cols[5]) || 10,
        allocationCity: authStore.isSuperAdmin ? 'Peshawar, Lahore, Multan' : (authStore.userBranch || 'Lahore'),
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
      })
    }
  }
  return items
}

function handleProductFileUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadedFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result
    if (typeof content === 'string') {
      parsedImportProducts.value = parseCSVContent(content)
      uiStore.showToast(`Loaded ${file.name} with ${parsedImportProducts.value.length} items. Click 'Import Data' to apply!`, 'info')
    }
  }
  reader.readAsText(file)
}

function handleProductFileDrop(e) {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  uploadedFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result
    if (typeof content === 'string') {
      parsedImportProducts.value = parseCSVContent(content)
      uiStore.showToast(`Loaded ${file.name} with ${parsedImportProducts.value.length} items. Click 'Import Data' to apply!`, 'info')
    }
  }
  reader.readAsText(file)
}

function confirmFileImport() {
  if (parsedImportProducts.value.length > 0) {
    parsedImportProducts.value.forEach(p => {
      if (!dataStore.products.some(x => x.sku === p.sku)) {
        dataStore.products.unshift(p)
      }
    })
    selectedItem.value = parsedImportProducts.value[0]
    uiStore.showToast(`Successfully imported ${parsedImportProducts.value.length} products into catalog!`, 'success')
    showFileImportModal.value = false
    uploadedFileName.value = ''
    parsedImportProducts.value = []
  } else {
    handleSampleProductImport()
  }
}

function handleSampleProductImport() {
  const sampleProducts = [
    {
      id: `prd_smp_${Date.now()}_1`,
      name: '4D Color Doppler Echocardiography System',
      category: 'Ultrasound Machines',
      sku: 'ECHO-4D-900',
      costPrice: 2800000,
      sellingPrice: 3850000,
      stockQty: 5,
      minStock: 2,
      allocationCity: 'Peshawar, Lahore, Multan',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: `prd_smp_${Date.now()}_2`,
      name: 'Holmium Laser Surgical Lithotripsy Unit',
      category: 'Laser Systems',
      sku: 'LSR-HOLM-50W',
      costPrice: 3200000,
      sellingPrice: 4500000,
      stockQty: 3,
      minStock: 1,
      allocationCity: 'Lahore, Karachi',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: `prd_smp_${Date.now()}_3`,
      name: 'Automatic Defibrillator AED Plus System',
      category: 'Cardiology Equipment',
      sku: 'AED-PLUS-01',
      costPrice: 240000,
      sellingPrice: 350000,
      stockQty: 18,
      minStock: 4,
      allocationCity: 'Peshawar, Multan, Lahore',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: `prd_smp_${Date.now()}_4`,
      name: 'Infant Incubator Microprocessor Dual Wall',
      category: 'Neonatal Care Equipment',
      sku: 'INC-DW-800',
      costPrice: 420000,
      sellingPrice: 590000,
      stockQty: 12,
      minStock: 3,
      allocationCity: 'Multan, Lahore',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: `prd_smp_${Date.now()}_5`,
      name: 'Electric Orthopedic Operating Table',
      category: 'Surgical Equipment',
      sku: 'OT-ORTHO-01',
      costPrice: 650000,
      sellingPrice: 920000,
      stockQty: 8,
      minStock: 2,
      allocationCity: 'Peshawar, Lahore',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=300&q=80'
    }
  ]

  sampleProducts.forEach(p => {
    if (!dataStore.products.some(x => x.sku === p.sku)) {
      dataStore.products.unshift(p)
    }
  })

  selectedItem.value = sampleProducts[0]
  uiStore.showToast('Successfully imported 5 sample medical equipment products into catalog!', 'success')
  showFileImportModal.value = false
  uploadedFileName.value = ''
  parsedImportProducts.value = []
}

function triggerExportProducts(format) {
  uiStore.showToast(`Exporting inventory in ${format.toUpperCase()} format...`, 'info')
}

// Lifecycle
onMounted(() => {
  if (filteredItemList.value.length > 0) {
    selectedItem.value = filteredItemList.value[0]
  }
})

watch(filteredItemList, (list) => {
  if (list.length > 0 && (!selectedItem.value || !list.some(i => i.sku === selectedItem.value.sku))) {
    selectedItem.value = list[0]
  }
})
</script>

<style scoped>
.vyapar-items-view {
  font-family: inherit;
}

.vyapar-sub-header {
  padding: 0.65rem 1.25rem !important;
}

.item-row-entry {
  padding: 0.85rem 1.15rem !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

[data-theme="dark"] .item-row-entry {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.filter-popover {
  background-color: #ffffff !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2) !important;
  z-index: 999 !important;
}

[data-theme="dark"] .filter-popover {
  background-color: #1e2530 !important;
  border-color: #334155 !important;
}
</style>
