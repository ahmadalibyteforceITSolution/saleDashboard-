<template>
  <div class="page-wrapper space-y-5">
    <!-- ═══════════════════════════════════════════════════════
      TOP COMMAND HEADER — Multi-Branch & Diagnostics Hub
    ═══════════════════════════════════════════════════════ -->
    <div class="glass-panel p-5 border-l-4 border-emerald-500 shadow-md relative overflow-hidden">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="badge badge-emerald font-mono text-[10px]">WORKSHOP ERP ENTERPRISE</span>
            <span class="badge badge-purple font-mono text-[10px]">10-STAGE REPAIR PIPELINE</span>
            <span class="badge badge-info font-mono text-[10px] flex items-center gap-1">
              <Building2 :size="11" />
              <span>{{ activeBranchFilter }}</span>
            </span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 mt-2">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-md">
              <Wrench :size="22" />
            </div>
            <span>Workshop Management, Diagnostics & Spare Parts Hub</span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-4xl leading-relaxed">
            Customer Machine Receiving • Fault Diagnosis • China Spare Parts Inward • Location Rack/Shelf Tracking • Auto Stock Deduction • Delivery Challan (DC) • Invoices & Ledger • 360° Lifetime History.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          <!-- Multi-Branch Selector -->
          <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 shadow-sm min-h-[38px]">
            <Building2 :size="15" class="text-purple-500 shrink-0" />
            <span class="text-xs text-slate-600 dark:text-slate-300 font-semibold">Branch:</span>
            <select
              v-model="dataStore.activeBranchFilter"
              class="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option v-for="b in dataStore.branches" :key="b" :value="b" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                {{ b }}
              </option>
            </select>
          </div>

          <!-- View / Hide Balance Toggle -->
          <button
            @click="authStore.toggleBalance()"
            :class="[
              'btn font-bold flex items-center gap-1.5 h-9 px-3 text-xs shadow-sm transition-all shrink-0',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-700 dark:text-slate-300' : 'btn-warning text-white'
            ]"
            :title="authStore.isBalanceVisible ? 'Hide Financial Balances' : 'Show Financial Balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="14" />
            <Eye v-else :size="14" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View Balance' }}</span>
          </button>

          <!-- Primary Actions -->
          <button
            @click="openNewJobCardModal"
            class="btn btn-primary text-xs h-9 px-3.5 font-bold flex items-center gap-1.5 shadow-md shrink-0"
          >
            <Plus :size="15" />
            <span>Receive Machine / Job Card</span>
          </button>

          <button
            @click="openNewInwardModal"
            class="btn btn-secondary text-xs h-9 px-3 font-bold flex items-center gap-1.5 shadow-sm text-amber-600 dark:text-amber-400 shrink-0"
          >
            <PackagePlus :size="15" />
            <span>Inward China Parts</span>
          </button>

          <button
            @click="openNewPartModal"
            class="btn btn-secondary text-xs h-9 px-3 font-bold flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus :size="15" class="text-teal-500 dark:text-teal-400" />
            <span>Add Spare Part</span>
          </button>
        </div>
      </div>

      <!-- Quick Operational Status Strip -->
      <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span>Diagnostic Lab Status: <strong class="text-slate-900 dark:text-white font-mono">100% Operational</strong></span>
          </span>
          <span class="text-slate-400 hidden sm:inline">•</span>
          <span class="flex items-center gap-1.5">
            <Users :size="13" class="text-purple-500 shrink-0" />
            <span>Lead Engineer: <strong class="text-slate-900 dark:text-white">Engr. Tariq Saeed (Senior Specialist)</strong></span>
          </span>
          <span class="text-slate-400 hidden sm:inline">•</span>
          <span class="flex items-center gap-1.5">
            <Boxes :size="13" class="text-teal-500 shrink-0" />
            <span>Parts Inventory: <strong class="text-slate-900 dark:text-white font-mono">{{ totalSparePartsStock }} Qty Available</strong></span>
          </span>
        </div>
        <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          Sync Status: <strong class="text-emerald-600 dark:text-emerald-400">Live Realtime Pinia + Mongo</strong>
        </span>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      EXECUTIVE MODULE NAVIGATION TABS
    ═══════════════════════════════════════════════════════ -->
    <div class="glass-panel p-2 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
      <button
        v-for="t in workshopNavTabs"
        :key="t.id"
        @click="selectTab(t.id)"
        :class="[
          'px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0',
          activeTab === t.id
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/25 border border-emerald-500'
            : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        ]"
      >
        <component :is="t.icon" :size="15" />
        <span>{{ t.label }}</span>
        <span
          v-if="t.badge !== undefined && t.badge !== null"
          :class="[
            'px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ml-0.5',
            activeTab === t.id
              ? 'bg-black/25 text-white'
              : (t.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700')
          ]"
        >
          {{ t.badge }}
        </span>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 1: WORKSHOP DASHBOARD
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'dashboard'" class="space-y-5 animate-fade-in">
      <!-- ════════════════════════════════════════════
        EXECUTIVE WORKSHOP KPI COMMAND STRIP (DUAL-TIER)
      ════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <!-- Card 1: Machines In Workshop -->
        <div class="glass-panel p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/70 via-white to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3 group">
          <div class="min-w-0 flex-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block truncate">
              Machines In Workshop
            </span>
            <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 tracking-tight">
              {{ activeWorkshopMachinesCount }} <span class="text-xs font-semibold text-slate-500 font-sans">Units</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
              <span class="truncate">{{ dataStore.workshopJobCards.length }} lifetime tickets</span>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-inner group-hover:scale-105 transition-transform">
            <Wrench :size="22" />
          </div>
        </div>

        <!-- Card 2: In Repair / Diagnostic -->
        <div class="glass-panel p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/70 via-white to-white dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3 group">
          <div class="min-w-0 flex-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block truncate">
              In Repair / Diagnostic
            </span>
            <div class="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 tracking-tight">
              {{ inProcessJobsCount }} <span class="text-xs font-semibold text-slate-500 font-sans">Jobs</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 dark:text-amber-400">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse"></span>
              <span class="truncate">{{ waitingForPartsCount }} waiting for parts</span>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner group-hover:scale-105 transition-transform">
            <Clock :size="22" />
          </div>
        </div>

        <!-- Card 3: Ready for Delivery -->
        <div class="glass-panel p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/70 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3 group">
          <div class="min-w-0 flex-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block truncate">
              Ready for Delivery
            </span>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 tracking-tight">
              {{ readyForDeliveryCount }} <span class="text-xs font-semibold text-slate-500 font-sans">Ready</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span class="truncate">{{ deliveredJobsCount }} delivered & handed over</span>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-inner group-hover:scale-105 transition-transform">
            <CheckCircle2 :size="22" />
          </div>
        </div>

        <!-- Card 4: Low Stock Alert -->
        <div class="glass-panel p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-gradient-to-br from-rose-50/70 via-white to-white dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3 group">
          <div class="min-w-0 flex-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block truncate">
              Low Stock Alerts
            </span>
            <div class="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1 tracking-tight">
              {{ lowStockPartsCount }} <span class="text-xs font-semibold text-slate-500 font-sans">Items</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span class="truncate">Requires replenishment</span>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-inner group-hover:scale-105 transition-transform">
            <AlertTriangle :size="22" />
          </div>
        </div>

        <!-- Card 5: Spare Parts Stock -->
        <div class="glass-panel p-4 rounded-2xl border border-teal-200/80 dark:border-teal-900/50 bg-gradient-to-br from-teal-50/70 via-white to-white dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-900 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3 group">
          <div class="min-w-0 flex-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block truncate">
              Spare Parts in Racks
            </span>
            <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 tracking-tight">
              {{ totalSparePartsStock }} <span class="text-xs font-semibold text-slate-500 font-sans">Qty</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-teal-600 dark:text-teal-400">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
              <span class="truncate">{{ dataStore.workshopSpareParts.length }} unique parts in racks</span>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20 shadow-inner group-hover:scale-105 transition-transform">
            <Boxes :size="22" />
          </div>
        </div>

        <!-- Card 6: Warranty vs Paid -->
        <div class="glass-panel p-4 rounded-2xl border border-sky-200/80 dark:border-sky-900/50 bg-gradient-to-br from-sky-50/70 via-white to-white dark:from-sky-950/30 dark:via-slate-900 dark:to-slate-900 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3 group">
          <div class="min-w-0 flex-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 block truncate">
              Warranty vs Paid
            </span>
            <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 tracking-tight">
              {{ warrantyJobsCount }} <span class="text-xs font-semibold text-slate-400 font-sans">Free</span> / {{ nonWarrantyJobsCount }} <span class="text-xs font-semibold text-slate-400 font-sans">Paid</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-sky-600 dark:text-sky-400">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
              <span class="truncate">Active warranty coverage</span>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20 shadow-inner group-hover:scale-105 transition-transform">
            <ShieldCheck :size="22" />
          </div>
        </div>

        <!-- Card 7: Revenue Collected -->
        <div class="glass-panel p-4 rounded-2xl border border-green-200/80 dark:border-green-900/50 bg-gradient-to-br from-green-50/70 via-white to-white dark:from-green-950/30 dark:via-slate-900 dark:to-slate-900 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3 group">
          <div class="min-w-0 flex-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400 block truncate">
              Revenue Collected
            </span>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 tracking-tight">
              {{ formatBalance(totalWorkshopRevenue, 'PKR ') }}
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span class="truncate">Service & parts payments</span>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-inner group-hover:scale-105 transition-transform">
            <Banknote :size="22" />
          </div>
        </div>

        <!-- Card 8: Total Outstanding -->
        <div class="glass-panel p-4 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/70 via-white to-white dark:from-purple-950/30 dark:via-slate-900 dark:to-slate-900 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3 group">
          <div class="min-w-0 flex-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block truncate">
              Total Outstanding
            </span>
            <div class="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1 tracking-tight">
              {{ formatBalance(totalWorkshopOutstanding, 'PKR ') }}
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
              <span class="truncate">Pending customer recovery</span>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 shadow-inner group-hover:scale-105 transition-transform">
            <Receipt :size="22" />
          </div>
        </div>
      </div>

      <!-- Live Workshop Active Pipeline -->
      <div class="glass-panel p-4 sm:p-5 rounded-2xl shadow-md space-y-4 border border-slate-200 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Activity :size="18" />
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  Current Workshop Machines in Progress (Live Pipeline)
                </h3>
                <span class="badge badge-emerald font-mono text-[10px]">
                  {{ activeWorkshopJobs.length }} Active on Bench
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time operational snapshot of machines across inspection, diagnosis, parts installation, and QC clearance.
              </p>
            </div>
          </div>
          <button @click="selectTab('jobs')" class="btn btn-secondary text-xs flex items-center gap-1.5 font-bold shrink-0">
            <span>View All Job Cards</span>
            <ArrowRight :size="13" />
          </button>
        </div>

        <div v-if="activeWorkshopJobs.length > 0" class="table-container shadow-inner">
          <table class="table-lined text-xs">
            <thead>
              <tr>
                <th>Job Card #</th>
                <th>Receiving Date</th>
                <th>Customer</th>
                <th>Machine & Model</th>
                <th>Serial Number</th>
                <th>Technician</th>
                <th>Warranty</th>
                <th>Current Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in activeWorkshopJobs.slice(0, 8)" :key="job.jobCardNo" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td class="font-mono font-bold text-primary whitespace-nowrap">
                  {{ job.jobCardNo }}
                </td>
                <td class="font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{{ job.receivingDate }}</td>
                <td class="font-bold text-slate-900 dark:text-white">
                  <div>{{ job.customerName }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{{ job.customerType }}</div>
                </td>
                <td>
                  <div class="font-bold text-slate-800 dark:text-slate-200">{{ job.machineName }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{{ job.brand }} {{ job.model }}</div>
                </td>
                <td class="font-mono font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                  <span class="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800/40">
                    {{ (job.serialNumber || '').replace(/^SN-/i, '') }}
                  </span>
                </td>
                <td class="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  <div class="font-bold text-xs text-slate-800 dark:text-slate-200">{{ formatTechnician(job.assignedTechnician).name }}</div>
                  <div v-if="formatTechnician(job.assignedTechnician).role" class="text-[10px] text-slate-400 font-normal">{{ formatTechnician(job.assignedTechnician).role }}</div>
                </td>
                <td class="whitespace-nowrap">
                  <span :class="['badge font-mono text-[10px] whitespace-nowrap', job.warrantyStatus === 'In Warranty' ? 'badge-success' : 'badge-neutral']">
                    {{ job.warrantyStatus }}
                  </span>
                </td>
                <td class="whitespace-nowrap">
                  <span :class="['badge font-mono text-[10px] whitespace-nowrap', getStatusBadgeClass(job.status)]">
                    {{ job.status }}
                  </span>
                </td>
                <td class="text-right whitespace-nowrap">
                  <button
                    @click="openJobDetailsModal(job)"
                    class="btn btn-xs btn-primary font-bold shadow-sm"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Executive Empty State (When bench is clear) -->
        <div v-else class="p-8 sm:p-12 text-center rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-250 dark:border-slate-800 space-y-3">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <CheckCircle2 :size="28" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">Workshop Benches are Currently Clear</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              All machines received have been repaired, cleared by QC, and delivered to customers. You can intake a new customer machine to begin diagnosis.
            </p>
          </div>
          <div class="pt-2">
            <button
              @click="openNewJobCardModal"
              class="btn btn-primary text-xs h-9 px-4 font-bold shadow-md inline-flex items-center gap-1.5"
            >
              <Plus :size="15" />
              <span>Receive Machine & Create Job Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 2: CUSTOMER JOB CARDS (REQUIREMENTS 2, 3, 10, 11, 12, 13, 14)
      Proper single-line unified toolbar with explicit element widths
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'jobs' || activeTab === 'claims' || activeTab === 'faulty'" class="space-y-4 animate-fade-in">
      <!-- PROPER PROFESSIONAL TOOLBAR ROW -->
      <div class="glass-panel p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          <!-- Search Input: Generous breathing room, never squished -->
          <div class="relative flex-1 min-w-[260px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              v-model="jobsSearch"
              type="text"
              placeholder="Search Job Card #, Serial, Customer, Machine..."
              class="form-input text-xs h-9 pl-9 pr-8 w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg"
            />
            <button
              v-if="jobsSearch"
              type="button"
              @click="jobsSearch = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
            >✕</button>
          </div>

          <!-- Filters & Action Buttons Group -->
          <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <!-- 10-Stage Dropdown -->
            <select
              v-model="jobsStatusFilter"
              class="form-select text-xs h-9 font-semibold px-2.5 rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white cursor-pointer shrink-0"
              style="width: 175px !important; min-width: 175px; max-width: 175px;"
            >
              <option value="ALL">All Stages (10 Stages)</option>
              <option value="Received">Received</option>
              <option value="Inspection">Inspection</option>
              <option value="Diagnosis">Diagnosis</option>
              <option value="Parts Required">Parts Required</option>
              <option value="Repair in Process">Repair in Process</option>
              <option value="Waiting for Parts">Waiting for Parts</option>
              <option value="Repaired">Repaired</option>
              <option value="QC/Testing">QC/Testing</option>
              <option value="Ready for Delivery">Ready for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Closed">Closed</option>
            </select>

            <!-- Customer Type Dropdown -->
            <select
              v-model="jobsCustomerTypeFilter"
              class="form-select text-xs h-9 font-semibold px-2.5 rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white cursor-pointer shrink-0"
              style="width: 160px !important; min-width: 160px; max-width: 160px;"
            >
              <option value="ALL">All Customer Types</option>
              <option value="Existing Company Customer">Existing Customer</option>
              <option value="Dealer">Dealer</option>
              <option value="Walk-in Customer">Walk-in Customer</option>
              <option value="Out Customer">Out Customer</option>
              <option value="Warranty Customer">Warranty Customer</option>
              <option value="Non-Warranty Customer">Non-Warranty Customer</option>
            </select>

            <!-- Technician Dropdown -->
            <select
              v-model="jobsTechnicianFilter"
              class="form-select text-xs h-9 font-semibold px-2.5 rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white cursor-pointer shrink-0"
              style="width: 150px !important; min-width: 150px; max-width: 150px;"
            >
              <option value="ALL">All Technicians</option>
              <option v-for="t in dataStore.workshopTechnicians" :key="t" :value="t">{{ t }}</option>
            </select>

            <!-- Action Buttons -->
            <button @click="printJobCardsRegistry" class="btn btn-secondary text-xs h-9 px-3 flex items-center gap-1.5 font-bold shrink-0 shadow-sm rounded-lg" title="Print Jobs Registry">
              <Printer :size="14" />
              <span>Print List</span>
            </button>
            <button @click="exportJobCardsExcel" class="btn btn-secondary text-xs h-9 px-3 flex items-center gap-1.5 font-bold shrink-0 shadow-sm rounded-lg">
              <FileSpreadsheet :size="14" class="text-emerald-500 dark:text-emerald-400" />
              <span>Excel</span>
            </button>
            <button @click="openNewJobCardModal" class="btn btn-primary text-xs h-9 px-3 flex items-center gap-1.5 font-bold shrink-0 shadow-md rounded-lg">
              <Plus :size="14" />
              <span>New Job Card</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Job Cards Table -->
      <div class="table-container glass-panel shadow-md">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>Job Card #</th>
              <th>Receiving Date</th>
              <th>Customer</th>
              <th>Machine & Model</th>
              <th>Serial Number</th>
              <th>Customer Complaint</th>
              <th>Technician</th>
              <th>Warranty</th>
              <th>Status</th>
              <th>DC / Invoice</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in paginatedJobCards" :key="job.jobCardNo" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="font-mono font-bold text-primary">
                {{ job.jobCardNo }}
              </td>
              <td class="font-mono text-slate-600 dark:text-slate-300">{{ job.receivingDate }}</td>
              <td class="font-bold text-slate-900 dark:text-white">
                <div>{{ job.customerName }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{{ job.customerPhone || job.customerType }}</div>
              </td>
              <td>
                <div class="font-bold text-slate-800 dark:text-slate-200">{{ job.machineName }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{{ job.brand }} {{ job.model }}</div>
              </td>
              <td class="font-mono font-bold text-sky-600 dark:text-sky-400">
                <span class="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800/40">
                  {{ (job.serialNumber || '').replace(/^SN-/i, '') }}
                </span>
              </td>
              <td class="text-slate-600 dark:text-slate-300 max-w-xs truncate" :title="job.customerComplaint">
                {{ job.customerComplaint || 'Standard diagnostic inspection' }}
              </td>
              <td class="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                <div class="font-bold text-xs text-slate-800 dark:text-slate-200">{{ formatTechnician(job.assignedTechnician).name }}</div>
                <div v-if="formatTechnician(job.assignedTechnician).role" class="text-[10px] text-slate-400 font-normal">{{ formatTechnician(job.assignedTechnician).role }}</div>
              </td>
              <td class="whitespace-nowrap">
                <span :class="['badge font-mono text-[10px] whitespace-nowrap', job.warrantyStatus === 'In Warranty' ? 'badge-success' : 'badge-neutral']">
                  {{ job.warrantyStatus }}
                </span>
              </td>
              <td class="whitespace-nowrap">
                <span :class="['badge font-mono text-[10px] whitespace-nowrap', getStatusBadgeClass(job.status)]">
                  {{ job.status }}
                </span>
              </td>
              <td class="whitespace-nowrap">
                <div class="flex flex-col gap-1 items-start whitespace-nowrap">
                  <span v-if="job.dcGenerated" class="badge badge-success text-[10px] font-mono whitespace-nowrap">DC: {{ job.dcNumber }}</span>
                  <span v-if="job.invoiceGenerated" class="badge badge-info text-[10px] font-mono whitespace-nowrap">INV: {{ job.invoiceNumber }}</span>
                  <span v-if="!job.dcGenerated && !job.invoiceGenerated" class="text-slate-400 text-[10px] italic">Pending</span>
                </div>
              </td>
              <td class="text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openEditJobCardModal(job)"
                    class="btn btn-xs btn-secondary text-amber-600 dark:text-amber-400 font-bold shadow-sm flex items-center gap-1"
                    title="Edit Job Card Intake Details"
                  >
                    <Pencil :size="12" />
                    <span>Edit</span>
                  </button>
                  <button
                    @click="openJobDetailsModal(job)"
                    class="btn btn-xs btn-primary font-bold shadow-sm"
                    title="Manage Job Card, Diagnosis & Labour"
                  >
                    Manage
                  </button>
                  <button
                    @click="printSingleJobCard(job)"
                    class="btn btn-xs btn-secondary shadow-sm"
                    title="Print Job Card"
                  >
                    <Printer :size="12" />
                  </button>
                  <button
                    @click="deleteJobCard(job)"
                    class="btn btn-xs btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Job Card"
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredJobCards.length === 0">
              <td colspan="11" class="text-center py-12 text-slate-400">
                <ClipboardList class="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <div class="font-bold text-sm text-slate-700 dark:text-slate-300">No Workshop Job Cards found in database.</div>
                <div class="text-xs text-slate-500 mt-1">Click "Receive Machine / Job Card" above to receive customer equipment.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <PaginationBar
        v-model="jobsPage"
        v-model:pageSize="jobsPageSize"
        :total-items="filteredJobCards.length"
      />
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 3: WORKSHOP SPARE PARTS INVENTORY (REQUIREMENTS 4, 16, 17)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'inventory' || activeTab === 'parts'" class="space-y-4 animate-fade-in">
      <div class="glass-panel p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="relative flex-1 min-w-[240px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              v-model="partsSearch"
              type="text"
              placeholder="Search Part Code, Name, Brand, Location..."
              class="form-input text-xs h-9 pl-9 pr-8 w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg"
            />
            <button
              v-if="partsSearch"
              type="button"
              @click="partsSearch = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
            >✕</button>
          </div>

          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <label class="flex items-center gap-2 h-9 px-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs font-bold cursor-pointer shrink-0">
              <input type="checkbox" v-model="partsLowStockOnly" class="rounded bg-white dark:bg-slate-900 border-slate-400 text-rose-500 focus:ring-0" />
              <span>Show Low Stock Only</span>
            </label>

            <button @click="openNewInwardModal" class="btn btn-secondary text-xs h-9 px-3 font-bold text-amber-600 dark:text-amber-400 shrink-0 shadow-sm rounded-lg">
              <PackagePlus :size="14" />
              <span>Receive Inward</span>
            </button>
            <button @click="openNewPartModal" class="btn btn-primary text-xs h-9 px-3 font-bold shrink-0 shadow-md rounded-lg">
              <Plus :size="14" />
              <span>New Spare Part</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Parts Inventory Table -->
      <div class="table-container glass-panel shadow-md">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>Part Code</th>
              <th>Part Name</th>
              <th>Brand / Model</th>
              <th>Rack Location</th>
              <th>Cabinet / Shelf</th>
              <th>Current Stock</th>
              <th>Min Alert</th>
              <th>Stock Status</th>
              <th>Purchase Cost</th>
              <th>Selling Price</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in filteredParts" :key="part.partCode" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="font-mono font-bold text-teal-600 dark:text-teal-400">
                {{ part.partCode }}
              </td>
              <td class="font-bold text-slate-900 dark:text-white">{{ part.partName || part.name }}</td>
              <td class="text-slate-600 dark:text-slate-300">{{ part.brand }} {{ part.model }}</td>
              <td class="font-mono text-purple-700 dark:text-purple-300 font-bold">
                <span class="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800/40">
                  {{ part.locationRack || part.location || 'Rack Main' }}
                </span>
              </td>
              <td class="font-mono text-slate-600 dark:text-slate-300">
                {{ part.locationCabinet || 'Cab 1' }} / {{ part.locationShelf || 'Shelf 1' }}
              </td>
              <td class="font-mono font-black text-slate-900 dark:text-white text-sm">
                {{ part.currentStock ?? part.stockQty ?? 0 }}
              </td>
              <td class="font-mono text-slate-500 dark:text-slate-400">{{ part.minimumStockLevel ?? part.minQty ?? 5 }}</td>
              <td>
                <span v-if="(part.currentStock ?? part.stockQty ?? 0) <= (part.minimumStockLevel ?? part.minQty ?? 5)" class="badge badge-danger font-mono text-[10px] animate-pulse">
                  🔴 LOW STOCK
                </span>
                <span v-else class="badge badge-success font-mono text-[10px]">
                  HEALTHY
                </span>
              </td>
              <td class="font-mono text-slate-600 dark:text-slate-300">PKR {{ (part.costPrice ?? part.purchasePrice ?? part.unitCost ?? 0).toLocaleString() }}</td>
              <td class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">PKR {{ (part.sellingPrice ?? part.unitCost ?? 0).toLocaleString() }}</td>
              <td class="text-right">
                <button
                  @click="deleteSparePart(part)"
                  class="btn btn-xs btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete Part"
                >
                  ✕
                </button>
              </td>
            </tr>
            <tr v-if="filteredParts.length === 0">
              <td colspan="11" class="text-center py-12 text-slate-400">
                <Cpu class="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <div class="font-bold text-sm text-slate-700 dark:text-slate-300">No Spare Parts registered in database.</div>
                <div class="text-xs text-slate-500 mt-1">Click "+ Inward China Parts" or "+ New Spare Part" to add parts into warehouse racks.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 4: PARTS RECEIVING / CHINA INWARD (REQUIREMENT 5)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'inward'" class="space-y-4 animate-fade-in">
      <div class="glass-panel p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes :size="18" class="text-amber-500" />
            <span>China & Supplier Inward Shipments Registry</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Incoming spare parts from China or local vendors. Stock quantities are automatically added into Workshop Racks.
          </p>
        </div>

        <button @click="openNewInwardModal" class="btn btn-primary text-xs h-9 px-3 font-bold flex items-center gap-1.5 shrink-0 shadow-md">
          <PackagePlus :size="14" />
          <span>+ Receive Inward Shipment</span>
        </button>
      </div>

      <div class="table-container glass-panel shadow-md">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>Inward #</th>
              <th>Receiving Date</th>
              <th>Supplier / Exporter</th>
              <th>Invoice #</th>
              <th>BL / Shipment Ref</th>
              <th>Parts Received</th>
              <th>Branch Destination</th>
              <th>Total Value (PKR)</th>
              <th>Received By</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inw in dataStore.workshopPartsInward" :key="inw.inwardNo" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="font-mono font-bold text-amber-600 dark:text-amber-400">{{ inw.inwardNo }}</td>
              <td class="font-mono text-slate-600 dark:text-slate-300">{{ inw.receivingDate }}</td>
              <td class="font-bold text-slate-900 dark:text-white">{{ inw.supplierName }}</td>
              <td class="font-mono text-blue-600 dark:text-blue-400">{{ inw.invoiceNo || 'N/A' }}</td>
              <td class="font-mono text-purple-700 dark:text-purple-300 font-bold">{{ inw.blReference || 'N/A' }}</td>
              <td>
                <span class="badge badge-info text-[10px] font-mono">
                  {{ (inw.parts || []).length }} Part Lines ({{ (inw.parts || []).reduce((sum, p) => sum + Number(p.quantity || 0), 0) }} total qty)
                </span>
              </td>
              <td class="text-slate-600 dark:text-slate-300">{{ inw.branch }}</td>
              <td class="font-mono font-bold text-emerald-600 dark:text-emerald-400">PKR {{ (Number(inw.totalAmount) || 0).toLocaleString() }}</td>
              <td class="text-slate-500 dark:text-slate-400">{{ inw.recordedBy }}</td>
              <td class="text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="printInwardShipmentInvoice(inw)"
                    class="btn btn-xs btn-secondary text-primary shadow-sm font-bold flex items-center gap-1"
                    title="Print GRN / Inward Invoice"
                  >
                    <Printer :size="12" />
                    <span>Print GRN</span>
                  </button>
                  <button
                    @click="exportInwardExcel(inw)"
                    class="btn btn-xs btn-secondary text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 shadow-sm"
                    title="Export Inward Shipment to Excel"
                  >
                    <FileSpreadsheet :size="12" />
                    <span>Excel</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="dataStore.workshopPartsInward.length === 0">
              <td colspan="10" class="text-center py-12 text-slate-400">
                <Boxes class="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <div class="font-bold text-sm text-slate-700 dark:text-slate-300">No China Inward Shipments recorded in database.</div>
                <div class="text-xs text-slate-500 mt-1">Click "+ Receive Inward Shipment" above to record a new shipment from China or local supplier.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 5: DISPATCH & DELIVERY CHALLANS (DC) SYSTEM
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'dispatch'" class="space-y-4 animate-fade-in">
      <div class="glass-panel p-4 border-l-4 border-indigo-500 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck :size="20" class="text-indigo-500" />
            <span>Machine Dispatch & Delivery Challans (DC) System</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage Cargo services (Daewoo, TCS, Leopard, Trax, Road Freight), track Bilty / Consignment numbers, add delivery charges, and print formal Delivery Challans.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="exportDispatchRegistryExcel"
            class="btn btn-xs btn-secondary text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 shadow-sm"
          >
            <FileSpreadsheet :size="13" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <!-- Dispatch KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="glass-panel p-3.5 border-l-4 border-amber-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Ready for Dispatch</div>
          <div class="text-lg font-mono font-black text-amber-500 mt-0.5">{{ readyForDispatchCount }} Units</div>
          <div class="text-[10px] text-slate-400">Repaired / In Testing</div>
        </div>
        <div class="glass-panel p-3.5 border-l-4 border-indigo-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Dispatched / In Transit</div>
          <div class="text-lg font-mono font-black text-indigo-500 mt-0.5">{{ dispatchedCount }} Units</div>
          <div class="text-[10px] text-slate-400">En route via Cargo / Courier</div>
        </div>
        <div class="glass-panel p-3.5 border-l-4 border-emerald-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Delivered & Closed</div>
          <div class="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{{ deliveredCount }} Units</div>
          <div class="text-[10px] text-slate-400">Customer Handover Complete</div>
        </div>
        <div class="glass-panel p-3.5 border-l-4 border-purple-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Total Delivery Charges</div>
          <div class="text-lg font-mono font-black text-purple-600 dark:text-purple-400 mt-0.5">PKR {{ totalDeliveryCharges.toLocaleString() }}</div>
          <div class="text-[10px] text-slate-400">Cargo & Shipping Billed</div>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="glass-panel p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 flex-1 max-w-md">
          <Search :size="15" class="text-slate-400" />
          <input
            v-model="dispatchSearch"
            type="text"
            placeholder="Search by DC #, Job Card #, Customer, Serial, Cargo, Bilty #..."
            class="form-input text-xs w-full bg-white dark:bg-slate-900"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-500 text-[11px] font-bold">Status:</span>
          <select v-model="dispatchStatusFilter" class="form-select text-xs h-8 font-semibold rounded-lg">
            <option value="ALL">All Dispatches</option>
            <option value="READY">Ready for Delivery</option>
            <option value="DISPATCHED">Dispatched / In Transit</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      <!-- Dispatch Table -->
      <div class="table-container glass-panel shadow-md">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>DC Number</th>
              <th>Job Card #</th>
              <th>Customer</th>
              <th>Machine & Serial</th>
              <th>Repaired By</th>
              <th>Cargo / Courier Service</th>
              <th>Tracking / Bilty #</th>
              <th>Delivery Charges</th>
              <th>Dispatch Date</th>
              <th>Receiver Contact</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in filteredDispatchJobs" :key="'disp-' + job.jobCardNo" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td>
                <span v-if="job.dcGenerated" class="badge badge-success font-mono font-bold text-[10px]">{{ job.dcNumber }}</span>
                <span v-else class="text-slate-400 font-mono text-[10px]">Pending DC</span>
              </td>
              <td class="font-mono font-bold text-primary">{{ job.jobCardNo }}</td>
              <td class="font-bold text-slate-900 dark:text-white">{{ job.customerName }}</td>
              <td>
                <div class="text-slate-800 dark:text-slate-200 font-medium">{{ job.machineName }}</div>
                <div class="font-mono text-sky-600 dark:text-sky-400 text-[10px]">{{ (job.serialNumber || '').replace(/^SN-/i, '') }}</div>
              </td>
              <td class="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                <div class="font-bold text-xs text-slate-800 dark:text-slate-200">{{ formatTechnician(job.repairedBy || job.assignedTechnician).name }}</div>
                <div v-if="formatTechnician(job.repairedBy || job.assignedTechnician).role" class="text-[10px] text-slate-400 font-normal">{{ formatTechnician(job.repairedBy || job.assignedTechnician).role }}</div>
              </td>
              <td>
                <span v-if="job.cargoService" class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Truck :size="12" class="text-indigo-400 shrink-0" />
                  <span>{{ job.cargoService }}</span>
                </span>
                <span v-else class="text-slate-400 text-[10px] italic">Not Dispatched</span>
              </td>
              <td class="font-mono font-bold text-purple-600 dark:text-purple-400">
                {{ job.trackingNo || '—' }}
              </td>
              <td class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                PKR {{ Number(job.deliveryCharges || 0).toLocaleString() }}
              </td>
              <td class="font-mono text-slate-500">
                {{ job.dispatchDate || job.deliveryDate || '—' }}
              </td>
              <td>
                <div class="text-slate-800 dark:text-slate-200">{{ job.receiverName || job.customerName }}</div>
                <div class="text-[10px] text-slate-400">{{ job.receiverPhone || job.customerPhone || '—' }}</div>
              </td>
              <td>
                <span :class="['badge font-mono text-[10px]', getDispatchBadgeClass(job)]">
                  {{ job.dispatchStatus || (job.status === 'Delivered' ? 'Delivered' : (job.dcGenerated ? 'Ready for Delivery' : 'In Workshop')) }}
                </span>
              </td>
              <td class="text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openDispatchModal(job)"
                    class="btn btn-xs btn-primary font-bold shadow-sm flex items-center gap-1"
                    title="Edit Shipment & Cargo Info"
                  >
                    <Truck :size="12" />
                    <span>Dispatch</span>
                  </button>
                  <button
                    v-if="job.dcGenerated"
                    @click="printDeliveryChallan(job)"
                    class="btn btn-xs btn-secondary shadow-sm font-bold flex items-center gap-1"
                    title="Print Delivery Challan"
                  >
                    <Printer :size="12" />
                    <span>DC</span>
                  </button>
                  <button
                    v-if="job.status !== 'Delivered'"
                    @click="quickMarkDelivered(job)"
                    class="btn btn-xs btn-outline border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20 font-bold"
                    title="Mark as Delivered to Customer"
                  >
                    ✓ Delivered
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDispatchJobs.length === 0">
              <td colspan="12" class="text-center py-10 text-slate-400">
                <Truck class="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <div class="font-bold text-sm text-slate-700 dark:text-slate-300">No dispatch records found.</div>
                <div class="text-xs text-slate-500 mt-1">Ready machines will appear here for cargo assignment and Delivery Challan generation.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 6: WORKSHOP INVOICES & BILLING MODULE
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'invoices' || activeTab === 'billing'" class="space-y-4 animate-fade-in">
      <div class="glass-panel p-4 border-l-4 border-blue-500 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt :size="20" class="text-blue-500" />
            <span>Workshop Repair Invoices & Billing Center</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official workshop tax invoices with itemized China spare parts, diagnostic labour charges, and cargo/delivery fees. All amounts automatically update customer ledger balance.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="exportWorkshopInvoicesExcel"
            class="btn btn-xs btn-secondary text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 shadow-sm"
          >
            <FileSpreadsheet :size="13" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <!-- Invoices KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="glass-panel p-3.5 border-l-4 border-blue-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Invoices Issued</div>
          <div class="text-lg font-mono font-black text-blue-500 mt-0.5">{{ totalInvoicesCount }} Invoices</div>
          <div class="text-[10px] text-slate-400">{{ dataStore.workshopJobCards.length }} Total Repair Tickets</div>
        </div>
        <div class="glass-panel p-3.5 border-l-4 border-indigo-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Total Invoiced Amount</div>
          <div class="text-lg font-mono font-black text-indigo-500 mt-0.5">PKR {{ totalInvoicedAmount.toLocaleString() }}</div>
          <div class="text-[10px] text-slate-400">Parts + Labour + Cargo</div>
        </div>
        <div class="glass-panel p-3.5 border-l-4 border-emerald-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Paid So Far</div>
          <div class="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">PKR {{ totalInvoicedPaid.toLocaleString() }}</div>
          <div class="text-[10px] text-slate-400">Collected into Ledger</div>
        </div>
        <div class="glass-panel p-3.5 border-l-4 border-rose-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Remaining Customer Due</div>
          <div class="text-lg font-mono font-black text-rose-600 dark:text-rose-400 mt-0.5">PKR {{ totalInvoicedRemaining.toLocaleString() }}</div>
          <div class="text-[10px] text-slate-400">Outstanding Workshop Receivables</div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="glass-panel p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 flex-1 max-w-md">
          <Search :size="15" class="text-slate-400" />
          <input
            v-model="invoicesSearch"
            type="text"
            placeholder="Search by Invoice #, Job Card #, Customer, Machine, Technician..."
            class="form-input text-xs w-full bg-white dark:bg-slate-900"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-500 text-[11px] font-bold">Payment Status:</span>
          <select v-model="invoiceStatusFilter" class="form-select text-xs h-8 font-semibold rounded-lg">
            <option value="ALL">All Invoices</option>
            <option value="UNPAID">Unpaid Only</option>
            <option value="PARTIAL">Partial Only</option>
            <option value="PAID">Fully Paid Only</option>
          </select>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="table-container glass-panel shadow-md">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Job Card #</th>
              <th>Customer</th>
              <th>Machine & Serial</th>
              <th>Repaired By</th>
              <th>Parts Cost</th>
              <th>Labour Charges</th>
              <th>Delivery / Cargo</th>
              <th>Grand Total</th>
              <th>Paid Amount</th>
              <th>Remaining Balance</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in filteredInvoiceJobs" :key="'inv-' + job.jobCardNo" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td>
                <span v-if="job.invoiceGenerated" class="badge badge-info font-mono font-bold text-[10px]">{{ job.invoiceNumber }}</span>
                <button v-else @click="openInvoiceModal(job)" class="btn btn-xs btn-primary text-[10px] font-bold">+ Create Inv</button>
              </td>
              <td class="font-mono font-bold text-primary">{{ job.jobCardNo }}</td>
              <td class="font-bold text-slate-900 dark:text-white">{{ job.customerName }}</td>
              <td>
                <div class="text-slate-800 dark:text-slate-200">{{ job.machineName }}</div>
                <div class="font-mono text-sky-600 dark:text-sky-400 text-[10px]">{{ (job.serialNumber || '').replace(/^SN-/i, '') }}</div>
              </td>
              <td class="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                <div class="font-bold text-xs text-slate-800 dark:text-slate-200">{{ formatTechnician(job.repairedBy || job.assignedTechnician).name }}</div>
                <div v-if="formatTechnician(job.repairedBy || job.assignedTechnician).role" class="text-[10px] text-slate-400 font-normal">{{ formatTechnician(job.repairedBy || job.assignedTechnician).role }}</div>
              </td>
              <td class="font-mono text-slate-600 dark:text-slate-300">
                PKR {{ ((job.partsUsed || []).reduce((s, p) => s + (Number(p.quantity || 1) * Number(p.unitPrice || 0)), 0)).toLocaleString() }}
              </td>
              <td class="font-mono text-slate-600 dark:text-slate-300">
                PKR {{ (Number(job.faultDiagnosis?.labourCharges || 0)).toLocaleString() }}
              </td>
              <td class="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                PKR {{ Number(job.deliveryCharges || 0).toLocaleString() }}
              </td>
              <td class="font-mono font-black text-slate-900 dark:text-white">
                PKR {{ (Number(job.totalInvoiceAmount || 0)).toLocaleString() }}
              </td>
              <td class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                PKR {{ (Number(job.paidAmount || 0)).toLocaleString() }}
              </td>
              <td class="font-mono font-bold text-rose-600 dark:text-rose-400">
                PKR {{ (Number(job.remainingBalance || 0)).toLocaleString() }}
              </td>
              <td>
                <span :class="['badge font-mono text-[10px]', job.paymentStatus === 'Paid' ? 'badge-success' : (job.paymentStatus === 'Partial' ? 'badge-warning' : 'badge-danger')]">
                  {{ job.paymentStatus || 'Unpaid' }}
                </span>
              </td>
              <td class="text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="job.invoiceGenerated"
                    @click="printWorkshopInvoice(job)"
                    class="btn btn-xs btn-secondary text-primary shadow-sm font-bold flex items-center gap-1"
                    title="Print Formal Invoice"
                  >
                    <Printer :size="12" />
                    <span>Print</span>
                  </button>
                  <button
                    @click="openInvoiceModal(job)"
                    class="btn btn-xs btn-secondary font-bold shadow-sm"
                    title="Adjust Invoice Charges & Cargo"
                  >
                    Edit
                  </button>
                  <button
                    v-if="Number(job.remainingBalance || 0) > 0"
                    @click="openPaymentModal(job)"
                    class="btn btn-xs btn-success font-bold shadow-sm flex items-center gap-1"
                    title="Record Payment"
                  >
                    <Banknote :size="12" />
                    <span>Pay</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInvoiceJobs.length === 0">
              <td colspan="13" class="text-center py-10 text-slate-400">
                <Receipt class="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <div class="font-bold text-sm text-slate-700 dark:text-slate-300">No workshop invoices found.</div>
                <div class="text-xs text-slate-500 mt-1">Create an invoice from any job card to calculate parts, labour, and cargo charges.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 7: WORKSHOP PAYMENTS & CUSTOMER LEDGER MODULE
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'payments'" class="space-y-4 animate-fade-in">
      <div class="glass-panel p-4 border-l-4 border-emerald-500 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Banknote :size="20" class="text-emerald-500" />
            <span>Workshop Payments & Customer Ledger Integration</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Collect customer payments for repairs, parts, and cargo fees. Every payment instantly updates cash/bank drawers and deducts from customer outstanding ledger.
          </p>
        </div>
      </div>

      <!-- Payment KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="glass-panel p-3.5 border-l-4 border-emerald-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Payments Collected</div>
          <div class="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">PKR {{ totalInvoicedPaid.toLocaleString() }}</div>
          <div class="text-[10px] text-slate-400">{{ allWorkshopPayments.length }} Receipts Issued</div>
        </div>
        <div class="glass-panel p-3.5 border-l-4 border-rose-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Pending Receivables</div>
          <div class="text-lg font-mono font-black text-rose-600 dark:text-rose-400 mt-0.5">PKR {{ totalInvoicedRemaining.toLocaleString() }}</div>
          <div class="text-[10px] text-slate-400">Total Uncollected Balance</div>
        </div>
        <div class="glass-panel p-3.5 border-l-4 border-blue-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Settled Repairs</div>
          <div class="text-lg font-mono font-black text-blue-600 dark:text-blue-400 mt-0.5">
            {{ dataStore.workshopJobCards.filter(j => j.paymentStatus === 'Paid').length }} Jobs
          </div>
          <div class="text-[10px] text-slate-400">Paid In Full (0 Balance)</div>
        </div>
        <div class="glass-panel p-3.5 border-l-4 border-amber-500 shadow-sm">
          <div class="text-[10px] font-bold text-slate-500 uppercase">Pending Jobs With Balance</div>
          <div class="text-lg font-mono font-black text-amber-500 mt-0.5">{{ unpaidJobsList.length }} Jobs</div>
          <div class="text-[10px] text-slate-400">Awaiting Customer Settlement</div>
        </div>
      </div>

      <!-- Section 1: Outstanding Invoices Requiring Payment -->
      <div v-if="unpaidJobsList.length > 0" class="glass-panel p-4 space-y-3 border-l-4 border-amber-500 shadow-sm">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
            <Clock :size="15" class="text-amber-500" />
            <span>Outstanding Repair Invoices Requiring Payment ({{ unpaidJobsList.length }})</span>
          </h4>
        </div>
        <div class="table-container">
          <table class="table-lined text-xs">
            <thead>
              <tr>
                <th>Job Card #</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Machine & Serial</th>
                <th>Repaired By</th>
                <th>Total Repair Cost</th>
                <th>Paid So Far</th>
                <th>Remaining Due</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in unpaidJobsList" :key="'due-' + job.jobCardNo">
                <td class="font-mono font-bold text-primary">{{ job.jobCardNo }}</td>
                <td class="font-mono text-slate-600 dark:text-slate-300">{{ job.invoiceNumber || 'Pending' }}</td>
                <td class="font-bold text-slate-900 dark:text-white">{{ job.customerName }}</td>
                <td>{{ job.machineName }} ({{ (job.serialNumber || '').replace(/^SN-/i, '') }})</td>
                <td class="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  <div class="font-bold text-xs text-slate-800 dark:text-slate-200">{{ formatTechnician(job.repairedBy || job.assignedTechnician).name }}</div>
                  <div v-if="formatTechnician(job.repairedBy || job.assignedTechnician).role" class="text-[10px] text-slate-400 font-normal">{{ formatTechnician(job.repairedBy || job.assignedTechnician).role }}</div>
                </td>
                <td class="font-mono font-bold">PKR {{ (Number(job.totalInvoiceAmount || 0)).toLocaleString() }}</td>
                <td class="font-mono text-emerald-600 dark:text-emerald-400">PKR {{ (Number(job.paidAmount || 0)).toLocaleString() }}</td>
                <td class="font-mono font-bold text-rose-600 dark:text-rose-400">PKR {{ (Number(job.remainingBalance || 0)).toLocaleString() }}</td>
                <td class="text-right">
                  <button @click="openPaymentModal(job)" class="btn btn-xs btn-success font-bold shadow-sm flex items-center gap-1 ml-auto">
                    <Banknote :size="12" />
                    <span>+ Receive Payment</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 2: Complete Payment History Ledger -->
      <div class="glass-panel p-4 space-y-3 border-l-4 border-emerald-500 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
              <Receipt :size="15" class="text-emerald-500" />
              <span>Workshop Payment Receipts History Ledger</span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">All customer payments collected for workshop service and repair tickets.</p>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="paymentsSearch"
              type="text"
              placeholder="Search receipts, customer, job..."
              class="form-input text-xs h-8 w-56 bg-white dark:bg-slate-900"
            />
            <select v-model="paymentMethodFilter" class="form-select text-xs h-8 font-semibold rounded-lg">
              <option value="ALL">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Online Transfer">Online Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="table-lined text-xs">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Job Card #</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Machine</th>
                <th>Repaired By</th>
                <th>Amount Paid</th>
                <th>Method</th>
                <th>Received By</th>
                <th>Notes</th>
                <th class="text-right">Voucher</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredWorkshopPayments" :key="'pr-' + p.receiptNo + '-' + p.date" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td class="font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ p.receiptNo }}</td>
                <td class="font-mono text-slate-500">{{ p.date }}</td>
                <td class="font-mono text-primary font-bold">{{ p.jobCardNo }}</td>
                <td class="font-mono text-slate-500">{{ p.invoiceNumber }}</td>
                <td class="font-bold text-slate-900 dark:text-white">{{ p.customerName }}</td>
                <td>{{ p.machineName }}</td>
                <td class="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  <div class="font-bold text-xs text-slate-800 dark:text-slate-200">{{ formatTechnician(p.repairedBy).name }}</div>
                  <div v-if="formatTechnician(p.repairedBy).role" class="text-[10px] text-slate-400 font-normal">{{ formatTechnician(p.repairedBy).role }}</div>
                </td>
                <td class="font-mono font-bold text-emerald-600 dark:text-emerald-400">PKR {{ Number(p.amount || 0).toLocaleString() }}</td>
                <td><span class="badge badge-info text-[10px] font-bold">{{ p.method }}</span></td>
                <td class="text-slate-600 dark:text-slate-400">{{ p.receivedBy }}</td>
                <td class="text-slate-500 italic text-[11px]">{{ p.notes || '—' }}</td>
                <td class="text-right">
                  <button @click="printPaymentReceiptSlip(p)" class="btn btn-xs btn-secondary font-bold shadow-sm" title="Print Receipt Slip">
                    <Printer :size="12" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredWorkshopPayments.length === 0">
                <td colspan="12" class="text-center py-8 text-slate-400">
                  <Banknote class="w-8 h-8 mx-auto text-slate-400 mb-1" />
                  <div>No payment receipts recorded yet.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 6: 360° LIFETIME MACHINE REPAIR HISTORY (REQUIREMENTS 7, 18)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'history' || activeTab === 'replacement'" class="space-y-5 animate-fade-in">
      <div class="glass-panel p-4 sm:p-5 shadow-sm space-y-3.5 border-l-4 border-purple-500">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History :size="20" class="text-purple-500" />
            <span>360° Lifetime Machine History & Repair Dossier</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search any Machine Serial Number or Machine Code to view its entire biography: Original Sale date, Customer, Warranty status, and all Workshop repair visits, faults diagnosed, parts replaced, and technicians.
          </p>
        </div>

        <div class="flex items-center gap-2 max-w-xl">
          <div class="relative flex-1">
            <Search class="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              v-model="historySearchSerial"
              @keyup.enter="searchMachineHistory"
              type="text"
              placeholder="Enter Machine Serial Number (e.g. SN-456, 123) or Machine Code..."
              class="form-input text-xs h-9 pl-8 pr-3 w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
            />
          </div>
          <button @click="searchMachineHistory" class="btn btn-primary text-xs h-9 px-4 font-bold shrink-0 shadow-md">
            Search History
          </button>
        </div>
      </div>

      <!-- Lifetime History Result Dossier -->
      <div v-if="searchedHistoryResult" class="glass-panel p-5 shadow-md space-y-5 animate-fade-in border border-purple-200 dark:border-purple-800/40">
        <!-- Machine Identity Banner -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-purple font-mono text-xs">MACHINE PASSPORT</span>
              <span class="font-mono font-black text-lg text-sky-600 dark:text-sky-400">
                SN: {{ (searchedHistoryResult.serialNumber || '').replace(/^SN-/i, '') }}
              </span>
              <span v-if="searchedHistoryResult.registeredSerial?.machineCode" class="font-mono font-bold text-purple-600 dark:text-purple-400">
                ({{ searchedHistoryResult.registeredSerial.machineCode }})
              </span>
            </div>
            <div class="text-slate-900 dark:text-white font-bold text-base mt-1">
              {{ searchedHistoryResult.registeredSerial?.productName || 'Equipment Unit' }}
            </div>
            <div class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Customer: <strong class="text-slate-900 dark:text-white">{{ searchedHistoryResult.registeredSerial?.customer || searchedHistoryResult.sale?.customer || 'N/A' }}</strong> • 
              Branch: <strong class="text-slate-900 dark:text-white">{{ searchedHistoryResult.registeredSerial?.branch || 'Peshawar' }}</strong>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button @click="printMachineHistoryDossier" class="btn btn-secondary text-xs h-9 px-3 font-bold flex items-center gap-1.5 shadow-sm">
              <Printer :size="14" />
              <span>Print Lifetime Dossier</span>
            </button>
          </div>
        </div>

        <!-- 4 Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Total Workshop Visits</div>
            <div class="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">{{ searchedHistoryResult.totalRepairsCount }} Visits</div>
          </div>
          <div class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Spare Parts Installed</div>
            <div class="text-lg font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">{{ searchedHistoryResult.totalPartsInstalled }} Parts</div>
          </div>
          <div class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Total Repair Billed</div>
            <div class="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">PKR {{ searchedHistoryResult.totalBilled.toLocaleString() }}</div>
          </div>
          <div class="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Outstanding Balance</div>
            <div class="text-lg font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">PKR {{ searchedHistoryResult.totalOutstanding.toLocaleString() }}</div>
          </div>
        </div>

        <!-- Chronological Repair Log -->
        <div class="space-y-3.5">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock :size="15" class="text-purple-500" />
            <span>Chronological Workshop Jobs & Service Timeline</span>
          </h4>

          <div v-for="job in searchedHistoryResult.jobCards" :key="job.jobCardNo" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-primary">{{ job.jobCardNo }}</span>
                <span class="text-xs text-slate-500 dark:text-slate-400">Received on: <strong class="text-slate-800 dark:text-white">{{ job.receivingDate }}</strong></span>
                <span :class="['badge font-mono text-[10px]', getStatusBadgeClass(job.status)]">{{ job.status }}</span>
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                Technician: <strong class="text-slate-800 dark:text-white">{{ job.assignedTechnician || 'Unassigned' }}</strong>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-slate-500 dark:text-slate-400">Reported Complaint:</span>
                <div class="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{{ job.customerComplaint || 'Standard diagnostic' }}</div>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400">Diagnosis & Actions:</span>
                <div class="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{{ job.faultDiagnosis?.diagnosis || 'Inspection completed' }}</div>
              </div>
            </div>

            <!-- Parts Installed in this Job -->
            <div v-if="(job.partsUsed || []).length > 0" class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div class="text-[11px] font-bold text-teal-600 dark:text-teal-300 mb-1">Spare Parts Installed Against This Job:</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="(p, pIdx) in job.partsUsed" :key="pIdx" class="badge badge-info font-mono text-[10px]">
                  {{ p.partName }} (Qty: {{ p.quantity }}) • PKR {{ (p.unitPrice * p.quantity).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="searchedHistoryResult.jobCards.length === 0" class="text-center py-6 text-slate-400 text-xs">
            No previous workshop tickets recorded for this machine serial number.
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 7: WORKSHOP REPORTS & TECHNICIANS (REQUIREMENTS 14, 19)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'reports'" class="space-y-5 animate-fade-in">
      <!-- Technician Workload Matrix -->
      <div class="glass-panel p-4 sm:p-5 shadow-sm space-y-3.5 border-l-4 border-sky-500">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users :size="18" class="text-sky-500" />
              <span>Technician Performance & Workload Matrix</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live job assignment, pending tasks, and completion metrics for workshop engineering staff.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div v-for="tech in technicianStats" :key="tech.name" class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div class="font-bold text-slate-900 dark:text-white text-xs truncate" :title="tech.name">{{ tech.name }}</div>
            <div class="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">Assigned</div>
                <div class="font-mono font-bold text-slate-900 dark:text-white">{{ tech.assigned }}</div>
              </div>
              <div>
                <div class="text-[10px] text-amber-500">In Process</div>
                <div class="font-mono font-bold text-amber-500">{{ tech.inProcess }}</div>
              </div>
              <div>
                <div class="text-[10px] text-emerald-500">Completed</div>
                <div class="font-mono font-bold text-emerald-500">{{ tech.completed }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Export Reports Grid -->
      <div class="glass-panel p-4 sm:p-5 shadow-sm space-y-3.5">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Workshop Intelligence & Export Hub</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <button @click="printJobCardsRegistry" class="btn btn-secondary text-xs font-bold justify-start gap-2 h-11 shadow-sm">
            <Printer :size="15" class="text-emerald-500" />
            <span>Print All Workshop Jobs Dossier</span>
          </button>
          <button @click="printPartsInventoryReport" class="btn btn-secondary text-xs font-bold justify-start gap-2 h-11 shadow-sm">
            <Printer :size="15" class="text-teal-500" />
            <span>Print Spare Parts Inventory Report</span>
          </button>
          <button @click="exportJobCardsExcel" class="btn btn-secondary text-xs font-bold justify-start gap-2 h-11 shadow-sm">
            <FileSpreadsheet :size="15" class="text-amber-500" />
            <span>Export Jobs Registry to Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 8: FACTORY WARRANTY REGISTRY
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'warranties' || activeTab === 'warranty'" class="space-y-4 animate-fade-in">
      <div class="glass-panel p-3.5 flex items-center justify-between gap-3 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            v-model="warrantySearch"
            type="text"
            placeholder="Search Serial, Machine Code, Customer..."
            class="form-input text-xs h-9 pl-8 pr-3 w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
          />
        </div>
      </div>

      <div class="table-container glass-panel shadow-md">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Machine Code</th>
              <th>Product Name</th>
              <th>Customer</th>
              <th>Sale Date</th>
              <th>Warranty Coverage</th>
              <th>Warranty Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in filteredWarranties" :key="w.serialCode" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="font-mono font-bold text-sky-600 dark:text-sky-400">
                <span class="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800/40">
                  {{ (w.serialCode || '').replace(/^SN-/i, '') }}
                </span>
              </td>
              <td class="font-mono font-bold text-purple-600 dark:text-purple-400">{{ w.machineCode || 'N/A' }}</td>
              <td class="font-bold text-slate-900 dark:text-white">{{ w.productName }}</td>
              <td class="text-slate-600 dark:text-slate-300">{{ w.customer || 'N/A' }}</td>
              <td class="font-mono text-slate-600 dark:text-slate-300">{{ w.saleDate || 'N/A' }}</td>
              <td class="font-mono text-slate-600 dark:text-slate-300">{{ w.warrantyDuration || '12 Months' }}</td>
              <td>
                <span :class="['badge font-mono text-[10px]', isWarrantyValid(w.warrantyExpiry) ? 'badge-success' : 'badge-neutral']">
                  {{ isWarrantyValid(w.warrantyExpiry) ? 'Active' : 'Expired' }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredWarranties.length === 0">
              <td colspan="7" class="text-center py-12 text-slate-400">
                No active factory warranties registered in database.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 1: RECEIVE CUSTOMER MACHINE & JOB CARD (POS FULL-WIDTH GRID)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showNewJobCardModal" class="modal-backdrop z-50 flex items-center justify-center p-1 sm:p-3" @click.self="showNewJobCardModal = false">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-xl" style="width: 98vw !important; max-width: 1560px !important; max-height: 96vh !important; height: 96vh !important; padding: 0 !important;">
        
        <!-- Header Bar (Desktop POS Style) -->
        <div class="px-4 py-3 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-sm sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <ClipboardList :size="20" class="text-sky-600 dark:text-sky-400" />
              <span>Workshop Job Card Intake & Machine Receiving Dossier</span>
            </span>
            <span :class="['badge text-[10px] font-mono py-0.5 px-2.5 font-bold', editingJobCard ? 'badge-warning' : 'badge-info']">
              {{ editingJobCard ? `EDITING JOB CARD: ${editingJobCard.jobCardNo}` : 'NEW MACHINE INTAKE' }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-slate-200 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
              <span class="text-slate-600 dark:text-slate-400 font-medium">Workshop Branch:</span>
              <span class="font-bold text-sky-600 dark:text-sky-400">📍 {{ activeBranchFilter }}</span>
            </div>
            <button @click="showNewJobCardModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-lg font-bold">✕</button>
          </div>
        </div>

        <!-- Scrollable Form Body -->
        <form @submit.prevent="submitJobCardForm(false)" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50 dark:bg-transparent">
            
            <!-- 1. Serial Number Auto-lookup & Verification Banner -->
            <div class="p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 rounded-xl space-y-2.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label class="font-black text-sky-800 dark:text-sky-300 text-xs uppercase flex items-center gap-1.5">
                  <Search :size="14" />
                  <span>Machine Serial Number Auto-Lookup (Instant Customer & Warranty Verification)</span>
                </label>
                <span class="text-[11px] text-slate-500 dark:text-slate-400">Type serial to automatically pull customer invoice and machine specs</span>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newJobForm.serialNumber"
                  @input="onSerialNumberInput"
                  type="text"
                  placeholder="Enter Serial Number (e.g. SN-456 or 456) or Machine Code..."
                  required
                  class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-sky-500 focus:outline-none min-h-[38px]"
                />
                <button
                  type="button"
                  @click="triggerSerialLookup"
                  class="btn btn-primary text-xs font-bold px-4 shrink-0 shadow-sm"
                >
                  Auto-Lookup
                </button>
              </div>
              <div v-if="serialLookupMatch" class="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/50 rounded-lg flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <div>✓ Verified Serial Match: <strong>{{ serialLookupMatch.productName }}</strong> (Original Customer: <strong>{{ serialLookupMatch.customer || 'Walk-in' }}</strong>)</div>
                <div class="font-mono text-[11px]">{{ serialLookupMatch.warrantyExpires ? 'Warranty: ' + serialLookupMatch.warrantyExpires : 'Out of Factory Warranty' }}</div>
              </div>
            </div>

            <!-- 2. Customer & Equipment Profile Grid -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <!-- Customer Details Card -->
              <div class="md:col-span-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Users :size="15" class="text-sky-500" />
                  <span>Customer & Clinic Information</span>
                </div>
                <div class="space-y-2.5">
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Customer Name / Hospital / Clinic *</label>
                    <input
                      v-model="newJobForm.customerName"
                      type="text"
                      list="workshop-customer-list"
                      required
                      placeholder="Type or select customer..."
                      class="form-input text-xs font-bold w-full"
                    />
                    <datalist id="workshop-customer-list">
                      <option v-for="c in (dataStore.customers || [])" :key="c.name" :value="c.name">{{ c.name }} ({{ c.city || 'Pakistan' }})</option>
                      <option v-for="p in (dataStore.parties || [])" :key="p.name" :value="p.name">{{ p.name }} ({{ p.type || 'Party' }})</option>
                    </datalist>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Customer Phone / Contact</label>
                      <input v-model="newJobForm.customerPhone" type="text" placeholder="0300-XXXXXXX" class="form-input text-xs font-mono w-full" />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Customer Category</label>
                      <select v-model="newJobForm.customerType" class="form-input text-xs font-bold w-full">
                        <option value="Existing Company Customer">Existing Company Customer</option>
                        <option value="Dealer">Dealer</option>
                        <option value="Walk-in Customer">Walk-in Customer</option>
                        <option value="Out Customer">Out Customer</option>
                        <option value="Warranty Customer">Warranty Customer</option>
                        <option value="Non-Warranty Customer">Non-Warranty Customer</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Machine Identity Card -->
              <div class="md:col-span-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Cpu :size="15" class="text-purple-500" />
                  <span>Equipment Unit & Warranty Specification</span>
                </div>
                <div class="space-y-2.5">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Machine Name *</label>
                      <input v-model="newJobForm.machineName" type="text" required placeholder="e.g. Ultrasound Color Doppler" class="form-input text-xs font-bold w-full" />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Brand</label>
                      <input v-model="newJobForm.brand" type="text" placeholder="e.g. GE Healthcare" class="form-input text-xs w-full" />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Model</label>
                      <input v-model="newJobForm.model" type="text" placeholder="e.g. Logiq E9" class="form-input text-xs w-full" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Warranty Status</label>
                      <select v-model="newJobForm.warrantyStatus" class="form-input text-xs font-bold w-full">
                        <option value="In Warranty">In Warranty (Free Repairs)</option>
                        <option value="Out of Warranty">Out of Warranty (Customer Paid)</option>
                      </select>
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Machine Serial Number</label>
                      <input v-model="newJobForm.serialNumber" type="text" required class="form-input text-xs font-mono font-bold w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Scheduling & Assignment Bar -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Receiving Date *</label>
                <input v-model="newJobForm.receivingDate" type="date" required class="form-input text-xs font-mono font-bold w-full" />
              </div>
              <div>
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Expected Delivery Date</label>
                <input v-model="newJobForm.expectedDeliveryDate" type="date" class="form-input text-xs font-mono font-bold w-full" />
              </div>
              <div>
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Assigned Biomedical Specialist / Technician *</label>
                <select v-model="newJobForm.assignedTechnician" class="form-input text-xs font-bold w-full">
                  <option v-for="t in dataStore.workshopTechnicians" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>

            <!-- 4. Fault Diagnostics, Complaint & Quick Fault Tags -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Customer Reported Complaint & Fault Observation *</label>
                <div class="flex items-center gap-1.5 flex-wrap text-[10px]">
                  <span class="text-slate-400 font-semibold">Quick Tags:</span>
                  <button
                    v-for="tag in commonComplaintsList"
                    :key="tag"
                    type="button"
                    @click="addComplaintTag(tag)"
                    class="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 cursor-pointer font-medium"
                  >
                    + {{ tag }}
                  </button>
                </div>
              </div>
              <textarea
                v-model="newJobForm.customerComplaint"
                rows="2"
                required
                placeholder="Describe machine fault, error codes, noise, power failure, image artifacts, probe connection issues..."
                class="form-input text-xs w-full"
              ></textarea>
            </div>

            <!-- 5. Condition & Physical Accessories Received -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Physical Condition on Receiving</label>
                <input
                  v-model="newJobForm.machineCondition"
                  type="text"
                  placeholder="e.g. Intact casing, minor scratches, display glass fine, normal wear"
                  class="form-input text-xs w-full"
                />
              </div>
              <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Accessories Received with Machine</label>
                <input
                  v-model="newJobForm.accessoriesReceived"
                  type="text"
                  placeholder="e.g. Power cord, Convex probe, Linear probe, Footswitch, Trolley"
                  class="form-input text-xs w-full"
                />
              </div>
            </div>
          </div>

          <!-- Bottom Sticky Action Footer (Desktop POS Style) -->
          <div class="px-5 py-3 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
              <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Machine: </span>
                <strong class="text-slate-900 dark:text-white">{{ newJobForm.machineName || 'Pending' }}</strong>
              </div>
              <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Serial: </span>
                <strong class="font-mono text-sky-600 dark:text-sky-400">{{ (newJobForm.serialNumber || '—').replace(/^SN-/i, '') }}</strong>
              </div>
              <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Warranty: </span>
                <strong :class="newJobForm.warrantyStatus === 'In Warranty' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'">
                  {{ newJobForm.warrantyStatus }}
                </strong>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" @click="showNewJobCardModal = false" class="btn btn-secondary text-xs font-bold px-4 h-9">
                Cancel
              </button>
              <button
                type="button"
                @click="submitJobCardForm(true)"
                class="btn btn-secondary text-sky-600 dark:text-sky-400 text-xs font-bold px-4 h-9 flex items-center gap-1.5 shadow-sm"
              >
                <Printer :size="14" />
                <span>{{ editingJobCard ? 'Update & Print Job Card' : 'Save & Print Job Card' }}</span>
              </button>
              <button
                type="submit"
                class="btn btn-primary text-white text-xs font-bold px-5 h-9 shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 :size="14" />
                <span>{{ editingJobCard ? '✓ Update Job Card' : '✓ Create Job Card & Receive Machine' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 2: JOB DETAILS, DIAGNOSIS & SPARE PARTS MANAGEMENT (REQ 3, 6, 7, 13, 15)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showJobDetailsModal && selectedJob" class="modal-backdrop" @click.self="showJobDetailsModal = false">
      <div class="modal-content max-w-4xl max-h-[92vh] overflow-y-auto space-y-4">
        <div class="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <Wrench class="text-primary w-5 h-5" />
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Workshop Job Card: {{ selectedJob.jobCardNo }}</h3>
              <div class="text-[10px] text-slate-500 dark:text-slate-400">Machine: {{ selectedJob.machineName }} (SN: {{ selectedJob.serialNumber }})</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="printSingleJobCard(selectedJob)" class="btn btn-secondary text-xs flex items-center gap-1 shadow-sm">
              <Printer :size="13" />
              <span>Print Job Card</span>
            </button>
            <button @click="showJobDetailsModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
          </div>
        </div>

        <!-- 10-Stage Status Pipeline Selector -->
        <div class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
          <div class="text-[11px] font-bold text-slate-900 dark:text-white flex justify-between">
            <span>Current Stage Pipeline (Requirement #13)</span>
            <span class="badge badge-info text-[10px]">{{ selectedJob.status }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
            <button
              v-for="st in allStages"
              :key="st"
              type="button"
              @click="changeJobStage(st)"
              :class="['btn btn-xs font-bold text-[10px]', selectedJob.status === st ? 'btn-primary text-white' : 'btn-secondary text-slate-600 dark:text-slate-400']"
            >
              {{ st }}
            </button>
          </div>
        </div>

        <!-- Fault & Diagnostics Form -->
        <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
          <div class="font-bold text-slate-900 dark:text-white text-xs">Diagnosis & Labour Charges (Requirement #3)</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="form-label">Fault Observed / Diagnosis</label>
              <textarea v-model="editDiagnosisForm.diagnosis" rows="2" class="form-input text-xs"></textarea>
            </div>
            <div>
              <label class="form-label">Required Repair & Technical Actions</label>
              <textarea v-model="editDiagnosisForm.requiredRepair" rows="2" class="form-input text-xs"></textarea>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label class="form-label">Labour / Service Charges (PKR)</label>
              <input v-model.number="editDiagnosisForm.labourCharges" type="number" min="0" class="form-input text-xs font-mono" />
            </div>
            <div>
              <label class="form-label">Other Workshop Charges (PKR)</label>
              <input v-model.number="editDiagnosisForm.otherCharges" type="number" min="0" class="form-input text-xs font-mono" />
            </div>
            <div>
              <label class="form-label">Assigned Technician</label>
              <select v-model="selectedJob.assignedTechnician" class="form-input text-xs font-bold">
                <option v-for="t in dataStore.workshopTechnicians" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>

          <div class="text-right">
            <button type="button" @click="saveJobDiagnosis" class="btn btn-secondary text-xs font-bold shadow-sm">
              Save Diagnosis & Labour
            </button>
          </div>
        </div>

        <!-- Spare Parts Issued Against this Job -->
        <div class="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
          <div class="flex justify-between items-center">
            <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
              <Cpu :size="15" class="text-teal-500" />
              <span>Spare Parts Installed In This Machine (Auto-Deducted from Inventory)</span>
            </div>
            <button @click="showIssuePartSection = !showIssuePartSection" class="btn btn-xs btn-primary font-bold shadow-sm">
              + Issue Spare Part
            </button>
          </div>

          <!-- Issue Part Sub-form -->
          <div v-if="showIssuePartSection" class="p-3 bg-white dark:bg-slate-950 border border-teal-500/40 rounded-lg space-y-2">
            <div class="text-xs font-bold text-teal-600 dark:text-teal-300">Select Part from Workshop Inventory:</div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
              <div class="md:col-span-2">
                <label class="form-label">Available Spare Part</label>
                <select v-model="issuePartForm.partCode" class="form-input text-xs font-mono">
                  <option value="">-- Choose Part from Warehouse --</option>
                  <option v-for="p in dataStore.workshopSpareParts" :key="p.partCode" :value="p.partCode">
                    {{ p.partName || p.name }} ({{ p.partCode }}) • Stock: {{ p.currentStock ?? p.stockQty ?? 0 }} • {{ p.locationRack || 'Rack A' }}
                  </option>
                </select>
              </div>
              <div>
                <label class="form-label">Quantity</label>
                <input v-model.number="issuePartForm.quantity" type="number" min="1" class="form-input text-xs font-mono" />
              </div>
              <div>
                <label class="form-label">Warranty Part (Free?)</label>
                <select v-model="issuePartForm.isWarranty" class="form-input text-xs font-bold">
                  <option :value="false">No (Customer Paid)</option>
                  <option :value="true">Yes (Free under Warranty)</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="showIssuePartSection = false" class="btn btn-xs btn-secondary">Cancel</button>
              <button type="button" @click="confirmIssuePart" class="btn btn-xs btn-primary font-bold">Confirm Issue & Deduct Stock</button>
            </div>
          </div>

          <!-- Installed Parts Table -->
          <table class="table-lined text-xs">
            <thead>
              <tr>
                <th>Part Code</th>
                <th>Part Name</th>
                <th>Quantity</th>
                <th>Unit Price (PKR)</th>
                <th>Warranty Free?</th>
                <th>Total (PKR)</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, pIdx) in selectedJob.partsUsed" :key="pIdx">
                <td class="font-mono text-teal-600 dark:text-teal-400 font-bold">{{ p.partCode }}</td>
                <td class="font-bold text-slate-900 dark:text-white">{{ p.partName }}</td>
                <td class="font-mono font-bold">{{ p.quantity }}</td>
                <td class="font-mono">PKR {{ (p.unitPrice || 0).toLocaleString() }}</td>
                <td>
                  <span :class="['badge font-mono text-[10px]', p.isWarranty ? 'badge-success' : 'badge-neutral']">
                    {{ p.isWarranty ? 'Yes (Warranty)' : 'No (Paid)' }}
                  </span>
                </td>
                <td class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  PKR {{ (Number(p.quantity || 1) * Number(p.unitPrice || 0)).toLocaleString() }}
                </td>
                <td class="text-right">
                  <button
                    @click="returnPart(pIdx)"
                    class="btn btn-xs btn-ghost text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    title="Return Part back to workshop inventory"
                  >
                    Return Part
                  </button>
                </td>
              </tr>
              <tr v-if="!selectedJob.partsUsed || selectedJob.partsUsed.length === 0">
                <td colspan="7" class="text-center py-4 text-slate-400">
                  No spare parts issued to this job card yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <button type="button" @click="showJobDetailsModal = false" class="btn btn-secondary">Close</button>
            <button
              type="button"
              @click="openEditJobCardModal(selectedJob)"
              class="btn btn-secondary text-xs font-bold shadow-sm flex items-center gap-1 text-amber-600 dark:text-amber-400"
              title="Edit Machine Intake Details"
            >
              <Pencil :size="12" />
              <span>Edit Intake Info</span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="!selectedJob.dcGenerated"
              type="button"
              @click="generateDC(selectedJob)"
              class="btn btn-secondary text-xs font-bold shadow-sm"
            >
              Generate DC
            </button>
            <button
              v-if="!selectedJob.invoiceGenerated"
              type="button"
              @click="generateInvoice(selectedJob)"
              class="btn btn-primary text-xs font-bold shadow-md"
            >
              Generate Workshop Invoice
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 3: INWARD CHINA & SUPPLIER SPARE PARTS (VYAPAR / POS FULL-WIDTH GRID)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showNewInwardModal" class="modal-backdrop z-50 flex items-center justify-center p-1 sm:p-3" @click.self="showNewInwardModal = false">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-xl" style="width: 98vw !important; max-width: 1560px !important; max-height: 96vh !important; height: 96vh !important; padding: 0 !important;">
        
        <!-- Header Bar -->
        <div class="px-4 py-3 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-sm sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <PackagePlus :size="18" class="text-amber-500" />
              <span>Inward Spare Parts Receiving (China / Supplier / Local)</span>
            </span>
            <span class="badge badge-warning text-[10px] font-mono py-0.5 px-2 font-bold">
              GOODS RECEIPT NOTE (GRN) & WAREHOUSE INWARD
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-slate-200 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
              <span class="text-slate-600 dark:text-slate-400 font-medium">Destination:</span>
              <select v-model="inwardForm.branch" class="bg-transparent text-amber-600 dark:text-amber-400 font-bold focus:outline-none cursor-pointer">
                <option v-for="b in dataStore.branches" :key="b" :value="b" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{{ b }}</option>
              </select>
            </div>
            <button @click="showNewInwardModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-lg font-bold">✕</button>
          </div>
        </div>

        <!-- Metadata Header: Supplier, Invoice, BL Ref, Date -->
        <div class="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Supplier / Exporter *</label>
            <input
              v-model="inwardForm.supplierName"
              type="text"
              required
              placeholder="e.g. Shenzhen Medical Instruments Ltd"
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-bold text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Purchase Invoice # *</label>
            <input
              v-model="inwardForm.invoiceNo"
              type="text"
              required
              placeholder="e.g. INV-CN-2026-88"
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Shipment / BL Reference</label>
            <input
              v-model="inwardForm.blReference"
              type="text"
              placeholder="e.g. BL-MED-2026-CN"
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Receiving Date *</label>
            <input
              v-model="inwardForm.receivingDate"
              type="date"
              required
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Full-Width Scrollable Items Grid (Vyapar/Purchase Style) -->
        <form @submit.prevent="submitInwardShipment(false)" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50/50 dark:bg-transparent">
            <div class="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div class="overflow-x-auto min-w-full">
                <table class="w-full text-left border-collapse min-w-[950px] text-xs">
                  <thead>
                    <tr class="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-black tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th class="py-2.5 px-3 w-10 text-center">#</th>
                      <th class="py-2.5 px-3 w-36">PART CODE *</th>
                      <th class="py-2.5 px-3 min-w-[260px]">PART NAME / DESCRIPTION *</th>
                      <th class="py-2.5 px-3 w-36">BRAND / MODEL</th>
                      <th class="py-2.5 px-3 w-28 text-center">RACK</th>
                      <th class="py-2.5 px-3 w-28 text-center">CAB / SHELF</th>
                      <th class="py-2.5 px-3 w-24 text-center">QTY *</th>
                      <th class="py-2.5 px-3 w-32 text-right">UNIT COST (PKR) *</th>
                      <th class="py-2.5 px-3 w-36 text-right">TOTAL (PKR)</th>
                      <th class="py-2.5 px-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr v-for="(item, idx) in inwardForm.parts" :key="idx" class="hover:bg-amber-50/20 dark:hover:bg-slate-800/40">
                      <td class="py-2 px-3 text-center font-mono text-slate-400 font-bold">{{ idx + 1 }}</td>
                      <td class="py-2 px-3">
                        <input
                          v-model="item.partCode"
                          @change="onInwardPartCodeChange(item)"
                          type="text"
                          required
                          placeholder="PRT-001"
                          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-mono uppercase font-bold text-amber-600 dark:text-amber-400 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <input
                          v-model="item.partName"
                          type="text"
                          required
                          placeholder="e.g. Ultrasound Power Supply Module"
                          class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-medium text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <input
                          v-model="item.brand"
                          type="text"
                          placeholder="e.g. GE / Philips"
                          class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <input
                          v-model="item.locationRack"
                          type="text"
                          placeholder="Rack A"
                          class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-mono text-center text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <input
                          v-model="item.locationCabinet"
                          type="text"
                          placeholder="Cab 1"
                          class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-mono text-center text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <input
                          v-model.number="item.quantity"
                          type="number"
                          min="1"
                          required
                          class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-mono font-bold text-center text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <input
                          v-model.number="item.unitCost"
                          type="number"
                          min="0"
                          required
                          class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-mono text-right text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </td>
                      <td class="py-2 px-3 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400">
                        PKR {{ (Number(item.quantity || 0) * Number(item.unitCost || 0)).toLocaleString() }}
                      </td>
                      <td class="py-2 px-3 text-center">
                        <button
                          v-if="inwardForm.parts.length > 1"
                          type="button"
                          @click="removeInwardLineItem(idx)"
                          class="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded"
                          title="Remove Line"
                        >✕</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <button
                type="button"
                @click="addInwardLineItem"
                class="btn btn-xs btn-secondary text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 shadow-sm px-3 py-1.5 rounded-lg"
              >
                <Plus :size="14" />
                <span>+ Add Spare Part Line</span>
              </button>

              <div class="w-72">
                <input
                  v-model="inwardForm.remarks"
                  type="text"
                  placeholder="Receiving remarks / shipment tracking..."
                  class="form-input text-xs w-full bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          <!-- Bottom Sticky Calculation Footer (Vyapar POS Style) -->
          <div class="px-5 py-3 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div class="flex items-center gap-4 text-xs">
              <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Total Lines: </span>
                <strong class="font-mono text-slate-900 dark:text-white">{{ inwardForm.parts.length }} Parts</strong>
              </div>
              <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Total Units: </span>
                <strong class="font-mono text-amber-600 dark:text-amber-400">
                  {{ inwardForm.parts.reduce((s, p) => s + Number(p.quantity || 0), 0) }} Pcs
                </strong>
              </div>
              <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Grand Total: </span>
                <strong class="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  PKR {{ inwardForm.parts.reduce((s, p) => s + (Number(p.quantity || 0) * Number(p.unitCost || 0)), 0).toLocaleString() }}
                </strong>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" @click="showNewInwardModal = false" class="btn btn-secondary text-xs font-bold px-4 h-9">
                Cancel
              </button>
              <button
                type="button"
                @click="submitInwardShipment(true)"
                class="btn btn-secondary text-amber-600 dark:text-amber-400 text-xs font-bold px-4 h-9 flex items-center gap-1.5 shadow-sm"
              >
                <Printer :size="14" />
                <span>Receive & Print GRN Invoice</span>
              </button>
              <button
                type="submit"
                class="btn btn-warning text-white text-xs font-bold px-5 h-9 shadow-md"
              >
                ✓ Receive Inward to Inventory
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 4: RECORD WORKSHOP PAYMENT (REQUIREMENT 9)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showPaymentModal && selectedJobForPayment" class="modal-backdrop" @click.self="showPaymentModal = false">
      <div class="modal-content max-w-md">
        <div class="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <Banknote class="text-emerald-500 w-5 h-5" />
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Record Workshop Payment</h3>
          </div>
          <button @click="showPaymentModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitWorkshopPayment" class="space-y-4 pt-3 text-xs">
          <div class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
            <div class="text-[10px] text-slate-500 dark:text-slate-400">Job Card: <strong class="text-slate-900 dark:text-white">{{ selectedJobForPayment.jobCardNo }}</strong></div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">{{ selectedJobForPayment.customerName }}</div>
            <div class="flex justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
              <span class="text-slate-500 dark:text-slate-400">Remaining Balance:</span>
              <span class="font-mono font-bold text-rose-600 dark:text-rose-400">PKR {{ (selectedJobForPayment.remainingBalance || 0).toLocaleString() }}</span>
            </div>
          </div>

          <div>
            <label class="form-label">Payment Amount (PKR)</label>
            <input v-model.number="paymentForm.amount" type="number" min="1" required class="form-input text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Payment Method</label>
              <select v-model="paymentForm.method" class="form-input text-xs font-bold">
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Online Transfer">Online Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="form-label">Date</label>
              <input v-model="paymentForm.date" type="date" required class="form-input text-xs" />
            </div>
          </div>

          <div>
            <label class="form-label">Notes / Reference</label>
            <input v-model="paymentForm.notes" type="text" placeholder="e.g. Paid in full at delivery" class="form-input text-xs" />
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" @click="showPaymentModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-success font-bold text-white shadow-md">Confirm Payment</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 5: ADD NEW SPARE PART (REQUIREMENT 4)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showNewPartModal" class="modal-backdrop" @click.self="showNewPartModal = false">
      <div class="modal-content max-w-lg">
        <div class="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <Plus class="text-teal-500 w-5 h-5" />
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Add New Spare Part to Warehouse</h3>
          </div>
          <button @click="showNewPartModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitNewPart" class="space-y-4 pt-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Part Code</label>
              <input v-model="partForm.partCode" type="text" required placeholder="e.g. MB-SONO-400" class="form-input text-xs font-mono uppercase" />
            </div>
            <div>
              <label class="form-label">Part Name</label>
              <input v-model="partForm.name" type="text" required placeholder="e.g. Ultrasound High-Voltage Board" class="form-input text-xs" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Brand</label>
              <input v-model="partForm.brand" type="text" placeholder="e.g. GE, Philips, Mindray" class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Model</label>
              <input v-model="partForm.model" type="text" placeholder="e.g. Logiq E9, CX50" class="form-input text-xs" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="form-label">Rack Location</label>
              <input v-model="partForm.locationRack" type="text" placeholder="Rack A" class="form-input text-xs font-mono" />
            </div>
            <div>
              <label class="form-label">Cabinet</label>
              <input v-model="partForm.locationCabinet" type="text" placeholder="Cab 1" class="form-input text-xs font-mono" />
            </div>
            <div>
              <label class="form-label">Shelf</label>
              <input v-model="partForm.locationShelf" type="text" placeholder="Shelf 2" class="form-input text-xs font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="form-label">Initial Stock</label>
              <input v-model.number="partForm.stockQty" type="number" min="0" required class="form-input text-xs font-mono" />
            </div>
            <div>
              <label class="form-label">Min Alert Level</label>
              <input v-model.number="partForm.minQty" type="number" min="1" required class="form-input text-xs font-mono" />
            </div>
            <div>
              <label class="form-label">Unit Cost (PKR)</label>
              <input v-model.number="partForm.unitCost" type="number" min="0" required class="form-input text-xs font-mono" />
            </div>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" @click="showNewPartModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary font-bold">Register Part</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 6: DISPATCH & SHIPMENT MANAGEMENT (CARGO / DC) (POS FULL-WIDTH GRID)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showDispatchModal && selectedJobForDispatch" class="modal-backdrop z-50 flex items-center justify-center p-1 sm:p-3" @click.self="showDispatchModal = false">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-xl" style="width: 98vw !important; max-width: 1560px !important; max-height: 96vh !important; height: 96vh !important; padding: 0 !important;">
        
        <!-- Header Bar -->
        <div class="px-4 py-3 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-sm sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Truck :size="20" class="text-indigo-500" />
              <span>Workshop Machine Dispatch & Delivery Challan (DC) Management</span>
            </span>
            <span class="badge badge-info text-[10px] font-mono py-0.5 px-2.5 font-bold">
              JOB: {{ selectedJobForDispatch.jobCardNo }} • DC: {{ selectedJobForDispatch.dcNumber || 'DRAFT DC' }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-slate-200 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
              <span class="text-slate-600 dark:text-slate-400 font-medium">Branch:</span>
              <span class="font-bold text-indigo-600 dark:text-indigo-400">📍 {{ activeBranchFilter }}</span>
            </div>
            <button @click="showDispatchModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-lg font-bold">✕</button>
          </div>
        </div>

        <!-- Scrollable Form Body -->
        <form @submit.prevent="submitDispatch(false)" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50 dark:bg-transparent">
            
            <!-- Machine & Consignee Summary Banner -->
            <div class="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Machine Equipment</span>
                <strong class="text-slate-900 dark:text-white text-sm block mt-0.5">{{ selectedJobForDispatch.machineName }}</strong>
                <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">SN: {{ (selectedJobForDispatch.serialNumber || '').replace(/^SN-/i, '') }}</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Customer / Hospital</span>
                <strong class="text-slate-900 dark:text-white text-sm block mt-0.5">{{ selectedJobForDispatch.customerName }}</strong>
                <span class="text-slate-500 font-mono text-[11px]">{{ selectedJobForDispatch.customerPhone || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Technician (Repaired By)</span>
                <strong class="text-slate-900 dark:text-white block mt-0.5">{{ selectedJobForDispatch.repairedBy || selectedJobForDispatch.assignedTechnician || 'Senior Specialist' }}</strong>
                <span class="badge badge-success text-[9px] mt-0.5">Tested & QC Passed</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Warranty Coverage</span>
                <strong :class="selectedJobForDispatch.warrantyStatus === 'In Warranty' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'" class="block mt-0.5">
                  {{ selectedJobForDispatch.warrantyStatus || 'Out of Warranty' }}
                </strong>
                <span class="text-slate-400 text-[10px]">Received on {{ selectedJobForDispatch.receivingDate }}</span>
              </div>
            </div>

            <!-- Two-Column Logistics Grid -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <!-- Left: Cargo & Shipment Method -->
              <div class="md:col-span-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Truck :size="15" class="text-indigo-500" />
                  <span>Courier, Cargo & Freight Method</span>
                </div>
                
                <div class="space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Carrier Service / Shipping Mode *</label>
                      <select v-model="dispatchForm.shipmentType" class="form-input text-xs font-bold w-full">
                        <option value="Daewoo Cargo">Daewoo Cargo / Express</option>
                        <option value="TCS Express">TCS Express Courier</option>
                        <option value="Leopard Courier">Leopard Courier</option>
                        <option value="Trax Cargo">Trax Logistics</option>
                        <option value="Asian Cargo">Asian Cargo Service</option>
                        <option value="Faisal Movers Cargo">Faisal Movers Cargo</option>
                        <option value="Road Freight">Road Freight (Truck / Van)</option>
                        <option value="Customer Self Pickup">Customer Self Pickup / By Hand</option>
                        <option value="Company Rider">Company Delivery Rider</option>
                        <option value="Other">Other Courier Service</option>
                      </select>
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Carrier / Booking Station Name</label>
                      <input
                        v-model="dispatchForm.cargoService"
                        type="text"
                        placeholder="e.g. Daewoo Express Cargo Peshawar Terminal"
                        class="form-input text-xs w-full"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="form-label font-bold text-purple-600 dark:text-purple-400">Tracking / Bilty / CN Number *</label>
                      <input
                        v-model="dispatchForm.trackingNo"
                        type="text"
                        placeholder="e.g. BLT-DW-99381 or CN-772910"
                        class="form-input text-xs font-mono font-bold text-purple-700 dark:text-purple-300 w-full"
                      />
                    </div>
                    <div>
                      <label class="form-label font-bold text-emerald-600 dark:text-emerald-400">Delivery / Cargo Charges (PKR) *</label>
                      <input
                        v-model.number="dispatchForm.deliveryCharges"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="form-input text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 w-full"
                      />
                      <span class="text-[10px] text-slate-400">Auto-adds to customer invoice total & ledger</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Dispatch Date *</label>
                      <input v-model="dispatchForm.dispatchDate" type="date" required class="form-input text-xs font-mono font-bold w-full" />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Repaired By (Biomedical Tech) *</label>
                      <select v-model="dispatchForm.repairedBy" class="form-input text-xs font-bold w-full">
                        <option v-for="t in dataStore.workshopTechnicians" :key="t" :value="t">{{ t }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Dispatch Status</label>
                      <select v-model="dispatchForm.dispatchStatus" class="form-input text-xs font-bold w-full">
                        <option value="Ready for Delivery">Ready for Delivery</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered & Handed Over</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Recipient & Destination Details -->
              <div class="md:col-span-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Users :size="15" class="text-emerald-500" />
                  <span>Consignee & Delivery Destination Information</span>
                </div>

                <div class="space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Receiver Contact Person</label>
                      <input v-model="dispatchForm.receiverName" type="text" placeholder="Dr. / Clinic Manager Name" class="form-input text-xs w-full" />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Receiver Phone / WhatsApp</label>
                      <input v-model="dispatchForm.receiverPhone" type="text" placeholder="0300-XXXXXXX" class="form-input text-xs font-mono w-full" />
                    </div>
                  </div>

                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Delivery Address / Destination City</label>
                    <input v-model="dispatchForm.deliveryAddress" type="text" placeholder="Hospital / Diagnostic Center, City Destination" class="form-input text-xs w-full" />
                  </div>

                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Courier Instructions & Fragile Warnings</label>
                    <input v-model="dispatchForm.remarks" type="text" placeholder="e.g. Fragile biomedical equipment - handle with extreme care, keep upright" class="form-input text-xs w-full" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Returned Equipment & Accessories Checklist -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <Boxes :size="15" class="text-amber-500" />
                <span>Equipment & Accessories Returned with Machine</span>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
                {{ selectedJobForDispatch.accessoriesReceived || 'Power cable, standard transducers, calibration certificate' }}
              </div>
            </div>
          </div>

          <!-- Bottom Sticky Action Footer (Desktop POS Style) -->
          <div class="px-5 py-3 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
              <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Carrier: </span>
                <strong class="text-slate-900 dark:text-white">{{ dispatchForm.cargoService || dispatchForm.shipmentType }}</strong>
              </div>
              <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Bilty #: </span>
                <strong class="font-mono text-purple-600 dark:text-purple-400">{{ dispatchForm.trackingNo || 'Pending' }}</strong>
              </div>
              <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Delivery Charges: </span>
                <strong class="font-mono text-emerald-600 dark:text-emerald-400 text-sm">PKR {{ Number(dispatchForm.deliveryCharges || 0).toLocaleString() }}</strong>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" @click="showDispatchModal = false" class="btn btn-secondary text-xs font-bold px-4 h-9">
                Cancel
              </button>
              <button
                type="button"
                @click="submitDispatch(true)"
                class="btn btn-secondary text-indigo-600 dark:text-indigo-400 text-xs font-bold px-4 h-9 flex items-center gap-1.5 shadow-sm"
              >
                <Printer :size="14" />
                <span>Save & Print Delivery Challan (DC)</span>
              </button>
              <button
                type="submit"
                class="btn btn-primary text-white text-xs font-bold px-5 h-9 shadow-md flex items-center gap-1.5"
              >
                <Truck :size="14" />
                <span>Save Dispatch Details</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 7: WORKSHOP INVOICE BUILDER (PARTS, LABOUR, CARGO) (POS FULL-WIDTH GRID)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showInvoiceModal && selectedJobForInvoice" class="modal-backdrop z-50 flex items-center justify-center p-1 sm:p-3" @click.self="showInvoiceModal = false">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-xl" style="width: 98vw !important; max-width: 1560px !important; max-height: 96vh !important; height: 96vh !important; padding: 0 !important;">
        
        <!-- Header Bar -->
        <div class="px-4 py-3 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-sm sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Receipt :size="20" class="text-blue-500" />
              <span>Workshop Repair Invoice & Customer Billing Dossier</span>
            </span>
            <span class="badge badge-info text-[10px] font-mono py-0.5 px-2.5 font-bold">
              INVOICE: {{ selectedJobForInvoice.invoiceNumber || 'NEW INVOICE' }} • JOB: {{ selectedJobForInvoice.jobCardNo }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-slate-200 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
              <span class="text-slate-600 dark:text-slate-400 font-medium">Branch:</span>
              <span class="font-bold text-blue-600 dark:text-blue-400">📍 {{ activeBranchFilter }}</span>
            </div>
            <button @click="showInvoiceModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-lg font-bold">✕</button>
          </div>
        </div>

        <!-- Scrollable Form Body -->
        <form @submit.prevent="submitInvoiceForm(false)" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50 dark:bg-transparent">
            
            <!-- Metadata Cards -->
            <div class="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                <strong class="text-slate-900 dark:text-white text-sm block mt-0.5">{{ selectedJobForInvoice.customerName }}</strong>
                <span class="text-slate-500 font-mono text-[11px]">{{ selectedJobForInvoice.customerPhone || 'N/A' }}</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Machine & Model</span>
                <strong class="text-slate-900 dark:text-white text-sm block mt-0.5">{{ selectedJobForInvoice.machineName }}</strong>
                <span class="font-mono text-sky-600 dark:text-sky-400 font-bold text-[11px]">SN: {{ (selectedJobForInvoice.serialNumber || '').replace(/^SN-/i, '') }}</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Repaired By (Technician)</span>
                <select v-model="invoiceForm.repairedBy" class="form-input text-xs font-bold w-full mt-1">
                  <option v-for="t in dataStore.workshopTechnicians" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Invoice Date</span>
                <input v-model="invoiceForm.date" type="date" required class="form-input text-xs font-mono font-bold w-full mt-1" />
              </div>
            </div>

            <!-- Full-Width Installed Parts Table (Vyapar Style) -->
            <div class="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div class="p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span class="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu :size="15" class="text-teal-500" />
                  <span>Spare Parts Installed in Machine</span>
                </span>
                <span class="font-mono font-bold text-teal-600 dark:text-teal-400 text-xs">
                  Parts Subtotal: PKR {{ computedInvoicePartsCost.toLocaleString() }}
                </span>
              </div>
              <div class="overflow-x-auto min-w-full">
                <table class="w-full text-left border-collapse min-w-[750px] text-xs">
                  <thead>
                    <tr class="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                      <th class="py-2 px-3 w-10 text-center">#</th>
                      <th class="py-2 px-3 w-36">PART CODE</th>
                      <th class="py-2 px-3">PART NAME / DESCRIPTION</th>
                      <th class="py-2 px-3 w-24 text-center">QTY</th>
                      <th class="py-2 px-3 w-32 text-right">UNIT RATE (PKR)</th>
                      <th class="py-2 px-3 w-28 text-center">WARRANTY?</th>
                      <th class="py-2 px-3 w-36 text-right">TOTAL (PKR)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr v-for="(p, pIdx) in selectedJobForInvoice.partsUsed" :key="pIdx" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td class="py-2 px-3 text-center font-mono text-slate-400">{{ pIdx + 1 }}</td>
                      <td class="py-2 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">{{ p.partCode }}</td>
                      <td class="py-2 px-3 font-medium text-slate-900 dark:text-white">{{ p.partName }}</td>
                      <td class="py-2 px-3 text-center font-mono font-bold">{{ p.quantity }}</td>
                      <td class="py-2 px-3 text-right font-mono">PKR {{ (Number(p.unitPrice || 0)).toLocaleString() }}</td>
                      <td class="py-2 px-3 text-center">
                        <span :class="['badge font-mono text-[9px]', p.isWarranty ? 'badge-success' : 'badge-neutral']">
                          {{ p.isWarranty ? 'Yes (Free)' : 'No (Paid)' }}
                        </span>
                      </td>
                      <td class="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        PKR {{ p.isWarranty ? '0 (Free)' : (Number(p.quantity || 1) * Number(p.unitPrice || 0)).toLocaleString() }}
                      </td>
                    </tr>
                    <tr v-if="!selectedJobForInvoice.partsUsed || selectedJobForInvoice.partsUsed.length === 0">
                      <td colspan="7" class="text-center py-6 text-slate-400 italic">
                        No replacement spare parts installed. Only diagnostic and service charges will be billed.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Fee Adjustments & Charges Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Labour / Service Charges (PKR)</label>
                <input v-model.number="invoiceForm.labourCharges" type="number" min="0" class="form-input text-xs font-mono font-bold w-full" />
                <span class="text-[10px] text-slate-400">Biomedical diagnostic labor fee</span>
              </div>
              <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <label class="form-label font-bold text-purple-600 dark:text-purple-400">Delivery / Cargo Charges (PKR)</label>
                <input v-model.number="invoiceForm.deliveryCharges" type="number" min="0" class="form-input text-xs font-mono font-bold text-purple-700 dark:text-purple-300 w-full" />
                <span class="text-[10px] text-slate-400">Daewoo, TCS, Cargo delivery fee</span>
              </div>
              <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Workshop Consumables (PKR)</label>
                <input v-model.number="invoiceForm.otherCharges" type="number" min="0" class="form-input text-xs font-mono font-bold w-full" />
                <span class="text-[10px] text-slate-400">Cables, solder, thermal paste, gel</span>
              </div>
              <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <label class="form-label font-bold text-rose-600 dark:text-rose-400">Special Discount (PKR)</label>
                <input v-model.number="invoiceForm.discount" type="number" min="0" class="form-input text-xs font-mono font-bold text-rose-600 dark:text-rose-400 w-full" />
                <span class="text-[10px] text-slate-400">Deducted from invoice subtotal</span>
              </div>
            </div>

            <!-- Calculation Overview Card -->
            <div class="p-4 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <span class="text-slate-500 text-[10px] uppercase font-bold">Parts Cost</span>
                <div class="font-mono font-bold text-slate-900 dark:text-white mt-0.5">PKR {{ computedInvoicePartsCost.toLocaleString() }}</div>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] uppercase font-bold">Labour + Other</span>
                <div class="font-mono font-bold text-slate-900 dark:text-white mt-0.5">PKR {{ (Number(invoiceForm.labourCharges || 0) + Number(invoiceForm.otherCharges || 0)).toLocaleString() }}</div>
              </div>
              <div>
                <span class="text-purple-600 dark:text-purple-400 text-[10px] uppercase font-bold">Delivery / Cargo</span>
                <div class="font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5">+ PKR {{ Number(invoiceForm.deliveryCharges || 0).toLocaleString() }}</div>
              </div>
              <div>
                <span class="text-rose-600 dark:text-rose-400 text-[10px] uppercase font-bold">Discount</span>
                <div class="font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">- PKR {{ Number(invoiceForm.discount || 0).toLocaleString() }}</div>
              </div>
              <div>
                <span class="text-primary text-[10px] uppercase font-bold">Net Grand Total</span>
                <div class="font-mono font-black text-primary text-base mt-0.5">PKR {{ computedInvoiceGrandTotal.toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <!-- Bottom Sticky Action Footer (Desktop POS Style) -->
          <div class="px-5 py-3 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
              <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Grand Total: </span>
                <strong class="font-mono text-primary text-sm">PKR {{ computedInvoiceGrandTotal.toLocaleString() }}</strong>
              </div>
              <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Repaired By: </span>
                <strong class="text-slate-900 dark:text-white">{{ invoiceForm.repairedBy }}</strong>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" @click="showInvoiceModal = false" class="btn btn-secondary text-xs font-bold px-4 h-9">
                Cancel
              </button>
              <button
                type="button"
                @click="submitInvoiceForm(true)"
                class="btn btn-secondary text-blue-600 dark:text-blue-400 text-xs font-bold px-4 h-9 flex items-center gap-1.5 shadow-sm"
              >
                <Printer :size="14" />
                <span>Save & Print Invoice</span>
              </button>
              <button
                type="submit"
                class="btn btn-primary text-white text-xs font-bold px-5 h-9 shadow-md flex items-center gap-1.5"
              >
                <Receipt :size="14" />
                <span>Generate Invoice & Update Ledger</span>
              </button>
            </div>
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
import { exportPrint, exportXLSX } from '@/utils/reportExporter'
import PaginationBar from '@/components/ui/PaginationBar.vue'

import {
  Wrench,
  Cpu,
  Boxes,
  PackagePlus,
  Receipt,
  History,
  ShieldCheck,
  Search,
  Plus,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  LayoutDashboard,
  ClipboardList,
  ArrowRight,
  Banknote,
  Users,
  Truck,
  FileText,
  CreditCard,
  Send,
  Pencil,
  Building2,
  Eye,
  EyeOff
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

function formatBalance(amount, prefix = 'PKR ') {
  if (!authStore.isBalanceVisible) return '••••••'
  const num = Number(amount || 0)
  return `${prefix}${num.toLocaleString()}`
}

// ═══════════════════════════════════════════════════════
// ROBUST TAB NORMALIZATION & NAVIGATION TABS
// ═══════════════════════════════════════════════════════
function normalizeTab(t) {
  if (!t) return 'dashboard'
  const clean = String(t).trim().toLowerCase()
  if (clean === 'parts' || clean === 'inventory') return 'inventory'
  if (clean === 'jobs' || clean === 'claims' || clean === 'faulty') return 'jobs'
  if (clean === 'replacement' || clean === 'history') return 'history'
  if (clean === 'warranties' || clean === 'warranty') return 'warranties'
  if (clean === 'inward') return 'inward'
  if (clean === 'dispatch' || clean === 'dc' || clean === 'delivery') return 'dispatch'
  if (clean === 'invoices' || clean === 'invoice' || clean === 'billing') return 'invoices'
  if (clean === 'payments' || clean === 'payment' || clean === 'ledger') return 'payments'
  if (clean === 'reports') return 'reports'
  if (clean === 'dashboard') return 'dashboard'
  return clean
}

const activeTab = ref(normalizeTab(route.query.tab))
const activeBranchFilter = computed({
  get: () => dataStore.activeBranchFilter || 'Peshawar',
  set: (val) => { dataStore.activeBranchFilter = val }
})

const workshopNavTabs = computed(() => [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Customer Job Cards', icon: ClipboardList, badge: dataStore.workshopJobCards.length, badgeClass: 'bg-primary/20 text-primary' },
  { id: 'inventory', label: 'Spare Parts & Racks', icon: Cpu, badge: dataStore.workshopSpareParts.length, badgeClass: 'bg-teal-500/20 text-teal-600 dark:text-teal-400' },
  { id: 'inward', label: 'China Parts Inward', icon: Boxes, badge: dataStore.workshopPartsInward.length, badgeClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  { id: 'dispatch', label: 'Dispatch & Delivery Challans (DC)', icon: Truck },
  { id: 'invoices', label: 'Workshop Invoices', icon: Receipt },
  { id: 'payments', label: 'Payments & Customer Ledger', icon: Banknote },
  { id: 'history', label: '360° Machine History', icon: History },
  { id: 'reports', label: 'Reports & Technicians', icon: FileSpreadsheet },
  { id: 'warranties', label: 'Warranty Registry', icon: ShieldCheck }
])

function selectTab(t) {
  activeTab.value = normalizeTab(t)
  router.replace({ query: { ...route.query, tab: activeTab.value } }).catch(() => {})
}

watch(() => route.query.tab, (newTab) => {
  activeTab.value = normalizeTab(newTab)
})

onMounted(() => {
  activeTab.value = normalizeTab(route.query.tab)
})

// ═══════════════════════════════════════════════════════
// WORKSHOP STATUSES (10-STAGE PIPELINE)
// ═══════════════════════════════════════════════════════
const allStages = [
  'Received',
  'Inspection',
  'Diagnosis',
  'Parts Required',
  'Repair in Process',
  'Waiting for Parts',
  'Repaired',
  'QC/Testing',
  'Ready for Delivery',
  'Delivered',
  'Closed'
]

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Received': return 'badge-neutral'
    case 'Inspection':
    case 'Diagnosis': return 'badge-info'
    case 'Parts Required':
    case 'Waiting for Parts': return 'badge-danger'
    case 'Repair in Process': return 'badge-warning'
    case 'Repaired':
    case 'QC/Testing': return 'badge-purple'
    case 'Ready for Delivery': return 'badge-success'
    case 'Delivered':
    case 'Closed': return 'badge-success'
    default: return 'badge-neutral'
  }
}

function formatTechnician(name) {
  if (!name) return { name: 'Assigned Tech', role: '' }
  const match = String(name).match(/^(.*?)(?:\s*\((.*?)\))?$/)
  if (match) {
    return {
      name: (match[1] || '').trim(),
      role: (match[2] || '').trim()
    }
  }
  return { name: String(name).trim(), role: '' }
}

// ═══════════════════════════════════════════════════════
// TAB 1: DASHBOARD METRICS
// ═══════════════════════════════════════════════════════
const activeWorkshopJobs = computed(() => {
  return dataStore.workshopJobCards.filter(j => j.status !== 'Delivered' && j.status !== 'Closed')
})

const activeWorkshopMachinesCount = computed(() => activeWorkshopJobs.value.length)
const inProcessJobsCount = computed(() => dataStore.workshopJobCards.filter(j => j.status === 'Repair in Process' || j.status === 'Diagnosis').length)
const waitingForPartsCount = computed(() => dataStore.workshopJobCards.filter(j => j.status === 'Waiting for Parts' || j.status === 'Parts Required').length)
const readyForDeliveryCount = computed(() => dataStore.workshopJobCards.filter(j => j.status === 'Ready for Delivery').length)
const deliveredJobsCount = computed(() => dataStore.workshopJobCards.filter(j => j.status === 'Delivered' || j.status === 'Closed').length)

const lowStockPartsCount = computed(() => {
  return dataStore.workshopSpareParts.filter(p => {
    const curr = Number(p.currentStock ?? p.stockQty ?? 0)
    const min = Number(p.minimumStockLevel ?? p.minQty ?? 5)
    return curr <= min
  }).length
})

const totalSparePartsStock = computed(() => {
  return dataStore.workshopSpareParts.reduce((sum, p) => sum + Number(p.currentStock ?? p.stockQty ?? 0), 0)
})

const warrantyJobsCount = computed(() => dataStore.workshopJobCards.filter(j => j.warrantyStatus === 'In Warranty').length)
const nonWarrantyJobsCount = computed(() => dataStore.workshopJobCards.filter(j => j.warrantyStatus !== 'In Warranty').length)

const totalWorkshopRevenue = computed(() => {
  return dataStore.workshopJobCards.reduce((sum, j) => sum + Number(j.paidAmount || 0), 0)
})

const totalWorkshopOutstanding = computed(() => {
  return dataStore.workshopJobCards.reduce((sum, j) => sum + Number(j.remainingBalance || 0), 0)
})

// ═══════════════════════════════════════════════════════
// TAB 2: JOB CARDS FILTERING & PAGINATION
// ═══════════════════════════════════════════════════════
const jobsSearch = ref('')
const jobsStatusFilter = ref('ALL')
const jobsCustomerTypeFilter = ref('ALL')
const jobsTechnicianFilter = ref('ALL')
const jobsPage = ref(1)
const jobsPageSize = ref(10)

const filteredJobCards = computed(() => {
  return dataStore.workshopJobCards.filter(j => {
    const q = jobsSearch.value.trim().toLowerCase()
    const matchQuery = !q ||
      (j.jobCardNo || '').toLowerCase().includes(q) ||
      (j.serialNumber || '').toLowerCase().includes(q) ||
      (j.customerName || '').toLowerCase().includes(q) ||
      (j.machineName || '').toLowerCase().includes(q) ||
      (j.assignedTechnician || '').toLowerCase().includes(q)

    const matchStatus = jobsStatusFilter.value === 'ALL' || j.status === jobsStatusFilter.value
    const matchCustType = jobsCustomerTypeFilter.value === 'ALL' || j.customerType === jobsCustomerTypeFilter.value
    const matchTech = jobsTechnicianFilter.value === 'ALL' || j.assignedTechnician === jobsTechnicianFilter.value

    return matchQuery && matchStatus && matchCustType && matchTech
  })
})

const paginatedJobCards = computed(() => {
  const start = (jobsPage.value - 1) * jobsPageSize.value
  return filteredJobCards.value.slice(start, start + jobsPageSize.value)
})

// ═══════════════════════════════════════════════════════
// TAB 3: SPARE PARTS FILTERING
// ═══════════════════════════════════════════════════════
const partsSearch = ref('')
const partsLowStockOnly = ref(false)

const filteredParts = computed(() => {
  return dataStore.workshopSpareParts.filter(p => {
    const q = partsSearch.value.trim().toLowerCase()
    const matchQuery = !q ||
      (p.partCode || '').toLowerCase().includes(q) ||
      (p.partName || p.name || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.locationRack || p.location || '').toLowerCase().includes(q)

    const curr = Number(p.currentStock ?? p.stockQty ?? 0)
    const min = Number(p.minimumStockLevel ?? p.minQty ?? 5)
    const isLow = curr <= min

    if (partsLowStockOnly.value && !isLow) return false
    return matchQuery
  })
})

// ═══════════════════════════════════════════════════════
// TAB 6: 360° LIFETIME MACHINE HISTORY
// ═══════════════════════════════════════════════════════
const historySearchSerial = ref('')
const searchedHistoryResult = ref(null)

function searchMachineHistory() {
  if (!historySearchSerial.value.trim()) return
  searchedHistoryResult.value = dataStore.getMachineLifetimeWorkshopHistory(historySearchSerial.value.trim())
}

// ═══════════════════════════════════════════════════════
// TAB 7: TECHNICIANS STATS
// ═══════════════════════════════════════════════════════
const technicianStats = computed(() => {
  return dataStore.workshopTechnicians.map(tech => {
    const jobs = dataStore.workshopJobCards.filter(j => j.assignedTechnician === tech)
    return {
      name: tech,
      assigned: jobs.length,
      inProcess: jobs.filter(j => j.status === 'Repair in Process' || j.status === 'Diagnosis').length,
      completed: jobs.filter(j => j.status === 'Repaired' || j.status === 'Delivered' || j.status === 'Closed').length
    }
  })
})

// ═══════════════════════════════════════════════════════
// TAB 8: FACTORY WARRANTIES
// ═══════════════════════════════════════════════════════
const warrantySearch = ref('')
const allWarranties = computed(() => dataStore.warranties || [])

function isWarrantyValid(expiryDateStr) {
  if (!expiryDateStr) return true
  return new Date(expiryDateStr) >= new Date()
}

const filteredWarranties = computed(() => {
  return allWarranties.value.filter(w => {
    const q = warrantySearch.value.trim().toLowerCase()
    return !q ||
      (w.serialCode || '').toLowerCase().includes(q) ||
      (w.machineCode || '').toLowerCase().includes(q) ||
      (w.customer || '').toLowerCase().includes(q) ||
      (w.productName || '').toLowerCase().includes(q)
  })
})

// ═══════════════════════════════════════════════════════
// MODAL STATE & ACTIONS
// ═══════════════════════════════════════════════════════
const showNewJobCardModal = ref(false)
const editingJobCard = ref(null)
const serialLookupMatch = ref(null)

const commonComplaintsList = [
  'No Power / Dead',
  'Display Artifacts / Dark Screen',
  'Probe Detection Error',
  'High Voltage Board Short',
  'Overheating / Fan Failure',
  'Calibration Required',
  'Noise / Mechanical Vibration',
  'Battery Failure / Low Backup'
]

function addComplaintTag(tag) {
  if (!newJobForm.value.customerComplaint) {
    newJobForm.value.customerComplaint = tag
  } else if (!newJobForm.value.customerComplaint.includes(tag)) {
    newJobForm.value.customerComplaint += `, ${tag}`
  }
}

const newJobForm = ref({
  serialNumber: '',
  customerName: '',
  customerPhone: '',
  customerType: 'Existing Company Customer',
  machineName: '',
  brand: '',
  model: '',
  warrantyStatus: 'In Warranty',
  receivingDate: new Date().toISOString().substring(0, 10),
  expectedDeliveryDate: '',
  assignedTechnician: 'Engr. Tariq Saeed (Senior Biomedical Specialist)',
  customerComplaint: '',
  machineCondition: 'Normal wear',
  accessoriesReceived: 'Power cord, 1 standard probe'
})

function openNewJobCardModal() {
  editingJobCard.value = null
  serialLookupMatch.value = null
  newJobForm.value = {
    serialNumber: '',
    customerName: '',
    customerPhone: '',
    customerType: 'Existing Company Customer',
    machineName: '',
    brand: '',
    model: '',
    warrantyStatus: 'In Warranty',
    receivingDate: new Date().toISOString().substring(0, 10),
    expectedDeliveryDate: '',
    assignedTechnician: dataStore.workshopTechnicians?.[0] || 'Engr. Tariq Saeed (Senior Biomedical Specialist)',
    customerComplaint: '',
    machineCondition: 'Normal wear',
    accessoriesReceived: 'Power cord'
  }
  showNewJobCardModal.value = true
}

function openEditJobCardModal(job) {
  editingJobCard.value = job
  serialLookupMatch.value = null
  newJobForm.value = {
    serialNumber: job.serialNumber || '',
    customerName: job.customerName || '',
    customerPhone: job.customerPhone || '',
    customerType: job.customerType || 'Existing Company Customer',
    machineName: job.machineName || '',
    brand: job.brand || '',
    model: job.model || '',
    warrantyStatus: job.warrantyStatus || 'In Warranty',
    receivingDate: job.receivingDate || new Date().toISOString().substring(0, 10),
    expectedDeliveryDate: job.expectedDeliveryDate || '',
    assignedTechnician: job.assignedTechnician || (dataStore.workshopTechnicians?.[0] || 'Engr. Tariq Saeed (Senior Biomedical Specialist)'),
    customerComplaint: job.customerComplaint || '',
    machineCondition: job.machineCondition || 'Normal wear',
    accessoriesReceived: job.accessoriesReceived || 'Power cord'
  }
  if (showJobDetailsModal.value) {
    showJobDetailsModal.value = false
  }
  showNewJobCardModal.value = true
}

function onSerialNumberInput() {
  triggerSerialLookup()
}

function triggerSerialLookup() {
  const q = (newJobForm.value.serialNumber || '').trim().toLowerCase().replace(/^sn-/i, '')
  if (!q) {
    serialLookupMatch.value = null
    return
  }
  const match = dataStore.serials.find(s => {
    const sCode = (s.serialCode || '').toLowerCase().replace(/^sn-/i, '')
    const mCode = (s.machineCode || '').toLowerCase()
    return sCode === q || mCode === q
  })

  if (match) {
    serialLookupMatch.value = match
    if (match.customer) newJobForm.value.customerName = match.customer
    if (match.productName) newJobForm.value.machineName = match.productName
    newJobForm.value.warrantyStatus = match.warrantyExpires ? 'In Warranty' : 'Out of Warranty'
  }
}

async function submitJobCardForm(printDossier = false) {
  try {
    let resultJob
    if (editingJobCard.value) {
      resultJob = await dataStore.updateWorkshopJobCard(editingJobCard.value.jobCardNo, newJobForm.value, authStore.user)
      uiStore.showToast(`Job Card ${resultJob.jobCardNo} updated successfully!`, 'success')
    } else {
      resultJob = await dataStore.createWorkshopJobCard(newJobForm.value, authStore.user)
      uiStore.showToast(`Job Card ${resultJob.jobCardNo} created and machine received!`, 'success')
    }
    showNewJobCardModal.value = false
    editingJobCard.value = null
    activeTab.value = 'jobs'
    if (printDossier && resultJob) {
      printSingleJobCard(resultJob)
    }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

const submitNewJobCard = () => submitJobCardForm(false)

// ── Job Details & Diagnosis Modal ──────────────────────
const showJobDetailsModal = ref(false)
const selectedJob = ref(null)
const editDiagnosisForm = ref({
  diagnosis: '',
  requiredRepair: '',
  labourCharges: 0,
  otherCharges: 0
})

const showIssuePartSection = ref(false)
const issuePartForm = ref({
  partCode: '',
  quantity: 1,
  isWarranty: false
})

function openJobDetailsModal(job) {
  selectedJob.value = job
  editDiagnosisForm.value = {
    diagnosis: job.faultDiagnosis?.diagnosis || '',
    requiredRepair: job.faultDiagnosis?.requiredRepair || '',
    labourCharges: Number(job.faultDiagnosis?.labourCharges || 0),
    otherCharges: Number(job.faultDiagnosis?.otherCharges || 0)
  }
  showIssuePartSection.value = false
  issuePartForm.value = { partCode: '', quantity: 1, isWarranty: job.warrantyStatus === 'In Warranty' }
  showJobDetailsModal.value = true
}

async function changeJobStage(st) {
  if (!selectedJob.value) return
  await dataStore.updateJobCardStatus(selectedJob.value.jobCardNo, st, `Stage changed to ${st}`, authStore.user)
  uiStore.showToast(`Stage updated to ${st}`, 'info')
}

async function saveJobDiagnosis() {
  if (!selectedJob.value) return
  await dataStore.updateJobCardDiagnosis(selectedJob.value.jobCardNo, editDiagnosisForm.value, authStore.user)
  uiStore.showToast('Diagnosis and labour charges saved!', 'success')
}

async function confirmIssuePart() {
  if (!issuePartForm.value.partCode) {
    uiStore.showToast('Please select a spare part!', 'error')
    return
  }
  try {
    await dataStore.issuePartToJobCard(
      selectedJob.value.jobCardNo,
      issuePartForm.value.partCode,
      issuePartForm.value.quantity,
      issuePartForm.value.isWarranty,
      authStore.user
    )
    uiStore.showToast('Spare part issued and stock deducted!', 'success')
    showIssuePartSection.value = false
    issuePartForm.value = { partCode: '', quantity: 1, isWarranty: false }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

async function returnPart(pIdx) {
  try {
    await dataStore.returnPartFromJobCard(selectedJob.value.jobCardNo, pIdx, 'Returned unused by engineer', authStore.user)
    uiStore.showToast('Spare part returned back to workshop inventory stock!', 'success')
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

// ── Inward China Parts Modal ──────────────────────────
const showNewInwardModal = ref(false)
const inwardForm = ref({
  supplierName: 'Shenzhen Medical Instruments Ltd',
  invoiceNo: '',
  blReference: '',
  receivingDate: new Date().toISOString().substring(0, 10),
  branch: activeBranchFilter.value,
  remarks: '',
  parts: [
    { partCode: '', partName: '', brand: '', model: '', quantity: 1, unitCost: 0, locationRack: 'Rack A', locationCabinet: 'Cab 1' }
  ]
})

function openNewInwardModal() {
  inwardForm.value = {
    supplierName: 'Shenzhen Medical Instruments Ltd',
    invoiceNo: `INV-CN-${Date.now().toString().slice(-4)}`,
    blReference: `BL-CN-${Date.now().toString().slice(-4)}`,
    receivingDate: new Date().toISOString().substring(0, 10),
    branch: activeBranchFilter.value,
    remarks: '',
    parts: [
      { partCode: '', partName: '', brand: '', model: '', quantity: 1, unitCost: 0, locationRack: 'Rack A', locationCabinet: 'Cab 1' }
    ]
  }
  showNewInwardModal.value = true
}

function onInwardPartCodeChange(item) {
  if (!item.partCode) return
  const q = item.partCode.trim().toLowerCase()
  const existing = dataStore.workshopSpareParts.find(p => p.partCode?.toLowerCase() === q)
  if (existing) {
    if (!item.partName || item.partName === item.partCode) item.partName = existing.partName || existing.name || ''
    if (!item.brand) item.brand = existing.brand || ''
    if (!item.locationRack || item.locationRack === 'Rack A') item.locationRack = existing.locationRack || 'Rack A'
    if (!item.locationCabinet) item.locationCabinet = existing.locationCabinet || 'Cab 1'
    if (!item.unitCost || item.unitCost === 0) item.unitCost = Number(existing.purchasePrice || existing.costPrice || existing.unitCost || 0)
  }
}

function addInwardLineItem() {
  inwardForm.value.parts.push({
    partCode: '',
    partName: '',
    brand: '',
    model: '',
    quantity: 1,
    unitCost: 0,
    locationRack: 'Rack A',
    locationCabinet: 'Cab 1'
  })
}

function removeInwardLineItem(idx) {
  if (inwardForm.value.parts.length > 1) {
    inwardForm.value.parts.splice(idx, 1)
  }
}

async function submitInwardShipment(printInvoice = false) {
  try {
    const inw = await dataStore.receiveWorkshopPartsInward(inwardForm.value, authStore.user)
    uiStore.showToast(`Inward Shipment ${inw.inwardNo} received and added to inventory!`, 'success')
    showNewInwardModal.value = false
    activeTab.value = 'inward'
    if (printInvoice) {
      printInwardShipmentInvoice(inw)
    }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

function printInwardShipmentInvoice(inw) {
  const metadata = {
    'Inward GRN #': inw.inwardNo,
    'Receiving Date': inw.receivingDate,
    'Supplier / Exporter': inw.supplierName,
    'Purchase Invoice #': inw.invoiceNo || 'N/A',
    'BL / Shipment Ref': inw.blReference || 'N/A',
    'Warehouse Destination': inw.branch || 'Peshawar',
    'Received By': inw.recordedBy || 'Storekeeper',
    'Total Value': `PKR ${(Number(inw.totalAmount) || 0).toLocaleString()}`,
    'Remarks': inw.remarks || 'Standard spare parts receipt'
  }
  const columns = ['#', 'Part Code', 'Part Name / Description', 'Brand / Model', 'Rack Location', 'Quantity', 'Unit Cost (PKR)', 'Total Amount (PKR)']
  const rows = (inw.parts || []).map((p, idx) => [
    idx + 1,
    p.partCode,
    p.partName || p.name || 'Spare Part',
    p.brand ? `${p.brand} ${p.model || ''}` : '—',
    p.locationRack || 'Rack A',
    p.quantity,
    Number(p.unitCost || 0).toLocaleString(),
    (Number(p.quantity || 0) * Number(p.unitCost || 0)).toLocaleString()
  ])
  exportPrint(`Goods Receipt Note (GRN) - Inward Spare Parts ${inw.inwardNo}`, metadata, columns, rows)
}

function exportInwardExcel(inw) {
  const rows = (inw.parts || []).map((p, idx) => ({
    '#': idx + 1,
    'Inward #': inw.inwardNo,
    'Receiving Date': inw.receivingDate,
    'Supplier': inw.supplierName,
    'Invoice #': inw.invoiceNo || 'N/A',
    'BL Ref': inw.blReference || 'N/A',
    'Part Code': p.partCode,
    'Part Name': p.partName || p.name,
    'Brand': p.brand || '',
    'Rack Location': p.locationRack || 'Rack A',
    'Quantity': p.quantity,
    'Unit Cost (PKR)': p.unitCost || 0,
    'Line Total (PKR)': (Number(p.quantity || 0) * Number(p.unitCost || 0)),
    'Branch': inw.branch || 'Peshawar'
  }))
  exportXLSX(rows, `Inward_Parts_${inw.inwardNo}.xlsx`)
}

// ── Add New Part Modal ────────────────────────────────
const showNewPartModal = ref(false)
const partForm = ref({
  partCode: '',
  name: '',
  brand: '',
  model: '',
  locationRack: 'Rack A',
  locationCabinet: 'Cab 1',
  locationShelf: 'Shelf 1',
  stockQty: 5,
  minQty: 2,
  unitCost: 5000
})

function openNewPartModal() {
  partForm.value = {
    partCode: '',
    name: '',
    brand: '',
    model: '',
    locationRack: 'Rack A',
    locationCabinet: 'Cab 1',
    locationShelf: 'Shelf 1',
    stockQty: 5,
    minQty: 2,
    unitCost: 5000
  }
  showNewPartModal.value = true
}

async function submitNewPart() {
  try {
    await dataStore.addWorkshopPart(partForm.value, authStore.user)
    uiStore.showToast('Spare part added to warehouse inventory!', 'success')
    showNewPartModal.value = false
    activeTab.value = 'inventory'
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

async function deleteSparePart(part) {
  if (confirm(`Are you sure you want to delete spare part ${part.partCode}?`)) {
    await dataStore.deleteWorkshopPart(part.partCode, authStore.user)
    uiStore.showToast('Spare part deleted', 'info')
  }
}

async function deleteJobCard(job) {
  if (confirm(`Are you sure you want to delete Job Card ${job.jobCardNo}?`)) {
    await dataStore.deleteWorkshopJobCard(job.jobCardNo, authStore.user)
    uiStore.showToast('Job Card deleted', 'info')
  }
}

// ═══════════════════════════════════════════════════════
// TAB 5: DISPATCH & DELIVERY CHALLANS (DC) SYSTEM
// ═══════════════════════════════════════════════════════
const dispatchSearch = ref('')
const dispatchStatusFilter = ref('ALL')
const showDispatchModal = ref(false)
const selectedJobForDispatch = ref(null)

const dispatchForm = ref({
  shipmentType: 'Daewoo Cargo',
  cargoService: '',
  trackingNo: '',
  deliveryCharges: 0,
  dispatchDate: new Date().toISOString().substring(0, 10),
  repairedBy: '',
  receiverName: '',
  receiverPhone: '',
  deliveryAddress: '',
  dispatchStatus: 'Dispatched',
  remarks: ''
})

const readyForDispatchCount = computed(() => {
  return dataStore.workshopJobCards.filter(j => 
    j.status === 'Ready for Delivery' || j.status === 'Repaired' || j.status === 'QC/Testing'
  ).length
})

const dispatchedCount = computed(() => {
  return dataStore.workshopJobCards.filter(j => 
    j.dispatchStatus === 'Dispatched' || j.dispatchStatus === 'In Transit'
  ).length
})

const deliveredCount = computed(() => {
  return dataStore.workshopJobCards.filter(j => 
    j.status === 'Delivered' || j.status === 'Closed' || j.dispatchStatus === 'Delivered'
  ).length
})

const totalDeliveryCharges = computed(() => {
  return dataStore.workshopJobCards.reduce((sum, j) => sum + Number(j.deliveryCharges || 0), 0)
})

const filteredDispatchJobs = computed(() => {
  return dataStore.workshopJobCards.filter(j => {
    const q = dispatchSearch.value.trim().toLowerCase()
    const matchQuery = !q ||
      (j.dcNumber || '').toLowerCase().includes(q) ||
      (j.jobCardNo || '').toLowerCase().includes(q) ||
      (j.customerName || '').toLowerCase().includes(q) ||
      (j.serialNumber || '').toLowerCase().includes(q) ||
      (j.cargoService || '').toLowerCase().includes(q) ||
      (j.trackingNo || '').toLowerCase().includes(q) ||
      (j.repairedBy || '').toLowerCase().includes(q)

    if (dispatchStatusFilter.value === 'READY') {
      return matchQuery && (j.status === 'Ready for Delivery' || j.status === 'Repaired')
    }
    if (dispatchStatusFilter.value === 'DISPATCHED') {
      return matchQuery && (j.dispatchStatus === 'Dispatched' || j.dispatchStatus === 'In Transit')
    }
    if (dispatchStatusFilter.value === 'DELIVERED') {
      return matchQuery && (j.status === 'Delivered' || j.status === 'Closed' || j.dispatchStatus === 'Delivered')
    }
    return matchQuery
  })
})

function getDispatchBadgeClass(job) {
  const st = job.dispatchStatus || job.status
  if (st === 'Delivered' || st === 'Closed') return 'badge-success'
  if (st === 'Dispatched' || st === 'In Transit') return 'badge-primary'
  if (st === 'Ready for Delivery') return 'badge-warning'
  return 'badge-neutral'
}

function openDispatchModal(job) {
  selectedJobForDispatch.value = job
  dispatchForm.value = {
    shipmentType: job.shipmentType || 'Daewoo Cargo',
    cargoService: job.cargoService || (job.shipmentType ? job.shipmentType : 'Daewoo Express Cargo'),
    trackingNo: job.trackingNo || '',
    deliveryCharges: Number(job.deliveryCharges || 0),
    dispatchDate: job.dispatchDate || new Date().toISOString().substring(0, 10),
    repairedBy: job.repairedBy || job.assignedTechnician || (dataStore.workshopTechnicians?.[0] || 'Engr. Tariq Saeed'),
    receiverName: job.receiverName || job.customerName || '',
    receiverPhone: job.receiverPhone || job.customerPhone || '',
    deliveryAddress: job.deliveryAddress || '',
    dispatchStatus: job.dispatchStatus || 'Dispatched',
    remarks: job.remarks || ''
  }
  showDispatchModal.value = true
}

async function submitDispatch(printDC = false) {
  if (!selectedJobForDispatch.value) return
  try {
    const job = await dataStore.updateWorkshopDispatch(selectedJobForDispatch.value.jobCardNo, dispatchForm.value, authStore.user)
    if (!job.dcGenerated) {
      await dataStore.generateWorkshopDC(job.jobCardNo, authStore.user)
    }
    uiStore.showToast(`Dispatch details updated for ${job.jobCardNo}!`, 'success')
    showDispatchModal.value = false
    if (printDC) {
      printDeliveryChallan(job)
    }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

async function quickMarkDelivered(job) {
  try {
    await dataStore.updateJobCardStatus(job.jobCardNo, 'Delivered', 'Machine delivered and handed over to customer', authStore.user)
    await dataStore.updateWorkshopDispatch(job.jobCardNo, { dispatchStatus: 'Delivered' }, authStore.user)
    uiStore.showToast(`Job ${job.jobCardNo} marked as Delivered!`, 'success')
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

function exportDispatchRegistryExcel() {
  const rows = filteredDispatchJobs.value.map(j => ({
    'DC #': j.dcNumber || 'Pending',
    'Job Card #': j.jobCardNo,
    'Customer Name': j.customerName,
    'Machine Name': j.machineName,
    'Serial Number': (j.serialNumber || '').replace(/^SN-/i, ''),
    'Repaired By': j.repairedBy || j.assignedTechnician,
    'Cargo Service': j.cargoService || j.shipmentType || 'N/A',
    'Tracking / Bilty #': j.trackingNo || 'N/A',
    'Delivery Charges (PKR)': j.deliveryCharges || 0,
    'Dispatch Date': j.dispatchDate || j.deliveryDate || 'N/A',
    'Receiver Name': j.receiverName || j.customerName,
    'Receiver Phone': j.receiverPhone || j.customerPhone || 'N/A',
    'Delivery Address': j.deliveryAddress || 'N/A',
    'Status': j.dispatchStatus || j.status
  }))
  exportXLSX(rows, `Workshop_Dispatches_${new Date().toISOString().substring(0, 10)}.xlsx`)
}

// ═══════════════════════════════════════════════════════
// TAB 6: WORKSHOP INVOICES & BILLING
// ═══════════════════════════════════════════════════════
const invoicesSearch = ref('')
const invoiceStatusFilter = ref('ALL')
const showInvoiceModal = ref(false)
const selectedJobForInvoice = ref(null)

const invoiceForm = ref({
  repairedBy: '',
  date: new Date().toISOString().substring(0, 10),
  labourCharges: 0,
  otherCharges: 0,
  deliveryCharges: 0,
  discount: 0
})

const totalInvoicesCount = computed(() => {
  return dataStore.workshopJobCards.filter(j => j.invoiceGenerated).length
})

const totalInvoicedAmount = computed(() => {
  return dataStore.workshopJobCards.reduce((sum, j) => sum + Number(j.totalInvoiceAmount || 0), 0)
})

const totalInvoicedPaid = computed(() => {
  return dataStore.workshopJobCards.reduce((sum, j) => sum + Number(j.paidAmount || 0), 0)
})

const totalInvoicedRemaining = computed(() => {
  return dataStore.workshopJobCards.reduce((sum, j) => sum + Number(j.remainingBalance || 0), 0)
})

const filteredInvoiceJobs = computed(() => {
  return dataStore.workshopJobCards.filter(j => {
    const q = invoicesSearch.value.trim().toLowerCase()
    const matchQuery = !q ||
      (j.invoiceNumber || '').toLowerCase().includes(q) ||
      (j.jobCardNo || '').toLowerCase().includes(q) ||
      (j.customerName || '').toLowerCase().includes(q) ||
      (j.serialNumber || '').toLowerCase().includes(q) ||
      (j.repairedBy || '').toLowerCase().includes(q)

    if (invoiceStatusFilter.value === 'UNPAID') {
      return matchQuery && (j.paymentStatus === 'Unpaid' || !j.paymentStatus)
    }
    if (invoiceStatusFilter.value === 'PARTIAL') {
      return matchQuery && j.paymentStatus === 'Partial'
    }
    if (invoiceStatusFilter.value === 'PAID') {
      return matchQuery && j.paymentStatus === 'Paid'
    }
    return matchQuery
  })
})

const computedInvoicePartsCost = computed(() => {
  if (!selectedJobForInvoice.value) return 0
  return (selectedJobForInvoice.value.partsUsed || []).reduce((sum, p) => {
    if (p.isWarranty) return sum
    return sum + (Number(p.quantity || 1) * Number(p.unitPrice || 0))
  }, 0)
})

const computedInvoiceGrandTotal = computed(() => {
  const parts = computedInvoicePartsCost.value
  const labour = Number(invoiceForm.value.labourCharges || 0)
  const other = Number(invoiceForm.value.otherCharges || 0)
  const delivery = Number(invoiceForm.value.deliveryCharges || 0)
  const discount = Number(invoiceForm.value.discount || 0)
  return Math.max(0, parts + labour + other + delivery - discount)
})

function openInvoiceModal(job) {
  selectedJobForInvoice.value = job
  invoiceForm.value = {
    repairedBy: job.repairedBy || job.assignedTechnician || (dataStore.workshopTechnicians?.[0] || 'Engr. Tariq Saeed'),
    date: new Date().toISOString().substring(0, 10),
    labourCharges: Number(job.faultDiagnosis?.labourCharges || 0),
    otherCharges: Number(job.faultDiagnosis?.otherCharges || 0),
    deliveryCharges: Number(job.deliveryCharges || 0),
    discount: Number(job.discount || 0)
  }
  showInvoiceModal.value = true
}

async function submitInvoiceForm(printNow = false) {
  if (!selectedJobForInvoice.value) return
  try {
    const job = await dataStore.generateWorkshopInvoice(
      selectedJobForInvoice.value.jobCardNo,
      {
        repairedBy: invoiceForm.value.repairedBy,
        labourCharges: invoiceForm.value.labourCharges,
        otherCharges: invoiceForm.value.otherCharges,
        deliveryCharges: invoiceForm.value.deliveryCharges,
        discount: invoiceForm.value.discount
      },
      authStore.user
    )
    uiStore.showToast(`Workshop Invoice ${job.invoiceNumber} generated!`, 'success')
    showInvoiceModal.value = false
    if (printNow) {
      printWorkshopInvoice(job)
    }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

function exportWorkshopInvoicesExcel() {
  const rows = filteredInvoiceJobs.value.map(j => ({
    'Invoice #': j.invoiceNumber || 'Pending',
    'Job Card #': j.jobCardNo,
    'Customer Name': j.customerName,
    'Machine': j.machineName,
    'Serial Number': (j.serialNumber || '').replace(/^SN-/i, ''),
    'Repaired By': j.repairedBy || j.assignedTechnician,
    'Parts Subtotal': (j.partsUsed || []).reduce((s, p) => s + (p.isWarranty ? 0 : Number(p.quantity || 1) * Number(p.unitPrice || 0)), 0),
    'Labour Charges': j.faultDiagnosis?.labourCharges || 0,
    'Delivery / Cargo': j.deliveryCharges || 0,
    'Grand Total': j.totalInvoiceAmount || 0,
    'Paid Amount': j.paidAmount || 0,
    'Remaining Balance': j.remainingBalance || 0,
    'Payment Status': j.paymentStatus || 'Unpaid'
  }))
  exportXLSX(rows, `Workshop_Invoices_${new Date().toISOString().substring(0, 10)}.xlsx`)
}

// ═══════════════════════════════════════════════════════
// TAB 7: WORKSHOP PAYMENTS & LEDGER
// ═══════════════════════════════════════════════════════
const paymentsSearch = ref('')
const paymentMethodFilter = ref('ALL')

const unpaidJobsList = computed(() => {
  return dataStore.workshopJobCards.filter(j => Number(j.remainingBalance || 0) > 0)
})

const allWorkshopPayments = computed(() => {
  const receipts = []
  for (const job of dataStore.workshopJobCards) {
    for (const p of (job.paymentHistory || [])) {
      receipts.push({
        receiptNo: p.receiptNo || `WPR-${job.jobCardNo.replace(/^JC-/i, '')}`,
        date: p.date,
        jobCardNo: job.jobCardNo,
        invoiceNumber: job.invoiceNumber || 'N/A',
        customerName: job.customerName,
        machineName: job.machineName,
        repairedBy: job.repairedBy || job.assignedTechnician || 'Technician',
        amount: Number(p.amount || 0),
        method: p.method || 'Cash',
        receivedBy: p.recordedBy || 'Workshop Cashier',
        notes: p.notes || '',
        remainingBalance: job.remainingBalance || 0
      })
    }
  }
  return receipts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
})

const filteredWorkshopPayments = computed(() => {
  return allWorkshopPayments.value.filter(p => {
    const q = paymentsSearch.value.trim().toLowerCase()
    const matchQuery = !q ||
      (p.receiptNo || '').toLowerCase().includes(q) ||
      (p.jobCardNo || '').toLowerCase().includes(q) ||
      (p.invoiceNumber || '').toLowerCase().includes(q) ||
      (p.customerName || '').toLowerCase().includes(q) ||
      (p.machineName || '').toLowerCase().includes(q)

    const matchMethod = paymentMethodFilter.value === 'ALL' || p.method === paymentMethodFilter.value
    return matchQuery && matchMethod
  })
})

function printPaymentReceiptSlip(p) {
  const metadata = {
    'Payment Receipt #': p.receiptNo,
    'Date': p.date,
    'Job Card #': p.jobCardNo,
    'Invoice #': p.invoiceNumber,
    'Customer Name': p.customerName,
    'Machine Unit': p.machineName,
    'Repaired By': p.repairedBy,
    'Payment Mode': p.method,
    'Received By': p.receivedBy,
    'Notes / Remarks': p.notes || 'Full / partial workshop repair payment'
  }
  const columns = ['Transaction Description', 'Amount (PKR)']
  const rows = [
    ['Workshop Machine Repair & Technical Services Payment', `PKR ${p.amount.toLocaleString()}`],
    ['Outstanding Job Balance After Payment', `PKR ${Number(p.remainingBalance || 0).toLocaleString()}`]
  ]
  exportPrint(`Workshop Payment Receipt - ${p.receiptNo}`, metadata, columns, rows)
}

// ── Billing, DC & Invoice Actions ─────────────────────
async function generateDC(job) {
  await dataStore.generateWorkshopDC(job.jobCardNo, authStore.user)
  uiStore.showToast(`Delivery Challan ${job.dcNumber} generated!`, 'success')
}

async function generateInvoice(job) {
  await dataStore.generateWorkshopInvoice(job.jobCardNo, {}, authStore.user)
  uiStore.showToast(`Workshop Invoice ${job.invoiceNumber} generated!`, 'success')
}

const showPaymentModal = ref(false)
const selectedJobForPayment = ref(null)
const paymentForm = ref({
  amount: 0,
  method: 'Cash',
  date: new Date().toISOString().substring(0, 10),
  notes: ''
})

function openPaymentModal(job) {
  selectedJobForPayment.value = job
  paymentForm.value = {
    amount: Number(job.remainingBalance || 0),
    method: 'Cash',
    date: new Date().toISOString().substring(0, 10),
    notes: 'Payment received at workshop'
  }
  showPaymentModal.value = true
}

async function submitWorkshopPayment() {
  try {
    await dataStore.recordWorkshopPayment(selectedJobForPayment.value.jobCardNo, paymentForm.value, authStore.user)
    uiStore.showToast('Payment recorded into workshop ledger!', 'success')
    showPaymentModal.value = false
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

// ═══════════════════════════════════════════════════════
// PRINT TEMPLATES & EXPORT HELPERS
// ═══════════════════════════════════════════════════════
function printSingleJobCard(job) {
  const metadata = {
    'Job Card #': job.jobCardNo,
    'Receiving Date': job.receivingDate,
    'Customer': job.customerName,
    'Contact': job.customerPhone || 'N/A',
    'Machine': `${job.machineName} (${job.brand || ''} ${job.model || ''})`,
    'Serial Number': job.serialNumber,
    'Warranty': job.warrantyStatus,
    'Assigned Technician': job.assignedTechnician,
    'Current Status': job.status,
    'Accessories Received': job.accessoriesReceived || 'Standard accessories'
  }
  const columns = ['Parameter', 'Details / Observations']
  const rows = [
    ['Customer Complaint', job.customerComplaint || 'General diagnostic inspection'],
    ['Condition on Receiving', job.machineCondition || 'Normal operational wear'],
    ['Diagnostic Findings', job.faultDiagnosis?.diagnosis || 'Pending inspection'],
    ['Required Repair Actions', job.faultDiagnosis?.requiredRepair || 'As per engineering assessment'],
    ['Labour / Service Charges', `PKR ${(job.faultDiagnosis?.labourCharges || 0).toLocaleString()}`],
    ['Spare Parts Count', `${(job.partsUsed || []).length} items`]
  ]
  exportPrint(`Workshop Job Card - ${job.jobCardNo}`, metadata, columns, rows)
}

function printDeliveryChallan(job) {
  const metadata = {
    'Delivery Challan #': job.dcNumber,
    'Job Card #': job.jobCardNo,
    'Customer Name': job.customerName,
    'Machine & Model': `${job.machineName} (${job.brand} ${job.model})`,
    'Serial Number': job.serialNumber,
    'Delivery Date': job.deliveryDate || new Date().toISOString().substring(0, 10),
    'Accessories Returned': job.accessoriesReceived || 'Complete unit accessories',
    'Testing / QC Status': 'Tested & Cleared for Dispatch',
    'Technician Signoff': job.assignedTechnician
  }
  const columns = ['Item Description', 'Work Performed / Parts Installed', 'Warranty Status']
  const rows = (job.partsUsed || []).map(p => [
    p.partName,
    `Replaced ${p.quantity} Unit(s)`,
    p.isWarranty ? 'Under Warranty' : 'Paid'
  ])
  if (rows.length === 0) {
    rows.push(['General Service & Calibration', 'Full optical and electronic calibration performed', 'Service Cleared'])
  }
  exportPrint(`Workshop Delivery Challan (DC) - ${job.dcNumber}`, metadata, columns, rows)
}

function printWorkshopInvoice(job) {
  const metadata = {
    'Invoice #': job.invoiceNumber,
    'Job Card #': job.jobCardNo,
    'Customer': job.customerName,
    'Machine Serial': job.serialNumber,
    'Invoice Date': new Date().toISOString().substring(0, 10),
    'Total Amount': `PKR ${(job.totalInvoiceAmount || 0).toLocaleString()}`,
    'Payment Received': `PKR ${(job.paidAmount || 0).toLocaleString()}`,
    'Remaining Balance': `PKR ${(job.remainingBalance || 0).toLocaleString()}`,
    'Payment Status': job.paymentStatus || 'Unpaid'
  }
  const columns = ['Description', 'Qty', 'Unit Rate (PKR)', 'Total (PKR)']
  const rows = (job.partsUsed || []).map(p => [
    `Spare Part: ${p.partName} (${p.partCode})`,
    p.quantity,
    (p.unitPrice || 0).toLocaleString(),
    (p.quantity * p.unitPrice).toLocaleString()
  ])
  if (job.faultDiagnosis?.labourCharges) {
    rows.push(['Labour & Technical Service Charges', '1', job.faultDiagnosis.labourCharges.toLocaleString(), job.faultDiagnosis.labourCharges.toLocaleString()])
  }
  if (job.faultDiagnosis?.otherCharges) {
    rows.push(['Workshop Consumables & Logistics', '1', job.faultDiagnosis.otherCharges.toLocaleString(), job.faultDiagnosis.otherCharges.toLocaleString()])
  }
  exportPrint(`Workshop Tax Invoice - ${job.invoiceNumber}`, metadata, columns, rows)
}

function printMachineHistoryDossier() {
  if (!searchedHistoryResult.value) return
  const r = searchedHistoryResult.value
  const metadata = {
    'Serial Number': r.serialNumber,
    'Machine Code': r.registeredSerial?.machineCode || 'N/A',
    'Equipment Name': r.registeredSerial?.productName || 'Equipment Unit',
    'Customer': r.registeredSerial?.customer || r.sale?.customer || 'N/A',
    'Total Lifetime Visits': `${r.totalRepairsCount} Visits`,
    'Total Parts Installed': `${r.totalPartsInstalled} Parts`,
    'Total Repair Billed': `PKR ${r.totalBilled.toLocaleString()}`,
    'Report Date': new Date().toLocaleDateString('en-GB')
  }
  const columns = ['Job Card #', 'Receiving Date', 'Fault / Complaint', 'Diagnostic Findings', 'Parts Installed', 'Technician', 'Status']
  const rows = r.jobCards.map(j => [
    j.jobCardNo,
    j.receivingDate,
    j.customerComplaint || 'General Service',
    j.faultDiagnosis?.diagnosis || 'Inspected',
    (j.partsUsed || []).map(p => `${p.partName} (${p.quantity})`).join(', ') || 'None',
    j.assignedTechnician,
    j.status
  ])
  exportPrint(`360° Lifetime Machine History - ${r.serialNumber}`, metadata, columns, rows)
}

function printJobCardsRegistry() {
  const metadata = {
    'Report': 'Workshop Job Cards Registry',
    'Branch': activeBranchFilter.value,
    'Total Jobs': filteredJobCards.value.length,
    'Date': new Date().toLocaleDateString('en-GB')
  }
  const columns = ['Job Card #', 'Date', 'Customer', 'Machine', 'Serial', 'Technician', 'Status', 'Total (PKR)', 'Balance (PKR)']
  const rows = filteredJobCards.value.map(j => [
    j.jobCardNo,
    j.receivingDate,
    j.customerName,
    j.machineName,
    (j.serialNumber || '').replace(/^SN-/i, ''),
    j.assignedTechnician,
    j.status,
    (j.totalInvoiceAmount || 0).toLocaleString(),
    (j.remainingBalance || 0).toLocaleString()
  ])
  exportPrint('Workshop Job Cards Registry', metadata, columns, rows)
}

function printPartsInventoryReport() {
  const metadata = {
    'Report': 'Workshop Spare Parts Inventory & Rack Locations',
    'Total Unique Parts': filteredParts.value.length,
    'Total Stock Qty': totalSparePartsStock.value,
    'Date': new Date().toLocaleDateString('en-GB')
  }
  const columns = ['Part Code', 'Part Name', 'Brand / Model', 'Rack Location', 'Cabinet / Shelf', 'Stock', 'Min Alert', 'Unit Cost (PKR)']
  const rows = filteredParts.value.map(p => [
    p.partCode,
    p.partName || p.name,
    `${p.brand || ''} ${p.model || ''}`,
    p.locationRack || p.location || 'Rack Main',
    `${p.locationCabinet || 'Cab 1'} / ${p.locationShelf || 'Shelf 1'}`,
    p.currentStock ?? p.stockQty ?? 0,
    p.minimumStockLevel ?? p.minQty ?? 5,
    (p.costPrice ?? p.purchasePrice ?? p.unitCost ?? 0).toLocaleString()
  ])
  exportPrint('Spare Parts Inventory & Rack Report', metadata, columns, rows)
}

function exportJobCardsExcel() {
  const rows = filteredJobCards.value.map(j => ({
    'Job Card #': j.jobCardNo,
    'Receiving Date': j.receivingDate,
    'Customer Name': j.customerName,
    'Customer Contact': j.customerPhone,
    'Customer Type': j.customerType,
    'Machine Name': j.machineName,
    'Brand': j.brand,
    'Model': j.model,
    'Serial Number': (j.serialNumber || '').replace(/^SN-/i, ''),
    'Warranty Status': j.warrantyStatus,
    'Complaint': j.customerComplaint,
    'Technician': j.assignedTechnician,
    'Status': j.status,
    'DC Number': j.dcNumber || 'N/A',
    'Invoice Number': j.invoiceNumber || 'N/A',
    'Total Amount (PKR)': j.totalInvoiceAmount || 0,
    'Paid Amount (PKR)': j.paidAmount || 0,
    'Remaining Balance (PKR)': j.remainingBalance || 0
  }))
  exportXLSX(rows, `Workshop_Job_Cards_${new Date().toISOString().substring(0, 10)}.xlsx`)
}
</script>

<style scoped>
.page-wrapper {
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-card, #ffffff);
  color: var(--text-color, #1e293b);
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
}

:root[data-theme="dark"] .modal-content {
  background: #0f172a;
  color: #f8fafc;
  border-color: #334155;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
