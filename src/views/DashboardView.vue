<template>
  <div class="page-wrapper space-y-6">

    <!-- ════════════════════════════════════════════
      PAGE HEADER — Title + quick action buttons
    ════════════════════════════════════════════ -->
    <PageHeader
      title="Head Office (Peshawar) Executive Dashboard"
      subtitle="Central monitoring of branch sales (Peshawar HO, Multan, Lahore), machine serial tracking, payment ledgers & stock transfers"
    >
      <template #actions>
        <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 items-center w-full sm:w-auto">
          <!-- View / Hide Balance Security Toggle -->
          <button
            @click="authStore.toggleBalance()"
            :class="[
              'btn font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all col-span-1 whitespace-nowrap text-xs sm:text-sm px-2.5',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
            ]"
            :style="authStore.isBalanceVisible ? '' : 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;'"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Dashboard login verification required to reveal balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="15" class="shrink-0" />
            <Eye v-else :size="15" class="shrink-0" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View Balance' }}</span>
          </button>
          <button class="btn btn-secondary flex items-center justify-center gap-1.5 col-span-1 whitespace-nowrap text-xs sm:text-sm px-2.5" @click="router.push('/universal-search')">
            <Search :size="15" class="shrink-0" />
            <span>Universal Search</span>
          </button>
          <button v-if="authStore.isSuperAdmin" class="btn btn-secondary flex items-center justify-center gap-1.5 col-span-1 whitespace-nowrap text-xs sm:text-sm px-2.5" @click="showTransferModal = true">
            <ArrowRightLeft :size="15" class="shrink-0" />
            <span>Branch Transfer</span>
          </button>
          <button class="btn btn-success flex items-center justify-center gap-1.5 col-span-1 whitespace-nowrap text-xs sm:text-sm px-2.5" @click="showAddModal = true">
            <PackagePlus :size="15" class="shrink-0" />
            <span>Add Equipment</span>
          </button>
          <button class="btn btn-primary flex items-center justify-center gap-1.5 col-span-2 sm:col-auto whitespace-nowrap text-xs sm:text-sm px-4" @click="router.push('/sales')">
            <ShoppingCart :size="15" class="shrink-0" />
            <span>New Sales POS</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- ════════════════════════════════════════════
      CITY DEPOT OVERVIEW — 3 clickable location cards
    ════════════════════════════════════════════ -->
    <GlassPanel extra-class="p-4">
      <div class="flex justify-between items-center flex-wrap gap-3 mb-4">
        <h3 class="flex items-center gap-2 font-bold text-main">
          <Building2 :size="18" class="text-primary" />
          <span>Regional City Stock & Product Allocation Overview</span>
        </h3>
        <StatBadge color="purple" :mono="true">3 DEPOT LOCATIONS</StatBadge>
      </div>

      <!-- City cards: click to filter the product table below -->
      <div class="city-widget-grid">
        <div
          v-for="city in cityAllocations"
          :key="city.name"
          :class="['glass-card', 'city-widget-card', activeCityFilter === city.name ? 'active-city-card' : '']"
          @click="toggleCityFilter(city.name)"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="flex items-center gap-2 font-bold text-main">
              <MapPin :size="16" :class="city.name === 'Lahore' ? 'text-info' : city.name === 'Multan' ? 'text-success' : 'text-purple'" />
              {{ city.name }} Depot
            </span>
            <StatBadge :color="city.name === 'Lahore' ? 'info' : city.name === 'Multan' ? 'success' : 'purple'">
              {{ city.skus }} SKUs Allocated
            </StatBadge>
          </div>

          <div class="flex justify-between text-xs text-muted mb-1">
            <span>Available Units Stocked:</span>
            <span class="font-mono text-main font-bold text-sm">{{ city.stockQty }} units</span>
          </div>
          <div class="flex justify-between text-xs text-muted mb-1">
            <span>Today's Branch Sales:</span>
            <span class="font-mono text-emerald-400 font-bold">{{ formatBalance(city.todaySales) }}</span>
          </div>
          <div class="flex justify-between text-xs text-muted mb-1">
            <span>Today's Invoices Created:</span>
            <span class="font-mono text-blue-400 font-bold">{{ city.todayInvoices }}</span>
          </div>
          <div class="flex justify-between text-xs text-muted mb-2">
            <span>Retail Stock Valuation:</span>
            <span class="font-mono text-success font-bold">{{ formatBalance(city.retailValuation) }}</span>
          </div>

          <div class="line-divider"></div>
          <div class="flex justify-between text-xs font-semibold text-primary mt-2">
            <span>{{ activeCityFilter === city.name ? '✓ Filter Active' : 'Click to filter catalog' }}</span>
            <ChevronRight :size="14" />
          </div>
        </div>
      </div>
    </GlassPanel>

    <!-- ════════════════════════════════════════════
      SALES PERIOD FILTER BAR & BALANCE SECURITY TOGGLE
    ════════════════════════════════════════════ -->
    <div class="date-filter-toolbar">
      <div class="filter-bar-flex">
        <DateFilterBar
          v-model="salesDateFilter"
          title="Sale Date Filter:"
          :no-margin="true"
        />
      </div>
      <button
        @click="authStore.toggleBalance()"
        :class="[
          'balance-toggle-action',
          authStore.isBalanceVisible ? 'is-visible-state' : 'is-hidden-state'
        ]"
        :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Dashboard login verification required to reveal balances'"
      >
        <EyeOff v-if="authStore.isBalanceVisible" :size="16" />
        <Eye v-else :size="16" />
        <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View / Check Balance' }}</span>
      </button>
    </div>

    <!-- ════════════════════════════════════════════
      CORE KPI METRICS — Revenue, Profit, Stock, Alerts (Password Protected)
    ════════════════════════════════════════════ -->
    <div class="kpi-grid">
      <KpiCard
        label="Gross Invoiced Revenue"
        :value="formatBalance(salesMetrics.revenue)"
        :subtitle="salesDateFilter.preset === 'All Time'
          ? `From ${salesMetrics.count} completed invoices`
          : `From ${salesMetrics.count} invoices (${salesFilterLabel})`"
        :badge="`${salesMetrics.count} INVOICES`"
        badge-color="success"
        accent-class="kpi-success"
      />

      <KpiCard
        label="Net Operating Profit"
        :value="formatBalance(salesMetrics.profit)"
        :subtitle="salesDateFilter.preset === 'All Time'
          ? 'Net profit retained after COGS'
          : `Retained profit for ${salesFilterLabel}`"
        :badge="`${salesMetrics.marginPercent}% MARGIN`"
        badge-color="purple"
        accent-class="kpi-purple"
      />

      <KpiCard
        label="Total Inventory Valuation"
        :value="formatBalance(dataStore.inventoryValuationRetail)"
        :subtitle="authStore.isBalanceVisible ? `Cost value: PKR ${(dataStore.inventoryValuationCost || 0).toLocaleString()}` : 'Cost value: PKR ••••••'"
        badge="RETAIL VALUE"
        badge-color="info"
      />

      <KpiCard
        label="Low Stock Reorder Alerts"
        :value="`${dataStore.lowStockProducts.length} SKUs`"
        :badge="`${dataStore.lowStockProducts.length} ITEMS`"
        badge-color="warning"
        accent-class="kpi-warning"
      >
        <!-- Custom content: warning icon + message -->
        <div class="flex items-center gap-1 text-warning text-xs">
          <AlertTriangle :size="14" />
          <span>Needs purchasing restocking</span>
        </div>
      </KpiCard>
    </div>

    <!-- ════════════════════════════════════════════
      CASH FLOW & LIQUIDITY BAR — Money In vs Money Out
    ════════════════════════════════════════════ -->
    <div class="kpi-grid">
      <KpiCard
        label="Money Coming In (Collections)"
        :value="formatBalance(dataStore.totalMoneyIn)"
        :subtitle="`${dataStore.paymentReceipts.length} total payment receipts received`"
        badge="MONEY IN"
        badge-color="success"
        accent-class="kpi-success"
        value-color="text-emerald-400"
      />

      <KpiCard
        label="Money Coming Out (Disbursements)"
        :value="formatBalance(dataStore.totalMoneyOut)"
        :subtitle="`${(dataStore.paymentOutVouchers || []).length} vouchers (refunds, expenses, disbursements)`"
        badge="MONEY OUT"
        badge-color="danger"
        accent-class="kpi-danger"
        value-color="text-red-400"
      />

      <KpiCard
        label="Net Operating Cash Flow"
        :value="formatBalance(dataStore.netCashFlow)"
        :subtitle="dataStore.netCashFlow >= 0 ? 'Surplus liquid cash position' : 'Outflow exceeds inflows'"
        badge="NET LIQUIDITY"
        badge-color="purple"
        accent-class="kpi-purple"
        :value-color="dataStore.netCashFlow >= 0 ? 'text-purple-400' : 'text-red-400'"
      />
    </div>

    <!-- ════════════════════════════════════════════
      MULTI-CITY SALES FORCE & EXECUTIVE LEADERBOARD
    ════════════════════════════════════════════ -->
    <GlassPanel extra-class="p-5 border border-indigo-500/40 space-y-4">
      <div class="flex justify-between items-center flex-wrap gap-3">
        <div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <ShoppingCart :size="18" />
            </div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span v-if="authStore.isSuperAdmin">Multi-City Branch Sales Force Performance</span>
              <span v-else>My Sales Executive Performance ({{ authStore.userBranch }} Depot)</span>
              <span class="badge badge-indigo font-mono font-bold text-[10px]">
                {{ authStore.isSuperAdmin ? '👑 PESHAWAR HO GOVERNANCE' : `💼 ${authStore.userBranch.toUpperCase()} WORKSPACE` }}
              </span>
            </h3>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            <span v-if="authStore.isSuperAdmin">Real-time tracking of sales executives across Lahore, Multan, Karachi, and Islamabad under Peshawar SuperAdmin supervision.</span>
            <span v-else>Personal performance statistics, completed invoice counts, and active billing metrics for {{ authStore.user?.name }}.</span>
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-sm btn-primary font-bold text-xs"
            @click="router.push('/sales')"
          >
            + POS Checkout Order
          </button>
        </div>
      </div>

      <!-- Sales Reps Performance Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 text-xs">
        <div
          v-for="rep in salesRepMetrics"
          :key="rep.email"
          class="sales-rep-card"
        >
          <div class="flex items-center justify-between gap-2 mb-2">
            <span :class="['badge font-bold text-[10px] py-0.5 px-2 rounded-full', rep.branch === 'Lahore' ? 'badge-info' : rep.branch === 'Multan' ? 'badge-success' : rep.branch === 'Karachi' ? 'badge-cyan' : 'badge-purple']">
              📍 {{ rep.branch }}
            </span>
            <span class="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
            </span>
          </div>

          <div class="flex items-center gap-2.5 min-w-0 mb-3">
            <div class="rep-avatar-wrapper" style="width: 42px !important; height: 42px !important; min-width: 42px !important; max-width: 42px !important; min-height: 42px !important; max-height: 42px !important; border-radius: 9999px !important; overflow: hidden !important; flex-shrink: 0 !important; display: block !important;">
              <img
                :src="rep.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'"
                class="rep-avatar-img"
                alt="Avatar"
                style="width: 100% !important; height: 100% !important; min-width: 100% !important; min-height: 100% !important; max-width: 100% !important; max-height: 100% !important; border-radius: 9999px !important; object-fit: cover !important; display: block !important;"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-bold text-white text-xs truncate" :title="rep.name">{{ rep.name }}</div>
              <div class="text-[10px] text-slate-400 truncate" :title="rep.title">{{ rep.title }}</div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] bg-slate-900/40 p-2 rounded-lg">
            <div>
              <span class="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Total Sales</span>
              <span class="font-mono font-bold text-emerald-400 text-xs">{{ formatBalance(rep.revenue) }}</span>
            </div>
            <div class="text-right">
              <span class="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Invoices</span>
              <span class="font-mono font-bold text-white text-xs">{{ rep.ordersCount }} Orders</span>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>

    <!-- ════════════════════════════════════════════
      REQUIREMENT 48: LOW STOCK ITEMS / MINIMUM STOCK ALERT SECTION
    ════════════════════════════════════════════ -->
    <GlassPanel extra-class="p-4 border border-amber-500/30 bg-gradient-to-br from-slate-900/90 to-red-950/20">
      <div class="flex justify-between items-center flex-wrap gap-3 mb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle :size="18" />
          </div>
          <div>
            <h3 class="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <span>⚠️ Low Stock Items & Minimum Stock Alerts</span>
              <span class="badge badge-danger text-xs font-mono font-bold">{{ dataStore.lowStockProducts.length }} ALERTS</span>
            </h3>
            <p class="text-xs text-slate-400">Products where available stock &le; configured minimum stock level. Restocking action required.</p>
          </div>
        </div>

        <div class="flex items-center flex-wrap gap-2">
          <button
            type="button"
            @click="handleExportLowStockReport('xlsx')"
            :disabled="dataStore.lowStockProducts.length === 0"
            class="btn btn-sm btn-ghost text-xs text-amber-300 hover:text-amber-200 border border-amber-500/40 flex items-center gap-1.5 font-bold"
            title="Download Excel Report"
          >
            <FileSpreadsheet :size="13" />
            <span>Export Low Stock Report</span>
          </button>
          <button
            type="button"
            @click="handleExportLowStockReport('print')"
            :disabled="dataStore.lowStockProducts.length === 0"
            class="btn btn-sm btn-ghost text-xs text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5"
            title="Print Report"
          >
            <Printer :size="13" />
            <span>Print Report</span>
          </button>
          <button class="btn btn-sm btn-secondary text-xs" @click="router.push('/purchasing')">
            + Purchase Reorder
          </button>
        </div>
      </div>

      <!-- Low Stock Table (Requirement 48) -->
      <div v-if="dataStore.lowStockProducts.length > 0" class="table-container border border-slate-800 rounded-lg overflow-hidden">
        <table class="table-lined text-xs">
          <thead>
            <tr class="bg-slate-900/90 text-slate-300">
              <th>Product / Machine</th>
              <th>Category</th>
              <th class="text-center">Current Stock</th>
              <th class="text-center">Minimum Level</th>
              <th class="text-center">Deficit</th>
              <th>Status</th>
              <th>Depot / Location</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in dataStore.lowStockProducts"
              :key="item.id || item.sku"
              class="bg-red-950/25 hover:bg-red-900/35 border-l-4 border-l-red-500 transition-colors"
            >
              <td>
                <div class="flex items-center gap-2.5">
                  <img :src="item.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'" class="w-8 h-8 rounded-lg object-cover border border-slate-700" alt="Thumb" />
                  <div>
                    <div class="font-bold text-white">{{ item.name }}</div>
                    <div class="font-mono text-[11px] text-indigo-400 font-bold">{{ item.sku }}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-purple text-[10px]">{{ item.category }}</span></td>
              <td class="text-center font-mono font-bold text-red-400 text-sm">
                {{ item.stockQty }} units
              </td>
              <td class="text-center font-mono font-bold text-slate-300 text-sm">
                {{ item.minStock !== undefined ? item.minStock : 5 }} units
              </td>
              <td class="text-center font-mono font-bold text-amber-400">
                -{{ Math.max(0, (item.minStock !== undefined ? item.minStock : 5) - item.stockQty) }} units
              </td>
              <td>
                <span :class="['badge font-bold text-[10px]', item.stockQty === 0 ? 'badge-danger animate-pulse' : 'badge-danger']">
                  {{ item.stockQty === 0 ? '🚨 Out of Stock' : '🔴 Low Stock' }}
                </span>
              </td>
              <td>
                <span class="badge badge-neutral text-[10px] flex items-center gap-1 w-fit">
                  <Building2 :size="10" />
                  {{ item.allocationCity || 'Peshawar' }}
                </span>
              </td>
              <td class="text-right">
                <button
                  type="button"
                  @click="router.push('/purchasing')"
                  class="btn btn-xs btn-primary font-bold shadow"
                >
                  Create PO
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- All well-stocked empty state -->
      <div v-else class="p-6 text-center rounded-lg border border-emerald-500/20 bg-emerald-950/10">
        <div class="text-2xl mb-1">✅</div>
        <div class="text-sm font-bold text-emerald-400">All Equipment Items Well-Stocked</div>
        <p class="text-xs text-slate-400 mt-1">Every machine and product in the inventory is currently above its configured minimum stock threshold.</p>
      </div>
    </GlassPanel>

    <!-- ════════════════════════════════════════════
      PRODUCT TABLE — Filtered by selected city depot & sorted
    ════════════════════════════════════════════ -->
    <GlassPanel extra-class="p-4">
      <!-- Table header + filter buttons -->
      <div class="flex justify-between items-center flex-wrap gap-3 mb-3">
        <h3 class="flex items-center gap-2 font-bold text-main">
          <Package :size="18" class="text-primary" />
          <span>Product Catalog & City Allocations ({{ activeCityFilter === 'ALL' ? 'All Depots' : activeCityFilter }})</span>
        </h3>

        <div class="flex items-center flex-wrap gap-2">
          <!-- City filter buttons -->
          <button
            v-for="c in allowedCityFilters"
            :key="c"
            :class="['btn', 'btn-sm', activeCityFilter === c ? 'btn-primary' : 'btn-ghost']"
            @click="activeCityFilter = c"
          >
            {{ c === 'ALL' ? 'All Cities' : c + ' Depot' }}
          </button>
          <button class="btn btn-sm btn-secondary" @click="router.push('/inventory')">
            Manage Inventory
          </button>
        </div>
      </div>

      <!-- Sorting Controls & Search Bar -->
      <div class="dash-catalog-toolbar">
        <div class="dash-sort-group">
          <div class="dash-select-box">
            <ArrowUpDown :size="13" class="text-primary flex-shrink-0" />
            <span class="text-xs text-subtle font-semibold">Sort:</span>
            <select v-model="productSortKey" class="dash-select">
              <option value="sellingPrice">Selling Price</option>
              <option value="costPrice">Cost Price</option>
              <option value="stockQty">Stock Qty</option>
              <option value="name">Product Name</option>
              <option value="sku">SKU Code</option>
            </select>
          </div>

          <!-- Ascending / Descending Toggle Buttons -->
          <div class="dash-toggle-group">
            <button
              type="button"
              :class="['dash-toggle-btn', productSortOrder === 'asc' ? 'active' : '']"
              @click="productSortOrder = 'asc'"
              title="Sort Ascending (Lowest Price / A-Z)"
            >
              <ArrowUp :size="12" />
              <span>Asc</span>
            </button>
            <button
              type="button"
              :class="['dash-toggle-btn', productSortOrder === 'desc' ? 'active' : '']"
              @click="productSortOrder = 'desc'"
              title="Sort Descending (Highest Price / Z-A)"
            >
              <ArrowDown :size="12" />
              <span>Desc</span>
            </button>
          </div>
        </div>

        <div class="dash-search-group">
          <div class="relative">
            <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="productSearchQuery"
              type="text"
              placeholder="Search SKU, name..."
              class="dash-search-input"
            />
          </div>
          <span class="badge badge-neutral text-xs font-mono py-1 px-2.5 h-8 flex items-center whitespace-nowrap">
            {{ sortedCityProducts.length }} SKUs
          </span>
        </div>
      </div>

      <!-- Product table using DataTable component with clickable sort headers -->
      <DataTable
        :columns="productTableColumns"
        :sort-key="productSortKey"
        :sort-order="productSortOrder"
        @sort="handleProductHeaderSort"
        :empty="sortedCityProducts.length === 0"
        empty-message="No products found matching the selected filter."
      >
        <tr
          v-for="p in sortedCityProducts"
          :key="p.id"
          :class="[
            (activeCityFilter === 'ALL' ? p.stockQty : getAvailableSerials(p.id, activeCityFilter)) <= (p.minStock !== undefined ? p.minStock : 2) ? 'bg-red-950/20 border-l-4 border-l-red-500' : ''
          ]"
        >
          <td>
            <div class="flex items-center gap-2">
              <img :src="p.image" class="thumb-mini" alt="Thumb" />
              <div>
                <div class="font-bold text-main">{{ p.name }}</div>
                <div class="font-mono text-primary text-xs">{{ p.sku }}</div>
              </div>
            </div>
          </td>
          <td><StatBadge color="neutral">{{ p.category }}</StatBadge></td>
          <td>
            <StatBadge :color="(activeCityFilter === 'ALL' ? (p.allocationCity || 'Lahore') : activeCityFilter) === 'Lahore' ? 'info' : (activeCityFilter === 'ALL' ? (p.allocationCity || 'Lahore') : activeCityFilter) === 'Multan' ? 'success' : 'purple'">
              <Building2 :size="10" />
              {{ activeCityFilter === 'ALL' ? (p.allocationCity || 'Lahore') : activeCityFilter }}
            </StatBadge>
          </td>
          <td class="font-mono text-xs">{{ p.storageBin }}</td>
          <td class="font-mono text-muted">{{ formatBalance(p.costPrice) }}</td>
          <td><span class="font-mono font-bold text-success">{{ formatBalance(p.sellingPrice || p.salePrice) }}</span></td>
          <td>
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-bold">{{ activeCityFilter === 'ALL' ? p.stockQty : getAvailableSerials(p.id, activeCityFilter) }} units</span>
              <span v-if="(activeCityFilter === 'ALL' ? p.stockQty : getAvailableSerials(p.id, activeCityFilter)) <= (p.minStock !== undefined ? p.minStock : 2)" class="badge badge-danger text-[9px] py-0 px-1 font-bold">
                🔴 LOW
              </span>
            </div>
          </td>
          <td class="font-mono text-xs text-secondary">{{ getAvailableSerials(p.id, activeCityFilter) }} Units Available</td>
        </tr>
      </DataTable>
    </GlassPanel>

    <!-- Extracted Modals -->
    <AddEquipmentModal :show="showAddModal" @close="showAddModal = false" />
    <StockTransferModal :show="showTransferModal" @close="showTransferModal = false" />
  </div>
</template>

<script setup>
// ──────────────────────────────────────────────────────────────
//  DashboardView — Executive HO Dashboard
//  Uses reusable components from:
//    src/components/ui/    → PageHeader, KpiCard, GlassPanel, StatBadge, DataTable
// ──────────────────────────────────────────────────────────────
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'

// Reusable UI components
import PageHeader from '@/components/ui/PageHeader.vue'
import KpiCard    from '@/components/ui/KpiCard.vue'
import GlassPanel from '@/components/ui/GlassPanel.vue'
import StatBadge  from '@/components/ui/StatBadge.vue'
import DataTable  from '@/components/ui/DataTable.vue'
import DateFilterBar from '@/components/ui/DateFilterBar.vue'
import AddEquipmentModal from '@/components/AddEquipmentModal.vue'
import StockTransferModal from '@/components/StockTransferModal.vue'

// Lucide icons
import {
  LayoutDashboard,
  ShoppingCart,
  Building2,
  MapPin,
  AlertTriangle,
  Package,
  ChevronRight,
  ArrowRightLeft,
  PackagePlus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eye,
  EyeOff,
  Search,
  FileSpreadsheet,
  Printer
} from 'lucide-vue-next'

import { exportLowStockReport } from '@/utils/reportExporter'

// ── Stores & router ───────────────────────────────────────────
const authStore  = useAuthStore()
const dataStore  = useDataStore()
const uiStore    = useUiStore()
const router     = useRouter()

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

function handleExportLowStockReport(format = 'xlsx') {
  if (!dataStore.lowStockProducts || dataStore.lowStockProducts.length === 0) {
    uiStore.showModal('Inventory Status', 'All equipment products are currently above their minimum stock thresholds! No low stock items to report.', 'success')
    return
  }
  exportLowStockReport(dataStore.lowStockProducts, format)
  uiStore.showToast(`Low Stock Report exported (${dataStore.lowStockProducts.length} items)`, 'success')
}

// ── State ─────────────────────────────────────────────────────
const allowedCityFilters = computed(() => {
  if (authStore.isSuperAdmin) {
    return ['ALL', 'Lahore', 'Multan', 'Karachi', 'Islamabad', 'Peshawar']
  }
  return [authStore.userBranch || 'Lahore']
})

const activeCityFilter = ref(authStore.isSuperAdmin ? 'ALL' : (authStore.userBranch || 'Lahore'))
const showTransferModal = ref(false)
const showAddModal = ref(false)

watch(() => authStore.userBranch, (b) => {
  if (!authStore.isSuperAdmin) {
    activeCityFilter.value = b || 'Lahore'
  }
}, { immediate: true })

// ── Sales Date Filter State & Dynamic Metrics ─────────────────
const salesDateFilter = ref({
  preset: 'All Time',
  startDate: null,
  endDate: null
})

const salesMetrics = computed(() => {
  let invoices = dataStore.salesInvoices || []
  if (!authStore.isSuperAdmin) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    invoices = invoices.filter(i => (i.branch || 'Lahore').toLowerCase().includes(userCity))
  }

  if (salesDateFilter.value.preset === 'All Time') {
    const revenue = invoices.reduce((sum, i) => sum + Number(i.grandTotal || 0), 0)
    const profit = invoices.reduce((sum, i) => sum + Number(i.grossProfit || (Number(i.grandTotal || 0) * 0.25)), 0)
    const marginPercent = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(1)) : 0
    return {
      revenue,
      profit,
      marginPercent,
      count: invoices.length
    }
  }

  const sDate = salesDateFilter.value.startDate
  const eDate = salesDateFilter.value.endDate
  const filtered = invoices.filter(i => {
    const d = (i.saleDate || '').substring(0, 10)
    if (sDate && eDate) return d >= sDate && d <= eDate
    if (sDate) return d >= sDate
    if (eDate) return d <= eDate
    return true
  })
  const revenue = filtered.reduce((sum, i) => sum + Number(i.grandTotal || 0), 0)
  const profit = filtered.reduce((sum, i) => sum + Number(i.grossProfit || (Number(i.grandTotal || 0) * 0.25)), 0)
  const marginPercent = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(1)) : 0
  return {
    revenue,
    profit,
    marginPercent,
    count: filtered.length
  }
})

const salesFilterLabel = computed(() => {
  const { preset, startDate, endDate } = salesDateFilter.value
  if (preset === 'All Time') return 'All Time'
  if (startDate && endDate) {
    return startDate === endDate ? `${preset}: ${startDate}` : `${startDate} ~ ${endDate}`
  }
  return preset
})

// ── Multi-City Sales Reps Breakdown (SuperAdmin sees ALL; Sales Person sees ONLY THEMSELVES) ──
const salesRepMetrics = computed(() => {
  let reps = authStore.demoUsers.filter(u => u.role === 'manager')
  
  if (!authStore.isSuperAdmin) {
    const myEmail = (authStore.user?.email || '').toLowerCase()
    const myName = (authStore.user?.name || '').toLowerCase()
    reps = reps.filter(u => u.email.toLowerCase() === myEmail || u.name.toLowerCase() === myName)
  }

  const invoices = dataStore.salesInvoices || []

  return reps.map(r => {
    const repInvoices = invoices.filter(i => 
      (i.salesPerson && i.salesPerson.toLowerCase().includes(r.name.toLowerCase())) ||
      (i.sellerName && i.sellerName.toLowerCase().includes(r.name.toLowerCase())) ||
      (i.branch && i.branch.toLowerCase() === (r.branch || '').toLowerCase())
    )
    const revenue = repInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal || inv.subtotal || 0), 0)
    return {
      name: r.name,
      email: r.email,
      branch: r.branch || 'Lahore',
      title: r.title,
      avatar: r.avatar,
      ordersCount: repInvoices.length,
      revenue
    }
  })
})

// ── Product Sorting & Search State ───────────────────────────
const productSortKey = ref('sellingPrice')
const productSortOrder = ref('desc') // 'asc' | 'desc'
const productSearchQuery = ref('')

const productTableColumns = [
  { label: 'Product / SKU', key: 'name', sortable: true },
  { label: 'Category', key: 'category', sortable: true },
  { label: 'Allocation Place', key: 'allocationCity', sortable: false },
  { label: 'Storage Bin', key: 'storageBin', sortable: false },
  { label: 'Cost Price', key: 'costPrice', sortable: true },
  { label: 'Selling Price', key: 'sellingPrice', sortable: true },
  { label: 'Stock Qty', key: 'stockQty', sortable: true },
  { label: 'Serials Available', key: 'serialsAvailable', sortable: false }
]

function handleProductHeaderSort(key) {
  if (productSortKey.value === key) {
    productSortOrder.value = productSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    productSortKey.value = key
    productSortOrder.value = 'asc'
  }
}

// ── City depot overview cards (SuperAdmin sees ALL; Sales Person sees ONLY their branch) ──
const cityAllocations = computed(() => {
  const targetCities = authStore.isSuperAdmin
    ? ['Lahore', 'Multan', 'Karachi', 'Islamabad', 'Peshawar']
    : [authStore.userBranch || 'Lahore']

  return targetCities.map(cityName => {
    const citySerials = dataStore.serials.filter(s => (s.allocationCity || 'Peshawar') === cityName && s.status === 'Available')
    const cityProductIds = new Set(citySerials.map(s => s.productId))
    const cityProds = dataStore.products.filter(p => 
      cityProductIds.has(p.id) || 
      (Array.isArray(p.allocationCities) && p.allocationCities.includes(cityName)) ||
      (p.allocationCity && p.allocationCity.includes(cityName))
    )
    const stockQty = citySerials.length || (dataStore.serials.length === 0 ? cityProds.reduce((acc, p) => acc + (p.stockQty || 0), 0) : 0)
    const costValuation = citySerials.reduce((acc, s) => {
      const p = dataStore.products.find(x => x.id === s.productId || x.sku === s.sku)
      return acc + (p ? (p.costPrice || 0) : 0)
    }, 0)
    const retailValuation = citySerials.reduce((acc, s) => {
      const p = dataStore.products.find(x => x.id === s.productId || x.sku === s.sku)
      return acc + (p ? (p.sellingPrice || p.salePrice || 0) : 0)
    }, 0)

    const todayStr = new Date().toISOString().substring(0, 10)
    const todayBranchInvoices = dataStore.salesInvoices.filter(i => (i.branch || 'Peshawar') === cityName && (i.saleDate || '').substring(0, 10) === todayStr)
    const todaySales = todayBranchInvoices.reduce((acc, inv) => acc + (inv.grandTotal || inv.subtotal || 0), 0)
    const todayInvoices = todayBranchInvoices.length

    return {
      name:            cityName,
      skus:            cityProds.length,
      stockQty,
      costValuation,
      retailValuation,
      todaySales,
      todayInvoices
    }
  })
})

// ── Filtered & Sorted product list ─────────────────────────────
function getAvailableSerials(productId, city = 'ALL') {
  const targetCity = (city === 'ALL' && !authStore.isSuperAdmin) ? (authStore.userBranch || 'Lahore') : city
  return (dataStore.serials || []).filter(s => {
    const isProdMatch = s.productId === productId || s.sku === productId
    if (!isProdMatch) return false
    if (s.status !== 'Available') return false
    if (targetCity === 'ALL') return true
    const sCity = String(s.allocationCity || s.currentBranch || s.branch || '').toLowerCase()
    return sCity.includes(targetCity.toLowerCase()) || targetCity.toLowerCase().includes(sCity)
  }).length
}

const filteredCityProducts = computed(() => {
  const activeCity = authStore.isSuperAdmin ? activeCityFilter.value : (authStore.userBranch || 'Lahore')
  if (activeCity === 'ALL') return dataStore.products || []
  
  const activeLower = activeCity.toLowerCase()
  return (dataStore.products || []).filter(p => {
    // 1. Check available serials in this city depot
    const availCount = getAvailableSerials(p.id, activeCity)
    if (availCount > 0) return true

    // 2. City allocations dictionary breakdown
    if (p.cityQuantities && p.cityQuantities[activeCity] > 0) return true
    if (p.cityAllocations && p.cityAllocations[activeCity] > 0) return true

    // 3. Fallback: single city allocation
    const allocStr = String(p.allocationCity || '').toLowerCase()
    const allocList = Array.isArray(p.allocationCities) ? p.allocationCities.map(c => String(c).toLowerCase()) : []
    const isMatched = allocStr.includes(activeLower) || allocList.some(c => c.includes(activeLower))
    if (isMatched && (p.stockQty || 0) > 0) {
      const allProdSerials = (dataStore.serials || []).filter(s => (s.productId === p.id || s.sku === p.sku) && s.status === 'Available')
      if (allProdSerials.length === 0) return true
      return allProdSerials.some(s => {
        const sc = String(s.allocationCity || s.currentBranch || s.branch || '').toLowerCase()
        return sc.includes(activeLower) || activeLower.includes(sc)
      })
    }
    return false
  })
})

const sortedCityProducts = computed(() => {
  let list = [...filteredCityProducts.value]

  if (productSearchQuery.value.trim()) {
    const q = productSearchQuery.value.toLowerCase().trim()
    list = list.filter(p => 
      (p.name || '').toLowerCase().includes(q) || 
      (p.sku || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    )
  }

  list.sort((a, b) => {
    let aVal = a[productSortKey.value]
    let bVal = b[productSortKey.value]

    if (productSortKey.value === 'sellingPrice') {
      aVal = Number(a.sellingPrice || a.salePrice || 0)
      bVal = Number(b.sellingPrice || b.salePrice || 0)
    } else if (productSortKey.value === 'costPrice') {
      aVal = Number(a.costPrice || 0)
      bVal = Number(b.costPrice || 0)
    } else if (productSortKey.value === 'stockQty') {
      aVal = activeCityFilter.value === 'ALL' ? Number(a.stockQty || 0) : getAvailableSerials(a.id, activeCityFilter.value)
      bVal = activeCityFilter.value === 'ALL' ? Number(b.stockQty || 0) : getAvailableSerials(b.id, activeCityFilter.value)
    } else if (typeof aVal === 'string') {
      aVal = (aVal || '').toLowerCase()
      bVal = (bVal || '').toLowerCase()
      return productSortOrder.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    if (productSortOrder.value === 'asc') {
      return (aVal || 0) - (bVal || 0)
    } else {
      return (bVal || 0) - (aVal || 0)
    }
  })

  return list
})

function toggleCityFilter(cityName) {
  if (authStore.isSuperAdmin) {
    if (activeCityFilter.value === cityName) {
      activeCityFilter.value = 'ALL'
    } else {
      activeCityFilter.value = cityName
      uiStore.showToast(`Filtered stock to ${cityName} Depot!`, 'info')
    }
  }
}
</script>

<style scoped>
/* ── City depot grid ──────────────────────────────────────── */
.city-widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.city-widget-card {
  cursor: pointer;
  transition: var(--transition-fast);
}

.city-widget-card:hover,
.active-city-card {
  border-color: var(--primary);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

/* ── Product image thumbnail ──────────────────────────────── */
.thumb-mini {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

/* ── Responsive adjustments ───────────────────────────────── */
@media (max-width: 480px) {
  .city-widget-grid { grid-template-columns: 1fr; }
}

/* ── Dashboard Catalog Toolbar ────────────────────────────── */
.dash-catalog-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  margin-bottom: 0.85rem;
  background: rgba(17, 24, 39, 0.4);
  border: 1px solid var(--border-line);
  border-radius: var(--radius-md);
}

.dash-sort-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.dash-select-box {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 2.15rem;
  padding: 0 0.5rem 0 0.65rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: var(--transition-fast);
}

.dash-select-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow);
}

.dash-select {
  width: auto !important;
  height: 100% !important;
  min-height: auto !important;
  padding: 0 1.25rem 0 0 !important;
  border: none !important;
  background: transparent !important;
  font-size: 0.825rem !important;
  font-weight: 600 !important;
  color: var(--text-main) !important;
  cursor: pointer !important;
  outline: none !important;
  box-shadow: none !important;
}

.dash-toggle-group {
  display: inline-flex;
  align-items: center;
  height: 2.15rem;
  padding: 2px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.dash-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.6rem;
  height: calc(2.15rem - 4px);
  border: none;
  background: transparent;
  font-size: 0.775rem;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: calc(var(--radius-md) - 2px);
  cursor: pointer;
  transition: var(--transition-fast);
}

.dash-toggle-btn:hover {
  color: var(--text-main);
}

.dash-toggle-btn.active {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dash-search-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dash-search-input {
  width: 12rem !important;
  height: 2.15rem !important;
  min-height: 2.15rem !important;
  padding: 0 0.5rem 0 1.85rem !important;
  font-size: 0.8rem !important;
  background: var(--bg-input) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-main) !important;
  transition: var(--transition-fast);
}

.dash-search-input:focus {
  border-color: var(--primary) !important;
  outline: none !important;
  box-shadow: 0 0 0 2px var(--primary-glow) !important;
}

@media (max-width: 640px) {
  .dash-catalog-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
  }
  .dash-sort-group {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .dash-search-group {
    width: 100%;
  }
  .dash-search-group .relative {
    flex: 1;
  }
  .dash-search-input {
    width: 100% !important;
  }
}

/* Light Mode Overrides */
[data-theme="light"] .dash-catalog-toolbar {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
}

[data-theme="light"] .dash-select-box,
[data-theme="light"] .dash-toggle-group,
[data-theme="light"] .dash-search-input {
  background: #f8fafc !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
}

[data-theme="light"] .dash-select {
  color: #0f172a !important;
}

[data-theme="light"] .dash-toggle-btn {
  color: #475569;
}

[data-theme="light"] .dash-toggle-btn.active {
  background: #4f46e5;
  color: #ffffff;
}

/* ── Sales Reps Performance Cards ─────────────────────────── */
.sales-rep-card {
  padding: 0.85rem;
  border-radius: var(--radius-lg, 0.75rem);
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.sales-rep-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.rep-avatar-wrapper {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  max-width: 38px !important;
  min-height: 38px !important;
  max-height: 38px !important;
  border-radius: 9999px !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
  border: 2px solid rgba(99, 102, 241, 0.4) !important;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.2) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: #1e1b4b;
}

.rep-avatar-img {
  width: 100% !important;
  height: 100% !important;
  min-width: 100% !important;
  min-height: 100% !important;
  object-fit: cover !important;
  border-radius: 9999px !important;
  display: block !important;
}

[data-theme="light"] .sales-rep-card {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>
