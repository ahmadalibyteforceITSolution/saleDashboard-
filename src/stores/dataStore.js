import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'

export const useDataStore = defineStore('data', () => {
  // Pre-seeded Initial Products with Multi-City Allocation Support
  const initialProducts = [
    {
      id: 'prd_101',
      sku: 'MAC-M3P-16',
      name: 'MacBook Pro 16" M3 Max',
      category: 'Laptops',
      allocationCity: 'Lahore, Peshawar',
      allocationCities: ['Lahore', 'Peshawar'],
      storageBin: 'WH-LHR-A1',
      costPrice: 2800,
      sellingPrice: 3499,
      stockQty: 8,
      minStock: 3,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_102',
      sku: 'IPH-15P-256',
      name: 'iPhone 15 Pro Max 256GB',
      category: 'Smartphones',
      allocationCity: 'Multan, Lahore',
      allocationCities: ['Multan', 'Lahore'],
      storageBin: 'WH-MUX-B12',
      costPrice: 950,
      sellingPrice: 1199,
      stockQty: 14,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_103',
      sku: 'SON-WH1000-XM5',
      name: 'Sony WH-1000XM5 Wireless ANC',
      category: 'Audio',
      allocationCity: 'Peshawar, Multan',
      allocationCities: ['Peshawar', 'Multan'],
      storageBin: 'WH-PEW-C03',
      costPrice: 240,
      sellingPrice: 399,
      stockQty: 22,
      minStock: 8,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_104',
      sku: 'DELL-U2724D',
      name: 'Dell UltraSharp 27" 4K Monitor',
      category: 'Displays',
      allocationCity: 'Lahore, Multan, Peshawar',
      allocationCities: ['Lahore', 'Multan', 'Peshawar'],
      storageBin: 'WH-LHR-D01',
      costPrice: 420,
      sellingPrice: 599,
      stockQty: 2,
      minStock: 4,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_105',
      sku: 'LOG-MXM3S',
      name: 'Logitech MX Master 3S Wireless Mouse',
      category: 'Peripherals',
      allocationCity: 'Multan, Lahore',
      allocationCities: ['Multan', 'Lahore'],
      storageBin: 'WH-MUX-A08',
      costPrice: 65,
      sellingPrice: 99,
      stockQty: 35,
      minStock: 10,
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=300&q=80'
    }
  ]

  const initialSerials = [
    { serialCode: 'SN-MAC-88401', productId: 'prd_101', sku: 'MAC-M3P-16', status: 'Available', allocationCity: 'Lahore', binLocation: 'WH-LHR-A1', registeredDate: '2026-07-15', soldDate: null, customer: null, invoiceNo: null },
    { serialCode: 'SN-MAC-88402', productId: 'prd_101', sku: 'MAC-M3P-16', status: 'Available', allocationCity: 'Peshawar', binLocation: 'WH-LHR-A1', registeredDate: '2026-07-15', soldDate: null, customer: null, invoiceNo: null },
    { serialCode: 'SN-MAC-88403', productId: 'prd_101', sku: 'MAC-M3P-16', status: 'Sold', allocationCity: 'Lahore', binLocation: 'WH-LHR-A1', registeredDate: '2026-07-10', soldDate: '2026-08-01', customer: 'Global Tech Corp', invoiceNo: 'INV-2026-001' },
    { serialCode: 'SN-MAC-88404', productId: 'prd_101', sku: 'MAC-M3P-16', status: 'Sold', allocationCity: 'Peshawar', binLocation: 'WH-LHR-A1', registeredDate: '2026-07-10', soldDate: '2026-08-02', customer: 'Apex Systems', invoiceNo: 'INV-2026-002' },
    { serialCode: 'SN-MAC-88405', productId: 'prd_101', sku: 'MAC-M3P-16', status: 'Defective', allocationCity: 'Lahore', binLocation: 'RMA-HOLD-01', registeredDate: '2026-07-01', soldDate: null, customer: null, invoiceNo: null },
    { serialCode: 'SN-IPH-99101', productId: 'prd_102', sku: 'IPH-15P-256', status: 'Available', allocationCity: 'Multan', binLocation: 'WH-MUX-B12', registeredDate: '2026-07-20', soldDate: null, customer: null, invoiceNo: null },
    { serialCode: 'SN-IPH-99102', productId: 'prd_102', sku: 'IPH-15P-256', status: 'Available', allocationCity: 'Lahore', binLocation: 'WH-MUX-B12', registeredDate: '2026-07-20', soldDate: null, customer: null, invoiceNo: null },
    { serialCode: 'SN-IPH-99103', productId: 'prd_102', sku: 'IPH-15P-256', status: 'Sold', allocationCity: 'Multan', binLocation: 'WH-MUX-B12', registeredDate: '2026-07-18', soldDate: '2026-08-03', customer: 'Sophia Reynolds', invoiceNo: 'INV-2026-003' },
    { serialCode: 'SN-SON-33001', productId: 'prd_103', sku: 'SON-WH1000-XM5', status: 'Available', allocationCity: 'Peshawar', binLocation: 'WH-PEW-C03', registeredDate: '2026-07-22', soldDate: null, customer: null, invoiceNo: null },
    { serialCode: 'SN-SON-33002', productId: 'prd_103', sku: 'SON-WH1000-XM5', status: 'Available', allocationCity: 'Multan', binLocation: 'WH-PEW-C03', registeredDate: '2026-07-22', soldDate: null, customer: null, invoiceNo: null },
    { serialCode: 'SN-DEL-44101', productId: 'prd_104', sku: 'DELL-U2724D', status: 'Available', allocationCity: 'Lahore', binLocation: 'WH-LHR-D01', registeredDate: '2026-07-12', soldDate: null, customer: null, invoiceNo: null },
    { serialCode: 'SN-DEL-44102', productId: 'prd_104', sku: 'DELL-U2724D', status: 'Available', allocationCity: 'Multan', binLocation: 'WH-LHR-D01', registeredDate: '2026-07-12', soldDate: null, customer: null, invoiceNo: null }
  ]

  const initialPurchaseOrders = [
    {
      poNumber: 'PO-2026-801',
      supplier: 'Apple Logistics Int.',
      orderDate: '2026-07-15',
      status: 'Completed',
      items: [
        { productId: 'prd_101', productName: 'MacBook Pro 16" M3 Max', qty: 5, unitCost: 2800, totalCost: 14000, allocationCity: 'Lahore, Peshawar' }
      ],
      totalAmount: 14000,
      createdBy: 'Sarah Jenkins'
    },
    {
      poNumber: 'PO-2026-802',
      supplier: 'Sony Electronics Wholesale',
      orderDate: '2026-07-22',
      status: 'Completed',
      items: [
        { productId: 'prd_103', productName: 'Sony WH-1000XM5 Wireless ANC', qty: 25, unitCost: 240, totalCost: 6000, allocationCity: 'Peshawar, Multan' }
      ],
      totalAmount: 6000,
      createdBy: 'Sarah Jenkins'
    }
  ]

  const initialSalesInvoices = [
    {
      invoiceNo: 'INV-2026-001',
      customer: 'Global Tech Corp',
      saleDate: '2026-08-01',
      paymentMethod: 'Credit Card - Visa (5% Card Discount)',
      items: [
        { productId: 'prd_101', productName: 'MacBook Pro 16" M3 Max', qty: 1, unitPrice: 3499, unitCost: 2800, total: 3499, serials: ['SN-MAC-88403'] }
      ],
      subtotal: 3499,
      tax: 279.92,
      discount: 174.95,
      grandTotal: 3603.97,
      totalCost: 2800,
      netProfit: 699,
      marginPercent: 19.98,
      sellerName: 'Marcus Vance'
    },
    {
      invoiceNo: 'INV-2026-002',
      customer: 'Apex Systems',
      saleDate: '2026-08-02',
      paymentMethod: 'Credit Card - Amex VIP (10% Special Off)',
      items: [
        { productId: 'prd_101', productName: 'MacBook Pro 16" M3 Max', qty: 1, unitPrice: 3499, unitCost: 2800, total: 3499, serials: ['SN-MAC-88404'] }
      ],
      subtotal: 3499,
      tax: 279.92,
      discount: 349.90,
      grandTotal: 3429.02,
      totalCost: 2800,
      netProfit: 599,
      marginPercent: 17.11,
      sellerName: 'Marcus Vance'
    },
    {
      invoiceNo: 'INV-2026-003',
      customer: 'Sophia Reynolds',
      saleDate: '2026-08-03',
      paymentMethod: 'Cash Payment',
      items: [
        { productId: 'prd_102', productName: 'iPhone 15 Pro Max 256GB', qty: 1, unitPrice: 1199, unitCost: 950, total: 1199, serials: ['SN-IPH-99103'] }
      ],
      subtotal: 1199,
      tax: 95.92,
      discount: 0,
      grandTotal: 1294.92,
      totalCost: 950,
      netProfit: 249,
      marginPercent: 20.76,
      sellerName: 'Marcus Vance'
    }
  ]

  const initialAuditLogs = [
    {
      id: 'log_01',
      timestamp: '2026-08-03 14:22:05',
      user: 'Marcus Vance',
      role: 'manager',
      category: 'SALES',
      action: 'Created Invoice INV-2026-003',
      details: 'Issued sale to Sophia Reynolds for $1,294.92. Serial assigned: SN-IPH-99103',
      severity: 'normal'
    },
    {
      id: 'log_02',
      timestamp: '2026-08-02 11:05:40',
      user: 'Alexander Sterling',
      role: 'superadmin',
      category: 'FINANCIAL',
      action: 'Discount Approval Override',
      details: 'Authorized manual discount on INV-2026-002 for Apex Systems',
      severity: 'warning'
    },
    {
      id: 'log_03',
      timestamp: '2026-08-01 09:15:00',
      user: 'Sarah Jenkins',
      role: 'admin',
      category: 'INVENTORY',
      action: 'Stock Adjustment & Serial Flag',
      details: 'Flagged SN-MAC-88405 as Defective unit. Moved to RMA-HOLD-01 bin',
      severity: 'warning'
    }
  ]

  // Persistent Reactive State
  const products = ref(JSON.parse(localStorage.getItem('nexis_products')) || initialProducts)
  const serials = ref(JSON.parse(localStorage.getItem('nexis_serials')) || initialSerials)
  const purchaseOrders = ref(JSON.parse(localStorage.getItem('nexis_pos')) || initialPurchaseOrders)
  const salesInvoices = ref(JSON.parse(localStorage.getItem('nexis_sales')) || initialSalesInvoices)
  const auditLogs = ref(JSON.parse(localStorage.getItem('nexis_audit_logs')) || initialAuditLogs)

  // Sync with MongoDB API backend on mount
  onMounted(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const mongoProducts = await res.json()
        if (mongoProducts.length) products.value = mongoProducts
      }
    } catch (e) {
      console.log('MongoDB server offline, using local storage state.')
    }
  })

  function saveState() {
    localStorage.setItem('nexis_products', JSON.stringify(products.value))
    localStorage.setItem('nexis_serials', JSON.stringify(serials.value))
    localStorage.setItem('nexis_pos', JSON.stringify(purchaseOrders.value))
    localStorage.setItem('nexis_sales', JSON.stringify(salesInvoices.value))
    localStorage.setItem('nexis_audit_logs', JSON.stringify(auditLogs.value))
  }

  // Metrics
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
    const cashInflows = salesInvoices.value.filter(i => i.paymentMethod === 'Cash Payment').reduce((acc, i) => acc + i.grandTotal, 0)
    const cardBankInflows = salesInvoices.value.filter(i => i.paymentMethod !== 'Cash Payment').reduce((acc, i) => acc + i.grandTotal, 0)
    const totalInflows = cashInflows + cardBankInflows
    
    const manualDiscountsTotal = salesInvoices.value.reduce((acc, i) => acc + (i.discount || 0), 0)
    const defectiveLossValuation = serials.value.filter(s => s.status === 'Defective').length * 2800
    
    return {
      cashInflows,
      cardBankInflows,
      totalInflows,
      manualDiscountsTotal,
      defectiveLossValuation,
      balancedStatus: manualDiscountsTotal < 1500 && defectiveLossValuation < 5000 ? 'BALANCED' : 'ATTENTION_REQUIRED',
      healthScore: 98.4
    }
  })

  // Action Methods
  async function addAuditLog(user, role, category, action, details, severity = 'normal') {
    const now = new Date()
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19)
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp,
      user,
      role,
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
    const citiesArr = productData.allocationCities && productData.allocationCities.length > 0 ? productData.allocationCities : ['Lahore']
    const citiesStr = citiesArr.join(', ')
    const cityQuantitiesMap = productData.cityQuantities || {}

    // Calculate total stock quantity from per-city quantities if provided
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
      category: productData.category,
      allocationCity: citiesStr,
      allocationCities: citiesArr,
      storageBin: productData.storageBin || 'WH-GEN-01',
      costPrice: Number(productData.costPrice),
      sellingPrice: Number(productData.sellingPrice),
      stockQty: totalStockQty,
      minStock: Number(productData.minStock || 5),
      image: productData.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80'
    }
    products.value.push(newProduct)

    // Generate Serials specifically matching per-city allocated unit quantities!
    let globalIndex = 0
    if (Object.keys(cityQuantitiesMap).length > 0) {
      citiesArr.forEach(cityName => {
        const cityQty = Number(cityQuantitiesMap[cityName] || 0)
        for (let i = 1; i <= cityQty; i++) {
          globalIndex++
          const serialCode = `SN-${newProduct.sku}-${String(100 + globalIndex).padStart(3, '0')}`
          serials.value.push({
            serialCode,
            productId: newProduct.id,
            sku: newProduct.sku,
            status: 'Available',
            allocationCity: cityName,
            binLocation: newProduct.storageBin,
            registeredDate: new Date().toISOString().substring(0, 10),
            soldDate: null,
            customer: null,
            invoiceNo: null
          })
        }
      })
    } else if (newProduct.stockQty > 0) {
      for (let i = 1; i <= newProduct.stockQty; i++) {
        const assignedCity = citiesArr[(i - 1) % citiesArr.length]
        const serialCode = `SN-${newProduct.sku}-${String(100 + i).padStart(3, '0')}`
        serials.value.push({
          serialCode,
          productId: newProduct.id,
          sku: newProduct.sku,
          status: 'Available',
          allocationCity: assignedCity,
          binLocation: newProduct.storageBin,
          registeredDate: new Date().toISOString().substring(0, 10),
          soldDate: null,
          customer: null,
          invoiceNo: null
        })
      }
    }

    addAuditLog(user.name, user.role, 'INVENTORY', `Added New Product ${newProduct.name}`, `SKU: ${newProduct.sku}, Multi-City Allocations: ${citiesStr}, Total Stock: ${newProduct.stockQty}`)
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
      addAuditLog(user.name, user.role, 'INVENTORY', `Updated Product ${p.name}`, `SKU: ${p.sku}, Prices: $${p.costPrice}/$${p.sellingPrice}, Stock: ${p.stockQty}`)
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

      // Also remove associated serials
      serials.value = serials.value.filter(s => s.productId !== productId)

      addAuditLog(user.name, user.role, 'INVENTORY', `Deleted Product ${deletedProd.name}`, `Removed SKU ${deletedProd.sku} and associated serials from system`, 'warning')
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
    
    const items = poData.items.map(item => {
      const lineCost = item.qty * item.unitCost
      totalAmount += lineCost

      const product = products.value.find(p => p.id === item.productId)
      const targetCities = Array.isArray(item.allocationCities) && item.allocationCities.length > 0 ? item.allocationCities : [(item.allocationCity || 'Lahore')]
      
      if (product) {
        product.stockQty += Number(item.qty)
        // Add new cities if not present
        targetCities.forEach(c => {
          if (!product.allocationCities) product.allocationCities = [product.allocationCity]
          if (!product.allocationCities.includes(c)) product.allocationCities.push(c)
        })
        product.allocationCity = product.allocationCities.join(', ')

        for (let i = 1; i <= item.qty; i++) {
          const assignedCity = targetCities[(i - 1) % targetCities.length]
          const serialCode = `SN-${product.sku}-${Date.now().toString().slice(-4)}${i}`
          serials.value.push({
            serialCode,
            productId: product.id,
            sku: product.sku,
            status: 'Available',
            allocationCity: assignedCity,
            binLocation: product.storageBin,
            registeredDate: new Date().toISOString().substring(0, 10),
            soldDate: null,
            customer: null,
            invoiceNo: null
          })
        }
      }
      return {
        productId: item.productId,
        productName: item.productName,
        qty: Number(item.qty),
        unitCost: Number(item.unitCost),
        totalCost: lineCost,
        allocationCity: targetCities.join(', ')
      }
    })

    const newPO = {
      poNumber,
      supplier: poData.supplier,
      orderDate: new Date().toISOString().substring(0, 10),
      status: 'Completed',
      items,
      totalAmount,
      createdBy: user.name
    }

    purchaseOrders.value.unshift(newPO)
    addAuditLog(user.name, user.role, 'PURCHASING', `Created Purchase Order ${poNumber}`, `Supplier: ${poData.supplier}, Total: $${totalAmount.toFixed(2)}`)
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
    const invoiceNo = `INV-2026-${String(salesInvoices.value.length + 1).padStart(3, '0')}`
    let subtotal = 0
    let totalCost = 0

    const items = saleData.items.map(item => {
      const product = products.value.find(p => p.id === item.productId)
      const lineTotal = item.qty * item.unitPrice
      const lineCost = item.qty * (product ? product.costPrice : 0)

      subtotal += lineTotal
      totalCost += lineCost

      if (product) {
        product.stockQty = Math.max(0, product.stockQty - item.qty)
      }

      if (item.selectedSerials && item.selectedSerials.length > 0) {
        item.selectedSerials.forEach(sCode => {
          const serialObj = serials.value.find(s => s.serialCode === sCode)
          if (serialObj) {
            serialObj.status = 'Sold'
            serialObj.soldDate = new Date().toISOString().substring(0, 10)
            serialObj.customer = saleData.customer
            serialObj.invoiceNo = invoiceNo
          }
        })
      }

      return {
        productId: item.productId,
        productName: item.productName,
        qty: item.qty,
        unitPrice: item.unitPrice,
        unitCost: product ? product.costPrice : 0,
        total: lineTotal,
        serials: item.selectedSerials || []
      }
    })

    const tax = subtotal * 0.08
    const discount = Number(saleData.discount || 0)
    const grandTotal = (subtotal + tax) - discount
    const netProfit = subtotal - discount - totalCost
    const marginPercent = subtotal ? ((netProfit / subtotal) * 100) : 0

    const newInvoice = {
      invoiceNo,
      customer: saleData.customer,
      saleDate: new Date().toISOString().substring(0, 10),
      paymentMethod: saleData.paymentMethod || 'Credit Card',
      items,
      subtotal,
      tax,
      discount,
      grandTotal,
      totalCost,
      netProfit,
      marginPercent: Number(marginPercent.toFixed(2)),
      sellerName: user.name
    }

    salesInvoices.value.unshift(newInvoice)
    
    const severity = discount > 50 ? 'warning' : 'normal'
    addAuditLog(user.name, user.role, 'SALES', `Executed Sale Invoice ${invoiceNo}`, `Customer: ${saleData.customer}, Grand Total: $${grandTotal.toFixed(2)}`, severity)

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

  function updateSerialStatus(serialCode, newStatus, user) {
    const serialObj = serials.value.find(s => s.serialCode === serialCode)
    if (serialObj) {
      const oldStatus = serialObj.status
      serialObj.status = newStatus
      addAuditLog(user.name, user.role, 'INVENTORY', `Updated Serial ${serialCode} Status`, `Status changed from ${oldStatus} to ${newStatus}`, newStatus === 'Defective' ? 'warning' : 'normal')
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
    auditLogs.value = initialAuditLogs
    saveState()
  }

  return {
    products,
    serials,
    purchaseOrders,
    salesInvoices,
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

    addProduct,
    updateProduct,
    deleteProduct,
    createPurchaseOrder,
    processSaleInvoice,
    updateSerialStatus,
    addAuditLog,
    resetToDefaults
  }
})
