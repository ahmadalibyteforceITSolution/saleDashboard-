<template>
  <div class="page-wrapper space-y-6">
    <!-- ═══════════════════════════════════════════════════════
      TOP HEADER & WORKSHOP COMMAND CENTER
    ═══════════════════════════════════════════════════════ -->
    <div class="header-card border-l-4 border-emerald-500 shadow-xl">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="pill-group">
            <span class="badge badge-emerald font-mono">COMPLETE WORKSHOP MANAGEMENT MODULE</span>
            <span class="badge badge-purple font-mono">TECHNICAL SERVICE & REPAIR ERP</span>
            <span class="badge badge-info font-mono">{{ activeBranchFilter }}</span>
          </div>
          <h1 class="header-title flex items-center gap-2 mt-1">
            <Wrench class="text-emerald-400 w-8 h-8" />
            <span>Workshop Management, Diagnostics & Spare Parts Hub</span>
          </h1>
          <p class="header-subtitle text-xs text-slate-300 mt-1 max-w-4xl">
            Customer Machine Receiving • Job Cards • Fault Diagnosis • China Spare Parts Inward • Location Rack/Shelf Tracking • Auto Stock Deduction • Delivery Challan (DC) • Workshop Invoices & Payments • 360° Lifetime Machine History.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            @click="openNewJobCardModal"
            class="btn btn-primary text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus :size="15" />
            <span>Receive Machine / Job Card</span>
          </button>

          <button
            @click="openNewInwardModal"
            class="btn btn-secondary text-xs font-bold flex items-center gap-1.5 shadow-sm text-amber-300"
          >
            <PackagePlus :size="15" />
            <span>Inward China Parts</span>
          </button>

          <button
            @click="openNewPartModal"
            class="btn btn-secondary text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus :size="15" class="text-teal-400" />
            <span>Add Spare Part</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      NAVIGATION TABS (ALL 21 WORKSHOP REQUIREMENTS)
    ═══════════════════════════════════════════════════════ -->
    <div class="glass-panel p-2 flex flex-wrap gap-2 border border-slate-700/60 shadow-lg">
      <button
        @click="activeTab = 'dashboard'"
        :class="['px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <LayoutDashboard :size="15" />
        <span>1. Workshop Dashboard</span>
      </button>

      <button
        @click="activeTab = 'jobs'"
        :class="['px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'jobs' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <ClipboardList :size="15" />
        <span>2. Customer Job Cards</span>
        <span class="badge badge-neutral text-[10px] font-mono ml-1">{{ dataStore.workshopJobCards.length }}</span>
      </button>

      <button
        @click="activeTab = 'inventory'"
        :class="['px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'inventory' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <Cpu :size="15" />
        <span>3. Spare Parts & Racks</span>
        <span class="badge badge-info text-[10px] font-mono ml-1">{{ dataStore.workshopSpareParts.length }}</span>
      </button>

      <button
        @click="activeTab = 'inward'"
        :class="['px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'inward' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <Boxes :size="15" />
        <span>4. China Parts Inward</span>
        <span class="badge badge-warning text-[10px] font-mono ml-1">{{ dataStore.workshopPartsInward.length }}</span>
      </button>

      <button
        @click="activeTab = 'billing'"
        :class="['px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'billing' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <Receipt :size="15" />
        <span>5. DC, Invoices & Payments</span>
      </button>

      <button
        @click="activeTab = 'history'"
        :class="['px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'history' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <History :size="15" />
        <span>6. 360° Machine Lifetime History</span>
      </button>

      <button
        @click="activeTab = 'reports'"
        :class="['px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'reports' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <FileSpreadsheet :size="15" />
        <span>7. Reports & Technicians</span>
      </button>

      <button
        @click="activeTab = 'warranties'"
        :class="['px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'warranties' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <ShieldCheck :size="15" />
        <span>8. Factory Warranty Registry</span>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 1: WORKSHOP DASHBOARD (REQUIREMENTS 1, 17, 20, 21)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <!-- 8 Key Metrics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-primary">
          <div class="p-3 rounded-xl bg-primary/10 text-primary">
            <Wrench :size="24" />
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Machines In Workshop</div>
            <div class="text-xl font-black text-white font-mono mt-0.5">{{ activeWorkshopMachinesCount }} Units</div>
            <div class="text-[10px] text-slate-400">{{ dataStore.workshopJobCards.length }} lifetime tickets</div>
          </div>
        </div>

        <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-amber-500">
          <div class="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock :size="24" />
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">In Repair / Diagnostic</div>
            <div class="text-xl font-black text-amber-400 font-mono mt-0.5">{{ inProcessJobsCount }} Jobs</div>
            <div class="text-[10px] text-amber-300">{{ waitingForPartsCount }} waiting for parts</div>
          </div>
        </div>

        <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-emerald-500">
          <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 :size="24" />
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Ready for Delivery / Delivered</div>
            <div class="text-xl font-black text-emerald-400 font-mono mt-0.5">{{ readyForDeliveryCount }} Ready</div>
            <div class="text-[10px] text-slate-400">{{ deliveredJobsCount }} delivered</div>
          </div>
        </div>

        <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-rose-500">
          <div class="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle :size="24" />
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Low Stock Parts Alert</div>
            <div class="text-xl font-black text-rose-400 font-mono mt-0.5">{{ lowStockPartsCount }} Items</div>
            <div class="text-[10px] text-rose-300">Requires China replenishment</div>
          </div>
        </div>

        <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-teal-500">
          <div class="p-3 rounded-xl bg-teal-500/10 text-teal-400">
            <Boxes :size="24" />
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Spare Parts Inventory</div>
            <div class="text-xl font-black text-white font-mono mt-0.5">{{ totalSparePartsStock }} Qty</div>
            <div class="text-[10px] text-teal-300">{{ dataStore.workshopSpareParts.length }} unique parts in racks</div>
          </div>
        </div>

        <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-blue-500">
          <div class="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <ShieldCheck :size="24" />
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Warranty vs Non-Warranty</div>
            <div class="text-xl font-black text-white font-mono mt-0.5">{{ warrantyJobsCount }} / {{ nonWarrantyJobsCount }}</div>
            <div class="text-[10px] text-blue-300">Warranty / Customer paid</div>
          </div>
        </div>

        <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-green-500">
          <div class="p-3 rounded-xl bg-green-500/10 text-green-400">
            <Banknote :size="24" />
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Workshop Revenue Collected</div>
            <div class="text-xl font-black text-green-400 font-mono mt-0.5">PKR {{ totalWorkshopRevenue.toLocaleString() }}</div>
            <div class="text-[10px] text-slate-400">Invoiced service & parts</div>
          </div>
        </div>

        <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-purple-500">
          <div class="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Receipt :size="24" />
          </div>
          <div>
            <div class="text-xs text-slate-400 font-bold uppercase">Total Outstanding Balance</div>
            <div class="text-xl font-black text-purple-300 font-mono mt-0.5">PKR {{ totalWorkshopOutstanding.toLocaleString() }}</div>
            <div class="text-[10px] text-slate-400">Pending customer recovery</div>
          </div>
        </div>
      </div>

      <!-- Live Workshop Active Pipeline -->
      <div class="glass-panel p-5 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <Activity :size="18" class="text-emerald-400" />
              <span>Current Workshop Machines in Progress (Live Pipeline)</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Real-time snapshot of machines currently on workshop benches across all 10 inspection and repair stages.
            </p>
          </div>
          <button @click="activeTab = 'jobs'" class="btn btn-secondary text-xs flex items-center gap-1 font-bold">
            <span>View All Job Cards</span>
            <ArrowRight :size="13" />
          </button>
        </div>

        <div class="table-container">
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
              <tr v-for="job in activeWorkshopJobs.slice(0, 8)" :key="job.jobCardNo">
                <td class="font-mono font-bold text-primary">
                  {{ job.jobCardNo }}
                </td>
                <td class="font-mono text-slate-300">{{ job.receivingDate }}</td>
                <td class="font-bold text-white">
                  <div>{{ job.customerName }}</div>
                  <div class="text-[10px] text-slate-400 font-normal">{{ job.customerType }}</div>
                </td>
                <td>
                  <div class="font-bold text-slate-200">{{ job.machineName }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ job.brand }} {{ job.model }}</div>
                </td>
                <td class="font-mono font-bold text-sky-400">
                  <span class="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/40">
                    {{ (job.serialNumber || '').replace(/^SN-/i, '') }}
                  </span>
                </td>
                <td class="text-slate-300 font-medium">{{ job.assignedTechnician || 'Unassigned' }}</td>
                <td>
                  <span :class="['badge font-mono text-[10px]', job.warrantyStatus === 'In Warranty' ? 'badge-success' : 'badge-neutral']">
                    {{ job.warrantyStatus }}
                  </span>
                </td>
                <td>
                  <span :class="['badge font-mono text-[10px]', getStatusBadgeClass(job.status)]">
                    {{ job.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button
                    @click="openJobDetailsModal(job)"
                    class="btn btn-xs btn-primary font-bold"
                  >
                    Manage
                  </button>
                </td>
              </tr>
              <tr v-if="activeWorkshopJobs.length === 0">
                <td colspan="9" class="text-center py-8 text-slate-400">
                  <Wrench class="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <div class="font-bold">No active machines on workshop benches.</div>
                  <div class="text-xs text-slate-500 mt-1">Click "Receive Machine / Job Card" above to register a new repair ticket.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 2: CUSTOMER JOB CARDS (REQUIREMENTS 2, 3, 10, 11, 12, 13, 14)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'jobs'" class="space-y-4">
      <div class="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 w-full md:w-auto flex-1 flex-wrap">
          <div class="relative flex-1 max-w-sm">
            <Search class="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              v-model="jobsSearch"
              type="text"
              placeholder="Search Job Card #, Serial, Customer, Machine..."
              class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <select
            v-model="jobsStatusFilter"
            class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
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

          <select
            v-model="jobsCustomerTypeFilter"
            class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
          >
            <option value="ALL">All Customer Types</option>
            <option value="Existing Company Customer">Existing Company Customer</option>
            <option value="Dealer">Dealer</option>
            <option value="Walk-in Customer">Walk-in Customer</option>
            <option value="Out Customer">Out Customer</option>
            <option value="Warranty Customer">Warranty Customer</option>
            <option value="Non-Warranty Customer">Non-Warranty Customer</option>
          </select>

          <select
            v-model="jobsTechnicianFilter"
            class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
          >
            <option value="ALL">All Technicians</option>
            <option v-for="t in dataStore.workshopTechnicians" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <button @click="printJobCardsRegistry" class="btn btn-secondary text-xs font-bold flex items-center gap-1">
            <Printer :size="14" />
            <span>Print List</span>
          </button>
          <button @click="exportJobCardsExcel" class="btn btn-secondary text-xs font-bold flex items-center gap-1">
            <FileSpreadsheet :size="14" class="text-emerald-400" />
            <span>Excel</span>
          </button>
          <button @click="openNewJobCardModal" class="btn btn-primary text-xs font-bold flex items-center gap-1">
            <Plus :size="14" />
            <span>New Job Card</span>
          </button>
        </div>
      </div>

      <!-- Job Cards Table -->
      <div class="table-container glass-panel shadow-xl">
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
            <tr v-for="job in paginatedJobCards" :key="job.jobCardNo" class="hover:bg-slate-800/40 transition-colors">
              <td class="font-mono font-bold text-primary">
                {{ job.jobCardNo }}
              </td>
              <td class="font-mono text-slate-300">{{ job.receivingDate }}</td>
              <td class="font-bold text-white">
                <div>{{ job.customerName }}</div>
                <div class="text-[10px] text-slate-400 font-normal">{{ job.customerPhone || job.customerType }}</div>
              </td>
              <td>
                <div class="font-bold text-slate-200">{{ job.machineName }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ job.brand }} {{ job.model }}</div>
              </td>
              <td class="font-mono font-bold text-sky-400">
                <span class="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/40">
                  {{ (job.serialNumber || '').replace(/^SN-/i, '') }}
                </span>
              </td>
              <td class="text-slate-300 max-w-xs truncate" :title="job.customerComplaint">
                {{ job.customerComplaint || 'Standard diagnostic inspection' }}
              </td>
              <td class="text-slate-300">{{ job.assignedTechnician || 'Unassigned' }}</td>
              <td>
                <span :class="['badge font-mono text-[10px]', job.warrantyStatus === 'In Warranty' ? 'badge-success' : 'badge-neutral']">
                  {{ job.warrantyStatus }}
                </span>
              </td>
              <td>
                <span :class="['badge font-mono text-[10px]', getStatusBadgeClass(job.status)]">
                  {{ job.status }}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-1 flex-wrap">
                  <span v-if="job.dcGenerated" class="badge badge-success text-[10px] font-mono">DC: {{ job.dcNumber }}</span>
                  <span v-if="job.invoiceGenerated" class="badge badge-info text-[10px] font-mono">INV: {{ job.invoiceNumber }}</span>
                  <span v-if="!job.dcGenerated && !job.invoiceGenerated" class="text-slate-500 text-[10px]">None</span>
                </div>
              </td>
              <td class="text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openJobDetailsModal(job)"
                    class="btn btn-xs btn-primary font-bold"
                    title="Manage Job Card, Diagnosis & Labour"
                  >
                    Manage
                  </button>
                  <button
                    @click="printSingleJobCard(job)"
                    class="btn btn-xs btn-secondary"
                    title="Print Job Card"
                  >
                    <Printer :size="12" />
                  </button>
                  <button
                    @click="deleteJobCard(job)"
                    class="btn btn-xs btn-ghost text-rose-400 hover:bg-rose-950/40"
                    title="Delete Job Card"
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredJobCards.length === 0">
              <td colspan="11" class="text-center py-12 text-slate-400">
                <ClipboardList class="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <div class="font-bold text-sm">No Workshop Job Cards found.</div>
                <div class="text-xs text-slate-500 mt-1">Data is loaded directly from database. Click "Receive Machine / Job Card" to create one.</div>
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
    <div v-if="activeTab === 'inventory'" class="space-y-4">
      <div class="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 w-full md:w-auto flex-1 flex-wrap">
          <div class="relative flex-1 max-w-sm">
            <Search class="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              v-model="partsSearch"
              type="text"
              placeholder="Search Part Code, Name, Brand, Location..."
              class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-300">
            <input type="checkbox" v-model="partsLowStockOnly" class="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0" />
            <span>Show Low Stock Alert Only</span>
          </label>
        </div>

        <div class="flex items-center gap-2">
          <button @click="openNewInwardModal" class="btn btn-secondary text-xs font-bold text-amber-300">
            <PackagePlus :size="14" />
            <span>Receive Inward</span>
          </button>
          <button @click="openNewPartModal" class="btn btn-primary text-xs font-bold">
            <Plus :size="14" />
            <span>New Spare Part</span>
          </button>
        </div>
      </div>

      <!-- Parts Inventory Table -->
      <div class="table-container glass-panel shadow-xl">
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
            <tr v-for="part in filteredParts" :key="part.partCode">
              <td class="font-mono font-bold text-teal-400">
                {{ part.partCode }}
              </td>
              <td class="font-bold text-white">{{ part.partName || part.name }}</td>
              <td class="text-slate-300">{{ part.brand }} {{ part.model }}</td>
              <td class="font-mono text-purple-300 font-bold">
                <span class="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                  {{ part.locationRack || part.location || 'Rack Main' }}
                </span>
              </td>
              <td class="font-mono text-slate-300">
                {{ part.locationCabinet || 'Cab 1' }} / {{ part.locationShelf || 'Shelf 1' }}
              </td>
              <td class="font-mono font-black text-white text-sm">
                {{ part.currentStock ?? part.stockQty ?? 0 }}
              </td>
              <td class="font-mono text-slate-400">{{ part.minimumStockLevel ?? part.minQty ?? 5 }}</td>
              <td>
                <span v-if="(part.currentStock ?? part.stockQty ?? 0) <= (part.minimumStockLevel ?? part.minQty ?? 5)" class="badge badge-danger font-mono text-[10px] animate-pulse">
                  🔴 LOW STOCK
                </span>
                <span v-else class="badge badge-success font-mono text-[10px]">
                  HEALTHY
                </span>
              </td>
              <td class="font-mono text-slate-300">PKR {{ (part.costPrice ?? part.purchasePrice ?? part.unitCost ?? 0).toLocaleString() }}</td>
              <td class="font-mono text-emerald-400 font-bold">PKR {{ (part.sellingPrice ?? part.unitCost ?? 0).toLocaleString() }}</td>
              <td class="text-right">
                <button
                  @click="deleteSparePart(part)"
                  class="btn btn-xs btn-ghost text-rose-400 hover:bg-rose-950/40"
                  title="Delete Part"
                >
                  ✕
                </button>
              </td>
            </tr>
            <tr v-if="filteredParts.length === 0">
              <td colspan="11" class="text-center py-12 text-slate-400">
                <Cpu class="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <div class="font-bold text-sm">No Spare Parts registered in database.</div>
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
    <div v-if="activeTab === 'inward'" class="space-y-4">
      <div class="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <Boxes :size="18" class="text-amber-400" />
            <span>China & Supplier Inward Shipments Registry</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Incoming spare parts from China or local vendors. Stock quantities are automatically added into Workshop Racks.
          </p>
        </div>

        <button @click="openNewInwardModal" class="btn btn-primary text-xs font-bold flex items-center gap-1.5">
          <PackagePlus :size="14" />
          <span>+ Receive Inward Shipment</span>
        </button>
      </div>

      <div class="table-container glass-panel shadow-xl">
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="inw in dataStore.workshopPartsInward" :key="inw.inwardNo">
              <td class="font-mono font-bold text-amber-400">{{ inw.inwardNo }}</td>
              <td class="font-mono text-slate-300">{{ inw.receivingDate }}</td>
              <td class="font-bold text-white">{{ inw.supplierName }}</td>
              <td class="font-mono text-blue-400">{{ inw.invoiceNo || 'N/A' }}</td>
              <td class="font-mono text-purple-300 font-bold">{{ inw.blReference || 'N/A' }}</td>
              <td>
                <span class="badge badge-info text-[10px] font-mono">
                  {{ (inw.parts || []).length }} Part Lines ({{ (inw.parts || []).reduce((sum, p) => sum + Number(p.quantity || 0), 0) }} total qty)
                </span>
              </td>
              <td class="text-slate-300">{{ inw.branch }}</td>
              <td class="font-mono font-bold text-emerald-400">PKR {{ (Number(inw.totalAmount) || 0).toLocaleString() }}</td>
              <td class="text-slate-400">{{ inw.recordedBy }}</td>
            </tr>
            <tr v-if="dataStore.workshopPartsInward.length === 0">
              <td colspan="9" class="text-center py-12 text-slate-400">
                <Boxes class="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <div class="font-bold text-sm">No China Inward Shipments recorded in database.</div>
                <div class="text-xs text-slate-500 mt-1">Click "+ Receive Inward Shipment" above to record a new shipment from China or local supplier.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 5: DC, INVOICES & PAYMENTS (REQUIREMENTS 8, 9, 20)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'billing'" class="space-y-4">
      <div class="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <Receipt :size="18" class="text-indigo-400" />
            <span>Workshop Delivery Challans (DC), Invoices & Customer Payments</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Generate formal Delivery Challan (DC) and Workshop Tax Invoices (parts + labour charges). Record customer cash/bank payments into ledger.
          </p>
        </div>
      </div>

      <div class="table-container glass-panel shadow-xl">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>Job Card #</th>
              <th>Customer</th>
              <th>Machine & Serial</th>
              <th>Status</th>
              <th>DC Number</th>
              <th>Invoice Number</th>
              <th>Parts Cost</th>
              <th>Labour Charges</th>
              <th>Total Invoice</th>
              <th>Paid Amount</th>
              <th>Remaining Balance</th>
              <th>Payment Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in dataStore.workshopJobCards" :key="job.jobCardNo">
              <td class="font-mono font-bold text-primary">{{ job.jobCardNo }}</td>
              <td class="font-bold text-white">{{ job.customerName }}</td>
              <td>
                <div class="text-slate-200">{{ job.machineName }}</div>
                <div class="font-mono text-sky-400 text-[10px]">{{ (job.serialNumber || '').replace(/^SN-/i, '') }}</div>
              </td>
              <td>
                <span :class="['badge font-mono text-[10px]', getStatusBadgeClass(job.status)]">{{ job.status }}</span>
              </td>
              <td>
                <span v-if="job.dcGenerated" class="badge badge-success font-mono text-[10px]">{{ job.dcNumber }}</span>
                <button v-else @click="generateDC(job)" class="btn btn-xs btn-secondary text-[10px]">Generate DC</button>
              </td>
              <td>
                <span v-if="job.invoiceGenerated" class="badge badge-info font-mono text-[10px]">{{ job.invoiceNumber }}</span>
                <button v-else @click="generateInvoice(job)" class="btn btn-xs btn-primary text-[10px]">Create Invoice</button>
              </td>
              <td class="font-mono text-slate-300">
                PKR {{ ((job.partsUsed || []).reduce((s, p) => s + (Number(p.quantity || 1) * Number(p.unitPrice || 0)), 0)).toLocaleString() }}
              </td>
              <td class="font-mono text-slate-300">
                PKR {{ (Number(job.faultDiagnosis?.labourCharges || 0)).toLocaleString() }}
              </td>
              <td class="font-mono font-bold text-white">
                PKR {{ (Number(job.totalInvoiceAmount || 0)).toLocaleString() }}
              </td>
              <td class="font-mono text-emerald-400 font-bold">
                PKR {{ (Number(job.paidAmount || 0)).toLocaleString() }}
              </td>
              <td class="font-mono font-bold text-rose-400">
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
                    v-if="job.dcGenerated"
                    @click="printDeliveryChallan(job)"
                    class="btn btn-xs btn-secondary"
                    title="Print Delivery Challan"
                  >
                    DC
                  </button>
                  <button
                    v-if="job.invoiceGenerated"
                    @click="printWorkshopInvoice(job)"
                    class="btn btn-xs btn-secondary text-primary"
                    title="Print Workshop Invoice"
                  >
                    Inv
                  </button>
                  <button
                    @click="openPaymentModal(job)"
                    class="btn btn-xs btn-success font-bold"
                    title="Record Payment"
                  >
                    + Pay
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="dataStore.workshopJobCards.length === 0">
              <td colspan="13" class="text-center py-12 text-slate-400">
                <Receipt class="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <div class="font-bold text-sm">No billing records found.</div>
                <div class="text-xs text-slate-500 mt-1">Receive machines and create job cards to manage DC, invoices, and payments.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 6: 360° LIFETIME MACHINE REPAIR HISTORY (REQUIREMENTS 7, 18)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'history'" class="space-y-6">
      <div class="glass-panel p-5 shadow-xl space-y-4 border-l-4 border-purple-500">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <History :size="20" class="text-purple-400" />
            <span>360° Lifetime Machine History & Repair Dossier</span>
          </h3>
          <p class="text-xs text-slate-300 mt-0.5">
            Search any Machine Serial Number or Machine Code to view its entire biography: Original Sale date, Customer, Warranty status, and all Workshop repair visits, faults diagnosed, parts replaced, and technicians.
          </p>
        </div>

        <div class="flex items-center gap-3 max-w-xl">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              v-model="historySearchSerial"
              @keyup.enter="searchMachineHistory"
              type="text"
              placeholder="Enter Machine Serial Number (e.g. SN-456, 123) or Machine Code..."
              class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
          <button @click="searchMachineHistory" class="btn btn-primary text-xs font-bold px-4">
            Search History
          </button>
        </div>
      </div>

      <!-- Lifetime History Result Dossier -->
      <div v-if="searchedHistoryResult" class="glass-panel p-6 shadow-2xl space-y-6 animate-fade-in border border-purple-500/40">
        <!-- Machine Identity Banner -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-purple font-mono text-xs">MACHINE PASSPORT</span>
              <span class="font-mono font-black text-lg text-sky-400">
                SN: {{ (searchedHistoryResult.serialNumber || '').replace(/^SN-/i, '') }}
              </span>
              <span v-if="searchedHistoryResult.registeredSerial?.machineCode" class="font-mono font-bold text-purple-400">
                ({{ searchedHistoryResult.registeredSerial.machineCode }})
              </span>
            </div>
            <div class="text-white font-bold text-base mt-1">
              {{ searchedHistoryResult.registeredSerial?.productName || 'Equipment Unit' }}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">
              Customer: <strong class="text-white">{{ searchedHistoryResult.registeredSerial?.customer || searchedHistoryResult.sale?.customer || 'N/A' }}</strong> • 
              Branch: <strong class="text-white">{{ searchedHistoryResult.registeredSerial?.branch || 'Peshawar' }}</strong>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button @click="printMachineHistoryDossier" class="btn btn-secondary text-xs font-bold flex items-center gap-1.5">
              <Printer :size="14" />
              <span>Print Lifetime Dossier</span>
            </button>
          </div>
        </div>

        <!-- 4 Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div class="text-[10px] text-slate-400 uppercase font-bold">Total Workshop Visits</div>
            <div class="text-lg font-black text-white font-mono mt-0.5">{{ searchedHistoryResult.totalRepairsCount }} Visits</div>
          </div>
          <div class="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div class="text-[10px] text-slate-400 uppercase font-bold">Spare Parts Installed</div>
            <div class="text-lg font-black text-teal-400 font-mono mt-0.5">{{ searchedHistoryResult.totalPartsInstalled }} Parts</div>
          </div>
          <div class="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div class="text-[10px] text-slate-400 uppercase font-bold">Total Repair Billed</div>
            <div class="text-lg font-black text-white font-mono mt-0.5">PKR {{ searchedHistoryResult.totalBilled.toLocaleString() }}</div>
          </div>
          <div class="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div class="text-[10px] text-slate-400 uppercase font-bold">Outstanding Balance</div>
            <div class="text-lg font-black text-rose-400 font-mono mt-0.5">PKR {{ searchedHistoryResult.totalOutstanding.toLocaleString() }}</div>
          </div>
        </div>

        <!-- Chronological Repair Log -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <Clock :size="15" class="text-purple-400" />
            <span>Chronological Workshop Jobs & Service Timeline</span>
          </h4>

          <div v-for="job in searchedHistoryResult.jobCards" :key="job.jobCardNo" class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-primary">{{ job.jobCardNo }}</span>
                <span class="text-xs text-slate-400">Received on: <strong class="text-white">{{ job.receivingDate }}</strong></span>
                <span :class="['badge font-mono text-[10px]', getStatusBadgeClass(job.status)]">{{ job.status }}</span>
              </div>
              <div class="text-xs text-slate-400">
                Technician: <strong class="text-white">{{ job.assignedTechnician || 'Unassigned' }}</strong>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-slate-400">Reported Complaint:</span>
                <div class="font-medium text-slate-200 mt-0.5">{{ job.customerComplaint || 'Standard diagnostic' }}</div>
              </div>
              <div>
                <span class="text-slate-400">Diagnosis & Actions:</span>
                <div class="font-medium text-slate-200 mt-0.5">{{ job.faultDiagnosis?.diagnosis || 'Inspection completed' }}</div>
              </div>
            </div>

            <!-- Parts Installed in this Job -->
            <div v-if="(job.partsUsed || []).length > 0" class="mt-2 pt-2 border-t border-slate-800/80">
              <div class="text-[11px] font-bold text-teal-300 mb-1">Spare Parts Installed Against This Job:</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="(p, pIdx) in job.partsUsed" :key="pIdx" class="badge badge-info font-mono text-[10px]">
                  {{ p.partName }} (Qty: {{ p.quantity }}) • PKR {{ (p.unitPrice * p.quantity).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="searchedHistoryResult.jobCards.length === 0" class="text-center py-6 text-slate-500 text-xs">
            No previous workshop tickets recorded for this machine serial number.
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 7: WORKSHOP REPORTS & TECHNICIANS (REQUIREMENTS 14, 19)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'reports'" class="space-y-6">
      <!-- Technician Workload Matrix -->
      <div class="glass-panel p-5 shadow-xl space-y-4 border-l-4 border-sky-500">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <Users :size="18" class="text-sky-400" />
              <span>Technician Performance & Workload Matrix</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Live job assignment, pending tasks, and completion metrics for workshop engineering staff.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="tech in technicianStats" :key="tech.name" class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div class="font-bold text-white text-xs">{{ tech.name }}</div>
            <div class="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
              <div>
                <div class="text-[10px] text-slate-400">Assigned</div>
                <div class="font-mono font-bold text-white">{{ tech.assigned }}</div>
              </div>
              <div>
                <div class="text-[10px] text-amber-400">In Process</div>
                <div class="font-mono font-bold text-amber-400">{{ tech.inProcess }}</div>
              </div>
              <div>
                <div class="text-[10px] text-emerald-400">Completed</div>
                <div class="font-mono font-bold text-emerald-400">{{ tech.completed }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Export Reports Grid -->
      <div class="glass-panel p-5 shadow-xl space-y-4">
        <h3 class="text-base font-bold text-white">Workshop Intelligence & Export Hub</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <button @click="printJobCardsRegistry" class="btn btn-secondary text-xs font-bold justify-start gap-2 h-11">
            <Printer :size="15" class="text-emerald-400" />
            <span>Print All Workshop Jobs Dossier</span>
          </button>
          <button @click="printPartsInventoryReport" class="btn btn-secondary text-xs font-bold justify-start gap-2 h-11">
            <Printer :size="15" class="text-teal-400" />
            <span>Print Spare Parts Inventory Report</span>
          </button>
          <button @click="exportJobCardsExcel" class="btn btn-secondary text-xs font-bold justify-start gap-2 h-11">
            <FileSpreadsheet :size="15" class="text-amber-400" />
            <span>Export Jobs Registry to Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 8: FACTORY WARRANTY REGISTRY
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'warranties'" class="space-y-4">
      <div class="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 w-full md:w-auto flex-1">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              v-model="warrantySearch"
              type="text"
              placeholder="Search Serial, Machine Code, Customer..."
              class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary font-mono"
            />
          </div>
        </div>
      </div>

      <div class="table-container glass-panel shadow-xl">
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
            <tr v-for="w in filteredWarranties" :key="w.serialCode">
              <td class="font-mono font-bold text-sky-400">
                <span class="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/40">
                  {{ (w.serialCode || '').replace(/^SN-/i, '') }}
                </span>
              </td>
              <td class="font-mono font-bold text-purple-400">{{ w.machineCode || 'N/A' }}</td>
              <td class="font-bold text-white">{{ w.productName }}</td>
              <td class="text-slate-300">{{ w.customer || 'N/A' }}</td>
              <td class="font-mono text-slate-300">{{ w.saleDate || 'N/A' }}</td>
              <td class="font-mono text-slate-300">{{ w.warrantyDuration || '12 Months' }}</td>
              <td>
                <span :class="['badge font-mono text-[10px]', isWarrantyValid(w.warrantyExpiry) ? 'badge-success' : 'badge-neutral']">
                  {{ isWarrantyValid(w.warrantyExpiry) ? 'Active' : 'Expired' }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredWarranties.length === 0">
              <td colspan="7" class="text-center py-12 text-slate-400">
                No active factory warranties registered.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 1: NEW CUSTOMER JOB CARD (REQUIREMENTS 2, 10, 11)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showNewJobCardModal" class="modal-backdrop" @click.self="showNewJobCardModal = false">
      <div class="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <ClipboardList class="text-primary w-5 h-5" />
            <h3 class="text-base font-bold text-white">Receive Customer Machine & Create Job Card</h3>
          </div>
          <button @click="showNewJobCardModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitNewJobCard" class="space-y-4 pt-3 text-xs">
          <!-- Auto-lookup by Serial -->
          <div class="p-3 bg-slate-900 border border-slate-700/80 rounded-lg space-y-2">
            <label class="form-label font-bold text-sky-400 flex items-center justify-between">
              <span>Enter Machine Serial Number (Auto-Fetch Customer & Sale Data)</span>
              <span class="text-[10px] text-slate-400">Type or select to pull registry data</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="newJobForm.serialNumber"
                @input="onSerialNumberInput"
                type="text"
                placeholder="e.g. SN-456 or 456"
                required
                class="form-input font-mono text-xs flex-1"
              />
              <button
                type="button"
                @click="triggerSerialLookup"
                class="btn btn-secondary text-xs font-bold"
              >
                Auto-Lookup
              </button>
            </div>
            <div v-if="serialLookupMatch" class="text-[11px] text-emerald-400 font-medium">
              ✓ Match found: {{ serialLookupMatch.productName }} (Customer: {{ serialLookupMatch.customer || 'Walk-in' }})
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="form-label">Customer Name</label>
              <input v-model="newJobForm.customerName" type="text" required class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Customer Phone / Contact</label>
              <input v-model="newJobForm.customerPhone" type="text" class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Customer Category</label>
              <select v-model="newJobForm.customerType" class="form-input text-xs font-bold">
                <option value="Existing Company Customer">Existing Company Customer</option>
                <option value="Dealer">Dealer</option>
                <option value="Walk-in Customer">Walk-in Customer</option>
                <option value="Out Customer">Out Customer</option>
                <option value="Warranty Customer">Warranty Customer</option>
                <option value="Non-Warranty Customer">Non-Warranty Customer</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label class="form-label">Machine Name</label>
              <input v-model="newJobForm.machineName" type="text" required class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Brand</label>
              <input v-model="newJobForm.brand" type="text" class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Model</label>
              <input v-model="newJobForm.model" type="text" class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Warranty Status</label>
              <select v-model="newJobForm.warrantyStatus" class="form-input text-xs font-bold">
                <option value="In Warranty">In Warranty</option>
                <option value="Out of Warranty">Out of Warranty</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="form-label">Receiving Date</label>
              <input v-model="newJobForm.receivingDate" type="date" required class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Expected Delivery Date</label>
              <input v-model="newJobForm.expectedDeliveryDate" type="date" class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Assign Technician</label>
              <select v-model="newJobForm.assignedTechnician" class="form-input text-xs font-bold">
                <option v-for="t in dataStore.workshopTechnicians" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Customer Reported Complaint</label>
            <textarea
              v-model="newJobForm.customerComplaint"
              rows="2"
              required
              placeholder="Describe machine fault, error codes, noise, power failure, etc..."
              class="form-input text-xs"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="form-label">Machine Condition on Receiving</label>
              <input v-model="newJobForm.machineCondition" type="text" placeholder="e.g. Scratched casing, probe intact" class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Accessories Received</label>
              <input v-model="newJobForm.accessoriesReceived" type="text" placeholder="e.g. Power cable, 2 probes, trolley" class="form-input text-xs" />
            </div>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showNewJobCardModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary font-bold">Create Job Card & Receive Machine</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 2: JOB DETAILS, DIAGNOSIS & SPARE PARTS MANAGEMENT (REQ 3, 6, 7, 13, 15)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showJobDetailsModal && selectedJob" class="modal-backdrop" @click.self="showJobDetailsModal = false">
      <div class="modal-content max-w-4xl max-h-[92vh] overflow-y-auto space-y-4">
        <div class="flex justify-between items-center pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <Wrench class="text-primary w-5 h-5" />
            <div>
              <h3 class="text-base font-bold text-white">Workshop Job Card: {{ selectedJob.jobCardNo }}</h3>
              <div class="text-[10px] text-slate-400">Machine: {{ selectedJob.machineName }} (SN: {{ selectedJob.serialNumber }})</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="printSingleJobCard(selectedJob)" class="btn btn-secondary text-xs flex items-center gap-1">
              <Printer :size="13" />
              <span>Print Job Card</span>
            </button>
            <button @click="showJobDetailsModal = false" class="text-slate-400 hover:text-white">✕</button>
          </div>
        </div>

        <!-- 10-Stage Status Pipeline Selector -->
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
          <div class="text-[11px] font-bold text-white flex justify-between">
            <span>Current Stage Pipeline (Requirement #13)</span>
            <span class="badge badge-info text-[10px]">{{ selectedJob.status }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
            <button
              v-for="st in allStages"
              :key="st"
              type="button"
              @click="changeJobStage(st)"
              :class="['btn btn-xs font-bold text-[10px]', selectedJob.status === st ? 'btn-primary text-white' : 'btn-secondary text-slate-400']"
            >
              {{ st }}
            </button>
          </div>
        </div>

        <!-- Fault & Diagnostics Form -->
        <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
          <div class="font-bold text-white text-xs">Diagnosis & Labour Charges (Requirement #3)</div>
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
            <button type="button" @click="saveJobDiagnosis" class="btn btn-secondary text-xs font-bold">
              Save Diagnosis & Labour
            </button>
          </div>
        </div>

        <!-- Spare Parts Issued Against this Job -->
        <div class="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
          <div class="flex justify-between items-center">
            <div class="font-bold text-white text-xs flex items-center gap-2">
              <Cpu :size="15" class="text-teal-400" />
              <span>Spare Parts Installed In This Machine (Auto-Deducted from Inventory)</span>
            </div>
            <button @click="showIssuePartSection = !showIssuePartSection" class="btn btn-xs btn-primary font-bold">
              + Issue Spare Part
            </button>
          </div>

          <!-- Issue Part Sub-form -->
          <div v-if="showIssuePartSection" class="p-3 bg-slate-950 border border-teal-500/40 rounded-lg space-y-2">
            <div class="text-xs font-bold text-teal-300">Select Part from Workshop Inventory:</div>
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
              <button type="button" @click="confirmIssuePart" class="btn btn-xs btn-teal font-bold">Confirm Issue & Deduct Stock</button>
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
                <td class="font-mono text-teal-400 font-bold">{{ p.partCode }}</td>
                <td class="font-bold text-white">{{ p.partName }}</td>
                <td class="font-mono font-bold">{{ p.quantity }}</td>
                <td class="font-mono">PKR {{ (p.unitPrice || 0).toLocaleString() }}</td>
                <td>
                  <span :class="['badge font-mono text-[10px]', p.isWarranty ? 'badge-success' : 'badge-neutral']">
                    {{ p.isWarranty ? 'Yes (Warranty)' : 'No (Paid)' }}
                  </span>
                </td>
                <td class="font-mono font-bold text-emerald-400">
                  PKR {{ (Number(p.quantity || 1) * Number(p.unitPrice || 0)).toLocaleString() }}
                </td>
                <td class="text-right">
                  <button
                    @click="returnPart(pIdx)"
                    class="btn btn-xs btn-ghost text-amber-400 hover:bg-amber-950/40"
                    title="Return Part back to workshop inventory"
                  >
                    Return Part
                  </button>
                </td>
              </tr>
              <tr v-if="!selectedJob.partsUsed || selectedJob.partsUsed.length === 0">
                <td colspan="7" class="text-center py-4 text-slate-500">
                  No spare parts issued to this job card yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-slate-800">
          <button type="button" @click="showJobDetailsModal = false" class="btn btn-secondary">Close</button>
          <div class="flex items-center gap-2">
            <button
              v-if="!selectedJob.dcGenerated"
              type="button"
              @click="generateDC(selectedJob)"
              class="btn btn-secondary text-xs font-bold"
            >
              Generate DC
            </button>
            <button
              v-if="!selectedJob.invoiceGenerated"
              type="button"
              @click="generateInvoice(selectedJob)"
              class="btn btn-primary text-xs font-bold"
            >
              Generate Workshop Invoice
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 3: INWARD CHINA PARTS SHIPMENT (REQUIREMENT 5)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showNewInwardModal" class="modal-backdrop" @click.self="showNewInwardModal = false">
      <div class="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <PackagePlus class="text-amber-400 w-5 h-5" />
            <h3 class="text-base font-bold text-white">Inward Workshop Spare Parts (China / Supplier)</h3>
          </div>
          <button @click="showNewInwardModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitInwardShipment" class="space-y-4 pt-3 text-xs">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="form-label">Supplier / Exporter</label>
              <input v-model="inwardForm.supplierName" type="text" required placeholder="e.g. Shenzhen Medical Ltd" class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Purchase Invoice #</label>
              <input v-model="inwardForm.invoiceNo" type="text" placeholder="e.g. INV-CN-882" class="form-input text-xs font-mono" />
            </div>
            <div>
              <label class="form-label">Shipment / BL Reference</label>
              <input v-model="inwardForm.blReference" type="text" placeholder="e.g. BL-2026-CN" class="form-input text-xs font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="form-label">Receiving Date</label>
              <input v-model="inwardForm.receivingDate" type="date" required class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Destination Branch</label>
              <select v-model="inwardForm.branch" class="form-input text-xs font-bold">
                <option v-for="b in dataStore.branches" :key="b" :value="b">{{ b }}</option>
              </select>
            </div>
          </div>

          <!-- Dynamic Inward Line Items -->
          <div class="space-y-2 pt-2 border-t border-slate-800">
            <div class="flex justify-between items-center">
              <span class="font-bold text-white">Parts Included in Shipment:</span>
              <button type="button" @click="addInwardLineItem" class="btn btn-xs btn-secondary text-teal-300">
                + Add Part Line
              </button>
            </div>

            <div v-for="(item, idx) in inwardForm.parts" :key="idx" class="p-2.5 bg-slate-900 border border-slate-800 rounded-lg grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
              <div>
                <label class="text-[10px] text-slate-400">Part Code</label>
                <input v-model="item.partCode" type="text" required placeholder="PRT-001" class="form-input text-xs font-mono uppercase" />
              </div>
              <div class="sm:col-span-2">
                <label class="text-[10px] text-slate-400">Part Name</label>
                <input v-model="item.partName" type="text" required placeholder="Main Power Board" class="form-input text-xs" />
              </div>
              <div>
                <label class="text-[10px] text-slate-400">Quantity</label>
                <input v-model.number="item.quantity" type="number" min="1" required class="form-input text-xs font-mono" />
              </div>
              <div>
                <label class="text-[10px] text-slate-400">Unit Cost (PKR)</label>
                <input v-model.number="item.unitCost" type="number" min="0" required class="form-input text-xs font-mono" />
              </div>
              <div class="flex items-end justify-between">
                <div>
                  <label class="text-[10px] text-slate-400">Rack Location</label>
                  <input v-model="item.locationRack" type="text" placeholder="Rack A" class="form-input text-xs" />
                </div>
                <button v-if="inwardForm.parts.length > 1" type="button" @click="removeInwardLineItem(idx)" class="btn btn-xs btn-ghost text-rose-400 ml-1">✕</button>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showNewInwardModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-warning font-bold text-white">Receive Inward & Add to Inventory</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 4: RECORD WORKSHOP PAYMENT (REQUIREMENT 9)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showPaymentModal && selectedJobForPayment" class="modal-backdrop" @click.self="showPaymentModal = false">
      <div class="modal-content max-w-md">
        <div class="flex justify-between items-center pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <Banknote class="text-emerald-400 w-5 h-5" />
            <h3 class="text-base font-bold text-white">Record Workshop Payment</h3>
          </div>
          <button @click="showPaymentModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitWorkshopPayment" class="space-y-4 pt-3 text-xs">
          <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
            <div class="text-[10px] text-slate-400">Job Card: <strong class="text-white">{{ selectedJobForPayment.jobCardNo }}</strong></div>
            <div class="text-xs font-bold text-white">{{ selectedJobForPayment.customerName }}</div>
            <div class="flex justify-between text-xs pt-1 border-t border-slate-800">
              <span class="text-slate-400">Remaining Balance:</span>
              <span class="font-mono font-bold text-rose-400">PKR {{ (selectedJobForPayment.remainingBalance || 0).toLocaleString() }}</span>
            </div>
          </div>

          <div>
            <label class="form-label">Payment Amount (PKR)</label>
            <input v-model.number="paymentForm.amount" type="number" min="1" required class="form-input text-sm font-mono font-bold text-emerald-400" />
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

          <div class="flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showPaymentModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-success font-bold text-white">Confirm Payment</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL 5: ADD NEW SPARE PART (REQUIREMENT 4)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showNewPartModal" class="modal-backdrop" @click.self="showNewPartModal = false">
      <div class="modal-content max-w-lg">
        <div class="flex justify-between items-center pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <Plus class="text-teal-400 w-5 h-5" />
            <h3 class="text-base font-bold text-white">Add New Spare Part to Warehouse</h3>
          </div>
          <button @click="showNewPartModal = false" class="text-slate-400 hover:text-white">✕</button>
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

          <div class="flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showNewPartModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary font-bold">Register Part</button>
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
  Users
} from 'lucide-vue-next'

const route = useRoute()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeTab = ref(route.query.tab || 'dashboard')
const activeBranchFilter = computed(() => dataStore.activeBranchFilter || 'Peshawar')

watch(() => route.query.tab, (newTab) => {
  if (newTab) activeTab.value = newTab
})

onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
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
const serialLookupMatch = ref(null)
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
    assignedTechnician: 'Engr. Tariq Saeed (Senior Biomedical Specialist)',
    customerComplaint: '',
    machineCondition: 'Normal wear',
    accessoriesReceived: 'Power cord'
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

async function submitNewJobCard() {
  try {
    const created = await dataStore.createWorkshopJobCard(newJobForm.value, authStore.user)
    uiStore.showToast(`Job Card ${created.jobCardNo} created and machine received!`, 'success')
    showNewJobCardModal.value = false
    activeTab.value = 'jobs'
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

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
  parts: [
    { partCode: '', partName: '', quantity: 1, unitCost: 0, locationRack: 'Rack A' }
  ]
})

function openNewInwardModal() {
  inwardForm.value = {
    supplierName: 'Shenzhen Medical Instruments Ltd',
    invoiceNo: `INV-CN-${Date.now().toString().slice(-4)}`,
    blReference: `BL-CN-${Date.now().toString().slice(-4)}`,
    receivingDate: new Date().toISOString().substring(0, 10),
    branch: activeBranchFilter.value,
    parts: [
      { partCode: '', partName: '', quantity: 1, unitCost: 0, locationRack: 'Rack A' }
    ]
  }
  showNewInwardModal.value = true
}

function addInwardLineItem() {
  inwardForm.value.parts.push({
    partCode: '',
    partName: '',
    quantity: 1,
    unitCost: 0,
    locationRack: 'Rack A'
  })
}

function removeInwardLineItem(idx) {
  if (inwardForm.value.parts.length > 1) {
    inwardForm.value.parts.splice(idx, 1)
  }
}

async function submitInwardShipment() {
  try {
    const inw = await dataStore.receiveWorkshopPartsInward(inwardForm.value, authStore.user)
    uiStore.showToast(`Inward Shipment ${inw.inwardNo} received and added to inventory!`, 'success')
    showNewInwardModal.value = false
    activeTab.value = 'inward'
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
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

.header-card {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
  border: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
}

.pill-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.header-subtitle {
  font-size: 0.825rem;
  color: var(--text-muted);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
</style>
