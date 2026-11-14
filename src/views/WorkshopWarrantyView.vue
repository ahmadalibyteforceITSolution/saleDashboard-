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
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="openEditJobCardModal(job)"
                      class="btn btn-xs btn-secondary text-amber-600 dark:text-amber-400 font-bold shadow-sm flex items-center gap-1"
                      title="Edit / Manage Job Card, Diagnostics, Parts & Dispatch"
                    >
                      <Pencil :size="12" />
                      <span>Edit</span>
                    </button>
                    <button
                      @click="printDeliveryChallan(job)"
                      class="btn btn-xs btn-secondary text-indigo-600 dark:text-indigo-400 font-bold shadow-sm flex items-center gap-1"
                      :title="job.dcGenerated ? `Print Delivery Challan (${job.dcNumber})` : 'Print Delivery Challan (DC)'"
                    >
                      <Truck :size="12" />
                      <span class="text-[10px]">DC</span>
                    </button>
                    <button
                      @click="printWorkshopInvoice(job)"
                      class="btn btn-xs btn-secondary text-blue-600 dark:text-blue-400 font-bold shadow-sm flex items-center gap-1"
                      :title="job.invoiceGenerated ? `Print Workshop Invoice (${job.invoiceNumber})` : 'Print Workshop Invoice'"
                    >
                      <Receipt :size="12" />
                      <span class="text-[10px]">INV</span>
                    </button>
                    <button
                      @click="printSingleJobCard(job)"
                      class="btn btn-xs btn-secondary shadow-sm flex items-center gap-1"
                      title="Print Job Card Dossier"
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
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span v-if="job.machineCode" class="font-bold text-indigo-600 dark:text-indigo-400 mr-1">[{{ job.machineCode }}]</span>
                  <span>{{ job.brand }} {{ job.model }}</span>
                </div>
              </td>
              <td class="font-mono font-bold text-sky-600 dark:text-sky-400">
                <span class="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800/40">
                  {{ (job.serialNumber || '').replace(/^SN-/i, '') }}
                </span>
                <div v-if="job.receivedVia" class="text-[9px] text-slate-400 font-sans mt-0.5 font-normal truncate max-w-[140px]" :title="job.receivedVia + (job.receivingTrackingNo ? ' #' + job.receivingTrackingNo : '')">
                  Via: {{ job.receivedVia }}
                </div>
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
                    title="Edit & Manage Job Card, Diagnostics, Parts & Dispatch"
                  >
                    <Pencil :size="12" />
                    <span>Edit</span>
                  </button>
                  <button
                    @click="printSingleJobCard(job)"
                    class="btn btn-xs btn-secondary shadow-sm flex items-center gap-1"
                    title="Print Job Card Dossier"
                  >
                    <Printer :size="12" />
                  </button>
                  <button
                    @click="printDeliveryChallan(job)"
                    class="btn btn-xs btn-secondary text-indigo-600 dark:text-indigo-400 font-bold shadow-sm flex items-center gap-1"
                    :title="job.dcGenerated ? `Print Delivery Challan (${job.dcNumber})` : 'Print Delivery Challan (DC)'"
                  >
                    <Truck :size="12" />
                    <span class="text-[10px]">DC</span>
                  </button>
                  <button
                    @click="printWorkshopInvoice(job)"
                    class="btn btn-xs btn-secondary text-blue-600 dark:text-blue-400 font-bold shadow-sm flex items-center gap-1"
                    :title="job.invoiceGenerated ? `Print Workshop Invoice (${job.invoiceNumber})` : 'Print Workshop Invoice'"
                  >
                    <Receipt :size="12" />
                    <span class="text-[10px]">INV</span>
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
              <th class="w-12 text-center">Photo</th>
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
              <td class="text-center" style="width: 52px; vertical-align: middle; padding: 0.35rem 0.5rem;">
                <div v-if="part.image" class="part-thumb-box cursor-pointer group" @click="openPartImagePreview(part)" title="Click to view full photo">
                  <img :src="part.image" alt="Part" class="part-thumb-img" />
                  <div class="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Eye :size="12" />
                  </div>
                </div>
                <div v-else class="part-thumb-box" style="border-style: dashed; border-color: rgba(148, 163, 184, 0.4); background: rgba(148, 163, 184, 0.08);" title="No photo uploaded">
                  <Cpu :size="15" class="text-slate-400" />
                </div>
              </td>
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
              <td colspan="12" class="text-center py-12 text-slate-400">
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
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="badge badge-info text-[10px] font-mono">
                    {{ (inw.parts || []).length }} Part Lines ({{ (inw.parts || []).reduce((sum, p) => sum + Number(p.quantity || 0), 0) }} pcs)
                  </span>
                  <template v-for="(p, pIdx) in (inw.parts || []).slice(0, 3)" :key="pIdx">
                    <img
                      v-if="p.image"
                      :src="p.image"
                      alt="Part"
                      @click="previewPartImage = { url: p.image, title: p.partName || p.partCode || 'Inward Part', sub: `GRN: ${inw.inwardNo} • Qty: ${p.quantity}` }"
                      class="part-mini-thumb cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all shadow-xs"
                      :title="`${p.partCode}: ${p.partName || 'Part'}`"
                    />
                  </template>
                  <span v-if="(inw.parts || []).filter(p => p.image).length > 3" class="text-[10px] text-slate-400 font-mono">
                    +{{ (inw.parts || []).filter(p => p.image).length - 3 }} photos
                  </span>
                </div>
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
              <span>{{ editingJobCard ? `Workshop Job Card Dossier & Management: ${editingJobCard.jobCardNo}` : 'Workshop Job Card Intake & Machine Receiving Dossier' }}</span>
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
            
            <!-- Interactive Job Lifecycle Pipeline Stepper (Visible when managing / editing an existing job card) -->
            <div v-if="editingJobCard" class="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <Clock :size="16" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Job Lifecycle Pipeline
                      </h4>
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Step {{ currentStageIndex + 1 }} of {{ allStages.length }}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                      Click any stage below to advance or update workflow status
                    </p>
                  </div>
                </div>

                <!-- Quick Step Navigation & Current Badge -->
                <div class="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    @click="goToPrevStage"
                    :disabled="currentStageIndex <= 0"
                    class="btn btn-xs btn-secondary text-xs h-7 px-2.5 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move to Previous Stage"
                  >
                    <ChevronLeft :size="14" />
                    <span class="hidden sm:inline">Prev</span>
                  </button>
                  <button
                    type="button"
                    @click="goToNextStage"
                    :disabled="currentStageIndex >= allStages.length - 1"
                    class="btn btn-xs btn-primary text-xs h-7 px-2.5 flex items-center gap-1 font-bold shadow-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Advance to Next Stage"
                  >
                    <span>Next Stage</span>
                    <ChevronRight :size="14" />
                  </button>
                  <div class="ml-1 px-3 py-1 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5"
                       :class="currentStageBadgeClasses">
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </span>
                    <span>{{ editingJobCard.status }}</span>
                  </div>
                </div>
              </div>

              <!-- Progress Track Bar -->
              <div class="space-y-1">
                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden p-0.5">
                  <div
                    class="bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-sm"
                    :style="{ width: `${Math.round(((currentStageIndex + 1) / allStages.length) * 100)}%` }"
                  ></div>
                </div>
                <div class="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
                  <span>Received</span>
                  <span>{{ Math.round(((currentStageIndex + 1) / allStages.length) * 100) }}% Completed</span>
                  <span>Closed</span>
                </div>
              </div>

              <!-- Connected Chevron / Pill Stage Flow (Clean horizontal scrollable container) -->
              <div class="overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
                <div class="flex items-center gap-1.5 min-w-max">
                  <template v-for="(st, idx) in allStages" :key="st">
                    <button
                      type="button"
                      @click="changeJobStage(st)"
                      :class="[
                        'group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 border shrink-0',
                        idx === currentStageIndex
                          ? 'bg-teal-600 text-white border-teal-500 shadow-md ring-2 ring-teal-400/40 ring-offset-1 dark:ring-offset-slate-900 scale-102'
                          : idx < currentStageIndex
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                          : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white'
                      ]"
                    >
                      <span
                        :class="[
                          'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black shrink-0',
                          idx === currentStageIndex
                            ? 'bg-white text-teal-700'
                            : idx < currentStageIndex
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        ]"
                      >
                        {{ idx + 1 }}
                      </span>
                      <span>{{ st }}</span>
                    </button>
                  </template>
                </div>
              </div>
            </div>
            
            <!-- 1. Unified Machine Serial Number & Auto-Lookup Banner -->
            <div class="p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 rounded-xl space-y-2.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label class="font-black text-sky-800 dark:text-sky-300 text-xs uppercase flex items-center gap-1.5">
                  <Search :size="14" />
                  <span>Machine Serial Number * (Auto-Lookup & Verification)</span>
                </label>
                <span class="text-[11px] text-slate-500 dark:text-slate-400">Type serial to automatically pull customer invoice and machine specs</span>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newJobForm.serialNumber"
                  list="registered-serials-list"
                  @input="onSerialSearchInput"
                  @change="triggerSerialLookup"
                  type="text"
                  required
                  placeholder="Enter Serial Number (e.g. SN-456 or 456) or Machine Code..."
                  class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-sky-500 focus:outline-none min-h-[38px]"
                />
                <datalist id="registered-serials-list">
                  <option v-for="s in (dataStore.serials || [])" :key="s.id || s.serialCode" :value="s.serialCode">
                    {{ s.productName }} • Code: {{ s.machineCode || 'N/A' }} • Cust: {{ s.customer || 'Walk-in' }}
                  </option>
                </datalist>
                <button
                  type="button"
                  @click="triggerSerialLookup"
                  class="btn btn-primary text-xs font-bold px-4 shrink-0 shadow-sm"
                >
                  Auto-Lookup
                </button>
              </div>
              <div v-if="serialLookupMatch" class="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/50 rounded-lg flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <div>✓ Verified Serial Match: <strong>{{ serialLookupMatch.productName }}</strong> (Code: <strong>{{ serialLookupMatch.machineCode || 'N/A' }}</strong> • Original Customer: <strong>{{ serialLookupMatch.customer || 'Walk-in' }}</strong>)</div>
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
                <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div class="flex items-center gap-2">
                    <Cpu :size="15" class="text-purple-500" />
                    <span>Equipment Unit & Warranty Specification</span>
                  </div>
                  <span v-if="newJobForm.serialNumber" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40">
                    SN: {{ (newJobForm.serialNumber || '').replace(/^SN-/i, '') }}
                  </span>
                </div>
                <div class="space-y-2.5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Machine Name *</label>
                      <input v-model="newJobForm.machineName" type="text" required placeholder="e.g. Ultrasound Color Doppler" class="form-input text-xs font-bold w-full" />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Machine Code (Model / Item Code)</label>
                      <input v-model="newJobForm.machineCode" type="text" placeholder="e.g. MC-101 / US-700" class="form-input text-xs font-mono font-bold w-full" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Brand</label>
                      <input v-model="newJobForm.brand" type="text" placeholder="e.g. GE Healthcare" class="form-input text-xs w-full" />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Model</label>
                      <input v-model="newJobForm.model" type="text" placeholder="e.g. Logiq E9" class="form-input text-xs w-full" />
                    </div>
                  </div>
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Warranty Status</label>
                    <select v-model="newJobForm.warrantyStatus" class="form-input text-xs font-bold w-full">
                      <option value="In Warranty">In Warranty (Free Repairs)</option>
                      <option value="Out of Warranty">Out of Warranty (Customer Paid)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Machine Intake Logistics & Receiving Bar -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Truck :size="15" class="text-indigo-500" />
                <span>Machine Intake & Receiving Logistics (From Cargo / Bus / Container)</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Receiving Date *</label>
                  <input v-model="newJobForm.receivingDate" type="date" required class="form-input text-xs font-mono font-bold w-full" />
                </div>
                <div>
                  <label class="form-label font-bold text-indigo-700 dark:text-indigo-400">How Received (Cargo / Bus / Container) *</label>
                  <input
                    v-model="newJobForm.receivedVia"
                    type="text"
                    list="workshop-receiving-modes"
                    placeholder="Select or type: Cargo, Bus, Container..."
                    class="form-input text-xs font-bold text-indigo-700 dark:text-indigo-300 w-full"
                  />
                  <datalist id="workshop-receiving-modes">
                    <option value="Cargo Service (Daewoo / Faisal / Asia / Road Freight)">Cargo Service</option>
                    <option value="Bus Service (Daewoo / Faisal Movers / Bilal Travels)">Bus Service</option>
                    <option value="Container / Shipping Freight">Container / Shipping Freight</option>
                    <option value="Courier Service (TCS / Leopard / M&P / Trax)">Courier Service</option>
                    <option value="Customer Hand Delivery / Walk-in">Customer Hand Delivery / Walk-in</option>
                    <option value="Company Delivery Van / By Hand">Company Delivery Van / By Hand</option>
                    <option value="Rider / Local Transport">Rider / Local Transport</option>
                  </datalist>
                </div>
                <div>
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Bilty # / Bus # / Container #</label>
                  <input
                    v-model="newJobForm.receivingTrackingNo"
                    type="text"
                    placeholder="e.g. Bilty-9921, Bus-42, Container MSCU-102"
                    class="form-input text-xs font-mono font-bold w-full"
                  />
                </div>
                <div>
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Receiving Origin / From City</label>
                  <input
                    v-model="newJobForm.receivingOrigin"
                    type="text"
                    placeholder="e.g. Peshawar, Quetta, Lahore, China"
                    class="form-input text-xs w-full"
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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

              <!-- Technical Diagnosis & Repairs Performed (Always accessible on edit and intake) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Biomedical Engineering Diagnosis & Fault Findings</label>
                  <textarea
                    v-model="newJobForm.diagnosis"
                    rows="2"
                    placeholder="Technical diagnosis: motherboard shorts, probe crystals, power supply ripple, error logs..."
                    class="form-input text-xs w-full"
                  ></textarea>
                </div>
                <div>
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Technical Repairs Performed / Calibrations</label>
                  <textarea
                    v-model="newJobForm.requiredRepair"
                    rows="2"
                    placeholder="Actions taken: circuit reflow, component replacement, optical recalibration, safety test..."
                    class="form-input text-xs w-full"
                  ></textarea>
                </div>
              </div>
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

            <!-- ═══════════════════════════════════════════════════════
              SPARE PARTS INSTALLED & ISSUE SPARE PART OPTION (Available on Intake & Edit)
            ═══════════════════════════════════════════════════════ -->
            <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <Cpu :size="16" class="text-teal-500" />
                  <span>Spare Parts Installed In Machine (Auto-Deducted from Warehouse Racks)</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <span class="font-mono text-teal-600 dark:text-teal-400 font-bold text-xs bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800/40">
                    Parts Total: PKR {{ computedNewJobPartsCost.toLocaleString() }}
                  </span>
                  <button
                    type="button"
                    @click="showIssuePartSection = !showIssuePartSection"
                    class="btn btn-xs btn-primary font-bold shadow-sm flex items-center gap-1"
                  >
                    <Plus :size="12" />
                    <span>{{ showIssuePartSection ? 'Close Drawer' : '+ Issue Spare Part' }}</span>
                  </button>
                </div>
              </div>

              <!-- Issue Part Sub-form Drawer (Typeable with all data & live price) -->
              <div v-if="showIssuePartSection" class="p-3.5 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-800/60 rounded-xl space-y-3">
                <div class="flex items-center justify-between text-xs font-bold text-teal-800 dark:text-teal-300">
                  <span class="flex items-center gap-1.5">
                    <Cpu :size="14" />
                    <span>Select & Issue Spare Part from Workshop Warehouse Inventory Racks:</span>
                  </span>
                  <span class="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                    Search rack stock or enter custom part specs
                  </span>
                </div>

                <!-- Quick Search / Choose from Racks -->
                <div>
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Quick Search / Choose from Workshop Racks:</label>
                  <div class="flex gap-2">
                    <input
                      v-model="issuePartForm.partSearchText"
                      list="workshop-spare-parts-list-unified"
                      @input="onSparePartSearchInput"
                      type="text"
                      placeholder="Type part name, code or rack (e.g. Board, Probe, Cable)..."
                      class="form-input text-xs font-mono font-bold w-full"
                    />
                    <datalist id="workshop-spare-parts-list-unified">
                      <option
                        v-for="p in (dataStore.workshopSpareParts || [])"
                        :key="p.partCode"
                        :value="p.partName || p.name"
                      >
                        Code: {{ p.partCode }} • Stock: {{ p.currentStock ?? p.stockQty ?? 0 }} • {{ p.locationRack || 'Rack A' }} • PKR {{ (p.sellingPrice || p.unitCost || 0).toLocaleString() }}
                      </option>
                    </datalist>
                  </div>
                </div>

                <!-- Typeable & Detailed Editable Fields -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 text-xs">
                  <div class="md:col-span-4">
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Part Name *</label>
                    <input
                      v-model="issuePartForm.partName"
                      type="text"
                      placeholder="e.g. High Voltage Power Board"
                      class="form-input text-xs font-bold w-full !h-9 sm:!h-10 !px-3 !py-1.5"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Part Code</label>
                    <input
                      v-model="issuePartForm.partCode"
                      type="text"
                      placeholder="e.g. SP-HV-01"
                      class="form-input text-xs font-mono font-bold w-full !h-9 sm:!h-10 !px-3 !py-1.5"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Quantity</label>
                    <input
                      v-model.number="issuePartForm.quantity"
                      type="number"
                      min="1"
                      class="form-input text-xs font-mono font-bold w-full !h-9 sm:!h-10 !px-3 !py-1.5"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="form-label font-bold text-emerald-600 dark:text-emerald-400">Unit Price (PKR) *</label>
                    <input
                      v-model.number="issuePartForm.unitPrice"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="form-input text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 w-full !h-9 sm:!h-10 !px-3 !py-1.5"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Billing Category</label>
                    <select v-model="issuePartForm.isWarranty" class="form-input text-xs font-bold w-full !h-9 sm:!h-10 !px-3 !py-1.5">
                      <option :value="false">Paid (Billed in Invoice)</option>
                      <option :value="true">Free Under Warranty</option>
                    </select>
                  </div>
                </div>

                <!-- Proper Image Upload Card for Spare Part / Defect Verification -->
                <div class="p-3 bg-white dark:bg-slate-900 border border-dashed border-teal-300 dark:border-teal-700/60 rounded-xl">
                  <div class="flex flex-col sm:flex-row items-center gap-3">
                    <div v-if="issuePartForm.image" class="part-preview-card" style="width: 68px; height: 68px; min-width: 68px; max-width: 68px; min-height: 68px; max-height: 68px; border-radius: 10px; overflow: hidden; position: relative; border: 1px solid #0d9488; flex-shrink: 0;">
                      <img :src="issuePartForm.image" alt="Part photo" class="part-preview-img" style="width: 68px; height: 68px; max-width: 68px; max-height: 68px; object-fit: cover; display: block;" />
                      <button
                        type="button"
                        @click="removeIssuePartImage"
                        class="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 shadow transition-opacity"
                        style="width: 20px; height: 20px; font-size: 10px; line-height: 1;"
                        title="Remove Photo"
                      >
                        ✕
                      </button>
                    </div>
                    <div v-else class="part-preview-card" style="width: 64px; height: 64px; min-width: 64px; max-width: 64px; min-height: 64px; max-height: 64px; border-radius: 10px; border: 1px dashed #0d9488; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <Camera :size="24" class="text-teal-500" />
                    </div>

                    <div class="flex-1 w-full flex flex-col justify-center">
                      <label class="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                        Spare Part Photo / Defect Verification Image (Optional)
                      </label>
                      <div class="flex items-center gap-2 flex-wrap">
                        <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-400 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-xs font-bold transition-colors">
                          <Camera :size="14" />
                          <span>{{ issuePartForm.image ? 'Change Photo' : 'Upload Part / Defect Photo' }}</span>
                          <input
                            type="file"
                            accept="image/*"
                            @change="handleIssuePartImageUpload"
                            class="hidden"
                          />
                        </label>
                        <button
                          v-if="issuePartForm.image"
                          type="button"
                          @click="removeIssuePartImage"
                          class="btn btn-xs btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold"
                        >
                          Remove
                        </button>
                        <span v-if="issuePartForm.image" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          ✓ Photo attached
                        </span>
                        <span v-else class="text-[11px] text-slate-400">
                          Upload photo of new part, replaced component, or barcode sticker (Max 5MB)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Live Inventory Rack & Line Total Preview -->
                <div class="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-teal-200 dark:border-teal-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div class="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <span v-if="issuePartForm.availableStock !== undefined">
                      Rack Stock: <strong class="font-mono text-teal-600 dark:text-teal-400">{{ issuePartForm.availableStock }} in Stock</strong>
                    </span>
                    <span v-if="issuePartForm.locationRack">
                      Location: <strong class="text-slate-800 dark:text-slate-200">{{ issuePartForm.locationRack }}</strong>
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-slate-500 font-medium">Line Total:</span>
                    <strong class="font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                      {{ issuePartForm.isWarranty ? 'PKR 0 (Free Under Warranty)' : 'PKR ' + (Number(issuePartForm.quantity || 1) * Number(issuePartForm.unitPrice || 0)).toLocaleString() }}
                    </strong>
                  </div>
                </div>

                <div class="flex justify-end gap-2 pt-1">
                  <button type="button" @click="showIssuePartSection = false" class="btn btn-xs btn-secondary">Cancel</button>
                  <button type="button" @click="confirmIssuePart" class="btn btn-xs btn-primary font-bold shadow-sm">
                    ✓ Add & Issue Spare Part
                  </button>
                </div>
              </div>

              <!-- Installed Parts Table -->
              <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                <table class="table-lined text-xs min-w-full">
                  <thead>
                    <tr>
                      <th style="width: 54px; text-align: center; padding: 0.6rem 0.5rem;">Photo</th>
                      <th style="padding: 0.6rem 0.75rem;">Part Code</th>
                      <th style="padding: 0.6rem 0.75rem;">Part Name</th>
                      <th style="width: 70px; text-align: center; padding: 0.6rem 0.5rem;">Qty</th>
                      <th style="padding: 0.6rem 0.75rem;">Unit Price</th>
                      <th style="padding: 0.6rem 0.75rem;">Warranty?</th>
                      <th style="padding: 0.6rem 0.75rem; text-align: right;">Total (PKR)</th>
                      <th style="width: 90px; text-align: right; padding: 0.6rem 0.75rem;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, pIdx) in (newJobForm.partsUsed || [])" :key="pIdx" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td style="width: 54px; text-align: center; vertical-align: middle; padding: 0.35rem 0.5rem;">
                        <div v-if="p.image" class="part-thumb-box cursor-pointer group" @click="openPartImagePreview(p)" style="width: 38px; height: 38px; min-width: 38px; max-width: 38px; min-height: 38px; max-height: 38px; border-radius: 8px; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; position: relative; border: 1px solid #14b8a6; margin: 0 auto;" title="Click to view full photo">
                          <img :src="p.image" alt="Part" class="part-thumb-img" style="width: 38px; height: 38px; max-width: 38px; max-height: 38px; object-fit: cover; display: block;" />
                          <div class="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye :size="12" />
                          </div>
                        </div>
                        <label v-else class="cursor-pointer inline-flex items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-teal-500 hover:border-teal-500 transition-colors" style="width: 38px; height: 38px; margin: 0 auto; display: inline-flex;" title="Attach photo to this installed part">
                          <Camera :size="14" />
                          <input type="file" accept="image/*" class="hidden" @change="uploadImageForExistingPart(pIdx, $event)" />
                        </label>
                      </td>
                      <td class="font-mono text-teal-600 dark:text-teal-400 font-bold">{{ p.partCode }}</td>
                      <td class="font-bold text-slate-900 dark:text-white">{{ p.partName }}</td>
                      <td class="font-mono font-bold text-center">{{ p.quantity }}</td>
                      <td class="font-mono">PKR {{ (p.unitPrice || 0).toLocaleString() }}</td>
                      <td>
                        <span :class="['badge font-mono text-[10px]', p.isWarranty ? 'badge-success' : 'badge-neutral']">
                          {{ p.isWarranty ? 'Free (Warranty)' : 'Paid' }}
                        </span>
                      </td>
                      <td class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                        PKR {{ (Number(p.quantity || 1) * Number(p.unitPrice || 0)).toLocaleString() }}
                      </td>
                      <td class="text-right">
                        <button
                          type="button"
                          @click="returnPart(pIdx)"
                          class="btn btn-xs btn-ghost text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          :title="editingJobCard ? 'Return Part back to workshop inventory' : 'Remove part from intake list'"
                        >
                          {{ editingJobCard ? 'Return Part' : 'Remove' }}
                        </button>
                      </td>
                    </tr>
                    <tr v-if="!newJobForm.partsUsed || newJobForm.partsUsed.length === 0">
                      <td colspan="8" class="text-center py-4 text-slate-400">
                        No spare parts issued to this machine yet. Click "+ Issue Spare Part" above to issue parts from warehouse racks during intake or repair.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ═══════════════════════════════════════════════════════
              6. DISPATCH & DELIVERY CHALLAN (DC) SPECIFICATION
            ═══════════════════════════════════════════════════════ -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <Truck :size="16" class="text-indigo-500" />
                  <span>Dispatch & Delivery Challan (DC) Setup</span>
                  <span class="badge badge-info text-[9px] font-mono">INTEGRATED WORKFLOW</span>
                </div>
                <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <input type="checkbox" v-model="newJobForm.generateDC" class="rounded text-indigo-600 w-4 h-4 cursor-pointer" />
                  <span>Issue Delivery Challan (DC) with this Job Card</span>
                </label>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <!-- Carrier & Shipment Info -->
                <div class="md:col-span-6 space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Carrier / Cargo Service</label>
                      <select v-model="newJobForm.cargoService" class="form-input text-xs font-bold w-full">
                        <option value="Daewoo Cargo">Daewoo Cargo Express</option>
                        <option value="TCS Courier">TCS Express Courier</option>
                        <option value="Leopard Courier">Leopard Courier</option>
                        <option value="Trax Logistics">Trax Logistics</option>
                        <option value="Asian Cargo">Asian Cargo Service</option>
                        <option value="Faisal Movers">Faisal Movers Cargo</option>
                        <option value="Road Freight">Road Freight / Trucking</option>
                        <option value="Self Pickup">Self Pickup / Handover at Clinic</option>
                        <option value="Rider">Rider / By Hand</option>
                      </select>
                    </div>

                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Shipment Type</label>
                      <select v-model="newJobForm.shipmentType" class="form-input text-xs font-bold w-full">
                        <option value="Standard Cargo">Standard Cargo</option>
                        <option value="Fragile Biomedical">Fragile Biomedical Equipment</option>
                        <option value="Hand Carry">Hand Carry / Personal Delivery</option>
                        <option value="Air Freight">Air Freight Priority</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="form-label font-bold text-purple-700 dark:text-purple-300">Bilty / Courier Tracking #</label>
                      <input
                        v-model="newJobForm.trackingNo"
                        type="text"
                        placeholder="e.g. DWO-88274 or TCS-99182"
                        class="form-input text-xs font-mono font-bold text-purple-700 dark:text-purple-300 w-full"
                      />
                    </div>
                    <div>
                      <label class="form-label font-bold text-emerald-600 dark:text-emerald-400">Delivery / Cargo Charges (PKR)</label>
                      <input
                        v-model.number="newJobForm.deliveryCharges"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="form-input text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 w-full"
                      />
                      <span class="text-[10px] text-slate-400">Auto-adds to invoice grand total & customer ledger</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Dispatch Date</label>
                      <input v-model="newJobForm.dispatchDate" type="date" class="form-input text-xs font-mono font-bold w-full" />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Dispatch Status</label>
                      <select v-model="newJobForm.dispatchStatus" class="form-input text-xs font-bold w-full">
                        <option value="Pending">Pending Dispatch</option>
                        <option value="Ready for Delivery">Ready for Delivery</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered & Handed Over</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Recipient & Destination Info -->
                <div class="md:col-span-6 space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Receiver Contact Person</label>
                      <input v-model="newJobForm.receiverName" type="text" :placeholder="newJobForm.customerName || 'Dr. / Clinic Manager'" class="form-input text-xs w-full" />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Receiver Phone / WhatsApp</label>
                      <input v-model="newJobForm.receiverPhone" type="text" :placeholder="newJobForm.customerPhone || '0300-XXXXXXX'" class="form-input text-xs font-mono w-full" />
                    </div>
                  </div>

                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Destination Delivery Address / City</label>
                    <input v-model="newJobForm.deliveryAddress" type="text" placeholder="Hospital / Diagnostic Center, City Address" class="form-input text-xs w-full" />
                  </div>

                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Courier Instructions & Fragile Warnings</label>
                    <input v-model="newJobForm.deliveryRemarks" type="text" placeholder="e.g. Fragile biomedical ultrasound probes - keep upright, handle with care" class="form-input text-xs w-full" />
                  </div>
                </div>
              </div>
            </div>

            <!-- ═══════════════════════════════════════════════════════
              7. WORKSHOP INVOICING & CUSTOMER BILLING SPECIFICATION
            ═══════════════════════════════════════════════════════ -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <Receipt :size="16" class="text-blue-500" />
                  <span>Workshop Invoicing & Customer Billing</span>
                  <span class="badge badge-success text-[9px] font-mono">DIRECT INVOICE GENERATION</span>
                </div>
                <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-blue-600 dark:text-blue-400">
                  <input type="checkbox" v-model="newJobForm.generateInvoice" class="rounded text-blue-600 w-4 h-4 cursor-pointer" />
                  <span>Generate Customer Invoice with this Job Card</span>
                </label>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                <!-- Left: Pricing Breakdown -->
                <div class="md:col-span-7 space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Labour / Service Charges (PKR)</label>
                      <input
                        v-model.number="newJobForm.labourCharges"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="form-input text-xs font-mono font-bold w-full"
                      />
                    </div>
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Other Workshop Charges (PKR)</label>
                      <input
                        v-model.number="newJobForm.otherCharges"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="form-input text-xs font-mono font-bold w-full"
                      />
                    </div>
                    <div>
                      <label class="form-label font-bold text-rose-600 dark:text-rose-400">Discount on Repair (PKR)</label>
                      <input
                        v-model.number="newJobForm.discount"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="form-input text-xs font-mono font-bold text-rose-600 dark:text-rose-400 w-full"
                      />
                    </div>
                  </div>

                  <!-- Live Payment Intake -->
                  <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center justify-between">
                      <span class="flex items-center gap-1.5">
                        <Banknote :size="14" class="text-emerald-500" />
                        <span>Payment Collection & Ledger Sync</span>
                      </span>
                      <span class="text-[10px] text-slate-400">Syncs into Customer Ledger</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label class="form-label font-bold text-slate-700 dark:text-slate-300">Payment Status</label>
                        <select v-model="newJobForm.paymentStatus" class="form-input text-xs font-bold w-full">
                          <option value="Unpaid">Unpaid (Full Due)</option>
                          <option value="Partial">Partial Payment</option>
                          <option value="Paid">Fully Paid</option>
                        </select>
                      </div>

                      <div>
                        <label class="form-label font-bold text-slate-700 dark:text-slate-300">Payment Method</label>
                        <select v-model="newJobForm.paymentMethod" class="form-input text-xs font-bold w-full">
                          <option value="Cash">Cash at Counter</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Online Transfer">Online / Raast</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      <div>
                        <label class="form-label font-bold text-emerald-600 dark:text-emerald-400">Amount Paid Now (PKR)</label>
                        <input
                          v-model.number="newJobForm.paidAmount"
                          type="number"
                          min="0"
                          :max="computedNewJobInvoiceTotal"
                          placeholder="0"
                          class="form-input text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right: Invoice Total Summary Card -->
                <div class="md:col-span-5 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                  <div class="space-y-1.5 text-xs">
                    <div class="font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      <span>Invoice Summary Breakdown</span>
                      <span class="font-mono text-[10px] text-slate-500">Auto-calculated</span>
                    </div>

                    <div class="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                      <span>Spare Parts Installed:</span>
                      <strong class="font-mono text-slate-900 dark:text-white">
                        PKR {{ computedNewJobPartsCost.toLocaleString() }}
                      </strong>
                    </div>

                    <div class="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                      <span>Labour & Service Fee:</span>
                      <strong class="font-mono text-slate-900 dark:text-white">
                        PKR {{ Number(newJobForm.labourCharges || 0).toLocaleString() }}
                      </strong>
                    </div>

                    <div class="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                      <span>Delivery / Cargo Fee:</span>
                      <strong class="font-mono text-emerald-600 dark:text-emerald-400">
                        + PKR {{ Number(newJobForm.deliveryCharges || 0).toLocaleString() }}
                      </strong>
                    </div>

                    <div v-if="newJobForm.discount > 0" class="flex justify-between text-rose-600 dark:text-rose-400 text-xs">
                      <span>Discount:</span>
                      <strong class="font-mono">
                        - PKR {{ Number(newJobForm.discount || 0).toLocaleString() }}
                      </strong>
                    </div>

                    <div class="border-t border-slate-300 dark:border-slate-700 pt-2 flex justify-between items-baseline">
                      <span class="font-bold text-slate-900 dark:text-white text-xs">Invoice Grand Total:</span>
                      <span class="font-black font-mono text-base text-primary">
                        PKR {{ computedNewJobInvoiceTotal.toLocaleString() }}
                      </span>
                    </div>

                    <div class="flex justify-between items-baseline pt-1 text-[11px]">
                      <span class="text-slate-500">Remaining Balance:</span>
                      <strong class="font-mono text-rose-600 dark:text-rose-400">
                        PKR {{ Math.max(0, computedNewJobInvoiceTotal - Number(newJobForm.paidAmount || 0)).toLocaleString() }}
                      </strong>
                    </div>
                  </div>
                </div>
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
                <span class="text-slate-500">Delivery: </span>
                <strong class="font-mono text-emerald-600 dark:text-emerald-400">PKR {{ Number(newJobForm.deliveryCharges || 0).toLocaleString() }}</strong>
              </div>
              <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span class="text-slate-500">Invoice Total: </span>
                <strong class="font-mono text-primary font-bold">PKR {{ computedNewJobInvoiceTotal.toLocaleString() }}</strong>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" @click="showNewJobCardModal = false" class="btn btn-secondary text-xs font-bold px-4 h-9">
                Cancel
              </button>
              <button
                type="button"
                @click="submitJobCardForm('print-job')"
                class="btn btn-secondary text-sky-600 dark:text-sky-400 text-xs font-bold px-3 h-9 flex items-center gap-1.5 shadow-sm"
                title="Save and Print Job Card Dossier"
              >
                <Printer :size="14" />
                <span>Print Job Card</span>
              </button>
              <button
                type="button"
                @click="submitJobCardForm('print-dc')"
                class="btn btn-secondary text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 h-9 flex items-center gap-1.5 shadow-sm"
                title="Save and Print Official Delivery Challan (DC)"
              >
                <Truck :size="14" />
                <span>Print DC</span>
              </button>
              <button
                type="button"
                @click="submitJobCardForm('print-invoice')"
                class="btn btn-secondary text-blue-600 dark:text-blue-400 text-xs font-bold px-3 h-9 flex items-center gap-1.5 shadow-sm"
                title="Save and Print Workshop Invoice"
              >
                <Receipt :size="14" />
                <span>Print Invoice</span>
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
    <div v-if="showJobDetailsModal && selectedJob" class="modal-backdrop z-50 flex items-center justify-center p-1 sm:p-3" @click.self="showJobDetailsModal = false">
      <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-xl" style="width: 98vw !important; max-width: 1560px !important; max-height: 96vh !important; height: 96vh !important; padding: 0 !important;">
        
        <!-- Header Bar (Desktop POS Style) -->
        <div class="px-4 py-3 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-sm sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Wrench :size="20" class="text-primary" />
              <span>Workshop Job Card Dossier: {{ selectedJob.jobCardNo }}</span>
            </span>
            <span :class="['badge font-mono text-[10px] py-0.5 px-2.5', getStatusBadgeClass(selectedJob.status)]">
              {{ selectedJob.status }}
            </span>
            <span v-if="selectedJob.warrantyStatus === 'In Warranty'" class="badge badge-success font-mono text-[10px] py-0.5 px-2">
              IN WARRANTY
            </span>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-slate-200 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
              <span class="text-slate-600 dark:text-slate-400 font-medium">Customer:</span>
              <span class="font-bold text-slate-900 dark:text-white">{{ selectedJob.customerName }}</span>
              <span class="font-mono text-sky-600 dark:text-sky-400 font-bold">({{ (selectedJob.serialNumber || '').replace(/^SN-/i, '') }})</span>
            </div>
            <button @click="showJobDetailsModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-lg font-bold">✕</button>
          </div>
        </div>

        <!-- Scrollable Dossier Body -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50 dark:bg-transparent">
          
          <!-- 1. Equipment & Customer Profile Summary Banner -->
          <div class="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-xs shadow-sm">
            <div>
              <span class="text-slate-400 uppercase text-[10px] font-bold block">Machine Name & Code</span>
              <strong class="text-slate-900 dark:text-white text-xs block mt-0.5">{{ selectedJob.machineName }}</strong>
              <div class="text-slate-500 text-[11px] font-mono mt-0.5">
                <span v-if="selectedJob.machineCode" class="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">[Code: {{ selectedJob.machineCode }}]</span>
                <span>{{ selectedJob.brand }} {{ selectedJob.model }}</span>
              </div>
            </div>
            <div>
              <span class="text-slate-400 uppercase text-[10px] font-bold block">Machine Serial Number</span>
              <span class="font-mono font-bold text-sky-600 dark:text-sky-400 text-xs block mt-0.5">
                SN: {{ (selectedJob.serialNumber || 'N/A').replace(/^SN-/i, '') }}
              </span>
              <span :class="['badge font-mono text-[9px] mt-1', selectedJob.warrantyStatus === 'In Warranty' ? 'badge-success' : 'badge-neutral']">
                {{ selectedJob.warrantyStatus || 'Out of Warranty' }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 uppercase text-[10px] font-bold block">Intake Logistics & Timeline</span>
              <span class="text-slate-800 dark:text-slate-200 block text-[11px] mt-0.5 font-medium">
                Via: <strong class="text-indigo-600 dark:text-indigo-400">{{ selectedJob.receivedVia || 'Cargo Service' }}</strong>
                <span v-if="selectedJob.receivingTrackingNo" class="font-mono text-slate-500"> (#{{ selectedJob.receivingTrackingNo }})</span>
              </span>
              <span class="text-slate-500 text-[10px] block mt-0.5">
                In: <strong class="font-mono text-slate-700 dark:text-slate-300">{{ selectedJob.receivingDate }}</strong>
                <span v-if="selectedJob.expectedDeliveryDate"> • Exp: <strong class="font-mono">{{ selectedJob.expectedDeliveryDate }}</strong></span>
              </span>
            </div>
            <div>
              <span class="text-slate-400 uppercase text-[10px] font-bold block">Customer & Specialist</span>
              <strong class="text-slate-900 dark:text-white text-xs block mt-0.5">{{ selectedJob.customerName }}</strong>
              <span class="text-purple-600 dark:text-purple-400 font-bold text-[11px] block mt-0.5">
                Tech: {{ formatTechnician(selectedJob.assignedTechnician).name }}
              </span>
            </div>
          </div>

          <!-- 2. Interactive Job Lifecycle Pipeline Stepper -->
          <div class="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <!-- Header with Stage Title, Active Stage Badge & Quick Navigation Controls -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Clock :size="16" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Job Lifecycle Pipeline
                    </h4>
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Step {{ currentStageIndex + 1 }} of {{ allStages.length }}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Click any stage below or step through workflow sequentially
                  </p>
                </div>
              </div>

              <!-- Quick Step Navigation & Current Badge -->
              <div class="flex items-center gap-1.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  @click="goToPrevStage"
                  :disabled="currentStageIndex <= 0"
                  class="btn btn-xs btn-secondary text-xs h-7 px-2.5 flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move to Previous Stage"
                >
                  <ChevronLeft :size="14" />
                  <span class="hidden sm:inline">Prev</span>
                </button>
                <button
                  type="button"
                  @click="goToNextStage"
                  :disabled="currentStageIndex >= allStages.length - 1"
                  class="btn btn-xs btn-primary text-xs h-7 px-2.5 flex items-center gap-1 font-bold shadow-xs disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Advance to Next Stage"
                >
                  <span>Next Stage</span>
                  <ChevronRight :size="14" />
                </button>
                <div class="ml-1 px-3 py-1 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5"
                     :class="currentStageBadgeClasses">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                  </span>
                  <span>{{ selectedJob.status }}</span>
                </div>
              </div>
            </div>

            <!-- Progress Track Bar -->
            <div class="space-y-1">
              <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden p-0.5">
                <div
                  class="bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-sm"
                  :style="{ width: `${Math.round(((currentStageIndex + 1) / allStages.length) * 100)}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
                <span>Received</span>
                <span>{{ Math.round(((currentStageIndex + 1) / allStages.length) * 100) }}% Completed</span>
                <span>Closed</span>
              </div>
            </div>

            <!-- Connected Chevron / Pill Stage Flow (Clean horizontal scrollable container) -->
            <div class="overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
              <div class="flex items-center gap-1.5 min-w-max">
                <template v-for="(st, idx) in allStages" :key="st">
                  <button
                    type="button"
                    @click="changeJobStage(st)"
                    :class="[
                      'group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 border shrink-0',
                      idx === currentStageIndex
                        ? 'bg-teal-600 text-white border-teal-500 shadow-md ring-2 ring-teal-400/40 ring-offset-1 dark:ring-offset-slate-900 scale-102'
                        : idx < currentStageIndex
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                        : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white'
                    ]"
                  >
                    <!-- Step Indicator Circle -->
                    <span
                      :class="[
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black shrink-0',
                        idx === currentStageIndex
                          ? 'bg-white text-teal-700'
                          : idx < currentStageIndex
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      ]"
                    >
                      <span v-if="idx < currentStageIndex">✓</span>
                      <span v-else>{{ idx + 1 }}</span>
                    </span>

                    <!-- Stage Name -->
                    <span class="whitespace-nowrap">{{ st }}</span>

                    <!-- Active Tag -->
                    <span v-if="idx === currentStageIndex" class="text-[9px] uppercase px-1.5 py-0.2 rounded bg-teal-700 text-teal-100 font-mono tracking-tight">
                      Active
                    </span>
                  </button>

                  <!-- Chevron Connector between steps -->
                  <ChevronRight
                    v-if="idx < allStages.length - 1"
                    :size="14"
                    :class="idx < currentStageIndex ? 'text-emerald-400 dark:text-emerald-600 shrink-0' : 'text-slate-300 dark:text-slate-700 shrink-0'"
                  />
                </template>
              </div>
            </div>
          </div>

          <!-- 3. Technical Diagnosis & Action Form -->
          <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <Wrench :size="15" class="text-primary" />
                <span>Diagnostic Assessment & Technical Service Actions</span>
              </div>
              <button type="button" @click="saveJobDiagnosis" class="btn btn-xs btn-secondary font-bold text-primary shadow-sm flex items-center gap-1">
                <span>Save Diagnosis</span>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Biomedical Engineering Diagnosis & Fault Findings</label>
                <textarea
                  v-model="editDiagnosisForm.diagnosis"
                  rows="2"
                  placeholder="Detail fault observations, motherboard shorts, probe crystals, high voltage power supply, error code logs..."
                  class="form-input text-xs w-full"
                ></textarea>
              </div>
              <div>
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Technical Repairs Performed / Calibrations</label>
                <textarea
                  v-model="editDiagnosisForm.requiredRepair"
                  rows="2"
                  placeholder="Actions taken: circuit reflow, component replacement, optical recalibration, safety leakage test..."
                  class="form-input text-xs w-full"
                ></textarea>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Labour / Engineering Service Charges (PKR)</label>
                <input v-model.number="editDiagnosisForm.labourCharges" type="number" min="0" placeholder="0" class="form-input text-xs font-mono font-bold w-full" />
              </div>
              <div>
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Other Workshop / Consumables Charges (PKR)</label>
                <input v-model.number="editDiagnosisForm.otherCharges" type="number" min="0" placeholder="0" class="form-input text-xs font-mono font-bold w-full" />
              </div>
              <div>
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Assigned Biomedical Engineer</label>
                <select v-model="selectedJob.assignedTechnician" class="form-input text-xs font-bold w-full">
                  <option v-for="t in dataStore.workshopTechnicians" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 4. INTEGRATED DISPATCH & DELIVERY CHALLAN (DC) SETUP (Moved Above) -->
          <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <Truck :size="16" class="text-indigo-500" />
                <span>Dispatch & Delivery Challan (DC) Setup</span>
                <span v-if="selectedJob.dcGenerated" class="badge badge-success text-[10px] font-mono">DC: {{ selectedJob.dcNumber }}</span>
                <span v-else class="badge badge-neutral text-[10px] font-mono">DC PENDING</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="saveModal2Dispatch(true)"
                  class="btn btn-xs btn-secondary text-indigo-600 dark:text-indigo-400 font-bold shadow-sm flex items-center gap-1"
                  title="Save and Print Official Delivery Challan (DC)"
                >
                  <Printer :size="12" />
                  <span>Save & Print DC</span>
                </button>
                <button
                  type="button"
                  @click="saveModal2Dispatch(false)"
                  class="btn btn-xs btn-secondary font-bold shadow-sm"
                >
                  Save Dispatch
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <!-- Carrier & Bilty Info -->
              <div class="md:col-span-6 space-y-2.5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Carrier / Cargo Service *</label>
                    <select v-model="editJobDispatchForm.cargoService" class="form-input text-xs font-bold w-full">
                      <option value="Daewoo Express Cargo">Daewoo Express Cargo</option>
                      <option value="Faisal Movers Cargo">Faisal Movers Cargo</option>
                      <option value="TCS Express">TCS Express</option>
                      <option value="Leopard Courier">Leopard Courier</option>
                      <option value="M&P Courier">M&P Courier</option>
                      <option value="Pakistan Post">Pakistan Post</option>
                      <option value="Hand Delivery by Tech">Hand Delivery by Engineer</option>
                      <option value="Customer Self Pickup">Customer Counter Pickup</option>
                      <option value="Company Delivery Van">Company Delivery Van</option>
                    </select>
                  </div>
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Tracking / Bilty / CN #</label>
                    <input
                      v-model="editJobDispatchForm.trackingNo"
                      type="text"
                      placeholder="e.g. DW-883492 or TCS-99321"
                      class="form-input text-xs font-mono font-bold w-full"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label class="form-label font-bold text-emerald-600 dark:text-emerald-400">Cargo / Delivery Fee (PKR)</label>
                    <input
                      v-model.number="editJobDispatchForm.deliveryCharges"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="form-input text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 w-full"
                    />
                  </div>
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Dispatch Date</label>
                    <input v-model="editJobDispatchForm.dispatchDate" type="date" class="form-input text-xs font-mono font-bold w-full" />
                  </div>
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Dispatch Status</label>
                    <select v-model="editJobDispatchForm.dispatchStatus" class="form-input text-xs font-bold w-full">
                      <option value="Ready for Delivery">Ready for Delivery</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered to Customer</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Recipient & Address Info -->
              <div class="md:col-span-6 space-y-2.5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Receiver Contact Name</label>
                    <input
                      v-model="editJobDispatchForm.receiverName"
                      type="text"
                      placeholder="Doctor / Clinic Manager / Purchaser"
                      class="form-input text-xs w-full"
                    />
                  </div>
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Receiver Phone #</label>
                    <input
                      v-model="editJobDispatchForm.receiverPhone"
                      type="text"
                      placeholder="0300-XXXXXXX"
                      class="form-input text-xs font-mono w-full"
                    />
                  </div>
                </div>

                <div>
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Delivery Destination Address / Clinic Location</label>
                  <input
                    v-model="editJobDispatchForm.deliveryAddress"
                    type="text"
                    placeholder="e.g. Room 12, Cardiology Dept, City Hospital, Peshawar"
                    class="form-input text-xs w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Spare Parts Installed in Machine (Above on Invoice) -->
          <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <Cpu :size="15" class="text-teal-500" />
                <span>Spare Parts Installed In Machine (Auto-Deducted from Warehouse Racks)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-teal-600 dark:text-teal-400 font-bold text-xs">
                  Subtotal: PKR {{ computedModal2PartsCost.toLocaleString() }}
                </span>
                <button
                  type="button"
                  @click="showIssuePartSection = !showIssuePartSection"
                  class="btn btn-xs btn-primary font-bold shadow-sm flex items-center gap-1"
                >
                  <Plus :size="12" />
                  <span>{{ showIssuePartSection ? 'Close Drawer' : '+ Issue Spare Part' }}</span>
                </button>
              </div>
            </div>

            <!-- Issue Part Sub-form Drawer (Typeable with all data & live price) -->
            <div v-if="showIssuePartSection" class="p-3.5 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-800/60 rounded-xl space-y-3">
              <div class="flex items-center justify-between text-xs font-bold text-teal-800 dark:text-teal-300">
                <span class="flex items-center gap-1.5">
                  <Cpu :size="14" />
                  <span>Select & Issue Spare Part from Workshop Warehouse Inventory Racks:</span>
                </span>
                <span class="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Search rack stock or enter custom part specs
                </span>
              </div>

              <!-- Quick Search / Choose from Racks -->
              <div>
                <label class="form-label font-bold text-slate-700 dark:text-slate-300">Quick Search / Choose from Workshop Racks:</label>
                <div class="flex gap-2">
                  <input
                    v-model="issuePartForm.partSearchText"
                    list="workshop-spare-parts-list"
                    @input="onSparePartSearchInput"
                    type="text"
                    placeholder="Type part name, code or rack (e.g. Board, Probe, Cable)..."
                    class="form-input text-xs font-mono font-bold w-full"
                  />
                  <datalist id="workshop-spare-parts-list">
                    <option
                      v-for="p in (dataStore.workshopSpareParts || [])"
                      :key="p.partCode"
                      :value="p.partName || p.name"
                    >
                      Code: {{ p.partCode }} • Stock: {{ p.currentStock ?? p.stockQty ?? 0 }} • {{ p.locationRack || 'Rack A' }} • PKR {{ (p.sellingPrice || p.unitCost || 0).toLocaleString() }}
                    </option>
                  </datalist>
                </div>
              </div>

              <!-- Typeable & Detailed Editable Fields -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 text-xs">
                <div class="md:col-span-4">
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Part Name *</label>
                  <input
                    v-model="issuePartForm.partName"
                    type="text"
                    required
                    placeholder="e.g. High Voltage Power Board"
                    class="form-input text-xs font-bold w-full"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Part Code</label>
                  <input
                    v-model="issuePartForm.partCode"
                    type="text"
                    placeholder="e.g. SP-HV-01"
                    class="form-input text-xs font-mono font-bold w-full"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Quantity</label>
                  <input
                    v-model.number="issuePartForm.quantity"
                    type="number"
                    min="1"
                    class="form-input text-xs font-mono font-bold w-full"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="form-label font-bold text-emerald-600 dark:text-emerald-400">Unit Price (PKR) *</label>
                  <input
                    v-model.number="issuePartForm.unitPrice"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="form-input text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 w-full"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="form-label font-bold text-slate-700 dark:text-slate-300">Billing Category</label>
                  <select v-model="issuePartForm.isWarranty" class="form-input text-xs font-bold w-full">
                    <option :value="false">Paid (Billed in Invoice)</option>
                    <option :value="true">Free Under Warranty</option>
                  </select>
                </div>
              </div>

              <!-- Proper Image Upload Card for Spare Part / Defect Verification -->
              <div class="p-3 bg-white dark:bg-slate-900 border border-dashed border-teal-300 dark:border-teal-700/60 rounded-xl">
                <div class="flex flex-col sm:flex-row items-center gap-3">
                  <!-- Image Preview Thumbnail (if uploaded) -->
                  <div v-if="issuePartForm.image" class="part-preview-card" style="width: 68px; height: 68px; min-width: 68px; max-width: 68px; min-height: 68px; max-height: 68px; border-radius: 10px; overflow: hidden; position: relative; border: 1px solid #0d9488; flex-shrink: 0;">
                    <img :src="issuePartForm.image" alt="Part photo" class="part-preview-img" style="width: 68px; height: 68px; max-width: 68px; max-height: 68px; object-fit: cover; display: block;" />
                    <button
                      type="button"
                      @click="removeIssuePartImage"
                      class="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 shadow transition-opacity"
                      style="width: 20px; height: 20px; font-size: 10px; line-height: 1;"
                      title="Remove Photo"
                    >
                      ✕
                    </button>
                  </div>
                  <div v-else class="part-preview-card" style="width: 64px; height: 64px; min-width: 64px; max-width: 64px; min-height: 64px; max-height: 64px; border-radius: 10px; border: 1px dashed #0d9488; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <Camera :size="24" class="text-teal-500" />
                  </div>

                  <!-- Upload Input / Drop Area -->
                  <div class="flex-1 w-full flex flex-col justify-center">
                    <label class="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                      Spare Part Photo / Defect Verification Image (Optional)
                    </label>
                    <div class="flex items-center gap-2 flex-wrap">
                      <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-400 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-xs font-bold transition-colors">
                        <Camera :size="14" />
                        <span>{{ issuePartForm.image ? 'Change Photo' : 'Upload Part / Defect Photo' }}</span>
                        <input
                          type="file"
                          accept="image/*"
                          @change="handleIssuePartImageUpload"
                          class="hidden"
                        />
                      </label>
                      <button
                        v-if="issuePartForm.image"
                        type="button"
                        @click="removeIssuePartImage"
                        class="btn btn-xs btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold"
                      >
                        Remove
                      </button>
                      <span v-if="issuePartForm.image" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        ✓ Photo attached
                      </span>
                      <span v-else class="text-[11px] text-slate-400">
                        Upload photo of new part, replaced component, or barcode sticker (Max 5MB)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Live Inventory Rack & Line Total Preview -->
              <div class="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-teal-200 dark:border-teal-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <span v-if="issuePartForm.availableStock !== undefined">
                    Rack Stock: <strong class="font-mono text-teal-600 dark:text-teal-400">{{ issuePartForm.availableStock }} in Stock</strong>
                  </span>
                  <span v-if="issuePartForm.locationRack">
                    Location: <strong class="text-slate-800 dark:text-slate-200">{{ issuePartForm.locationRack }}</strong>
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-slate-500 font-medium">Line Total:</span>
                  <strong class="font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                    {{ issuePartForm.isWarranty ? 'PKR 0 (Free Under Warranty)' : 'PKR ' + (Number(issuePartForm.quantity || 1) * Number(issuePartForm.unitPrice || 0)).toLocaleString() }}
                  </strong>
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-1">
                <button type="button" @click="showIssuePartSection = false" class="btn btn-xs btn-secondary">Cancel</button>
                <button type="button" @click="confirmIssuePart" class="btn btn-xs btn-primary font-bold shadow-sm">
                  ✓ Add & Issue Spare Part
                </button>
              </div>
            </div>

            <!-- Installed Parts Table -->
            <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
              <table class="table-lined text-xs min-w-full">
                <thead>
                  <tr>
                    <th style="width: 54px; text-align: center; padding: 0.6rem 0.5rem;">Photo</th>
                    <th style="padding: 0.6rem 0.75rem;">Part Code</th>
                    <th style="padding: 0.6rem 0.75rem;">Part Name</th>
                    <th style="width: 70px; text-align: center; padding: 0.6rem 0.5rem;">Qty</th>
                    <th style="padding: 0.6rem 0.75rem;">Unit Price</th>
                    <th style="padding: 0.6rem 0.75rem;">Warranty?</th>
                    <th style="padding: 0.6rem 0.75rem; text-align: right;">Total (PKR)</th>
                    <th style="width: 90px; text-align: right; padding: 0.6rem 0.75rem;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, pIdx) in selectedJob.partsUsed" :key="pIdx" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td style="width: 54px; text-align: center; vertical-align: middle; padding: 0.35rem 0.5rem;">
                      <div v-if="p.image" class="part-thumb-box cursor-pointer group" @click="openPartImagePreview(p)" style="width: 38px; height: 38px; min-width: 38px; max-width: 38px; min-height: 38px; max-height: 38px; border-radius: 8px; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; position: relative; border: 1px solid #14b8a6; margin: 0 auto;" title="Click to view full photo">
                        <img :src="p.image" alt="Part" class="part-thumb-img" style="width: 38px; height: 38px; max-width: 38px; max-height: 38px; object-fit: cover; display: block;" />
                        <div class="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Eye :size="12" />
                        </div>
                      </div>
                      <label v-else class="cursor-pointer inline-flex items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-teal-500 hover:border-teal-500 transition-colors" style="width: 38px; height: 38px; margin: 0 auto; display: inline-flex;" title="Attach photo to this installed part">
                        <Camera :size="14" />
                        <input type="file" accept="image/*" class="hidden" @change="uploadImageForExistingPart(pIdx, $event)" />
                      </label>
                    </td>
                    <td class="font-mono text-teal-600 dark:text-teal-400 font-bold">{{ p.partCode }}</td>
                    <td class="font-bold text-slate-900 dark:text-white">{{ p.partName }}</td>
                    <td class="font-mono font-bold">{{ p.quantity }}</td>
                    <td class="font-mono">PKR {{ (p.unitPrice || 0).toLocaleString() }}</td>
                    <td>
                      <span :class="['badge font-mono text-[10px]', p.isWarranty ? 'badge-success' : 'badge-neutral']">
                        {{ p.isWarranty ? 'Free (Warranty)' : 'Paid' }}
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
                    <td colspan="8" class="text-center py-4 text-slate-400">
                      No spare parts issued to this job card yet. Click "+ Issue Spare Part" above to install parts from warehouse racks.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════
            6. INTEGRATED WORKSHOP INVOICING & CUSTOMER BILLING
          ═══════════════════════════════════════════════════════ -->
          <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div class="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <Receipt :size="16" class="text-blue-500" />
                <span>Workshop Invoicing & Customer Billing</span>
                <span v-if="selectedJob.invoiceGenerated" class="badge badge-info text-[10px] font-mono">INV: {{ selectedJob.invoiceNumber }}</span>
                <span v-else class="badge badge-neutral text-[10px] font-mono">INVOICE PENDING</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="saveModal2Invoice(true)"
                  class="btn btn-xs btn-secondary text-blue-600 dark:text-blue-400 font-bold shadow-sm flex items-center gap-1"
                  title="Save and Print Official Workshop Invoice"
                >
                  <Printer :size="12" />
                  <span>Save & Print Invoice</span>
                </button>
                <button
                  type="button"
                  @click="saveModal2Invoice(false)"
                  class="btn btn-xs btn-primary font-bold shadow-sm"
                >
                  Save & Update Invoice
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <!-- Left: Pricing Breakdown & Counter Payment -->
              <div class="md:col-span-7 space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Labour / Service (PKR)</label>
                    <input
                      v-model.number="editDiagnosisForm.labourCharges"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="form-input text-xs font-mono font-bold w-full"
                    />
                  </div>
                  <div>
                    <label class="form-label font-bold text-slate-700 dark:text-slate-300">Other Charges (PKR)</label>
                    <input
                      v-model.number="editDiagnosisForm.otherCharges"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="form-input text-xs font-mono font-bold w-full"
                    />
                  </div>
                  <div>
                    <label class="form-label font-bold text-rose-600 dark:text-rose-400">Discount on Repair (PKR)</label>
                    <input
                      v-model.number="editJobInvoiceForm.discount"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="form-input text-xs font-mono font-bold text-rose-600 dark:text-rose-400 w-full"
                    />
                  </div>
                </div>

                <!-- Live Payment Intake Box -->
                <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div class="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center justify-between">
                    <span class="flex items-center gap-1.5">
                      <Banknote :size="14" class="text-emerald-500" />
                      <span>Payment Collection & Customer Ledger Sync</span>
                    </span>
                    <span class="text-[10px] text-slate-400">Direct Ledger Sync</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Payment Status</label>
                      <select v-model="editJobInvoiceForm.paymentStatus" class="form-input text-xs font-bold w-full">
                        <option value="Unpaid">Unpaid (Full Due)</option>
                        <option value="Partial">Partial Payment</option>
                        <option value="Paid">Fully Paid</option>
                      </select>
                    </div>

                    <div>
                      <label class="form-label font-bold text-slate-700 dark:text-slate-300">Payment Method</label>
                      <select v-model="editJobInvoiceForm.paymentMethod" class="form-input text-xs font-bold w-full">
                        <option value="Cash">Cash at Counter</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Online Transfer">Online / Raast</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label class="form-label font-bold text-emerald-600 dark:text-emerald-400">Amount Paid Now (PKR)</label>
                      <input
                        v-model.number="editJobInvoiceForm.paidAmount"
                        type="number"
                        min="0"
                        :max="computedModal2InvoiceTotal"
                        placeholder="0"
                        class="form-input text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Invoice Total Summary Card -->
              <div class="md:col-span-5 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                <div class="space-y-1.5 text-xs">
                  <div class="font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <span>Invoice Summary Breakdown</span>
                    <span class="font-mono text-[10px] text-slate-500">Auto-calculated</span>
                  </div>

                  <div class="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                    <span>Spare Parts Installed:</span>
                    <strong class="font-mono text-slate-900 dark:text-white">
                      PKR {{ computedModal2PartsCost.toLocaleString() }}
                    </strong>
                  </div>

                  <div class="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                    <span>Labour & Service Fee:</span>
                    <strong class="font-mono text-slate-900 dark:text-white">
                      PKR {{ Number(editDiagnosisForm.labourCharges || 0).toLocaleString() }}
                    </strong>
                  </div>

                  <div class="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                    <span>Delivery / Cargo Fee:</span>
                    <strong class="font-mono text-emerald-600 dark:text-emerald-400">
                      + PKR {{ Number(editJobDispatchForm.deliveryCharges || 0).toLocaleString() }}
                    </strong>
                  </div>

                  <div v-if="editJobInvoiceForm.discount > 0" class="flex justify-between text-rose-600 dark:text-rose-400 text-xs">
                    <span>Discount:</span>
                    <strong class="font-mono">
                      - PKR {{ Number(editJobInvoiceForm.discount || 0).toLocaleString() }}
                    </strong>
                  </div>

                  <div class="border-t border-slate-300 dark:border-slate-700 pt-2 flex justify-between items-baseline">
                    <span class="font-bold text-slate-900 dark:text-white text-xs">Invoice Grand Total:</span>
                    <span class="font-black font-mono text-base text-primary">
                      PKR {{ computedModal2InvoiceTotal.toLocaleString() }}
                    </span>
                  </div>

                  <div class="flex justify-between items-baseline pt-1 text-[11px]">
                    <span class="text-slate-500">Previously Paid:</span>
                    <strong class="font-mono text-emerald-600 dark:text-emerald-400">
                      PKR {{ Number(selectedJob.paidAmount || 0).toLocaleString() }}
                    </strong>
                  </div>

                  <div class="flex justify-between items-baseline pt-0.5 text-[11px]">
                    <span class="text-slate-500">Outstanding Balance:</span>
                    <strong class="font-mono text-rose-600 dark:text-rose-400">
                      PKR {{ Math.max(0, computedModal2InvoiceTotal - Number(selectedJob.paidAmount || 0) - Number(editJobInvoiceForm.paidAmount || 0)).toLocaleString() }}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Action Footer (Desktop POS Style) -->
        <div class="px-5 py-3 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
            <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span class="text-slate-500">Job: </span>
              <strong class="font-mono text-primary">{{ selectedJob.jobCardNo }}</strong>
            </div>
            <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span class="text-slate-500">Parts Subtotal: </span>
              <strong class="font-mono text-teal-600 dark:text-teal-400">PKR {{ computedModal2PartsCost.toLocaleString() }}</strong>
            </div>
            <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span class="text-slate-500">Delivery: </span>
              <strong class="font-mono text-emerald-600 dark:text-emerald-400">PKR {{ Number(editJobDispatchForm.deliveryCharges || 0).toLocaleString() }}</strong>
            </div>
            <div class="p-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span class="text-slate-500">Invoice Total: </span>
              <strong class="font-mono text-primary font-bold">PKR {{ computedModal2InvoiceTotal.toLocaleString() }}</strong>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" @click="showJobDetailsModal = false" class="btn btn-secondary text-xs font-bold px-4 h-9">
              Close
            </button>
            <button
              type="button"
              @click="openEditJobCardModal(selectedJob)"
              class="btn btn-secondary text-amber-600 dark:text-amber-400 text-xs font-bold px-3 h-9 flex items-center gap-1.5 shadow-sm"
              title="Edit Machine Intake Details"
            >
              <Pencil :size="14" />
              <span>Edit Intake Info</span>
            </button>
            <button
              type="button"
              @click="saveModal2All('print-job')"
              class="btn btn-secondary text-sky-600 dark:text-sky-400 text-xs font-bold px-3 h-9 flex items-center gap-1.5 shadow-sm"
              title="Print Job Card Dossier"
            >
              <Printer :size="14" />
              <span>Print Job Card</span>
            </button>
            <button
              type="button"
              @click="saveModal2All('print-dc')"
              class="btn btn-secondary text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 h-9 flex items-center gap-1.5 shadow-sm"
              title="Save and Print Delivery Challan (DC)"
            >
              <Truck :size="14" />
              <span>Print DC</span>
            </button>
            <button
              type="button"
              @click="saveModal2All('print-invoice')"
              class="btn btn-secondary text-blue-600 dark:text-blue-400 text-xs font-bold px-3 h-9 flex items-center gap-1.5 shadow-sm"
              title="Save and Print Workshop Invoice"
            >
              <Receipt :size="14" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              @click="saveModal2All('save')"
              class="btn btn-primary text-white text-xs font-bold px-5 h-9 shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 :size="14" />
              <span>✓ Save All Changes</span>
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
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-bold text-xs !h-9 sm:!h-10 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Purchase Invoice # *</label>
            <input
              v-model="inwardForm.invoiceNo"
              type="text"
              required
              placeholder="e.g. INV-CN-2026-88"
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs !h-9 sm:!h-10 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Shipment / BL Reference</label>
            <input
              v-model="inwardForm.blReference"
              type="text"
              placeholder="e.g. BL-MED-2026-CN"
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs !h-9 sm:!h-10 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 mb-1 block">Receiving Date *</label>
            <input
              v-model="inwardForm.receivingDate"
              type="date"
              required
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white font-mono font-bold text-xs !h-9 sm:!h-10 focus:border-amber-500 focus:outline-none"
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
                      <th class="py-2.5 px-2 w-10 text-center">#</th>
                      <th class="py-2.5 px-2 w-16 text-center">PHOTO</th>
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
                      <td class="py-2 px-2 text-center font-mono text-slate-400 font-bold text-xs">{{ idx + 1 }}</td>
                      <td class="py-2 px-2 text-center" style="width: 54px; vertical-align: middle;">
                        <div v-if="item.image" class="part-thumb-box cursor-pointer group/thumb" style="width: 38px; height: 38px; min-width: 38px; max-width: 38px; min-height: 38px; max-height: 38px; border-radius: 8px; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; position: relative; border: 1px solid #f59e0b; margin: 0 auto;">
                          <img
                            :src="item.image"
                            alt="Part photo"
                            @click="previewPartImage = { url: item.image, title: item.partName || item.partCode || 'Inward Part Photo', sub: item.brand ? `${item.brand} • ${item.partCode}` : item.partCode }"
                            class="part-thumb-img"
                            style="width: 38px; height: 38px; max-width: 38px; max-height: 38px; object-fit: cover; display: block;"
                            title="Click to view full photo"
                          />
                          <button
                            type="button"
                            @click.stop="item.image = ''"
                            class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow hover:bg-rose-700 opacity-80 group-hover/thumb:opacity-100 transition"
                            style="width: 16px; height: 16px; font-size: 9px; line-height: 1;"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                        <label
                          v-else
                          class="cursor-pointer inline-flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-slate-400 hover:text-amber-500 transition-colors group/upload"
                          style="width: 38px; height: 38px; margin: 0 auto; display: inline-flex;"
                          title="Attach spare part photo"
                        >
                          <Camera :size="14" class="group-hover/upload:scale-110 transition-transform" />
                          <span class="text-[8px] font-bold text-slate-400 group-hover/upload:text-amber-500" style="font-size: 8px; line-height: 1;">ADD</span>
                          <input
                            type="file"
                            accept="image/*"
                            class="hidden"
                            @change="handleInwardLineImageUpload(item, $event)"
                          />
                        </label>
                      </td>
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

              <div class="w-80">
                <input
                  v-model="inwardForm.remarks"
                  type="text"
                  placeholder="Receiving remarks / shipment tracking..."
                  class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white text-xs !h-9 focus:border-amber-500 focus:outline-none"
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
    <!-- ═══════════════════════════════════════════════════════
      MODAL 5: ADD NEW SPARE PART (HIGH-END MODERN ERP REDESIGN)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showNewPartModal" class="modal-backdrop z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md" @click.self="showNewPartModal = false">
      <div class="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        <!-- Header Bar -->
        <div class="px-5 py-3.5 bg-slate-100/90 dark:bg-[#080d18] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-inner shrink-0">
              <Cpu :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">Add New Spare Part to Warehouse</h3>
                <span class="badge badge-info text-[9px] font-mono px-2 py-0.5">INVENTORY RACKS</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Register component with warehouse rack coordinates, stock alert thresholds & verification image
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="showNewPartModal = false"
            class="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/80 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base transition-colors"
            title="Close dialog"
          >
            ✕
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form @submit.prevent="submitNewPart" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/40 dark:bg-transparent">
            
            <!-- 1. Part Identification & Technical Specifications -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <div class="text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <Boxes :size="15" />
                  <span>Part Identification & Technical Specifications</span>
                </div>
                <span class="text-[11px] text-slate-400 font-medium">Unique Code & Descriptive Name</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div class="md:col-span-4">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Part Code / SKU *
                  </label>
                  <input
                    v-model="partForm.partCode"
                    type="text"
                    required
                    placeholder="e.g. MB-SONO-400"
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold uppercase text-xs focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-xs"
                  />
                </div>
                <div class="md:col-span-8">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Part Name / Description *
                  </label>
                  <input
                    v-model="partForm.name"
                    type="text"
                    required
                    placeholder="e.g. Ultrasound High-Voltage Power Motherboard"
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    v-model="partForm.category"
                    class="w-full h-10 px-3 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-xs"
                  >
                    <option value="Electronic Boards & PCB">Electronic Boards & PCB</option>
                    <option value="Probes & Transducers">Probes & Transducers</option>
                    <option value="Power Supplies & Adapters">Power Supplies & Adapters</option>
                    <option value="Sensors & Cables">Sensors & Cables</option>
                    <option value="Motors & Pumps">Motors & Pumps</option>
                    <option value="Display & Keypads">Display & Keypads</option>
                    <option value="Lamps & Laser Modules">Lamps & Laser Modules</option>
                    <option value="General Spare Parts">General Spare Parts</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Brand / Manufacturer
                  </label>
                  <input
                    v-model="partForm.brand"
                    type="text"
                    placeholder="e.g. GE, Philips, Mindray, Siemens"
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Compatible Equipment / Models
                  </label>
                  <input
                    v-model="partForm.model"
                    type="text"
                    placeholder="e.g. Logiq E9, Voluson E8, CX50"
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            <!-- 2. Warehouse Physical Rack Coordinates -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <div class="text-xs font-black text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 :size="15" />
                  <span>Warehouse Physical Rack & Bin Coordinates</span>
                </div>
                <div class="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/50">
                  📍 {{ partForm.locationRack || 'Rack A' }} • {{ partForm.locationCabinet || 'Cab 1' }} • {{ partForm.locationShelf || 'Shelf 1' }}
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rack Location *
                  </label>
                  <input
                    v-model="partForm.locationRack"
                    type="text"
                    required
                    placeholder="e.g. Rack A or Warehouse Row 3"
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cabinet
                  </label>
                  <input
                    v-model="partForm.locationCabinet"
                    type="text"
                    placeholder="e.g. Cab 1 / Section B"
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Shelf / Bin / Drawer
                  </label>
                  <input
                    v-model="partForm.locationShelf"
                    type="text"
                    placeholder="e.g. Shelf 1 / Bin 4"
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            <!-- 3. Stock Quantities & Commercial Pricing -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <div class="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Banknote :size="15" />
                  <span>Stock Levels & Commercial Pricing (PKR)</span>
                </div>
                <div v-if="partForm.sellingPrice && partForm.unitCost" class="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                  Gross Profit: PKR {{ Math.max(0, partForm.sellingPrice - partForm.unitCost).toLocaleString() }} ({{ Math.round(((partForm.sellingPrice - partForm.unitCost) / (partForm.unitCost || 1)) * 100) }}% Markup)
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Initial Stock (Units) *
                  </label>
                  <input
                    v-model.number="partForm.stockQty"
                    type="number"
                    min="0"
                    required
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Min Stock Alert Level *
                  </label>
                  <input
                    v-model.number="partForm.minQty"
                    type="number"
                    min="1"
                    required
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Unit Cost Price (PKR) *
                  </label>
                  <input
                    v-model.number="partForm.unitCost"
                    type="number"
                    min="0"
                    required
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">
                    Selling Price (PKR) *
                  </label>
                  <input
                    v-model.number="partForm.sellingPrice"
                    type="number"
                    min="0"
                    placeholder="Optional selling rate"
                    class="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151f32] border border-emerald-300 dark:border-emerald-700/80 rounded-xl text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            <!-- 4. Spare Part Image / Verification Photo -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-teal-300 dark:border-teal-700/60 shadow-xs space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Spare Part Photo / Verification Image (Optional)
                </label>
                <span class="text-[11px] text-slate-400">Component Photo, PCB layout or sticker</span>
              </div>

              <div class="flex flex-col sm:flex-row items-center gap-3.5">
                <!-- Thumbnail Preview -->
                <div v-if="partForm.image" class="part-preview-card" style="width: 80px; height: 80px; min-width: 80px; max-width: 80px; min-height: 80px; max-height: 80px; border-radius: 12px; overflow: hidden; position: relative; border: 2px solid #0d9488; flex-shrink: 0;">
                  <img :src="partForm.image" alt="Part Photo" class="part-preview-img" style="width: 80px; height: 80px; max-width: 80px; max-height: 80px; object-fit: cover; display: block;" />
                  <button
                    type="button"
                    @click="removeNewPartImage"
                    class="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors"
                    style="width: 20px; height: 20px; font-size: 10px; line-height: 1;"
                    title="Remove Photo"
                  >
                    ✕
                  </button>
                </div>
                <div v-else class="part-preview-card" style="width: 72px; height: 72px; min-width: 72px; max-width: 72px; min-height: 72px; max-height: 72px; border-radius: 12px; border: 1px dashed #0d9488; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <Camera :size="28" class="text-teal-600" />
                </div>

                <!-- Upload controls -->
                <div class="flex-1 w-full space-y-1.5">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-400 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-xs font-bold transition-all shadow-xs">
                      <Camera :size="15" />
                      <span>{{ partForm.image ? 'Change Photo' : 'Upload Part Photo' }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        @change="handleNewPartImageUpload"
                        class="hidden"
                      />
                    </label>
                    <button
                      v-if="partForm.image"
                      type="button"
                      @click="removeNewPartImage"
                      class="btn btn-xs btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold"
                    >
                      Remove
                    </button>
                    <span v-if="partForm.image" class="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      ✓ Photo attached successfully
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Supports high-resolution PNG, JPG, or WebP files up to 5MB. Photo will appear in warehouse catalogs and job card dossiers.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Sticky Action Footer -->
          <div class="px-5 py-3.5 bg-slate-100/90 dark:bg-[#080d18] border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            <div class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Part Code: <strong class="font-mono text-teal-600 dark:text-teal-400">{{ partForm.partCode || '—' }}</strong> • 
              Initial Stock: <strong class="font-mono text-slate-900 dark:text-white">{{ partForm.stockQty || 0 }} Units</strong>
            </div>
            <div class="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                @click="showNewPartModal = false"
                class="btn btn-secondary text-xs font-bold px-4 h-9"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary text-white text-xs font-bold px-5 h-9 shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 :size="14" />
                <span>Register Part to Warehouse</span>
              </button>
            </div>
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

    <!-- Lightbox Modal for Spare Part Verification Image -->
    <div v-if="previewPartImage" class="modal-backdrop z-50 flex items-center justify-center p-4" @click.self="previewPartImage = null">
      <div class="bg-white dark:bg-slate-900 rounded-2xl w-full p-4 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in" style="max-width: 440px;">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div class="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-2 min-w-0">
            <Camera :size="15" class="text-teal-600 shrink-0" />
            <span class="truncate">{{ previewPartImage.title || 'Spare Part Verification Photo' }}</span>
          </div>
          <button @click="previewPartImage = null" class="btn btn-xs btn-ghost text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold p-1">✕</button>
        </div>
        <div class="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2" style="max-height: 380px; min-height: 200px;">
          <img :src="previewPartImage.url" alt="Part photo" style="max-height: 360px; max-width: 100%; object-fit: contain; border-radius: 8px;" class="shadow-md" />
        </div>
        <div class="flex justify-between items-center text-xs text-slate-500 pt-1">
          <span class="font-mono text-[11px] truncate max-w-[280px]">{{ previewPartImage.sub || '' }}</span>
          <button @click="previewPartImage = null" class="btn btn-xs btn-secondary font-bold px-3">Close</button>
        </div>
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
  EyeOff,
  Camera,
  ChevronLeft,
  ChevronRight,
  Image
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
  // Dispatch and Invoice features are now directly integrated into Customer Job Cards
  if (clean === 'dispatch' || clean === 'dc' || clean === 'delivery') return 'jobs'
  if (clean === 'invoices' || clean === 'invoice' || clean === 'billing') return 'jobs'
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
  { id: 'payments', label: 'Payments & Customer Ledger', icon: Banknote },
  { id: 'history', label: '360° Machine History', icon: History },
  { id: 'reports', label: 'Reports & Technicians', icon: FileSpreadsheet },
  { id: 'warranties', label: 'Warranty Registry', icon: ShieldCheck }
])

function selectTab(t) {
  activeTab.value = normalizeTab(t)
  router.replace({ query: { ...route.query, tab: activeTab.value } }).catch(() => {})
}

watch(() => [route.query.tab, route.query.action], ([newTab, newAction]) => {
  activeTab.value = normalizeTab(newTab)
  if (newAction === 'new') {
    openNewJobCardModal()
  }
})

onMounted(() => {
  activeTab.value = normalizeTab(route.query.tab)
  if (route.query.action === 'new') {
    openNewJobCardModal()
  }
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

const serialSearchQuery = ref('')

const newJobForm = ref({
  serialNumber: '',
  machineCode: '',
  customerName: '',
  customerPhone: '',
  customerType: 'Existing Company Customer',
  machineName: '',
  brand: '',
  model: '',
  warrantyStatus: 'In Warranty',
  receivingDate: new Date().toISOString().substring(0, 10),
  receivedVia: 'Cargo Service',
  receivingTrackingNo: '',
  receivingOrigin: '',
  expectedDeliveryDate: '',
  assignedTechnician: 'Engr. Tariq Saeed (Senior Biomedical Specialist)',
  customerComplaint: '',
  machineCondition: 'Normal wear',
  accessoriesReceived: 'Power cord, 1 standard probe',

  // Integrated Dispatch & DC fields
  generateDC: false,
  cargoService: 'Daewoo Cargo',
  shipmentType: 'Standard Cargo',
  trackingNo: '',
  deliveryCharges: 0,
  dispatchDate: new Date().toISOString().substring(0, 10),
  dispatchedBy: '',
  receiverName: '',
  receiverPhone: '',
  deliveryAddress: '',
  dispatchStatus: 'Ready for Delivery',
  deliveryRemarks: '',

  // Integrated Invoice & Billing fields
  generateInvoice: false,
  labourCharges: 0,
  otherCharges: 0,
  discount: 0,
  paymentStatus: 'Unpaid',
  paymentMethod: 'Cash',
  paidAmount: 0
})

const computedNewJobPartsCost = computed(() => {
  const parts = newJobForm.value.partsUsed || []
  return parts.reduce((sum, p) => {
    if (p.isWarranty) return sum
    return sum + (Number(p.quantity || 1) * Number(p.unitPrice || 0))
  }, 0)
})

const computedNewJobInvoiceTotal = computed(() => {
  const partsCost = computedNewJobPartsCost.value
  const labour = Number(newJobForm.value.labourCharges || 0)
  const other = Number(newJobForm.value.otherCharges || 0)
  const delivery = Number(newJobForm.value.deliveryCharges || 0)
  const discount = Number(newJobForm.value.discount || 0)
  return Math.max(0, partsCost + labour + other + delivery - discount)
})

function openNewJobCardModal() {
  editingJobCard.value = null
  selectedJob.value = null
  serialLookupMatch.value = null
  serialSearchQuery.value = ''
  showIssuePartSection.value = false
  newJobForm.value = {
    serialNumber: '',
    machineCode: '',
    customerName: '',
    customerPhone: '',
    customerType: 'Existing Company Customer',
    machineName: '',
    brand: '',
    model: '',
    warrantyStatus: 'In Warranty',
    receivingDate: new Date().toISOString().substring(0, 10),
    receivedVia: 'Cargo Service',
    receivingTrackingNo: '',
    receivingOrigin: '',
    expectedDeliveryDate: '',
    assignedTechnician: dataStore.workshopTechnicians?.[0] || 'Engr. Tariq Saeed (Senior Biomedical Specialist)',
    customerComplaint: '',
    diagnosis: '',
    requiredRepair: '',
    machineCondition: 'Normal wear',
    accessoriesReceived: 'Power cord',
    partsUsed: [],

    generateDC: false,
    cargoService: 'Daewoo Cargo',
    shipmentType: 'Standard Cargo',
    trackingNo: '',
    deliveryCharges: 0,
    dispatchDate: new Date().toISOString().substring(0, 10),
    dispatchedBy: dataStore.workshopTechnicians?.[0] || 'Engr. Tariq Saeed',
    receiverName: '',
    receiverPhone: '',
    deliveryAddress: '',
    dispatchStatus: 'Ready for Delivery',
    deliveryRemarks: '',

    generateInvoice: false,
    labourCharges: 0,
    otherCharges: 0,
    discount: 0,
    paymentStatus: 'Unpaid',
    paymentMethod: 'Cash',
    paidAmount: 0
  }
  showNewJobCardModal.value = true
}

function openEditJobCardModal(job) {
  editingJobCard.value = job
  selectedJob.value = job
  serialLookupMatch.value = null
  serialSearchQuery.value = job.serialNumber || job.machineCode || ''
  showIssuePartSection.value = false
  newJobForm.value = {
    serialNumber: job.serialNumber || '',
    machineCode: job.machineCode || '',
    customerName: job.customerName || '',
    customerPhone: job.customerPhone || '',
    customerType: job.customerType || 'Existing Company Customer',
    machineName: job.machineName || '',
    brand: job.brand || '',
    model: job.model || '',
    warrantyStatus: job.warrantyStatus || 'In Warranty',
    receivingDate: job.receivingDate || new Date().toISOString().substring(0, 10),
    receivedVia: job.receivedVia || 'Cargo Service',
    receivingTrackingNo: job.receivingTrackingNo || '',
    receivingOrigin: job.receivingOrigin || '',
    expectedDeliveryDate: job.expectedDeliveryDate || '',
    assignedTechnician: job.assignedTechnician || (dataStore.workshopTechnicians?.[0] || 'Engr. Tariq Saeed (Senior Biomedical Specialist)'),
    customerComplaint: job.customerComplaint || '',
    diagnosis: job.faultDiagnosis?.diagnosis || job.customerComplaint || '',
    requiredRepair: job.faultDiagnosis?.requiredRepair || '',
    machineCondition: job.machineCondition || 'Normal wear',
    accessoriesReceived: job.accessoriesReceived || 'Power cord',
    partsUsed: JSON.parse(JSON.stringify(job.partsUsed || [])),

    generateDC: !!job.dcGenerated,
    cargoService: job.cargoService || 'Daewoo Cargo',
    shipmentType: job.shipmentType || 'Standard Cargo',
    trackingNo: job.trackingNo || '',
    deliveryCharges: Number(job.deliveryCharges || 0),
    dispatchDate: job.dispatchDate || new Date().toISOString().substring(0, 10),
    dispatchedBy: job.dispatchedBy || job.assignedTechnician || 'Engr. Tariq Saeed',
    receiverName: job.receiverName || job.customerName || '',
    receiverPhone: job.receiverPhone || job.customerPhone || '',
    deliveryAddress: job.deliveryAddress || '',
    dispatchStatus: job.dispatchStatus || (job.status === 'Delivered' ? 'Delivered' : 'Ready for Delivery'),
    deliveryRemarks: job.remarks || '',

    generateInvoice: !!job.invoiceGenerated,
    labourCharges: Number(job.faultDiagnosis?.labourCharges || 0),
    otherCharges: Number(job.faultDiagnosis?.otherCharges || 0),
    discount: Number(job.invoiceDiscount || job.discount || 0),
    paymentStatus: job.paymentStatus || 'Unpaid',
    paymentMethod: (job.payments?.[0]?.method) || 'Cash',
    paidAmount: Number(job.paidAmount || 0)
  }
  if (showJobDetailsModal.value) {
    showJobDetailsModal.value = false
  }
  showNewJobCardModal.value = true
  if (newJobForm.value.serialNumber) {
    triggerSerialLookup()
  }
}

function onSerialSearchInput() {
  triggerSerialLookup()
}

function triggerSerialLookup() {
  const raw = (newJobForm.value.serialNumber || serialSearchQuery.value || '').trim()
  const q = raw.toLowerCase().replace(/^sn-/i, '')
  if (!q) {
    serialLookupMatch.value = null
    return
  }
  const match = (dataStore.serials || []).find(s => {
    const sCode = (s.serialCode || '').toLowerCase().replace(/^sn-/i, '')
    const mCode = (s.machineCode || '').toLowerCase()
    const pName = (s.productName || '').toLowerCase()
    return sCode === q || mCode === q || pName === q
  })

  if (match) {
    serialLookupMatch.value = match
    newJobForm.value.serialNumber = match.serialCode || raw
    if (match.machineCode) newJobForm.value.machineCode = match.machineCode
    if (match.customer) newJobForm.value.customerName = match.customer
    if (match.customerPhone) newJobForm.value.customerPhone = match.customerPhone
    if (match.productName) newJobForm.value.machineName = match.productName
    if (match.brand) newJobForm.value.brand = match.brand
    if (match.model) newJobForm.value.model = match.model
    newJobForm.value.warrantyStatus = match.warrantyExpires ? 'In Warranty' : (match.status === 'Under Warranty' ? 'In Warranty' : 'Out of Warranty')
    if (match.containerNo || match.blNumber) {
      newJobForm.value.receivingTrackingNo = match.containerNo || match.blNumber
      newJobForm.value.receivedVia = 'Container / Shipping Freight'
    }
  } else {
    serialLookupMatch.value = null
  }
}

async function submitJobCardForm(action = 'save') {
  try {
    let resultJob
    const jobPayload = {
      ...newJobForm.value,
      faultDiagnosis: {
        diagnosis: newJobForm.value.diagnosis || newJobForm.value.customerComplaint || 'Inspected',
        requiredRepair: newJobForm.value.requiredRepair || editingJobCard.value?.faultDiagnosis?.requiredRepair || '',
        labourCharges: Number(newJobForm.value.labourCharges || 0),
        otherCharges: Number(newJobForm.value.otherCharges || 0),
        technicianRemarks: editingJobCard.value?.faultDiagnosis?.technicianRemarks || ''
      },
      deliveryCharges: Number(newJobForm.value.deliveryCharges || 0),
      cargoService: newJobForm.value.cargoService,
      shipmentType: newJobForm.value.shipmentType,
      trackingNo: newJobForm.value.trackingNo,
      dispatchDate: newJobForm.value.dispatchDate,
      dispatchedBy: newJobForm.value.dispatchedBy || newJobForm.value.assignedTechnician,
      receiverName: newJobForm.value.receiverName || newJobForm.value.customerName,
      receiverPhone: newJobForm.value.receiverPhone || newJobForm.value.customerPhone,
      deliveryAddress: newJobForm.value.deliveryAddress,
      dispatchStatus: newJobForm.value.dispatchStatus,
      repairedBy: newJobForm.value.assignedTechnician
    }

    if (editingJobCard.value) {
      resultJob = await dataStore.updateWorkshopJobCard(editingJobCard.value.jobCardNo, jobPayload, authStore.user)
      uiStore.showToast(`Job Card ${resultJob.jobCardNo} updated successfully!`, 'success')
    } else {
      resultJob = await dataStore.createWorkshopJobCard(jobPayload, authStore.user)
      if (newJobForm.value.partsUsed && newJobForm.value.partsUsed.length > 0) {
        for (const p of newJobForm.value.partsUsed) {
          await dataStore.issuePartToJobCard(
            resultJob.jobCardNo,
            p,
            p.quantity,
            p.isWarranty,
            authStore.user,
            p.unitPrice
          )
        }
      }
      uiStore.showToast(`Job Card ${resultJob.jobCardNo} created and machine received!`, 'success')
    }

    // Process dispatch / DC if enabled or tracking/cargo filled
    if ((newJobForm.value.generateDC || newJobForm.value.trackingNo) && resultJob) {
      resultJob = await dataStore.updateWorkshopDispatch(resultJob.jobCardNo, {
        cargoService: newJobForm.value.cargoService,
        shipmentType: newJobForm.value.shipmentType,
        trackingNo: newJobForm.value.trackingNo,
        deliveryCharges: newJobForm.value.deliveryCharges,
        dispatchDate: newJobForm.value.dispatchDate,
        dispatchedBy: newJobForm.value.dispatchedBy || newJobForm.value.assignedTechnician,
        receiverName: newJobForm.value.receiverName || newJobForm.value.customerName,
        receiverPhone: newJobForm.value.receiverPhone || newJobForm.value.customerPhone,
        deliveryAddress: newJobForm.value.deliveryAddress,
        dispatchStatus: newJobForm.value.dispatchStatus
      }, authStore.user)
    }

    // Process invoice if enabled or charges entered
    if ((newJobForm.value.generateInvoice || newJobForm.value.labourCharges > 0 || newJobForm.value.deliveryCharges > 0) && resultJob) {
      resultJob = await dataStore.generateWorkshopInvoice(resultJob.jobCardNo, {
        repairedBy: newJobForm.value.assignedTechnician,
        labourCharges: newJobForm.value.labourCharges,
        otherCharges: newJobForm.value.otherCharges,
        deliveryCharges: newJobForm.value.deliveryCharges,
        discount: newJobForm.value.discount
      }, authStore.user)

      if (Number(newJobForm.value.paidAmount || 0) > 0) {
        await dataStore.recordWorkshopPayment(resultJob.jobCardNo, {
          amount: Number(newJobForm.value.paidAmount),
          method: newJobForm.value.paymentMethod || 'Cash',
          date: newJobForm.value.receivingDate || new Date().toISOString().substring(0, 10),
          notes: 'Payment recorded during Job Card intake/edit'
        }, authStore.user)
      }
    }

    showNewJobCardModal.value = false
    editingJobCard.value = null
    activeTab.value = 'jobs'

    if (action === 'print-job' && resultJob) {
      printSingleJobCard(resultJob)
    } else if (action === 'print-dc' && resultJob) {
      printDeliveryChallan(resultJob)
    } else if (action === 'print-invoice' && resultJob) {
      printWorkshopInvoice(resultJob)
    }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

const submitNewJobCard = () => submitJobCardForm('save')

// ── Job Details, Diagnosis, Dispatch & Billing Modal ──────────────────────
const showJobDetailsModal = ref(false)
const selectedJob = ref(null)
const editDiagnosisForm = ref({
  diagnosis: '',
  requiredRepair: '',
  labourCharges: 0,
  otherCharges: 0
})

const editJobDispatchForm = ref({
  cargoService: 'Daewoo Express Cargo',
  shipmentType: 'Cargo',
  trackingNo: '',
  deliveryCharges: 0,
  dispatchDate: new Date().toISOString().substring(0, 10),
  dispatchedBy: '',
  receiverName: '',
  receiverPhone: '',
  deliveryAddress: '',
  dispatchStatus: 'Ready for Delivery',
  remarks: ''
})

const editJobInvoiceForm = ref({
  repairedBy: '',
  date: new Date().toISOString().substring(0, 10),
  discount: 0,
  paidAmount: 0,
  paymentMethod: 'Cash',
  paymentStatus: 'Unpaid'
})

const showIssuePartSection = ref(false)
const issuePartForm = ref({
  partSearchText: '',
  partCode: '',
  partName: '',
  quantity: 1,
  unitPrice: 0,
  availableStock: 0,
  locationRack: '',
  image: '',
  isWarranty: false
})

const previewPartImage = ref(null)

function handleIssuePartImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    uiStore.showToast('Please select a valid image file (PNG, JPG, WebP)', 'error')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    uiStore.showToast('Image size exceeds 5MB limit', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    issuePartForm.value.image = e.target.result
    uiStore.showToast('Spare part photo attached!', 'success')
  }
  reader.readAsDataURL(file)
}

function removeIssuePartImage() {
  issuePartForm.value.image = ''
}

function openPartImagePreview(part) {
  if (!part?.image) return
  previewPartImage.value = {
    url: part.image,
    title: `${part.partName || 'Spare Part'} (${part.partCode || 'No Code'})`,
    sub: `Issued: ${part.issuedAt ? new Date(part.issuedAt).toLocaleDateString() : 'N/A'} • Qty: ${part.quantity || 1}`
  }
}

async function uploadImageForExistingPart(partIdx, event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    uiStore.showToast('Please select an image file', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = async (e) => {
    const imgUrl = e.target.result
    const targetJob = editingJobCard.value || selectedJob.value
    if (targetJob) {
      const updated = await dataStore.updateJobPartImage(targetJob.jobCardNo, partIdx, imgUrl, authStore.user)
      if (updated) {
        selectedJob.value = updated
        editingJobCard.value = updated
        newJobForm.value.partsUsed = [...(updated.partsUsed || [])]
        uiStore.showToast('Photo attached to installed part!', 'success')
      }
    } else if (newJobForm.value.partsUsed?.[partIdx]) {
      newJobForm.value.partsUsed[partIdx].image = imgUrl
      uiStore.showToast('Photo attached to part!', 'success')
    }
  }
  reader.readAsDataURL(file)
}

function onSparePartSearchInput() {
  const val = (issuePartForm.value.partSearchText || '').trim().toLowerCase()
  if (!val) return
  const match = (dataStore.workshopSpareParts || []).find(p => 
    (p.partName || p.name || '').toLowerCase() === val ||
    (p.partCode || '').toLowerCase() === val ||
    (p.partName || p.name || '').toLowerCase().includes(val) ||
    (p.partCode || '').toLowerCase().includes(val)
  )
  if (match) {
    issuePartForm.value.partCode = match.partCode || ''
    issuePartForm.value.partName = match.partName || match.name || ''
    issuePartForm.value.availableStock = Number(match.currentStock ?? match.stockQty ?? 0)
    issuePartForm.value.locationRack = match.locationRack || 'Rack A'
    if (match.image) {
      issuePartForm.value.image = match.image
    }
    if (!issuePartForm.value.isWarranty) {
      issuePartForm.value.unitPrice = Number(match.sellingPrice ?? match.unitCost ?? match.purchasePrice ?? 0)
    }
  } else {
    issuePartForm.value.partName = issuePartForm.value.partSearchText
  }
}

const currentStageIndex = computed(() => {
  if (!selectedJob.value?.status) return 0
  const idx = allStages.indexOf(selectedJob.value.status)
  return idx >= 0 ? idx : 0
})

const currentStageBadgeClasses = computed(() => {
  const st = selectedJob.value?.status
  switch (st) {
    case 'Received':
      return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
    case 'Inspection':
    case 'Diagnosis':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
    case 'Parts Required':
    case 'Waiting for Parts':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
    case 'Repair in Process':
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
    case 'Repaired':
    case 'QC/Testing':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
    case 'Ready for Delivery':
    case 'Delivered':
    case 'Closed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
    default:
      return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
  }
})

function goToPrevStage() {
  if (currentStageIndex.value > 0) {
    const prev = allStages[currentStageIndex.value - 1]
    changeJobStage(prev)
  }
}

function goToNextStage() {
  if (currentStageIndex.value < allStages.length - 1) {
    const next = allStages[currentStageIndex.value + 1]
    changeJobStage(next)
  }
}

const computedModal2PartsCost = computed(() => {
  if (!selectedJob.value) return 0
  return (selectedJob.value.partsUsed || []).reduce((sum, p) => {
    if (p.isWarranty) return sum
    return sum + (Number(p.quantity || 1) * Number(p.unitPrice || 0))
  }, 0)
})

const computedModal2InvoiceTotal = computed(() => {
  const parts = computedModal2PartsCost.value
  const labour = Number(editDiagnosisForm.value.labourCharges || 0)
  const other = Number(editDiagnosisForm.value.otherCharges || 0)
  const delivery = Number(editJobDispatchForm.value.deliveryCharges || 0)
  const discount = Number(editJobInvoiceForm.value.discount || 0)
  return Math.max(0, parts + labour + other + delivery - discount)
})

function openJobDetailsModal(job) {
  // Manage is combined with Edit into one unified modal
  openEditJobCardModal(job)
}

async function changeJobStage(st) {
  const targetJob = editingJobCard.value || selectedJob.value
  if (!targetJob) return
  const updated = await dataStore.updateJobCardStatus(targetJob.jobCardNo, st, `Stage changed to ${st}`, authStore.user)
  if (updated) {
    selectedJob.value = updated
    editingJobCard.value = updated
  }
  uiStore.showToast(`Stage updated to ${st}`, 'info')
}

async function saveJobDiagnosis() {
  const targetJob = editingJobCard.value || selectedJob.value
  if (!targetJob) return
  const updated = await dataStore.updateJobCardDiagnosis(targetJob.jobCardNo, editDiagnosisForm.value, authStore.user)
  if (updated) {
    selectedJob.value = updated
    editingJobCard.value = updated
  }
  uiStore.showToast('Diagnosis and labour charges saved!', 'success')
}

async function confirmIssuePart() {
  const pCode = (issuePartForm.value.partCode || issuePartForm.value.partSearchText || '').trim()
  const pName = (issuePartForm.value.partName || issuePartForm.value.partSearchText || '').trim()

  if (!pCode && !pName) {
    uiStore.showToast('Please type or select a spare part name/code!', 'error')
    return
  }

  const partItem = {
    partCode: pCode || `SP-${Date.now().toString().slice(-4)}`,
    partName: pName || pCode,
    quantity: Math.max(1, Number(issuePartForm.value.quantity || 1)),
    unitPrice: Number(issuePartForm.value.unitPrice || 0),
    image: issuePartForm.value.image || '',
    isWarranty: !!issuePartForm.value.isWarranty,
    locationRack: issuePartForm.value.locationRack || 'Rack A',
    issuedAt: new Date().toISOString()
  }

  const targetJob = editingJobCard.value || selectedJob.value
  try {
    if (targetJob) {
      const updated = await dataStore.issuePartToJobCard(
        targetJob.jobCardNo,
        partItem,
        partItem.quantity,
        partItem.isWarranty,
        authStore.user,
        partItem.unitPrice
      )
      if (updated) {
        selectedJob.value = updated
        editingJobCard.value = updated
        newJobForm.value.partsUsed = [...(updated.partsUsed || [])]
      }
      uiStore.showToast('Spare part issued successfully and added to job card!', 'success')
    } else {
      if (!newJobForm.value.partsUsed) newJobForm.value.partsUsed = []
      newJobForm.value.partsUsed.push(partItem)
      uiStore.showToast('Spare part queued for issue upon receiving!', 'success')
    }

    showIssuePartSection.value = false
    issuePartForm.value = {
      partSearchText: '',
      partCode: '',
      partName: '',
      quantity: 1,
      unitPrice: 0,
      availableStock: 0,
      locationRack: '',
      image: '',
      isWarranty: newJobForm.value.warrantyStatus === 'In Warranty'
    }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

async function returnPart(pIdx) {
  const targetJob = editingJobCard.value || selectedJob.value
  try {
    if (targetJob) {
      const updated = await dataStore.returnPartFromJobCard(targetJob.jobCardNo, pIdx, 'Returned unused by engineer', authStore.user)
      if (updated) {
        selectedJob.value = updated
        editingJobCard.value = updated
        newJobForm.value.partsUsed = [...(updated.partsUsed || [])]
      }
      uiStore.showToast('Spare part returned back to workshop inventory stock!', 'success')
    } else {
      if (newJobForm.value.partsUsed && newJobForm.value.partsUsed[pIdx]) {
        newJobForm.value.partsUsed.splice(pIdx, 1)
        uiStore.showToast('Spare part removed from intake dossier', 'info')
      }
    }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

async function saveModal2Dispatch(printDC = false) {
  if (!selectedJob.value) return
  try {
    let updated = await dataStore.updateWorkshopDispatch(selectedJob.value.jobCardNo, editJobDispatchForm.value, authStore.user)
    if (!updated.dcGenerated) {
      updated = await dataStore.generateWorkshopDC(updated.jobCardNo, authStore.user) || updated
    }
    selectedJob.value = updated
    uiStore.showToast(`Dispatch details & DC updated for ${updated.jobCardNo}!`, 'success')
    if (printDC) {
      printDeliveryChallan(updated)
    }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

async function saveModal2Invoice(printInvoice = false) {
  if (!selectedJob.value) return
  try {
    let updated = await dataStore.generateWorkshopInvoice(
      selectedJob.value.jobCardNo,
      {
        repairedBy: editJobInvoiceForm.value.repairedBy || selectedJob.value.assignedTechnician,
        labourCharges: editDiagnosisForm.value.labourCharges,
        otherCharges: editDiagnosisForm.value.otherCharges,
        deliveryCharges: editJobDispatchForm.value.deliveryCharges,
        discount: editJobInvoiceForm.value.discount
      },
      authStore.user
    )

    if (Number(editJobInvoiceForm.value.paidAmount || 0) > 0) {
      await dataStore.recordWorkshopPayment(
        updated.jobCardNo,
        {
          amount: Number(editJobInvoiceForm.value.paidAmount),
          method: editJobInvoiceForm.value.paymentMethod || 'Cash',
          date: editJobInvoiceForm.value.date || new Date().toISOString().substring(0, 10),
          notes: 'Counter payment recorded from Job Card Dossier'
        },
        authStore.user
      )
      editJobInvoiceForm.value.paidAmount = 0
      const refetched = dataStore.workshopJobCards.find(j => j.jobCardNo === updated.jobCardNo)
      if (refetched) updated = refetched
    }

    selectedJob.value = updated
    uiStore.showToast(`Invoice ${updated.invoiceNumber} saved & synced to customer ledger!`, 'success')
    if (printInvoice) {
      printWorkshopInvoice(updated)
    }
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

async function saveModal2All(action = 'save') {
  if (!selectedJob.value) return
  try {
    // 1. Diagnosis
    await dataStore.updateJobCardDiagnosis(selectedJob.value.jobCardNo, editDiagnosisForm.value, authStore.user)

    // 2. Dispatch
    let updated = await dataStore.updateWorkshopDispatch(selectedJob.value.jobCardNo, editJobDispatchForm.value, authStore.user)
    if (!updated.dcGenerated) {
      updated = await dataStore.generateWorkshopDC(updated.jobCardNo, authStore.user) || updated
    }

    // 3. Invoice
    updated = await dataStore.generateWorkshopInvoice(
      updated.jobCardNo,
      {
        repairedBy: editJobInvoiceForm.value.repairedBy || updated.assignedTechnician,
        labourCharges: editDiagnosisForm.value.labourCharges,
        otherCharges: editDiagnosisForm.value.otherCharges,
        deliveryCharges: editJobDispatchForm.value.deliveryCharges,
        discount: editJobInvoiceForm.value.discount
      },
      authStore.user
    )

    // 4. Payment
    if (Number(editJobInvoiceForm.value.paidAmount || 0) > 0) {
      await dataStore.recordWorkshopPayment(
        updated.jobCardNo,
        {
          amount: Number(editJobInvoiceForm.value.paidAmount),
          method: editJobInvoiceForm.value.paymentMethod || 'Cash',
          date: editJobInvoiceForm.value.date || new Date().toISOString().substring(0, 10),
          notes: 'Counter payment recorded from Job Card Dossier'
        },
        authStore.user
      )
      editJobInvoiceForm.value.paidAmount = 0
      const refetched = dataStore.workshopJobCards.find(j => j.jobCardNo === updated.jobCardNo)
      if (refetched) updated = refetched
    }

    selectedJob.value = updated
    uiStore.showToast(`Job Card ${updated.jobCardNo} dossier, dispatch & invoice saved!`, 'success')

    if (action === 'print-job') {
      printSingleJobCard(updated)
    } else if (action === 'print-dc') {
      printDeliveryChallan(updated)
    } else if (action === 'print-invoice') {
      printWorkshopInvoice(updated)
    }
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
      { partCode: '', partName: '', brand: '', model: '', quantity: 1, unitCost: 0, locationRack: 'Rack A', locationCabinet: 'Cab 1', image: '' }
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
    if (!item.image && existing.image) item.image = existing.image
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
    locationCabinet: 'Cab 1',
    image: ''
  })
}

function handleInwardLineImageUpload(item, event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    uiStore.showToast('Please select a valid image file (PNG, JPG, WebP)', 'error')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    uiStore.showToast('Image size exceeds 5MB limit', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    item.image = e.target.result
    uiStore.showToast(`Photo attached to ${item.partCode || 'spare part'}!`, 'success')
  }
  reader.readAsDataURL(file)
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
  category: 'General Spare Parts',
  brand: '',
  model: '',
  locationRack: 'Rack A',
  locationCabinet: 'Cab 1',
  locationShelf: 'Shelf 1',
  stockQty: 5,
  minQty: 2,
  unitCost: 5000,
  sellingPrice: 7500,
  image: ''
})

function openNewPartModal() {
  partForm.value = {
    partCode: '',
    name: '',
    category: 'General Spare Parts',
    brand: '',
    model: '',
    locationRack: 'Rack A',
    locationCabinet: 'Cab 1',
    locationShelf: 'Shelf 1',
    stockQty: 5,
    minQty: 2,
    unitCost: 5000,
    sellingPrice: 7500,
    image: ''
  }
  showNewPartModal.value = true
}

function handleNewPartImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    uiStore.showToast('Please select a valid image file (PNG, JPG, WebP)', 'error')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    uiStore.showToast('Image size exceeds 5MB limit', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    partForm.value.image = e.target.result
    uiStore.showToast('Spare part photo attached!', 'success')
  }
  reader.readAsDataURL(file)
}

function removeNewPartImage() {
  partForm.value.image = ''
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
  if (!job) return
  const dcNumber = job.dcNumber || `WDC-${new Date().getFullYear()}-${String(job.jobCardNo || '').replace(/\D/g, '').slice(-4) || Date.now().toString().slice(-4)}`
  const metadata = {
    'Delivery Challan #': dcNumber,
    'Job Card #': job.jobCardNo,
    'Customer Name': job.customerName,
    'Machine & Model': `${job.machineName || ''} (${job.brand || ''} ${job.model || ''})`,
    'Serial Number': job.serialNumber,
    'Delivery Date': job.deliveryDate || job.dispatchDate || new Date().toISOString().substring(0, 10),
    'Cargo Carrier': job.cargoService || job.shipmentType || 'Standard Cargo',
    'Tracking / Bilty #': job.trackingNo || 'N/A',
    'Delivery Charges': `PKR ${(Number(job.deliveryCharges) || 0).toLocaleString()}`,
    'Receiver': `${job.receiverName || job.customerName} (${job.receiverPhone || job.customerPhone || 'N/A'})`,
    'Delivery Address': job.deliveryAddress || 'Customer Facility',
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
  exportPrint(`Workshop Delivery Challan (DC) - ${dcNumber}`, metadata, columns, rows)
}

function printWorkshopInvoice(job) {
  if (!job) return
  const invoiceNumber = job.invoiceNumber || `WINV-${new Date().getFullYear()}-${String(job.jobCardNo || '').replace(/\D/g, '').slice(-4) || Date.now().toString().slice(-4)}`
  const metadata = {
    'Invoice #': invoiceNumber,
    'Job Card #': job.jobCardNo,
    'Customer': job.customerName,
    'Machine & Model': `${job.machineName || ''} (${job.brand || ''} ${job.model || ''})`,
    'Machine Serial': job.serialNumber,
    'Invoice Date': job.invoiceDate || new Date().toISOString().substring(0, 10),
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
  if (job.deliveryCharges) {
    rows.push(['Cargo / Courier Delivery Charges', '1', Number(job.deliveryCharges).toLocaleString(), Number(job.deliveryCharges).toLocaleString()])
  }
  if (job.faultDiagnosis?.otherCharges) {
    rows.push(['Workshop Consumables & Logistics', '1', job.faultDiagnosis.otherCharges.toLocaleString(), job.faultDiagnosis.otherCharges.toLocaleString()])
  }
  if (job.invoiceDiscount || job.discount) {
    rows.push(['Special Workshop Discount', '1', `-${Number(job.invoiceDiscount || job.discount).toLocaleString()}`, `-${Number(job.invoiceDiscount || job.discount).toLocaleString()}`])
  }
  exportPrint(`Workshop Tax Invoice - ${invoiceNumber}`, metadata, columns, rows)
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
