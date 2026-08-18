import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'

export const useDataStore = defineStore('data', () => {
  // Pre-seeded Initial Medical Equipment Products for Medimage Services ERP (Clean Empty State)
  const initialProducts = []
  const initialSerials = []
  const initialPurchaseOrders = []
  const initialSalesInvoices = []
  const initialPaymentReceipts = []
  const initialStockTransfers = []
  const initialAuditLogs = []

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
      healthScore: 100
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

  // Get Historical Stock Position on any given date or range
  function getHistoricalStock(targetDate, branchFilter = 'ALL', startDate = null) {
    if (!targetDate) return { totalUnits: 0, productsSummary: [], serialsSnapshot: [] }

    const cleanTargetDate = targetDate.substring(0, 10)
    const cleanStartDate = startDate ? startDate.substring(0, 10) : null

    // Filter serials registered on or before targetDate, and not sold before targetDate
    const snapshotSerials = serials.value.filter(s => {
      const regDate = (s.registeredDate || s.createdAt || '2000-01-01').substring(0, 10)
      const soldDate = s.soldDate ? s.soldDate.substring(0, 10) : null
      
      const wasRegistered = regDate <= cleanTargetDate && (!cleanStartDate || regDate >= cleanStartDate || !soldDate || soldDate >= cleanStartDate)
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
      startDate: cleanStartDate,
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

    // Serial generation: always auto-generate serial codes; use manualMachineCodes if provided
    const manualMachineCodes = productData.manualMachineCodes || []

    let globalIndex = serials.value.length + 100
    if (Object.keys(cityQuantitiesMap).length > 0) {
      let unitIndex = 0
      citiesArr.forEach(cityName => {
        const cityQty = Number(cityQuantitiesMap[cityName] || 0)
        for (let i = 1; i <= cityQty; i++) {
          globalIndex++
          const serialCode = `SN-${newProduct.sku}-${String(globalIndex).padStart(4, '0')}`
          const machineCode = manualMachineCodes[unitIndex] || `MC-${globalIndex}`
          unitIndex++
          if (!checkDuplicateSerial(serialCode)) {
            serials.value.unshift({
              serialCode, machineCode,
              productId: newProduct.id, sku: newProduct.sku, status: 'Available',
              allocationCity: cityName, binLocation: newProduct.storageBin,
              registeredDate: new Date().toISOString().substring(0, 10),
              soldDate: null, customer: null, invoiceNo: null,
              paymentStatus: 'Pending', hsnCode: newProduct.hsnCode,
              taxRatio: newProduct.taxRatio, salePrice: 0
            })
          }
        }
      })
    } else if (newProduct.stockQty > 0) {
      for (let i = 1; i <= newProduct.stockQty; i++) {
        globalIndex++
        const assignedCity = citiesArr[(i - 1) % citiesArr.length]
        const serialCode = `SN-${newProduct.sku}-${String(globalIndex).padStart(4, '0')}`
        const machineCode = manualMachineCodes[i - 1] || `MC-${globalIndex}`
        if (!checkDuplicateSerial(serialCode)) {
          serials.value.unshift({
            serialCode, machineCode,
            productId: newProduct.id, sku: newProduct.sku, status: 'Available',
            allocationCity: assignedCity, binLocation: newProduct.storageBin,
            registeredDate: new Date().toISOString().substring(0, 10),
            soldDate: null, customer: null, invoiceNo: null,
            paymentStatus: 'Pending', hsnCode: newProduct.hsnCode,
            taxRatio: newProduct.taxRatio, salePrice: 0
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
            productName: serialObj.sku,
            sku: serialObj.sku,
            productId: serialObj.productId
          })

          // Synchronize parent product allocation cities
          const parentProd = products.value.find(p => p.id === serialObj.productId || p.sku === serialObj.sku)
          if (parentProd) {
            let cities = []
            if (Array.isArray(parentProd.allocationCities)) {
              cities = [...parentProd.allocationCities]
            } else if (parentProd.allocationCity) {
              cities = parentProd.allocationCity.split(',').map(s => s.trim())
            }
            if (!cities.includes(tData.toBranch)) {
              cities.push(tData.toBranch)
            }
            parentProd.allocationCities = cities
            parentProd.allocationCity = cities.join(', ')
          }
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

