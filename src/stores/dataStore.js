import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'

export const useDataStore = defineStore('data', () => {
  // Pre-seeded Initial Medical Equipment Products for Medimage Services ERP
  const initialProducts = [
    {
      id: 'prd_ultrasound_10',
      sku: 'MED-US-10P',
      name: '10 Inch Portable Ultrasound Scanner System',
      category: 'Ultrasound Machines',
      division: 'Medimage Services',
      hsnCode: '9018.1200',
      taxRatio: 18,
      allocationCity: 'Peshawar, Multan, Lahore',
      allocationCities: ['Peshawar', 'Multan', 'Lahore'],
      storageBin: 'HQ-PEW-A01',
      costPrice: 450000,
      sellingPrice: 650000,
      stockQty: 15,
      minStock: 3,
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_doppler_3d',
      sku: 'MED-US-DOP3D',
      name: 'Color Doppler 3D Medical Ultrasound Workstation',
      category: 'Ultrasound Machines',
      division: 'Medimage Services',
      hsnCode: '9018.1200',
      taxRatio: 18,
      allocationCity: 'Peshawar, Lahore',
      allocationCities: ['Peshawar', 'Lahore'],
      storageBin: 'HQ-PEW-A02',
      costPrice: 1200000,
      sellingPrice: 1750000,
      stockQty: 8,
      minStock: 2,
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_diode_laser',
      sku: 'MED-LSR-D808',
      name: '808nm Diode Laser Medical Aesthetic Machine',
      category: 'Laser Machines',
      division: 'Medimage Services',
      hsnCode: '9018.9000',
      taxRatio: 18,
      allocationCity: 'Multan, Peshawar',
      allocationCities: ['Multan', 'Peshawar'],
      storageBin: 'WH-MUX-L01',
      costPrice: 1800000,
      sellingPrice: 2450000,
      stockQty: 6,
      minStock: 2,
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_ecg_12ch',
      sku: 'MED-ECG-12CH',
      name: '12-Channel Digital Electrocardiograph Machine',
      category: 'Diagnostic Devices',
      division: 'Medimage Services',
      hsnCode: '9018.1100',
      taxRatio: 17,
      allocationCity: 'Peshawar, Multan, Lahore',
      allocationCities: ['Peshawar', 'Multan', 'Lahore'],
      storageBin: 'HQ-PEW-B05',
      costPrice: 140000,
      sellingPrice: 210000,
      stockQty: 25,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_xray_portable',
      sku: 'MED-XRAY-100MA',
      name: '100mA High Frequency Mobile Portable X-Ray Unit',
      category: 'Radiology Devices',
      division: 'Medimage Services',
      hsnCode: '9022.1400',
      taxRatio: 18,
      allocationCity: 'Lahore, Peshawar',
      allocationCities: ['Lahore', 'Peshawar'],
      storageBin: 'WH-LHR-R01',
      costPrice: 2200000,
      sellingPrice: 2950000,
      stockQty: 4,
      minStock: 1,
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80'
    }
  ]

  const initialSerials = [
    // 10 Inch Ultrasound Serials
    { serialCode: 'SN-US10-8801', machineCode: 'MC-101', productId: 'prd_ultrasound_10', sku: 'MED-US-10P', status: 'Available', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-A01', registeredDate: '2026-07-10', purchaseInvoiceNo: 'PO-2026-901', purchaseDate: '2026-07-10', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1200', taxRatio: 18, salePrice: 0 },
    { serialCode: 'SN-US10-8802', machineCode: 'MC-102', productId: 'prd_ultrasound_10', sku: 'MED-US-10P', status: 'Available', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-A01', registeredDate: '2026-07-10', purchaseInvoiceNo: 'PO-2026-901', purchaseDate: '2026-07-10', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1200', taxRatio: 18, salePrice: 0 },
    { serialCode: 'SN-US10-8803', machineCode: 'MC-103', productId: 'prd_ultrasound_10', sku: 'MED-US-10P', status: 'Sold', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-A01', registeredDate: '2026-07-10', purchaseInvoiceNo: 'PO-2026-901', purchaseDate: '2026-07-10', soldDate: '2026-08-01', customer: 'Northwest General Hospital Peshawar', invoiceNo: 'INV-2026-101', paymentStatus: 'Paid', paymentReceiptNo: 'RCT-2026-001', paymentDate: '2026-08-01', paymentAmount: 650000, paymentNotes: 'Full Cash Received at Peshawar HO', hsnCode: '9018.1200', taxRatio: 18, salePrice: 650000 },
    { serialCode: 'SN-US10-8804', machineCode: 'MC-104', productId: 'prd_ultrasound_10', sku: 'MED-US-10P', status: 'Sold', allocationCity: 'Multan', binLocation: 'WH-MUX-A01', registeredDate: '2026-07-10', purchaseInvoiceNo: 'PO-2026-901', purchaseDate: '2026-07-10', soldDate: '2026-08-02', customer: 'Multan Medical Complex', invoiceNo: 'INV-2026-102', paymentStatus: 'Paid', paymentReceiptNo: 'RCT-2026-002', paymentDate: '2026-08-02', paymentAmount: 650000, paymentNotes: 'Meezan Bank Transfer', hsnCode: '9018.1200', taxRatio: 18, salePrice: 650000 },
    { serialCode: 'SN-US10-8805', machineCode: 'MC-105', productId: 'prd_ultrasound_10', sku: 'MED-US-10P', status: 'Sold', allocationCity: 'Multan', binLocation: 'WH-MUX-A01', registeredDate: '2026-07-10', purchaseInvoiceNo: 'PO-2026-901', purchaseDate: '2026-07-10', soldDate: '2026-08-02', customer: 'Multan Medical Complex', invoiceNo: 'INV-2026-102', paymentStatus: 'Pending', paymentReceiptNo: null, paymentDate: null, paymentAmount: 0, paymentNotes: '', hsnCode: '9018.1200', taxRatio: 18, salePrice: 650000 },

    // Laser Machine Serials
    { serialCode: 'SN-LSR-9901', machineCode: 'MC-201', productId: 'prd_diode_laser', sku: 'MED-LSR-D808', status: 'Available', allocationCity: 'Multan', binLocation: 'WH-MUX-L01', registeredDate: '2026-07-15', purchaseInvoiceNo: 'PO-2026-902', purchaseDate: '2026-07-15', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.9000', taxRatio: 18, salePrice: 0 },
    { serialCode: 'SN-LSR-9902', machineCode: 'MC-202', productId: 'prd_diode_laser', sku: 'MED-LSR-D808', status: 'Sold', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-A02', registeredDate: '2026-07-15', purchaseInvoiceNo: 'PO-2026-902', purchaseDate: '2026-07-15', soldDate: '2026-08-03', customer: 'Khyber Aesthetics & Laser Clinic', invoiceNo: 'INV-2026-103', paymentStatus: 'Paid', paymentReceiptNo: 'RCT-2026-003', paymentDate: '2026-08-03', paymentAmount: 2450000, paymentNotes: 'HBL Online Bank Transfer', hsnCode: '9018.9000', taxRatio: 18, salePrice: 2450000 },
    { serialCode: 'SN-LSR-9903', machineCode: 'MC-203', productId: 'prd_diode_laser', sku: 'MED-LSR-D808', status: 'Sold', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-A02', registeredDate: '2026-07-15', purchaseInvoiceNo: 'PO-2026-902', purchaseDate: '2026-07-15', soldDate: '2026-08-03', customer: 'Khyber Aesthetics & Laser Clinic', invoiceNo: 'INV-2026-103', paymentStatus: 'Pending', paymentReceiptNo: null, paymentDate: null, paymentAmount: 0, paymentNotes: '', hsnCode: '9018.9000', taxRatio: 18, salePrice: 2450000 },

    // ECG Serials
    { serialCode: 'SN-ECG-3301', machineCode: 'MC-301', productId: 'prd_ecg_12ch', sku: 'MED-ECG-12CH', status: 'Available', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-B05', registeredDate: '2026-07-20', purchaseInvoiceNo: 'PO-2026-903', purchaseDate: '2026-07-20', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1100', taxRatio: 17, salePrice: 0 },
    { serialCode: 'SN-ECG-3302', machineCode: 'MC-302', productId: 'prd_ecg_12ch', sku: 'MED-ECG-12CH', status: 'Available', allocationCity: 'Lahore', binLocation: 'WH-LHR-B02', registeredDate: '2026-07-20', purchaseInvoiceNo: 'PO-2026-903', purchaseDate: '2026-07-20', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1100', taxRatio: 17, salePrice: 0 }
  ]

  const initialPurchaseOrders = [
    {
      poNumber: 'PO-2026-901',
      supplier: 'Mindray Medical International',
      orderDate: '2026-07-10',
      status: 'Completed',
      branch: 'Peshawar',
      division: 'Medimage Services',
      items: [
        { productId: 'prd_ultrasound_10', productName: '10 Inch Portable Ultrasound Scanner System', qty: 5, unitCost: 450000, totalCost: 2250000, hsnCode: '9018.1200', taxRatio: 18, allocationCity: 'Peshawar, Multan' }
      ],
      totalAmount: 2250000,
      createdBy: 'Peshawar HO Operations'
    },
    {
      poNumber: 'PO-2026-902',
      supplier: 'Alma Lasers Technology Inc.',
      orderDate: '2026-07-15',
      status: 'Completed',
      branch: 'Peshawar',
      division: 'Medimage Services',
      items: [
        { productId: 'prd_diode_laser', productName: '808nm Diode Laser Medical Aesthetic Machine', qty: 3, unitCost: 1800000, totalCost: 5400000, hsnCode: '9018.9000', taxRatio: 18, allocationCity: 'Multan, Peshawar' }
      ],
      totalAmount: 5400000,
      createdBy: 'Peshawar HO Operations'
    }
  ]

  const initialSalesInvoices = [
    {
      invoiceNo: 'INV-2026-101',
      customer: 'Northwest General Hospital Peshawar',
      branch: 'Peshawar',
      division: 'Medimage Services',
      saleDate: '2026-08-01',
      paymentMethod: 'Cash Payment',
      taxRatio: 18,
      items: [
        { productId: 'prd_ultrasound_10', productName: '10 Inch Portable Ultrasound Scanner System', qty: 1, unitPrice: 650000, unitCost: 450000, hsnCode: '9018.1200', taxRatio: 18, total: 650000, serials: ['SN-US10-8803'], machineCodes: ['MC-103'] }
      ],
      subtotal: 650000,
      tax: 117000,
      discount: 0,
      grandTotal: 767000,
      totalCost: 450000,
      netProfit: 200000,
      marginPercent: 30.77,
      sellerName: 'Engr. Ahmad (HO Peshawar)'
    },
    {
      invoiceNo: 'INV-2026-102',
      customer: 'Multan Medical Complex',
      branch: 'Multan',
      division: 'Medimage Services',
      saleDate: '2026-08-02',
      paymentMethod: 'Bank Transfer (Meezan Bank)',
      taxRatio: 18,
      items: [
        { productId: 'prd_ultrasound_10', productName: '10 Inch Portable Ultrasound Scanner System', qty: 2, unitPrice: 650000, unitCost: 450000, hsnCode: '9018.1200', taxRatio: 18, total: 1300000, serials: ['SN-US10-8804', 'SN-US10-8805'], machineCodes: ['MC-104', 'MC-105'] }
      ],
      subtotal: 1300000,
      tax: 234000,
      discount: 50000,
      grandTotal: 1484000,
      totalCost: 900000,
      netProfit: 350000,
      marginPercent: 26.92,
      sellerName: 'Usman Ali (Multan Branch)'
    },
    {
      invoiceNo: 'INV-2026-103',
      customer: 'Khyber Aesthetics & Laser Clinic',
      branch: 'Peshawar',
      division: 'Medimage Services',
      saleDate: '2026-08-03',
      paymentMethod: 'Bank Transfer (HBL)',
      taxRatio: 18,
      items: [
        { productId: 'prd_diode_laser', productName: '808nm Diode Laser Medical Aesthetic Machine', qty: 2, unitPrice: 2450000, unitCost: 1800000, hsnCode: '9018.9000', taxRatio: 18, total: 4900000, serials: ['SN-LSR-9902', 'SN-LSR-9903'], machineCodes: ['MC-202', 'MC-203'] }
      ],
      subtotal: 4900000,
      tax: 882000,
      discount: 100000,
      grandTotal: 5682000,
      totalCost: 3600000,
      netProfit: 1200000,
      marginPercent: 24.49,
      sellerName: 'Engr. Ahmad (HO Peshawar)'
    }
  ]

  const initialPaymentReceipts = [
    {
      receiptNo: 'RCT-2026-001',
      customer: 'Northwest General Hospital Peshawar',
      paymentDate: '2026-08-01',
      paymentType: 'Cash Payment',
      paymentMethod: 'Cash Payment',
      amount: 767000,
      branch: 'Peshawar',
      division: 'Medimage Services',
      description: 'Full Cash Payment received for Ultrasound MC-103 at HO Peshawar',
      paidSerials: [
        { serialCode: 'SN-US10-8803', machineCode: 'MC-103', productName: '10 Inch Portable Ultrasound Scanner System', amountAllocated: 767000 }
      ],
      receivedBy: 'Peshawar Accounts counter'
    },
    {
      receiptNo: 'RCT-2026-002',
      customer: 'Multan Medical Complex',
      paymentDate: '2026-08-02',
      paymentType: 'Bank Payment',
      paymentMethod: 'Bank Payment',
      amount: 742000,
      branch: 'Multan',
      division: 'Medimage Services',
      description: 'Part Payment (50%) for 2 Ultrasound units. Allocated to Machine MC-104',
      paidSerials: [
        { serialCode: 'SN-US10-8804', machineCode: 'MC-104', productName: '10 Inch Portable Ultrasound Scanner System', amountAllocated: 742000 }
      ],
      receivedBy: 'Multan Accounts Office'
    },
    {
      receiptNo: 'RCT-2026-003',
      customer: 'Khyber Aesthetics & Laser Clinic',
      paymentDate: '2026-08-03',
      paymentType: 'Bank Payment',
      paymentMethod: 'Bank Payment',
      amount: 2841000,
      branch: 'Peshawar',
      division: 'Medimage Services',
      description: '50% advance bank transfer for 2 Laser units. Allocated to MC-202',
      paidSerials: [
        { serialCode: 'SN-LSR-9902', machineCode: 'MC-202', productName: '808nm Diode Laser Medical Aesthetic Machine', amountAllocated: 2841000 }
      ],
      receivedBy: 'Peshawar Accounts HO'
    }
  ]

  const initialStockTransfers = [
    {
      transferNo: 'TR-2026-001',
      transferDate: '2026-07-28',
      fromBranch: 'Peshawar',
      toBranch: 'Multan',
      division: 'Medimage Services',
      serials: [
        { serialCode: 'SN-US10-8804', machineCode: 'MC-104', productName: '10 Inch Portable Ultrasound Scanner System' },
        { serialCode: 'SN-US10-8805', machineCode: 'MC-105', productName: '10 Inch Portable Ultrasound Scanner System' }
      ],
      notes: 'Transfer 2 units Ultrasound from HO Peshawar to Multan Branch warehouse',
      transferredBy: 'Logistics Supervisor'
    }
  ]

  const initialAuditLogs = [
    {
      id: 'log_01',
      timestamp: '2026-08-03 14:22:05',
      user: 'Engr. Ahmad (HO Peshawar)',
      role: 'superadmin',
      category: 'SALES',
      action: 'Issued Invoice INV-2026-103',
      details: 'Sold 2 Diode Lasers to Khyber Aesthetics. Serials: SN-LSR-9902 (MC-202), SN-LSR-9903 (MC-203)',
      severity: 'normal'
    },
    {
      id: 'log_02',
      timestamp: '2026-08-02 11:05:40',
      user: 'Usman Ali (Multan)',
      role: 'manager',
      category: 'PAYMENTS',
      action: 'Received Receipt RCT-2026-002',
      details: 'Recorded Meezan Bank Payment PKR 742,000 for Machine MC-104 (Multan Medical Complex)',
      severity: 'normal'
    },
    {
      id: 'log_03',
      timestamp: '2026-07-28 09:15:00',
      user: 'Logistics Supervisor',
      role: 'admin',
      category: 'INVENTORY',
      action: 'Branch Transfer TR-2026-001',
      details: 'Transferred 2 Ultrasound units (MC-104, MC-105) from Peshawar HO to Multan Branch',
      severity: 'normal'
    }
  ]

  // Persistent Reactive State (Central Pinia Store State)
  const products = ref(initialProducts)
  const serials = ref(initialSerials)
  const purchaseOrders = ref(initialPurchaseOrders)
  const salesInvoices = ref(initialSalesInvoices)
  const paymentReceipts = ref(initialPaymentReceipts)
  const stockTransfers = ref(initialStockTransfers)
  const auditLogs = ref(initialAuditLogs)

  // Clear legacy localStorage cache to prevent stale data conflicts
  try {
    localStorage.removeItem('nexis_products')
    localStorage.removeItem('nexis_serials')
    localStorage.removeItem('nexis_pos')
    localStorage.removeItem('nexis_sales')
    localStorage.removeItem('nexis_payments')
    localStorage.removeItem('nexis_transfers')
    localStorage.removeItem('nexis_audit_logs')
  } catch (e) {}

  // Sync with MongoDB API backend on mount if online
  onMounted(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const mongoProducts = await res.json()
        if (Array.isArray(mongoProducts) && mongoProducts.length > 0) {
          products.value = mongoProducts
        }
      }
    } catch (e) {
      console.log('MongoDB server offline, using in-memory store state.')
    }
  })

  function saveState() {
    // Pure in-memory Pinia store state
  }

  // Metrics & Aggregations
  const totalRevenue = computed(() => salesInvoices.value.reduce((acc, inv) => acc + (inv.subtotal - (inv.discount || 0)), 0))
  const totalCOGS = computed(() => salesInvoices.value.reduce((acc, inv) => acc + inv.totalCost, 0))
  const grossProfit = computed(() => totalRevenue.value - totalCOGS.value)
  const profitMarginPercent = computed(() => totalRevenue.value ? ((grossProfit.value / totalRevenue.value) * 100).toFixed(2) : 0)
  
  const totalPurchasesCost = computed(() => purchaseOrders.value.reduce((acc, po) => acc + po.totalAmount, 0))
  const inventoryValuationCost = computed(() => products.value.reduce((acc, p) => acc + (p.stockQty * p.costPrice), 0))
  const inventoryValuationRetail = computed(() => products.value.reduce((acc, p) => acc + (p.stockQty * p.sellingPrice), 0))

  const lowStockProducts = computed(() => products.value.filter(p => p.stockQty <= p.minStock))
  const availableSerialsCount = computed(() => serials.value.filter(s => s.status === 'Available').length)

  const checkAndBalance = computed(() => {
    const cashInflows = salesInvoices.value.filter(i => i.paymentMethod === 'Cash Payment').reduce((acc, i) => acc + (i.grandTotal || 0), 0)
    const cardBankInflows = salesInvoices.value.filter(i => i.paymentMethod !== 'Cash Payment').reduce((acc, i) => acc + (i.grandTotal || 0), 0)
    const totalInflows = cashInflows + cardBankInflows
    
    const manualDiscountsTotal = salesInvoices.value.reduce((acc, i) => acc + (i.discount || 0), 0)
    const defectiveLossValuation = serials.value.filter(s => s.status === 'Defective').length * 250000
    
    return {
      cashInflows,
      cardBankInflows,
      totalInflows,
      manualDiscountsTotal,
      defectiveLossValuation,
      balancedStatus: manualDiscountsTotal < 150000 && defectiveLossValuation < 500000 ? 'BALANCED' : 'ATTENTION_REQUIRED',
      healthScore: 99.2
    }
  })

  // Duplicate Serial Number check across system
  function checkDuplicateSerial(serialCode) {
    if (!serialCode) return false
    const codeClean = serialCode.trim().toLowerCase()
    return serials.value.some(s => s.serialCode && s.serialCode.trim().toLowerCase() === codeClean)
  }

  // Check existing Machine Code
  function checkDuplicateMachineCode(mCode) {
    if (!mCode) return false
    const codeClean = mCode.trim().toLowerCase()
    return serials.value.some(s => s.machineCode && s.machineCode.trim().toLowerCase() === codeClean)
  }

  // Universal Search 360 Machine Journey Lookup
  function searchMachineJourney(queryTerm) {
    if (!queryTerm) return null
    const q = queryTerm.trim().toLowerCase()
    const serialDoc = serials.value.find(s => 
      (s.serialCode && s.serialCode.trim().toLowerCase() === q) || 
      (s.machineCode && s.machineCode.trim().toLowerCase() === q)
    )

    if (!serialDoc) return null

    const product = products.value.find(p => p.id === serialDoc.productId || p.sku === serialDoc.sku)
    const saleInvoice = serialDoc.invoiceNo ? salesInvoices.value.find(i => i.invoiceNo === serialDoc.invoiceNo) : null
    const purchaseOrder = serialDoc.purchaseInvoiceNo ? purchaseOrders.value.find(po => po.poNumber === serialDoc.purchaseInvoiceNo) : null
    const matchingReceipts = paymentReceipts.value.filter(r => r.paidSerials && r.paidSerials.some(ps => ps.serialCode === serialDoc.serialCode))

    return {
      serial: serialDoc,
      product,
      saleInvoice,
      purchaseOrder,
      paymentReceipts: matchingReceipts
    }
  }

  // Get Customer Ledger & Purchased History
  function getCustomerLedger(customerName) {
    if (!customerName) return null
    const cNameClean = customerName.trim().toLowerCase()

    const invoices = salesInvoices.value.filter(i => i.customer && i.customer.trim().toLowerCase() === cNameClean)
    const receipts = paymentReceipts.value.filter(r => r.customer && r.customer.trim().toLowerCase() === cNameClean)
    const customerMachines = serials.value.filter(s => s.customer && s.customer.trim().toLowerCase() === cNameClean)

    const paidMachines = customerMachines.filter(s => s.paymentStatus === 'Paid')
    const pendingMachines = customerMachines.filter(s => s.paymentStatus !== 'Paid')

    const totalInvoiced = invoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0)
    const totalPaid = receipts.reduce((acc, r) => acc + (r.amount || 0), 0)
    const outstandingBalance = Math.max(0, totalInvoiced - totalPaid)

    // Items bought since last year with breakdown
    const purchasedItemsMap = {}
    invoices.forEach(inv => {
      inv.items.forEach(it => {
        if (!purchasedItemsMap[it.productName]) {
          purchasedItemsMap[it.productName] = {
            productName: it.productName,
            totalQty: 0,
            totalAmount: 0,
            lastPurchaseDate: inv.saleDate
          }
        }
        purchasedItemsMap[it.productName].totalQty += Number(it.qty)
        purchasedItemsMap[it.productName].totalAmount += Number(it.total || 0)
        if (new Date(inv.saleDate) > new Date(purchasedItemsMap[it.productName].lastPurchaseDate)) {
          purchasedItemsMap[it.productName].lastPurchaseDate = inv.saleDate
        }
      })
    })

    return {
      customerName,
      invoices,
      receipts,
      customerMachines,
      paidMachines,
      pendingMachines,
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      purchasedItems: Object.values(purchasedItemsMap)
    }
  }

  // Get Historical Stock Position on any given date
  function getHistoricalStock(targetDate, branchFilter = 'ALL') {
    if (!targetDate) return { totalUnits: 0, productsSummary: [], serialsSnapshot: [] }

    const cleanTargetDate = targetDate.substring(0, 10)

    // Filter serials registered on or before targetDate, and not sold before targetDate
    const snapshotSerials = serials.value.filter(s => {
      const regDate = (s.registeredDate || s.createdAt || '2000-01-01').substring(0, 10)
      const soldDate = s.soldDate ? s.soldDate.substring(0, 10) : null
      
      const wasRegistered = regDate <= cleanTargetDate
      const wasNotSoldYet = !soldDate || soldDate > cleanTargetDate
      const matchesBranch = branchFilter === 'ALL' || s.allocationCity === branchFilter

      return wasRegistered && wasNotSoldYet && matchesBranch
    })

    const productMap = {}
    snapshotSerials.forEach(s => {
      const key = s.sku
      if (!productMap[key]) {
        const prod = products.value.find(p => p.sku === s.sku)
        productMap[key] = {
          sku: s.sku,
          productName: prod ? prod.name : s.sku,
          category: prod ? prod.category : 'Medical Device',
          stockQty: 0,
          branch: s.allocationCity
        }
      }
      productMap[key].stockQty++
    })

    return {
      targetDate,
      branch: branchFilter,
      totalUnits: snapshotSerials.length,
      productsSummary: Object.values(productMap),
      serialsSnapshot: snapshotSerials
    }
  }

  // Action Methods
  async function addAuditLog(user, role, category, action, details, severity = 'normal') {
    const now = new Date()
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19)
    const userName = typeof user === 'object' ? (user?.name || 'Admin User') : (user || 'Admin User')
    const userRole = typeof user === 'object' ? (user?.role || 'SuperAdmin') : (role || 'Admin')
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp,
      user: userName,
      role: userRole,
      category,
      action,
      details,
      severity
    }
    auditLogs.value.unshift(newLog)
    saveState()

    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      })
    } catch (e) {}
  }

  async function addProduct(productData, user) {
    const citiesArr = productData.allocationCities && productData.allocationCities.length > 0 ? productData.allocationCities : ['Peshawar']
    const citiesStr = citiesArr.join(', ')
    const cityQuantitiesMap = productData.cityQuantities || {}

    let totalStockQty = 0
    if (Object.keys(cityQuantitiesMap).length > 0) {
      citiesArr.forEach(c => {
        totalStockQty += Number(cityQuantitiesMap[c] || 0)
      })
    } else {
      totalStockQty = Number(productData.stockQty || 0)
    }

    const newProduct = {
      id: `prd_${Date.now()}`,
      sku: productData.sku.toUpperCase(),
      name: productData.name,
      category: productData.category || 'Medical Equipment',
      division: productData.division || 'Medimage Services',
      hsnCode: productData.hsnCode || '9018.1200',
      taxRatio: Number(productData.taxRatio || 18),
      allocationCity: citiesStr,
      allocationCities: citiesArr,
      storageBin: productData.storageBin || 'HQ-PEW-01',
      costPrice: Number(productData.costPrice || 0),
      sellingPrice: Number(productData.sellingPrice || productData.salePrice || 0),
      stockQty: totalStockQty,
      minStock: Number(productData.minStock || 2),
      image: productData.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
    }
    products.value.unshift(newProduct)

    // Generate Serials with Machine Codes
    let globalIndex = serials.value.length + 100
    if (Object.keys(cityQuantitiesMap).length > 0) {
      citiesArr.forEach(cityName => {
        const cityQty = Number(cityQuantitiesMap[cityName] || 0)
        for (let i = 1; i <= cityQty; i++) {
          globalIndex++
          const serialCode = `SN-${newProduct.sku}-${String(globalIndex).padStart(4, '0')}`
          const machineCode = `MC-${globalIndex}`
          
          if (!checkDuplicateSerial(serialCode)) {
            serials.value.unshift({
              serialCode,
              machineCode,
              productId: newProduct.id,
              sku: newProduct.sku,
              status: 'Available',
              allocationCity: cityName,
              binLocation: newProduct.storageBin,
              registeredDate: new Date().toISOString().substring(0, 10),
              soldDate: null,
              customer: null,
              invoiceNo: null,
              paymentStatus: 'Pending',
              hsnCode: newProduct.hsnCode,
              taxRatio: newProduct.taxRatio,
              salePrice: 0
            })
          }
        }
      })
    } else if (newProduct.stockQty > 0) {
      for (let i = 1; i <= newProduct.stockQty; i++) {
        globalIndex++
        const assignedCity = citiesArr[(i - 1) % citiesArr.length]
        const serialCode = `SN-${newProduct.sku}-${String(globalIndex).padStart(4, '0')}`
        const machineCode = `MC-${globalIndex}`

        if (!checkDuplicateSerial(serialCode)) {
          serials.value.unshift({
            serialCode,
            machineCode,
            productId: newProduct.id,
            sku: newProduct.sku,
            status: 'Available',
            allocationCity: assignedCity,
            binLocation: newProduct.storageBin,
            registeredDate: new Date().toISOString().substring(0, 10),
            soldDate: null,
            customer: null,
            invoiceNo: null,
            paymentStatus: 'Pending',
            hsnCode: newProduct.hsnCode,
            taxRatio: newProduct.taxRatio,
            salePrice: 0
          })
        }
      }
    }

    const uName = user?.name || 'Admin User'
    const uRole = user?.role || 'SuperAdmin'
    addAuditLog(uName, uRole, 'INVENTORY', `Added Medical Device ${newProduct.name}`, `SKU: ${newProduct.sku}, HSN: ${newProduct.hsnCode}, Tax: ${newProduct.taxRatio}%, Cities: ${citiesStr}`)
    saveState()

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })
    } catch (e) {}

    return newProduct
  }

  async function updateProduct(productId, updatedFields, user) {
    const p = products.value.find(prod => prod.id === productId || prod._id === productId)
    if (p) {
      Object.assign(p, updatedFields)
      if (updatedFields.allocationCities) {
        p.allocationCity = updatedFields.allocationCities.join(', ')
      }
      const uName = user?.name || 'Admin User'
      const uRole = user?.role || 'SuperAdmin'
      addAuditLog(uName, uRole, 'INVENTORY', `Updated Product ${p.name}`, `SKU: ${p.sku}, Price: PKR ${p.sellingPrice}`)
      saveState()

      const targetId = p._id || p.id
      try {
        await fetch(`/api/products/${targetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields)
        })
      } catch (e) {}
    }
  }

  async function deleteProduct(productId, user) {
    const pIndex = products.value.findIndex(prod => prod.id === productId || prod._id === productId)
    if (pIndex !== -1) {
      const deletedProd = products.value[pIndex]
      products.value.splice(pIndex, 1)
      serials.value = serials.value.filter(s => s.productId !== productId)

      const uName = user?.name || 'Admin User'
      const uRole = user?.role || 'SuperAdmin'
      addAuditLog(uName, uRole, 'INVENTORY', `Deleted Product ${deletedProd.name}`, `Removed SKU ${deletedProd.sku}`, 'warning')
      saveState()

      const targetId = deletedProd._id || deletedProd.id
      try {
        await fetch(`/api/products/${targetId}`, {
          method: 'DELETE'
        })
      } catch (e) {}
    }
  }

  async function createPurchaseOrder(poData, user) {
    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`
    let totalAmount = 0

    // Validate duplicate serials in batch list first!
    const allInputSerials = []
    poData.items.forEach(item => {
      if (item.serialList && Array.isArray(item.serialList)) {
        item.serialList.forEach(s => allInputSerials.push(s.trim()))
      }
    })

    const duplicates = allInputSerials.filter(s => checkDuplicateSerial(s))
    if (duplicates.length > 0) {
      throw new Error(`Duplicate Serial Number(s) detected: ${duplicates.join(', ')}. Serial numbers must be unique across the system!`)
    }

    const items = poData.items.map(item => {
      const lineCost = item.qty * item.unitCost
      totalAmount += lineCost

      const product = products.value.find(p => p.id === item.productId)
      const targetCities = Array.isArray(item.allocationCities) && item.allocationCities.length > 0 ? item.allocationCities : [(item.allocationCity || 'Peshawar')]
      
      if (product) {
        product.stockQty += Number(item.qty)
        targetCities.forEach(c => {
          if (!product.allocationCities) product.allocationCities = [product.allocationCity]
          if (!product.allocationCities.includes(c)) product.allocationCities.push(c)
        })
        product.allocationCity = product.allocationCities.join(', ')

        const startMachineCodeNum = Number(item.startMachineCodeNum) || (serials.value.length + 101)

        for (let i = 1; i <= item.qty; i++) {
          const assignedCity = targetCities[(i - 1) % targetCities.length]
          
          let serialCode = ''
          if (item.serialList && item.serialList[i - 1]) {
            serialCode = item.serialList[i - 1].trim()
          } else {
            serialCode = `SN-${product.sku}-${Date.now().toString().slice(-4)}${i}`
          }

          const machineCode = item.machineCodeList && item.machineCodeList[i - 1] 
            ? item.machineCodeList[i - 1].trim()
            : `MC-${startMachineCodeNum + i - 1}`

          serials.value.unshift({
            serialCode,
            machineCode,
            productId: product.id,
            sku: product.sku,
            status: 'Available',
            allocationCity: assignedCity,
            binLocation: product.storageBin,
            registeredDate: new Date().toISOString().substring(0, 10),
            purchaseInvoiceNo: poNumber,
            purchaseDate: new Date().toISOString().substring(0, 10),
            soldDate: null,
            customer: null,
            invoiceNo: null,
            paymentStatus: 'Pending',
            hsnCode: item.hsnCode || product.hsnCode || '9018.1200',
            taxRatio: Number(item.taxRatio || product.taxRatio || 18),
            salePrice: 0
          })
        }
      }
      return {
        productId: item.productId,
        productName: item.productName,
        qty: Number(item.qty),
        unitCost: Number(item.unitCost),
        totalCost: lineCost,
        hsnCode: item.hsnCode || '9018.1200',
        taxRatio: Number(item.taxRatio || 18),
        allocationCity: targetCities.join(', ')
      }
    })

    const newPO = {
      poNumber,
      supplier: poData.supplier,
      orderDate: new Date().toISOString().substring(0, 10),
      status: 'Completed',
      branch: poData.branch || 'Peshawar',
      division: 'Medimage Services',
      items,
      totalAmount,
      createdBy: user.name
    }

    purchaseOrders.value.unshift(newPO)
    addAuditLog(user.name, user.role, 'PURCHASING', `Created Purchase Order ${poNumber}`, `Supplier: ${poData.supplier}, Total Amount: PKR ${totalAmount.toLocaleString()}`)
    saveState()

    try {
      await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPO)
      })
    } catch (e) {}

    return newPO
  }

  async function processSaleInvoice(saleData, user) {
    const invoiceNo = `INV-2026-${String(salesInvoices.value.length + 100).padStart(3, '0')}`
    let subtotal = 0
    let totalCost = 0

    const uName = user?.name || (typeof user === 'string' ? user : 'Admin User')
    const uRole = user?.role || 'SuperAdmin'

    const items = (saleData.items || []).map(item => {
      const product = products.value.find(p => p.id === item.productId || p.sku === item.sku)
      const unitPrice = Number(item.unitPrice || item.sellingPrice || item.salePrice || 0)
      const lineTotal = item.qty * unitPrice
      const lineCost = item.qty * (product ? (product.costPrice || 0) : 0)

      subtotal += lineTotal
      totalCost += lineCost

      if (product) {
        product.stockQty = Math.max(0, product.stockQty - item.qty)
      }

      const assignedMachineCodes = []
      const serialsList = item.selectedSerials || item.serials || []
      if (serialsList.length > 0) {
        serialsList.forEach(sCode => {
          const serialObj = serials.value.find(s => s.serialCode === sCode)
          if (serialObj) {
            serialObj.status = 'Sold'
            serialObj.soldDate = new Date().toISOString().substring(0, 10)
            serialObj.customer = saleData.customer
            serialObj.invoiceNo = invoiceNo
            serialObj.salePrice = unitPrice
            if (serialObj.machineCode) assignedMachineCodes.push(serialObj.machineCode)
          }
        })
      }

      return {
        productId: item.productId || (product ? product.id : ''),
        productName: item.productName || (product ? product.name : ''),
        qty: item.qty,
        unitPrice,
        unitCost: product ? (product.costPrice || 0) : 0,
        hsnCode: item.hsnCode || (product ? product.hsnCode : '9018.1200'),
        taxRatio: item.taxRatio || (product ? product.taxRatio : 18),
        total: lineTotal,
        serials: serialsList,
        machineCodes: assignedMachineCodes
      }
    })

    const invoiceTaxRatio = Number(saleData.taxRatio || 18)
    const tax = (subtotal * invoiceTaxRatio) / 100
    const discount = Number(saleData.discount || 0)
    const grandTotal = (subtotal + tax) - discount
    const netProfit = subtotal - discount - totalCost
    const marginPercent = subtotal ? ((netProfit / subtotal) * 100) : 0

    const newInvoice = {
      invoiceNo,
      customer: saleData.customer,
      branch: saleData.branch || 'Peshawar',
      division: 'Medimage Services',
      saleDate: new Date().toISOString().substring(0, 10),
      paymentMethod: saleData.paymentMethod || 'Cash Payment',
      taxRatio: invoiceTaxRatio,
      items,
      subtotal,
      tax,
      discount,
      grandTotal,
      totalCost,
      netProfit,
      marginPercent: Number(marginPercent.toFixed(2)),
      sellerName: uName
    }

    salesInvoices.value.unshift(newInvoice)
    
    // If full Cash payment on sale, auto-generate Payment Receipt and mark serials as Paid
    if (saleData.paymentMethod === 'Cash Payment') {
      const receiptNo = `RCT-2026-${String(paymentReceipts.value.length + 1).padStart(3, '0')}`
      const paidSerialsList = []
      
      items.forEach(it => {
        it.serials.forEach((sCode, idx) => {
          const serialObj = serials.value.find(s => s.serialCode === sCode)
          if (serialObj) {
            serialObj.paymentStatus = 'Paid'
            serialObj.paymentReceiptNo = receiptNo
            serialObj.paymentDate = newInvoice.saleDate
            serialObj.paymentAmount = it.unitPrice
            serialObj.paymentNotes = 'Full Cash Payment at Invoice Issuance'
            paidSerialsList.push({
              serialCode: sCode,
              machineCode: serialObj.machineCode,
              productName: it.productName,
              amountAllocated: it.unitPrice
            })
          }
        })
      })

      const newReceipt = {
        receiptNo,
        customer: saleData.customer,
        paymentDate: newInvoice.saleDate,
        paymentType: 'Cash Payment',
        paymentMethod: 'Cash Payment',
        amount: grandTotal,
        branch: newInvoice.branch,
        division: 'Medimage Services',
        description: `Full Cash Receipt for Invoice ${invoiceNo}`,
        paidSerials: paidSerialsList,
        receivedBy: uName
      }
      paymentReceipts.value.unshift(newReceipt)
    }

    addAuditLog(uName, uRole, 'SALES', `Issued Sale Invoice ${invoiceNo}`, `Customer: ${saleData.customer}, Branch: ${newInvoice.branch}, Grand Total: PKR ${grandTotal.toLocaleString()}`)
    saveState()

    try {
      await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      })
    } catch (e) {}

    return newInvoice
  }

  // Payment In Module Handler (Machine-Wise Payment Allocation)
  async function recordPaymentIn(paymentData, user) {
    const receiptNo = `RCT-2026-${String(paymentReceipts.value.length + 1).padStart(3, '0')}`
    const paidSerialsList = []

    if (paymentData.allocatedSerials && paymentData.allocatedSerials.length > 0) {
      paymentData.allocatedSerials.forEach(item => {
        const serialObj = serials.value.find(s => s.serialCode === item.serialCode)
        if (serialObj) {
          serialObj.paymentStatus = 'Paid'
          serialObj.paymentReceiptNo = receiptNo
          serialObj.paymentDate = paymentData.paymentDate || new Date().toISOString().substring(0, 10)
          serialObj.paymentAmount = Number(item.amountAllocated || serialObj.salePrice || 0)
          serialObj.paymentNotes = paymentData.description || 'Payment Received'
          
          paidSerialsList.push({
            serialCode: serialObj.serialCode,
            machineCode: serialObj.machineCode,
            productName: item.productName || serialObj.sku,
            amountAllocated: Number(item.amountAllocated || serialObj.salePrice || 0)
          })
        }
      })
    }

    const pType = paymentData.paymentType || paymentData.paymentMethod || 'Cash Payment'
    const newReceipt = {
      receiptNo,
      customer: paymentData.customer,
      paymentDate: paymentData.paymentDate || new Date().toISOString().substring(0, 10),
      paymentType: pType,
      paymentMethod: pType,
      amount: Number(paymentData.amount),
      branch: paymentData.branch || 'Peshawar',
      division: 'Medimage Services',
      description: paymentData.description || '',
      paidSerials: paidSerialsList,
      receivedBy: user.name
    }

    paymentReceipts.value.unshift(newReceipt)
    addAuditLog(user.name, user.role, 'PAYMENTS', `Recorded Payment In ${receiptNo}`, `Customer: ${paymentData.customer}, Amount: PKR ${Number(paymentData.amount).toLocaleString()}, Machines Paid: ${paidSerialsList.length}`)
    saveState()

    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReceipt)
      })
    } catch (e) {}

    return newReceipt
  }

  // Branch-to-Branch Stock Transfer Handler
  async function transferBranchStock(transferData, user, toBranchOpt, notesOpt, userOpt) {
    let tData = {}
    let actualUser = user

    if (Array.isArray(transferData)) {
      tData = {
        selectedSerials: transferData,
        fromBranch: user,
        toBranch: toBranchOpt,
        notes: notesOpt || ''
      }
      actualUser = userOpt
    } else {
      tData = transferData || {}
    }

    const transferNo = `TR-2026-${String(stockTransfers.value.length + 1).padStart(3, '0')}`
    const serialsMoved = []

    if (tData.selectedSerials && tData.selectedSerials.length > 0) {
      tData.selectedSerials.forEach(sCode => {
        const serialObj = serials.value.find(s => s.serialCode === sCode)
        if (serialObj) {
          serialObj.allocationCity = tData.toBranch
          serialsMoved.push({
            serialCode: serialObj.serialCode,
            machineCode: serialObj.machineCode,
            productName: serialObj.sku
          })
        }
      })
    }

    const uName = actualUser?.name || (typeof actualUser === 'string' ? actualUser : 'Admin User')
    const uRole = actualUser?.role || 'SuperAdmin'

    const newTransfer = {
      transferNo,
      transferDate: new Date().toISOString().substring(0, 10),
      fromBranch: tData.fromBranch,
      toBranch: tData.toBranch,
      division: 'Medimage Services',
      serials: serialsMoved,
      notes: tData.notes || '',
      transferredBy: uName
    }

    stockTransfers.value.unshift(newTransfer)
    addAuditLog(uName, uRole, 'INVENTORY', `Branch Stock Transfer ${transferNo}`, `Moved ${serialsMoved.length} units from ${tData.fromBranch} to ${tData.toBranch}`)
    saveState()

    try {
      await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransfer)
      })
    } catch (e) {}

    return newTransfer
  }

  function updateSerialStatus(serialCode, newStatus, user) {
    const serialObj = serials.value.find(s => s.serialCode === serialCode)
    if (serialObj) {
      const oldStatus = serialObj.status
      serialObj.status = newStatus
      const uName = user?.name || (typeof user === 'string' ? user : 'Admin User')
      const uRole = user?.role || 'SuperAdmin'
      addAuditLog(uName, uRole, 'INVENTORY', `Updated Serial ${serialCode} Status`, `Status changed from ${oldStatus} to ${newStatus}`, newStatus === 'Defective' ? 'warning' : 'normal')
      saveState()

      fetch(`/api/serials/${serialCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).catch(() => {})
    }
  }

  function resetToDefaults() {
    products.value = initialProducts
    serials.value = initialSerials
    purchaseOrders.value = initialPurchaseOrders
    salesInvoices.value = initialSalesInvoices
    paymentReceipts.value = initialPaymentReceipts
    stockTransfers.value = initialStockTransfers
    auditLogs.value = initialAuditLogs
    saveState()
  }

  return {
    products,
    serials,
    purchaseOrders,
    salesInvoices,
    paymentReceipts,
    stockTransfers,
    auditLogs,

    totalRevenue,
    totalCOGS,
    grossProfit,
    profitMarginPercent,
    totalPurchasesCost,
    inventoryValuationCost,
    inventoryValuationRetail,
    lowStockProducts,
    availableSerialsCount,
    checkAndBalance,

    checkDuplicateSerial,
    checkDuplicateMachineCode,
    searchMachineJourney,
    getCustomerLedger,
    getHistoricalStock,
    recordPaymentIn,
    transferBranchStock,
    addProduct,
    updateProduct,
    deleteProduct,
    createPurchaseOrder,
    processSaleInvoice,
    createSalesInvoice: processSaleInvoice,
    updateSerialStatus,
    addAuditLog,
    resetToDefaults
  }
})

