<template>
  <div class="space-y-6">
    <!-- ═══════════════════════════════════════════════════════
      EXECUTIVE HEADER & INSTANT ACTIONS
    ═══════════════════════════════════════════════════════ -->
    <div class="glass-panel p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
              <ArchiveRestore :size="26" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Backup & Recycle Bin Hub</span>
                <span class="badge badge-info font-mono text-[10px]">ENTERPRISE RECOVERY</span>
              </h1>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full MongoDB database snapshot creation, export, and soft-delete recovery registry with 1-click restore.
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            ref="fileInputRef"
            accept=".json"
            class="hidden"
            @change="handleFileUpload"
          />
          <button
            @click="triggerFileInput"
            class="btn btn-secondary text-xs h-9 px-3.5 flex items-center gap-1.5 font-bold shadow-sm rounded-lg"
            title="Upload and restore a previous JSON backup file"
          >
            <Upload :size="15" class="text-indigo-500 dark:text-indigo-400" />
            <span>Upload Backup JSON</span>
          </button>

          <button
            @click="openCreateBackupModal"
            class="btn btn-primary text-xs h-9 px-4 flex items-center gap-1.5 font-bold shadow-md rounded-lg"
          >
            <Database :size="15" />
            <span>Create DB Snapshot Now</span>
          </button>
        </div>
      </div>

      <!-- Quick KPI Counters -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Database Snapshots</div>
          <div class="text-lg sm:text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
            {{ dataStore.backupSnapshots?.length || 0 }}
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">Full archive exports</div>
        </div>

        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Items in Recycle Bin</div>
          <div class="text-lg sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
            {{ dataStore.recycleBinItems?.length || 0 }}
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">Soft-deleted entities</div>
        </div>

        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Last Snapshot Taken</div>
          <div class="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-white mt-1 truncate">
            {{ latestBackupDate }}
          </div>
          <div class="text-[10px] text-emerald-500 mt-0.5 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Database Online</span>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">MongoDB Collections</div>
          <div class="text-lg sm:text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
            15 Collections
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">Total live coverage</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      NAVIGATION TABS
    ═══════════════════════════════════════════════════════ -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
      <button
        @click="activeTab = 'snapshots'"
        :class="[
          'px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap',
          activeTab === 'snapshots'
            ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/20'
            : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Database :size="15" />
        <span>Database Snapshots & Backups</span>
        <span class="badge badge-neutral text-[10px] font-mono px-1.5 py-0.2">
          {{ dataStore.backupSnapshots?.length || 0 }}
        </span>
      </button>

      <button
        @click="activeTab = 'trash'"
        :class="[
          'px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap',
          activeTab === 'trash'
            ? 'bg-amber-600 text-white shadow-md shadow-amber-900/20'
            : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Trash2 :size="15" />
        <span>Recycle Bin (Trash)</span>
        <span class="badge badge-warning text-[10px] font-mono px-1.5 py-0.2">
          {{ dataStore.recycleBinItems?.length || 0 }}
        </span>
      </button>

      <button
        @click="activeTab = 'audit'"
        :class="[
          'px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap',
          activeTab === 'audit'
            ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
            : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <History :size="15" />
        <span>Backup & Restore Audit Trail</span>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 1: DATABASE SNAPSHOTS & BACKUPS
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'snapshots'" class="space-y-4 animate-fade-in">
      <!-- Snapshots Toolbar -->
      <div class="glass-panel p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="relative flex-1 min-w-[240px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              v-model="snapshotsSearch"
              type="text"
              placeholder="Search snapshots by ID, title, or creator..."
              class="form-input text-xs h-9 pl-9 pr-8 w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg"
            />
            <button
              v-if="snapshotsSearch"
              type="button"
              @click="snapshotsSearch = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
            >✕</button>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="refreshData"
              class="btn btn-secondary text-xs h-9 px-3 flex items-center gap-1.5 font-bold rounded-lg"
              title="Refresh from Database"
            >
              <RefreshCw :size="14" :class="{ 'animate-spin': isRefreshing }" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Snapshots Table -->
      <div class="table-container glass-panel shadow-md">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>Snapshot ID</th>
              <th>Title / Description</th>
              <th>Archived At</th>
              <th>Collections</th>
              <th>Total Records</th>
              <th>File Size</th>
              <th>Created By</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="backup in filteredSnapshots"
              :key="backup.backupId"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {{ backup.backupId }}
              </td>
              <td class="font-bold text-slate-900 dark:text-white">
                <div>{{ backup.title }}</div>
                <div class="text-[10px] text-slate-500 font-normal">
                  {{ backup.collectionsSummary ? Object.keys(backup.collectionsSummary).length : 15 }} collections archived
                </div>
              </td>
              <td class="font-mono text-slate-600 dark:text-slate-300">
                {{ formatDateTime(backup.timestamp) }}
              </td>
              <td>
                <span class="badge badge-info font-mono text-[10px]">
                  {{ backup.totalCollections || 15 }} Collections
                </span>
              </td>
              <td class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {{ (backup.totalRecords || 0).toLocaleString() }}
              </td>
              <td class="font-mono text-slate-600 dark:text-slate-300">
                {{ formatBytes(backup.sizeBytes) }}
              </td>
              <td class="text-slate-700 dark:text-slate-300">
                {{ backup.createdBy || 'SuperAdmin' }}
              </td>
              <td>
                <span class="badge badge-success font-mono text-[10px]">
                  {{ backup.status || 'Active' }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="viewSnapshotSummary(backup)"
                    class="btn btn-xs btn-secondary"
                    title="View collections record count breakdown"
                  >
                    <Eye :size="13" />
                    <span>Summary</span>
                  </button>
                  <button
                    @click="downloadBackupJson(backup)"
                    class="btn btn-xs btn-secondary text-cyan-600 dark:text-cyan-400"
                    title="Download full JSON file to local computer"
                  >
                    <Download :size="13" />
                    <span>Download</span>
                  </button>
                  <button
                    @click="promptRestoreBackup(backup)"
                    class="btn btn-xs btn-warning font-bold"
                    title="Restore database collections to this point in time"
                  >
                    <RotateCcw :size="13" />
                    <span>Restore</span>
                  </button>
                  <button
                    @click="promptDeleteBackup(backup)"
                    class="btn btn-xs btn-danger"
                    title="Delete this snapshot file"
                  >
                    <Trash2 :size="13" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredSnapshots.length === 0">
              <td colspan="9" class="text-center py-12 text-slate-400">
                <Database class="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <div class="font-bold text-sm text-slate-700 dark:text-slate-300">No Backup Snapshots found.</div>
                <div class="text-xs text-slate-500 mt-1">Click "Create DB Snapshot Now" above to generate a full system backup snapshot.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 2: RECYCLE BIN (TRASH)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'trash'" class="space-y-4 animate-fade-in">
      <!-- Trash Toolbar -->
      <div class="glass-panel p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          <!-- Search Box -->
          <div class="relative flex-1 min-w-[260px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              v-model="trashSearch"
              type="text"
              placeholder="Search deleted items by ID, title, details, or user..."
              class="form-input text-xs h-9 pl-9 pr-8 w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg"
            />
            <button
              v-if="trashSearch"
              type="button"
              @click="trashSearch = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
            >✕</button>
          </div>

          <!-- Filters & Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <!-- Filter by Type -->
            <select
              v-model="trashTypeFilter"
              class="form-select text-xs h-9 font-semibold px-2.5 rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white cursor-pointer shrink-0"
              style="width: 175px !important; min-width: 175px; max-width: 175px;"
            >
              <option value="ALL">All Deleted Types</option>
              <option value="SalesInvoice">Sales Invoices</option>
              <option value="PurchaseOrder">Purchase Orders</option>
              <option value="Product">Products</option>
              <option value="Customer">Customers & Parties</option>
              <option value="PaymentReceipt">Payment Receipts</option>
              <option value="PaymentOut">Payment Out Vouchers</option>
              <option value="WorkshopJobCard">Workshop Job Cards</option>
              <option value="WorkshopPart">Workshop Spare Parts</option>
            </select>

            <button
              v-if="dataStore.recycleBinItems?.length > 0"
              @click="promptEmptyTrash"
              class="btn btn-danger text-xs h-9 px-3 flex items-center gap-1.5 font-bold shrink-0 shadow-sm rounded-lg"
              title="Permanently remove all deleted items"
            >
              <Trash2 :size="14" />
              <span>Empty Recycle Bin</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Recycle Bin Table -->
      <div class="table-container glass-panel shadow-md">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>Record Type</th>
              <th>Identifier / Code</th>
              <th>Item Title</th>
              <th>Summary & Details</th>
              <th>Deleted By</th>
              <th>Deleted Date</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredTrashItems"
              :key="item.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td>
                <span :class="['badge font-mono text-[10px]', getRecordTypeBadge(item.recordType)]">
                  {{ formatRecordType(item.recordType) }}
                </span>
              </td>
              <td class="font-mono font-bold text-slate-900 dark:text-white">
                {{ item.recordId }}
              </td>
              <td class="font-bold text-slate-900 dark:text-white max-w-xs truncate" :title="item.title">
                {{ item.title }}
              </td>
              <td class="text-slate-600 dark:text-slate-300 max-w-sm truncate" :title="item.details">
                {{ item.details || 'No additional summary recorded' }}
              </td>
              <td class="text-slate-700 dark:text-slate-300">
                {{ item.deletedBy || 'System' }}
              </td>
              <td class="font-mono text-slate-600 dark:text-slate-300">
                {{ formatDateTime(item.deletedAt) }}
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="viewOriginalData(item)"
                    class="btn btn-xs btn-secondary"
                    title="View Raw JSON payload"
                  >
                    <Code :size="13" />
                    <span>Raw JSON</span>
                  </button>
                  <button
                    @click="restoreTrashItem(item)"
                    class="btn btn-xs btn-success font-bold text-white shadow-sm"
                    title="Restore item back to active database"
                  >
                    <RotateCcw :size="13" />
                    <span>Restore</span>
                  </button>
                  <button
                    @click="promptDeleteTrashItem(item)"
                    class="btn btn-xs btn-danger"
                    title="Permanently delete from database"
                  >
                    <Trash2 :size="13" />
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredTrashItems.length === 0">
              <td colspan="7" class="text-center py-12 text-slate-400">
                <Trash2 class="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <div class="font-bold text-sm text-slate-700 dark:text-slate-300">Recycle Bin is Empty.</div>
                <div class="text-xs text-slate-500 mt-1">Deleted items will automatically be preserved here for safe recovery.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      TAB 3: BACKUP & RESTORE AUDIT TRAIL
    ═══════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'audit'" class="space-y-4 animate-fade-in">
      <div class="glass-panel p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History :size="16" class="text-purple-500" />
          <span>System Backup & Recovery Audit Trail</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Immutable audit log records of snapshot creations, database restorations, and Recycle Bin actions.
        </p>
      </div>

      <div class="table-container glass-panel shadow-md">
        <table class="table-lined text-xs">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Details</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in backupAuditLogs"
              :key="log.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <td class="font-mono text-slate-600 dark:text-slate-300">{{ formatDateTime(log.timestamp) }}</td>
              <td class="font-bold text-slate-900 dark:text-white">{{ log.user }}</td>
              <td><span class="badge badge-purple text-[10px]">{{ log.role }}</span></td>
              <td class="font-bold text-slate-800 dark:text-slate-200">{{ log.action }}</td>
              <td class="text-slate-600 dark:text-slate-300">{{ log.details }}</td>
              <td>
                <span :class="['badge text-[10px]', getSeverityBadge(log.severity)]">
                  {{ log.severity || 'info' }}
                </span>
              </td>
            </tr>
            <tr v-if="backupAuditLogs.length === 0">
              <td colspan="6" class="text-center py-10 text-slate-400">
                No backup or recovery audit entries found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL: CREATE INSTANT DATABASE SNAPSHOT
    ═══════════════════════════════════════════════════════ -->
    <div v-if="showCreateModal" class="modal-backdrop" @click.self="showCreateModal = false">
      <div class="modal-content max-w-md">
        <div class="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <Database class="text-cyan-500 w-5 h-5" />
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Create Database Snapshot</h3>
          </div>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitCreateBackup" class="space-y-4 pt-3 text-xs">
          <div>
            <label class="form-label font-bold text-slate-800 dark:text-slate-200">Snapshot Title / Note</label>
            <input
              v-model="newBackupTitle"
              type="text"
              placeholder="e.g. End of Month Full Backup / Before Maintenance"
              required
              class="form-input text-xs h-9 w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg"
            />
          </div>

          <div class="p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/40 rounded-lg space-y-1">
            <div class="font-bold text-cyan-800 dark:text-cyan-300 text-xs">Snapshot Coverage:</div>
            <ul class="text-[11px] text-cyan-700 dark:text-cyan-400 space-y-0.5 list-disc list-inside">
              <li>15 MongoDB Collections (Products, Serials, Invoices, POS, Customers, Workshop, etc.)</li>
              <li>Complete JSON export saved in database archive & downloadable to disk</li>
              <li>Non-blocking background archival</li>
            </ul>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" @click="showCreateModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary font-bold flex items-center gap-1.5" :disabled="isCreatingBackup">
              <RefreshCw v-if="isCreatingBackup" :size="14" class="animate-spin" />
              <span>{{ isCreatingBackup ? 'Archiving...' : 'Start Snapshot' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL: SNAPSHOT SUMMARY BREAKDOWN
    ═══════════════════════════════════════════════════════ -->
    <div v-if="selectedSnapshotSummary" class="modal-backdrop" @click.self="selectedSnapshotSummary = null">
      <div class="modal-content max-w-lg">
        <div class="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <Eye class="text-cyan-500 w-5 h-5" />
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Snapshot Collections Breakdown</h3>
          </div>
          <button @click="selectedSnapshotSummary = null" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <div class="space-y-3 pt-3 text-xs">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-[11px]">
            <span class="text-slate-500">Snapshot ID: <strong class="text-slate-800 dark:text-white">{{ selectedSnapshotSummary.backupId }}</strong></span>
            <span class="font-mono text-cyan-600 dark:text-cyan-400">{{ formatDateTime(selectedSnapshotSummary.timestamp) }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            <div
              v-for="(count, coll) in (selectedSnapshotSummary.collectionsSummary || {})"
              :key="coll"
              class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
            >
              <span class="font-medium text-slate-700 dark:text-slate-300 capitalize truncate">{{ coll }}</span>
              <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ count }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
            <button @click="selectedSnapshotSummary = null" class="btn btn-secondary">Close</button>
            <button @click="downloadBackupJson(selectedSnapshotSummary)" class="btn btn-primary flex items-center gap-1.5 font-bold">
              <Download :size="14" />
              <span>Download JSON Payload</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
      MODAL: RAW JSON VIEWER
    ═══════════════════════════════════════════════════════ -->
    <div v-if="rawJsonModalData" class="modal-backdrop" @click.self="rawJsonModalData = null">
      <div class="modal-content max-w-2xl">
        <div class="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <Code class="text-amber-500 w-5 h-5" />
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Original Document Payload</h3>
          </div>
          <button @click="rawJsonModalData = null" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <div class="pt-3 space-y-3">
          <pre class="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-auto max-h-96">{{ JSON.stringify(rawJsonModalData, null, 2) }}</pre>
          <div class="flex justify-end pt-2">
            <button @click="rawJsonModalData = null" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  ArchiveRestore,
  Database,
  Trash2,
  RefreshCw,
  Search,
  Download,
  Upload,
  RotateCcw,
  Eye,
  Code,
  History
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeTab = ref('snapshots')
const snapshotsSearch = ref('')
const trashSearch = ref('')
const trashTypeFilter = ref('ALL')
const isRefreshing = ref(false)
const showCreateModal = ref(false)
const newBackupTitle = ref('')
const isCreatingBackup = ref(false)
const selectedSnapshotSummary = ref(null)
const rawJsonModalData = ref(null)
const fileInputRef = ref(null)

onMounted(async () => {
  await refreshData()
})

async function refreshData() {
  isRefreshing.value = true
  try {
    await dataStore.fetchBackups?.()
    await dataStore.fetchRecycleBin?.()
  } catch (e) {
  } finally {
    isRefreshing.value = false
  }
}

const latestBackupDate = computed(() => {
  if (!dataStore.backupSnapshots || dataStore.backupSnapshots.length === 0) {
    return 'None taken yet'
  }
  const first = dataStore.backupSnapshots[0]
  return formatDateTime(first.timestamp)
})

const filteredSnapshots = computed(() => {
  const list = dataStore.backupSnapshots || []
  if (!snapshotsSearch.value) return list
  const q = snapshotsSearch.value.toLowerCase()
  return list.filter(b =>
    (b.backupId || '').toLowerCase().includes(q) ||
    (b.title || '').toLowerCase().includes(q) ||
    (b.createdBy || '').toLowerCase().includes(q)
  )
})

const filteredTrashItems = computed(() => {
  const list = dataStore.recycleBinItems || []
  return list.filter(item => {
    const matchType = trashTypeFilter.value === 'ALL' || item.recordType === trashTypeFilter.value
    if (!matchType) return false
    if (!trashSearch.value) return true
    const q = trashSearch.value.toLowerCase()
    return (
      (item.recordId || '').toLowerCase().includes(q) ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.details || '').toLowerCase().includes(q) ||
      (item.deletedBy || '').toLowerCase().includes(q)
    )
  })
})

const backupAuditLogs = computed(() => {
  const logs = dataStore.auditLogs || []
  return logs.filter(l =>
    l.module === 'SYSTEM' ||
    l.module === 'RECYCLE_BIN' ||
    (l.action || '').toLowerCase().includes('backup') ||
    (l.action || '').toLowerCase().includes('restore') ||
    (l.action || '').toLowerCase().includes('recycle')
  )
})

function formatDateTime(val) {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return String(val)
  }
}

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '—'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

function formatRecordType(type) {
  switch (type) {
    case 'SalesInvoice': return 'Sale Invoice'
    case 'PurchaseOrder': return 'Purchase Order'
    case 'Product': return 'Product SKU'
    case 'Customer': return 'Customer / Party'
    case 'PaymentReceipt': return 'Payment In Receipt'
    case 'PaymentOut': return 'Payment Out Voucher'
    case 'WorkshopJobCard': return 'Workshop Job Card'
    case 'WorkshopPart': return 'Spare Part'
    default: return type || 'Record'
  }
}

function getRecordTypeBadge(type) {
  switch (type) {
    case 'SalesInvoice': return 'badge-info'
    case 'PurchaseOrder': return 'badge-purple'
    case 'Product': return 'badge-success'
    case 'Customer': return 'badge-warning'
    case 'PaymentReceipt': return 'badge-emerald'
    case 'PaymentOut': return 'badge-danger'
    case 'WorkshopJobCard': return 'badge-cyan'
    default: return 'badge-neutral'
  }
}

function getSeverityBadge(sev) {
  switch (sev) {
    case 'danger': return 'badge-danger'
    case 'warning': return 'badge-warning'
    case 'info': return 'badge-info'
    default: return 'badge-neutral'
  }
}

function openCreateBackupModal() {
  newBackupTitle.value = `Snapshot ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`
  showCreateModal.value = true
}

async function submitCreateBackup() {
  if (isCreatingBackup.value) return
  isCreatingBackup.value = true
  try {
    const res = await dataStore.createBackup(newBackupTitle.value, authStore.user)
    if (res.success) {
      uiStore.showToast?.('Database snapshot created successfully!', 'success')
      showCreateModal.value = false
    } else {
      uiStore.showToast?.(res.message || 'Backup failed', 'error')
    }
  } catch (e) {
    uiStore.showToast?.(e.message || 'Backup failed', 'error')
  } finally {
    isCreatingBackup.value = false
  }
}

function viewSnapshotSummary(backup) {
  selectedSnapshotSummary.value = backup
}

async function downloadBackupJson(backup) {
  try {
    uiStore.showToast?.('Preparing snapshot download...', 'info')
    const res = await fetch(`/api/backups/${encodeURIComponent(backup.backupId)}`)
    if (!res.ok) throw new Error('Failed to retrieve snapshot data from database')
    const fullData = await res.json()
    const jsonStr = JSON.stringify(fullData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `medimage_backup_${backup.backupId}_${new Date().toISOString().substring(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    uiStore.showToast?.('Snapshot downloaded successfully!', 'success')
  } catch (e) {
    uiStore.showToast?.(e.message || 'Failed to download snapshot', 'error')
  }
}

async function promptRestoreBackup(backup) {
  const confirmed = confirm(
    `RESTORE DATABASE WARNING:\n\nAre you sure you want to restore the entire database to the snapshot "${backup.title}" (${backup.backupId})?\n\nThis will synchronize all 15 MongoDB collections to the exact state archived on ${formatDateTime(backup.timestamp)}.`
  )
  if (!confirmed) return

  uiStore.showToast?.('Restoring database collections...', 'info')
  try {
    const res = await dataStore.restoreBackup(backup.backupId, authStore.user)
    if (res.success) {
      uiStore.showToast?.('Database restored successfully from snapshot!', 'success')
      await refreshData()
    } else {
      uiStore.showToast?.(res.message || 'Restore failed', 'error')
    }
  } catch (e) {
    uiStore.showToast?.(e.message || 'Restore failed', 'error')
  }
}

async function promptDeleteBackup(backup) {
  const confirmed = confirm(`Are you sure you want to delete backup snapshot "${backup.backupId}"?`)
  if (!confirmed) return

  try {
    const res = await dataStore.deleteBackup(backup.backupId)
    if (res.success) {
      uiStore.showToast?.('Backup snapshot deleted', 'success')
    } else {
      uiStore.showToast?.('Failed to delete snapshot', 'error')
    }
  } catch (e) {
    uiStore.showToast?.(e.message, 'error')
  }
}

function triggerFileInput() {
  if (fileInputRef.value) fileInputRef.value.click()
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const confirmed = confirm(
    `RESTORE FROM LOCAL FILE WARNING:\n\nYou selected "${file.name}".\n\nDo you want to restore the live database collections from this backup file?`
  )
  if (!confirmed) {
    event.target.value = ''
    return
  }

  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const snapshotData = parsed.snapshotData || parsed
    uiStore.showToast?.('Uploading and restoring backup payload...', 'info')

    const res = await fetch('/api/backups/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        backupId: `UPLOAD_${Date.now()}`,
        snapshotData,
        restoredBy: authStore.user?.name || 'SuperAdmin'
      })
    })
    const data = await res.json()
    if (data.success) {
      uiStore.showToast?.('Database successfully restored from uploaded file!', 'success')
      await dataStore.syncWithBackend()
      await refreshData()
    } else {
      uiStore.showToast?.(data.message || 'Restore failed', 'error')
    }
  } catch (e) {
    uiStore.showToast?.('Invalid JSON file: ' + e.message, 'error')
  } finally {
    event.target.value = ''
  }
}

function viewOriginalData(item) {
  rawJsonModalData.value = item.originalData || item
}

async function restoreTrashItem(item) {
  const confirmed = confirm(`Restore "${item.title}" (${item.recordType}) back to active live database?`)
  if (!confirmed) return

  try {
    const res = await dataStore.restoreFromRecycleBin(item.id, authStore.user)
    if (res.success) {
      uiStore.showToast?.(`${item.title} restored to live database!`, 'success')
    } else {
      uiStore.showToast?.(res.message || 'Failed to restore item', 'error')
    }
  } catch (e) {
    uiStore.showToast?.(e.message, 'error')
  }
}

async function promptDeleteTrashItem(item) {
  const confirmed = confirm(`PERMANENT DELETE:\n\nAre you sure you want to permanently delete "${item.title}"?\nThis cannot be undone!`)
  if (!confirmed) return

  try {
    const res = await dataStore.deleteFromRecycleBin(item.id)
    if (res.success) {
      uiStore.showToast?.('Item permanently deleted', 'success')
    } else {
      uiStore.showToast?.('Failed to delete item', 'error')
    }
  } catch (e) {
    uiStore.showToast?.(e.message, 'error')
  }
}

async function promptEmptyTrash() {
  const count = dataStore.recycleBinItems?.length || 0
  const confirmed = confirm(
    `PERMANENTLY PURGE RECYCLE BIN:\n\nAre you sure you want to permanently delete all ${count} items in the Recycle Bin?\n\nAll soft-deleted records will be purged from the database forever.`
  )
  if (!confirmed) return

  try {
    const res = await dataStore.emptyRecycleBin(authStore.user)
    if (res.success) {
      uiStore.showToast?.('Recycle Bin emptied successfully!', 'success')
    } else {
      uiStore.showToast?.('Failed to empty recycle bin', 'error')
    }
  } catch (e) {
    uiStore.showToast?.(e.message, 'error')
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
</style>
