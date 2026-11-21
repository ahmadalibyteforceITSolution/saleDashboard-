import sys

sidebar_path = r'src/components/AppSidebar.vue'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Sale Submenu
old_sale = """        <div v-if="!isCollapsed && isSaleMenuOpen" class="sidebar-submenu">
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/sales' && (!route.query.type || route.query.type === 'invoice') }"
            @click="router.push('/sales?type=invoice'); uiStore.closeMobileSidebar()"
          >
            <span>Sales Invoices</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/sales' && (route.query.type === 'estimate' || route.query.type === 'quotation') }"
            @click="router.push('/sales?type=estimate'); uiStore.closeMobileSidebar()"
          >
            <span>Estimates / Quotations</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/sales' && route.query.type === 'order' }"
            @click="router.push('/sales?type=order'); uiStore.closeMobileSidebar()"
          >
            <span>Sale Orders</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/sales' && route.query.type === 'return' }"
            @click="router.push('/sales?type=return'); uiStore.closeMobileSidebar()"
          >
            <span>Sale Returns & Credit Notes</span>
          </button>
        </div>"""

new_sale = """        <div v-if="!isCollapsed && isSaleMenuOpen" class="sidebar-submenu">
          <button
            type="button"
            class="nav-subitem flex items-center justify-between w-full"
            :class="{ 'subitem-active': route.path === '/sales' && (!route.query.type || route.query.type === 'invoice') }"
            @click="router.push('/sales?type=invoice'); uiStore.closeMobileSidebar()"
          >
            <span class="truncate">Sales Invoices</span>
            <Plus :size="13" class="opacity-70 hover:opacity-100 cursor-pointer text-emerald-400 p-0.5 rounded hover:bg-emerald-950/60 shrink-0 ml-1" @click.stop.prevent="uiStore.openSaleModal()" title="New Sales POS Invoice" />
          </button>
          <button
            type="button"
            class="nav-subitem flex items-center justify-between w-full"
            :class="{ 'subitem-active': route.path === '/sales' && (route.query.type === 'estimate' || route.query.type === 'quotation') }"
            @click="router.push('/sales?type=estimate'); uiStore.closeMobileSidebar()"
          >
            <span class="truncate">Estimates / Quotations</span>
            <Plus :size="13" class="opacity-70 hover:opacity-100 cursor-pointer text-blue-400 p-0.5 rounded hover:bg-blue-950/60 shrink-0 ml-1" @click.stop.prevent="uiStore.openSaleModal({ orderType: 'Quotation' })" title="New Estimate / Quote" />
          </button>
          <button
            type="button"
            class="nav-subitem flex items-center justify-between w-full"
            :class="{ 'subitem-active': route.path === '/sales' && route.query.type === 'order' }"
            @click="router.push('/sales?type=order'); uiStore.closeMobileSidebar()"
          >
            <span class="truncate">Sale Orders</span>
            <Plus :size="13" class="opacity-70 hover:opacity-100 cursor-pointer text-purple-400 p-0.5 rounded hover:bg-purple-950/60 shrink-0 ml-1" @click.stop.prevent="uiStore.openSaleModal({ orderType: 'SalesOrder' })" title="New Sale Order" />
          </button>
          <button
            type="button"
            class="nav-subitem flex items-center justify-between w-full"
            @click="uiStore.openPaymentInModal(); uiStore.closeMobileSidebar()"
          >
            <span class="flex items-center gap-1.5 truncate">
              <span>Payment In</span>
              <span class="badge badge-success text-[8px] py-0 px-1 font-mono">Receipt</span>
            </span>
            <Plus :size="13" class="opacity-70 hover:opacity-100 cursor-pointer text-emerald-400 p-0.5 rounded hover:bg-emerald-950/60 shrink-0 ml-1" @click.stop.prevent="uiStore.openPaymentInModal()" title="Record Payment In" />
          </button>
          <button
            type="button"
            class="nav-subitem flex items-center justify-between w-full"
            @click="uiStore.openDeliveryChallanModal(); uiStore.closeMobileSidebar()"
          >
            <span class="flex items-center gap-1.5 truncate">
              <span>Delivery Challan</span>
              <span class="badge badge-info text-[8px] py-0 px-1 font-mono">Dispatch</span>
            </span>
            <Plus :size="13" class="opacity-70 hover:opacity-100 cursor-pointer text-teal-400 p-0.5 rounded hover:bg-teal-950/60 shrink-0 ml-1" @click.stop.prevent="uiStore.openDeliveryChallanModal()" title="Create Delivery Challan" />
          </button>
          <button
            type="button"
            class="nav-subitem flex items-center justify-between w-full"
            :class="{ 'subitem-active': route.path === '/sales' && route.query.type === 'return' }"
            @click="uiStore.openSaleReturnModal(); uiStore.closeMobileSidebar()"
          >
            <span class="flex items-center gap-1.5 truncate">
              <span>Sale Returns & Cr. Notes</span>
            </span>
            <Plus :size="13" class="opacity-70 hover:opacity-100 cursor-pointer text-amber-400 p-0.5 rounded hover:bg-amber-950/60 shrink-0 ml-1" @click.stop.prevent="uiStore.openSaleReturnModal()" title="Process Sale Return" />
          </button>
        </div>"""

# Replace Purchase Submenu
old_purchase = """        <div v-if="!isCollapsed && isPurchaseMenuOpen" class="sidebar-submenu">
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/purchasing' && (!route.query.type || route.query.type === 'bills') }"
            @click="router.push('/purchasing'); uiStore.closeMobileSidebar()"
          >
            <span class="flex items-center justify-between w-full">
              <span>Purchase Bills & Import Hub</span>
              <span class="badge badge-info text-[9px] py-0 px-1 font-mono">BL Registry</span>
            </span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            @click="router.push('/purchasing'); uiStore.closeMobileSidebar()"
          >
            <span>BL Closing & 17-Col Excel</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/payments' && route.query.type === 'out' }"
            @click="router.push('/payments?type=out'); uiStore.closeMobileSidebar()"
          >
            <span>Payment Out</span>
          </button>
          <button
            type="button"
            class="nav-subitem"
            :class="{ 'subitem-active': route.path === '/purchasing' && route.query.type === 'return' }"
            @click="router.push('/purchasing?type=return'); uiStore.closeMobileSidebar()"
          >
            <span>Purchase Return / Dr. Note</span>
          </button>
        </div>"""

new_purchase = """        <div v-if="!isCollapsed && isPurchaseMenuOpen" class="sidebar-submenu">
          <button
            type="button"
            class="nav-subitem flex items-center justify-between w-full"
            :class="{ 'subitem-active': route.path === '/purchasing' && (!route.query.type || route.query.type === 'bills') }"
            @click="router.push('/purchasing'); uiStore.closeMobileSidebar()"
          >
            <span class="flex items-center justify-between flex-1 min-w-0 mr-1">
              <span class="truncate">Purchase Bills & Hub</span>
              <span class="badge badge-info text-[8px] py-0 px-1 font-mono shrink-0">BL</span>
            </span>
            <Plus :size="13" class="opacity-70 hover:opacity-100 cursor-pointer text-teal-400 p-0.5 rounded hover:bg-teal-950/60 shrink-0 ml-1" @click.stop.prevent="uiStore.openPurchaseModal()" title="Record Purchase Bill" />
          </button>
          <button
            type="button"
            class="nav-subitem"
            @click="router.push('/purchasing'); uiStore.closeMobileSidebar()"
          >
            <span class="truncate">BL Closing & 17-Col Excel</span>
          </button>
          <button
            type="button"
            class="nav-subitem flex items-center justify-between w-full"
            :class="{ 'subitem-active': route.path === '/payments' && route.query.type === 'out' }"
            @click="uiStore.openPaymentOutModal(); uiStore.closeMobileSidebar()"
          >
            <span class="flex items-center gap-1.5 truncate">
              <span>Payment Out</span>
              <span class="badge badge-danger text-[8px] py-0 px-1 font-mono">Disburse</span>
            </span>
            <Plus :size="13" class="opacity-70 hover:opacity-100 cursor-pointer text-rose-400 p-0.5 rounded hover:bg-rose-950/60 shrink-0 ml-1" @click.stop.prevent="uiStore.openPaymentOutModal()" title="Record Payment Out" />
          </button>
          <button
            type="button"
            class="nav-subitem flex items-center justify-between w-full"
            :class="{ 'subitem-active': route.path === '/purchasing' && route.query.type === 'return' }"
            @click="uiStore.openPurchaseReturnModal(); uiStore.closeMobileSidebar()"
          >
            <span class="flex items-center gap-1.5 truncate">
              <span>Purchase Return / Dr. Note</span>
            </span>
            <Plus :size="13" class="opacity-70 hover:opacity-100 cursor-pointer text-cyan-400 p-0.5 rounded hover:bg-cyan-950/60 shrink-0 ml-1" @click.stop.prevent="uiStore.openPurchaseReturnModal()" title="Process Purchase Return" />
          </button>
        </div>"""

# Normalize CRLF
content_norm = content.replace('\r\n', '\n')
old_sale_norm = old_sale.replace('\r\n', '\n')
old_purchase_norm = old_purchase.replace('\r\n', '\n')

if old_sale_norm in content_norm and old_purchase_norm in content_norm:
    content_norm = content_norm.replace(old_sale_norm, new_sale.replace('\r\n', '\n'))
    content_norm = content_norm.replace(old_purchase_norm, new_purchase.replace('\r\n', '\n'))
    with open(sidebar_path, 'w', encoding='utf-8') as f:
        f.write(content_norm)
    print("SUCCESS")
else:
    print("MISMATCH")
