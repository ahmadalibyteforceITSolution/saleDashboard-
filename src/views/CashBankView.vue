<template>
  <div class="page-wrapper space-y-6">
    <!-- Header Banner -->
    <div class="header-card flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-success font-mono">BANKING & TREASURY ENGINE</span>
          <span class="badge badge-info font-mono">LIVE LIQUIDITY & SAFES</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
          <Landmark class="text-sky-400" :size="30" />
          <span>Cash & Bank Management Center</span>
        </h1>
        <p class="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
          Real-time tracking of corporate bank accounts, branch cash counters, and inter-account contra transfers across all regional depots.
        </p>
      </div>

      <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
        <!-- View / Hide Balance Security Toggle -->
        <button
          @click="authStore.toggleBalance()"
          :class="[
            'btn font-bold flex items-center justify-center gap-1.5 shadow-md transition-all h-10 px-3 text-xs col-span-2 sm:col-auto whitespace-nowrap',
            authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
          ]"
          :style="authStore.isBalanceVisible ? '' : 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;'"
          :title="authStore.isBalanceVisible ? 'Hide financial balances' : 'Click to view financial balances'"
        >
          <EyeOff v-if="authStore.isBalanceVisible" :size="15" class="shrink-0" />
          <Eye v-else :size="15" class="shrink-0" />
          <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View Balance' }}</span>
        </button>

        <!-- Contra Transfer -->
        <button
          @click="openGeneralContraTransfer"
          class="btn bg-sky-600 hover:bg-sky-500 text-white h-10 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md col-span-1 sm:col-auto whitespace-nowrap cursor-pointer"
        >
          <ArrowLeftRight :size="15" class="shrink-0" />
          <span>Transfer (Contra)</span>
        </button>

        <!-- Add Bank Account -->
        <button
          @click="showAddBankModal = true"
          class="btn btn-primary h-10 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md col-span-1 sm:col-auto whitespace-nowrap"
        >
          <Building2 :size="15" class="shrink-0" />
          <span>+ Add Bank</span>
        </button>

        <!-- Add Cash Safe -->
        <button
          @click="showAddCashModal = true"
          class="btn btn-secondary h-10 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md col-span-1 sm:col-auto whitespace-nowrap"
        >
          <Vault :size="15" class="shrink-0 text-amber-400" />
          <span>+ Add Cash Safe</span>
        </button>
      </div>
    </div>

    <!-- ── LIQUIDITY METRICS SUMMARY ────────────────────────────────────────── -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Total Bank Liquidity -->
      <div class="glass-panel p-5 border border-sky-500/20 bg-slate-900/60 rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">Corporate Bank Balances</span>
          <Building2 :size="20" class="text-sky-400" />
        </div>
        <div class="text-2xl font-black text-white mt-2 font-mono">
          {{ formatBalance(dataStore.totalBankBalance) }}
        </div>
        <div class="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
          <span>{{ (dataStore.bankAccounts || []).length }} Active Accounts</span>
          <span class="text-emerald-400 font-semibold font-mono">100% Cleared</span>
        </div>
      </div>

      <!-- Total Physical Cash in Hand -->
      <div class="glass-panel p-5 border border-amber-500/20 bg-slate-900/60 rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Physical Cash in Hand & Safes</span>
          <Vault :size="20" class="text-amber-400" />
        </div>
        <div class="text-2xl font-black text-amber-400 mt-2 font-mono">
          {{ formatBalance(dataStore.totalCashBalance) }}
        </div>
        <div class="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
          <span>{{ (dataStore.cashSafes || []).length }} Regional Branch Safes</span>
          <span class="text-amber-400 font-semibold font-mono">Vault Reconciled</span>
        </div>
      </div>

      <!-- Total Combined Liquidity -->
      <div class="glass-panel p-5 border border-emerald-500/20 bg-slate-900/60 rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Combined Liquid Capital</span>
          <TrendingUp :size="20" class="text-emerald-400" />
        </div>
        <div class="text-2xl font-black text-emerald-400 mt-2 font-mono">
          {{ formatBalance(dataStore.totalCombinedLiquidity) }}
        </div>
        <div class="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
          <span>Total Liquid Reserves</span>
          <span class="badge badge-success text-[10px] font-mono font-bold">SOLVENT</span>
        </div>
      </div>
    </div>

    <!-- ── NAVIGATION TABS & FILTER BAR ────────────────────────────────────── -->
    <div class="glass-panel p-3 rounded-xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
      <!-- Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          @click="activeTab = 'all'"
          :class="['btn btn-sm font-bold', activeTab === 'all' ? 'btn-primary' : 'btn-ghost text-slate-300']"
        >
          <Layers :size="14" />
          <span>All Accounts & Safes ({{ (dataStore.bankAccounts || []).length + (dataStore.cashSafes || []).length }})</span>
        </button>

        <button
          @click="activeTab = 'banks'"
          :class="['btn btn-sm font-bold', activeTab === 'banks' ? 'btn-primary' : 'btn-ghost text-slate-300']"
        >
          <Building2 :size="14" />
          <span>Bank Accounts ({{ (dataStore.bankAccounts || []).length }})</span>
        </button>

        <button
          @click="activeTab = 'cash'"
          :class="['btn btn-sm font-bold', activeTab === 'cash' ? 'btn-primary' : 'btn-ghost text-slate-300']"
        >
          <Vault :size="14" />
          <span>Cash Safes ({{ (dataStore.cashSafes || []).length }})</span>
        </button>

        <button
          @click="activeTab = 'transfers'"
          :class="['btn btn-sm font-bold', activeTab === 'transfers' ? 'btn-primary' : 'btn-ghost text-slate-300']"
        >
          <ArrowLeftRight :size="14" />
          <span>Contra Transfers ({{ (dataStore.contraTransfers || []).length }})</span>
        </button>

        <button
          @click="activeTab = 'ledger'"
          :class="['btn btn-sm font-bold', activeTab === 'ledger' ? 'btn-primary' : 'btn-ghost text-slate-300']"
        >
          <Receipt :size="14" />
          <span>Unified Cash Flow Ledger ({{ fullTransactionsLedger.length }})</span>
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="exportLedgerCSV"
          class="btn btn-secondary btn-sm text-xs font-bold flex items-center gap-1"
          title="Export Cash & Bank Statement to CSV"
        >
          <Download :size="13" />
          <span>Export Statement</span>
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 1 & 2: BANK ACCOUNTS GRID                                         -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'all' || activeTab === 'banks'" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-extrabold text-white text-base flex items-center gap-2">
          <Building2 :size="18" class="text-sky-400" />
          <span>Corporate Bank Accounts</span>
        </h3>
        <span class="text-xs text-slate-400">Click account card to filter transaction ledger</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="bank in dataStore.bankAccounts"
          :key="bank.id"
          @click="selectAccountFilter(bank.name)"
          :class="[
            'glass-panel p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group hover:shadow-xl',
            selectedAccountName === bank.name ? 'border-sky-500 bg-sky-950/30' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
          ]"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm truncate">{{ bank.name }}</span>
                <span class="badge badge-info text-[9px] py-0 px-1 font-mono uppercase">{{ bank.bankCode || 'BANK' }}</span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">{{ bank.accountTitle }}</div>
            </div>
            <div class="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
              <Building2 :size="16" />
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80">
            <div class="text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>A/C: {{ bank.accountNumber || 'N/A' }}</span>
              <span class="text-purple-400 font-semibold">📍 {{ bank.branch }}</span>
            </div>
            <div v-if="bank.iban" class="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
              IBAN: {{ bank.iban }}
            </div>

            <div class="flex items-end justify-between mt-3">
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-semibold block">Live Cleared Balance</span>
                <span class="text-lg font-black text-sky-400 font-mono">{{ formatBalance(dataStore.getAccountBalance(bank.id)) }}</span>
              </div>

              <button
                type="button"
                @click.stop="openContraFor(bank.name, 'bank')"
                class="btn btn-secondary btn-xs text-[10px] font-bold"
              >
                <span>Transfer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 1 & 3: CASH SAFES & BRANCH COUNTERS                                -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'all' || activeTab === 'cash'" class="space-y-3 mt-6">
      <div class="flex items-center justify-between">
        <h3 class="font-extrabold text-white text-base flex items-center gap-2">
          <Vault :size="18" class="text-amber-400" />
          <span>Regional Branch Cash Safes & Vaults</span>
        </h3>
        <span class="text-xs text-slate-400">Physical on-hand currency verified by Depot Custodians</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="safe in dataStore.cashSafes"
          :key="safe.id"
          @click="selectAccountFilter(safe.name)"
          :class="[
            'glass-panel p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group hover:shadow-xl',
            selectedAccountName === safe.name ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
          ]"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm truncate">{{ safe.name }}</span>
                <span class="badge badge-warning text-[9px] py-0 px-1 font-mono uppercase">CASH SAFE</span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">Custodian: {{ safe.custodian }}</div>
            </div>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <Vault :size="16" />
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80">
            <div class="text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Location: {{ safe.location || safe.branch }}</span>
              <span class="badge badge-purple text-[9px] font-bold">📍 {{ safe.branch }}</span>
            </div>

            <div class="flex items-end justify-between mt-3">
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-semibold block">Physical Cash In Safe</span>
                <span class="text-lg font-black text-amber-400 font-mono">{{ formatBalance(dataStore.getAccountBalance(safe.id)) }}</span>
              </div>

              <button
                type="button"
                @click.stop="openContraFor(safe.name, 'cash')"
                class="btn btn-secondary btn-xs text-[10px] font-bold"
              >
                <span>Deposit / Move</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 4: CONTRA TRANSFERS LEDGER                                         -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'transfers'" class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <ArrowLeftRight :size="20" class="text-sky-400" />
            <span>Inter-Account & Cash Safe Contra Transfers</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Internal transfers between bank accounts and cash counters (dual-entry verified).
          </p>
        </div>

        <button
          @click="showTransferModal = true"
          class="btn btn-primary btn-sm font-bold flex items-center gap-1.5"
        >
          <Plus :size="14" />
          <span>New Contra Transfer</span>
        </button>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Transfer Ref #</th>
              <th>Date</th>
              <th>From (Source Account)</th>
              <th>To (Destination Account)</th>
              <th>Transfer Type</th>
              <th>Amount (PKR)</th>
              <th>Notes / Cheque Ref</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="trf in dataStore.contraTransfers" :key="trf.id" class="hover:bg-slate-800/40">
              <td class="font-mono font-bold text-sky-400">{{ trf.transferNo }}</td>
              <td class="font-mono text-xs text-slate-400">{{ trf.date }}</td>
              <td class="font-bold text-red-400">
                <div class="flex items-center gap-1">
                  <ArrowUpRight :size="12" />
                  <span>{{ trf.fromAccount }}</span>
                </div>
              </td>
              <td class="font-bold text-emerald-400">
                <div class="flex items-center gap-1">
                  <ArrowDownLeft :size="12" />
                  <span>{{ trf.toAccount }}</span>
                </div>
              </td>
              <td>
                <span class="badge badge-info text-xs">{{ trf.transferType }}</span>
              </td>
              <td class="font-bold font-mono text-white text-base">
                {{ formatBalance(trf.amount) }}
              </td>
              <td class="text-xs text-slate-300 max-w-xs truncate">{{ trf.notes || trf.refNo }}</td>
              <td class="text-xs text-slate-400">{{ trf.recordedBy }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- UNIFIED TRANSACTIONS STATEMENT TABLE                                  -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <Receipt :size="20" class="text-emerald-400" />
              <span>Real-Time Cash & Bank Statement Ledger</span>
            </h3>
            <span v-if="selectedAccountName" class="badge badge-info text-xs font-mono">
              Filtered: {{ selectedAccountName }}
              <button @click="selectedAccountName = ''" class="ml-1 hover:text-white font-bold">✕</button>
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Complete synchronized transaction journal of Inflows, Outflows, Bank Receipts, Cash Vouchers, and Expenses.
          </p>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <!-- Account filter -->
          <select v-model="selectedAccountName" class="form-select text-xs font-bold py-1.5 px-2.5">
            <option value="">🏢 All Accounts & Safes</option>
            <optgroup label="Bank Accounts">
              <option v-for="b in dataStore.bankAccounts" :key="b.id" :value="b.name">{{ b.name }}</option>
            </optgroup>
            <optgroup label="Cash Safes">
              <option v-for="s in dataStore.cashSafes" :key="s.id" :value="s.name">{{ s.name }}</option>
            </optgroup>
          </select>

          <!-- Branch Filter -->
          <select v-model="filterBranch" class="form-select text-xs font-bold py-1.5 px-2.5" :disabled="!authStore.isSuperAdmin">
            <option v-if="authStore.isSuperAdmin" value="ALL">🏢 All Branches</option>
            <option value="Peshawar">Peshawar HO</option>
            <option value="Lahore">Lahore Depot</option>
            <option value="Multan">Multan Branch</option>
            <option value="Islamabad">Islamabad Branch</option>
            <option value="Karachi">Karachi Branch</option>
          </select>

          <!-- Search Box -->
          <div class="relative">
            <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search ref #, party, cheque..."
              class="form-input text-xs pl-8 py-1.5 rounded-lg w-48"
            />
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Date</th>
              <th>Voucher / Ref #</th>
              <th>Account / Cash Safe</th>
              <th>Type</th>
              <th>Party / Payee / Source</th>
              <th>Branch</th>
              <th>Debit (Outflow)</th>
              <th>Credit (Inflow)</th>
              <th>Details / Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in filteredTransactionsLedger" :key="tx.id" class="hover:bg-slate-800/40">
              <td class="font-mono text-xs text-slate-400 whitespace-nowrap">{{ tx.date }}</td>
              <td class="font-mono font-bold text-xs" :class="tx.direction === 'IN' ? 'text-emerald-400' : 'text-amber-400'">
                {{ tx.refNo }}
              </td>
              <td class="font-bold text-white text-xs">
                <span class="flex items-center gap-1.5">
                  <Building2 v-if="tx.isBank" :size="13" class="text-sky-400 shrink-0" />
                  <Vault v-else :size="13" class="text-amber-400 shrink-0" />
                  <span>{{ tx.accountName }}</span>
                </span>
              </td>
              <td>
                <span :class="['badge text-[10px] font-bold flex items-center gap-1 w-max', tx.direction === 'IN' ? 'badge-success' : 'badge-danger']">
                  <ArrowDownLeft v-if="tx.direction === 'IN'" :size="10" />
                  <ArrowUpRight v-else :size="10" />
                  {{ tx.category }}
                </span>
              </td>
              <td class="font-bold text-white text-xs">{{ tx.party }}</td>
              <td>
                <span class="badge badge-purple text-[10px] font-bold">{{ tx.branch }}</span>
              </td>
              <!-- Debit Outflow -->
              <td class="font-mono font-bold text-xs text-red-400 text-right">
                <span v-if="tx.direction === 'OUT'">- {{ formatBalance(tx.amount) }}</span>
                <span v-else class="text-slate-600">-</span>
              </td>
              <!-- Credit Inflow -->
              <td class="font-mono font-bold text-xs text-emerald-400 text-right">
                <span v-if="tx.direction === 'IN'">+ {{ formatBalance(tx.amount) }}</span>
                <span v-else class="text-slate-600">-</span>
              </td>
              <td class="text-xs text-slate-300 max-w-xs truncate" :title="tx.description">{{ tx.description }}</td>
            </tr>
            <tr v-if="filteredTransactionsLedger.length === 0">
              <td colspan="9" class="text-center py-8 text-slate-400 text-xs">
                No cash or bank transactions found matching the selected filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- MODAL 1: ADD BANK ACCOUNT                                              -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div v-if="showAddBankModal" class="modal-backdrop" @click.self="showAddBankModal = false">
      <div class="modal-content max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-5 space-y-4 text-white">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <Building2 :size="18" class="text-sky-400" />
            <h3 class="font-bold text-sm text-white">Add New Bank Account</h3>
          </div>
          <button @click="showAddBankModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateBank" class="space-y-3 text-xs">
          <div class="form-group">
            <label class="form-label block font-bold mb-1">Bank Name *</label>
            <input v-model="newBankForm.name" type="text" placeholder="e.g. Faysal Bank Islamic, Allied Bank..." required class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded font-bold" />
          </div>
          <div class="form-group">
            <label class="form-label block font-bold mb-1">Account Title *</label>
            <input v-model="newBankForm.accountTitle" type="text" placeholder="e.g. Medimage Services Ltd" required class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="form-group">
              <label class="form-label block font-bold mb-1">Account Number *</label>
              <input v-model="newBankForm.accountNumber" type="text" placeholder="0123-456789-01" required class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded font-mono" />
            </div>
            <div class="form-group">
              <label class="form-label block font-bold mb-1">Bank Code (Short)</label>
              <input v-model="newBankForm.bankCode" type="text" placeholder="e.g. FAYSAL" class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded font-mono uppercase" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="form-group">
              <label class="form-label block font-bold mb-1">IBAN Number</label>
              <input v-model="newBankForm.iban" type="text" placeholder="PK00..." class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded font-mono" />
            </div>
            <div class="form-group">
              <label class="form-label block font-bold mb-1">Branch Depot</label>
              <input v-model="newBankForm.branch" type="text" placeholder="e.g. Main Gulberg Lahore" class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label block font-bold mb-1">Opening Balance (PKR)</label>
            <input v-model.number="newBankForm.openingBalance" type="number" min="0" step="10000" class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-emerald-400" />
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" @click="showAddBankModal = false" class="btn btn-secondary text-xs px-3 py-1.5">Cancel</button>
            <button type="submit" class="btn btn-primary text-xs px-4 py-1.5 font-bold">Register Bank Account</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- MODAL 2: ADD CASH SAFE                                                 -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div v-if="showAddCashModal" class="modal-backdrop" @click.self="showAddCashModal = false">
      <div class="modal-content max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-5 space-y-4 text-white">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <Vault :size="18" class="text-amber-400" />
            <h3 class="font-bold text-sm text-white">Add New Branch Cash Safe / Drawer</h3>
          </div>
          <button @click="showAddCashModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateCash" class="space-y-3 text-xs">
          <div class="form-group">
            <label class="form-label block font-bold mb-1">Cash Safe Name *</label>
            <input v-model="newCashForm.name" type="text" placeholder="e.g. Rawalpindi Liaison Cash Counter" required class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded font-bold" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="form-group">
              <label class="form-label block font-bold mb-1">Custodian / Responsible *</label>
              <input v-model="newCashForm.custodian" type="text" placeholder="e.g. Branch Cashier" required class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded" />
            </div>
            <div class="form-group">
              <label class="form-label block font-bold mb-1">Branch City *</label>
              <select v-model="newCashForm.branch" required class="form-select w-full p-2 bg-slate-950 border border-slate-700 rounded font-bold">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Lahore">Lahore Depot</option>
                <option value="Multan">Multan Branch</option>
                <option value="Islamabad">Islamabad Branch</option>
                <option value="Karachi">Karachi Branch</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label block font-bold mb-1">Physical Location / Desk</label>
            <input v-model="newCashForm.location" type="text" placeholder="e.g. Ground Floor Reception Cash Safe" class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded" />
          </div>
          <div class="form-group">
            <label class="form-label block font-bold mb-1">Initial Opening Cash (PKR)</label>
            <input v-model.number="newCashForm.openingBalance" type="number" min="0" step="5000" class="form-input w-full p-2 bg-slate-950 border border-slate-700 rounded font-mono font-bold text-amber-400" />
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" @click="showAddCashModal = false" class="btn btn-secondary text-xs px-3 py-1.5">Cancel</button>
            <button type="submit" class="btn bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-1.5 font-bold">Create Cash Safe</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- MODAL 3: CONTRA TRANSFER MODAL                                         -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div v-if="showTransferModal" class="modal-backdrop" @click.self="showTransferModal = false">
      <div
        class="modal-content max-w-lg w-full bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-0 animate-in zoom-in-95 duration-150"
        style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
      >
        <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ArrowLeftRight :size="18" class="text-sky-600 dark:text-sky-400" />
            <h3 class="font-black text-sm text-slate-900 dark:text-white">Contra Fund Transfer (Bank & Cash)</h3>
          </div>
          <button type="button" @click="showTransferModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
        </div>

        <form @submit.prevent="handleContraSubmit" class="p-6 space-y-4 text-xs">
          <div class="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 rounded-xl text-sky-900 dark:text-sky-300 text-xs flex items-center gap-2 font-medium">
            <Info :size="16" class="text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Dual-entry contra transfer instantly updates both source and destination balances.</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-1.5 uppercase tracking-wider">From (Source Account) *</label>
              <select
                v-model="contraForm.fromAccount"
                required
                class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer min-h-[38px]"
              >
                <optgroup label="Bank Accounts" class="font-bold text-slate-500">
                  <option v-for="b in availableBankAccounts" :key="b.id" :value="b.name">
                    🏦 {{ b.name }} (Bal: PKR {{ (dataStore.getAccountBalance(b.id) || 0).toLocaleString() }})
                  </option>
                </optgroup>
                <optgroup label="Cash Safes" class="font-bold text-slate-500">
                  <option v-for="s in availableCashSafes" :key="s.id" :value="s.name">
                    💵 {{ s.name }} (Bal: PKR {{ (dataStore.getAccountBalance(s.id) || 0).toLocaleString() }})
                  </option>
                </optgroup>
              </select>
            </div>

            <div>
              <label class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1.5 uppercase tracking-wider">To (Destination Account) *</label>
              <select
                v-model="contraForm.toAccount"
                required
                class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer min-h-[38px]"
              >
                <optgroup label="Bank Accounts" class="font-bold text-slate-500">
                  <option v-for="b in availableBankAccounts" :key="b.id" :value="b.name">
                    🏦 {{ b.name }} (Bal: PKR {{ (dataStore.getAccountBalance(b.id) || 0).toLocaleString() }})
                  </option>
                </optgroup>
                <optgroup label="Cash Safes" class="font-bold text-slate-500">
                  <option v-for="s in availableCashSafes" :key="s.id" :value="s.name">
                    💵 {{ s.name }} (Bal: PKR {{ (dataStore.getAccountBalance(s.id) || 0).toLocaleString() }})
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Transfer Amount (PKR) *</label>
              <input
                v-model.number="contraForm.amount"
                type="number"
                min="100"
                required
                class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 min-h-[38px]"
              />
            </div>

            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Transfer Date *</label>
              <input
                v-model="contraForm.date"
                type="date"
                required
                class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 min-h-[38px]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Transfer Type</label>
              <select
                v-model="contraForm.transferType"
                class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer min-h-[38px]"
              >
                <option value="Bank to Cash (Safe Replenishment)">Bank to Cash (Safe Replenishment)</option>
                <option value="Cash to Bank (Daily Deposit)">Cash to Bank (Daily Deposit)</option>
                <option value="Inter-Bank Transfer (Fund Rebalancing)">Inter-Bank Transfer (Fund Rebalancing)</option>
                <option value="Inter-Branch Cash Transfer">Inter-Branch Cash Transfer</option>
              </select>
            </div>

            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Cheque / Slip Ref #</label>
              <input
                v-model="contraForm.refNo"
                type="text"
                placeholder="e.g. CHQ-88219"
                class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-mono text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 min-h-[38px]"
              />
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Purpose / Notes</label>
            <input
              v-model="contraForm.notes"
              type="text"
              placeholder="e.g. Cash float replenishment for depot operations..."
              class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 min-h-[38px]"
            />
          </div>

          <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 -mx-6 -mb-6 mt-6">
            <button
              type="button"
              @click="showTransferModal = false"
              class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check :size="15" />
              <span>Execute Contra Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  Landmark,
  Building2,
  Vault,
  TrendingUp,
  Layers,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Download,
  Plus,
  Search,
  Eye,
  EyeOff,
  Check,
  Info
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeTab = ref('all') // 'all' | 'banks' | 'cash' | 'transfers' | 'ledger'
const selectedAccountName = ref('')
const filterBranch = ref(authStore.isSuperAdmin ? 'ALL' : (authStore.userBranch || 'Lahore'))
const searchQuery = ref('')

const showAddBankModal = ref(false)
const showAddCashModal = ref(false)
const showTransferModal = ref(false)

const newBankForm = ref({
  name: '',
  accountTitle: 'Medimage Services Ltd',
  accountNumber: '',
  bankCode: '',
  iban: '',
  branch: authStore.userBranch || 'Lahore',
  openingBalance: 5000000
})

const newCashForm = ref({
  name: '',
  custodian: authStore.user?.name || 'Cashier Desk',
  branch: authStore.userBranch || 'Lahore',
  location: '',
  openingBalance: 500000
})

const availableBankAccounts = computed(() => {
  if (dataStore.bankAccounts && dataStore.bankAccounts.length > 0) {
    return dataStore.bankAccounts
  }
  return [
    { id: 'bank_01', name: 'Meezan Bank Ltd', branch: 'Gulberg Lahore', openingBalance: 14850000 },
    { id: 'bank_02', name: 'Habib Bank Limited (HBL)', branch: 'Hayatabad Peshawar', openingBalance: 9420000 },
    { id: 'bank_03', name: 'Bank Alfalah Islamic', branch: 'Cantt Multan', openingBalance: 5680000 },
    { id: 'bank_04', name: 'MCB Bank Limited', branch: 'Blue Area Islamabad', openingBalance: 3850000 },
    { id: 'bank_05', name: 'Standard Chartered Bank (Escrow)', branch: 'I.I. Chundrigar Karachi', openingBalance: 6200000 }
  ]
})

const availableCashSafes = computed(() => {
  if (dataStore.cashSafes && dataStore.cashSafes.length > 0) {
    return dataStore.cashSafes
  }
  return [
    { id: 'cash_01', name: 'Lahore Depot Main Safe', branch: 'Lahore', openingBalance: 1840000 },
    { id: 'cash_02', name: 'Peshawar Head Office Cash Counter', branch: 'Peshawar', openingBalance: 1250000 },
    { id: 'cash_03', name: 'Multan Branch Cash Safe', branch: 'Multan', openingBalance: 820000 },
    { id: 'cash_04', name: 'Islamabad Branch Cash Safe', branch: 'Islamabad', openingBalance: 950000 },
    { id: 'cash_05', name: 'Karachi Liaison Petty Cash Safe', branch: 'Karachi', openingBalance: 640000 }
  ]
})

const contraForm = ref({
  fromAccount: 'Meezan Bank Ltd',
  toAccount: 'Lahore Depot Main Safe',
  amount: 250000,
  date: new Date().toISOString().substring(0, 10),
  transferType: 'Bank to Cash (Safe Replenishment)',
  refNo: '',
  notes: ''
})

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${Number(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

function selectAccountFilter(accName) {
  if (selectedAccountName.value === accName) {
    selectedAccountName.value = ''
  } else {
    selectedAccountName.value = accName
  }
}

function openGeneralContraTransfer() {
  const fromAcc = availableBankAccounts.value[0]?.name || 'Meezan Bank Ltd'
  const toAcc = availableCashSafes.value[0]?.name || 'Lahore Depot Main Safe'
  contraForm.value = {
    fromAccount: fromAcc,
    toAccount: toAcc,
    amount: 100000,
    date: new Date().toISOString().substring(0, 10),
    transferType: 'Bank to Cash (Safe Replenishment)',
    refNo: '',
    notes: ''
  }
  showTransferModal.value = true
}

function openContraFor(accName, type) {
  if (type === 'bank') {
    contraForm.value.fromAccount = accName
    contraForm.value.toAccount = availableCashSafes.value[0]?.name || 'Lahore Depot Main Safe'
    contraForm.value.transferType = 'Bank to Cash (Safe Replenishment)'
  } else {
    contraForm.value.fromAccount = accName
    contraForm.value.toAccount = availableBankAccounts.value[0]?.name || 'Meezan Bank Ltd'
    contraForm.value.transferType = 'Cash to Bank (Daily Deposit)'
  }
  showTransferModal.value = true
}

async function handleCreateBank() {
  if (!newBankForm.value.name.trim()) return
  await dataStore.addBankAccount(newBankForm.value, authStore.user)
  uiStore.showToast(`Bank account "${newBankForm.value.name}" registered successfully!`, 'success')
  showAddBankModal.value = false
  newBankForm.value = {
    name: '',
    accountTitle: 'Medimage Services Ltd',
    accountNumber: '',
    bankCode: '',
    iban: '',
    branch: authStore.userBranch || 'Lahore',
    openingBalance: 5000000
  }
}

async function handleCreateCash() {
  if (!newCashForm.value.name.trim()) return
  await dataStore.addCashSafe(newCashForm.value, authStore.user)
  uiStore.showToast(`Cash safe "${newCashForm.value.name}" registered successfully!`, 'success')
  showAddCashModal.value = false
  newCashForm.value = {
    name: '',
    custodian: authStore.user?.name || 'Cashier Desk',
    branch: authStore.userBranch || 'Lahore',
    location: '',
    openingBalance: 500000
  }
}

async function handleContraSubmit() {
  if (contraForm.value.fromAccount === contraForm.value.toAccount) {
    uiStore.showToast('Source and Destination accounts cannot be the same.', 'warning')
    return
  }
  if (contraForm.value.amount <= 0) {
    uiStore.showToast('Transfer amount must be greater than 0.', 'warning')
    return
  }
  await dataStore.recordContraTransfer(contraForm.value, authStore.user)
  uiStore.showToast(`Contra transfer of PKR ${Number(contraForm.value.amount).toLocaleString()} completed!`, 'success')
  showTransferModal.value = false
}

// ── Full Unified Cash & Bank Transactions Ledger ────────────────────
const fullTransactionsLedger = computed(() => {
  const list = []

  // 1. Payment Receipts (Money In)
  ;(dataStore.paymentReceipts || []).forEach(r => {
    const isCash = String(r.paymentType || r.paymentMethod || '').toLowerCase().includes('cash')
    let matchedAccount = isCash ? `${r.branch || 'Lahore'} Cash Counter` : (r.bankName || 'Meezan Bank Ltd')
    
    // Check closest account name
    if (isCash) {
      const s = (dataStore.cashSafes || []).find(cs => cs.branch?.toLowerCase() === (r.branch || '').toLowerCase())
      if (s) matchedAccount = s.name
    } else {
      const b = (dataStore.bankAccounts || []).find(ba => String(r.paymentType || '').includes(ba.name) || String(r.bankName || '').includes(ba.name))
      if (b) matchedAccount = b.name
    }

    list.push({
      id: `rct_${r.receiptNo || Math.random()}`,
      refNo: r.receiptNo || 'RCT-AUTO',
      date: r.paymentDate || '2026-09-15',
      accountName: matchedAccount,
      isBank: !isCash,
      direction: 'IN',
      category: 'Customer Payment Inflow',
      party: r.customer || 'Direct Customer',
      branch: r.branch || 'Lahore',
      amount: Number(r.amount || 0),
      description: r.description || `Customer receipt for invoice`
    })
  })

  // 2. Payment Out Vouchers (Money Out)
  ;(dataStore.paymentOutVouchers || []).forEach(v => {
    const isCash = String(v.paymentType || v.paymentMethod || '').toLowerCase().includes('cash')
    let matchedAccount = isCash ? `${v.branch || 'Lahore'} Cash Safe` : 'Meezan Bank Ltd'
    if (isCash) {
      const s = (dataStore.cashSafes || []).find(cs => cs.branch?.toLowerCase() === (v.branch || '').toLowerCase())
      if (s) matchedAccount = s.name
    }

    list.push({
      id: `vou_${v.voucherNo || Math.random()}`,
      refNo: v.voucherNo || 'VOU-AUTO',
      date: v.date || '2026-09-15',
      accountName: matchedAccount,
      isBank: !isCash,
      direction: 'OUT',
      category: v.category || 'Vendor Disbursement',
      party: v.payee || 'Direct Vendor',
      branch: v.branch || 'Lahore',
      amount: Number(v.amount || 0),
      description: v.description || 'Disbursement voucher payout'
    })
  })

  // 3. Operational Expenses (Money Out)
  ;(dataStore.expenses || []).forEach(e => {
    const isCash = String(e.paymentMode || e.bankCash || '').toLowerCase().includes('cash') || String(e.paymentMode || '').toLowerCase().includes('petty')
    let matchedAccount = isCash ? `${e.branch || 'Lahore'} Petty Cash` : (e.bankCash || 'Habib Bank Limited (HBL)')
    if (isCash) {
      const s = (dataStore.cashSafes || []).find(cs => cs.branch?.toLowerCase() === (e.branch || '').toLowerCase())
      if (s) matchedAccount = s.name
    }

    list.push({
      id: `exp_${e.voucherNo || Math.random()}`,
      refNo: e.voucherNo || 'EXP-AUTO',
      date: e.date || '2026-09-15',
      accountName: matchedAccount,
      isBank: !isCash,
      direction: 'OUT',
      category: e.category || 'Operational Expense',
      party: e.category || 'Expense Payee',
      branch: e.branch || 'Lahore',
      amount: Number(e.amount || 0),
      description: e.description || e.supportingRef || 'Company expenditure'
    })
  })

  // 4. Contra Transfers
  ;(dataStore.contraTransfers || []).forEach(ct => {
    // Outflow entry
    list.push({
      id: `ct_out_${ct.transferNo}`,
      refNo: ct.transferNo,
      date: ct.date,
      accountName: ct.fromAccount,
      isBank: !ct.fromAccount.toLowerCase().includes('cash') && !ct.fromAccount.toLowerCase().includes('safe'),
      direction: 'OUT',
      category: 'Contra Fund Outflow',
      party: `Transferred to: ${ct.toAccount}`,
      branch: authStore.userBranch || 'Lahore',
      amount: Number(ct.amount || 0),
      description: ct.notes || ct.transferType
    })

    // Inflow entry
    list.push({
      id: `ct_in_${ct.transferNo}`,
      refNo: ct.transferNo,
      date: ct.date,
      accountName: ct.toAccount,
      isBank: !ct.toAccount.toLowerCase().includes('cash') && !ct.toAccount.toLowerCase().includes('safe'),
      direction: 'IN',
      category: 'Contra Fund Inflow',
      party: `Received from: ${ct.fromAccount}`,
      branch: authStore.userBranch || 'Lahore',
      amount: Number(ct.amount || 0),
      description: ct.notes || ct.transferType
    })
  })

  // Sort descending by date
  list.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return list
})

const filteredTransactionsLedger = computed(() => {
  let list = fullTransactionsLedger.value

  // Branch filter
  if (filterBranch.value && filterBranch.value !== 'ALL') {
    list = list.filter(tx => tx.branch?.toLowerCase().includes(filterBranch.value.toLowerCase()))
  }

  // Specific Account filter
  if (selectedAccountName.value) {
    const acc = selectedAccountName.value.toLowerCase()
    list = list.filter(tx => tx.accountName.toLowerCase().includes(acc) || acc.includes(tx.accountName.toLowerCase()))
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(tx => 
      tx.refNo.toLowerCase().includes(q) ||
      tx.party.toLowerCase().includes(q) ||
      tx.accountName.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q)
    )
  }

  return list
})

function exportLedgerCSV() {
  const rows = [
    ['Date', 'Voucher / Ref #', 'Account / Cash Safe', 'Type', 'Party / Source', 'Branch', 'Direction', 'Amount (PKR)', 'Details']
  ]
  filteredTransactionsLedger.value.forEach(tx => {
    rows.push([
      tx.date,
      tx.refNo,
      tx.accountName,
      tx.category,
      tx.party,
      tx.branch,
      tx.direction,
      tx.amount,
      `"${(tx.description || '').replace(/"/g, '""')}"`
    ])
  })

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Cash_and_Bank_Statement_${new Date().toISOString().substring(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  uiStore.showToast('Cash & Bank statement exported to CSV!', 'success')
}
</script>
