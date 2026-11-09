<template>
  <div class="page-wrapper space-y-6">
    <!-- Top Header & Banner -->
    <div class="header-card">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="pill-group">
            <span class="badge badge-purple font-mono">AFTER-SALES & TECHNICAL SERVICE</span>
            <span class="badge badge-info font-mono">WORKSHOP COMMAND CENTER</span>
          </div>
          <h1 class="header-title flex items-center gap-2 mt-1">
            <ShieldCheck class="text-primary w-8 h-8" />
            <span>Workshop, Warranty & Technical Support Hub</span>
          </h1>
          <p class="header-subtitle">
            Complete lifecycle management: Machine warranties, service claims, workshop spare parts inventory, faulty unit diagnostics, and equipment replacement tracking.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            @click="openNewClaimModal"
            class="btn btn-primary text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus :size="15" />
            <span>Register Warranty Claim</span>
          </button>
          <button
            @click="openNewFaultModal"
            class="btn btn-secondary text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <AlertTriangle :size="15" class="text-amber-400" />
            <span>Log Faulty Machine</span>
          </button>
          <button
            @click="openNewPartModal"
            class="btn btn-secondary text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Wrench :size="15" class="text-teal-400" />
            <span>Add Spare Part</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stat KPI Summary Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-emerald-500">
        <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
          <ShieldCheck :size="24" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-bold uppercase">Active Warranties</div>
          <div class="text-xl font-black text-white font-mono mt-0.5">{{ activeWarrantiesCount }} Units</div>
          <div class="text-[10px] text-emerald-400">Under valid factory coverage</div>
        </div>
      </div>

      <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-amber-500">
        <div class="p-3 rounded-xl bg-amber-500/10 text-amber-400">
          <Clock :size="24" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-bold uppercase">Open Claims / In Repair</div>
          <div class="text-xl font-black text-amber-400 font-mono mt-0.5">{{ pendingClaimsCount }} Jobs</div>
          <div class="text-[10px] text-slate-400">Active workshop repair tickets</div>
        </div>
      </div>

      <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-blue-500">
        <div class="p-3 rounded-xl bg-blue-500/10 text-blue-400">
          <Cpu :size="24" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-bold uppercase">Workshop Spare Parts</div>
          <div class="text-xl font-black text-white font-mono mt-0.5">{{ totalSparePartsStock }} Qty</div>
          <div class="text-[10px] text-blue-400">{{ dataStore.workshopSpareParts.length }} unique component lines</div>
        </div>
      </div>

      <div class="glass-panel p-4 flex items-center gap-3 border-l-4 border-purple-500">
        <div class="p-3 rounded-xl bg-purple-500/10 text-purple-400">
          <Activity :size="24" />
        </div>
        <div>
          <div class="text-xs text-slate-400 font-bold uppercase">Damaged / Faulty Units</div>
          <div class="text-xl font-black text-purple-300 font-mono mt-0.5">{{ faultyMachinesCount }} Units</div>
          <div class="text-[10px] text-slate-400">Received for overhaul/calibration</div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs for the 5 Software Requirements -->
    <div class="glass-panel p-2 flex flex-wrap gap-2 border border-slate-700/60">
      <button
        @click="activeTab = 'warranty'"
        :class="['px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'warranty' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <ShieldCheck :size="16" />
        <span>1. Warranty Registry (Req #24)</span>
        <span class="badge badge-neutral text-[10px] font-mono ml-1">{{ filteredWarranties.length }}</span>
      </button>

      <button
        @click="activeTab = 'claims'"
        :class="['px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'claims' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <Clock :size="16" />
        <span>2. Warranty Claims & Service History (Req #25)</span>
        <span class="badge badge-warning text-[10px] font-mono ml-1">{{ dataStore.warrantyClaims.length }}</span>
      </button>

      <button
        @click="activeTab = 'parts'"
        :class="['px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'parts' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <Wrench :size="16" />
        <span>3. Workshop Spare Parts Management (Req #26)</span>
        <span class="badge badge-info text-[10px] font-mono ml-1">{{ dataStore.workshopSpareParts.length }}</span>
      </button>

      <button
        @click="activeTab = 'faulty'"
        :class="['px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'faulty' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <AlertTriangle :size="16" />
        <span>4. Faulty Machine Stock (Req #27)</span>
        <span class="badge badge-neutral text-[10px] font-mono ml-1">{{ dataStore.faultyMachines.length }}</span>
      </button>

      <button
        @click="activeTab = 'replacement'"
        :class="['px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all', activeTab === 'replacement' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50']"
      >
        <RefreshCw :size="16" />
        <span>5. Machine Repair & Replacement Tracking (Req #28)</span>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 1: WARRANTY MANAGEMENT SYSTEM (REQ #24)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'warranty'" class="space-y-4">
      <div class="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 w-full md:w-auto flex-1">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              v-model="warrantySearch"
              type="text"
              placeholder="Search by Serial Number, Machine Code, or Customer..."
              class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary font-mono"
            />
          </div>
          <select
            v-model="warrantyStatusFilter"
            class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Expired">Expired Only</option>
          </select>
        </div>

        <div class="text-xs text-slate-400 font-mono">
          Showing {{ filteredWarranties.length }} warranty records
        </div>
      </div>

      <!-- Warranty Table -->
      <div class="glass-panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700 uppercase">
              <tr>
                <th class="p-3">Equipment / Product</th>
                <th class="p-3 font-mono">Serial Number</th>
                <th class="p-3 font-mono">Machine Code</th>
                <th class="p-3">Customer / Hospital</th>
                <th class="p-3">Invoice & Delivery</th>
                <th class="p-3">Warranty Expiry</th>
                <th class="p-3 text-center">Coverage Status</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr
                v-for="w in filteredWarranties"
                :key="w.id || w.serialCode"
                class="hover:bg-slate-800/40 transition-colors"
              >
                <td class="p-3">
                  <div class="font-bold text-white">{{ w.productName || 'Medical Equipment' }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ w.productCode || w.sku || 'N/A' }}</div>
                </td>
                <td class="p-3 font-mono font-bold text-sky-400">
                  {{ (w.serialCode || '').replace(/^SN-/i, '') }}
                </td>
                <td class="p-3 font-mono">
                  <span class="badge badge-purple text-[10px] font-bold">{{ w.machineCode || 'N/A' }}</span>
                </td>
                <td class="p-3">
                  <div class="font-medium text-slate-200">{{ w.customer || 'Direct Client' }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">BL: {{ w.blNumber || 'Local Consignment' }}</div>
                </td>
                <td class="p-3">
                  <div class="text-slate-300 font-mono">{{ w.invoiceNo || 'INV-DIRECT' }}</div>
                  <div class="text-[10px] text-slate-400">Delivery: {{ w.deliveryDate || w.saleDate }}</div>
                </td>
                <td class="p-3">
                  <div class="font-mono font-bold" :class="isWarrantyValid(w.warrantyExpiry) ? 'text-emerald-400' : 'text-rose-400'">
                    {{ w.warrantyExpiry }}
                  </div>
                  <div class="text-[10px] text-slate-400">
                    {{ isWarrantyValid(w.warrantyExpiry) ? 'Active Protection' : 'Expired' }}
                  </div>
                </td>
                <td class="p-3 text-center">
                  <span :class="['badge font-bold text-[10px]', isWarrantyValid(w.warrantyExpiry) ? 'badge-success' : 'badge-danger']">
                    {{ isWarrantyValid(w.warrantyExpiry) ? 'ACTIVE' : 'EXPIRED' }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <button
                    @click="initiateClaimFromWarranty(w)"
                    class="btn btn-secondary px-2.5 py-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
                    title="File a service or repair claim for this machine"
                  >
                    <Wrench :size="12" class="inline mr-1" />
                    File Claim
                  </button>
                </td>
              </tr>
              <tr v-if="filteredWarranties.length === 0">
                <td colspan="8" class="p-8 text-center text-slate-500">
                  No warranty records matched your search query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 2: WARRANTY CLAIMS & SERVICE HISTORY (REQ #25)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'claims'" class="space-y-4">
      <div class="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 w-full md:w-auto flex-1">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              v-model="claimSearch"
              type="text"
              placeholder="Search Claim #, Serial, Customer, or Complaint..."
              class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <select
            v-model="claimStatusFilter"
            class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
          >
            <option value="ALL">All Claims</option>
            <option value="In Repair">In Repair / Open</option>
            <option value="Resolved">Resolved / Closed</option>
          </select>
        </div>

        <button @click="openNewClaimModal" class="btn btn-primary text-xs font-bold flex items-center gap-1.5">
          <Plus :size="14" />
          <span>New Claim Ticket</span>
        </button>
      </div>

      <!-- Claims Table -->
      <div class="glass-panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700 uppercase">
              <tr>
                <th class="p-3 font-mono">Claim Ticket #</th>
                <th class="p-3">Claim Date</th>
                <th class="p-3">Equipment & Serial</th>
                <th class="p-3">Customer & Complaint</th>
                <th class="p-3">Diagnosis & Technical Action</th>
                <th class="p-3">Assigned Tech</th>
                <th class="p-3 text-center">Status</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr
                v-for="c in filteredClaims"
                :key="c.id || c.claimNo"
                class="hover:bg-slate-800/40 transition-colors"
              >
                <td class="p-3 font-mono font-bold text-amber-400">
                  {{ c.claimNo }}
                </td>
                <td class="p-3 text-slate-300 font-mono">
                  {{ c.claimDate }}
                </td>
                <td class="p-3">
                  <div class="font-bold text-white">{{ c.productName }}</div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-sky-400 font-mono font-bold">SN: {{ (c.serialCode || '').replace(/^SN-/i, '') }}</span>
                    <span v-if="c.machineCode" class="badge badge-purple text-[9px]">{{ c.machineCode }}</span>
                  </div>
                </td>
                <td class="p-3 max-w-xs">
                  <div class="font-medium text-slate-200">{{ c.customer }}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5 truncate" :title="c.complaint">{{ c.complaint }}</div>
                </td>
                <td class="p-3 max-w-xs">
                  <div class="text-xs text-slate-300">{{ c.diagnosis || 'Pending initial inspection' }}</div>
                  <div v-if="c.repairAction" class="text-[10px] text-emerald-400 mt-0.5">{{ c.repairAction }}</div>
                </td>
                <td class="p-3 text-slate-300">
                  {{ c.technician || 'Central Workshop' }}
                </td>
                <td class="p-3 text-center">
                  <span :class="['badge font-bold text-[10px]', c.status === 'Resolved' ? 'badge-success' : 'badge-warning']">
                    {{ c.status || 'In Progress' }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <button
                    v-if="c.status !== 'Resolved'"
                    @click="openResolveClaimModal(c)"
                    class="btn btn-primary px-2.5 py-1 text-[11px] font-bold"
                  >
                    Resolve / Close
                  </button>
                  <span v-else class="text-[10px] text-slate-500 font-mono">
                    Completed {{ c.completedDate }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredClaims.length === 0">
                <td colspan="8" class="p-8 text-center text-slate-500">
                  No claims found matching the search criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 3: WORKSHOP PARTS & SPARE PARTS MANAGEMENT (REQ #26)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'parts'" class="space-y-4">
      <div class="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 w-full md:w-auto flex-1">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              v-model="partSearch"
              type="text"
              placeholder="Search by Part Code, Name, or Category..."
              class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>
        </div>

        <button @click="openNewPartModal" class="btn btn-primary text-xs font-bold flex items-center gap-1.5">
          <Plus :size="14" />
          <span>Add Workshop Spare Part</span>
        </button>
      </div>

      <!-- Parts Inventory Table -->
      <div class="glass-panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700 uppercase">
              <tr>
                <th class="p-3 font-mono">Part Code</th>
                <th class="p-3">Component / Part Name</th>
                <th class="p-3">Category</th>
                <th class="p-3 font-mono text-center">Available Stock</th>
                <th class="p-3 text-right">Unit Cost (PKR)</th>
                <th class="p-3">Compatible Equipment</th>
                <th class="p-3">Workshop Location</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr
                v-for="p in filteredParts"
                :key="p.id || p.partCode"
                class="hover:bg-slate-800/40 transition-colors"
              >
                <td class="p-3 font-mono font-bold text-teal-400">
                  {{ p.partCode }}
                </td>
                <td class="p-3">
                  <div class="font-bold text-white">{{ p.name }}</div>
                </td>
                <td class="p-3">
                  <span class="badge badge-neutral text-[10px]">{{ p.category }}</span>
                </td>
                <td class="p-3 text-center">
                  <span :class="['font-mono font-bold px-2 py-0.5 rounded text-xs', p.stockQty <= (p.minQty || 2) ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-200']">
                    {{ p.stockQty }} Units
                  </span>
                </td>
                <td class="p-3 text-right font-mono font-bold text-emerald-400">
                  PKR {{ Number(p.unitCost || 0).toLocaleString() }}
                </td>
                <td class="p-3 text-slate-300">
                  {{ p.compatibleModels || 'Universal' }}
                </td>
                <td class="p-3 text-slate-400 font-mono">
                  📍 {{ p.location || 'Central Workshop' }}
                </td>
                <td class="p-3 text-right">
                  <button
                    @click="openIssuePartModal(p)"
                    class="btn btn-secondary px-2.5 py-1 text-[11px] font-bold text-teal-400 hover:text-teal-300"
                    title="Issue this spare part to a machine serial number in workshop"
                  >
                    <Wrench :size="12" class="inline mr-1" />
                    Issue to Serial
                  </button>
                </td>
              </tr>
              <tr v-if="filteredParts.length === 0">
                <td colspan="8" class="p-8 text-center text-slate-500">
                  No spare parts found matching query.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 4: FAULTY / DAMAGED MACHINE STOCK MANAGEMENT (REQ #27)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'faulty'" class="space-y-4">
      <div class="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 w-full md:w-auto flex-1">
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              v-model="faultySearch"
              type="text"
              placeholder="Search by Fault #, Serial, Branch, or Reported Issue..."
              class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
          <select
            v-model="faultyStatusFilter"
            class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="Under Inspection">Under Inspection</option>
            <option value="Repaired">Repaired / QC Passed</option>
          </select>
        </div>

        <button @click="openNewFaultModal" class="btn btn-primary text-xs font-bold flex items-center gap-1.5">
          <Plus :size="14" />
          <span>Log Damaged Machine</span>
        </button>
      </div>

      <!-- Faulty Machine Table -->
      <div class="glass-panel overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700 uppercase">
              <tr>
                <th class="p-3 font-mono">Fault Ticket</th>
                <th class="p-3">Serial & Machine Code</th>
                <th class="p-3">Equipment Name</th>
                <th class="p-3">Origin Branch</th>
                <th class="p-3">Received Date</th>
                <th class="p-3">Reported Defect / Damage</th>
                <th class="p-3">Workshop Bay</th>
                <th class="p-3 text-center">Status</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr
                v-for="f in filteredFaulty"
                :key="f.id || f.faultNo"
                class="hover:bg-slate-800/40 transition-colors"
              >
                <td class="p-3 font-mono font-bold text-rose-400">
                  {{ f.faultNo }}
                </td>
                <td class="p-3 font-mono">
                  <div class="font-bold text-sky-400">SN: {{ (f.serialCode || '').replace(/^SN-/i, '') }}</div>
                  <div v-if="f.machineCode" class="text-[10px] text-purple-400">Code: {{ f.machineCode }}</div>
                </td>
                <td class="p-3 font-medium text-white">
                  {{ f.productName }}
                </td>
                <td class="p-3">
                  <span class="badge badge-info text-[10px]">📍 {{ f.originBranch }}</span>
                </td>
                <td class="p-3 text-slate-300 font-mono">
                  {{ f.receivedDate }}
                </td>
                <td class="p-3 max-w-xs">
                  <div class="text-xs text-slate-200" :title="f.reportedFault">{{ f.reportedFault }}</div>
                  <div v-if="f.notes" class="text-[10px] text-slate-400 mt-0.5 truncate">{{ f.notes }}</div>
                </td>
                <td class="p-3 font-mono text-slate-300">
                  {{ f.workshopRack || 'Bay 1 - Diagnostics' }}
                </td>
                <td class="p-3 text-center">
                  <span :class="['badge font-bold text-[10px]', f.currentStatus === 'Repaired' ? 'badge-success' : 'badge-danger']">
                    {{ f.currentStatus }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <button
                    @click="openUpdateFaultModal(f)"
                    class="btn btn-secondary px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white"
                  >
                    Update Progress
                  </button>
                </td>
              </tr>
              <tr v-if="filteredFaulty.length === 0">
                <td colspan="9" class="p-8 text-center text-slate-500">
                  No faulty or damaged machines logged.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 5: MACHINE REPAIR & REPLACEMENT TRACKING (REQ #28)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'replacement'" class="space-y-4">
      <div class="glass-panel p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw :size="18" class="text-indigo-400" />
              <span>Machine Repair Replacement & Return Tracking (Req #28)</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Live tracking of machines replaced, temporary replacement units issued to clients, and repaired units dispatched back to origin branch.
            </p>
          </div>
          <button
            @click="uiStore.showToast('Generating Workshop Activity Report...', 'info')"
            class="btn btn-secondary text-xs font-bold flex items-center gap-1.5"
          >
            <Printer :size="14" />
            <span>Print Workshop Summary</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Active Replacements Card -->
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 class="text-xs font-bold uppercase text-indigo-400 flex items-center gap-1.5">
              <RefreshCw :size="14" />
              <span>Replacement Serials Issued</span>
            </h4>
            <div class="space-y-2 text-xs">
              <div
                v-for="c in replacementRecords"
                :key="c.id"
                class="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between"
              >
                <div>
                  <div class="font-bold text-white">{{ c.customer }}</div>
                  <div class="text-slate-400 text-[11px]">Original Serial: <span class="text-rose-400 font-mono">{{ c.serialCode }}</span></div>
                  <div class="text-emerald-400 font-bold text-[11px]">Replacement Serial: <span class="font-mono">{{ c.replacementSerial }}</span></div>
                </div>
                <span class="badge badge-success text-[10px]">Active Loaner</span>
              </div>

              <div v-if="replacementRecords.length === 0" class="p-4 text-center text-slate-500">
                No active machine replacement serials currently logged.
              </div>
            </div>
          </div>

          <!-- Service Return Audit Trail -->
          <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 class="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 :size="14" />
              <span>Repaired & Dispatched Units</span>
            </h4>
            <div class="space-y-2 text-xs">
              <div
                v-for="r in repairedUnitsList"
                :key="r.id"
                class="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between"
              >
                <div>
                  <div class="font-bold text-white">{{ r.productName }}</div>
                  <div class="text-sky-400 font-mono text-[11px]">SN: {{ (r.serialCode || '').replace(/^SN-/i, '') }} (Code: {{ r.machineCode }})</div>
                  <div class="text-[10px] text-slate-400">Ready for dispatch to 📍 {{ r.originBranch }}</div>
                </div>
                <span class="badge badge-success text-[10px]">QC Passed</span>
              </div>

              <div v-if="repairedUnitsList.length === 0" class="p-4 text-center text-slate-500">
                All repaired machines have been returned to inventory.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODALS: FOR NEW CLAIM, NEW PART, LOG FAULT, RESOLVE
    ═══════════════════════════════════════════════════════ -->

    <!-- Modal 1: Register New Warranty Claim -->
    <div v-if="showNewClaimModal" class="modal-backdrop" @click.self="showNewClaimModal = false">
      <div class="modal-content max-w-lg">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <Wrench :size="16" class="text-amber-400" />
            <span>Register Warranty Service Claim</span>
          </h3>
          <button @click="showNewClaimModal = false" class="text-slate-400 hover:text-white">&times;</button>
        </div>

        <form @submit.prevent="submitWarrantyClaim" class="space-y-3 text-xs mt-3">
          <div>
            <label class="form-label">Machine Serial Number *</label>
            <input
              v-model="claimForm.serialCode"
              type="text"
              required
              placeholder="e.g. US10-8801 or LZR-4401"
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Internal Machine Code</label>
              <input
                v-model="claimForm.machineCode"
                type="text"
                placeholder="e.g. MC-101"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
              />
            </div>
            <div>
              <label class="form-label">Equipment Model / Name</label>
              <input
                v-model="claimForm.productName"
                type="text"
                placeholder="e.g. 10 Inch Ultrasound"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label class="form-label">Customer / Hospital Name *</label>
            <input
              v-model="claimForm.customer"
              type="text"
              required
              placeholder="e.g. Shaukat Khanum Hospital"
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
            />
          </div>

          <div>
            <label class="form-label">Reported Defect / Complaint *</label>
            <textarea
              v-model="claimForm.complaint"
              required
              rows="3"
              placeholder="Describe machine malfunction, error codes, physical issues..."
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
            ></textarea>
          </div>

          <div>
            <label class="form-label">Initial Diagnosis / Notes</label>
            <input
              v-model="claimForm.diagnosis"
              type="text"
              placeholder="Inspection observation..."
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
            />
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-700">
            <button type="button" @click="showNewClaimModal = false" class="btn btn-secondary px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary px-4 py-1.5 font-bold">
              Save Claim Ticket
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Add Workshop Spare Part -->
    <div v-if="showNewPartModal" class="modal-backdrop" @click.self="showNewPartModal = false">
      <div class="modal-content max-w-lg">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <Cpu :size="16" class="text-teal-400" />
            <span>Add Workshop Spare Part (Component)</span>
          </h3>
          <button @click="showNewPartModal = false" class="text-slate-400 hover:text-white">&times;</button>
        </div>

        <form @submit.prevent="submitNewPart" class="space-y-3 text-xs mt-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Part Code *</label>
              <input
                v-model="partForm.partCode"
                type="text"
                required
                placeholder="e.g. PRT-PWR-24V"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
              />
            </div>
            <div>
              <label class="form-label">Category</label>
              <select v-model="partForm.category" class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs font-bold">
                <option value="Ultrasound Transducers">Ultrasound Transducers</option>
                <option value="Power Modules">Power Modules</option>
                <option value="Optics & Fibers">Optics & Fibers</option>
                <option value="Thermal & Cooling">Thermal & Cooling</option>
                <option value="Main Logic Boards">Main Logic Boards</option>
                <option value="General Spare Parts">General Spare Parts</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Part / Component Name *</label>
            <input
              v-model="partForm.name"
              type="text"
              required
              placeholder="e.g. High Voltage Power Board"
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
            />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="form-label">Stock Quantity *</label>
              <input
                v-model.number="partForm.stockQty"
                type="number"
                min="1"
                required
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
              />
            </div>
            <div>
              <label class="form-label">Min Threshold</label>
              <input
                v-model.number="partForm.minQty"
                type="number"
                min="1"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
              />
            </div>
            <div>
              <label class="form-label">Unit Cost (PKR)</label>
              <input
                v-model.number="partForm.unitCost"
                type="number"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Compatible Models</label>
              <input
                v-model="partForm.compatibleModels"
                type="text"
                placeholder="e.g. 10 Inch Ultrasound"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
              />
            </div>
            <div>
              <label class="form-label">Workshop Storage Location</label>
              <input
                v-model="partForm.location"
                type="text"
                placeholder="e.g. Rack A-01"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-700">
            <button type="button" @click="showNewPartModal = false" class="btn btn-secondary px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary px-4 py-1.5 font-bold">
              Add Component
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 3: Issue Spare Part to Serial -->
    <div v-if="showIssuePartModal" class="modal-backdrop" @click.self="showIssuePartModal = false">
      <div class="modal-content max-w-md">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <Wrench :size="16" class="text-teal-400" />
            <span>Issue Component to Machine</span>
          </h3>
          <button @click="showIssuePartModal = false" class="text-slate-400 hover:text-white">&times;</button>
        </div>

        <form @submit.prevent="submitIssuePart" class="space-y-3 text-xs mt-3">
          <div class="p-3 bg-slate-900/60 rounded border border-slate-800">
            <div class="font-bold text-white">{{ selectedPartToIssue?.name }}</div>
            <div class="text-[11px] text-teal-400 font-mono">Code: {{ selectedPartToIssue?.partCode }} | Available Stock: {{ selectedPartToIssue?.stockQty }}</div>
          </div>

          <div>
            <label class="form-label">Target Machine Serial Number *</label>
            <input
              v-model="issuePartForm.machineSerial"
              type="text"
              required
              placeholder="e.g. US10-8803"
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
            />
          </div>

          <div>
            <label class="form-label">Quantity to Install *</label>
            <input
              v-model.number="issuePartForm.qty"
              type="number"
              min="1"
              :max="selectedPartToIssue?.stockQty || 1"
              required
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
            />
          </div>

          <div>
            <label class="form-label">Work Order / Reason</label>
            <input
              v-model="issuePartForm.reason"
              type="text"
              placeholder="e.g. Replaced burnt power capacitor under Claim CLM-2026-001"
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
            />
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-700">
            <button type="button" @click="showIssuePartModal = false" class="btn btn-secondary px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary px-4 py-1.5 font-bold">
              Confirm & Deduct Stock
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 4: Log Damaged / Faulty Machine -->
    <div v-if="showNewFaultModal" class="modal-backdrop" @click.self="showNewFaultModal = false">
      <div class="modal-content max-w-lg">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <AlertTriangle :size="16" class="text-rose-400" />
            <span>Log Damaged / Faulty Machine</span>
          </h3>
          <button @click="showNewFaultModal = false" class="text-slate-400 hover:text-white">&times;</button>
        </div>

        <form @submit.prevent="submitFaultyMachine" class="space-y-3 text-xs mt-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Serial Number *</label>
              <input
                v-model="faultForm.serialCode"
                type="text"
                required
                placeholder="e.g. US10-8809"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
              />
            </div>
            <div>
              <label class="form-label">Internal Machine Code</label>
              <input
                v-model="faultForm.machineCode"
                type="text"
                placeholder="e.g. MC-109"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Product / Equipment Name</label>
              <input
                v-model="faultForm.productName"
                type="text"
                required
                placeholder="e.g. 10 Inch Ultrasound"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
              />
            </div>
            <div>
              <label class="form-label">Origin Branch</label>
              <select v-model="faultForm.originBranch" class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs font-bold">
                <option value="Peshawar">Peshawar (Head Office)</option>
                <option value="Lahore">Lahore Depot</option>
                <option value="Multan">Multan Branch</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Reported Defect / Cause of Damage *</label>
            <textarea
              v-model="faultForm.reportedFault"
              required
              rows="3"
              placeholder="Transit damage, electrical surge, display crack, etc."
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Workshop Bay / Rack</label>
              <input
                v-model="faultForm.workshopRack"
                type="text"
                placeholder="Bay 1 - Diagnostics"
                class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
              />
            </div>
            <div>
              <label class="form-label">Initial Status</label>
              <select v-model="faultForm.currentStatus" class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs font-bold">
                <option value="Under Inspection">Under Inspection</option>
                <option value="Awaiting Spare Parts">Awaiting Spare Parts</option>
                <option value="Repaired">Repaired</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-700">
            <button type="button" @click="showNewFaultModal = false" class="btn btn-secondary px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary px-4 py-1.5 font-bold">
              Save Fault Log
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 5: Resolve / Update Claim -->
    <div v-if="showResolveModal" class="modal-backdrop" @click.self="showResolveModal = false">
      <div class="modal-content max-w-md">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <CheckCircle2 :size="16" class="text-emerald-400" />
            <span>Resolve Claim Ticket: {{ selectedClaimToResolve?.claimNo }}</span>
          </h3>
          <button @click="showResolveModal = false" class="text-slate-400 hover:text-white">&times;</button>
        </div>

        <form @submit.prevent="submitResolveClaim" class="space-y-3 text-xs mt-3">
          <div>
            <label class="form-label">Final Diagnosis Notes</label>
            <input
              v-model="resolveForm.diagnosis"
              type="text"
              required
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
            />
          </div>

          <div>
            <label class="form-label">Repair Action Performed *</label>
            <textarea
              v-model="resolveForm.repairAction"
              required
              rows="2"
              placeholder="e.g. Replaced capacitor, tested voltage stability, 24h burn-in pass"
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs"
            ></textarea>
          </div>

          <div>
            <label class="form-label">Replacement Serial (if machine was swapped)</label>
            <input
              v-model="resolveForm.replacementSerial"
              type="text"
              placeholder="Leave blank if original unit was repaired"
              class="w-full p-2 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
            />
          </div>

          <div>
            <label class="form-label">Final Claim Status</label>
            <select v-model="resolveForm.status" class="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-xs font-bold">
              <option value="Resolved">Resolved & Ready for Dispatch</option>
              <option value="Closed">Closed / Delivered to Customer</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-700">
            <button type="button" @click="showResolveModal = false" class="btn btn-secondary px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary px-4 py-1.5 font-bold">
              Mark Claim as Resolved
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
  ShieldCheck,
  Wrench,
  Cpu,
  AlertTriangle,
  Search,
  Plus,
  Clock,
  Activity,
  CheckCircle2,
  RefreshCw,
  Printer
} from 'lucide-vue-next'

const route = useRoute()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeTab = ref(route.query.tab || 'warranty')

watch(() => route.query.tab, (newTab) => {
  if (newTab) activeTab.value = newTab
})

onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
})

// Tab 1: Warranty Management Filter
const warrantySearch = ref('')
const warrantyStatusFilter = ref('ALL')

const allWarranties = computed(() => {
  const storeWarranties = dataStore.warranties || []
  return storeWarranties
})

function isWarrantyValid(expiryDateStr) {
  if (!expiryDateStr) return true
  const now = new Date()
  const exp = new Date(expiryDateStr)
  return exp >= now
}

const filteredWarranties = computed(() => {
  return allWarranties.value.filter(w => {
    const q = warrantySearch.value.trim().toLowerCase()
    const matchQuery = !q ||
      (w.serialCode || '').toLowerCase().includes(q) ||
      (w.machineCode || '').toLowerCase().includes(q) ||
      (w.customer || '').toLowerCase().includes(q) ||
      (w.productName || '').toLowerCase().includes(q)

    const isValid = isWarrantyValid(w.warrantyExpiry)
    let matchStatus = true
    if (warrantyStatusFilter.value === 'Active') matchStatus = isValid
    if (warrantyStatusFilter.value === 'Expired') matchStatus = !isValid

    return matchQuery && matchStatus
  })
})

const activeWarrantiesCount = computed(() => {
  return allWarranties.value.filter(w => isWarrantyValid(w.warrantyExpiry)).length
})

// Tab 2: Claims Management Filter
const claimSearch = ref('')
const claimStatusFilter = ref('ALL')

const filteredClaims = computed(() => {
  return (dataStore.warrantyClaims || []).filter(c => {
    const q = claimSearch.value.trim().toLowerCase()
    const matchQuery = !q ||
      (c.claimNo || '').toLowerCase().includes(q) ||
      (c.serialCode || '').toLowerCase().includes(q) ||
      (c.customer || '').toLowerCase().includes(q) ||
      (c.complaint || '').toLowerCase().includes(q)

    let matchStatus = true
    if (claimStatusFilter.value === 'In Repair') matchStatus = c.status !== 'Resolved' && c.status !== 'Closed'
    if (claimStatusFilter.value === 'Resolved') matchStatus = c.status === 'Resolved' || c.status === 'Closed'

    return matchQuery && matchStatus
  })
})

const pendingClaimsCount = computed(() => {
  return (dataStore.warrantyClaims || []).filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length
})

// Tab 3: Workshop Spare Parts Filter
const partSearch = ref('')

const filteredParts = computed(() => {
  return (dataStore.workshopSpareParts || []).filter(p => {
    const q = partSearch.value.trim().toLowerCase()
    return !q ||
      p.partCode.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.compatibleModels || '').toLowerCase().includes(q)
  })
})

const totalSparePartsStock = computed(() => {
  return (dataStore.workshopSpareParts || []).reduce((acc, p) => acc + Number(p.stockQty || 0), 0)
})

// Tab 4: Faulty Machines Filter
const faultySearch = ref('')
const faultyStatusFilter = ref('ALL')

const filteredFaulty = computed(() => {
  return (dataStore.faultyMachines || []).filter(f => {
    const q = faultySearch.value.trim().toLowerCase()
    const matchQuery = !q ||
      (f.faultNo || '').toLowerCase().includes(q) ||
      (f.serialCode || '').toLowerCase().includes(q) ||
      (f.reportedFault || '').toLowerCase().includes(q) ||
      (f.originBranch || '').toLowerCase().includes(q)

    let matchStatus = true
    if (faultyStatusFilter.value !== 'ALL') {
      matchStatus = f.currentStatus === faultyStatusFilter.value
    }
    return matchQuery && matchStatus
  })
})

const faultyMachinesCount = computed(() => {
  return (dataStore.faultyMachines || []).filter(f => f.currentStatus !== 'Repaired').length
})

// Tab 5: Replacements & Repaired List
const replacementRecords = computed(() => {
  return (dataStore.warrantyClaims || []).filter(c => c.replacementSerial)
})

const repairedUnitsList = computed(() => {
  return (dataStore.faultyMachines || []).filter(f => f.currentStatus === 'Repaired')
})

// Modals State
const showNewClaimModal = ref(false)
const showNewPartModal = ref(false)
const showIssuePartModal = ref(false)
const showNewFaultModal = ref(false)
const showResolveModal = ref(false)

const selectedPartToIssue = ref(null)
const selectedClaimToResolve = ref(null)

const claimForm = ref({
  serialCode: '',
  machineCode: '',
  productName: '',
  customer: '',
  complaint: '',
  diagnosis: ''
})

const partForm = ref({
  partCode: '',
  name: '',
  category: 'Ultrasound Transducers',
  stockQty: 5,
  minQty: 2,
  unitCost: 25000,
  compatibleModels: '',
  location: 'Workshop Main Rack'
})

const issuePartForm = ref({
  machineSerial: '',
  qty: 1,
  reason: ''
})

const faultForm = ref({
  serialCode: '',
  machineCode: '',
  productName: '',
  originBranch: 'Peshawar',
  reportedFault: '',
  workshopRack: 'Bay 1 - Diagnostics',
  currentStatus: 'Under Inspection'
})

const resolveForm = ref({
  diagnosis: '',
  repairAction: '',
  replacementSerial: '',
  status: 'Resolved'
})

function openNewClaimModal() {
  claimForm.value = {
    serialCode: '',
    machineCode: '',
    productName: '',
    customer: '',
    complaint: '',
    diagnosis: ''
  }
  showNewClaimModal.value = true
}

function initiateClaimFromWarranty(w) {
  claimForm.value = {
    serialCode: w.serialCode,
    machineCode: w.machineCode || '',
    productName: w.productName || 'Medical Equipment',
    customer: w.customer || '',
    complaint: 'Customer reported unexpected operating issue during active warranty period.',
    diagnosis: 'Scheduled for technician diagnostic bench test.'
  }
  showNewClaimModal.value = true
}

async function submitWarrantyClaim() {
  try {
    await dataStore.registerWarrantyClaim(claimForm.value, authStore.user)
    uiStore.showToast('Warranty Claim registered successfully!', 'success')
    showNewClaimModal.value = false
    activeTab.value = 'claims'
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

function openNewPartModal() {
  partForm.value = {
    partCode: '',
    name: '',
    category: 'Ultrasound Transducers',
    stockQty: 5,
    minQty: 2,
    unitCost: 25000,
    compatibleModels: '',
    location: 'Rack A-01'
  }
  showNewPartModal.value = true
}

async function submitNewPart() {
  try {
    await dataStore.addWorkshopPart(partForm.value, authStore.user)
    uiStore.showToast(`Spare Part ${partForm.value.partCode} added to workshop inventory!`, 'success')
    showNewPartModal.value = false
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

function openIssuePartModal(part) {
  selectedPartToIssue.value = part
  issuePartForm.value = {
    machineSerial: '',
    qty: 1,
    reason: ''
  }
  showIssuePartModal.value = true
}

async function submitIssuePart() {
  try {
    if (!selectedPartToIssue.value) return
    await dataStore.issueWorkshopPart(
      selectedPartToIssue.value.partCode,
      issuePartForm.value.machineSerial,
      issuePartForm.value.qty,
      issuePartForm.value.reason,
      authStore.user
    )
    uiStore.showToast(`Component issued and deducted from stock!`, 'success')
    showIssuePartModal.value = false
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

function openNewFaultModal() {
  faultForm.value = {
    serialCode: '',
    machineCode: '',
    productName: '',
    originBranch: authStore.userBranch || 'Peshawar',
    reportedFault: '',
    workshopRack: 'Bay 1 - Diagnostics',
    currentStatus: 'Under Inspection'
  }
  showNewFaultModal.value = true
}

async function submitFaultyMachine() {
  try {
    await dataStore.addFaultyMachine(faultForm.value, authStore.user)
    uiStore.showToast('Faulty machine logged into central workshop inventory!', 'success')
    showNewFaultModal.value = false
    activeTab.value = 'faulty'
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
}

function openUpdateFaultModal(f) {
  const newStatus = f.currentStatus === 'Repaired' ? 'Under Inspection' : 'Repaired'
  dataStore.updateFaultyMachine(f.faultNo, newStatus, 'Status updated via Workshop control panel', null, authStore.user)
  f.currentStatus = newStatus
  uiStore.showToast(`Fault status updated to ${newStatus}!`, 'info')
}

function openResolveClaimModal(claim) {
  selectedClaimToResolve.value = claim
  resolveForm.value = {
    diagnosis: claim.diagnosis || 'Diagnostics completed',
    repairAction: claim.repairAction || 'Component replacement and power calibration completed',
    replacementSerial: claim.replacementSerial || '',
    status: 'Resolved'
  }
  showResolveModal.value = true
}

async function submitResolveClaim() {
  try {
    if (!selectedClaimToResolve.value) return
    await dataStore.resolveWarrantyClaim(
      selectedClaimToResolve.value.claimNo,
      resolveForm.value,
      authStore.user
    )
    uiStore.showToast(`Claim ${selectedClaimToResolve.value.claimNo} marked as resolved!`, 'success')
    showResolveModal.value = false
  } catch (err) {
    uiStore.showToast(err.message, 'error')
  }
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
  max-width: 800px;
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
