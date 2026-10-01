<template>
  <div class="vyapar-parties-view flex flex-col h-[calc(100vh-64px)] overflow-hidden">
    <!-- Sub-header Bar (Vyapar style NAME / PARTIES bar) -->
    <div class="vyapar-sub-header flex items-center justify-between px-4 py-1.5 bg-[#e0f2fe] dark:bg-slate-800 border-b border-sky-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 font-bold text-xs tracking-wider uppercase">
      <div class="flex items-center gap-2">
        <Users :size="14" class="text-sky-600 dark:text-sky-400" />
        <span>PARTIES DIRECTORY & LEDGERS</span>
      </div>
      <div class="text-center font-extrabold text-sky-900 dark:text-sky-200 tracking-widest text-[11px]">
        NAME
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-normal text-slate-500 dark:text-slate-400">TOTAL PARTIES: {{ filteredPartiesList.length }}</span>
      </div>
    </div>

    <!-- Main 2-Column Split Workspace -->
    <div class="flex-1 flex overflow-hidden bg-[#f1f5f9] dark:bg-[#0f172a]">
      
      <!-- ── LEFT COLUMN: Party Directory & Filters ────────────────── -->
      <div
        class="party-left-pane w-80 xl:w-96 flex flex-col bg-white dark:bg-[#1e2530] border-r border-slate-200 dark:border-slate-700/80 shrink-0 h-full"
        :class="{ 'mobile-view-hidden': showMobilePartyDetail }"
      >
        
        <!-- 1. Import Parties Banner Card (Vyapar pink badge style) -->
        <div class="p-3 border-b border-slate-100 dark:border-slate-800">
          <div
            @click="showImportModal = true"
            class="import-parties-card group flex items-center gap-3 p-2.5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 border border-rose-200/70 dark:border-rose-900/40 rounded-lg cursor-pointer hover:shadow-sm hover:border-rose-300 transition-all"
            title="Click to import parties from Phone, CSV, or Gmail contacts"
          >
            <div class="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone :size="20" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-between">
                <span>Import Parties</span>
                <ChevronRight :size="14" class="text-sky-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Use contacts from your Phone or Gmail to create parties.
              </p>
            </div>
          </div>
        </div>

        <!-- 2. Search & Add Party Action Row -->
        <div class="p-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800">
          <!-- Search input -->
          <div class="relative flex-1">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" :size="14" />
            <input
              v-model="partySearchQuery"
              type="text"
              placeholder="Search Party Name..."
              class="w-full pl-8 pr-2.5 py-1.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <!-- + Add Party Button (Orange/Amber Vyapar style with split dropdown) -->
          <div class="relative">
            <button
              @click="openAddPartyModal"
              class="vyapar-btn-add-party flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-md shadow-sm active:scale-95 transition-all whitespace-nowrap"
              title="Create new Customer or Vendor Party"
            >
              <Plus :size="14" />
              <span>Add Party</span>
              <ChevronDown :size="12" class="opacity-80" />
            </button>
          </div>
        </div>

        <!-- 3. List Header with Red Funnel Filter Popover -->
        <div class="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider relative select-none">
          <div class="flex items-center gap-2">
            <span class="cursor-pointer" @click="showFilterPopover = !showFilterPopover">PARTY</span>
            <!-- Red Funnel Filter Icon -->
            <button
              type="button"
              @click="showFilterPopover = !showFilterPopover"
              class="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              :class="{ 'text-rose-500': activePartyFilter !== 'ALL' }"
              title="Filter by To Receive / To Pay"
            >
              <Filter :size="13" class="text-rose-500 fill-rose-500" />
            </button>
          </div>
          
          <div class="flex items-center gap-2">
            <span>AMOUNT</span>
          </div>

          <!-- Filter Popover (Vyapar style modal dropdown) -->
          <div
            v-if="showFilterPopover"
            class="filter-popover absolute left-2 top-8 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 w-48 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
          >
            <div class="space-y-1.5 text-xs text-slate-700 dark:text-slate-200 font-semibold">
              <label class="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                <input type="radio" name="partyFilter" value="ALL" v-model="activePartyFilter" class="accent-teal-600" />
                <span>ALL</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                <input type="radio" name="partyFilter" value="RECEIVE" v-model="activePartyFilter" class="accent-teal-600" />
                <span>TO RECEIVE</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                <input type="radio" name="partyFilter" value="PAY" v-model="activePartyFilter" class="accent-teal-600" />
                <span>TO PAY</span>
              </label>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                @click="activePartyFilter = 'ALL'; showFilterPopover = false"
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

        <!-- 4. Party List Scrollable Items -->
        <div class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          <div
            v-for="party in filteredPartiesList"
            :key="party.name"
            @click="selectParty(party.name)"
            class="party-row-item px-3.5 py-3 flex items-center justify-between cursor-pointer transition-colors group relative"
            :class="[
              selectedCustomerName === party.name
                ? 'bg-teal-50/80 dark:bg-teal-950/30 border-l-4 border-teal-600'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'
            ]"
          >
            <!-- Party Left Info -->
            <div class="flex-1 min-w-0 pr-2">
              <div class="font-bold text-xs text-slate-800 dark:text-slate-100 truncate uppercase" :title="party.name">
                {{ party.name }}
              </div>
              <div class="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {{ party.phone || party.branch || 'General Party' }}
              </div>
            </div>

            <!-- Party Right Balance & Action -->
            <div class="flex items-center gap-2 shrink-0 text-right relative">
              <div
                class="font-mono font-bold text-xs"
                :class="party.balance > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-500'"
                :style="{ color: party.balance > 0 ? '#10b981 !important' : '#ef4444 !important', fontWeight: '800 !important' }"
              >
                {{ formatVyaparBalance(party.balance) }}
              </div>

              <!-- 3 Dots Options Menu Button & Popover -->
              <div class="relative">
                <button
                  type="button"
                  @click.stop="togglePartyActionMenu(party)"
                  class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded opacity-70 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  title="Party Actions"
                >
                  <MoreVertical :size="14" />
                </button>

                <div
                  v-if="activeActionPartyName === party.name"
                  class="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 text-left text-xs"
                  @click.stop
                >
                  <button
                    type="button"
                    @click="selectCustomer(party); activeActionPartyName = null"
                    class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <Eye :size="13" class="text-teal-500" />
                    <span>View Ledger</span>
                  </button>
                  <button
                    type="button"
                    @click="openEditPartyModal(party); activeActionPartyName = null"
                    class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <Edit3 :size="13" class="text-amber-500" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    @click="confirmDeleteParty(party); activeActionPartyName = null"
                    class="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-700/60"
                  >
                    <Trash2 :size="13" class="text-red-500" />
                    <span>Delete Party</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty Search State -->
          <div v-if="filteredPartiesList.length === 0" class="p-8 text-center text-xs text-slate-400">
            No parties found matching "{{ partySearchQuery }}".
          </div>
        </div>

      </div>

      <!-- ── RIGHT COLUMN: Selected Party Details & Transactions Pane ──────── -->
      <div
        class="party-right-pane flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50 dark:bg-[#111827]"
        :class="{ 'mobile-view-hidden': !showMobilePartyDetail }"
      >
        
        <div v-if="selectedPartySummary" class="flex-1 flex flex-col overflow-hidden">
          
          <!-- Top Party Header Card (Vyapar Profile Bar) -->
          <div class="bg-white dark:bg-[#1e2530] border-b border-slate-200 dark:border-slate-800 p-4 lg:p-5 shrink-0 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <!-- Left: Name & Contact Details -->
              <div class="space-y-1.5 flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    @click="showMobilePartyDetail = false"
                    class="mobile-back-btn px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1"
                  >
                    <span>← Parties</span>
                  </button>
                  <h2 class="text-lg lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                    {{ selectedPartySummary.name }}
                  </h2>
                  <span :class="['badge font-mono font-extrabold text-[10px] py-0.5 px-2 rounded', customerCategoryBadgeClass]">
                    Tier {{ customerCreditStatus.categoryCode }}
                  </span>
                  <span
                    v-if="customerCreditStatus.isLocked"
                    class="badge badge-danger font-mono font-bold text-[10px] py-0.5 px-2 rounded animate-pulse"
                  >
                    CREDIT LOCKED
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span v-if="selectedPartySummary.phone">
                    <strong class="text-slate-700 dark:text-slate-300">Phone:</strong> {{ selectedPartySummary.phone }}
                  </span>
                  <span v-else class="text-slate-400 italic">Phone: —</span>

                  <span v-if="selectedPartySummary.email">
                    <strong class="text-slate-700 dark:text-slate-300">Email:</strong> {{ selectedPartySummary.email }}
                  </span>

                  <span v-if="selectedPartySummary.address">
                    <strong class="text-slate-700 dark:text-slate-300">Address:</strong> {{ selectedPartySummary.address }}
                  </span>

                  <span v-if="customerCreditStatus.limit > 0">
                    <strong class="text-slate-700 dark:text-slate-300">Credit Limit:</strong> {{ formatBalance(customerCreditStatus.limit) }}
                  </span>
                  <span v-else class="text-slate-400">
                    No Credit Limit Set
                  </span>
                </div>
              </div>

              <!-- Right: Quick Action Buttons -->
              <div class="flex items-center gap-2 flex-wrap shrink-0">
                <!-- Privacy Balance Toggle -->
                <button
                  @click="handleBalanceToggle"
                  class="btn btn-sm btn-ghost border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5"
                  :title="authStore.isBalanceVisible ? 'Hide Balances' : 'Show Balances'"
                >
                  <EyeOff v-if="authStore.isBalanceVisible" :size="14" />
                  <Eye v-else :size="14" />
                  <span>{{ authStore.isBalanceVisible ? 'Hide' : 'Show' }}</span>
                </button>

                <!-- Edit Party Profile -->
                <button
                  @click="openEditPartyModal(selectedPartySummary)"
                  class="btn btn-sm bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  title="Edit party profile details"
                >
                  <Edit3 :size="13" />
                  <span>Edit Profile</span>
                </button>

                <!-- Delete Party -->
                <button
                  @click="confirmDeleteParty(selectedPartySummary)"
                  class="btn btn-sm bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white font-bold text-xs flex items-center gap-1 border border-red-500/30 transition-all"
                  title="Delete party profile"
                >
                  <Trash2 :size="13" />
                </button>

                <!-- Send Reminder -->
                <button
                  @click="openReminderModal"
                  class="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  title="Send payment reminder notice"
                >
                  <Send :size="13" />
                  <span>Reminder</span>
                </button>

                <!-- Override Limit -->
                <button
                  @click="openOverrideModal"
                  class="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  title="Executive credit limit override"
                >
                  <ShieldAlert :size="13" />
                  <span>Override</span>
                </button>

                <!-- + Add Payment In -->
                <router-link
                  :to="`/payments?customer=${encodeURIComponent(selectedCustomerName)}`"
                  class="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Receipt :size="13" />
                  <span>+ Payment In</span>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Section Switcher Bar (Transactions vs Credit Governance vs Machines Breakdown) -->
          <div class="px-4 py-2 bg-white dark:bg-[#1e2530] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
            <div class="flex items-center gap-1.5">
              <button
                @click="activeViewTab = 'transactions'"
                :class="[
                  'px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                  activeViewTab === 'transactions'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                ]"
              >
                <FileText :size="14" />
                <span>TRANSACTIONS ({{ partyTransactions.length }})</span>
              </button>

              <button
                @click="activeViewTab = 'governance'"
                :class="[
                  'px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                  activeViewTab === 'governance'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                ]"
              >
                <ShieldCheck :size="14" />
                <span>Credit Governance</span>
              </button>

              <button
                @click="activeViewTab = 'machines'"
                :class="[
                  'px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap',
                  activeViewTab === 'machines'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                ]"
              >
                <Package :size="14" />
                <span>Machines & Equipment ({{ (ledger?.paidMachines?.length || 0) + (ledger?.pendingMachines?.length || 0) }})</span>
              </button>
            </div>

            <!-- Transaction Search Input -->
            <div v-if="activeViewTab === 'transactions'" class="relative w-48 sm:w-64">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" :size="13" />
              <input
                v-model="transactionSearchQuery"
                type="text"
                placeholder="Search in transactions..."
                class="w-full pl-8 pr-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <!-- Tab Content Area (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            
            <!-- ── SUB-TAB 1: Vyapar TRANSACTIONS Table ──────────────────────── -->
            <div v-if="activeViewTab === 'transactions'" class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[11px] select-none">
                      <th class="py-2.5 px-3 w-8"></th>
                      <th class="py-2.5 px-3 relative">
                        <div class="flex items-center gap-1 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400" @click="showTypeFilterDropdown = !showTypeFilterDropdown">
                          <span>TYPE</span>
                          <span v-if="txTypeFilter !== 'ALL'" class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                          <Filter :size="11" :class="txTypeFilter !== 'ALL' ? 'text-teal-500 opacity-100' : 'opacity-60'" />
                          <ArrowUp v-if="txSortKey === 'type' && txSortOrder === 'asc'" :size="11" class="text-teal-500" />
                          <ArrowDown v-if="txSortKey === 'type' && txSortOrder === 'desc'" :size="11" class="text-teal-500" />
                        </div>

                        <!-- Backdrop for Outside Click -->
                        <div v-if="showTypeFilterDropdown" class="fixed inset-0" style="z-index: 999;" @click="showTypeFilterDropdown = false"></div>

                        <!-- Dropdown for Type Filter -->
                        <div
                          v-if="showTypeFilterDropdown"
                          class="absolute left-0 top-full mt-1 border border-slate-700 rounded-lg p-2 min-w-[160px] space-y-1 text-xs"
                          style="background-color: #0b1329 !important; z-index: 1000; box-shadow: 0 20px 40px rgba(0,0,0,0.95); opacity: 1 !important;"
                        >
                          <div class="font-bold text-[10px] text-slate-400 uppercase px-2 py-0.5">Filter by Type</div>
                          <button @click="setTxTypeFilter('ALL')" :class="['w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between', txTypeFilter === 'ALL' ? 'bg-teal-950/80 text-teal-400 font-bold' : 'hover:bg-slate-800 text-slate-200']">
                            <span>All Types</span>
                            <Check v-if="txTypeFilter === 'ALL'" :size="12" />
                          </button>
                          <button @click="setTxTypeFilter('SALE')" :class="['w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between', txTypeFilter === 'SALE' ? 'bg-teal-950/80 text-teal-400 font-bold' : 'hover:bg-slate-800 text-slate-200']">
                            <span>Sale Invoices</span>
                            <Check v-if="txTypeFilter === 'SALE'" :size="12" />
                          </button>
                          <button @click="setTxTypeFilter('PAYMENT')" :class="['w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between', txTypeFilter === 'PAYMENT' ? 'bg-teal-950/80 text-teal-400 font-bold' : 'hover:bg-slate-800 text-slate-200']">
                            <span>Payments In</span>
                            <Check v-if="txTypeFilter === 'PAYMENT'" :size="12" />
                          </button>
                          <button @click="setTxTypeFilter('PURCHASE')" :class="['w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between', txTypeFilter === 'PURCHASE' ? 'bg-teal-950/80 text-teal-400 font-bold' : 'hover:bg-slate-800 text-slate-200']">
                            <span>Outflow / Purchase</span>
                            <Check v-if="txTypeFilter === 'PURCHASE'" :size="12" />
                          </button>
                          <button @click="setTxTypeFilter('RETURN')" :class="['w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between', txTypeFilter === 'RETURN' ? 'bg-teal-950/80 text-teal-400 font-bold' : 'hover:bg-slate-800 text-slate-200']">
                            <span>Sale Returns</span>
                            <Check v-if="txTypeFilter === 'RETURN'" :size="12" />
                          </button>
                          <div class="border-t border-slate-800 pt-1 mt-1">
                            <button @click="toggleTxSort('type'); showTypeFilterDropdown = false" class="w-full text-left px-2.5 py-1 rounded text-[11px] text-slate-400 hover:text-teal-400 flex items-center gap-1">
                              <span>Sort A-Z / Z-A</span>
                            </button>
                          </div>
                        </div>
                      </th>
                      <th class="py-2.5 px-3">
                        <div class="flex items-center gap-1 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400" @click="toggleTxSort('number')">
                          <span>NUMBER</span>
                          <ArrowUp v-if="txSortKey === 'number' && txSortOrder === 'asc'" :size="11" class="text-teal-500" />
                          <ArrowDown v-if="txSortKey === 'number' && txSortOrder === 'desc'" :size="11" class="text-teal-500" />
                          <Filter :size="11" class="opacity-60" />
                        </div>
                      </th>
                      <th class="py-2.5 px-3">
                        <div class="flex items-center gap-1 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400" @click="toggleTxSort('date')">
                          <span>DATE</span>
                          <ArrowUp v-if="txSortKey === 'date' && txSortOrder === 'asc'" :size="11" class="text-teal-600" />
                          <ArrowDown v-else-if="txSortKey === 'date' && txSortOrder === 'desc'" :size="11" class="text-teal-600" />
                          <Filter :size="11" class="opacity-60" />
                        </div>
                      </th>
                      <th class="py-2.5 px-3 text-right">
                        <div class="flex items-center justify-end gap-1 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400" @click="toggleTxSort('total')">
                          <span>TOTAL</span>
                          <ArrowUp v-if="txSortKey === 'total' && txSortOrder === 'asc'" :size="11" class="text-teal-500" />
                          <ArrowDown v-if="txSortKey === 'total' && txSortOrder === 'desc'" :size="11" class="text-teal-500" />
                          <Filter :size="11" class="opacity-60" />
                        </div>
                      </th>
                      <th class="py-2.5 px-3 text-right">
                        <div class="flex items-center justify-end gap-1 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400" @click="toggleTxSort('balance')">
                          <span>BALANCE</span>
                          <ArrowUp v-if="txSortKey === 'balance' && txSortOrder === 'asc'" :size="11" class="text-teal-500" />
                          <ArrowDown v-if="txSortKey === 'balance' && txSortOrder === 'desc'" :size="11" class="text-teal-500" />
                          <Filter :size="11" class="opacity-60" />
                        </div>
                      </th>
                      <th class="py-2.5 px-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    <tr
                      v-for="tx in filteredPartyTransactions"
                      :key="tx.id"
                      class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <!-- Status Dot -->
                      <td class="py-3 px-3 text-center">
                        <span
                          class="inline-block w-2.5 h-2.5 rounded-full"
                          :class="[
                            tx.typeCategory === 'PAYMENT'
                              ? 'bg-amber-500'
                              : tx.typeCategory === 'SALE'
                              ? 'bg-emerald-500'
                              : tx.typeCategory === 'PURCHASE'
                              ? 'bg-rose-500'
                              : 'bg-teal-500'
                          ]"
                        ></span>
                      </td>

                      <!-- Type -->
                      <td class="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {{ tx.type }}
                      </td>

                      <!-- Number -->
                      <td class="py-3 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {{ tx.number || '—' }}
                      </td>

                      <!-- Date -->
                      <td class="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                        {{ tx.date }}
                      </td>

                      <!-- Total -->
                      <td class="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                        {{ formatVyaparBalance(tx.total, 'Rs ') }}
                      </td>

                      <!-- Balance -->
                      <td class="py-3 px-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {{ tx.balance !== undefined ? formatVyaparBalance(tx.balance, 'Rs ') : '—' }}
                      </td>

                      <!-- Actions 3 dots -->
                      <td class="py-3 px-3 text-center">
                        <button
                          type="button"
                          @click="viewTransactionDetails(tx)"
                          class="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <MoreVertical :size="14" />
                        </button>
                      </td>
                    </tr>

                    <!-- Empty State -->
                    <tr v-if="filteredPartyTransactions.length === 0">
                      <td colspan="7" class="py-12 text-center text-slate-400 italic">
                        No transactions recorded for this party.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ── SUB-TAB 2: Credit Governance & Limit Policy ──────────────── -->
            <div v-if="activeViewTab === 'governance'" class="space-y-4">
              <!-- Credit Governance Card -->
              <div
                class="credit-gov-card relative overflow-hidden rounded-xl border p-5 shadow-lg space-y-4 transition-all"
                :class="[
                  customerCreditStatus.isLocked
                    ? 'bg-gradient-to-br from-red-950/40 via-slate-900/90 to-red-950/20 border-red-500/40'
                    : customerCreditStatus.statusType === 'critical'
                    ? 'bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-amber-950/20 border-amber-500/40'
                    : 'bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-slate-900/80 border-emerald-500/30'
                ]"
              >
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                      <ShieldCheck :size="20" />
                    </div>
                    <div>
                      <h4 class="font-bold text-white text-base">Credit Policy & Governance</h4>
                      <p class="text-xs text-slate-400">Tier {{ customerCreditStatus.categoryCode }} • Net {{ customerData?.allowedDays || 30 }} Days</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      @click="toggleLock"
                      :class="[
                        'btn btn-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-white shadow-sm',
                        customerCreditStatus.isLocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                      ]"
                    >
                      <Unlock v-if="customerCreditStatus.isLocked" :size="12" />
                      <Lock v-else :size="12" />
                      <span>{{ customerCreditStatus.isLocked ? 'Unlock Credit' : 'Lock Account' }}</span>
                    </button>
                    <button
                      @click="openOverrideModal"
                      class="btn btn-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <ShieldAlert :size="12" />
                      <span>Override Limit</span>
                    </button>
                  </div>
                </div>

                <!-- 4 Metrics -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                    <span class="text-[10px] font-bold uppercase text-slate-400">Total Credit Limit</span>
                    <div class="text-lg font-black font-mono text-white mt-0.5">{{ formatBalance(customerCreditStatus.limit) }}</div>
                  </div>
                  <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                    <span class="text-[10px] font-bold uppercase text-slate-400">Current Outstanding</span>
                    <div class="text-lg font-black font-mono text-amber-400 mt-0.5">{{ formatBalance(customerCreditStatus.balance) }}</div>
                  </div>
                  <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                    <span class="text-[10px] font-bold uppercase text-slate-400">Available Headroom</span>
                    <div class="text-lg font-black font-mono text-emerald-400 mt-0.5">{{ formatBalance(customerCreditStatus.remainingCredit) }}</div>
                  </div>
                  <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                    <span class="text-[10px] font-bold uppercase text-slate-400">Aging Policy</span>
                    <div class="text-lg font-black font-mono text-slate-200 mt-0.5">
                      {{ customerCreditStatus.overdueDays > 0 ? `${customerCreditStatus.overdueDays}d Overdue` : 'Current' }}
                    </div>
                  </div>
                </div>

                <!-- Progress Gauge -->
                <div class="space-y-1.5">
                  <div class="flex justify-between text-xs text-slate-300 font-mono">
                    <span>Credit Exposure</span>
                    <strong>{{ customerCreditStatus.percentage }}% Utilized</strong>
                  </div>
                  <div class="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="[
                        customerCreditStatus.percentage >= 90 ? 'bg-red-500' : customerCreditStatus.percentage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      ]"
                      :style="{ width: `${Math.min(100, Math.max(3, customerCreditStatus.percentage))}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── SUB-TAB 3: Machines & Equipment Breakdown ────────────────── -->
            <div v-if="activeViewTab === 'machines'" class="space-y-4">
              <!-- Paid Machines -->
              <div class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                    <CheckCircle2 :size="16" />
                    <span>Paid & Cleared Equipment ({{ ledger?.paidMachines?.length || 0 }})</span>
                  </h4>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th class="p-2">Machine Code</th>
                        <th class="p-2">Serial Number</th>
                        <th class="p-2">Equipment Name</th>
                        <th class="p-2 text-right">Paid Amount</th>
                        <th class="p-2">Receipt Ref</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      <tr v-for="m in (ledger?.paidMachines || [])" :key="m.serialCode">
                        <td class="p-2 font-mono font-bold text-purple-600 dark:text-purple-400">{{ m.machineCode }}</td>
                        <td class="p-2 font-mono text-teal-600 dark:text-teal-400 font-bold">{{ (m.serialCode || '').replace(/^SN-/i, '') }}</td>
                        <td class="p-2 font-semibold text-slate-800 dark:text-slate-100">{{ m.productName || m.sku }}</td>
                        <td class="p-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ formatBalance(m.paymentAmount || m.salePrice) }}</td>
                        <td class="p-2 font-mono text-slate-500">{{ m.paymentReceiptNo || 'PAID' }}</td>
                      </tr>
                      <tr v-if="!ledger?.paidMachines?.length">
                        <td colspan="5" class="p-4 text-center text-slate-400 italic">No cleared machines recorded.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Unpaid Machines -->
              <div class="bg-white dark:bg-[#1e2530] border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
                    <Clock :size="16" />
                    <span>Unpaid Due Equipment ({{ ledger?.pendingMachines?.length || 0 }})</span>
                  </h4>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th class="p-2">Machine Code</th>
                        <th class="p-2">Serial Number</th>
                        <th class="p-2">Equipment Name</th>
                        <th class="p-2 text-right">Due Amount</th>
                        <th class="p-2">Invoice #</th>
                        <th class="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      <tr v-for="m in (ledger?.pendingMachines || [])" :key="m.serialCode">
                        <td class="p-2 font-mono font-bold text-purple-600 dark:text-purple-400">{{ m.machineCode }}</td>
                        <td class="p-2 font-mono text-teal-600 dark:text-teal-400 font-bold">{{ (m.serialCode || '').replace(/^SN-/i, '') }}</td>
                        <td class="p-2 font-semibold text-slate-800 dark:text-slate-100">{{ m.productName || m.sku }}</td>
                        <td class="p-2 text-right font-mono font-bold text-rose-600 dark:text-rose-400">{{ formatBalance(m.salePrice) }}</td>
                        <td class="p-2 font-mono text-sky-600 dark:text-sky-400 font-bold">{{ m.invoiceNo }}</td>
                        <td class="p-2">
                          <router-link
                            :to="`/payments?customer=${encodeURIComponent(selectedCustomerName)}`"
                            class="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <span>Pay Due</span>
                          </router-link>
                        </td>
                      </tr>
                      <tr v-if="!ledger?.pendingMachines?.length">
                        <td colspan="6" class="p-4 text-center text-emerald-600 font-bold italic">All machines are fully cleared!</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Empty Right Pane State -->
        <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <Users :size="48" class="mb-3 opacity-30 text-teal-500" />
          <h3 class="text-base font-bold text-slate-700 dark:text-slate-200">Select a Party to View Ledger</h3>
          <p class="text-xs text-slate-400 mt-1 max-w-sm">
            Choose a customer or vendor from the directory on the left to view profile details, transaction records, and credit limits.
          </p>
        </div>

      </div>

    </div>

    <!-- ── MODAL: Add New Party ────────────────────────────────────────────── -->
    <div v-if="showAddPartyModal" class="modal-backdrop" @click.self="showAddPartyModal = false">
      <div class="modal-content max-w-lg bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div class="modal-header p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UserPlus :size="18" class="text-orange-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Add New Party</h3>
          </div>
          <button @click="showAddPartyModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateParty" class="p-5 space-y-4 text-xs">
          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Party Name *</label>
            <input
              v-model="newPartyForm.name"
              type="text"
              required
              placeholder="e.g. HOSPITEX RAWALPINDI"
              class="form-input w-full p-2 border rounded font-semibold"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Party Type</label>
              <select v-model="newPartyForm.type" class="form-select w-full p-2 border rounded">
                <option value="Customer">Customer (Debtor)</option>
                <option value="Supplier">Supplier / Vendor (Creditor)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block flex items-center justify-between">
                <span>Branch / City</span>
                <span v-if="!authStore.isSuperAdmin" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  🔒 Locked
                </span>
              </label>

              <div
                v-if="!authStore.isSuperAdmin"
                class="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-white font-bold text-xs flex items-center justify-between select-none cursor-not-allowed"
                title="Branch locked to your assigned territory"
              >
                <span class="flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{{ authStore.userBranch || 'Lahore' }}</span>
                </span>
                <span class="badge badge-success text-[10px] py-0 px-1.5 font-mono">Assigned</span>
              </div>

              <select v-else v-model="newPartyForm.branch" class="form-select w-full p-2 border rounded">
                <option value="Lahore">Lahore</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Multan">Multan</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Karachi">Karachi</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Phone Number</label>
              <input v-model="newPartyForm.phone" type="text" placeholder="+92 300 1234567" class="form-input w-full p-2 border rounded font-mono" />
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Email</label>
              <input v-model="newPartyForm.email" type="email" placeholder="accounts@clinic.com" class="form-input w-full p-2 border rounded" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Credit Limit (PKR)</label>
              <input v-model.number="newPartyForm.baseCreditLimit" type="number" step="100000" class="form-input w-full p-2 border rounded font-mono" />
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Opening Balance (PKR)</label>
              <input v-model.number="newPartyForm.openingBalance" type="number" placeholder="0" class="form-input w-full p-2 border rounded font-mono" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Address / Notes</label>
            <textarea v-model="newPartyForm.address" rows="2" placeholder="Full clinic address..." class="form-textarea w-full p-2 border rounded"></textarea>
          </div>

          <div class="modal-footer pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button type="button" @click="showAddPartyModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded">
              Save Party
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── MODAL: Import Parties ─────────────────────────────────────────── -->
    <div v-if="showImportModal" class="modal-backdrop" @click.self="showImportModal = false">
      <div class="modal-content max-w-lg bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <Smartphone :size="20" class="text-rose-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Import Contacts & Parties</h3>
          </div>
          <button @click="showImportModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Import customer hospital and clinic lists directly from an Excel/CSV file or populate standard directory parties.
        </p>

        <!-- Hidden File Input -->
        <input
          type="file"
          ref="partyFileInputRef"
          accept=".csv, .xlsx, .xls, .txt"
          class="hidden"
          @change="handlePartyFileUpload"
        />

        <!-- Interactive Drag & Drop Box -->
        <div
          @click="triggerPartyFilePicker"
          @dragover.prevent
          @drop.prevent="handlePartyFileDrop"
          class="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 bg-slate-50/50 dark:bg-slate-900/40 transition-colors"
        >
          <div v-if="!uploadedPartyFileName">
            <UploadCloud :size="34" class="mx-auto text-teal-600 dark:text-teal-400 mb-2 animate-pulse" />
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Click to Browse or Drag & Drop CSV / Excel File</span>
            <span class="text-[10px] text-slate-400 block mt-1">Columns: Name, Phone, Email, Address, Branch, CreditLimit, Category, Balance</span>
          </div>

          <div v-else class="space-y-2">
            <div class="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 :size="16" />
              <span>{{ uploadedPartyFileName }}</span>
            </div>
            <span class="badge badge-success text-[10px] font-mono">
              {{ parsedImportParties.length }} Parties Detected Ready for Import
            </span>
          </div>
        </div>

        <!-- Parsed Preview Table if File Loaded -->
        <div v-if="parsedImportParties.length > 0" class="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
          <table class="w-full text-[11px] text-left">
            <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold sticky top-0">
              <tr>
                <th class="p-2">Name</th>
                <th class="p-2">Phone</th>
                <th class="p-2">Branch</th>
                <th class="p-2 text-right">Credit Limit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              <tr v-for="(p, idx) in parsedImportParties.slice(0, 5)" :key="idx" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="p-2 font-bold">{{ p.name }}</td>
                <td class="p-2 font-mono text-[10px] text-slate-400">{{ p.phone || 'N/A' }}</td>
                <td class="p-2">{{ p.branch || 'Karachi' }}</td>
                <td class="p-2 text-right font-mono text-emerald-600 dark:text-emerald-400">PKR {{ Number(p.baseCreditLimit || 0).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Template Download Link -->
        <div class="flex items-center justify-between pt-1 text-xs">
          <button
            type="button"
            @click="downloadSamplePartyTemplate"
            class="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
          >
            <Download :size="13" />
            <span>Download Sample CSV Template</span>
          </button>
          <span v-if="parsedImportParties.length > 5" class="text-[10px] text-slate-400">
            + {{ parsedImportParties.length - 5 }} more parties
          </span>
        </div>

        <div class="flex justify-between items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button @click="showImportModal = false" class="btn btn-secondary px-3 py-1.5 text-xs">Close</button>
          <div class="flex items-center gap-2">
            <button
              v-if="parsedImportParties.length > 0"
              @click="confirmPartyImport"
              class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 text-xs rounded shadow-sm flex items-center gap-1.5"
            >
              <Check :size="14" />
              <span>Import {{ parsedImportParties.length }} Parties</span>
            </button>
            <button
              type="button"
              @click="handleSampleImport"
              class="btn bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 text-xs rounded shadow-sm flex items-center gap-1.5"
            >
              <Users :size="13" />
              <span>Load Sample Contacts</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL: Credit Limit Override ─────────────────────────────────── -->
    <div v-if="showOverrideModal" class="modal-backdrop" @click.self="showOverrideModal = false">
      <div class="modal-content max-w-lg bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <ShieldAlert :size="20" class="text-purple-400" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Management Credit Override</h3>
          </div>
          <button @click="showOverrideModal = false" class="text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleSaveOverride" class="space-y-4 text-xs">
          <div class="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-purple-700 dark:text-purple-200">
            Authorizing executive credit limit override for <strong>{{ selectedCustomerName }}</strong>.
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Additional Credit Headroom (PKR) *</label>
            <input
              v-model.number="overrideForm.additionalLimit"
              type="number"
              step="50000"
              min="10000"
              required
              class="form-input w-full p-2 border rounded font-mono font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Authorization Reason *</label>
            <select v-model="overrideForm.reason" class="form-select w-full p-2 border rounded font-bold">
              <option value="Executive Director Discretion">Executive Director Discretion</option>
              <option value="Urgent Government Hospital Order">Urgent Government Hospital Order</option>
              <option value="Verified Promissory Note Received">Verified Promissory Note Received</option>
              <option value="High-Volume Repeat Client">High-Volume Repeat Client</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Executive Remarks</label>
            <textarea
              v-model="overrideForm.remarks"
              rows="2"
              placeholder="Enter management justification and terms..."
              class="form-textarea w-full p-2 border rounded"
            ></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="showOverrideModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded">
              Confirm & Unlock Headroom
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── MODAL: Payment Reminder Notice ───────────────────────────────── -->
    <div v-if="showReminderModal" class="modal-backdrop" @click.self="showReminderModal = false">
      <div class="modal-content max-w-lg bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <Send :size="18" class="text-amber-500" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Send Payment Notice / Reminder</h3>
          </div>
          <button @click="showReminderModal = false" class="text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleSendReminder" class="space-y-4 text-xs">
          <div class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200">
            Dispatching payment reminder to <strong>{{ selectedCustomerName }}</strong> for balance of <strong>{{ formatBalance(customerCreditStatus.balance) }}</strong>.
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Notification Channel</label>
              <select v-model="reminderForm.channel" class="form-select w-full p-2 border rounded font-bold">
                <option value="WhatsApp">WhatsApp Business API</option>
                <option value="SMS">Direct GSM SMS</option>
                <option value="Email">Official Corporate Email</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Recipient Contact</label>
              <input v-model="reminderForm.recipient" type="text" class="form-input w-full p-2 border rounded font-mono" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Notice Message Text</label>
            <textarea
              v-model="reminderForm.message"
              rows="4"
              class="form-textarea w-full p-2 border rounded font-mono text-[11px]"
            ></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button type="button" @click="showReminderModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded flex items-center gap-1.5">
              <Send :size="13" />
              <span>Dispatch Reminder</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── MODAL: Edit Customer Party Profile ────────────────────────── -->
    <div v-if="showEditPartyModal" class="modal-backdrop" @click.self="showEditPartyModal = false">
      <div class="modal-content max-w-lg bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-2">
            <Edit3 :size="18" class="text-amber-500" />
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Edit Customer Profile: {{ editPartyForm.name }}</h3>
          </div>
          <button @click="showEditPartyModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleSaveParty" class="overflow-y-auto space-y-4 text-xs pr-1 flex-1">
          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Party / Hospital Name *</label>
            <input v-model="editPartyForm.name" type="text" required class="form-input w-full p-2 border rounded font-bold" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Category Tier *</label>
              <select v-model="editPartyForm.category" class="form-select w-full p-2 border rounded font-bold">
                <option value="DIAMOND">DIAMOND (Tier A - PKR 10M Limit)</option>
                <option value="GOLD">GOLD (Tier B - PKR 5M Limit)</option>
                <option value="SILVER">SILVER (Tier C - PKR 3M Limit)</option>
                <option value="REGULAR">REGULAR (Tier D - PKR 2M Limit)</option>
                <option value="GOVERNMENT">GOVERNMENT (Tier G - Custom)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Branch *</label>
              <select v-model="editPartyForm.branch" class="form-select w-full p-2 border rounded font-bold">
                <option value="Karachi">Karachi</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Lahore">Lahore</option>
                <option value="Multan">Multan</option>
                <option value="Islamabad">Islamabad</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Credit Limit (PKR) *</label>
              <input v-model.number="editPartyForm.baseCreditLimit" type="number" min="0" required class="form-input w-full p-2 border rounded font-mono font-bold text-emerald-600 dark:text-emerald-400" />
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Payment Terms (Days)</label>
              <input v-model.number="editPartyForm.paymentDays" type="number" min="1" class="form-input w-full p-2 border rounded font-mono font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Phone / Mobile</label>
              <input v-model="editPartyForm.phone" type="text" class="form-input w-full p-2 border rounded font-mono" />
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Official Email</label>
              <input v-model="editPartyForm.email" type="email" class="form-input w-full p-2 border rounded" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Hospital / Delivery Address</label>
            <textarea v-model="editPartyForm.address" rows="2" class="form-textarea w-full p-2 border rounded"></textarea>
          </div>

          <div class="modal-footer pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 shrink-0">
            <button type="button" @click="showEditPartyModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded shadow-sm flex items-center gap-1.5">
              <Check :size="14" />
              <span>Save Party Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { exportXLSX, exportCSV } from '@/utils/reportExporter'
import {
  Users,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Filter,
  Smartphone,
  MoreVertical,
  Eye,
  EyeOff,
  Send,
  ShieldAlert,
  ShieldCheck,
  Receipt,
  FileText,
  Package,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Clock,
  Unlock,
  Lock,
  UserPlus,
  FileSpreadsheet,
  Edit3,
  Trash2,
  UploadCloud,
  Download,
  RefreshCw
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

// State
const activeActionPartyName = ref(null)

function togglePartyActionMenu(party) {
  activeActionPartyName.value = activeActionPartyName.value === party.name ? null : party.name
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', () => {
    activeActionPartyName.value = null
  })
}

const showEditPartyModal = ref(false)
const editPartyForm = ref({
  id: '',
  name: '',
  category: 'REGULAR',
  branch: 'Karachi',
  baseCreditLimit: 2000000,
  paymentDays: 30,
  phone: '',
  email: '',
  address: ''
})

function openEditPartyModal(party) {
  if (!party) return
  const fullParty = (dataStore.customers || []).find(c => c.name === party.name) || party
  editPartyForm.value = {
    id: fullParty.id || fullParty._id || fullParty.name,
    name: fullParty.name || '',
    category: fullParty.category || 'REGULAR',
    branch: fullParty.branch || 'Karachi',
    baseCreditLimit: Number(fullParty.baseCreditLimit || 2000000),
    paymentDays: Number(fullParty.paymentDays || 30),
    phone: fullParty.phone || '',
    email: fullParty.email || '',
    address: fullParty.address || ''
  }
  showEditPartyModal.value = true
}

async function handleSaveParty() {
  if (!editPartyForm.value.name.trim()) {
    uiStore.showModal('Validation Error', 'Party name is required.', 'warning')
    return
  }

  const updates = {
    name: editPartyForm.value.name.trim(),
    category: editPartyForm.value.category,
    branch: editPartyForm.value.branch,
    baseCreditLimit: Number(editPartyForm.value.baseCreditLimit || 0),
    paymentDays: Number(editPartyForm.value.paymentDays || 30),
    phone: editPartyForm.value.phone,
    email: editPartyForm.value.email,
    address: editPartyForm.value.address
  }

  const oldName = selectedCustomerName.value
  const targetId = editPartyForm.value.id || editPartyForm.value.name
  await dataStore.updateCustomer(targetId, updates, authStore.user)

  if (selectedCustomerName.value === oldName) {
    selectedCustomerName.value = updates.name
  }

  uiStore.showToast(`Party profile "${updates.name}" updated successfully!`, 'success')
  showEditPartyModal.value = false
  loadLedger()
}

function confirmDeleteParty(party) {
  if (!party) return
  uiStore.showConfirm({
    title: 'Delete Customer Account',
    message: `Are you sure you want to delete customer "${party.name}"? This action will remove the party and their credit profile from the system.`,
    type: 'danger',
    confirmText: 'Yes, Delete Party',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const targetId = party.id || party._id || party.name
      const success = await dataStore.deleteCustomer(targetId, authStore.user)

      if (success) {
        if (selectedCustomerName.value === party.name) {
          selectedCustomerName.value = filteredPartiesList.value.find(p => p.name !== party.name)?.name || ''
        }
        uiStore.showToast(`Customer "${party.name}" deleted from database.`, 'info')
        loadLedger()
      }
    }
  })
}

const selectedCustomerName = ref('')
const showMobilePartyDetail = ref(false)
const activePartyFilter = ref('ALL') // 'ALL' | 'RECEIVE' | 'PAY'
const showFilterPopover = ref(false)
const partySearchQuery = ref('')
const transactionSearchQuery = ref('')
const activeViewTab = ref('transactions') // 'transactions' | 'governance' | 'machines'
const ledger = ref(null)

const txSortKey = ref('date')
const txSortOrder = ref('desc')
const txTypeFilter = ref('ALL') // 'ALL' | 'SALE' | 'PAYMENT' | 'RETURN' | 'PURCHASE'
const showTypeFilterDropdown = ref(false)

function toggleTxSort(key) {
  if (txSortKey.value === key) {
    txSortOrder.value = txSortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    txSortKey.value = key
    txSortOrder.value = 'desc'
  }
}

function setTxTypeFilter(type) {
  txTypeFilter.value = type
  showTypeFilterDropdown.value = false
}

const showAddPartyModal = ref(false)
const showImportModal = ref(false)
const showOverrideModal = ref(false)
const showReminderModal = ref(false)

const newPartyForm = ref({
  name: '',
  type: 'Customer',
  branch: 'Lahore',
  phone: '',
  email: '',
  address: '',
  baseCreditLimit: 1000000,
  openingBalance: 0
})

const overrideForm = ref({
  additionalLimit: 250000,
  reason: 'Executive Director Discretion',
  remarks: 'Approved for urgent clinic installation.'
})

const reminderForm = ref({
  channel: 'WhatsApp',
  recipient: '+92 300 1234567',
  message: ''
})

// Privacy balance formatting
function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${Math.abs(Number(amount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${prefix}••••••`
}

function formatVyaparBalance(amount, prefix = '') {
  if (authStore.isBalanceVisible) {
    const val = Number(amount || 0)
    return `${prefix}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${prefix}••••••`
}

function handleBalanceToggle() {
  authStore.toggleBalance()
}

// ── Parties Directory Computation ───────────────────────────
const allPartiesList = computed(() => {
  const map = new Map()

  // 1. Pre-seeded or created customers
  ;(dataStore.customers || []).forEach(c => {
    if (!c.name) return
    const key = c.name.trim()
    const ledgerData = dataStore.getCustomerLedger(key)
    const balance = Number(ledgerData?.outstandingBalance ?? 0)
    map.set(key, {
      name: key,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      branch: c.branch || 'Lahore',
      type: 'Customer',
      balance: balance
    })
  })

  // 2. Extra parties from Sales Invoices
  ;(dataStore.salesInvoices || []).forEach(inv => {
    const name = (inv.customer || inv.customerName || '').trim()
    if (name && !map.has(name)) {
      const ledgerData = dataStore.getCustomerLedger(name)
      const balance = Number(ledgerData?.outstandingBalance ?? 0)
      map.set(name, {
        name,
        phone: '',
        email: '',
        address: inv.deliveryAddress || '',
        branch: inv.branch || 'Lahore',
        type: 'Customer',
        balance
      })
    }
  })

  // 3. Seeded sample Vyapar parties to guarantee full directory density if needed
  const sampleParties = [
    { name: 'HOSPITEX , RAWALPIN', balance: 17566000.00, phone: '+92 51 5566778', address: 'Rawalpindi Medical Zone' },
    { name: 'DERMA YOUSAF BAHI', balance: 2990000.00, phone: '+92 61 4455667', address: 'Bahawalpur Center' },
    { name: 'ZAKARIYA SURGICAL L', balance: 720000.00, phone: '+92 61 7788990', address: 'Multan Clinic Hub' },
    { name: 'IMRAN NIZAN SURGIC', balance: 585500.00, phone: '+92 42 3344556', address: 'Lahore Medical Market' },
    { name: 'DERMA NBA PERVAIZ', balance: 485500.00, phone: '+92 51 2233445', address: 'Islamabad F-8 Center' },
    { name: 'FIDA HUSSAIN KH', balance: 0.00, phone: '+92 91 9988776', address: 'Peshawar Saddar' },
    { name: 'ALI FAISAL FAISL', balance: 0.00, phone: '+92 41 8877665', address: 'Faisalabad' },
    { name: 'MAZHAR AL NAZ', balance: 0.00, phone: '+92 42 1122334', address: 'Lahore' },
    { name: 'AZIZ MUGHAL RYK', balance: 0.00, phone: '+92 68 5566778', address: 'Rahim Yar Khan' },
    { name: 'MR TURAB ALI CARE M', balance: 0.00, phone: '+92 21 3344556', address: 'Karachi Central' },
    { name: 'AKBER RWP 2025 ULTF', balance: 0.00, phone: '+92 51 6677889', address: 'Rawalpindi' },
    { name: 'DERMA IMTIAZ , KHI', balance: 0.00, phone: '+92 21 4455667', address: 'Clifton Karachi' }
  ]

  sampleParties.forEach(sp => {
    if (!map.has(sp.name)) {
      map.set(sp.name, {
        name: sp.name,
        phone: sp.phone,
        email: '',
        address: sp.address,
        branch: 'General',
        type: 'Customer',
        balance: sp.balance
      })
    }
  })

  return Array.from(map.values())
})

const filteredPartiesList = computed(() => {
  let list = allPartiesList.value

  // Apply Filter: ALL vs TO RECEIVE vs TO PAY
  if (activePartyFilter.value === 'RECEIVE') {
    list = list.filter(p => p.balance > 0)
  } else if (activePartyFilter.value === 'PAY') {
    list = list.filter(p => p.balance < 0)
  }

  // Apply Search Query
  if (partySearchQuery.value.trim()) {
    const q = partySearchQuery.value.toLowerCase().trim()
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q)))
  }

  return list
})

const selectedPartySummary = computed(() => {
  if (!selectedCustomerName.value) return null
  return allPartiesList.value.find(p => p.name.toLowerCase() === selectedCustomerName.value.toLowerCase()) || {
    name: selectedCustomerName.value,
    phone: '',
    email: '',
    address: '',
    balance: 0
  }
})

const customerData = computed(() => {
  if (!selectedCustomerName.value) return null
  return (dataStore.customers || []).find(c => c.name.toLowerCase() === selectedCustomerName.value.toLowerCase())
})

// ── Credit Governance Status ────────────────────────────────
const customerCreditStatus = computed(() => {
  if (!selectedCustomerName.value) {
    return {
      isLocked: false,
      status: 'Normal',
      statusType: 'safe',
      percentage: 0,
      balance: 0,
      limit: 1000000,
      baseLimit: 1000000,
      overridesTotal: 0,
      remainingCredit: 1000000,
      overdueDays: 0,
      categoryCode: 'C',
      lockReason: ''
    }
  }

  const st = dataStore.getCustomerCreditStatus(selectedCustomerName.value, 0)
  const isLocked = st.status === 'locked' || st.isOverdue || (st.creditLimit > 0 && st.exposure > st.creditLimit)
  const pct = Number(st.utilizationPercent ?? ((st.outstanding && st.creditLimit) ? (st.outstanding / st.creditLimit) * 100 : 0))
  const formattedPct = isNaN(pct) ? 0 : Number(pct.toFixed(1))

  let statusLabel = 'Normal'
  let statusType = 'safe'

  if (isLocked) {
    statusLabel = 'Locked'
    statusType = 'locked'
  } else if (formattedPct >= 90 || st.status === 'critical_90') {
    statusLabel = 'Critical'
    statusType = 'critical'
  } else if (formattedPct >= 75 || st.status === 'warning_75') {
    statusLabel = 'Warning'
    statusType = 'warning'
  }

  return {
    isLocked,
    status: statusLabel,
    statusType,
    percentage: formattedPct,
    balance: Number(selectedPartySummary.value?.balance || st.outstanding || 0),
    limit: Number(st.creditLimit ?? 1000000),
    baseLimit: Number(st.baseLimit ?? 1000000),
    overridesTotal: Number(st.overridesTotal ?? 0),
    remainingCredit: Number(st.remainingCredit ?? Math.max(0, (st.creditLimit || 1000000) - (st.outstanding || 0))),
    overdueDays: Number(st.maxOverdueDays ?? 0),
    categoryCode: st.categoryCode || customerData.value?.categoryCode || 'A',
    lockReason: st.lockReason || ''
  }
})

const customerCategoryBadgeClass = computed(() => {
  const code = customerCreditStatus.value.categoryCode || 'A'
  const map = {
    'A': 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800',
    'B': 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800',
    'C': 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
    'D': 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
  }
  return map[code] || 'bg-slate-100 text-slate-700'
})

// ── Selected Party Transactions ─────────────────────────────
const partyTransactions = computed(() => {
  if (!selectedCustomerName.value) return []
  const txList = []

  // 1. Sales Invoices
  ;(ledger.value?.invoices || []).forEach(inv => {
    txList.push({
      id: `inv_${inv.invoiceNo}`,
      type: `Sale Invoice [${inv.paymentStatus || 'Delivered'}]`,
      typeCategory: 'SALE',
      number: inv.invoiceNo,
      date: inv.saleDate || '2026-08-12',
      total: inv.grandTotal || 0,
      balance: inv.outstandingBalance ?? 0,
      raw: inv
    })
  })

  // 2. Payment Receipts
  ;(ledger.value?.receipts || []).forEach(rcp => {
    txList.push({
      id: `rcp_${rcp.receiptNo}`,
      type: `Payment-In [${rcp.paymentType || rcp.paymentMethod || 'Paid'}]`,
      typeCategory: 'PAYMENT',
      number: rcp.receiptNo,
      date: rcp.paymentDate || '2026-08-12',
      total: rcp.amount || rcp.amountReceived || 0,
      balance: 0,
      raw: rcp
    })
  })

  // 3. Sales Returns
  ;(ledger.value?.returns || []).forEach(ret => {
    txList.push({
      id: `ret_${ret.returnNo}`,
      type: 'Sale Return / Credit Note',
      typeCategory: 'RETURN',
      number: ret.returnNo,
      date: ret.returnDate || '2026-08-15',
      total: ret.totalRefundAmount || 0,
      balance: 0,
      raw: ret
    })
  })

  // 4. Payments Out (Refunds)
  ;(ledger.value?.paymentsOut || []).forEach(vou => {
    txList.push({
      id: `vou_${vou.voucherNo}`,
      type: 'Payment-Out (Debit)',
      typeCategory: 'PURCHASE',
      number: vou.voucherNo,
      date: vou.paymentDate || '2026-08-20',
      total: vou.amount || 0,
      balance: 0,
      raw: vou
    })
  })

  // Fallback sample transactions if this customer is a sample party
  if (txList.length === 0 && selectedPartySummary.value) {
    const bal = selectedPartySummary.value.balance
    if (bal > 0) {
      txList.push({
        id: 'tx_sample_1',
        type: 'Party to Party [Paid]',
        typeCategory: 'PAYMENT',
        number: '',
        date: '13/04/2026',
        total: 80000.00,
        balance: 0.00
      })
      txList.push({
        id: 'tx_sample_2',
        type: 'Payment-Out',
        typeCategory: 'PURCHASE',
        number: '',
        date: '13/01/2026, 02:23 PM',
        total: 9000.00,
        balance: 0.00
      })
      txList.push({
        id: 'tx_sample_3',
        type: 'Purchase',
        typeCategory: 'PURCHASE',
        number: '',
        date: '12/11/2025, 12:43 PM',
        total: 80000.00,
        balance: 80000.00
      })
      txList.push({
        id: 'tx_sample_4',
        type: 'Sale Invoice [Delivered]',
        typeCategory: 'SALE',
        number: 'INV-2025-991',
        date: '01/11/2025, 04:56 PM',
        total: bal,
        balance: bal
      })
    }
  }

  return txList
})

const filteredPartyTransactions = computed(() => {
  let list = [...partyTransactions.value]

  // 1. Type filter
  if (txTypeFilter.value !== 'ALL') {
    list = list.filter(t => t.typeCategory === txTypeFilter.value)
  }

  // 2. Search filter
  if (transactionSearchQuery.value.trim()) {
    const q = transactionSearchQuery.value.toLowerCase().trim()
    list = list.filter(t => 
      (t.type && t.type.toLowerCase().includes(q)) || 
      (t.number && t.number.toLowerCase().includes(q)) ||
      (t.date && t.date.toLowerCase().includes(q))
    )
  }

  // 3. Sorting
  list.sort((a, b) => {
    let valA = a[txSortKey.value]
    let valB = b[txSortKey.value]

    if (txSortKey.value === 'total' || txSortKey.value === 'balance') {
      valA = Number(valA || 0)
      valB = Number(valB || 0)
    } else {
      valA = String(valA || '').toLowerCase()
      valB = String(valB || '').toLowerCase()
    }

    if (valA < valB) return txSortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return txSortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return list
})

// ── Methods ─────────────────────────────────────────────────
function selectParty(name) {
  selectedCustomerName.value = name
  showMobilePartyDetail.value = true
  loadLedger()
}

function loadLedger() {
  if (!selectedCustomerName.value) {
    ledger.value = null
    return
  }
  const rawLedger = dataStore.getCustomerLedger(selectedCustomerName.value)
  if (!authStore.isSuperAdmin && rawLedger) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    rawLedger.invoices = (rawLedger.invoices || []).filter(i => (i.branch || 'Lahore').toLowerCase().includes(userCity))
    rawLedger.receipts = (rawLedger.receipts || []).filter(r => (r.branch || 'Lahore').toLowerCase().includes(userCity))
    rawLedger.pendingMachines = (rawLedger.pendingMachines || []).filter(m => (m.allocationCity || 'Lahore').toLowerCase().includes(userCity))
  }
  ledger.value = rawLedger
}

function openAddPartyModal() {
  newPartyForm.value = {
    name: '',
    type: 'Customer',
    branch: authStore.userBranch || 'Lahore',
    phone: '',
    email: '',
    address: '',
    baseCreditLimit: 1000000,
    openingBalance: 0
  }
  showAddPartyModal.value = true
}

function handleCreateParty() {
  if (!newPartyForm.value.name.trim()) return
  const partyObj = {
    id: `cust_${Date.now()}`,
    name: newPartyForm.value.name.trim(),
    category: 'REGULAR',
    branch: newPartyForm.value.branch,
    phone: newPartyForm.value.phone,
    email: newPartyForm.value.email,
    address: newPartyForm.value.address,
    baseCreditLimit: newPartyForm.value.baseCreditLimit || 1000000,
    paymentDays: 30,
    status: 'active',
    overrides: []
  }

  if (!dataStore.customers) dataStore.customers = []
  dataStore.customers.push(partyObj)
  selectedCustomerName.value = partyObj.name
  showAddPartyModal.value = false
  uiStore.showToast(`Party "${partyObj.name}" created successfully`, 'success')
  loadLedger()
}

const partyFileInputRef = ref(null)
const uploadedPartyFileName = ref('')
const parsedImportParties = ref([])

function triggerPartyFilePicker() {
  if (partyFileInputRef.value) {
    partyFileInputRef.value.click()
  }
}

function parseCSVRow(row) {
  const result = []
  let insideQuotes = false
  let entry = ''
  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    if (char === '"' || char === "'") {
      insideQuotes = !insideQuotes
    } else if ((char === ',' || char === '\t' || char === ';') && !insideQuotes) {
      result.push(entry.trim().replace(/^["']|["']$/g, ''))
      entry = ''
    } else {
      entry += char
    }
  }
  result.push(entry.trim().replace(/^["']|["']$/g, ''))
  return result
}

function parsePartyCSVContent(text) {
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (rawLines.length === 0) return []

  const headerRow = parseCSVRow(rawLines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''))
  
  let nameIdx = headerRow.findIndex(h => h.includes('name') || h.includes('party') || h.includes('customer') || h.includes('hospital') || h.includes('client'))
  let phoneIdx = headerRow.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact') || h.includes('tel') || h.includes('cell'))
  let emailIdx = headerRow.findIndex(h => h.includes('email') || h.includes('mail'))
  let addrIdx = headerRow.findIndex(h => h.includes('addr') || h.includes('location') || h.includes('city'))
  let branchIdx = headerRow.findIndex(h => h.includes('branch') || h.includes('depot'))
  let limitIdx = headerRow.findIndex(h => h.includes('limit') || h.includes('credit'))
  let catIdx = headerRow.findIndex(h => h.includes('cat') || h.includes('tier') || h.includes('type'))
  let balIdx = headerRow.findIndex(h => h.includes('bal') || h.includes('open') || h.includes('due') || h.includes('outstand'))

  const hasRecognizedHeader = nameIdx !== -1 || phoneIdx !== -1 || emailIdx !== -1 || addrIdx !== -1
  const startIndex = hasRecognizedHeader ? 1 : 0

  if (!hasRecognizedHeader) {
    nameIdx = 0
    phoneIdx = 1
    emailIdx = 2
    addrIdx = 3
    balIdx = 4
  }

  const parties = []
  for (let i = startIndex; i < rawLines.length; i++) {
    const cols = parseCSVRow(rawLines[i])
    if (!cols || cols.length === 0) continue

    const name = (nameIdx >= 0 && cols[nameIdx]) ? cols[nameIdx] : (cols[0] || '').trim()
    if (!name) continue

    const phone = (phoneIdx >= 0 && cols[phoneIdx]) ? cols[phoneIdx] : ''
    const email = (emailIdx >= 0 && cols[emailIdx]) ? cols[emailIdx] : ''
    const address = (addrIdx >= 0 && cols[addrIdx]) ? cols[addrIdx] : ''
    const branch = (branchIdx >= 0 && cols[branchIdx]) ? cols[branchIdx] : (authStore.userBranch || 'Karachi')
    
    const cleanNum = (val, fallback) => {
      if (!val) return fallback
      const cleaned = String(val).replace(/[^0-9.]/g, '')
      const n = Number(cleaned)
      return isNaN(n) ? fallback : n
    }

    const baseCreditLimit = cleanNum(limitIdx >= 0 ? cols[limitIdx] : null, 2000000)
    const category = (catIdx >= 0 && cols[catIdx]) ? cols[catIdx].toUpperCase() : 'REGULAR'
    const openingBalance = cleanNum(balIdx >= 0 ? cols[balIdx] : null, 0)

    parties.push({
      id: `cust_imp_${Date.now()}_${i}`,
      name,
      phone,
      email,
      address,
      branch,
      category,
      baseCreditLimit,
      openingBalance,
      paymentDays: 30,
      status: 'active',
      overrides: []
    })
  }

  return parties
}

function handlePartyFileUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadedPartyFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result
    if (typeof content === 'string') {
      parsedImportParties.value = parsePartyCSVContent(content)
      uiStore.showToast(`Parsed ${parsedImportParties.value.length} parties from ${file.name}!`, 'info')
    }
  }
  reader.readAsText(file)
}

function handlePartyFileDrop(e) {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  uploadedPartyFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result
    if (typeof content === 'string') {
      parsedImportParties.value = parsePartyCSVContent(content)
      uiStore.showToast(`Parsed ${parsedImportParties.value.length} parties from ${file.name}!`, 'info')
    }
  }
  reader.readAsText(file)
}

function confirmPartyImport() {
  if (parsedImportParties.value.length === 0) {
    handleSampleImport()
    return
  }

  if (!dataStore.customers) dataStore.customers = []
  let addedCount = 0

  parsedImportParties.value.forEach(p => {
    const existingIdx = dataStore.customers.findIndex(c => c.name?.trim().toLowerCase() === p.name.trim().toLowerCase())
    if (existingIdx === -1) {
      dataStore.customers.unshift(p)
      addedCount++
    } else {
      dataStore.customers[existingIdx] = { ...dataStore.customers[existingIdx], ...p }
    }
  })

  selectedCustomerName.value = parsedImportParties.value[0]?.name || selectedCustomerName.value
  uiStore.showModal(
    'Parties Imported Successfully',
    `Successfully imported ${parsedImportParties.value.length} customer contacts into the system directory.`,
    'success'
  )
  showImportModal.value = false
  uploadedPartyFileName.value = ''
  parsedImportParties.value = []
  loadLedger()
}

function downloadSamplePartyTemplate() {
  const columns = ['Name', 'Phone', 'Email', 'Address', 'Branch', 'CreditLimit', 'Category', 'OpeningBalance']
  const sampleRows = [
    ['Shifa International Hospital', '+92 51 8463000', 'procurement@shifa.com.pk', 'Sector H-8/4, Islamabad', 'Islamabad', '10000000', 'DIAMOND', '0'],
    ['Lady Reading Hospital (LRH)', '+92 91 9211430', 'biomedical@lrh.edu.pk', 'Soekarno Road, Peshawar', 'Peshawar', '5000000', 'GOVERNMENT', '0'],
    ['Aga Khan University Hospital', '+92 21 34930051', 'imports@aku.edu', 'Stadium Road, Karachi', 'Karachi', '10000000', 'DIAMOND', '0'],
    ['Doctors Hospital & Medical Center', '+92 42 35302701', 'info@doctorshospital.com.pk', 'Canal Bank, Johar Town, Lahore', 'Lahore', '5000000', 'GOLD', '0'],
    ['Nishtar Hospital & Medical Univ', '+92 61 9200238', 'admin@nishtar.edu.pk', 'Nishtar Road, Multan', 'Multan', '3000000', 'GOVERNMENT', '0']
  ]
  exportCSV(columns, sampleRows, 'MedImage_Parties_Import_Template.csv')
  uiStore.showToast('Sample CSV template downloaded!', 'success')
}

function handleSampleImport() {
  const sampleParties = [
    {
      id: `cust_smp_${Date.now()}_1`,
      name: 'Shaukat Khanum Memorial Hospital (SKMCH Peshawar)',
      category: 'DIAMOND',
      branch: 'Peshawar',
      baseCreditLimit: 10000000,
      paymentDays: 45,
      phone: '+92 91 5885000',
      email: 'supplychain@skm.org.pk',
      address: 'Phase 5, Hayatabad, Peshawar',
      status: 'active',
      overrides: []
    },
    {
      id: `cust_smp_${Date.now()}_2`,
      name: 'Lady Reading Hospital (LRH Peshawar)',
      category: 'GOVERNMENT',
      branch: 'Peshawar',
      baseCreditLimit: 8000000,
      paymentDays: 60,
      phone: '+92 91 9211430',
      email: 'purchasing@lrh.edu.pk',
      address: 'PTCL Colony, Soekarno Road, Peshawar',
      status: 'active',
      overrides: []
    },
    {
      id: `cust_smp_${Date.now()}_3`,
      name: 'South City Hospital (Karachi)',
      category: 'DIAMOND',
      branch: 'Karachi',
      baseCreditLimit: 10000000,
      paymentDays: 30,
      phone: '+92 21 35862301',
      email: 'accounts@southcityhospital.org',
      address: 'Block 3, Clifton, Karachi',
      status: 'active',
      overrides: []
    },
    {
      id: `cust_smp_${Date.now()}_4`,
      name: 'Doctors Hospital & Medical Center (Lahore)',
      category: 'GOLD',
      branch: 'Lahore',
      baseCreditLimit: 5000000,
      paymentDays: 30,
      phone: '+92 42 35302701',
      email: 'biomedical@doctorshospital.com.pk',
      address: '152-G/1, Canal Bank, Johar Town, Lahore',
      status: 'active',
      overrides: []
    },
    {
      id: `cust_smp_${Date.now()}_5`,
      name: 'Nishtar Hospital & Medical University (Multan)',
      category: 'GOVERNMENT',
      branch: 'Multan',
      baseCreditLimit: 4000000,
      paymentDays: 60,
      phone: '+92 61 9200238',
      email: 'store@nishtar.edu.pk',
      address: 'Nishtar Road, Multan',
      status: 'active',
      overrides: []
    }
  ]

  if (!dataStore.customers) dataStore.customers = []
  let newlyAdded = 0
  sampleParties.forEach(sp => {
    if (!dataStore.customers.some(c => c.name.trim().toLowerCase() === sp.name.trim().toLowerCase())) {
      dataStore.customers.unshift(sp)
      newlyAdded++
    }
  })

  selectedCustomerName.value = sampleParties[0].name
  uiStore.showModal(
    'Sample Contacts Loaded',
    `Loaded ${newlyAdded || sampleParties.length} hospital and clinical party profiles across Peshawar, Karachi, Lahore, and Multan.`,
    'success'
  )
  showImportModal.value = false
  loadLedger()
}

function openPartyOptionsMenu(party) {
  selectParty(party.name)
}

function viewTransactionDetails(tx) {
  uiStore.showToast(`Viewing ${tx.type} #${tx.number || 'Tx'}`, 'info')
}

function toggleLock() {
  const userName = authStore.user?.username || 'Finance Admin'
  if (customerCreditStatus.value.isLocked) {
    dataStore.unlockCustomer(selectedCustomerName.value, 'Admin unlocked from Parties Ledger', userName)
    uiStore.showModal('Customer Unlocked', `${selectedCustomerName.value} has been unblocked for new credit sales.`, 'success')
  } else {
    dataStore.lockCustomer(selectedCustomerName.value, 'Manual credit lock triggered from Parties Ledger', userName)
    uiStore.showModal('Customer Locked', `${selectedCustomerName.value} has been restricted from credit sales.`, 'warning')
  }
}

function openOverrideModal() {
  overrideForm.value = {
    additionalLimit: 250000,
    reason: 'Executive Director Discretion',
    remarks: 'Approved for urgent clinic installation.'
  }
  showOverrideModal.value = true
}

function handleSaveOverride() {
  const res = dataStore.overrideCustomerCredit(
    selectedCustomerName.value,
    overrideForm.value.additionalLimit,
    overrideForm.value.reason,
    overrideForm.value.remarks,
    authStore.user?.username || 'Superadmin'
  )
  if (res.success) {
    uiStore.showModal('Credit Limit Overridden', res.message, 'success')
    showOverrideModal.value = false
  } else {
    uiStore.showModal('Override Failed', res.message, 'danger')
  }
}

function openReminderModal() {
  reminderForm.value = {
    channel: 'WhatsApp',
    recipient: selectedPartySummary.value?.phone || '+92 300 1234567',
    message: `Respected ${selectedCustomerName.value}, your account has an outstanding balance of PKR ${Number(customerCreditStatus.value.balance).toLocaleString()} under MedImage ERP credit terms. Please expedite clearance.`
  }
  showReminderModal.value = true
}

function handleSendReminder() {
  const invNo = ledger.value?.invoices?.[0]?.invoiceNo || 'LEDGER-REM'
  dataStore.sendPaymentReminder(
    invNo,
    reminderForm.value.channel,
    reminderForm.value.message,
    authStore.user?.username || 'Finance Admin'
  )
  uiStore.showModal(
    'Reminder Dispatched',
    `Payment notice sent via ${reminderForm.value.channel} to ${selectedCustomerName.value}.`,
    'success'
  )
  showReminderModal.value = false
}

// Lifecycle
onMounted(() => {
  if (route.query.customer) {
    selectedCustomerName.value = route.query.customer
  } else if (filteredPartiesList.value.length > 0) {
    selectedCustomerName.value = filteredPartiesList.value[0].name
  }
  loadLedger()
})

watch(filteredPartiesList, (list) => {
  if (list.length > 0 && (!selectedCustomerName.value || !list.some(p => p.name === selectedCustomerName.value))) {
    selectedCustomerName.value = list[0].name
    loadLedger()
  }
})
</script>

<style scoped>
.vyapar-parties-view {
  font-family: inherit;
}

.import-parties-card {
  background: #fff1f2 !important;
  border: 1px solid #fecdd3 !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.import-parties-card:hover {
  background: #ffe4e6 !important;
  border-color: #fda4af !important;
  box-shadow: 0 2px 8px rgba(244, 63, 94, 0.15) !important;
}

[data-theme="dark"] .import-parties-card {
  background: rgba(159, 18, 57, 0.2) !important;
  border-color: rgba(225, 29, 72, 0.35) !important;
}

.filter-popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 0.5rem;
  z-index: 999 !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
}

[data-theme="dark"] .filter-popover {
  background: #1e2530 !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.vyapar-sub-header {
  padding: 0.65rem 1.25rem !important;
}

.party-row-item {
  padding: 0.85rem 1.15rem !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

[data-theme="dark"] .party-row-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.import-parties-card {
  padding: 0.75rem 0.85rem !important;
}

.credit-gov-card {
  transition: all 0.3s ease;
}

[data-theme="light"] .credit-gov-card {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08) !important;
}

[data-theme="light"] .credit-gov-card .text-white {
  color: #0f172a !important;
}

[data-theme="light"] .credit-gov-card .bg-slate-900\/80 {
  background-color: #f8fafc !important;
  border-color: #e2e8f0 !important;
}

/* Mobile-only responsive behavior - on desktop both left & right panes are always visible */
.mobile-back-btn {
  display: none !important;
}

@media (max-width: 768px) {
  .party-left-pane,
  .party-right-pane {
    width: 100% !important;
  }
  .party-left-pane.mobile-view-hidden,
  .party-right-pane.mobile-view-hidden {
    display: none !important;
  }
  .mobile-back-btn {
    display: inline-flex !important;
  }
}
</style>
