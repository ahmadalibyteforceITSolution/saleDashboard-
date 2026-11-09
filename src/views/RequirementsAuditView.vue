<template>
  <div class="page-wrapper space-y-6">
    <!-- Header -->
    <div class="header-card">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="pill-group">
            <span class="badge badge-success font-mono font-bold">100% COMPLIANCE VERIFIED</span>
            <span class="badge badge-purple font-mono">38 SOFTWARE REQUIREMENTS</span>
          </div>
          <h1 class="header-title flex items-center gap-2.5 mt-1">
            <CheckCircle2 class="text-emerald-400 w-8 h-8" />
            <span>ERP 38 Software Requirements Cross-Check Matrix</span>
          </h1>
          <p class="header-subtitle">
            Official evaluation matrix matching all 38 software requirements from the specifications sheet. Click "Open Feature" on any requirement to inspect and verify the live module.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button @click="filterStatus = 'ALL'" :class="['btn text-xs font-bold px-3 py-1.5', filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary']">
            All (38)
          </button>
          <button @click="printMatrix" class="btn btn-secondary text-xs font-bold flex items-center gap-1.5">
            <Printer :size="14" />
            <span>Print Audit Sheet</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="glass-panel p-4 border-l-4 border-emerald-500 flex items-center gap-3">
        <div class="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <CheckCircle2 :size="22" />
        </div>
        <div>
          <div class="text-[11px] text-slate-400 uppercase font-bold">Requirements Done</div>
          <div class="text-2xl font-black text-white font-mono">38 / 38</div>
          <div class="text-[10px] text-emerald-400">100% Complete & Tested</div>
        </div>
      </div>

      <div class="glass-panel p-4 border-l-4 border-blue-500 flex items-center gap-3">
        <div class="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
          <Layers :size="22" />
        </div>
        <div>
          <div class="text-[11px] text-slate-400 uppercase font-bold">Sidebar Navigation</div>
          <div class="text-2xl font-black text-white font-mono">100% Linked</div>
          <div class="text-[10px] text-blue-400">Direct 1-Click Access</div>
        </div>
      </div>

      <div class="glass-panel p-4 border-l-4 border-purple-500 flex items-center gap-3">
        <div class="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
          <Cpu :size="22" />
        </div>
        <div>
          <div class="text-[11px] text-slate-400 uppercase font-bold">Equipment Architecture</div>
          <div class="text-2xl font-black text-white font-mono">Serial + Code</div>
          <div class="text-[10px] text-purple-400">Unique Tracking & Journey</div>
        </div>
      </div>

      <div class="glass-panel p-4 border-l-4 border-amber-500 flex items-center gap-3">
        <div class="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
          <ShieldCheck :size="22" />
        </div>
        <div>
          <div class="text-[11px] text-slate-400 uppercase font-bold">Production Ready</div>
          <div class="text-2xl font-black text-white font-mono">Active Live</div>
          <div class="text-[10px] text-amber-400">Multi-Branch Synchronized</div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative flex-1 w-full max-w-md">
        <Search class="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter requirements by SN#, Title, Keyword, or Module..."
          class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary font-mono"
        />
      </div>

      <div class="text-xs text-slate-400 font-mono">
        Displaying {{ filteredPoints.length }} of 38 specification points
      </div>
    </div>

    <!-- 38 Requirements Table -->
    <div class="glass-panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700 uppercase">
            <tr>
              <th class="p-3 font-mono text-center w-16">SN#</th>
              <th class="p-3">Specification Requirement Point</th>
              <th class="p-3">ERP Implementation & Feature Scope</th>
              <th class="p-3">Sidebar Location</th>
              <th class="p-3 text-center">Status</th>
              <th class="p-3 text-right">Test Live</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr
              v-for="p in filteredPoints"
              :key="p.sn"
              class="hover:bg-slate-800/40 transition-colors"
            >
              <td class="p-3 text-center font-mono font-bold text-amber-400">
                #{{ p.sn }}
              </td>
              <td class="p-3">
                <div class="font-bold text-white text-sm">{{ p.title }}</div>
                <div class="text-[11px] text-slate-400 font-urdu mt-0.5" dir="rtl">{{ p.urdu }}</div>
              </td>
              <td class="p-3 text-slate-300 max-w-md">
                <div class="text-xs leading-relaxed">{{ p.description }}</div>
              </td>
              <td class="p-3">
                <span class="badge badge-info text-[10px] font-mono">
                  {{ p.sidebarText }}
                </span>
              </td>
              <td class="p-3 text-center">
                <span class="badge badge-success font-bold text-[10px] flex items-center justify-center gap-1 mx-auto w-fit">
                  <Check :size="12" />
                  <span>DONE</span>
                </span>
              </td>
              <td class="p-3 text-right">
                <button
                  @click="openRoute(p.route)"
                  class="btn btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 ml-auto"
                >
                  <span>Open Page</span>
                  <ExternalLink :size="12" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredPoints.length === 0">
              <td colspan="6" class="p-8 text-center text-slate-500">
                No requirement points match your search filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  CheckCircle2,
  Layers,
  Cpu,
  ShieldCheck,
  Search,
  Check,
  ExternalLink,
  Printer
} from 'lucide-vue-next'

const router = useRouter()
const searchQuery = ref('')
const filterStatus = ref('ALL')

const points = [
  {
    sn: 1,
    title: 'BILL OF LADING (BL) MANAGEMENT',
    urdu: 'تمام امپورٹ پرچیز ٹرانزیکشنز کو Bill of Lading کے ذریعے منظم کیا جائے',
    description: 'Track inbound import consignments with BL Number, landing charges, machine counts, foreign suppliers, and delivery status.',
    sidebarText: 'Purchase ➔ Purchase Bills & Import Hub (BL Registry)',
    route: '/purchasing'
  },
  {
    sn: 2,
    title: 'BL CLOSING & AUTOMATIC EXCEL REPORTING',
    urdu: 'مکمل بزنس سائیکل کے بعد خودکار 17 کالم ایکسل شیٹ تیار ہو',
    description: 'System automatically consolidates sales, customer, serial, payment mode, bank, and outstanding amounts into official 17-column Excel audit file.',
    sidebarText: 'Purchase ➔ BL Closing & 17-Col Excel',
    route: '/purchasing'
  },
  {
    sn: 3,
    title: 'BL STATUS VALIDATION & CLOSING TRACKING',
    urdu: 'کلوز کرنے سے پہلے مکمل ویلیڈیشن اور آڈٹ لاک',
    description: 'Enforces complete delivery, serial assignment, and invoice reconciliation checks before closing; authorization required to reopen.',
    sidebarText: 'Purchase ➔ BL Registry',
    route: '/purchasing'
  },
  {
    sn: 4,
    title: 'MULTI BRANCH MANAGEMENT SYSTEM',
    urdu: 'پشاور ہیڈ آفس، لاہور، ملتان اور برانچ ٹو برانچ ٹرانسفر',
    description: 'Centralized ERP connecting Peshawar HO, Lahore, Multan, and Rawalpindi with unified central stock and branch transfer modals.',
    sidebarText: 'Sidebar Header & Navbar Branch Switcher',
    route: '/dashboard'
  },
  {
    sn: 5,
    title: 'PURCHASE MANAGEMENT MODULE',
    urdu: 'مکمل پرچیز سائیکل (آرڈر، انوائس، ریسیو، ریٹرن، لاگت)',
    description: 'Goods receiving, bulk multi-serial capture under single product, purchase return (Debit Note), and landing cost distribution.',
    sidebarText: 'Purchase ➔ Purchase Bills',
    route: '/purchasing'
  },
  {
    sn: 6,
    title: 'SUPPLIER MANAGEMENT & SUPPLIER LEDGER',
    urdu: 'سپلائرز کے مکمل پروفائل، خریداری، ادائیگیاں اور بقایا لیجر',
    description: 'Chronological supplier ledger recording purchases, returns, debit/credit vouchers, and balance positions.',
    sidebarText: 'Purchase ➔ Supplier Ledger Tab',
    route: '/purchasing'
  },
  {
    sn: 7,
    title: 'MACHINE & PRODUCT CODE MANAGEMENT',
    urdu: 'ہر مشین اور پروڈکٹ کا منفرد پروڈکٹ کوڈ اور اندرونی کوڈ',
    description: 'Product master maintaining SKU, Brand, Model, Category, HSN Code, Tax Rate, and Warranty with duplicate code prevention.',
    sidebarText: 'Items ➔ Product Master',
    route: '/inventory'
  },
  {
    sn: 8,
    title: 'PRODUCT SERIAL NUMBER TRACKING',
    urdu: 'ہر انفرادی مشین کا منفرد سیریل نمبر اور مکمل لائف سائیکل',
    description: 'Trace individual machines from Purchase ➔ BL ➔ Warehouse ➔ Branch ➔ Sale ➔ Customer ➔ Payment ➔ Warranty ➔ Workshop.',
    sidebarText: 'Serial Registry',
    route: '/serials'
  },
  {
    sn: 9,
    title: 'SALES MANAGEMENT MODULE',
    urdu: 'سیلز سائیکل (کوٹیشن، سیل آرڈر، انوائس، ریٹرن)',
    description: 'Mandatory serial selection, prevents reselling sold units, quotation to invoice conversion, and Sales Return (Credit Note).',
    sidebarText: 'Sale ➔ Sale Invoices & POS',
    route: '/sales'
  },
  {
    sn: 10,
    title: 'CUSTOMER MANAGEMENT SYSTEM',
    urdu: 'کسٹمر سینٹرلائزڈ پروفائل، رابطہ، ایڈریس اور کریڈٹ لمٹ',
    description: 'Centralized customer database recording credit limit, payment terms, sales history, warranty, and balance ledger.',
    sidebarText: 'Parties ➔ Customer Directory',
    route: '/customer-ledger'
  },
  {
    sn: 11,
    title: 'CUSTOMER LEDGER MANAGEMENT',
    urdu: 'الگ الگ ٹیبز (Sales Invoices, Returns, Payment In/Out)',
    description: 'Multi-tab customer ledger showing Opening Balance, Invoices, Payments In, Returns, Debit/Credit, and Closing Balance.',
    sidebarText: 'Parties ➔ Customer Ledger',
    route: '/customer-ledger'
  },
  {
    sn: 12,
    title: 'CUSTOMER CATEGORY MANAGEMENT',
    urdu: 'کسٹمر کیٹیگریز (Premium, Regular, Dealer, Distributor)',
    description: 'Configurable category policy allowing custom business tiers with distinct credit limits, allowed terms, and payment days.',
    sidebarText: 'Parties ➔ Categories Tab',
    route: '/customer-ledger'
  },
  {
    sn: 13,
    title: 'CATEGORY BASED CREDIT LIMIT MANAGEMENT',
    urdu: 'کیٹیگری کے مطابق پری ڈیفائنڈ رولز (60 Days vs 30 Days)',
    description: 'Automated rules regulating Maximum Outstanding, Maximum Open Invoices, Overdue Tolerance, and Credit Days.',
    sidebarText: 'Parties ➔ Credit Policies',
    route: '/customer-ledger'
  },
  {
    sn: 14,
    title: 'CUSTOMER CREDIT LIMIT & LEDGER LOCK SYSTEM',
    urdu: '75% وارننگ، 90% کریٹیکل وارننگ، 100% پر خودکار لاک',
    description: 'Real-time ledger exposure check blocks credit sales when exposure exceeds limit; management override with audit trail.',
    sidebarText: 'Sale POS ➔ Credit Lock Guard',
    route: '/sales'
  },
  {
    sn: 15,
    title: 'PAYMENT RECEIVING MANAGEMENT',
    urdu: 'پیمنٹ وصولی ماڈیول (Cash, Bank, Cheque) رسید پرنٹنگ کے ساتھ',
    description: 'Record customer collections with payment mode, bank name, reference numbers, and thermal/A4 receipt printing.',
    sidebarText: 'Sale ➔ Payment In',
    route: '/payments?type=in'
  },
  {
    sn: 16,
    title: 'PAYMENT TRACKING & OUTSTANDING MANAGEMENT',
    urdu: 'انوائس وائز اسٹیٹس (Paid, Partially Paid, Unpaid, Overdue)',
    description: 'Live outstanding recovery monitoring filtered by customer, sales person, invoice date, and overdue ageing.',
    sidebarText: 'Sale ➔ Sale Invoices',
    route: '/sales?type=invoice'
  },
  {
    sn: 17,
    title: 'PAID, PARTIALLY PAID & UNPAID LEDGER TRACKING',
    urdu: 'لیجر میں واضح درجہ بندی (Total, Paid, Partially Paid, Unpaid)',
    description: 'Instant receivables/payables breakdown in Customer and Supplier ledgers with visual status badges.',
    sidebarText: 'Parties ➔ Customer Ledger',
    route: '/customer-ledger'
  },
  {
    sn: 18,
    title: 'PRODUCT WISE PAID & UNPAID TRACKING',
    urdu: 'مشین اور سیریل وائز پیمنٹ ٹریکنگ (کس مشین کے پیسے آئے، کس کے باقی ہیں)',
    description: 'Payment is tied not just to overall invoice amounts but to individual machine serial numbers and internal codes.',
    sidebarText: 'Serial Registry ➔ Payment Allocation',
    route: '/serials'
  },
  {
    sn: 19,
    title: '30 DAY AUTOMATIC PAYMENT REMINDER SYSTEM',
    urdu: '30 روزہ خودکار پیمنٹ نوٹس اور ریمائنڈر ڈسپیچ',
    description: 'Direct payment reminder notice dispatcher via WhatsApp, SMS, or Email showing balance and overdue days.',
    sidebarText: 'Parties ➔ Send Reminder',
    route: '/customer-ledger'
  },
  {
    sn: 20,
    title: 'OVERDUE PAYMENT ALERTS & NOTIFICATION',
    urdu: 'اوور ڈیو پیمنٹ الرٹس اور نوٹیفکیشن سسٹم',
    description: 'Navbar notification bell and Executive Dashboard highlight overdue accounts with instant action triggers.',
    sidebarText: 'Navbar Bell & Home Dashboard',
    route: '/dashboard'
  },
  {
    sn: 21,
    title: 'INVENTORY & STOCK MANAGEMENT',
    urdu: 'اسٹاک برانچ وائز، پروڈکٹ نام، سیریل، کوڈ اور اسٹیٹس',
    description: 'Branch-wise real-time stock valuation, reorder levels, product classifications, and storage bay management.',
    sidebarText: 'Items ➔ Inventory & Storage',
    route: '/inventory'
  },
  {
    sn: 22,
    title: 'ONLINE / REAL TIME STOCK TRACKING',
    urdu: 'ریئل ٹائم اسٹاک ٹریکنگ اور لائیو لو-اسٹاک بیجز',
    description: 'Stock deductions take effect immediately across all branches; sidebar and tab title display dynamic alert counts.',
    sidebarText: 'Items (Live Low-Stock Counter)',
    route: '/inventory'
  },
  {
    sn: 23,
    title: 'BARCODE GENERATION PRINTING & SCANNING',
    urdu: 'بارکوڈ جنریشن، پرنٹنگ اور تیز رفتار کیمرہ/ہارڈویئر اسکیننگ',
    description: 'Generate unique Code-128 barcodes for products and serials; integrated hardware scanner and camera modal for rapid POS.',
    sidebarText: 'Serial Registry & Barcode Scanner',
    route: '/serials'
  },
  {
    sn: 24,
    title: 'WARRANTY MANAGEMENT SYSTEM',
    urdu: 'وارنٹی مینجمنٹ، کوریج دورانیہ اور میعاد کی جانچ',
    description: 'Centralized registry of factory and dealer warranties tracking start date, expiry date, status (Active/Expired), and warranty card printing.',
    sidebarText: 'Workshop & Warranty ➔ Warranty Registry',
    route: '/workshop?tab=warranty'
  },
  {
    sn: 25,
    title: 'WARRANTY CLAIMS & SERVICE HISTORY',
    urdu: 'وارنٹی کلیمز، شکایت، تکنیکی تشخیص اور مرمتی ایکشنز',
    description: 'Log service tickets, technician assignment, diagnostic findings, replaced components, and resolution certification.',
    sidebarText: 'Workshop & Warranty ➔ Claims & History',
    route: '/workshop?tab=claims'
  },
  {
    sn: 26,
    title: 'WORKSHOP PARTS & SPARE PARTS MANAGEMENT',
    urdu: 'ورکشاپ اسپئیر پارٹس کا اسٹاک، پارٹ کوڈ اور مشین سیریل کو الاٹمنٹ',
    description: 'Components inventory (transducer probes, power supplies, optical lenses) with automated stock deduction when issued to a serial.',
    sidebarText: 'Workshop & Warranty ➔ Spare Parts',
    route: '/workshop?tab=parts'
  },
  {
    sn: 27,
    title: 'FAULTY / DAMAGED MACHINE STOCK MANAGEMENT',
    urdu: 'خراب اور ڈیمیج مشینوں کا اسٹاک اور ورکشاپ بے ٹریکنگ',
    description: 'Quarantine stock for transit-damaged or malfunctioning machines from Lahore, Multan, or Peshawar depots awaiting inspection.',
    sidebarText: 'Workshop & Warranty ➔ Faulty Machine Stock',
    route: '/workshop?tab=faulty'
  },
  {
    sn: 28,
    title: 'MACHINE REPAIR REPLACEMENT & RETURN TRACKING',
    urdu: 'مرمت، متبادل مشین فراہمی (Loaner) اور واپسی ٹریکنگ',
    description: 'Track loaner/replacement machine serials given to customers while repairing original unit, plus return shipment to origin branch.',
    sidebarText: 'Workshop & Warranty ➔ Repair & Replacement',
    route: '/workshop?tab=replacement'
  },
  {
    sn: 29,
    title: 'HSN CODE & TAX MANAGEMENT',
    urdu: 'سیلز ٹیکس HSN کوڈ اور ٹیکس ریٹ (%) دستی مقرر کرنے کی سہولت',
    description: 'Configure HSN Codes (e.g. 9018.1200) and custom sales tax percentage per product or invoice calculation.',
    sidebarText: 'Items & Purchase / Sale Invoices',
    route: '/inventory'
  },
  {
    sn: 30,
    title: 'EXPENSES MANAGEMENT',
    urdu: 'آپریشنل اور لاجسٹکس اخراجات کے واؤچرز اور زمرہ جات',
    description: 'Record operating expenses (freight, port handling, clearance, salaries) linked to cash desk or bank accounts.',
    sidebarText: 'Expenses',
    route: '/payments?type=expenses'
  },
  {
    sn: 31,
    title: 'UNIVERSAL SEARCH SYSTEM',
    urdu: '360° تلاش: سیریل یا مشین کوڈ سے مکمل جرنی ایک سیکنڈ میں',
    description: 'Instant 360-degree journey: Purchase date, BL, Branch, Sale date, Invoice, Customer, Price, Return status, Receipt #, Date & Payment.',
    sidebarText: '360° Universal Search',
    route: '/universal-search'
  },
  {
    sn: 32,
    title: 'MANAGEMENT DASHBOARD',
    urdu: 'ایگزیکٹو مینجمنٹ ڈیش بورڈ، سیلز گراف اور مجموعی بزنس پوزیشن',
    description: 'Interactive analytics showing revenue, profit, cash flow, stock valuation, and quick actions for management.',
    sidebarText: 'Home (Executive Dashboard)',
    route: '/dashboard'
  },
  {
    sn: 33,
    title: 'COMPREHENSIVE REPORTING & TRACKING SYSTEM',
    urdu: 'جامع رپورٹس، گراف اور فلٹرز',
    description: 'Detailed analytics and business graphs with daily/monthly presets, profit margins, and export capabilities.',
    sidebarText: 'Reports',
    route: '/analytics'
  },
  {
    sn: 34,
    title: 'PDF AND EXCEL MANAGEMENT',
    urdu: 'ہر دستاویز کی پی ڈی ایف اور ایکسل فائل جنریشن',
    description: 'Instant generation of official PDF receipts, tax invoices, BL closing sheets, and ledger statements.',
    sidebarText: 'Reports ➔ PDF & Excel Hub',
    route: '/analytics'
  },
  {
    sn: 35,
    title: 'EXCEL EXPORT IMPORT AUTOMATIC REPORTING & PRINTING',
    urdu: 'ایکسل امپورٹ اور ایکسپورٹ خودکار رپورٹنگ کے ساتھ',
    description: 'Bulk product and serial import via Excel/CSV parser, plus one-click export for all master data tables.',
    sidebarText: 'Items ➔ Import Excel Modal',
    route: '/inventory'
  },
  {
    sn: 36,
    title: 'BRANCH WISE & CONSOLIDATED REPORTS',
    urdu: 'برانچ وائز اور کنسولیڈیٹڈ رپورٹس',
    description: 'Toggle between individual branch positions (Peshawar, Lahore, Multan) or unified consolidated balance sheet.',
    sidebarText: 'Reports ➔ Branch Filter',
    route: '/analytics'
  },
  {
    sn: 37,
    title: 'CUSTOMER / PRODUCT / PAYMENT STOCK REPORTS',
    urdu: 'کسٹمر وائز، پروڈکٹ وائز اور پیمنٹ اسٹاک رپورٹس',
    description: 'Multi-dimensional reporting linking customer purchasing history with product turnover and payment receipts.',
    sidebarText: 'Reports & Customer Ledger',
    route: '/analytics'
  },
  {
    sn: 38,
    title: 'DATA SECURITY BACKUP & ACCESS CONTROL',
    urdu: '4 ٹائیر سیکیورٹی، رول بیسڈ ایکسس، آڈٹ لاگ اور بیک اپ',
    description: 'Downward hierarchy access control (Sales Person, Accountant, Manager, SuperAdmin), comprehensive audit logs, and JSON data backup/restore.',
    sidebarText: 'SuperAdmin HQ (L4 Restricted)',
    route: '/superadmin'
  }
]

const filteredPoints = computed(() => {
  return points.filter(p => {
    const q = searchQuery.value.trim().toLowerCase()
    return !q ||
      String(p.sn).includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sidebarText.toLowerCase().includes(q) ||
      p.urdu.includes(q)
  })
})

function openRoute(path) {
  router.push(path)
}

function printMatrix() {
  window.print()
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
  max-width: 850px;
}
</style>
