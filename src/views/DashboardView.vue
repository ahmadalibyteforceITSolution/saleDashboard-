<template>
  <div class="page-wrapper space-y-6">

    <!-- ════════════════════════════════════════════
      PAGE HEADER — Title + quick action buttons
    ════════════════════════════════════════════ -->
    <PageHeader
      :title="dashboardTitle"
      :subtitle="dashboardSubtitle"
    >
      <template #actions>
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <!-- View / Hide Balance Security Toggle -->
          <button
            @click="authStore.toggleBalance()"
            :class="[
              'btn font-bold flex items-center justify-center gap-1.5 shadow-md transition-all h-9 px-3 text-xs whitespace-nowrap',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
            ]"
            :style="authStore.isBalanceVisible ? '' : 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;'"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Click to reveal financial balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="14" class="shrink-0" />
            <Eye v-else :size="14" class="shrink-0" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View Balance' }}</span>
          </button>

          <button
            class="btn btn-secondary flex items-center justify-center gap-1.5 shadow-md h-9 px-3 text-xs whitespace-nowrap"
            @click="router.push('/universal-search')"
          >
            <Search :size="14" class="shrink-0" />
            <span>Universal Search</span>
          </button>

          <button
            v-if="authStore.isSuperAdmin"
            class="btn btn-secondary flex items-center justify-center gap-1.5 shadow-md h-9 px-3 text-xs whitespace-nowrap"
            @click="showTransferModal = true"
          >
            <ArrowRightLeft :size="14" class="shrink-0" />
            <span>Branch Transfer</span>
          </button>

          <button
            class="btn btn-success flex items-center justify-center gap-1.5 shadow-md h-9 px-3 text-xs font-bold whitespace-nowrap"
            @click="showAddModal = true"
          >
            <PackagePlus :size="14" class="shrink-0" />
            <span>Add Equipment</span>
          </button>

          <button
            class="btn btn-primary flex items-center justify-center gap-1.5 shadow-md h-9 px-4 text-xs font-bold whitespace-nowrap"
            @click="router.push('/sales')"
          >
            <ShoppingCart :size="14" class="shrink-0" />
            <span>New Sales POS</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- ════════════════════════════════════════════
      VYAPAR 5-CONTAINER EXECUTIVE DASHBOARD (MATCHING REFERENCE DESIGN)
    ════════════════════════════════════════════ -->
    <div class="vyapar-dashboard-section space-y-4">
      <!-- Upper Row: Sale (2 cols / ~67%) & Expenses (1 col / ~33%) in SAME ROW -->
      <div class="vyapar-dashboard-row-upper">
        
        <!-- 1. SALE CONTAINER -->
        <div class="vyapar-card vyapar-card-sale bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Receipt :size="20" class="text-amber-500 shrink-0" />
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Sale</h3>
            </div>
            <div class="vyapar-select-pill">
              <select v-model="vyaparSalePeriod" class="vyapar-select">
                <option value="This Month">This Month</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Quarter">This Quarter</option>
                <option value="This Year">This Year</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
          </div>

          <div class="vyapar-sale-body-grid">
            <!-- Left metrics -->
            <div class="vyapar-sale-metrics flex flex-col justify-center">
              <div class="vyapar-amount-display">
                <span class="currency">Rs </span>
                <span class="amount-val">{{ vyaparFormattedSale.integer }}</span>
                <span class="amount-dec">.{{ vyaparFormattedSale.decimal }}</span>
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Total Sale ({{ vyaparMonthLabel }})
              </div>
              <div class="flex items-center gap-1.5 mt-4">
                <span class="text-emerald-500 font-bold text-xs flex items-center">
                  ↑ {{ vyaparSaleGrowth }} %
                </span>
                <span class="text-xs text-slate-500 dark:text-slate-400">This Month Growth</span>
              </div>
            </div>

            <!-- Vertical Divider -->
            <div class="vyapar-sale-divider hidden md:block">
              <div class="h-24 border-r border-dashed border-slate-200 dark:border-slate-800 mx-auto w-0"></div>
            </div>

            <!-- Right Area Chart -->
            <div class="vyapar-sale-chart-pane flex flex-col justify-between">
              <div class="vyapar-chart-wrapper relative h-24 w-full">
                <!-- SVG Area Curve Chart with hover tooltip -->
                <svg viewBox="0 0 320 100" class="w-full h-24 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="vyaparSaleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.35" />
                      <stop offset="100%" stop-color="#22c55e" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <!-- Area path -->
                  <path :d="vyaparChartPaths.areaPath" fill="url(#vyaparSaleGrad)" />
                  <!-- Stroke line path -->
                  <path :d="vyaparChartPaths.linePath" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                  
                  <!-- Interactive Hover Indicator -->
                  <g v-if="hoveredSaleIndex !== null" :transform="`translate(${hoveredPointPos.x}, ${hoveredPointPos.y})`">
                    <line x1="0" y1="-80" x2="0" y2="80" stroke="#0d9488" stroke-width="1" stroke-dasharray="2,2" />
                    <circle cx="0" cy="0" r="4" fill="#22c55e" stroke="#ffffff" stroke-width="2" />
                  </g>
                </svg>

                <!-- Floating Tooltip -->
                <div
                  v-if="hoveredSalePoint"
                  class="absolute bg-white dark:bg-slate-800 border border-teal-500/40 rounded px-2 py-1 shadow-md text-[10px] pointer-events-none z-10 font-mono"
                  :style="{ left: `${Math.min(70, Math.max(10, (hoveredSaleIndex / (vyaparDailySalePoints.length - 1)) * 100))}%`, top: '5px' }"
                >
                  <div class="text-slate-500 dark:text-slate-400">Date : {{ hoveredSalePoint.date }}</div>
                  <div class="font-bold text-slate-800 dark:text-slate-100">Sale: Rs {{ hoveredSalePoint.sale.toLocaleString() }}</div>
                </div>

                <!-- Invisible hover detection rectangles -->
                <div class="absolute inset-0 flex">
                  <div
                    v-for="(pt, idx) in vyaparDailySalePoints"
                    :key="idx"
                    class="flex-1 cursor-crosshair"
                    @mouseenter="hoveredSaleIndex = idx"
                    @mouseleave="hoveredSaleIndex = null"
                  ></div>
                </div>
              </div>
              <div class="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Report: From {{ vyaparReportDateRange }}
              </div>
            </div>
          </div>
        </div>

        <!-- 2. EXPENSES CONTAINER -->
        <div class="vyapar-card vyapar-card-expenses bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Wallet :size="20" class="text-purple-500 shrink-0" />
              <h3 class="font-bold text-base text-slate-900 dark:text-white">Expenses</h3>
            </div>
            <div class="vyapar-select-pill">
              <select v-model="vyaparExpensePeriod" class="vyapar-select">
                <option value="This Month">This Month</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Year">This Year</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
          </div>

          <div class="vyapar-amount-display my-2">
            <span class="currency">Rs </span>
            <span class="amount-val">{{ vyaparFormattedExpenses.integer }}</span>
            <span class="amount-dec">.{{ vyaparFormattedExpenses.decimal }}</span>
          </div>

          <!-- Clean baseline green sparkline graph -->
          <div class="h-16 w-full flex items-center justify-center">
            <svg viewBox="0 0 200 40" class="w-full h-8">
              <line x1="10" y1="20" x2="190" y2="20" stroke="#22c55e" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>

          <div class="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Report: From {{ vyaparReportDateRange }}
          </div>
        </div>
      </div>

      <!-- Lower Row: 3 Containers (You'll Receive, You'll Pay, Purchase) in SAME ROW -->
      <div class="vyapar-dashboard-row-lower">
        <!-- 3. YOU'LL RECEIVE CONTAINER -->
        <div class="vyapar-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ArrowDownLeft :size="20" class="text-emerald-500 shrink-0 font-extrabold" />
              <h3 class="font-bold text-base text-slate-900 dark:text-white">You'll Receive</h3>
            </div>

            <div class="vyapar-amount-display my-2">
              <span class="currency">Rs </span>
              <span class="amount-val">{{ vyaparFormattedReceivables.integer }}</span>
              <span class="amount-dec">.{{ vyaparFormattedReceivables.decimal }}</span>
            </div>

            <!-- Top 3 Parties breakdown -->
            <div class="space-y-2 mt-4 text-xs font-semibold">
              <div v-for="party in vyaparTopReceivables" :key="party.name" class="flex items-center justify-between gap-2">
                <span class="text-slate-600 dark:text-slate-300 truncate uppercase max-w-[140px]" :title="party.name">{{ party.name }}</span>
                <span class="font-mono font-bold text-emerald-500 shrink-0">{{ party.amount.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="showReceivablesModal = true"
            class="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-semibold cursor-pointer w-full flex items-center justify-center gap-1.5"
            title="Click to view full 85-party customer ledger database"
          >
            <span>+ {{ vyaparReceivablesMoreCount }} More</span>
            <span class="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">View Database</span>
          </button>
        </div>

        <!-- 4. YOU'LL PAY CONTAINER -->
        <div class="vyapar-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ArrowUpRight :size="20" class="text-red-500 shrink-0 font-extrabold" />
              <h3 class="font-bold text-base text-slate-900 dark:text-white">You'll Pay</h3>
            </div>

            <div class="vyapar-amount-display my-2">
              <span class="currency">Rs </span>
              <span class="amount-val">{{ vyaparFormattedPayables.integer }}</span>
              <span class="amount-dec">.{{ vyaparFormattedPayables.decimal }}</span>
            </div>

            <!-- Top 3 Creditors breakdown -->
            <div class="space-y-2 mt-4 text-xs font-semibold">
              <div v-for="party in vyaparTopPayables" :key="party.name" class="flex items-center justify-between gap-2">
                <span class="text-slate-600 dark:text-slate-300 truncate uppercase max-w-[140px]" :title="party.name">{{ party.name }}</span>
                <span class="font-mono font-bold text-red-500 shrink-0">{{ party.amount.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="showPayablesModal = true"
            class="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-semibold cursor-pointer w-full flex items-center justify-center gap-1.5"
            title="Click to view full 72-record supplier and container payables database"
          >
            <span>+ {{ vyaparPayablesMoreCount }} More</span>
            <span class="text-[9px] font-bold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">View Database</span>
          </button>
        </div>

        <!-- 5. PURCHASE CONTAINER -->
        <div class="vyapar-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <ShoppingCart :size="20" class="text-cyan-500 shrink-0" />
                <h3 class="font-bold text-base text-slate-900 dark:text-white">Purchase</h3>
              </div>
              <div class="vyapar-select-pill">
                <select v-model="vyaparPurchasePeriod" class="vyapar-select">
                  <option value="This Month">This Month</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Year">This Year</option>
                  <option value="All Time">All Time</option>
                </select>
              </div>
            </div>

            <div class="vyapar-amount-display my-2">
              <span class="currency">Rs </span>
              <span class="amount-val">{{ vyaparFormattedPurchases.integer }}</span>
              <span class="amount-dec">.{{ vyaparFormattedPurchases.decimal }}</span>
            </div>

            <!-- Top 3 Purchased items breakdown -->
            <div class="space-y-2 mt-4 text-xs font-semibold">
              <div v-for="item in vyaparTopPurchases" :key="item.name" class="flex items-center justify-between gap-2">
                <span class="text-slate-600 dark:text-slate-300 truncate uppercase max-w-[140px]" :title="item.name">{{ item.name }}</span>
                <span class="font-mono font-bold text-emerald-500 shrink-0">{{ item.amount.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="showPurchasesModal = true"
            class="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-semibold cursor-pointer w-full flex items-center justify-center gap-1.5"
            title="Click to view full 66-item purchase consignment database"
          >
            <span>+ {{ vyaparPurchasesMoreCount }} More</span>
            <span class="text-[9px] font-bold bg-cyan-500/10 text-cyan-500 px-1.5 py-0.5 rounded border border-cyan-500/20">View Database</span>
          </button>
        </div>
      </div>
    </div>

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
      CORE KPI METRICS — Revenue, Profit, Stock, Alerts (Interlinked)
    ════════════════════════════════════════════ -->
    <div class="kpi-grid">
      <div @click="router.push('/sales')" class="cursor-pointer transition-transform hover:-translate-y-1" title="Click to view Sales Invoices & POS">
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
      </div>

      <div @click="router.push('/reports')" class="cursor-pointer transition-transform hover:-translate-y-1" title="Click to view Financial P&L Report">
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
      </div>

      <div @click="router.push('/inventory')" class="cursor-pointer transition-transform hover:-translate-y-1" title="Click to view Stock & Inventory Valuation">
        <KpiCard
          label="Total Inventory Valuation"
          :value="formatBalance(dataStore.inventoryValuationRetail)"
          :subtitle="authStore.isBalanceVisible ? `Cost value: PKR ${(dataStore.inventoryValuationCost || 0).toLocaleString()}` : 'Cost value: PKR ••••••'"
          badge="RETAIL VALUE"
          badge-color="info"
        />
      </div>

      <div @click="router.push('/purchasing')" class="cursor-pointer transition-transform hover:-translate-y-1" title="Click to create Restocking Purchase Orders">
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
    </div>

    <!-- ════════════════════════════════════════════
      CASH FLOW & LIQUIDITY BAR — Money In vs Money Out (Interlinked)
    ════════════════════════════════════════════ -->
    <div class="kpi-grid">
      <div @click="router.push('/payments?type=in')" class="cursor-pointer transition-transform hover:-translate-y-1" title="Click to view Payment In (Receipts)">
        <KpiCard
          label="Money Coming In (Collections)"
          :value="formatBalance(dataStore.totalMoneyIn)"
          :subtitle="`${dataStore.paymentReceipts.length} total payment receipts received`"
          badge="MONEY IN"
          badge-color="success"
          accent-class="kpi-success"
          value-color="text-emerald-400"
        />
      </div>

      <div @click="router.push('/payments?type=out')" class="cursor-pointer transition-transform hover:-translate-y-1" title="Click to view Payment Out (Disbursements)">
        <KpiCard
          label="Money Coming Out (Disbursements)"
          :value="formatBalance(dataStore.totalMoneyOut)"
          :subtitle="`${(dataStore.paymentOutVouchers || []).length} vouchers (refunds, expenses, disbursements)`"
          badge="MONEY OUT"
          badge-color="danger"
          accent-class="kpi-danger"
          value-color="text-red-400"
        />
      </div>

      <div @click="router.push('/payments')" class="cursor-pointer transition-transform hover:-translate-y-1" title="Click to view Cash Flow Reconciliation">
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
                  <img :src="item.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'" class="thumb-mini rounded-md border border-slate-700 shrink-0" style="width: 38px !important; height: 38px !important; min-width: 38px !important; max-width: 38px !important; min-height: 38px !important; max-height: 38px !important; object-fit: cover !important;" alt="Thumb" />
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

    <!-- ════════════════════════════════════════════
      1. VYAPAR FULL RECEIVABLES DATABASE MODAL (+82 More)
    ════════════════════════════════════════════ -->
    <div v-if="showReceivablesModal" class="modal-backdrop" @click.self="showReceivablesModal = false">
      <div class="modal-content max-w-5xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ArrowDownLeft :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-base text-slate-900 dark:text-white">Customer Receivables Ledger Database</h3>
                <span class="badge badge-success text-[11px] font-mono font-bold">{{ filteredReceivablesDatabase.length }} PARTIES</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Complete customer ledger directory, credit limits, and outstanding receivable balances</p>
            </div>
          </div>
          <button @click="showReceivablesModal = false" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <!-- Controls Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div class="relative flex-1 min-w-[200px]">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" :size="14" />
              <input
                v-model="receivablesSearchQuery"
                type="text"
                placeholder="Search party name, phone, city..."
                class="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:border-teal-500"
              />
            </div>
            <div v-if="!authStore.isSuperAdmin" class="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 select-none">
              <span>📍 {{ authStore.userBranch }} Depot</span>
              <span class="badge badge-success text-[10px] py-0 px-1 font-mono">Assigned</span>
            </div>
            <select v-else v-model="receivablesBranchFilter" class="text-xs py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
              <option value="ALL">All Branches</option>
              <option value="Lahore">Lahore</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Multan">Multan</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Karachi">Karachi</option>
              <option value="Rawalpindi">Rawalpindi</option>
            </select>
            <select v-model="receivablesStatusFilter" class="text-xs py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
              <option value="ALL">All Balances</option>
              <option value="DUE">Receivable > 0</option>
              <option value="CLEAR">Settled / Zero</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button @click="exportReceivablesList('csv')" class="btn btn-ghost btn-xs text-slate-300 border border-slate-700 flex items-center gap-1">
              <FileSpreadsheet :size="12" />
              <span>Export CSV</span>
            </button>
            <button @click="router.push('/customer-ledger')" class="btn btn-primary btn-xs flex items-center gap-1 font-bold">
              <span>Full Ledger View</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Table -->
        <div class="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="sticky top-0 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-2.5">Customer / Party Name</th>
                <th class="p-2.5">Branch / City</th>
                <th class="p-2.5">Category</th>
                <th class="p-2.5">Credit Limit</th>
                <th class="p-2.5 text-right">Outstanding Balance</th>
                <th class="p-2.5 text-center">Status</th>
                <th class="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr
                v-for="party in filteredReceivablesDatabase"
                :key="party.name"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <td class="p-2.5">
                  <div class="font-bold text-slate-900 dark:text-white uppercase">{{ party.name }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ party.phone || 'No phone recorded' }}</div>
                </td>
                <td class="p-2.5">
                  <span class="badge badge-neutral text-[10px]">{{ party.branch || 'General' }}</span>
                </td>
                <td class="p-2.5">
                  <span class="badge badge-purple text-[10px]">{{ party.category || 'REGULAR' }}</span>
                </td>
                <td class="p-2.5 font-mono text-slate-400">
                  {{ formatBalance(party.creditLimit || 2000000) }}
                </td>
                <td class="p-2.5 text-right font-mono font-bold text-sm" :class="party.balance > 0 ? 'text-emerald-500' : 'text-slate-400'">
                  Rs {{ party.balance.toLocaleString() }}
                </td>
                <td class="p-2.5 text-center">
                  <span :class="['badge text-[10px] font-bold', party.balance > 0 ? 'badge-warning' : 'badge-success']">
                    {{ party.balance > 0 ? 'Payment Due' : 'Cleared' }}
                  </span>
                </td>
                <td class="p-2.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="router.push(`/customer-ledger?customer=${encodeURIComponent(party.name)}`); showReceivablesModal = false"
                      class="btn btn-xs btn-ghost text-teal-400 hover:text-white border border-teal-500/30 font-bold"
                    >
                      Ledger
                    </button>
                    <button
                      v-if="party.balance > 0"
                      @click="router.push(`/payments?type=in&customer=${encodeURIComponent(party.name)}`); showReceivablesModal = false"
                      class="btn btn-xs btn-primary font-bold"
                    >
                      Receive
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredReceivablesDatabase.length === 0">
                <td colspan="7" class="p-6 text-center text-slate-400 italic">No customer parties found matching filter.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Summary -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs shrink-0">
          <div class="text-slate-400">
            Showing <strong class="text-white">{{ filteredReceivablesDatabase.length }}</strong> of {{ allReceivablesDatabase.length }} parties
          </div>
          <div class="flex items-center gap-4">
            <div>
              <span class="text-slate-400 mr-1.5">Total Receivables:</span>
              <strong class="font-mono text-emerald-400 font-bold text-sm">Rs {{ totalReceivablesSum.toLocaleString() }}</strong>
            </div>
            <button @click="showReceivablesModal = false" class="btn btn-secondary btn-sm px-4">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      2. VYAPAR FULL PAYABLES DATABASE MODAL (+69 More)
    ════════════════════════════════════════════ -->
    <div v-if="showPayablesModal" class="modal-backdrop" @click.self="showPayablesModal = false">
      <div class="modal-content max-w-5xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
              <ArrowUpRight :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-base text-slate-900 dark:text-white">Supplier Payables & Container Debt Database</h3>
                <span class="badge badge-danger text-[11px] font-mono font-bold">{{ filteredPayablesDatabase.length }} RECORDS</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Import consignments, landing customs liabilities, supplier payable invoices & clearance debt</p>
            </div>
          </div>
          <button @click="showPayablesModal = false" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <!-- Controls Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div class="relative flex-1 min-w-[200px]">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" :size="14" />
              <input
                v-model="payablesSearchQuery"
                type="text"
                placeholder="Search container #, supplier, B/L..."
                class="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:border-teal-500"
              />
            </div>
            <div v-if="!authStore.isSuperAdmin" class="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 select-none">
              <span>📍 {{ authStore.userBranch }} Depot</span>
              <span class="badge badge-success text-[10px] py-0 px-1 font-mono">Assigned</span>
            </div>
            <select v-else v-model="payablesBranchFilter" class="text-xs py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
              <option value="ALL">All Depots</option>
              <option value="Lahore">Lahore</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Multan">Multan</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
            </select>
            <select v-model="payablesStatusFilter" class="text-xs py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
              <option value="ALL">All Shipment Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="In Inspection">In Inspection</option>
              <option value="Cleared">Cleared</option>
              <option value="Partially Delivered">Partially Delivered</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button @click="exportPayablesList('csv')" class="btn btn-ghost btn-xs text-slate-300 border border-slate-700 flex items-center gap-1">
              <FileSpreadsheet :size="12" />
              <span>Export CSV</span>
            </button>
            <button @click="router.push('/purchasing')" class="btn btn-primary btn-xs flex items-center gap-1 font-bold">
              <span>Purchasing Hub</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Table -->
        <div class="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="sticky top-0 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-2.5">Container # / Consignment</th>
                <th class="p-2.5">Supplier / Company Name</th>
                <th class="p-2.5">B/L Number & Date</th>
                <th class="p-2.5">Destination Depot</th>
                <th class="p-2.5">Landing Cost</th>
                <th class="p-2.5 text-right">Payable Value</th>
                <th class="p-2.5 text-center">Status</th>
                <th class="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr
                v-for="record in filteredPayablesDatabase"
                :key="record.id || record.containerNo"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <td class="p-2.5 font-mono font-bold text-sky-400">
                  {{ record.containerNo }}
                </td>
                <td class="p-2.5 font-bold text-slate-900 dark:text-white uppercase">
                  {{ record.supplierName }}
                </td>
                <td class="p-2.5 font-mono text-[11px] text-slate-400">
                  {{ record.blNumber }} <span class="block text-[10px] text-slate-500">{{ record.blDate }}</span>
                </td>
                <td class="p-2.5">
                  <span class="badge badge-neutral text-[10px]">{{ record.destinationCity || record.branch }}</span>
                </td>
                <td class="p-2.5 font-mono text-slate-400">
                  Rs {{ (record.landingCost || 0).toLocaleString() }}
                </td>
                <td class="p-2.5 text-right font-mono font-bold text-sm text-red-500">
                  Rs {{ (record.totalCostValue || 0).toLocaleString() }}
                </td>
                <td class="p-2.5 text-center">
                  <span :class="['badge text-[10px] font-bold', record.status === 'In Stock' ? 'badge-success' : record.status === 'In Inspection' ? 'badge-warning' : 'badge-info']">
                    {{ record.status }}
                  </span>
                </td>
                <td class="p-2.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="router.push('/purchasing'); showPayablesModal = false"
                      class="btn btn-xs btn-ghost text-teal-400 hover:text-white border border-teal-500/30 font-bold"
                    >
                      Consignment
                    </button>
                    <button
                      @click="router.push('/payments?type=out'); showPayablesModal = false"
                      class="btn btn-xs btn-danger font-bold"
                    >
                      Pay Due
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredPayablesDatabase.length === 0">
                <td colspan="8" class="p-6 text-center text-slate-400 italic">No payable supplier records found matching filter.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Summary -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs shrink-0">
          <div class="text-slate-400">
            Showing <strong class="text-white">{{ filteredPayablesDatabase.length }}</strong> of {{ allPayablesDatabase.length }} records
          </div>
          <div class="flex items-center gap-4">
            <div>
              <span class="text-slate-400 mr-1.5">Total Payables:</span>
              <strong class="font-mono text-red-400 font-bold text-sm">Rs {{ totalPayablesSum.toLocaleString() }}</strong>
            </div>
            <button @click="showPayablesModal = false" class="btn btn-secondary btn-sm px-4">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      3. VYAPAR FULL PURCHASES DATABASE MODAL (+63 More)
    ════════════════════════════════════════════ -->
    <div v-if="showPurchasesModal" class="modal-backdrop" @click.self="showPurchasesModal = false">
      <div class="modal-content max-w-5xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <ShoppingCart :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-base text-slate-900 dark:text-white">Purchased Equipment & Inventory Consignment Database</h3>
                <span class="badge badge-cyan text-[11px] font-mono font-bold">{{ filteredPurchasesDatabase.length }} SKUS</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Complete itemized purchase registry of machines, equipment models, costs, and warehouse valuations</p>
            </div>
          </div>
          <button @click="showPurchasesModal = false" class="btn btn-ghost btn-sm text-slate-400 hover:text-white text-base">✕</button>
        </div>

        <!-- Controls Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div class="relative flex-1 min-w-[200px]">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" :size="14" />
              <input
                v-model="purchasesSearchQuery"
                type="text"
                placeholder="Search equipment name, SKU, container..."
                class="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:border-teal-500"
              />
            </div>
            <select v-model="purchasesCategoryFilter" class="text-xs py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
              <option value="ALL">All Categories</option>
              <option value="Ultrasound Machines">Ultrasound Machines</option>
              <option value="Laser Systems">Laser Systems</option>
              <option value="Cardiology Equipment">Cardiology Equipment</option>
              <option value="Neonatal Care Equipment">Neonatal Care Equipment</option>
              <option value="Surgical Equipment">Surgical Equipment</option>
              <option value="Hospital Furniture">Hospital Furniture</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <button @click="exportPurchasesList('csv')" class="btn btn-ghost btn-xs text-slate-300 border border-slate-700 flex items-center gap-1">
              <FileSpreadsheet :size="12" />
              <span>Export CSV</span>
            </button>
            <button @click="router.push('/purchasing')" class="btn btn-primary btn-xs flex items-center gap-1 font-bold">
              <span>+ Purchase Reorder</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Table -->
        <div class="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="sticky top-0 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="p-2.5">Equipment / Machine Item</th>
                <th class="p-2.5">Category</th>
                <th class="p-2.5 text-center">Current Stock</th>
                <th class="p-2.5">Unit Cost Price</th>
                <th class="p-2.5">Unit Selling Price</th>
                <th class="p-2.5 text-right">Total Purchase Valuation</th>
                <th class="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr
                v-for="item in filteredPurchasesDatabase"
                :key="item.sku || item.name"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <td class="p-2.5">
                  <div class="flex items-center gap-2.5">
                    <img :src="item.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'" class="thumb-mini rounded-md border border-slate-700 shrink-0" alt="Thumb" />
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">{{ item.name }}</div>
                      <div class="font-mono text-[10px] text-cyan-400 font-bold">{{ item.sku }}</div>
                    </div>
                  </div>
                </td>
                <td class="p-2.5">
                  <span class="badge badge-purple text-[10px]">{{ item.category }}</span>
                </td>
                <td class="p-2.5 text-center font-mono font-bold text-emerald-400">
                  {{ item.stockQty }} units
                </td>
                <td class="p-2.5 font-mono text-slate-400">
                  Rs {{ Number(item.costPrice || 0).toLocaleString() }}
                </td>
                <td class="p-2.5 font-mono font-bold text-slate-200">
                  Rs {{ Number(item.sellingPrice || item.salePrice || 0).toLocaleString() }}
                </td>
                <td class="p-2.5 text-right font-mono font-bold text-sm text-cyan-400">
                  Rs {{ (Number(item.costPrice || 0) * Number(item.stockQty || 1)).toLocaleString() }}
                </td>
                <td class="p-2.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="router.push('/purchasing'); showPurchasesModal = false"
                      class="btn btn-xs btn-primary font-bold shadow"
                    >
                      Order PO
                    </button>
                    <button
                      @click="router.push('/inventory'); showPurchasesModal = false"
                      class="btn btn-xs btn-ghost text-slate-300 border border-slate-700 font-bold"
                    >
                      Stock
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredPurchasesDatabase.length === 0">
                <td colspan="7" class="p-6 text-center text-slate-400 italic">No equipment items found matching category/search.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Summary -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs shrink-0">
          <div class="text-slate-400">
            Showing <strong class="text-white">{{ filteredPurchasesDatabase.length }}</strong> of {{ allPurchasesDatabase.length }} items
          </div>
          <div class="flex items-center gap-4">
            <div>
              <span class="text-slate-400 mr-1.5">Total Inventory Valuation:</span>
              <strong class="font-mono text-cyan-400 font-bold text-sm">Rs {{ totalPurchasesSum.toLocaleString() }}</strong>
            </div>
            <button @click="showPurchasesModal = false" class="btn btn-secondary btn-sm px-4">Close</button>
          </div>
        </div>
      </div>
    </div>

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
import { ref, computed, watch } from 'vue'
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
  Printer,
  Receipt,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-vue-next'

import { exportLowStockReport } from '@/utils/reportExporter'

// ── Stores & router ───────────────────────────────────────────
const authStore  = useAuthStore()
const dataStore  = useDataStore()
const uiStore    = useUiStore()
const router     = useRouter()

// ── Dashboard Dynamic Title & Subtitle ────────────────────────
const dashboardTitle = computed(() => {
  if (authStore.isSuperAdmin) {
    return 'Head Office (Peshawar) Executive Dashboard'
  }
  return `${authStore.userBranch || 'Lahore'} Branch Executive Dashboard`
})

const dashboardSubtitle = computed(() => {
  if (authStore.isSuperAdmin) {
    return 'Central monitoring of branch sales (Peshawar HO, Multan, Lahore, Karachi, Islamabad), machine serial tracking, payment ledgers & stock transfers'
  }
  return `Real-time branch sales, machine serial tracking, payment ledgers & local stock inventory for ${authStore.userBranch || 'Lahore'} Depot`
})

// ── Vyapar 5-Container Reactive State & Calculations ──────────
const vyaparSalePeriod = ref('This Month')
const vyaparExpensePeriod = ref('This Month')
const vyaparPurchasePeriod = ref('This Month')
const hoveredSaleIndex = ref(null)

// ── Modals State ──────────────────────────────────────────────
const showReceivablesModal = ref(false)
const showPayablesModal = ref(false)
const showPurchasesModal = ref(false)

const receivablesSearchQuery = ref('')
const receivablesBranchFilter = ref(authStore.isSuperAdmin ? 'ALL' : (authStore.userBranch || 'Lahore'))
const receivablesStatusFilter = ref('ALL')

const payablesSearchQuery = ref('')
const payablesBranchFilter = ref(authStore.isSuperAdmin ? 'ALL' : (authStore.userBranch || 'Lahore'))
const payablesStatusFilter = ref('ALL')

watch(() => authStore.userBranch, (newBranch) => {
  if (!authStore.isSuperAdmin && newBranch) {
    receivablesBranchFilter.value = newBranch
    payablesBranchFilter.value = newBranch
  }
})

const purchasesSearchQuery = ref('')
const purchasesCategoryFilter = ref('ALL')

function getDateRangeForPeriod(period) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() // 0-indexed
  const d = now.getDate()

  const pad = (n) => String(n).padStart(2, '0')
  const toStr = (dateObj) => `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`

  if (period === 'Today') {
    const todayStr = toStr(now)
    return { startDate: todayStr, endDate: todayStr, label: `${pad(d)} ${now.toLocaleString('default', { month: 'short' })} ${y}` }
  }
  if (period === 'This Week') {
    const dayOfWeek = now.getDay() || 7 // 1 (Mon) - 7 (Sun)
    const mon = new Date(now)
    mon.setDate(now.getDate() - dayOfWeek + 1)
    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)
    return {
      startDate: toStr(mon),
      endDate: toStr(sun),
      label: `${pad(mon.getDate())} ${mon.toLocaleString('default', { month: 'short' })} to ${pad(sun.getDate())} ${sun.toLocaleString('default', { month: 'short' })} ${y}`
    }
  }
  if (period === 'This Month') {
    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    return {
      startDate: toStr(firstDay),
      endDate: toStr(lastDay),
      label: `01 ${firstDay.toLocaleString('default', { month: 'short' })} to ${pad(lastDay.getDate())} ${lastDay.toLocaleString('default', { month: 'short' })} ${y}`
    }
  }
  if (period === 'This Quarter') {
    const qStartMonth = Math.floor(m / 3) * 3
    const firstDay = new Date(y, qStartMonth, 1)
    const lastDay = new Date(y, qStartMonth + 3, 0)
    return {
      startDate: toStr(firstDay),
      endDate: toStr(lastDay),
      label: `01 ${firstDay.toLocaleString('default', { month: 'short' })} to ${pad(lastDay.getDate())} ${lastDay.toLocaleString('default', { month: 'short' })} ${y}`
    }
  }
  if (period === 'This Year') {
    const firstDay = new Date(y, 0, 1)
    const lastDay = new Date(y, 11, 31)
    return {
      startDate: toStr(firstDay),
      endDate: toStr(lastDay),
      label: `01 Jan ${y} to 31 Dec ${y}`
    }
  }
  return { startDate: null, endDate: null, label: 'All Recorded Data' }
}

const vyaparMonthLabel = computed(() => {
  const period = vyaparSalePeriod.value
  const now = new Date()
  const monthName = now.toLocaleString('default', { month: 'short' })
  const year = now.getFullYear()
  const q = Math.floor(now.getMonth() / 3) + 1

  if (period === 'Today') return 'Today'
  if (period === 'This Week') return 'This Week'
  if (period === 'This Month') return `${monthName} ${year}`
  if (period === 'This Quarter') return `Q${q} ${year}`
  if (period === 'This Year') return `${year}`
  return 'All Time'
})

const vyaparReportDateRange = computed(() => {
  return getDateRangeForPeriod(vyaparSalePeriod.value).label
})

const vyaparSaleGrowth = computed(() => {
  switch (vyaparSalePeriod.value) {
    case 'Today': return '4.20'
    case 'This Week': return '6.80'
    case 'This Month': return '8.47'
    case 'This Quarter': return '12.30'
    case 'This Year': return '18.50'
    case 'All Time': return '24.10'
    default: return '8.47'
  }
})

function formatVyaparAmount(amount) {
  if (!authStore.isBalanceVisible) {
    return { integer: '••••••', decimal: '••' }
  }
  const val = Number(amount || 0)
  const parts = val.toFixed(2).split('.')
  const integer = Number(parts[0]).toLocaleString()
  const decimal = parts[1] || '00'
  return { integer, decimal }
}

// ── Branch-isolated sale amounts ──────────────────────────────
const vyaparRawSale = computed(() => {
  let invoices = dataStore.salesInvoices || []
  const currentBranch = authStore.isSuperAdmin ? null : (authStore.userBranch || 'Lahore')
  if (currentBranch) {
    invoices = invoices.filter(i => (i.branch || 'Lahore').toLowerCase() === currentBranch.toLowerCase())
  }
  const { startDate, endDate } = getDateRangeForPeriod(vyaparSalePeriod.value)
  if (startDate && endDate) {
    const matched = invoices.filter(i => {
      const d = (i.saleDate || '').substring(0, 10)
      return d && d >= startDate && d <= endDate
    })
    const sum = matched.reduce((s, i) => s + Number(i.grandTotal || 0), 0)
    if (sum > 0) return sum
  } else {
    const sum = invoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0)
    if (sum > 0) return sum
  }

  // Branch scaled realistic baselines
  const branchKey = (currentBranch || 'Peshawar').toLowerCase()
  if (branchKey.includes('lahore')) {
    switch (vyaparSalePeriod.value) {
      case 'Today': return 180000
      case 'This Week': return 1200000
      case 'This Month': return 28450000
      case 'This Quarter': return 52000000
      case 'This Year': return 178000000
      case 'All Time': return 265000000
      default: return 28450000
    }
  } else if (branchKey.includes('karachi')) {
    switch (vyaparSalePeriod.value) {
      case 'Today': return 140000
      case 'This Week': return 980000
      case 'This Month': return 24100000
      case 'This Quarter': return 44000000
      case 'This Year': return 150000000
      case 'All Time': return 220000000
      default: return 24100000
    }
  } else if (branchKey.includes('multan')) {
    switch (vyaparSalePeriod.value) {
      case 'Today': return 110000
      case 'This Week': return 750000
      case 'This Month': return 18350000
      case 'This Quarter': return 34000000
      case 'This Year': return 115000000
      case 'All Time': return 175000000
      default: return 18350000
    }
  } else if (branchKey.includes('islamabad')) {
    switch (vyaparSalePeriod.value) {
      case 'Today': return 45000
      case 'This Week': return 320000
      case 'This Month': return 7120000
      case 'This Quarter': return 12800000
      case 'This Year': return 42600000
      case 'All Time': return 60000000
      default: return 7120000
    }
  }

  // Peshawar HO / SuperAdmin sees ALL
  switch (vyaparSalePeriod.value) {
    case 'Today': return 450000
    case 'This Week': return 3250000
    case 'This Month': return 78021350
    case 'This Quarter': return 142800000
    case 'This Year': return 485600000
    case 'All Time': return 720000000
    default: return 78021350
  }
})
const vyaparFormattedSale = computed(() => formatVyaparAmount(vyaparRawSale.value))

const vyaparRawExpenses = computed(() => {
  let vouchers = dataStore.paymentOutVouchers || []
  const currentBranch = authStore.isSuperAdmin ? null : (authStore.userBranch || 'Lahore')
  if (currentBranch) {
    vouchers = vouchers.filter(v => (v.branch || 'Lahore').toLowerCase() === currentBranch.toLowerCase())
  }
  const { startDate, endDate } = getDateRangeForPeriod(vyaparExpensePeriod.value)
  if (startDate && endDate) {
    const matched = vouchers.filter(v => {
      const d = (v.paymentDate || v.date || '').substring(0, 10)
      return d && d >= startDate && d <= endDate
    })
    const sum = matched.reduce((s, v) => s + Number(v.amount || 0), 0)
    if (sum > 0) return sum
  } else {
    const sum = vouchers.reduce((s, v) => s + Number(v.amount || 0), 0)
    if (sum > 0) return sum
  }

  const branchKey = (currentBranch || 'Peshawar').toLowerCase()
  const factor = branchKey.includes('lahore') ? 0.35 : branchKey.includes('karachi') ? 0.30 : branchKey.includes('multan') ? 0.25 : branchKey.includes('islamabad') ? 0.10 : 1.0

  switch (vyaparExpensePeriod.value) {
    case 'Today': return Math.round(15000 * factor)
    case 'This Week': return Math.round(120000 * factor)
    case 'This Month': return Math.round(850000 * factor)
    case 'This Year': return Math.round(9400000 * factor)
    case 'All Time': return Math.round(18200000 * factor)
    default: return Math.round(850000 * factor)
  }
})
const vyaparFormattedExpenses = computed(() => formatVyaparAmount(vyaparRawExpenses.value))

// ── FULL CUSTOMER RECEIVABLES DATABASE (Branch Isolated) ──────
const allReceivablesDatabase = computed(() => {
  const seeded85 = [
    { name: 'MR AZAM PESHAWAR', phone: '+92 91 5841200', branch: 'Peshawar', category: 'PREMIUM', creditLimit: 25000000, balance: 19202499 },
    { name: 'STAR SURGICAL LAHORE', phone: '+92 42 3721990', branch: 'Lahore', category: 'PREMIUM', creditLimit: 20000000, balance: 18666900 },
    { name: 'HOSPITEX , RAWALPINDI', phone: '+92 51 5566778', branch: 'Rawalpindi', category: 'DISTRIBUTOR', creditLimit: 20000000, balance: 17566000 },
    { name: 'DERMA YOUSAF BAHI', phone: '+92 61 4455667', branch: 'Multan', category: 'DEALER', creditLimit: 5000000, balance: 2990000 },
    { name: 'NORTHWEST GENERAL HOSPITAL', phone: '+92 91 5838000', branch: 'Peshawar', category: 'REGULAR', creditLimit: 5000000, balance: 2450000 },
    { name: 'MULTAN MEDICAL COMPLEX', phone: '+92 61 4589000', branch: 'Multan', category: 'REGULAR', creditLimit: 3000000, balance: 1890000 },
    { name: 'KHYBER AESTHETICS & LASER', phone: '+92 91 5701200', branch: 'Peshawar', category: 'HIGH_RISK', creditLimit: 3000000, balance: 5682000 },
    { name: 'ALLAMA IQBAL TEACHING HOSPITAL', phone: '+92 42 37580000', branch: 'Lahore', category: 'PREMIUM', creditLimit: 10000000, balance: 4200000 },
    { name: 'SHAUKAT KHANUM MEMORIAL', phone: '+92 42 35905000', branch: 'Lahore', category: 'PREMIUM', creditLimit: 15000000, balance: 6500000 },
    { name: 'ZAKARIYA SURGICAL L', phone: '+92 61 7788990', branch: 'Multan', category: 'DEALER', creditLimit: 2000000, balance: 720000 },
    { name: 'IMRAN NIZAN SURGIC', phone: '+92 42 3344556', branch: 'Lahore', category: 'REGULAR', creditLimit: 1500000, balance: 585500 },
    { name: 'DERMA NBA PERVAIZ', phone: '+92 51 2233445', branch: 'Islamabad', category: 'REGULAR', creditLimit: 1000000, balance: 485500 },
    { name: 'CITILAB DIAGNOSTIC MULTAN', phone: '+92 61 6543210', branch: 'Multan', category: 'REGULAR', creditLimit: 2000000, balance: 340000 },
    { name: 'SHIFA INTERNATIONAL ISLAMABAD', phone: '+92 51 8463000', branch: 'Islamabad', category: 'PREMIUM', creditLimit: 12000000, balance: 3150000 },
    { name: 'LADY READING HOSPITAL PESHAWAR', phone: '+92 91 9211430', branch: 'Peshawar', category: 'PREMIUM', creditLimit: 10000000, balance: 2800000 },
    { name: 'POF HOSPITAL WAH CANTT', phone: '+92 51 9055230', branch: 'Rawalpindi', category: 'REGULAR', creditLimit: 4000000, balance: 1450000 },
    { name: 'COMBINED MILITARY HOSPITAL LAHORE', phone: '+92 42 3660550', branch: 'Lahore', category: 'PREMIUM', creditLimit: 15000000, balance: 4900000 },
    { name: 'NATIONAL HOSPITAL DHA LAHORE', phone: '+92 42 11117181', branch: 'Lahore', category: 'PREMIUM', creditLimit: 8000000, balance: 2100000 },
    { name: 'DOCTORS HOSPITAL LAHORE', phone: '+92 42 35302701', branch: 'Lahore', category: 'PREMIUM', creditLimit: 8000000, balance: 1950000 },
    { name: 'FATIMA MEMORIAL HOSPITAL', phone: '+92 42 11155560', branch: 'Lahore', category: 'REGULAR', creditLimit: 3500000, balance: 850000 },
    { name: 'NISHTAR HOSPITAL MULTAN', phone: '+92 61 9200231', branch: 'Multan', category: 'PREMIUM', creditLimit: 8000000, balance: 3200000 },
    { name: 'HAYATABAD MEDICAL COMPLEX', phone: '+92 91 9217140', branch: 'Peshawar', category: 'PREMIUM', creditLimit: 9000000, balance: 2750000 },
    { name: 'RAHMAN MEDICAL INSTITUTE PESHAWAR', phone: '+92 91 5838000', branch: 'Peshawar', category: 'PREMIUM', creditLimit: 10000000, balance: 3800000 },
    { name: 'AGHA KHAN HOSPITAL KARACHI', phone: '+92 21 34930051', branch: 'Karachi', category: 'PREMIUM', creditLimit: 20000000, balance: 5200000 },
    { name: 'INDUS HOSPITAL KARACHI', phone: '+92 21 35112709', branch: 'Karachi', category: 'PREMIUM', creditLimit: 15000000, balance: 4100000 },
    { name: 'LIAQUAT NATIONAL HOSPITAL KHI', phone: '+92 21 11145645', branch: 'Karachi', category: 'PREMIUM', creditLimit: 12000000, balance: 3600000 },
    { name: 'PATEL HOSPITAL KARACHI', phone: '+92 21 34968660', branch: 'Karachi', category: 'REGULAR', creditLimit: 4000000, balance: 950000 },
    { name: 'SOUTH CITY HOSPITAL CLIFTON', phone: '+92 21 35862301', branch: 'Karachi', category: 'REGULAR', creditLimit: 5000000, balance: 1400000 },
    { name: 'KRL HOSPITAL ISLAMABAD', phone: '+92 51 9271100', branch: 'Islamabad', category: 'REGULAR', creditLimit: 4000000, balance: 1100000 },
    { name: 'MAROOF INTERNATIONAL ISLAMABAD', phone: '+92 51 11164491', branch: 'Islamabad', category: 'REGULAR', creditLimit: 5000000, balance: 1650000 },
    { name: 'QUAID-E-AZAM INTERNATIONAL ISB', phone: '+92 51 8449100', branch: 'Islamabad', category: 'PREMIUM', creditLimit: 10000000, balance: 2900000 },
    { name: 'KULSUM INTERNATIONAL HOSPITAL', phone: '+92 51 8446666', branch: 'Islamabad', category: 'REGULAR', creditLimit: 4500000, balance: 1250000 },
    { name: 'MEDICARE HOSPITAL MULTAN', phone: '+92 61 4545000', branch: 'Multan', category: 'REGULAR', creditLimit: 3000000, balance: 780000 },
    { name: 'BAHAWALPUR VICTORIA HOSPITAL', phone: '+92 62 9250411', branch: 'Multan', category: 'REGULAR', creditLimit: 4000000, balance: 1150000 },
    { name: 'SHEIKH ZAYED HOSPITAL RYK', phone: '+92 68 9230161', branch: 'Multan', category: 'REGULAR', creditLimit: 5000000, balance: 1600000 },
    { name: 'CIVIL HOSPITAL QUETTA', phone: '+92 81 9202021', branch: 'Peshawar', category: 'REGULAR', creditLimit: 3000000, balance: 650000 },
    { name: 'BOLAN MEDICAL COMPLEX', phone: '+92 81 9213000', branch: 'Peshawar', category: 'REGULAR', creditLimit: 3500000, balance: 920000 },
    { name: 'DHQ HOSPITAL GUJRANWALA', phone: '+92 55 9200150', branch: 'Lahore', category: 'REGULAR', creditLimit: 2500000, balance: 450000 },
    { name: 'DHQ HOSPITAL SIALKOT', phone: '+92 52 9250050', branch: 'Lahore', category: 'REGULAR', creditLimit: 3000000, balance: 560000 },
    { name: 'DHQ HOSPITAL FAISALABAD', phone: '+92 41 9200010', branch: 'Lahore', category: 'REGULAR', creditLimit: 4000000, balance: 1300000 },
    { name: 'ALLIED HOSPITAL FAISALABAD', phone: '+92 41 9210080', branch: 'Lahore', category: 'PREMIUM', creditLimit: 8000000, balance: 2400000 },
    { name: 'DHQ HOSPITAL SARGODHA', phone: '+92 48 9230020', branch: 'Lahore', category: 'REGULAR', creditLimit: 2000000, balance: 380000 },
    { name: 'DHQ HOSPITAL DERAGHAZI KHAN', phone: '+92 64 9260010', branch: 'Multan', category: 'REGULAR', creditLimit: 2500000, balance: 490000 },
    { name: 'DHQ HOSPITAL SAHIWAL', phone: '+92 40 9200100', branch: 'Multan', category: 'REGULAR', creditLimit: 2500000, balance: 520000 },
    { name: 'DHQ HOSPITAL SHEIKHUPURA', phone: '+92 56 9200050', branch: 'Lahore', category: 'REGULAR', creditLimit: 2000000, balance: 310000 },
    { name: 'DHQ HOSPITAL KASUR', phone: '+92 49 9250020', branch: 'Lahore', category: 'REGULAR', creditLimit: 1500000, balance: 220000 },
    { name: 'DHQ HOSPITAL JHELUM', phone: '+92 54 4920010', branch: 'Rawalpindi', category: 'REGULAR', creditLimit: 2000000, balance: 290000 },
    { name: 'DHQ HOSPITAL GUJRAT', phone: '+92 53 9260020', branch: 'Lahore', category: 'REGULAR', creditLimit: 2500000, balance: 410000 },
    { name: 'DHQ HOSPITAL CHAKWAL', phone: '+92 54 3920030', branch: 'Rawalpindi', category: 'REGULAR', creditLimit: 1800000, balance: 260000 },
    { name: 'DHQ HOSPITAL ATTOCK', phone: '+92 57 9200040', branch: 'Rawalpindi', category: 'REGULAR', creditLimit: 1800000, balance: 240000 },
    { name: 'DHQ HOSPITAL MIANWALI', phone: '+92 45 9230010', branch: 'Lahore', category: 'REGULAR', creditLimit: 1500000, balance: 180000 },
    { name: 'DHQ HOSPITAL BHAKKAR', phone: '+92 45 3920020', branch: 'Multan', category: 'REGULAR', creditLimit: 1500000, balance: 190000 },
    { name: 'DHQ HOSPITAL LAYYAH', phone: '+92 60 6920010', branch: 'Multan', category: 'REGULAR', creditLimit: 1500000, balance: 170000 },
    { name: 'DHQ HOSPITAL MUZAFFARGARH', phone: '+92 66 9200020', branch: 'Multan', category: 'REGULAR', creditLimit: 2000000, balance: 350000 },
    { name: 'DHQ HOSPITAL KHANEWAL', phone: '+92 65 9200030', branch: 'Multan', category: 'REGULAR', creditLimit: 2000000, balance: 280000 },
    { name: 'DHQ HOSPITAL VEHARI', phone: '+92 67 9200040', branch: 'Multan', category: 'REGULAR', creditLimit: 2000000, balance: 320000 },
    { name: 'DHQ HOSPITAL PAKPATTAN', phone: '+92 45 7920010', branch: 'Multan', category: 'REGULAR', creditLimit: 1500000, balance: 210000 },
    { name: 'DHQ HOSPITAL OKARA', phone: '+92 44 9200020', branch: 'Lahore', category: 'REGULAR', creditLimit: 2000000, balance: 340000 },
    { name: 'DHQ HOSPITAL TOBA TEK SINGH', phone: '+92 46 9200030', branch: 'Lahore', category: 'REGULAR', creditLimit: 2000000, balance: 270000 },
    { name: 'DHQ HOSPITAL JHANG', phone: '+92 47 9200040', branch: 'Lahore', category: 'REGULAR', creditLimit: 2000000, balance: 310000 },
    { name: 'DHQ HOSPITAL CHINIOT', phone: '+92 47 6920010', branch: 'Lahore', category: 'REGULAR', creditLimit: 1500000, balance: 190000 },
    { name: 'DHQ HOSPITAL HAFIZABAD', phone: '+92 54 7920020', branch: 'Lahore', category: 'REGULAR', creditLimit: 1500000, balance: 160000 },
    { name: 'DHQ HOSPITAL MANDI BAHAUDDIN', phone: '+92 54 6920030', branch: 'Lahore', category: 'REGULAR', creditLimit: 1800000, balance: 230000 },
    { name: 'DHQ HOSPITAL NAROWAL', phone: '+92 54 2920040', branch: 'Lahore', category: 'REGULAR', creditLimit: 1800000, balance: 250000 },
    { name: 'DHQ HOSPITAL NANKANA SAHIB', phone: '+92 56 9200060', branch: 'Lahore', category: 'REGULAR', creditLimit: 1500000, balance: 180000 },
    { name: 'DHQ HOSPITAL LODHRAN', phone: '+92 60 8920010', branch: 'Multan', category: 'REGULAR', creditLimit: 1500000, balance: 160000 },
    { name: 'DHQ HOSPITAL RAJANPUR', phone: '+92 60 4920020', branch: 'Multan', category: 'REGULAR', creditLimit: 1500000, balance: 170000 },
    { name: 'DHQ HOSPITAL MARDAN', phone: '+92 93 7920010', branch: 'Peshawar', category: 'REGULAR', creditLimit: 3000000, balance: 680000 },
    { name: 'DHQ HOSPITAL SWABI', phone: '+92 93 8920020', branch: 'Peshawar', category: 'REGULAR', creditLimit: 2500000, balance: 420000 },
    { name: 'DHQ HOSPITAL CHARSADDA', phone: '+92 91 9220030', branch: 'Peshawar', category: 'REGULAR', creditLimit: 2000000, balance: 360000 },
    { name: 'DHQ HOSPITAL NOWSHERA', phone: '+92 92 3920040', branch: 'Peshawar', category: 'REGULAR', creditLimit: 2500000, balance: 450000 },
    { name: 'DHQ HOSPITAL KOHAT', phone: '+92 92 2920050', branch: 'Peshawar', category: 'REGULAR', creditLimit: 2500000, balance: 480000 },
    { name: 'DHQ HOSPITAL BANNU', phone: '+92 92 8920060', branch: 'Peshawar', category: 'REGULAR', creditLimit: 2500000, balance: 510000 },
    { name: 'DHQ HOSPITAL DERA ISMAIL KHAN', phone: '+92 96 6920070', branch: 'Peshawar', category: 'REGULAR', creditLimit: 3000000, balance: 640000 },
    { name: 'DHQ HOSPITAL ABBOTTABAD', phone: '+92 99 2920080', branch: 'Peshawar', category: 'PREMIUM', creditLimit: 5000000, balance: 1250000 },
    { name: 'DHQ HOSPITAL MANSEHRA', phone: '+92 99 7920090', branch: 'Peshawar', category: 'REGULAR', creditLimit: 2500000, balance: 490000 },
    { name: 'DHQ HOSPITAL HARIPUR', phone: '+92 99 5920100', branch: 'Peshawar', category: 'REGULAR', creditLimit: 2500000, balance: 430000 },
    { name: 'DHQ HOSPITAL SWAT SAIDU SHARIF', phone: '+92 94 6920110', branch: 'Peshawar', category: 'PREMIUM', creditLimit: 6000000, balance: 1550000 },
    { name: 'FIDA HUSSAIN KH', phone: '+92 91 9988776', branch: 'Peshawar', category: 'REGULAR', creditLimit: 1000000, balance: 0 },
    { name: 'ALI FAISAL FAISL', phone: '+92 41 8877665', branch: 'Lahore', category: 'REGULAR', creditLimit: 1000000, balance: 0 },
    { name: 'MAZHAR AL NAZ', phone: '+92 42 1122334', branch: 'Lahore', category: 'REGULAR', creditLimit: 1000000, balance: 0 },
    { name: 'AZIZ MUGHAL RYK', phone: '+92 68 5566778', branch: 'Multan', category: 'REGULAR', creditLimit: 1000000, balance: 0 },
    { name: 'MR TURAB ALI CARE M', phone: '+92 21 3344556', branch: 'Karachi', category: 'REGULAR', creditLimit: 1000000, balance: 0 },
    { name: 'AKBER RWP 2025 ULTF', phone: '+92 51 6677889', branch: 'Rawalpindi', category: 'REGULAR', creditLimit: 1000000, balance: 0 },
    { name: 'DERMA IMTIAZ , KHI', phone: '+92 21 4455667', branch: 'Karachi', category: 'REGULAR', creditLimit: 1000000, balance: 0 }
  ]

  // If user is not SuperAdmin, filter by branch strictly
  if (!authStore.isSuperAdmin) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    return seeded85.filter(p => (p.branch || 'Lahore').toLowerCase().includes(userCity))
  }
  return seeded85
})

const filteredReceivablesDatabase = computed(() => {
  let list = allReceivablesDatabase.value

  if (authStore.isSuperAdmin && receivablesBranchFilter.value !== 'ALL') {
    list = list.filter(p => p.branch === receivablesBranchFilter.value)
  }

  if (receivablesStatusFilter.value === 'DUE') {
    list = list.filter(p => p.balance > 0)
  } else if (receivablesStatusFilter.value === 'CLEAR') {
    list = list.filter(p => p.balance <= 0)
  }

  if (receivablesSearchQuery.value.trim()) {
    const q = receivablesSearchQuery.value.toLowerCase().trim()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q)) ||
      (p.branch && p.branch.toLowerCase().includes(q))
    )
  }

  return list
})

const totalReceivablesSum = computed(() => {
  return filteredReceivablesDatabase.value.reduce((s, p) => s + Number(p.balance || 0), 0)
})

const vyaparRawReceivables = computed(() => {
  return totalReceivablesSum.value
})
const vyaparFormattedReceivables = computed(() => formatVyaparAmount(vyaparRawReceivables.value))

const vyaparTopReceivables = computed(() => {
  const list = [...allReceivablesDatabase.value]
    .sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0))
    .slice(0, 3)
    .map(l => ({
      name: l.name,
      amount: Number(l.balance || 0)
    }))
  return list.length > 0 ? list : [
    { name: 'CUSTOMER PARTY', amount: 0 }
  ]
})
const vyaparReceivablesMoreCount = computed(() => Math.max(0, allReceivablesDatabase.value.length - 3))

function exportReceivablesList(format = 'csv') {
  const rows = filteredReceivablesDatabase.value.map(p => ({
    'Party Name': p.name,
    'Phone': p.phone,
    'Branch': p.branch,
    'Category': p.category,
    'Credit Limit (PKR)': p.creditLimit,
    'Outstanding Balance (PKR)': p.balance
  }))
  if (format === 'csv') {
    const header = Object.keys(rows[0] || {}).join(',')
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows.map(r => Object.values(r).join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `customer_receivables_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    uiStore.showToast(`Exported ${rows.length} receivable customer records!`, 'success')
  }
}

// ── FULL SUPPLIER PAYABLES & CONTAINER DEBT DATABASE (Branch Isolated) ──
const allPayablesDatabase = computed(() => {
  const seeded72 = [
    { containerNo: 'MUL (863) SDNBSE2606060', supplierName: 'Ahmad Son company', blNumber: 'SDNBSE-863', blDate: '2026-09-01', destinationCity: 'Multan', landingCost: 1450000, totalCostValue: 48714000, status: 'In Stock' },
    { containerNo: 'MUL (864) JHNF2607010', supplierName: 'Shenzhen MedTech Global', blNumber: 'JHNF26-864', blDate: '2026-09-03', destinationCity: 'Multan', landingCost: 1320000, totalCostValue: 45355000, status: 'In Stock' },
    { containerNo: 'MUL (854) SDNBSE2605020', supplierName: 'Ahmad Son company', blNumber: 'SDNBSE-854', blDate: '2026-08-20', destinationCity: 'Multan', landingCost: 1280000, totalCostValue: 44515000, status: 'In Stock' },
    { containerNo: 'PEW (101) SENDNB2606060', supplierName: 'Ahmad Son company', blNumber: 'SENDNB2606060', blDate: '2026-09-01', destinationCity: 'Peshawar', landingCost: 1250000, totalCostValue: 18500000, status: 'In Stock' },
    { containerNo: 'LHR (202) SZMED992010', supplierName: 'Shenzhen MedTech Global', blNumber: 'SZMED992010', blDate: '2026-09-02', destinationCity: 'Lahore', landingCost: 850000, totalCostValue: 14200000, status: 'In Inspection' },
    { containerNo: 'PEW (303) BL-MED-2026-03', supplierName: 'Siemens Healthineers GmbH', blNumber: 'BL-MED-2026-03', blDate: '2026-07-01', destinationCity: 'Peshawar', landingCost: 650000, totalCostValue: 3600000, status: 'Cleared' },
    { containerNo: 'KHI (404) PHL-MED-2026-09', supplierName: 'Philips Healthcare Netherlands', blNumber: 'PHL-99881', blDate: '2026-08-15', destinationCity: 'Karachi', landingCost: 1100000, totalCostValue: 28400000, status: 'In Stock' },
    { containerNo: 'LHR (505) MDR-SHEN-8812', supplierName: 'Mindray Bio-Medical Electronics', blNumber: 'MDR-88124', blDate: '2026-08-28', destinationCity: 'Lahore', landingCost: 950000, totalCostValue: 22100000, status: 'In Inspection' },
    { containerNo: 'PEW (606) OLY-TYO-2026', supplierName: 'Olympus Medical Systems Tokyo', blNumber: 'OLY-77211', blDate: '2026-09-05', destinationCity: 'Peshawar', landingCost: 1400000, totalCostValue: 34500000, status: 'In Stock' },
    { containerNo: 'MUL (707) GE-USA-2026-7', supplierName: 'GE Healthcare Chicago USA', blNumber: 'GE-443322', blDate: '2026-08-10', destinationCity: 'Multan', landingCost: 1600000, totalCostValue: 39800000, status: 'Cleared' },
    { containerNo: 'LHR (808) TOS-JPN-2026', supplierName: 'Canon Medical Systems Japan', blNumber: 'CAN-88771', blDate: '2026-07-25', destinationCity: 'Lahore', landingCost: 1200000, totalCostValue: 26500000, status: 'Cleared' },
    { containerNo: 'PEW (909) DRI-GER-2026', supplierName: 'Draeger Medical Germany', blNumber: 'DRG-11223', blDate: '2026-09-08', destinationCity: 'Peshawar', landingCost: 900000, totalCostValue: 19800000, status: 'In Stock' },
    { containerNo: 'KHI (110) MAE-SH-2026-1', supplierName: 'Shanghai Medical Instruments Co', blNumber: 'MAE-55661', blDate: '2026-09-11', destinationCity: 'Karachi', landingCost: 750000, totalCostValue: 16400000, status: 'In Inspection' },
    { containerNo: 'LHR (111) COV-IRL-2026', supplierName: 'Covidien Medtronic Ireland', blNumber: 'COV-99112', blDate: '2026-08-05', destinationCity: 'Lahore', landingCost: 800000, totalCostValue: 15200000, status: 'Cleared' },
    { containerNo: 'MUL (112) STR-USA-2026', supplierName: 'Stryker Surgical USA', blNumber: 'STR-33441', blDate: '2026-08-18', destinationCity: 'Multan', landingCost: 1050000, totalCostValue: 24600000, status: 'In Stock' },
    { containerNo: 'PEW (113) KAR-GER-2026', supplierName: 'Karl Storz Endoscopy Germany', blNumber: 'KAR-77889', blDate: '2026-09-04', destinationCity: 'Peshawar', landingCost: 1150000, totalCostValue: 27900000, status: 'In Stock' },
    { containerNo: 'KHI (114) SHI-JPN-2026', supplierName: 'Shimadzu Medical Japan', blNumber: 'SHI-22334', blDate: '2026-07-30', destinationCity: 'Karachi', landingCost: 1300000, totalCostValue: 31200000, status: 'Cleared' },
    { containerNo: 'LHR (115) HIT-JPN-2026', supplierName: 'Hitachi Aloka Medical', blNumber: 'HIT-66554', blDate: '2026-08-22', destinationCity: 'Lahore', landingCost: 1100000, totalCostValue: 25800000, status: 'In Stock' },
    { containerNo: 'MUL (116) ES-KOR-2026', supplierName: 'Samsung Medison Korea', blNumber: 'SAM-88990', blDate: '2026-09-06', destinationCity: 'Multan', landingCost: 950000, totalCostValue: 21500000, status: 'In Inspection' },
    { containerNo: 'PEW (117) SON-CHN-2026', supplierName: 'SonoScape Medical China', blNumber: 'SON-11445', blDate: '2026-09-10', destinationCity: 'Peshawar', landingCost: 850000, totalCostValue: 17800000, status: 'In Stock' },
    ...Array.from({ length: 52 }, (_, i) => ({
      containerNo: `CON-PKR-${String(i + 120).padStart(4, '0')}`,
      supplierName: i % 3 === 0 ? 'Ahmad Son company' : i % 3 === 1 ? 'Shenzhen MedTech Global' : 'Siemens Healthineers GmbH',
      blNumber: `BL-MED-${String(i + 200).padStart(5, '0')}`,
      blDate: '2026-08-' + String((i % 28) + 1).padStart(2, '0'),
      destinationCity: i % 4 === 0 ? 'Lahore' : i % 4 === 1 ? 'Peshawar' : i % 4 === 2 ? 'Multan' : 'Karachi',
      landingCost: 600000 + (i * 15000),
      totalCostValue: 8500000 + (i * 450000),
      status: i % 2 === 0 ? 'In Stock' : 'Cleared'
    }))
  ]

  // If user is not SuperAdmin, filter payables strictly by branch
  if (!authStore.isSuperAdmin) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    return seeded72.filter(r => (r.destinationCity || r.branch || 'Lahore').toLowerCase().includes(userCity))
  }
  return seeded72
})

const filteredPayablesDatabase = computed(() => {
  let list = allPayablesDatabase.value

  if (authStore.isSuperAdmin && payablesBranchFilter.value !== 'ALL') {
    list = list.filter(r => (r.destinationCity || r.branch) === payablesBranchFilter.value)
  }

  if (payablesStatusFilter.value !== 'ALL') {
    list = list.filter(r => r.status === payablesStatusFilter.value)
  }

  if (payablesSearchQuery.value.trim()) {
    const q = payablesSearchQuery.value.toLowerCase().trim()
    list = list.filter(r =>
      r.containerNo.toLowerCase().includes(q) ||
      r.supplierName.toLowerCase().includes(q) ||
      r.blNumber.toLowerCase().includes(q)
    )
  }

  return list
})

const totalPayablesSum = computed(() => {
  return filteredPayablesDatabase.value.reduce((s, r) => s + Number(r.totalCostValue || 0), 0)
})

const vyaparRawPayables = computed(() => {
  return totalPayablesSum.value
})
const vyaparFormattedPayables = computed(() => formatVyaparAmount(vyaparRawPayables.value))

const vyaparTopPayables = computed(() => {
  const list = [...allPayablesDatabase.value]
    .sort((a, b) => Number(b.totalCostValue || 0) - Number(a.totalCostValue || 0))
    .slice(0, 3)
    .map(c => ({
      name: `${c.containerNo || 'CONTAINER'}, ${c.supplierName || 'SUPPLIER'}`,
      amount: Number(c.totalCostValue || 0)
    }))
  return list.length > 0 ? list : [
    { name: 'SUPPLIER PAYABLE', amount: 0 }
  ]
})
const vyaparPayablesMoreCount = computed(() => Math.max(0, allPayablesDatabase.value.length - 3))

function exportPayablesList(format = 'csv') {
  const rows = filteredPayablesDatabase.value.map(r => ({
    'Container No': r.containerNo,
    'Supplier Name': r.supplierName,
    'B/L Number': r.blNumber,
    'B/L Date': r.blDate,
    'Destination Depot': r.destinationCity || r.branch,
    'Landing Cost (PKR)': r.landingCost,
    'Payable Total (PKR)': r.totalCostValue,
    'Status': r.status
  }))
  if (format === 'csv') {
    const header = Object.keys(rows[0] || {}).join(',')
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows.map(r => Object.values(r).join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `supplier_payables_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    uiStore.showToast(`Exported ${rows.length} payable supplier records!`, 'success')
  }
}

// ── FULL PURCHASE EQUIPMENT CONSIGNMENTS DATABASE (Branch Isolated) ──
const allPurchasesDatabase = computed(() => {
  const prods = dataStore.products || []
  const seeded66 = [
    ...prods,
    { id: 'p_extra_01', name: 'PORTABLE B/W ULTRASOUND SCANNER DP-10', category: 'Ultrasound Machines', sku: 'US-DP10-01', costPrice: 460000, sellingPrice: 690000, stockQty: 15, allocationCity: 'Peshawar, Lahore', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_02', name: 'MANUAL WHEELCHAIR LUXURY RECLINING', category: 'Hospital Furniture', sku: 'WCH-LX-01', costPrice: 28000, sellingPrice: 42000, stockQty: 180, allocationCity: 'Lahore, Multan, Karachi', image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_03', name: 'PORTABLE COLOR DOPPLER ULTRASOUND 4D', category: 'Ultrasound Machines', sku: 'US-CD4D-01', costPrice: 1250000, sellingPrice: 1850000, stockQty: 6, allocationCity: 'Lahore, Karachi', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_04', name: 'INFANT RADIANT WARMER (AHMAD SON)', category: 'Neonatal Care Equipment', sku: 'AN-WRM-01', costPrice: 120000, sellingPrice: 185000, stockQty: 40, allocationCity: 'Peshawar, Multan, Lahore', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_05', name: 'SURGICAL SHADOWLESS OT LIGHT DOUBLE DOME', category: 'Surgical Equipment', sku: 'AN-LGT-01', costPrice: 85000, sellingPrice: 140000, stockQty: 60, allocationCity: 'Peshawar, Lahore', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_06', name: 'ELECTRIC ICU PATIENT BED 5-FUNCTION', category: 'Hospital Furniture', sku: 'AN-BED-01', costPrice: 220000, sellingPrice: 320000, stockQty: 30, allocationCity: 'Lahore, Multan', image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_07', name: 'HYDRAULIC ADJUSTABLE DOCTOR STOOL', category: 'Hospital Furniture', sku: 'AN-STL-01', costPrice: 25000, sellingPrice: 42000, stockQty: 80, allocationCity: 'Peshawar, Multan, Lahore, Karachi', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_08', name: '808NM DIODE LASER HAIR REMOVAL SYSTEM', category: 'Laser Systems', sku: 'LSR-9900', costPrice: 1800000, sellingPrice: 2450000, stockQty: 4, allocationCity: 'Lahore, Peshawar', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_09', name: '12-LEAD DIGITAL ECG ELECTROCARDIOGRAPH', category: 'Cardiology Equipment', sku: 'ECG-7700', costPrice: 160000, sellingPrice: 240000, stockQty: 12, allocationCity: 'Peshawar, Multan, Karachi', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_10', name: 'MULTIPARAMETER ICU PATIENT MONITOR 12.1 INCH', category: 'Cardiology Equipment', sku: 'MON-ICU-12', costPrice: 195000, sellingPrice: 290000, stockQty: 22, allocationCity: 'Lahore, Karachi', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_11', name: 'ANESTHESIA WORKSTATION 2-GAS VAPORIZER', category: 'Surgical Equipment', sku: 'ANE-WS-02', costPrice: 1850000, sellingPrice: 2600000, stockQty: 5, allocationCity: 'Lahore, Peshawar', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_12', name: 'NEONATAL PHOTOTHERAPY UNIT LED BLUE', category: 'Neonatal Care Equipment', sku: 'NEO-PHT-01', costPrice: 65000, sellingPrice: 110000, stockQty: 35, allocationCity: 'Multan, Lahore', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_13', name: 'DEFIBRILLATOR MONITOR BIPHASIC 360J', category: 'Cardiology Equipment', sku: 'DEF-BIPH-360', costPrice: 380000, sellingPrice: 560000, stockQty: 8, allocationCity: 'Karachi, Lahore', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_14', name: 'ELECTROSURGICAL CAUTERY UNIT 400W', category: 'Surgical Equipment', sku: 'ESU-CAUT-400', costPrice: 290000, sellingPrice: 420000, stockQty: 14, allocationCity: 'Peshawar, Multan', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_15', name: 'PORTABLE SUCTION MACHINE HIGH VACUUM', category: 'Surgical Equipment', sku: 'SUC-HV-01', costPrice: 32000, sellingPrice: 54000, stockQty: 45, allocationCity: 'Lahore, Multan, Karachi, Islamabad', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80' },
    { id: 'p_extra_16', name: 'ENDOSCOPY CAMERA TOWER FULL HD SYSTEM', category: 'Surgical Equipment', sku: 'ENDO-HD-01', costPrice: 2450000, sellingPrice: 3600000, stockQty: 3, allocationCity: 'Lahore, Peshawar', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80' },
    ...Array.from({ length: 50 }, (_, i) => ({
      id: `p_gen_${i + 17}`,
      name: `Medical Consignment Unit Mod-${i + 101}`,
      category: i % 4 === 0 ? 'Ultrasound Machines' : i % 4 === 1 ? 'Cardiology Equipment' : i % 4 === 2 ? 'Surgical Equipment' : 'Hospital Furniture',
      sku: `SKU-MED-${String(i + 100).padStart(4, '0')}`,
      costPrice: 95000 + (i * 12000),
      sellingPrice: 145000 + (i * 18000),
      stockQty: 5 + (i % 20),
      allocationCity: i % 3 === 0 ? 'Lahore' : i % 3 === 1 ? 'Multan' : 'Karachi',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
    }))
  ]

  const all = seeded66.slice(0, 66)
  if (!authStore.isSuperAdmin) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    return all.filter(p => !p.allocationCity || p.allocationCity.toLowerCase().includes(userCity))
  }
  return all
})

const filteredPurchasesDatabase = computed(() => {
  let list = allPurchasesDatabase.value

  if (purchasesCategoryFilter.value !== 'ALL') {
    list = list.filter(p => p.category === purchasesCategoryFilter.value)
  }

  if (purchasesSearchQuery.value.trim()) {
    const q = purchasesSearchQuery.value.toLowerCase().trim()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    )
  }

  return list
})

const totalPurchasesSum = computed(() => {
  return filteredPurchasesDatabase.value.reduce((s, p) => s + (Number(p.costPrice || 0) * Number(p.stockQty || 1)), 0)
})

const vyaparRawPurchases = computed(() => {
  let purchases = dataStore.containers || []
  const currentBranch = authStore.isSuperAdmin ? null : (authStore.userBranch || 'Lahore')
  if (currentBranch) {
    purchases = purchases.filter(c => (c.destinationCity || c.branch || 'Lahore').toLowerCase().includes(currentBranch.toLowerCase()))
  }
  const { startDate, endDate } = getDateRangeForPeriod(vyaparPurchasePeriod.value)
  if (startDate && endDate) {
    const matched = purchases.filter(c => {
      const d = (c.receivingDate || c.arrivalDate || c.blDate || '').substring(0, 10)
      return d && d >= startDate && d <= endDate
    })
    const sum = matched.reduce((tot, c) => tot + Number(c.landingCost || c.totalCostValue || 0), 0)
    if (sum > 0) return sum
  } else {
    const sum = purchases.reduce((tot, c) => tot + Number(c.landingCost || c.totalCostValue || 0), 0)
    if (sum > 0) return sum
  }

  const branchKey = (currentBranch || 'Peshawar').toLowerCase()
  const factor = branchKey.includes('lahore') ? 0.35 : branchKey.includes('karachi') ? 0.30 : branchKey.includes('multan') ? 0.25 : branchKey.includes('islamabad') ? 0.10 : 1.0

  switch (vyaparPurchasePeriod.value) {
    case 'Today': return Math.round(250000 * factor)
    case 'This Week': return Math.round(4800000 * factor)
    case 'This Month': return Math.round(53876800 * factor)
    case 'This Year': return Math.round(240000000 * factor)
    case 'All Time': return Math.round(492707399 * factor)
    default: return Math.round(53876800 * factor)
  }
})
const vyaparFormattedPurchases = computed(() => formatVyaparAmount(vyaparRawPurchases.value))

const vyaparTopPurchases = computed(() => {
  const products = allPurchasesDatabase.value
  if (products.length >= 3) {
    return products.slice(0, 3).map(p => ({
      name: p.name,
      amount: Number(p.costPrice * (p.stockQty || 1) || 5000000)
    }))
  }
  return [
    { name: 'PORTABLE B/W ULTRASOUND', amount: 6900000 },
    { name: 'MANUAL WHEELCHAIR', amount: 5072800 },
    { name: 'PORTABLE B/W ULTRASOUND', amount: 3770000 }
  ]
})
const vyaparPurchasesMoreCount = computed(() => Math.max(0, allPurchasesDatabase.value.length - 3))

function exportPurchasesList(format = 'csv') {
  const rows = filteredPurchasesDatabase.value.map(p => ({
    'SKU': p.sku,
    'Equipment Name': p.name,
    'Category': p.category,
    'Stock Qty': p.stockQty,
    'Cost Price (PKR)': p.costPrice,
    'Selling Price (PKR)': p.sellingPrice || p.salePrice,
    'Total Valuation (PKR)': Number(p.costPrice || 0) * Number(p.stockQty || 1)
  }))
  if (format === 'csv') {
    const header = Object.keys(rows[0] || {}).join(',')
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows.map(r => Object.values(r).join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `purchases_inventory_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    uiStore.showToast(`Exported ${rows.length} purchase consignment records!`, 'success')
  }
}

// ── Daily Trend Points for SVG Area Curve Chart (Dynamic by Period) ──
const vyaparDailySalePoints = computed(() => {
  const period = vyaparSalePeriod.value
  const branchKey = (authStore.isSuperAdmin ? 'Peshawar' : (authStore.userBranch || 'Lahore')).toLowerCase()
  const factor = branchKey.includes('lahore') ? 0.38 : branchKey.includes('karachi') ? 0.32 : branchKey.includes('multan') ? 0.24 : branchKey.includes('islamabad') ? 0.10 : 1.0

  if (period === 'Today') {
    return [
      { date: '09:00 AM', sale: Math.round(45000 * factor), y: 75 },
      { date: '10:30 AM', sale: Math.round(85000 * factor), y: 55 },
      { date: '12:00 PM', sale: Math.round(120000 * factor), y: 35 },
      { date: '01:30 PM', sale: Math.round(65000 * factor), y: 65 },
      { date: '03:00 PM', sale: Math.round(95000 * factor), y: 45 },
      { date: '04:30 PM', sale: Math.round(150000 * factor), y: 20 },
      { date: '06:00 PM', sale: Math.round(70000 * factor), y: 60 }
    ]
  }
  if (period === 'This Week') {
    return [
      { date: 'Mon', sale: Math.round(380000 * factor), y: 70 },
      { date: 'Tue', sale: Math.round(520000 * factor), y: 50 },
      { date: 'Wed', sale: Math.round(410000 * factor), y: 65 },
      { date: 'Thu', sale: Math.round(750000 * factor), y: 30 },
      { date: 'Fri', sale: Math.round(890000 * factor), y: 20 },
      { date: 'Sat', sale: Math.round(620000 * factor), y: 40 },
      { date: 'Sun', sale: Math.round(310000 * factor), y: 80 }
    ]
  }
  if (period === 'This Quarter') {
    return [
      { date: 'Wk 1', sale: Math.round(9500000 * factor), y: 75 },
      { date: 'Wk 2', sale: Math.round(12000000 * factor), y: 60 },
      { date: 'Wk 3', sale: Math.round(14500000 * factor), y: 45 },
      { date: 'Wk 4', sale: Math.round(8900000 * factor), y: 80 },
      { date: 'Wk 5', sale: Math.round(16200000 * factor), y: 35 },
      { date: 'Wk 6', sale: Math.round(18500000 * factor), y: 25 },
      { date: 'Wk 7', sale: Math.round(11000000 * factor), y: 65 },
      { date: 'Wk 8', sale: Math.round(15400000 * factor), y: 40 },
      { date: 'Wk 9', sale: Math.round(21000000 * factor), y: 15 },
      { date: 'Wk 10', sale: Math.round(13800000 * factor), y: 50 },
      { date: 'Wk 11', sale: Math.round(17500000 * factor), y: 30 },
      { date: 'Wk 12', sale: Math.round(19800000 * factor), y: 20 }
    ]
  }
  if (period === 'This Year') {
    return [
      { date: 'Jan', sale: Math.round(32000000 * factor), y: 70 },
      { date: 'Feb', sale: Math.round(36500000 * factor), y: 62 },
      { date: 'Mar', sale: Math.round(41000000 * factor), y: 54 },
      { date: 'Apr', sale: Math.round(38200000 * factor), y: 59 },
      { date: 'May', sale: Math.round(44000000 * factor), y: 48 },
      { date: 'Jun', sale: Math.round(49500000 * factor), y: 38 },
      { date: 'Jul', sale: Math.round(52000000 * factor), y: 34 },
      { date: 'Aug', sale: Math.round(48000000 * factor), y: 41 },
      { date: 'Sep', sale: Math.round(58500000 * factor), y: 22 },
      { date: 'Oct', sale: Math.round(54000000 * factor), y: 30 },
      { date: 'Nov', sale: Math.round(62000000 * factor), y: 16 },
      { date: 'Dec', sale: Math.round(68900000 * factor), y: 10 }
    ]
  }
  if (period === 'All Time') {
    return [
      { date: '2023', sale: Math.round(120000000 * factor), y: 80 },
      { date: '2024', sale: Math.round(210000000 * factor), y: 55 },
      { date: '2025', sale: Math.round(340000000 * factor), y: 30 },
      { date: '2026', sale: Math.round(485600000 * factor), y: 15 }
    ]
  }
  // Default 'This Month'
  return [
    { date: '01/09', sale: Math.round(450000 * factor), y: 70 },
    { date: '03/09', sale: Math.round(150000 * factor), y: 88 },
    { date: '06/09', sale: Math.round(220000 * factor), y: 82 },
    { date: '08/09', sale: Math.round(680000 * factor), y: 35 },
    { date: '10/09', sale: Math.round(310000 * factor), y: 75 },
    { date: '12/09', sale: Math.round(420000 * factor), y: 65 },
    { date: '14/09', sale: Math.round(1010000 * factor), y: 28 },
    { date: '16/09', sale: Math.round(200000 * factor), y: 85 },
    { date: '18/09', sale: Math.round(550000 * factor), y: 52 },
    { date: '21/09', sale: Math.round(580000 * factor), y: 48 },
    { date: '24/09', sale: Math.round(1450000 * factor), y: 15 },
    { date: '26/09', sale: Math.round(380000 * factor), y: 72 },
    { date: '28/09', sale: Math.round(490000 * factor), y: 60 },
    { date: '30/09', sale: Math.round(210000 * factor), y: 82 }
  ]
})

const vyaparChartPaths = computed(() => {
  const pts = vyaparDailySalePoints.value
  const totalW = 320
  const n = pts.length
  const step = totalW / (n - 1)
  
  const coords = pts.map((p, i) => ({
    x: Number((i * step).toFixed(1)),
    y: p.y
  }))

  let linePath = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i]
    const p1 = coords[i + 1]
    const mx = (p0.x + p1.x) / 2
    linePath += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`
  }

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} 100 L ${coords[0].x} 100 Z`
  return { linePath, areaPath, coords }
})

const hoveredSalePoint = computed(() => {
  if (hoveredSaleIndex.value === null) return null
  return vyaparDailySalePoints.value[hoveredSaleIndex.value] || null
})

const hoveredPointPos = computed(() => {
  if (hoveredSaleIndex.value === null) return { x: 0, y: 0 }
  const coords = vyaparChartPaths.value.coords
  return coords[hoveredSaleIndex.value] || { x: 0, y: 0 }
})

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
/* ── Vyapar 5-Container Section ───────────────────────────── */
.vyapar-dashboard-section {
  width: 100%;
}

.vyapar-dashboard-row-upper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: stretch;
}

@media (max-width: 640px) {
  .vyapar-dashboard-row-upper {
    grid-template-columns: 1fr;
  }
}

.vyapar-dashboard-row-lower {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: stretch;
}

@media (max-width: 640px) {
  .vyapar-dashboard-row-lower {
    grid-template-columns: 1fr;
  }
}

.vyapar-sale-body-grid {
  display: grid;
  grid-template-columns: 1.1fr auto 1.3fr;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 640px) {
  .vyapar-sale-body-grid {
    grid-template-columns: 1fr;
  }
}

.vyapar-chart-wrapper {
  height: 96px !important;
  max-height: 96px !important;
  min-height: 80px !important;
  width: 100% !important;
  overflow: visible;
  position: relative;
}

.vyapar-card {
  transition: all 0.2s ease;
}

.vyapar-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.vyapar-select-pill {
  display: inline-flex;
  align-items: center;
}

.vyapar-select {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.775rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  cursor: pointer;
  outline: none;
}

[data-theme="dark"] .vyapar-select {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
}

.vyapar-amount-display {
  font-family: var(--font-heading);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.vyapar-amount-display .currency {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

[data-theme="dark"] .vyapar-amount-display .currency {
  color: #f8fafc;
}

.vyapar-amount-display .amount-val {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f172a;
}

[data-theme="dark"] .vyapar-amount-display .amount-val {
  color: #f8fafc;
}

.vyapar-amount-display .amount-dec {
  font-size: 0.95rem;
  font-weight: 500;
  color: #94a3b8;
}

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
