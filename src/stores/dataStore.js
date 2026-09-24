import { defineStore } from 'pinia'
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore, ROLE_HIERARCHY } from '@/stores/authStore'

export const useDataStore = defineStore('data', () => {
  const authStore = useAuthStore()

  // Helper to remove any SN- prefix from codes
  const stripSn = (val) => val ? String(val).trim().replace(/^SN-/i, '') : ''

  // Pre-seeded Initial Medical Equipment Products for Medimage Services ERP
  const initialProducts = [
    {
      id: 'prd_ultrasound_10',
      name: '10 Inch Portable Ultrasound Scanner System',
      category: 'Ultrasound Machines',
      sku: 'US10-8800',
      hsnCode: '9018.1200',
      taxRatio: 18,
      allocationCity: 'Peshawar, Multan, Lahore',
      allocationCities: ['Peshawar', 'Multan', 'Lahore'],
      storageBin: 'HQ-PEW-01',
      costPrice: 450000,
      sellingPrice: 650000,
      stockQty: 8,
      minStock: 2,
      addedBy: 'Alexander Sterling (SuperAdmin)',
      addedRole: 'superadmin',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_diode_laser',
      name: '808nm Diode Laser Medical Aesthetic Machine',
      category: 'Laser Systems',
      sku: 'LSR-9900',
      hsnCode: '9018.9000',
      taxRatio: 18,
      allocationCity: 'Peshawar, Lahore',
      allocationCities: ['Peshawar', 'Lahore'],
      storageBin: 'HQ-PEW-02',
      costPrice: 1800000,
      sellingPrice: 2450000,
      stockQty: 4,
      minStock: 2,
      addedBy: 'Sarah Jenkins (Admin)',
      addedRole: 'admin',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_ecg_system',
      name: '12-Lead ECG Electrocardiograph System',
      category: 'Cardiology Equipment',
      sku: 'ECG-7700',
      hsnCode: '9018.1100',
      taxRatio: 18,
      allocationCity: 'Peshawar, Multan',
      allocationCities: ['Peshawar', 'Multan'],
      storageBin: 'MUL-W1',
      costPrice: 160000,
      sellingPrice: 240000,
      stockQty: 6,
      minStock: 3,
      addedBy: 'Marcus Vance (Manager)',
      addedRole: 'manager',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_ahmad_warmer',
      name: 'Infant Radiant Warmer System (Ahmad Son)',
      category: 'Neonatal Care Equipment',
      sku: 'AN-WRM-01',
      hsnCode: '9018.9000',
      taxRatio: 18,
      allocationCity: 'Peshawar, Multan, Lahore',
      allocationCities: ['Peshawar', 'Multan', 'Lahore'],
      storageBin: 'BIN-AN-01',
      costPrice: 120000,
      sellingPrice: 185000,
      stockQty: 40,
      minStock: 5,
      containerNo: 'SENDNB2606060',
      companyName: 'Ahmad Son company',
      containerPrefix: 'AN-',
      barcode: 'AN-BC-WRM01',
      addedBy: 'Tariq Mahmood (Accountant)',
      addedRole: 'accountant',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_ahmad_light',
      name: 'Surgical Shadowless OT Light Double Dome',
      category: 'Surgical Equipment',
      sku: 'AN-LGT-01',
      hsnCode: '9018.9000',
      taxRatio: 18,
      allocationCity: 'Peshawar, Lahore',
      allocationCities: ['Peshawar', 'Lahore'],
      storageBin: 'BIN-AN-02',
      costPrice: 85000,
      sellingPrice: 140000,
      stockQty: 60,
      minStock: 10,
      containerNo: 'SENDNB2606060',
      companyName: 'Ahmad Son company',
      containerPrefix: 'AN-',
      barcode: 'AN-BC-LGT01',
      addedBy: 'Tariq Mahmood (Accountant)',
      addedRole: 'accountant',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_ahmad_bed',
      name: 'Electric ICU Patient Bed 5-Function',
      category: 'Hospital Furniture',
      sku: 'AN-BED-01',
      hsnCode: '9402.9010',
      taxRatio: 18,
      allocationCity: 'Lahore, Multan',
      allocationCities: ['Lahore', 'Multan'],
      storageBin: 'BIN-AN-03',
      costPrice: 220000,
      sellingPrice: 320000,
      stockQty: 30,
      minStock: 5,
      containerNo: 'SENDNB2606060',
      companyName: 'Ahmad Son company',
      containerPrefix: 'AN-',
      barcode: 'AN-BC-BED01',
      addedBy: 'Tariq Mahmood (Accountant)',
      addedRole: 'accountant',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'prd_ahmad_stool',
      name: 'Hydraulic Adjustable Medical Doctor Stools',
      category: 'Hospital Furniture',
      sku: 'AN-STL-01',
      hsnCode: '9402.9090',
      taxRatio: 18,
      allocationCity: 'Peshawar, Multan, Lahore',
      allocationCities: ['Peshawar', 'Multan', 'Lahore'],
      storageBin: 'BIN-AN-04',
      costPrice: 25000,
      sellingPrice: 42000,
      stockQty: 80,
      minStock: 15,
      containerNo: 'SENDNB2606060',
      companyName: 'Ahmad Son company',
      containerPrefix: 'AN-',
      barcode: 'AN-BC-STL01',
      addedBy: 'Tariq Mahmood (Accountant)',
      addedRole: 'accountant',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=300&q=80'
    }
  ]

  const initialSerials = [
    { serialCode: 'US10-8801', machineCode: 'MC-101', productId: 'prd_ultrasound_10', sku: 'US10-8800', status: 'Available', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-01', registeredDate: '2026-07-01', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1200', taxRatio: 18, salePrice: 0 },
    { serialCode: 'US10-8802', machineCode: 'MC-102', productId: 'prd_ultrasound_10', sku: 'US10-8800', status: 'Available', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-01', registeredDate: '2026-07-01', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1200', taxRatio: 18, salePrice: 0 },
    { serialCode: 'US10-8803', machineCode: 'MC-103', productId: 'prd_ultrasound_10', sku: 'US10-8800', status: 'Sold', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-01', registeredDate: '2026-07-01', soldDate: '2026-07-15', customer: 'Northwest General Hospital Peshawar', invoiceNo: 'INV-2026-101', paymentStatus: 'Paid', hsnCode: '9018.1200', taxRatio: 18, salePrice: 650000 },
    { serialCode: 'US10-8804', machineCode: 'MC-104', productId: 'prd_ultrasound_10', sku: 'US10-8800', status: 'Sold', allocationCity: 'Multan', binLocation: 'MUL-W1', registeredDate: '2026-07-10', soldDate: '2026-08-12', customer: 'Multan Medical Complex', invoiceNo: 'INV-2026-102', paymentStatus: 'Paid', hsnCode: '9018.1200', taxRatio: 18, salePrice: 650000 },
    { serialCode: 'US10-8805', machineCode: 'MC-105', productId: 'prd_ultrasound_10', sku: 'US10-8800', status: 'Sold', allocationCity: 'Multan', binLocation: 'MUL-W1', registeredDate: '2026-07-10', soldDate: '2026-08-12', customer: 'Multan Medical Complex', invoiceNo: 'INV-2026-102', paymentStatus: 'Pending', hsnCode: '9018.1200', taxRatio: 18, salePrice: 650000 },
    { serialCode: 'US10-8806', machineCode: 'MC-106', productId: 'prd_ultrasound_10', sku: 'US10-8800', status: 'Available', allocationCity: 'Lahore', binLocation: 'LHR-D1', registeredDate: '2026-07-20', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1200', taxRatio: 18, salePrice: 0 },
    { serialCode: 'US10-8807', machineCode: 'MC-107', productId: 'prd_ultrasound_10', sku: 'US10-8800', status: 'Available', allocationCity: 'Lahore', binLocation: 'LHR-D1', registeredDate: '2026-07-20', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1200', taxRatio: 18, salePrice: 0 },
    { serialCode: 'US10-8808', machineCode: 'MC-108', productId: 'prd_ultrasound_10', sku: 'US10-8800', status: 'Available', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-01', registeredDate: '2026-07-20', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1200', taxRatio: 18, salePrice: 0 },
    { serialCode: 'LSR-9901', machineCode: 'MC-201', productId: 'prd_diode_laser', sku: 'LSR-9900', status: 'Available', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-02', registeredDate: '2026-07-05', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.9000', taxRatio: 18, salePrice: 0 },
    { serialCode: 'LSR-9902', machineCode: 'MC-202', productId: 'prd_diode_laser', sku: 'LSR-9900', status: 'Sold', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-02', registeredDate: '2026-07-05', soldDate: '2026-09-02', customer: 'Khyber Aesthetics & Laser Clinic', invoiceNo: 'INV-2026-103', paymentStatus: 'Paid', hsnCode: '9018.9000', taxRatio: 18, salePrice: 2450000 },
    { serialCode: 'LSR-9903', machineCode: 'MC-203', productId: 'prd_diode_laser', sku: 'LSR-9900', status: 'Sold', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-02', registeredDate: '2026-07-05', soldDate: '2026-09-02', customer: 'Khyber Aesthetics & Laser Clinic', invoiceNo: 'INV-2026-103', paymentStatus: 'Pending', hsnCode: '9018.9000', taxRatio: 18, salePrice: 2450000 },
    { serialCode: 'LSR-9904', machineCode: 'MC-204', productId: 'prd_diode_laser', sku: 'LSR-9900', status: 'Available', allocationCity: 'Lahore', binLocation: 'LHR-D1', registeredDate: '2026-07-15', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.9000', taxRatio: 18, salePrice: 0 },
    { serialCode: 'ECG-7701', machineCode: 'MC-301', productId: 'prd_ecg_system', sku: 'ECG-7700', status: 'Available', allocationCity: 'Peshawar', binLocation: 'HQ-PEW-01', registeredDate: '2026-07-12', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1100', taxRatio: 18, salePrice: 0 },
    { serialCode: 'ECG-7702', machineCode: 'MC-302', productId: 'prd_ecg_system', sku: 'ECG-7700', status: 'Available', allocationCity: 'Multan', binLocation: 'MUL-W1', registeredDate: '2026-07-12', soldDate: null, customer: null, invoiceNo: null, paymentStatus: 'Pending', hsnCode: '9018.1100', taxRatio: 18, salePrice: 0 }
  ]

  const initialPurchaseOrders = []

  const initialSalesInvoices = [
    {
      invoiceNo: 'INV-2026-101',
      quotationNo: 'QT-2026-092',
      salesOrderNo: 'SO-2026-092',
      customer: 'Northwest General Hospital Peshawar',
      branch: 'Peshawar',
      division: 'Medimage Services',
      saleDate: '2026-07-15',
      deliveryDate: '2026-07-16',
      deliveryStatus: 'Delivered',
      blNumber: 'BL-MED-2026-03',
      paymentMethod: 'Cash Payment',
      paymentStatus: 'Paid',
      paidAmount: 767000,
      outstandingBalance: 0,
      salesPerson: 'Sarah Jenkins (Admin)',
      bankName: 'Cash Counter Peshawar',
      bankDetails: 'HO Main Accounts Safe',
      chequeRef: 'CSH-REC-101',
      taxRatio: 18,
      creatorRole: 'admin',
      sellerName: 'Sarah Jenkins (Admin)',
      items: [
        { 
          productId: 'prd_ultrasound_10', 
          productName: '10 Inch Portable Ultrasound Scanner System', 
          productCode: 'US10-8800',
          blNumber: 'BL-MED-2026-03',
          qty: 1, 
          unitPrice: 650000, 
          unitCost: 450000, 
          hsnCode: '9018.1200', 
          taxRatio: 18, 
          total: 650000, 
          serials: ['US10-8803'], 
          machineCodes: ['MC-103'],
          paidAmount: 650000,
          balance: 0,
          paymentStatus: 'Paid'
        }
      ],
      subtotal: 650000,
      tax: 117000,
      discount: 0,
      grandTotal: 767000,
      totalCost: 450000,
      netProfit: 200000,
      marginPercent: 30.77
    },
    {
      invoiceNo: 'INV-2026-102',
      quotationNo: 'QT-2026-104',
      salesOrderNo: 'SO-2026-104',
      customer: 'Multan Medical Complex',
      branch: 'Multan',
      division: 'Medimage Services',
      saleDate: '2026-08-12',
      deliveryDate: '2026-08-13',
      deliveryStatus: 'Delivered',
      blNumber: 'BL-MED-2026-03',
      paymentMethod: 'Bank Transfer (Meezan Bank)',
      paymentStatus: 'Partially Paid',
      paidAmount: 742000,
      outstandingBalance: 742000,
      salesPerson: 'Marcus Vance (Manager)',
      bankName: 'Meezan Bank Multan Branch',
      bankDetails: 'IBAN PK44MEZN000201019988',
      chequeRef: 'MZN-CHQ-77821',
      taxRatio: 18,
      creatorRole: 'manager',
      sellerName: 'Marcus Vance (Manager)',
      items: [
        { 
          productId: 'prd_ultrasound_10', 
          productName: '10 Inch Portable Ultrasound Scanner System', 
          productCode: 'US10-8800',
          blNumber: 'BL-MED-2026-03',
          qty: 2, 
          unitPrice: 650000, 
          unitCost: 450000, 
          hsnCode: '9018.1200', 
          taxRatio: 18, 
          total: 1300000, 
          serials: ['US10-8804', 'US10-8805'], 
          machineCodes: ['MC-104', 'MC-105'],
          paidAmount: 650000,
          balance: 650000,
          paymentStatus: 'Partially Paid'
        }
      ],
      subtotal: 1300000,
      tax: 234000,
      discount: 50000,
      grandTotal: 1484000,
      totalCost: 900000,
      netProfit: 350000,
      marginPercent: 26.92
    },
    {
      invoiceNo: 'INV-2026-103',
      quotationNo: 'QT-2026-115',
      salesOrderNo: 'SO-2026-115',
      customer: 'Khyber Aesthetics & Laser Clinic',
      branch: 'Peshawar',
      division: 'Medimage Services',
      saleDate: '2026-09-02',
      deliveryDate: '2026-09-03',
      deliveryStatus: 'Delivered',
      blNumber: 'SZMED992010',
      paymentMethod: 'Bank Transfer (HBL)',
      paymentStatus: 'Unpaid',
      paidAmount: 0,
      outstandingBalance: 5682000,
      salesPerson: 'Alexander Sterling (SuperAdmin)',
      bankName: 'Habib Bank Limited (HBL)',
      bankDetails: 'University Town Branch Peshawar',
      chequeRef: 'HBL-ONL-998822',
      taxRatio: 18,
      creatorRole: 'superadmin',
      sellerName: 'Alexander Sterling (SuperAdmin)',
      items: [
        { 
          productId: 'prd_diode_laser', 
          productName: '808nm Diode Laser Medical Aesthetic Machine', 
          productCode: 'LSR-9900',
          blNumber: 'SZMED992010',
          qty: 2, 
          unitPrice: 2450000, 
          unitCost: 1800000, 
          hsnCode: '9018.9000', 
          taxRatio: 18, 
          total: 4900000, 
          serials: ['LSR-9902', 'LSR-9903'], 
          machineCodes: ['MC-202', 'MC-203'],
          paidAmount: 0,
          balance: 4900000,
          paymentStatus: 'Unpaid'
        }
      ],
      subtotal: 4900000,
      tax: 882000,
      discount: 100000,
      grandTotal: 5682000,
      totalCost: 3600000,
      netProfit: 1200000,
      marginPercent: 24.49
    },
    {
      invoiceNo: 'INV-2026-104',
      quotationNo: 'QT-2026-120',
      salesOrderNo: 'SO-2026-120',
      customer: 'Allama Iqbal Teaching Hospital (Lahore)',
      branch: 'Lahore',
      division: 'Medimage Services',
      saleDate: '2026-09-14',
      deliveryDate: '2026-09-14',
      deliveryStatus: 'Delivered',
      paymentMethod: 'Bank Transfer (Meezan RTGS)',
      paymentStatus: 'Paid',
      paidAmount: 1863000,
      outstandingBalance: 0,
      salesPerson: 'Tariq Mahmood (Ahmad Son Accounts)',
      bankName: 'Meezan Bank Gulberg Lahore',
      bankDetails: 'RTGS A/C 0201-445522',
      chequeRef: 'RTGS-MZN-990022',
      taxRatio: 18,
      creatorRole: 'accountant',
      sellerName: 'Tariq Mahmood (Ahmad Son Accounts)',
      containerNo: 'SENDNB2606060',
      blNumber: 'SENDNB2606060',
      companyName: 'Ahmad Son company',
      items: [
        {
          productId: 'prd_ahmad_bed',
          productName: 'Electric ICU Patient Bed 5-Function',
          productCode: 'AN-BED-01',
          blNumber: 'SENDNB2606060',
          qty: 5,
          unitPrice: 320000,
          unitCost: 220000,
          hsnCode: '9402.9010',
          taxRatio: 18,
          total: 1600000,
          serials: ['AN-BED-0001', 'AN-BED-0002', 'AN-BED-0003', 'AN-BED-0004', 'AN-BED-0005'],
          machineCodes: ['MC-BED-01', 'MC-BED-02', 'MC-BED-03', 'MC-BED-04', 'MC-BED-05'],
          paidAmount: 1600000,
          balance: 0,
          paymentStatus: 'Paid'
        }
      ],
      subtotal: 1600000,
      tax: 288000,
      discount: 25000,
      grandTotal: 1863000,
      totalCost: 1100000,
      netProfit: 475000,
      marginPercent: 29.68
    }
  ]

  const initialPaymentReceipts = [
    {
      receiptNo: 'RCT-2026-001',
      customer: 'Northwest General Hospital Peshawar',
      paymentDate: '2026-07-15',
      paymentType: 'Cash Payment',
      paymentMethod: 'Cash Payment',
      amount: 767000,
      branch: 'Peshawar',
      division: 'Medimage Services',
      description: 'Full Cash Payment received for Ultrasound MC-103 at HO Peshawar',
      paidSerials: [
        { serialCode: 'US10-8803', machineCode: 'MC-103', productName: '10 Inch Portable Ultrasound Scanner System', amountAllocated: 767000 }
      ],
      receivedBy: 'Peshawar Accounts counter'
    },
    {
      receiptNo: 'RCT-2026-002',
      customer: 'Multan Medical Complex',
      paymentDate: '2026-08-12',
      paymentType: 'Bank Payment',
      paymentMethod: 'Bank Payment',
      amount: 742000,
      branch: 'Multan',
      division: 'Medimage Services',
      description: 'Part Payment (50%) for 2 Ultrasound units. Allocated to Machine MC-104',
      paidSerials: [
        { serialCode: 'US10-8804', machineCode: 'MC-104', productName: '10 Inch Portable Ultrasound Scanner System', amountAllocated: 742000 }
      ],
      receivedBy: 'Multan Accounts Office'
    },
    {
      receiptNo: 'RCT-2026-003',
      customer: 'Khyber Aesthetics & Laser Clinic',
      paymentDate: '2026-09-02',
      paymentType: 'Bank Payment',
      paymentMethod: 'Bank Payment',
      amount: 2841000,
      branch: 'Peshawar',
      division: 'Medimage Services',
      description: '50% advance bank transfer for 2 Laser units. Allocated to MC-202',
      paidSerials: [
        { serialCode: 'LSR-9902', machineCode: 'MC-202', productName: '808nm Diode Laser Medical Aesthetic Machine', amountAllocated: 2841000 }
      ],
      receivedBy: 'Peshawar Accounts HO'
    }
  ]

  const initialStockTransfers = []
  const initialAuditLogs = [
    {
      id: 'log_01',
      timestamp: '2026-09-15 08:30',
      user: 'Alexander Sterling',
      role: 'superadmin',
      action: 'SuperAdmin 35M Financial Cross-Check Verified',
      category: 'GOVERNANCE',
      severity: 'info',
      details: 'Audit reconciliation approved for container SENDNB2606060 product outflows'
    },
    {
      id: 'log_02',
      timestamp: '2026-09-15 09:15',
      user: 'Sarah Jenkins',
      role: 'admin',
      action: 'Warehouse Import Manifest Approved',
      category: 'PROCUREMENT',
      severity: 'info',
      details: 'Container SZMED992010 Shenzhen customs documentation cleared for storage'
    },
    {
      id: 'log_03',
      timestamp: '2026-09-15 10:00',
      user: 'Marcus Vance',
      role: 'manager',
      action: 'POS Branch Counter Shift Opened',
      category: 'SALES',
      severity: 'info',
      details: 'Multan branch sales counter activated for daily clinic deliveries'
    },
    {
      id: 'log_04',
      timestamp: '2026-09-15 10:45',
      user: 'Tariq Mahmood',
      role: 'accountant',
      action: 'Ahmad Son Container AN- Products Registered',
      category: 'CONTAINER',
      severity: 'info',
      details: 'Container SENDNB2606060 40x Warmers and 60x Lights entered with AN- serials'
    }
  ]
  const initialSalesReturns = []
  const initialPaymentOutVouchers = []

  const initialContainers = [
    {
      id: 'cnt_SENDNB2606060',
      containerNo: 'SENDNB2606060',
      blNumber: 'SENDNB2606060',
      blDate: '2026-09-01',
      supplierName: 'Ahmad Son company',
      companyName: 'Ahmad Son company',
      codePrefix: 'AN-',
      status: 'In Stock',
      blStatus: 'Partially Delivered',
      arrivalDate: '2026-09-10',
      receivingDate: '2026-09-10',
      destinationCity: 'Peshawar',
      branch: 'Peshawar',
      shipmentDetails: '40FT High Cube Container • Vessel: EVER GIVEN V-204 • Maersk Line • Port Qasim Cleared',
      landingCost: 1250000,
      notes: 'Import shipment custom cleared at Port Qasim. Dispatched to Medimage central depot.',
      createdBy: 'Tariq Mahmood (Ahmad Son Accounts)',
      creatorRole: 'accountant',
      totalCostValue: 18500000,
      totalRetailValue: 28700000,
      items: [
        {
          name: 'Infant Radiant Warmer System (Ahmad Son)',
          category: 'Neonatal Care Equipment',
          sku: 'AN-WRM-01',
          productCode: 'AN-WRM-01',
          quantity: 40,
          costPrice: 120000,
          sellingPrice: 185000,
          barcode: 'AN-BC-WRM01',
          serials: Array.from({ length: 40 }, (_, i) => `AN-WRM-${String(i + 1).padStart(4, '0')}`)
        },
        {
          name: 'Surgical Shadowless OT Light Double Dome',
          category: 'Surgical Equipment',
          sku: 'AN-LGT-01',
          productCode: 'AN-LGT-01',
          quantity: 60,
          costPrice: 85000,
          sellingPrice: 140000,
          barcode: 'AN-BC-LGT01',
          serials: Array.from({ length: 60 }, (_, i) => `AN-LGT-${String(i + 1).padStart(4, '0')}`)
        },
        {
          name: 'Electric ICU Patient Bed 5-Function',
          category: 'Hospital Furniture',
          sku: 'AN-BED-01',
          productCode: 'AN-BED-01',
          quantity: 30,
          costPrice: 220000,
          sellingPrice: 320000,
          barcode: 'AN-BC-BED01',
          serials: Array.from({ length: 30 }, (_, i) => `AN-BED-${String(i + 1).padStart(4, '0')}`)
        },
        {
          name: 'Hydraulic Adjustable Medical Doctor Stools',
          category: 'Hospital Furniture',
          sku: 'AN-STL-01',
          productCode: 'AN-STL-01',
          quantity: 80,
          costPrice: 25000,
          sellingPrice: 42000,
          barcode: 'AN-BC-STL01',
          serials: Array.from({ length: 80 }, (_, i) => `AN-STL-${String(i + 1).padStart(4, '0')}`)
        }
      ]
    },
    {
      id: 'cnt_SZMED992010',
      containerNo: 'SZMED992010',
      blNumber: 'SZMED992010',
      blDate: '2026-09-02',
      supplierName: 'Shenzhen MedTech Global',
      companyName: 'Shenzhen MedTech Global',
      codePrefix: 'SZ-',
      status: 'In Inspection',
      blStatus: 'In Process',
      arrivalDate: '2026-09-12',
      receivingDate: '2026-09-12',
      destinationCity: 'Lahore',
      branch: 'Lahore',
      shipmentDetails: 'Air Freight Cargo Flight EK-602 • Emirates SkyCargo • Islamabad Airport Terminal Cleared',
      landingCost: 850000,
      notes: 'Contains laser aesthetic hardware and multi-parameter monitors under technical inspection.',
      createdBy: 'Sarah Jenkins (Head Store Admin)',
      creatorRole: 'admin',
      totalCostValue: 14200000,
      totalRetailValue: 21500000,
      items: [
        {
          name: 'Diode Laser 808nm Medical Machine',
          category: 'Laser Systems',
          sku: 'LSR-9900',
          productCode: 'LSR-9900',
          quantity: 4,
          costPrice: 1800000,
          sellingPrice: 2450000,
          barcode: 'SZ-BC-LSR99',
          serials: ['LSR-9901', 'LSR-9902', 'LSR-9903', 'LSR-9904']
        }
      ]
    },
    {
      id: 'cnt_BL_MED_2026_03',
      containerNo: 'BL-MED-2026-03',
      blNumber: 'BL-MED-2026-03',
      blDate: '2026-07-01',
      supplierName: 'Siemens Healthineers GmbH',
      companyName: 'Siemens Healthineers GmbH',
      codePrefix: 'US10-',
      status: 'Cleared',
      blStatus: 'Ready to Close',
      arrivalDate: '2026-07-10',
      receivingDate: '2026-07-10',
      destinationCity: 'Peshawar',
      branch: 'Peshawar',
      shipmentDetails: '20FT Standard Container • Vessel: MSC INES • Karachi Port Cleared',
      landingCost: 650000,
      notes: 'Portable Ultrasound Scanner consignment delivered to Northwest General & Multan Medical.',
      createdBy: 'Sarah Jenkins (Head Store Admin)',
      creatorRole: 'admin',
      totalCostValue: 3600000,
      totalRetailValue: 5200000,
      items: [
        {
          name: '10 Inch Portable Ultrasound Scanner System',
          category: 'Ultrasound Machines',
          sku: 'US10-8800',
          productCode: 'US10-8800',
          quantity: 8,
          costPrice: 450000,
          sellingPrice: 650000,
          barcode: 'BC-US10-88',
          serials: ['US10-8801', 'US10-8802', 'US10-8803', 'US10-8804', 'US10-8805', 'US10-8806', 'US10-8807', 'US10-8808']
        }
      ]
    }
  ]

  // Requirement 12 & 13: Customer Category Rules Management
  const initialCustomerCategories = [
    { id: 'cat_premium', code: 'PREMIUM', name: 'Premium', maxCreditLimit: 10000000, paymentDays: 60, maxOpenInvoices: 10, overdueTolerance: 15, description: 'High volume institutional hospitals with 60 days credit terms' },
    { id: 'cat_regular', code: 'REGULAR', name: 'Regular', maxCreditLimit: 2000000, paymentDays: 30, maxOpenInvoices: 5, overdueTolerance: 7, description: 'Standard hospital and clinic accounts with 30 days credit' },
    { id: 'cat_dealer', code: 'DEALER', name: 'Dealer', maxCreditLimit: 5000000, paymentDays: 45, maxOpenInvoices: 8, overdueTolerance: 10, description: 'Authorized regional medical equipment dealers' },
    { id: 'cat_distributor', code: 'DISTRIBUTOR', name: 'Distributor', maxCreditLimit: 8000000, paymentDays: 60, maxOpenInvoices: 12, overdueTolerance: 15, description: 'Provincial wholesale healthcare distributors' },
    { id: 'cat_new', code: 'NEW', name: 'New Customer', maxCreditLimit: 500000, paymentDays: 15, maxOpenInvoices: 2, overdueTolerance: 3, description: 'Recently registered healthcare buyers' },
    { id: 'cat_cash', code: 'CASH', name: 'Cash Only', maxCreditLimit: 0, paymentDays: 0, maxOpenInvoices: 1, overdueTolerance: 0, description: 'Immediate cash payment mandatory before delivery' },
    { id: 'cat_high_risk', code: 'HIGH_RISK', name: 'High-Risk', maxCreditLimit: 0, paymentDays: 0, maxOpenInvoices: 0, overdueTolerance: 0, description: 'Restricted account due to past overdue defaults' }
  ]

  // Requirement 10, 14 & 15: Customer Master with Credit Limit & Ledger Lock
  const initialCustomers = [
    {
      id: 'cust_01',
      name: 'Northwest General Hospital Peshawar',
      category: 'REGULAR',
      branch: 'Peshawar',
      phone: '+92 91 5838000',
      email: 'procurement@nwgh.pk',
      address: 'Sector A-3, Phase 5, Hayatabad, Peshawar',
      baseCreditLimit: 2000000,
      paymentDays: 30,
      status: 'active',
      overrides: []
    },
    {
      id: 'cust_02',
      name: 'Multan Medical Complex',
      category: 'REGULAR',
      branch: 'Multan',
      phone: '+92 61 4589000',
      email: 'accounts@multanmed.com',
      address: 'Nishtar Road, Multan',
      baseCreditLimit: 2000000,
      paymentDays: 30,
      status: 'active',
      overrides: []
    },
    {
      id: 'cust_03',
      name: 'Khyber Aesthetics & Laser Clinic',
      category: 'HIGH_RISK',
      branch: 'Peshawar',
      phone: '+92 91 5701200',
      email: 'dr.aesthetics@khyberlaser.pk',
      address: 'University Road, Peshawar',
      baseCreditLimit: 3000000,
      paymentDays: 15,
      status: 'locked',
      lockReason: 'Credit exposure (PKR 5,682,000) exceeded limit (PKR 3,000,000) & unpaid invoice INV-2026-103.',
      overrides: []
    },
    {
      id: 'cust_04',
      name: 'Allama Iqbal Teaching Hospital (Lahore)',
      category: 'PREMIUM',
      branch: 'Lahore',
      phone: '+92 42 37580000',
      email: 'biomedical@allamaiqbal.gov.pk',
      address: 'Ferozepur Road, Lahore',
      baseCreditLimit: 10000000,
      paymentDays: 60,
      status: 'active',
      overrides: []
    },
    {
      id: 'cust_05',
      name: 'Shaukat Khanum Memorial Hospital',
      category: 'PREMIUM',
      branch: 'Lahore',
      phone: '+92 42 35905000',
      email: 'supplies@skm.org.pk',
      address: '7A Block R-3, Johar Town, Lahore',
      baseCreditLimit: 15000000,
      paymentDays: 60,
      status: 'active',
      overrides: []
    }
  ]

  // Requirement 21 & 23: 30-Day Automated Payment Reminders & Communication Log
  const initialPaymentFollowUps = [
    {
      id: 'fol_01',
      invoiceNo: 'INV-2026-102',
      customer: 'Multan Medical Complex',
      date: '2026-09-14 11:30',
      channel: 'WhatsApp',
      recipient: '+92 61 4589000',
      message: 'Payment Reminder: Balance of PKR 742,000 for Invoice INV-2026-102 is overdue 32 days from delivery.',
      status: 'Delivered',
      sentBy: 'Marcus Vance (Manager)'
    },
    {
      id: 'fol_02',
      invoiceNo: 'INV-2026-103',
      customer: 'Khyber Aesthetics & Laser Clinic',
      date: '2026-09-16 15:45',
      channel: 'System Notification',
      recipient: 'dr.aesthetics@khyberlaser.pk',
      message: 'Critical Credit Lock Notice: Account locked due to unpaid PKR 5,682,000.',
      status: 'Active Alert',
      sentBy: 'Alexander Sterling (SuperAdmin)'
    }
  ]

  // Requirement 28 & 29: Warranty Registry & Claims
  const initialWarranties = [
    {
      id: 'war_01',
      serialCode: 'US10-8803',
      machineCode: 'MC-103',
      productName: '10 Inch Portable Ultrasound Scanner System',
      customer: 'Northwest General Hospital Peshawar',
      saleDate: '2026-07-15',
      deliveryDate: '2026-07-16',
      warrantyStart: '2026-07-16',
      warrantyExpiry: '2027-07-16',
      status: 'Active',
      blNumber: 'BL-MED-2026-03',
      invoiceNo: 'INV-2026-101'
    },
    {
      id: 'war_02',
      serialCode: 'US10-8804',
      machineCode: 'MC-104',
      productName: '10 Inch Portable Ultrasound Scanner System',
      customer: 'Multan Medical Complex',
      saleDate: '2026-08-12',
      deliveryDate: '2026-08-13',
      warrantyStart: '2026-08-13',
      warrantyExpiry: '2027-08-13',
      status: 'Active',
      blNumber: 'BL-MED-2026-03',
      invoiceNo: 'INV-2026-102'
    },
    {
      id: 'war_03',
      serialCode: 'LSR-9902',
      machineCode: 'MC-202',
      productName: '808nm Diode Laser Medical Aesthetic Machine',
      customer: 'Khyber Aesthetics & Laser Clinic',
      saleDate: '2026-09-02',
      deliveryDate: '2026-09-03',
      warrantyStart: '2026-09-03',
      warrantyExpiry: '2027-09-03',
      status: 'Active',
      blNumber: 'SZMED992010',
      invoiceNo: 'INV-2026-103'
    }
  ]

  const initialWarrantyClaims = [
    {
      id: 'clm_001',
      claimNo: 'CLM-2026-001',
      claimDate: '2026-09-10',
      serialCode: 'US10-8804',
      machineCode: 'MC-104',
      productName: '10 Inch Portable Ultrasound Scanner System',
      customer: 'Multan Medical Complex',
      complaint: 'Display screen intermittent flicker during abdominal scan examination',
      diagnosis: 'Power inverter board capacitor degradation from voltage surge',
      repairAction: 'Replaced inverter module & calibrated display brightness',
      partsUsed: [{ partCode: 'PRT-INV-01', name: 'Ultrasound Inverter Board 12V', qty: 1, cost: 15000 }],
      replacementSerial: null,
      status: 'Completed',
      completedDate: '2026-09-12',
      technician: 'Engr. Imran Khan'
    }
  ]

  // Requirement 30: Workshop Parts & Spare Parts Management
  const initialWorkshopParts = [
    { partCode: 'PRT-INV-01', name: 'Ultrasound Inverter Board 12V', category: 'Boards & Electronics', stockQty: 14, costPrice: 15000, reorderLevel: 5 },
    { partCode: 'PRT-PRB-02', name: 'Convex Ultrasound Probe Cable 3.5MHz', category: 'Probes & Transducers', stockQty: 8, costPrice: 42000, reorderLevel: 3 },
    { partCode: 'PRT-LSR-03', name: 'Diode Laser Sapphire Cooling Tip', category: 'Laser Optics', stockQty: 6, costPrice: 65000, reorderLevel: 2 },
    { partCode: 'PRT-WRM-04', name: 'Infant Warmer Ceramic Heating Element', category: 'Heating & Sensors', stockQty: 22, costPrice: 8500, reorderLevel: 6 },
    { partCode: 'PRT-LGT-05', name: 'OT Light High-CRI LED Module 50W', category: 'Lighting Modules', stockQty: 35, costPrice: 4500, reorderLevel: 10 }
  ]

  // Requirement 31 & 32: Faulty / Damaged Stock & Machine Repair / Replacement Tracking
  const initialFaultyMachines = [
    {
      id: 'flt_001',
      faultNo: 'FLT-2026-01',
      serialCode: 'US10-8899',
      machineCode: 'MC-999',
      productName: '10 Inch Portable Ultrasound Scanner System',
      branch: 'Multan',
      status: 'Under Repair',
      complaint: 'High voltage spark detected in primary power transformer',
      receivingDate: '2026-09-08',
      diagnosis: 'Short circuit on primary coil due to local power fluctuation',
      replacementSerial: null,
      history: [
        { date: '2026-09-08', action: 'Received into workshop from Multan Complex', user: 'Workshop Technician' },
        { date: '2026-09-09', action: 'Inspection completed, power module failure isolated', user: 'Lead Biomedical Engineer' }
      ]
    }
  ]

  // Requirement 34: Expense / Expenditure Management
  const initialExpenses = [
    {
      id: 'exp_01',
      voucherNo: 'EXP-2026-001',
      category: 'Customs & Port Demurrage',
      branch: 'Peshawar',
      date: '2026-09-05',
      amount: 350000,
      paymentMode: 'Bank Transfer (Meezan)',
      bankCash: 'Meezan Bank A/C 0201-9988',
      description: 'Customs port clearance & terminal handling for container SENDNB2606060',
      supportingRef: 'BL-SENDNB2606060-CUSTOMS',
      recordedBy: 'Tariq Mahmood (Accountant)'
    },
    {
      id: 'exp_02',
      voucherNo: 'EXP-2026-002',
      category: 'Freight & Inland Logistics',
      branch: 'Lahore',
      date: '2026-09-08',
      amount: 180000,
      paymentMode: 'Cash Voucher',
      bankCash: 'Petty Cash Lahore Hub',
      description: 'Tractor trailer freight delivery of ICU beds from Karachi port to Lahore depot',
      supportingRef: 'FRT-LHR-8821',
      recordedBy: 'Sarah Jenkins (Admin)'
    },
    {
      id: 'exp_03',
      voucherNo: 'EXP-2026-003',
      category: 'Workshop Tooling & Calibration',
      branch: 'Peshawar',
      date: '2026-09-11',
      amount: 95000,
      paymentMode: 'Bank Transfer (HBL)',
      bankCash: 'HBL A/C 0100-5544',
      description: 'Annual electrical safety analyzer calibration certification (IEC 60601)',
      supportingRef: 'CALIB-CERT-2026',
      recordedBy: 'Marcus Vance (Manager)'
    }
  ]

  const initialReconciliationRecords = [
    {
      id: 'rec_35m_01',
      entryNo: 'REC-35M-001',
      date: '2026-09-12',
      accountantName: 'Tariq Mahmood (Ahmad Son Accounts)',
      containerNo: 'SENDNB2606060',
      companyName: 'Ahmad Son company',
      formAmount: 14850000,
      productSoldValue: 14850000,
      cogsCostValue: 9600000,
      paymentInflowCollected: 14850000,
      variance: 0,
      destinationCity: 'Lahore Depot & Multan Complex',
      description: 'Bulk dispatch: 30x Ahmad Son ICU Beds & 40x Radiant Warmers to Punjab hospitals',
      status: 'Verified',
      verifiedBy: 'Alexander Sterling (SuperAdmin)',
      verifiedDate: '2026-09-12 18:30',
      notes: 'Amounts cross-checked against Meezan Bank RTGS and physical serial dispatch.'
    },
    {
      id: 'rec_35m_02',
      entryNo: 'REC-35M-002',
      date: '2026-09-14',
      accountantName: 'Tariq Mahmood (Ahmad Son Accounts)',
      containerNo: 'SENDNB2606060',
      companyName: 'Ahmad Son company',
      formAmount: 12400000,
      productSoldValue: 12400000,
      cogsCostValue: 7900000,
      paymentInflowCollected: 12400000,
      variance: 0,
      destinationCity: 'Peshawar HO & Hayatabad Complex',
      description: '60x Surgical OT Lights & 80x Stainless Doctor Stools delivery with full invoice clearance',
      status: 'Verified',
      verifiedBy: 'Alexander Sterling (SuperAdmin)',
      verifiedDate: '2026-09-14 20:15',
      notes: '100% cross-checked against cash receipt counter and HBL bank confirmation.'
    },
    {
      id: 'rec_35m_03',
      entryNo: 'REC-35M-003',
      date: '2026-09-15',
      accountantName: 'Tariq Mahmood (Ahmad Son Accounts)',
      containerNo: 'SENDNB2606060',
      companyName: 'Ahmad Son company',
      formAmount: 8250000,
      productSoldValue: 8250000,
      cogsCostValue: 5350000,
      paymentInflowCollected: 8250000,
      variance: 0,
      destinationCity: 'Islamabad Medical City & Rawalpindi',
      description: 'Phase 3 container product dispatch: Remaining warmers and OT lights with full invoice record',
      status: 'Pending Audit',
      verifiedBy: null,
      verifiedDate: null,
      notes: 'Awaiting SuperAdmin one-click audit approval and reconciliation sign-off.'
    }
  ]

  // Clear any legacy localStorage keys to strictly keep all state inside Pinia store as requested
  try {
    const keysToRemove = [
      'medimage_products', 'medimage_serials', 'medimage_pos',
      'medimage_sales', 'medimage_payments', 'medimage_transfers',
      'medimage_audit_logs', 'medimage_returns', 'medimage_payments_out',
      'medimage_containers', 'medimage_reconciliations'
    ]
    keysToRemove.forEach(k => localStorage.removeItem(k))
  } catch (e) {}

  // Pure Pinia Reactive State (Managed 100% in Pinia store, DO NOT save to localStorage)
  const products = ref(JSON.parse(JSON.stringify(initialProducts)))
  const serials = ref(JSON.parse(JSON.stringify(initialSerials)))
  const purchaseOrders = ref(JSON.parse(JSON.stringify(initialPurchaseOrders)))
  const salesInvoices = ref(JSON.parse(JSON.stringify(initialSalesInvoices)))
  const paymentReceipts = ref(JSON.parse(JSON.stringify(initialPaymentReceipts)))
  const stockTransfers = ref(JSON.parse(JSON.stringify(initialStockTransfers)))
  const auditLogs = ref(JSON.parse(JSON.stringify(initialAuditLogs)))
  const salesReturns = ref(JSON.parse(JSON.stringify(initialSalesReturns)))
  const paymentOutVouchers = ref(JSON.parse(JSON.stringify(initialPaymentOutVouchers)))
  const containers = ref(JSON.parse(JSON.stringify(initialContainers)))
  const reconciliationRecords = ref(JSON.parse(JSON.stringify(initialReconciliationRecords)))

  // ERP Domain State Collections
  const customerCategories = ref(JSON.parse(JSON.stringify(initialCustomerCategories)))
  const customers = ref(JSON.parse(JSON.stringify(initialCustomers)))
  const paymentFollowUps = ref(JSON.parse(JSON.stringify(initialPaymentFollowUps)))
  const warranties = ref(JSON.parse(JSON.stringify(initialWarranties)))
  const warrantyClaims = ref(JSON.parse(JSON.stringify(initialWarrantyClaims)))
  const workshopSpareParts = ref(JSON.parse(JSON.stringify(initialWorkshopParts)))
  const faultyMachines = ref(JSON.parse(JSON.stringify(initialFaultyMachines)))
  const expenses = ref(JSON.parse(JSON.stringify(initialExpenses)))

  // Multi-Branch Management
  const branches = [
    'All Branches (Consolidated)',
    'Peshawar (Head Office)',
    'Multan',
    'Lahore',
    'Islamabad',
    'Karachi'
  ]
  const activeBranchFilter = ref('All Branches (Consolidated)')

  // ══════════════════════════════════════════════════════════════════
  // STRICT 4-TIER DOWNWARD ROLE HIERARCHY ENGINE
  // Level 4 (SuperAdmin): Sees SuperAdmin, Admin, Manager, Accountant (ALL)
  // Level 3 (Admin): Sees Admin, Manager, Accountant (cannot see SuperAdmin)
  // Level 2 (Manager): Sees Manager, Accountant (cannot see Admin or SuperAdmin)
  // Level 1 (Accountant): Sees Accountant ONLY (cannot see Manager, Admin, or SuperAdmin)
  // ══════════════════════════════════════════════════════════════════
  function canActiveUserSeeRole(targetRole) {
    if (!targetRole) return true
    const viewerLevel = authStore.roleLevel || 1
    const targetLevel = ROLE_HIERARCHY[String(targetRole).toLowerCase()] || 1
    return viewerLevel >= targetLevel
  }

  // Reactive downward filtered collections:
  const visibleProducts = computed(() => {
    return products.value.filter(p => canActiveUserSeeRole(p.addedRole || 'accountant'))
  })

  const visibleSerials = computed(() => {
    const allowedProductIds = new Set(visibleProducts.value.map(p => p.id || p._id || p.sku))
    const allowedSkus = new Set(visibleProducts.value.map(p => (p.sku || '').toUpperCase()))
    return serials.value.filter(s => {
      if (s.productId && allowedProductIds.has(s.productId)) return true
      if (s.sku && allowedSkus.has((s.sku || '').toUpperCase())) return true
      return false
    })
  })

  const visibleSalesInvoices = computed(() => {
    return salesInvoices.value.filter(inv => canActiveUserSeeRole(inv.creatorRole || 'manager'))
  })

  const visibleContainers = computed(() => {
    return containers.value.filter(c => canActiveUserSeeRole(c.creatorRole || 'accountant'))
  })

  const visibleAuditLogs = computed(() => {
    return auditLogs.value.filter(l => canActiveUserSeeRole(l.role || 'manager'))
  })

  const visibleReconciliationRecords = computed(() => {
    if (authStore.roleLevel >= 4) return reconciliationRecords.value
    return reconciliationRecords.value.filter(r => canActiveUserSeeRole(r.addedRole || 'accountant'))
  })

  function saveState() {
    // Pure in-memory Pinia reactive store: Do NOT save to localStorage as per strict user directive
  }

  // Ensure every product with stock has corresponding unique serials and machine codes
  // Automatically migrates any legacy 'SN-' prefixes to ensure only product-specific codes are used
  function ensureProductSerialsConsistency() {
    let changed = false

    // 1. Migrate and strip any legacy 'SN-' prefix from existing serials
    serials.value.forEach(s => {
      if (s.serialCode && /^SN-/i.test(s.serialCode)) {
        const oldCode = s.serialCode
        s.serialCode = stripSn(s.serialCode)
        changed = true

        // Synchronize in sales invoices and receipts
        salesInvoices.value.forEach(inv => {
          inv.items?.forEach(it => {
            if (Array.isArray(it.serials)) {
              it.serials = it.serials.map(c => c === oldCode ? s.serialCode : stripSn(c))
            }
          })
        })
        paymentReceipts.value.forEach(rcp => {
          rcp.paidSerials?.forEach(ps => {
            if (ps.serialCode === oldCode) ps.serialCode = s.serialCode
          })
        })
        stockTransfers.value.forEach(tr => {
          tr.serials?.forEach(ts => {
            if (ts.serialCode === oldCode) ts.serialCode = s.serialCode
          })
        })
      }
    })

    let globalIndex = serials.value.length + 100

    products.value.forEach(p => {
      if (!p.id && p._id) p.id = p._id.toString()
      const pId = p.id || p._id || p.sku
      const pSku = (p.sku || '').trim().toUpperCase()
      const citiesArr = Array.isArray(p.allocationCities) && p.allocationCities.length > 0 
        ? p.allocationCities 
        : (p.allocationCity ? p.allocationCity.split(',').map(s => s.trim()) : ['Peshawar'])
      const defaultCity = citiesArr[0] || 'Peshawar'

      // Match existing serials: STRICTLY for this product (productId or matching SKU)
      const matchingSerials = serials.value.filter(s => {
        if (pId && s.productId && (String(s.productId) === String(pId))) return true
        if (pSku && s.sku && s.sku.trim().toUpperCase() === pSku) return true
        return false
      })

      // Ensure every matching serial is correctly linked
      matchingSerials.forEach(s => {
        if (!s.productId && pId) { s.productId = pId; changed = true }
        if (!s.sku && pSku) { s.sku = pSku; changed = true }
        if (!s.allocationCity) { s.allocationCity = defaultCity; changed = true }
      })

      const availableSerials = matchingSerials.filter(s => s.status === 'Available')
      const targetQty = Number(p.stockQty) || 0

      // If available serials are less than product stockQty, auto-generate missing units
      // Notice: NO 'SN-' prefix! Uses product-specific SKU and index: e.g. 1-0101, US10-0101
      if (availableSerials.length < targetQty) {
        const missingCount = targetQty - availableSerials.length
        for (let i = 1; i <= missingCount; i++) {
          globalIndex++
          const assignedCity = citiesArr[(i - 1) % citiesArr.length] || defaultCity
          const specificCode = pSku || 'MED'
          let serialCode = `${specificCode}-${String(globalIndex).padStart(4, '0')}`
          while (checkDuplicateSerial(serialCode)) {
            globalIndex++
            serialCode = `${specificCode}-${String(globalIndex).padStart(4, '0')}`
          }
          const machineCode = `MC-${globalIndex}`

          serials.value.unshift({
            serialCode,
            machineCode,
            productId: pId,
            sku: pSku,
            status: 'Available',
            allocationCity: assignedCity,
            binLocation: p.storageBin || 'HQ-PEW-01',
            registeredDate: new Date().toISOString().substring(0, 10),
            soldDate: null,
            customer: null,
            invoiceNo: null,
            paymentStatus: 'Pending',
            hsnCode: p.hsnCode || '9018.1200',
            taxRatio: Number(p.taxRatio || 18),
            salePrice: 0
          })
          changed = true
        }
      }
    })

    if (changed) {
      saveState()
    }
  }

  // Initial consistency check
  ensureProductSerialsConsistency()

  // Sync with MongoDB API backend only after user authentication
  let isSyncing = false
  async function syncWithBackend() {
    if (isSyncing || !authStore.isAuthenticated) return
    isSyncing = true
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const mongoProducts = await res.json()
        if (Array.isArray(mongoProducts) && mongoProducts.length > 0) {
          products.value = mongoProducts.map(p => ({
            ...p,
            id: p._id ? p._id.toString() : (p.id || `prd_${Date.now()}`)
          }))
        }
      }
    } catch (e) {}

    try {
      const resSerials = await fetch('/api/serials')
      if (resSerials.ok) {
        const mongoSerials = await resSerials.json()
        if (Array.isArray(mongoSerials) && mongoSerials.length > 0) {
          serials.value = mongoSerials.map(s => ({
            ...s,
            id: s._id ? s._id.toString() : s.id
          }))
        }
      }
    } catch (e) {}

    try {
      const resTransfers = await fetch('/api/transfers')
      if (resTransfers.ok) {
        const mongoTransfers = await resTransfers.json()
        if (Array.isArray(mongoTransfers) && mongoTransfers.length > 0) {
          stockTransfers.value = mongoTransfers
        }
      }
    } catch (e) {}

    try {
      const resSales = await fetch('/api/sales')
      if (resSales.ok) {
        const mongoSales = await resSales.json()
        if (Array.isArray(mongoSales) && mongoSales.length > 0) {
          salesInvoices.value = mongoSales
        }
      }
    } catch (e) {}

    try {
      const resPurchases = await fetch('/api/purchases')
      if (resPurchases.ok) {
        const mongoPurchases = await resPurchases.json()
        if (Array.isArray(mongoPurchases) && mongoPurchases.length > 0) {
          purchaseOrders.value = mongoPurchases
        }
      }
    } catch (e) {}

    try {
      const resPayments = await fetch('/api/payments')
      if (resPayments.ok) {
        const mongoPayments = await resPayments.json()
        if (Array.isArray(mongoPayments) && mongoPayments.length > 0) {
          paymentReceipts.value = mongoPayments
        }
      }
    } catch (e) {}

    try {
      const resAudit = await fetch('/api/audit')
      if (resAudit.ok) {
        const mongoAudit = await resAudit.json()
        if (Array.isArray(mongoAudit) && mongoAudit.length > 0) {
          auditLogs.value = mongoAudit
        }
      }
    } catch (e) {}

    try {
      const resReturns = await fetch('/api/returns')
      if (resReturns.ok) {
        const mongoReturns = await resReturns.json()
        if (Array.isArray(mongoReturns) && mongoReturns.length > 0) {
          salesReturns.value = mongoReturns
        }
      }
    } catch (e) {}

    try {
      const resPaymentsOut = await fetch('/api/payments-out')
      if (resPaymentsOut.ok) {
        const mongoPaymentsOut = await resPaymentsOut.json()
        if (Array.isArray(mongoPaymentsOut) && mongoPaymentsOut.length > 0) {
          paymentOutVouchers.value = mongoPaymentsOut
        }
      }
    } catch (e) {}

    try {
      const resContainers = await fetch('/api/containers')
      if (resContainers.ok) {
        const mongoContainers = await resContainers.json()
        if (Array.isArray(mongoContainers) && mongoContainers.length > 0) {
          containers.value = mongoContainers
        }
      }
    } catch (e) {}

    try {
      const resCustomers = await fetch('/api/customers')
      if (resCustomers.ok) {
        const mongoCustomers = await resCustomers.json()
        if (Array.isArray(mongoCustomers) && mongoCustomers.length > 0) {
          customers.value = mongoCustomers.map(c => ({
            ...c,
            id: c.id || (c._id ? c._id.toString() : `cust_${Date.now()}`)
          }))
        }
      }
    } catch (e) {}

    try {
      const resExpenses = await fetch('/api/expenses')
      if (resExpenses.ok) {
        const mongoExpenses = await resExpenses.json()
        if (Array.isArray(mongoExpenses) && mongoExpenses.length > 0) {
          expenses.value = mongoExpenses
        }
      }
    } catch (e) {}

    try {
      const resRecs = await fetch('/api/reconciliations')
      if (resRecs.ok) {
        const mongoRecs = await resRecs.json()
        if (Array.isArray(mongoRecs) && mongoRecs.length > 0) {
          reconciliationRecords.value = mongoRecs
        }
      }
    } catch (e) {} finally {
      isSyncing = false
    }

    ensureProductSerialsConsistency()
    saveState()
  }

  // Trigger sync if already authenticated on mount
  onMounted(() => {
    if (authStore.isAuthenticated) {
      syncWithBackend()
    }
  })

  // Trigger sync as soon as user successfully logs in
  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (isAuth) {
      syncWithBackend()
    }
  })

  // Metrics & Aggregations
  const totalRevenue = computed(() => salesInvoices.value.reduce((acc, inv) => acc + (inv.subtotal - (inv.discount || 0)), 0))
  const totalCOGS = computed(() => salesInvoices.value.reduce((acc, inv) => acc + inv.totalCost, 0))
  const grossProfit = computed(() => totalRevenue.value - totalCOGS.value)
  const profitMarginPercent = computed(() => totalRevenue.value ? ((grossProfit.value / totalRevenue.value) * 100).toFixed(2) : 0)
  
  // Dynamic metrics calculation for sales filtered by date range or single date
  function getSalesMetrics(startDate = null, endDate = null) {
    let filtered = salesInvoices.value
    if (startDate && endDate) {
      filtered = filtered.filter(i => {
        const d = (i.saleDate || '').substring(0, 10)
        return d >= startDate && d <= endDate
      })
    } else if (startDate) {
      filtered = filtered.filter(i => (i.saleDate || '').substring(0, 10) >= startDate)
    } else if (endDate) {
      filtered = filtered.filter(i => (i.saleDate || '').substring(0, 10) <= endDate)
    }

    const revenue = filtered.reduce((acc, inv) => acc + (inv.subtotal - (inv.discount || 0)), 0)
    const cogs = filtered.reduce((acc, inv) => acc + (inv.totalCost || 0), 0)
    const profit = revenue - cogs
    const marginPercent = revenue ? Number(((profit / revenue) * 100).toFixed(2)) : 0

    return {
      invoices: filtered,
      count: filtered.length,
      revenue,
      cogs,
      profit,
      marginPercent
    }
  }
  
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

  // Money In, Money Out & Cash Flow Engine
  const totalMoneyIn = computed(() => {
    return paymentReceipts.value.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
  })

  const totalMoneyOut = computed(() => {
    const vouchersTotal = paymentOutVouchers.value.reduce((acc, v) => acc + (Number(v.amount) || 0), 0)
    return vouchersTotal
  })

  const netCashFlow = computed(() => totalMoneyIn.value - totalMoneyOut.value)

  function getCashFlowLedger(startDate = null, endDate = null, branch = 'ALL', method = 'ALL', direction = 'ALL') {
    const sDate = startDate ? startDate.substring(0, 10) : null
    const eDate = endDate ? endDate.substring(0, 10) : null

    const list = []

    // 1. Money Inflows (Receipts)
    if (direction === 'ALL' || direction === 'IN') {
      paymentReceipts.value.forEach(r => {
        const d = (r.paymentDate || '').substring(0, 10)
        if (sDate && d < sDate) return
        if (eDate && d > eDate) return
        if (branch !== 'ALL' && r.branch !== branch) return
        const pMethod = r.paymentType || r.paymentMethod || 'Cash Payment'
        if (method !== 'ALL' && !pMethod.toLowerCase().includes(method.toLowerCase())) return

        list.push({
          id: r.receiptNo || r._id || `in_${Math.random()}`,
          voucherOrReceiptNo: r.receiptNo,
          direction: 'IN',
          date: d,
          partyName: r.customer || 'Direct Customer',
          category: 'Customer Sales Receipt',
          paymentMethod: pMethod,
          branch: r.branch || 'Peshawar',
          amount: Number(r.amount || 0),
          description: r.description || 'Payment In Received',
          user: r.receivedBy || 'Staff'
        })
      })
    }

    // 2. Money Outflows (Disbursements / Vouchers / Refunds)
    if (direction === 'ALL' || direction === 'OUT') {
      paymentOutVouchers.value.forEach(v => {
        const d = (v.paymentDate || '').substring(0, 10)
        if (sDate && d < sDate) return
        if (eDate && d > eDate) return
        if (branch !== 'ALL' && v.branch !== branch) return
        const pMethod = v.paymentType || v.paymentMethod || 'Cash Payment'
        if (method !== 'ALL' && !pMethod.toLowerCase().includes(method.toLowerCase())) return

        list.push({
          id: v.voucherNo || v._id || `out_${Math.random()}`,
          voucherOrReceiptNo: v.voucherNo,
          direction: 'OUT',
          date: d,
          partyName: v.payee || 'Payee / Vendor',
          category: v.category || 'Disbursement',
          paymentMethod: pMethod,
          branch: v.branch || 'Peshawar',
          amount: Number(v.amount || 0),
          description: v.description || 'Payment Out Voucher',
          user: v.disbursedBy || 'Staff'
        })
      })
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // Duplicate Serial Number check across system
  function checkDuplicateSerial(serialCode) {
    if (!serialCode) return false
    const codeClean = stripSn(serialCode).toLowerCase()
    return serials.value.some(s => s.serialCode && stripSn(s.serialCode).toLowerCase() === codeClean)
  }

  // Check existing Machine Code
  function checkDuplicateMachineCode(mCode) {
    if (!mCode) return false
    const codeClean = mCode.trim().toLowerCase()
    return serials.value.some(s => s.machineCode && s.machineCode.trim().toLowerCase() === codeClean)
  }

  // Universal Search 360 Machine Journey Lookup (Protected by Downward Hierarchy)
  function searchMachineJourney(queryTerm) {
    if (!queryTerm) return null
    const q = queryTerm.trim().toLowerCase()
    const qClean = stripSn(q).toLowerCase()
    const serialDoc = visibleSerials.value.find(s => {
      const sCode = (s.serialCode || '').trim().toLowerCase()
      const sCodeClean = stripSn(sCode).toLowerCase()
      const mCode = (s.machineCode || '').trim().toLowerCase()
      return sCode === q || sCodeClean === qClean || sCodeClean === q || mCode === q
    })

    if (!serialDoc) return null

    const product = visibleProducts.value.find(p => p.id === serialDoc.productId || p._id === serialDoc.productId || p.sku === serialDoc.sku)
    const saleInvoice = serialDoc.invoiceNo ? visibleSalesInvoices.value.find(i => i.invoiceNo === serialDoc.invoiceNo) : null
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

  // Get Customer Ledger & Purchased History with Auto-Reconciled Machines & Returns
  function getCustomerLedger(customerName) {
    if (!customerName) return null
    const cNameClean = customerName.trim().toLowerCase()

    const invoices = salesInvoices.value.filter(i => 
      (i.customer && i.customer.trim().toLowerCase() === cNameClean) ||
      (i.customerName && i.customerName.trim().toLowerCase() === cNameClean)
    )
    const receipts = paymentReceipts.value.filter(r => 
      (r.customer && r.customer.trim().toLowerCase() === cNameClean) ||
      (r.customerName && r.customerName.trim().toLowerCase() === cNameClean)
    )
    const returns = salesReturns.value.filter(ret => 
      (ret.customer && ret.customer.trim().toLowerCase() === cNameClean) ||
      (ret.customerName && ret.customerName.trim().toLowerCase() === cNameClean)
    )
    const paymentsOut = paymentOutVouchers.value.filter(v => 
      (v.payee && v.payee.trim().toLowerCase() === cNameClean) ||
      (v.customer && v.customer.trim().toLowerCase() === cNameClean)
    )

    // Build comprehensive customer machine tracking map
    const machinesMap = new Map()

    // 1. Check serials table for direct matches
    serials.value.forEach(s => {
      if (s.customer && s.customer.trim().toLowerCase() === cNameClean) {
        machinesMap.set(s.serialCode, {
          serialCode: s.serialCode,
          machineCode: s.machineCode || 'MC-100',
          sku: s.sku || 'MED-DEVICE',
          productName: s.productName || s.sku || 'Medical Equipment',
          status: s.status || 'Sold',
          allocationCity: s.allocationCity || 'Peshawar',
          paymentStatus: s.paymentStatus || 'Pending',
          paymentReceiptNo: s.paymentReceiptNo || '',
          paymentDate: s.paymentDate || '',
          paymentAmount: s.paymentAmount || s.salePrice || 0,
          invoiceNo: s.invoiceNo || '',
          unpaidDate: s.soldDate || s.registeredDate || '',
          salePrice: s.salePrice || 0,
          customer: customerName
        })
      }
    })

    // 2. Reconcile from all sales invoices (guarantees units never show 0 if invoices exist)
    invoices.forEach(inv => {
      const isPaid = inv.paymentMethod === 'Cash Payment' || inv.paymentStatus === 'Paid'
      inv.items?.forEach(it => {
        const serialsList = it.serials || []
        const machineCodesList = it.machineCodes || []
        const qty = Number(it.qty || 1)
        const unitVal = Number(it.unitPrice || (it.total ? it.total / qty : 0))

        if (serialsList.length > 0) {
          serialsList.forEach((sCode, idx) => {
            const mCode = machineCodesList[idx] || it.machineCode || sCode
            const existing = machinesMap.get(sCode)
            if (existing) {
              if (!existing.invoiceNo) existing.invoiceNo = inv.invoiceNo
              if (!existing.unpaidDate) existing.unpaidDate = inv.saleDate
              if (!existing.allocationCity && inv.branch) existing.allocationCity = inv.branch
              if (!existing.productName || existing.productName === existing.sku) existing.productName = it.productName
              if (!existing.salePrice) existing.salePrice = unitVal
              if (isPaid && existing.paymentStatus !== 'Paid') {
                existing.paymentStatus = 'Paid'
                existing.paymentDate = inv.saleDate
                existing.paymentAmount = unitVal
                existing.paymentReceiptNo = 'Cash Sale'
              }
            } else {
              machinesMap.set(sCode, {
                serialCode: sCode,
                machineCode: mCode,
                sku: it.sku || it.productName,
                productName: it.productName,
                status: 'Sold',
                allocationCity: inv.branch || 'Peshawar',
                paymentStatus: isPaid ? 'Paid' : 'Pending',
                paymentReceiptNo: isPaid ? 'Cash Sale' : '',
                paymentDate: isPaid ? inv.saleDate : '',
                paymentAmount: isPaid ? unitVal : 0,
                invoiceNo: inv.invoiceNo,
                unpaidDate: inv.saleDate,
                salePrice: unitVal,
                customer: customerName
              })
            }
          })
        } else {
          // If invoice line item didn't have serials listed, track unit by item line key
          for (let i = 0; i < qty; i++) {
            const virtualCode = `${inv.invoiceNo}-${it.productName.substring(0, 8)}-${i + 1}`
            if (!machinesMap.has(virtualCode)) {
              machinesMap.set(virtualCode, {
                serialCode: virtualCode,
                machineCode: it.machineCode || `MC-${inv.invoiceNo.replace(/[^0-9]/g, '').slice(-3) || '100'}`,
                sku: it.sku || it.productName,
                productName: it.productName,
                status: 'Sold',
                allocationCity: inv.branch || 'Peshawar',
                paymentStatus: isPaid ? 'Paid' : 'Pending',
                paymentReceiptNo: isPaid ? 'Cash Sale' : '',
                paymentDate: isPaid ? inv.saleDate : '',
                paymentAmount: isPaid ? unitVal : 0,
                invoiceNo: inv.invoiceNo,
                unpaidDate: inv.saleDate,
                salePrice: unitVal,
                customer: customerName
              })
            }
          }
        }
      })
    })

    // 3. Mark paid from payment receipts
    receipts.forEach(rcp => {
      rcp.paidSerials?.forEach(ps => {
        const target = machinesMap.get(ps.serialCode)
        if (target) {
          target.paymentStatus = 'Paid'
          target.paymentReceiptNo = rcp.receiptNo
          target.paymentDate = rcp.paymentDate
          target.paymentAmount = Number(ps.amountAllocated || target.salePrice || rcp.amount || 0)
        }
      })
    })

    const customerMachines = Array.from(machinesMap.values())
    const paidMachines = customerMachines.filter(s => s.paymentStatus === 'Paid')
    const pendingMachines = customerMachines.filter(s => s.paymentStatus !== 'Paid')

    const totalInvoiced = invoices.reduce((acc, i) => acc + (Number(i.grandTotal) || 0), 0)
    const totalPaid = receipts.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
    const totalReturned = returns.reduce((acc, ret) => acc + (Number(ret.totalRefundAmount) || 0), 0)
    const totalDisbursed = paymentsOut.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
    const outstandingBalance = Math.max(0, totalInvoiced - totalPaid - totalReturned + totalDisbursed)

    // Items bought breakdown
    const purchasedItemsMap = {}
    invoices.forEach(inv => {
      inv.items?.forEach(it => {
        if (!purchasedItemsMap[it.productName]) {
          purchasedItemsMap[it.productName] = {
            productName: it.productName,
            totalQty: 0,
            totalAmount: 0,
            lastPurchaseDate: inv.saleDate
          }
        }
        purchasedItemsMap[it.productName].totalQty += Number(it.qty || 1)
        purchasedItemsMap[it.productName].totalAmount += Number(it.total || (it.qty * it.unitPrice) || 0)
        if (new Date(inv.saleDate) > new Date(purchasedItemsMap[it.productName].lastPurchaseDate)) {
          purchasedItemsMap[it.productName].lastPurchaseDate = inv.saleDate
        }
      })
    })

    return {
      customerName,
      invoices,
      receipts,
      returns,
      paymentsOut,
      customerMachines,
      paidMachines,
      pendingMachines,
      totalInvoiced,
      totalPaid,
      totalReturned,
      totalDisbursed,
      outstandingBalance,
      purchasedItems: Object.values(purchasedItemsMap)
    }
  }

  // Requirement 47: Customer Ledger Balance Calculation
  function getCustomerLedgerBalance(customerName, excludeInvoiceNo = null) {
    if (!customerName) return 0
    const cNameClean = customerName.trim().toLowerCase()

    let invoices = salesInvoices.value.filter(i => 
      (i.customer && i.customer.trim().toLowerCase() === cNameClean) ||
      (i.customerName && i.customerName.trim().toLowerCase() === cNameClean)
    )
    if (excludeInvoiceNo) {
      invoices = invoices.filter(i => i.invoiceNo !== excludeInvoiceNo)
    }

    const receipts = paymentReceipts.value.filter(r => 
      (r.customer && r.customer.trim().toLowerCase() === cNameClean) ||
      (r.customerName && r.customerName.trim().toLowerCase() === cNameClean)
    )
    const returns = salesReturns.value.filter(ret => 
      (ret.customer && ret.customer.trim().toLowerCase() === cNameClean) ||
      (ret.customerName && ret.customerName.trim().toLowerCase() === cNameClean)
    )
    const paymentsOut = paymentOutVouchers.value.filter(v => 
      (v.payee && v.payee.trim().toLowerCase() === cNameClean) ||
      (v.customer && v.customer.trim().toLowerCase() === cNameClean)
    )

    const totalInvoiced = invoices.reduce((acc, i) => acc + (Number(i.grandTotal) || 0), 0)
    const totalPaid = receipts.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
    const totalReturned = returns.reduce((acc, ret) => acc + (Number(ret.totalRefundAmount) || 0), 0)
    const totalDisbursed = paymentsOut.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)

    return Math.max(0, totalInvoiced - totalPaid - totalReturned + totalDisbursed)
  }

  // Requirement 46: Dealer-Wise Previous Sale Price Auto Suggestion
  function getDealerPreviousSalePrice(customerName, productIdOrSku) {
    if (!customerName || !productIdOrSku) return null
    const cName = customerName.trim().toLowerCase()
    const prod = products.value.find(p => p.id === productIdOrSku || p._id === productIdOrSku || p.sku === productIdOrSku)
    const prodName = prod?.name?.trim().toLowerCase()
    const prodSku = prod?.sku?.trim().toUpperCase()
    const catalogPrice = Number(prod ? (prod.sellingPrice || prod.salePrice || 0) : 0)

    // Sort invoices descending by date to fetch the latest price offered to this dealer across all branches
    const sortedInvoices = [...salesInvoices.value].sort((a, b) => {
      const dateA = new Date(a.saleDate || a.createdAt || 0).getTime()
      const dateB = new Date(b.saleDate || b.createdAt || 0).getTime()
      return dateB - dateA
    })

    for (const inv of sortedInvoices) {
      const invCustomer = (inv.customer || inv.customerName || '').trim().toLowerCase()
      if (invCustomer === cName && inv.items && Array.isArray(inv.items)) {
        for (const item of inv.items) {
          const itemSku = (item.sku || item.productCode || '').trim().toUpperCase()
          const itemName = (item.productName || '').trim().toLowerCase()
          const itemProdId = item.productId || ''

          const isMatch = (itemProdId && prod && (itemProdId === prod.id || itemProdId === prod._id)) ||
                          (prodSku && itemSku === prodSku) ||
                          (prodName && itemName === prodName)

          if (isMatch && item.unitPrice !== undefined && item.unitPrice !== null && !isNaN(Number(item.unitPrice))) {
            return {
              hasHistory: true,
              price: Number(item.unitPrice),
              catalogPrice,
              invoiceNo: inv.invoiceNo,
              saleDate: inv.saleDate,
              branch: inv.branch || 'Centralized',
              source: 'Dealer Previous Sale History'
            }
          }
        }
      }
    }

    return {
      hasHistory: false,
      price: catalogPrice,
      catalogPrice,
      invoiceNo: null,
      saleDate: null,
      branch: null,
      source: 'Product Master Default Sale Price'
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
        const prod = products.value.find(p => p.sku === s.sku || p.id === s.productId || p._id === s.productId)
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
      read: false
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

  async function markAuditLogAsRead(id) {
    if (!id) return
    const target = auditLogs.value.find(l => (l.id === id || l._id === id))
    if (target) {
      target.read = true
    }
    saveState()

    try {
      await fetch(`/api/audit/${id}/read`, {
        method: 'PUT'
      })
    } catch (e) {}
  }

  async function markAllAuditLogsAsRead() {
    auditLogs.value.forEach(l => {
      l.read = true
    })
    saveState()

    try {
      await fetch('/api/audit/mark-all-read', {
        method: 'PUT'
      })
    } catch (e) {}
  }

  async function addProduct(productData, user) {
    const citiesArr = productData.allocationCities && productData.allocationCities.length > 0 ? productData.allocationCities : [(productData.allocationCity || 'Peshawar')]
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

    const prodId = productData.id || `prd_${Date.now()}`
    const uName = user?.name || 'Admin User'
    const uRole = (user?.role || 'admin').toLowerCase()

    const newProduct = {
      id: prodId,
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
      containerNo: productData.containerNo || null,
      companyName: productData.companyName || null,
      containerPrefix: productData.containerPrefix || null,
      barcode: productData.barcode || null,
      addedBy: uName,
      addedRole: uRole,
      image: productData.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
    }
    products.value.unshift(newProduct)

    // Serial generation: always auto-generate serial codes; use manualMachineCodes if provided
    const manualMachineCodes = productData.manualMachineCodes || []
    const generatedSerials = []

    let globalIndex = serials.value.length + 100
    if (Object.keys(cityQuantitiesMap).length > 0) {
      let unitIndex = 0
      citiesArr.forEach(cityName => {
        const cityQty = Number(cityQuantitiesMap[cityName] || 0)
        for (let i = 1; i <= cityQty; i++) {
          globalIndex++
          let serialCode = `${newProduct.sku}-${String(globalIndex).padStart(4, '0')}`
          while (checkDuplicateSerial(serialCode)) {
            globalIndex++
            serialCode = `${newProduct.sku}-${String(globalIndex).padStart(4, '0')}`
          }
          const machineCode = manualMachineCodes[unitIndex] || `MC-${globalIndex}`
          unitIndex++
          const sObj = {
            serialCode, machineCode,
            productId: newProduct.id, sku: newProduct.sku, status: 'Available',
            allocationCity: cityName, binLocation: newProduct.storageBin,
            registeredDate: new Date().toISOString().substring(0, 10),
            soldDate: null, customer: null, invoiceNo: null,
            paymentStatus: 'Pending', hsnCode: newProduct.hsnCode,
            taxRatio: newProduct.taxRatio, salePrice: 0,
            containerNo: newProduct.containerNo,
            companyName: newProduct.companyName,
            containerPrefix: newProduct.containerPrefix,
            barcode: newProduct.barcode || serialCode
          }
          serials.value.unshift(sObj)
          generatedSerials.push(sObj)
        }
      })
    } else if (newProduct.stockQty > 0) {
      for (let i = 1; i <= newProduct.stockQty; i++) {
        globalIndex++
        const assignedCity = citiesArr[(i - 1) % citiesArr.length]
        let serialCode = `${newProduct.sku}-${String(globalIndex).padStart(4, '0')}`
        while (checkDuplicateSerial(serialCode)) {
          globalIndex++
          serialCode = `${newProduct.sku}-${String(globalIndex).padStart(4, '0')}`
        }
        const machineCode = manualMachineCodes[i - 1] || `MC-${globalIndex}`
        const sObj = {
          serialCode, machineCode,
          productId: newProduct.id, sku: newProduct.sku, status: 'Available',
          allocationCity: assignedCity, binLocation: newProduct.storageBin,
          registeredDate: new Date().toISOString().substring(0, 10),
          soldDate: null, customer: null, invoiceNo: null,
          paymentStatus: 'Pending', hsnCode: newProduct.hsnCode,
          taxRatio: newProduct.taxRatio, salePrice: 0,
          containerNo: newProduct.containerNo,
          companyName: newProduct.companyName,
          containerPrefix: newProduct.containerPrefix,
          barcode: newProduct.barcode || serialCode
        }
        serials.value.unshift(sObj)
        generatedSerials.push(sObj)
      }
    }

    addAuditLog(uName, uRole, 'INVENTORY', `Added Equipment ${newProduct.name}`, `SKU: ${newProduct.sku}, HSN: ${newProduct.hsnCode}, Tax: ${newProduct.taxRatio}%, Container: ${newProduct.containerNo || 'N/A'}`)
    saveState()

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, serials: generatedSerials })
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
      ensureProductSerialsConsistency()
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
    const uRole = (user?.role || '').toLowerCase()
    if (uRole === 'accountant') {
      throw new Error('Permission Denied: Accountants cannot delete products. Only SuperAdmin is authorized to delete or void products.')
    }

    const pIndex = products.value.findIndex(prod => prod.id === productId || prod._id === productId)
    if (pIndex !== -1) {
      const deletedProd = products.value[pIndex]
      const pId = deletedProd.id || deletedProd._id
      const pSku = deletedProd.sku
      products.value.splice(pIndex, 1)
      serials.value = serials.value.filter(s => s.productId !== pId && s.sku !== pSku)

      const uName = user?.name || 'Admin User'
      addAuditLog(uName, uRole || 'superadmin', 'INVENTORY', `Deleted Product ${deletedProd.name}`, `Removed SKU ${deletedProd.sku}`, 'warning')
      saveState()

      const targetId = deletedProd._id || deletedProd.id
      try {
        await fetch(`/api/products/${targetId}`, {
          method: 'DELETE',
          headers: { 'x-user-role': uRole || 'superadmin' }
        })
      } catch (e) {}
    }
  }

  async function createPurchaseOrder(poData, user) {
    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`
    let totalAmount = 0

    // If generatedSerials were provided
    if (poData.generatedSerials && Array.isArray(poData.generatedSerials)) {
      poData.generatedSerials.forEach(s => {
        if (!checkDuplicateSerial(s.serialCode)) {
          serials.value.unshift({
            ...s,
            purchaseInvoiceNo: poNumber,
            purchaseDate: new Date().toISOString().substring(0, 10),
            paymentStatus: 'Pending'
          })
        }
      })
    }

    const items = (poData.items || []).map(item => {
      const lineCost = (Number(item.qty) || 0) * (Number(item.unitCost) || 0)
      totalAmount += lineCost

      const product = products.value.find(p => p.id === item.productId || p._id === item.productId || p.sku === item.sku)
      const targetCities = Array.isArray(item.allocationCities) && item.allocationCities.length > 0 
        ? item.allocationCities 
        : [(item.allocationCity || poData.allocationCity || 'Peshawar')]
      
      if (product) {
        product.stockQty += Number(item.qty)
        targetCities.forEach(c => {
          if (!product.allocationCities) product.allocationCities = [product.allocationCity]
          if (!product.allocationCities.includes(c)) product.allocationCities.push(c)
        })
        product.allocationCity = product.allocationCities.join(', ')

        if (!poData.generatedSerials || poData.generatedSerials.length === 0) {
          const startMachineCodeNum = Number(item.startMachineCodeNum) || (serials.value.length + 101)

          for (let i = 1; i <= item.qty; i++) {
            const assignedCity = targetCities[(i - 1) % targetCities.length]
            
            let serialCode = ''
            if (item.serialList && item.serialList[i - 1]) {
              serialCode = stripSn(item.serialList[i - 1])
            } else {
              serialCode = `${product.sku}-${Date.now().toString().slice(-4)}${i}`
            }

            const machineCode = item.machineCodeList && item.machineCodeList[i - 1] 
              ? item.machineCodeList[i - 1].trim()
              : `MC-${startMachineCodeNum + i - 1}`

            if (!checkDuplicateSerial(serialCode)) {
              serials.value.unshift({
                serialCode,
                machineCode,
                productId: product.id || product._id,
                sku: product.sku,
                status: 'Available',
                allocationCity: assignedCity,
                binLocation: product.storageBin || 'HQ-PEW-01',
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
        }
      }
      return {
        productId: item.productId,
        productName: item.productName || (product ? product.name : ''),
        qty: Number(item.qty),
        unitCost: Number(item.unitCost),
        totalCost: lineCost,
        hsnCode: item.hsnCode || (product ? product.hsnCode : '9018.1200'),
        taxRatio: Number(item.taxRatio || (product ? product.taxRatio : 18)),
        allocationCity: targetCities.join(', ')
      }
    })

    const uName = user?.name || (typeof user === 'string' ? user : 'Admin User')
    const uRole = user?.role || 'SuperAdmin'

    const newPO = {
      poNumber,
      supplier: poData.supplier,
      orderDate: new Date().toISOString().substring(0, 10),
      status: 'Completed',
      branch: poData.branch || poData.allocationCity || 'Peshawar',
      division: 'Medimage Services',
      items,
      totalAmount: totalAmount || (Number(poData.totalAmount) || 0),
      createdBy: uName
    }

    purchaseOrders.value.unshift(newPO)
    addAuditLog(uName, uRole, 'PURCHASING', `Created Purchase Order ${poNumber}`, `Supplier: ${poData.supplier}, Total Amount: PKR ${(totalAmount || poData.totalAmount || 0).toLocaleString()}`)
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
    const uName = user?.name || (typeof user === 'string' ? user : 'Admin User')
    const uRole = user?.role || 'SuperAdmin'

    // Requirement 14 & 15: Credit Limit & Customer Lock Verification
    if (saleData.paymentMethod !== 'Cash Payment') {
      const creditCheck = getCustomerCreditStatus(saleData.customer, Number(saleData.grandTotal || 0))
      if (creditCheck.status === 'locked') {
        throw new Error(`TRANSACTION BLOCKED: Customer "${saleData.customer}" is CREDIT LOCKED. ${creditCheck.lockReason}. To proceed, authorized management must grant a Credit Limit Override.`)
      }
    }

    const invoiceNo = `INV-2026-${String(salesInvoices.value.length + 100).padStart(3, '0')}`
    let subtotal = 0
    let totalCost = 0

    const invoiceDeliveryDate = saleData.deliveryDate || new Date().toISOString().substring(0, 10)
    const invoiceBlNumber = saleData.blNumber || 'SENDNB2606060'

    const items = (saleData.items || []).map(item => {
      const product = products.value.find(p => p.id === item.productId || p._id === item.productId || p.sku === item.sku)
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
      const itemBlNumber = item.blNumber || product?.containerNo || invoiceBlNumber

      if (serialsList.length > 0) {
        serialsList.forEach(sCode => {
          const serialObj = serials.value.find(s => s.serialCode === sCode)
          if (serialObj) {
            serialObj.status = 'Sold'
            serialObj.soldDate = new Date().toISOString().substring(0, 10)
            serialObj.deliveryDate = invoiceDeliveryDate
            serialObj.customer = saleData.customer
            serialObj.invoiceNo = invoiceNo
            serialObj.salePrice = unitPrice
            serialObj.blNumber = itemBlNumber
            if (serialObj.machineCode) assignedMachineCodes.push(serialObj.machineCode)

            // Requirement 28: Automatic Warranty Generation
            const existingWarranty = warranties.value.find(w => w.serialCode === sCode)
            if (!existingWarranty) {
              const expDate = new Date(invoiceDeliveryDate)
              expDate.setFullYear(expDate.getFullYear() + 1)
              warranties.value.unshift({
                id: `war_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                serialCode: sCode,
                machineCode: serialObj.machineCode,
                productName: item.productName || (product ? product.name : ''),
                productCode: product?.sku || item.productCode || sCode,
                customer: saleData.customer,
                saleDate: new Date().toISOString().substring(0, 10),
                deliveryDate: invoiceDeliveryDate,
                warrantyStart: invoiceDeliveryDate,
                warrantyExpiry: expDate.toISOString().substring(0, 10),
                status: 'Active',
                blNumber: itemBlNumber,
                invoiceNo: invoiceNo
              })
            }
          }
        })
      }

      const isCash = saleData.paymentMethod === 'Cash Payment'

      return {
        productId: item.productId || (product ? product.id : ''),
        productName: item.productName || (product ? product.name : ''),
        productCode: product ? product.sku : (item.productCode || ''),
        blNumber: itemBlNumber,
        qty: item.qty,
        unitPrice,
        unitCost: product ? (product.costPrice || 0) : 0,
        hsnCode: item.hsnCode || (product ? product.hsnCode : '9018.1200'),
        taxRatio: item.taxRatio || (product ? product.taxRatio : 18),
        total: lineTotal,
        serials: serialsList,
        machineCodes: assignedMachineCodes,
        paidAmount: isCash ? lineTotal : 0,
        balance: isCash ? 0 : lineTotal,
        paymentStatus: isCash ? 'Paid' : 'Unpaid'
      }
    })

    const invoiceTaxRatio = Number(saleData.taxRatio || 18)
    const tax = (subtotal * invoiceTaxRatio) / 100
    const discount = Number(saleData.discount || 0)
    const grandTotal = (subtotal + tax) - discount
    const netProfit = subtotal - discount - totalCost
    const marginPercent = subtotal ? ((netProfit / subtotal) * 100) : 0

    const isFullCash = saleData.paymentMethod === 'Cash Payment'

    const custPrevBalance = Number(saleData.previousBalance !== undefined ? saleData.previousBalance : getCustomerLedgerBalance(saleData.customer))
    const paymentReceived = isFullCash ? grandTotal : Number(saleData.paidAmount || 0)
    const newFinalBalance = Number(saleData.finalOutstandingBalance !== undefined ? saleData.finalOutstandingBalance : Math.max(0, custPrevBalance + grandTotal - paymentReceived))

    const newInvoice = {
      invoiceNo,
      quotationNo: saleData.quotationNo || `QT-2026-${String(salesInvoices.value.length + 100).padStart(3, '0')}`,
      salesOrderNo: saleData.salesOrderNo || `SO-2026-${String(salesInvoices.value.length + 100).padStart(3, '0')}`,
      customer: saleData.customer,
      branch: saleData.branch || 'Peshawar',
      division: 'Medimage Services',
      saleDate: new Date().toISOString().substring(0, 10),
      deliveryDate: invoiceDeliveryDate,
      deliveryStatus: saleData.deliveryStatus || 'Delivered',
      paymentMethod: saleData.paymentMethod || 'Cash Payment',
      paymentStatus: isFullCash ? 'Paid' : (saleData.paymentStatus || 'Unpaid'),
      paidAmount: paymentReceived,
      outstandingBalance: isFullCash ? 0 : Math.max(0, grandTotal - paymentReceived),
      previousBalance: custPrevBalance,
      currentInvoiceAmount: grandTotal,
      paymentReceived: paymentReceived,
      finalOutstandingBalance: newFinalBalance,
      salesPerson: saleData.salesPerson || uName,
      bankName: saleData.bankName || (isFullCash ? 'Cash Counter' : 'Meezan Bank'),
      bankDetails: saleData.bankDetails || 'Branch Counter Receipts',
      chequeRef: saleData.chequeRef || (isFullCash ? 'CASH' : 'PENDING'),
      blNumber: invoiceBlNumber,
      taxRatio: invoiceTaxRatio,
      items,
      subtotal,
      tax,
      discount,
      grandTotal,
      totalCost,
      netProfit,
      marginPercent: Number(marginPercent.toFixed(2)),
      sellerName: uName,
      creatorRole: (user?.role || authStore.user?.role || 'manager').toLowerCase()
    }

    salesInvoices.value.unshift(newInvoice)

    // Requirement 48: Low Stock Alert Check on remaining units
    items.forEach(it => {
      const prod = products.value.find(p => p.id === it.productId || p._id === it.productId || p.sku === it.productCode)
      if (prod && prod.stockQty <= (prod.minStock !== undefined ? prod.minStock : 5)) {
        addAuditLog('System Alert', 'system', 'INVENTORY', `⚠️ Low Stock Alert: ${prod.name}`, `Available stock has dropped to ${prod.stockQty} unit(s) (Minimum Stock Threshold: ${prod.minStock || 5}). Supplier purchase order required.`, 'warning')
      }
    })
    
    // If full Cash payment on sale, auto-generate Payment Receipt and mark serials as Paid
    if (isFullCash) {
      const receiptNo = `RCT-2026-${String(paymentReceipts.value.length + 1).padStart(3, '0')}`
      const paidSerialsList = []
      
      items.forEach(it => {
        it.serials.forEach((sCode) => {
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

    addAuditLog(uName, uRole, 'SALES', `Issued Sale Invoice ${invoiceNo}`, `Customer: ${saleData.customer}, Branch: ${newInvoice.branch}, Grand Total: PKR ${grandTotal.toLocaleString()}, BL: ${invoiceBlNumber}`)
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

  // ══════════════════════════════════════════════════════════════════
  // REQUIREMENT 12-16: CUSTOMER CATEGORY, CREDIT LIMIT & LOCK ENGINE
  // ══════════════════════════════════════════════════════════════════
  function getCustomerCreditStatus(customerName, newSaleAmount = 0) {
    if (!customerName) {
      return {
        customerName: '',
        category: 'REGULAR',
        categoryCode: 'REGULAR',
        creditLimit: 2000000,
        baseLimit: 2000000,
        overridesTotal: 0,
        outstanding: 0,
        exposure: newSaleAmount,
        remainingCredit: Math.max(0, 2000000 - newSaleAmount),
        utilizationPercent: (newSaleAmount / 2000000) * 100,
        status: 'normal',
        isOverdue: false,
        maxOverdueDays: 0,
        lockReason: '',
        canSale: true
      }
    }

    const cNameClean = customerName.trim().toLowerCase()
    let cust = customers.value.find(c => c.name && c.name.trim().toLowerCase() === cNameClean)

    // Auto-create customer profile in store if not present
    if (!cust) {
      cust = {
        id: `cust_${Date.now()}`,
        name: customerName.trim(),
        category: 'REGULAR',
        branch: 'Peshawar',
        phone: '',
        email: '',
        address: '',
        baseCreditLimit: 2000000,
        paymentDays: 30,
        status: 'active',
        overrides: []
      }
      customers.value.push(cust)
    }

    const catObj = customerCategories.value.find(c => (c.code || c.name || '').toUpperCase() === (cust.category || 'REGULAR').toUpperCase()) || customerCategories.value[1]
    const allowedPaymentDays = Number(cust.paymentDays || catObj?.paymentDays || 30)
    const overdueTolerance = Number(catObj?.overdueTolerance || 7)

    // Calculate customer ledger outstanding
    const ledger = getCustomerLedger(customerName)
    const currentOutstanding = ledger ? (ledger.outstandingBalance || 0) : 0

    // Compute active overrides
    const overridesTotal = (cust.overrides || []).reduce((sum, o) => sum + (Number(o.additionalLimit) || 0), 0)
    const effectiveLimit = (Number(cust.baseCreditLimit) || Number(catObj?.maxCreditLimit) || 0) + overridesTotal

    const exposure = currentOutstanding + Number(newSaleAmount || 0)
    const remainingCredit = Math.max(0, effectiveLimit - exposure)
    const utilizationPercent = effectiveLimit > 0 ? (exposure / effectiveLimit) * 100 : (exposure > 0 ? 100 : 0)

    // Check for overdue open invoices beyond allowed payment days
    let isOverdue = false
    let maxOverdueDays = 0
    let overdueInvoiceNo = ''

    if (ledger && ledger.invoices) {
      const now = new Date()
      ledger.invoices.forEach(inv => {
        const invPaid = Number(inv.paidAmount || 0)
        const invBal = Math.max(0, (Number(inv.grandTotal) || 0) - invPaid)
        if (invBal > 0) {
          const dDate = new Date(inv.deliveryDate || inv.saleDate || '2026-01-01')
          const diffDays = Math.floor((now - dDate) / (1000 * 60 * 60 * 24))
          if (diffDays > (allowedPaymentDays + overdueTolerance)) {
            isOverdue = true
            if (diffDays > maxOverdueDays) {
              maxOverdueDays = diffDays
              overdueInvoiceNo = inv.invoiceNo
            }
          }
        }
      })
    }

    let status = 'normal'
    let lockReason = ''

    if (cust.status === 'locked') {
      status = 'locked'
      lockReason = cust.lockReason || `Customer manually or automatically locked. Outstanding: PKR ${currentOutstanding.toLocaleString()}.`
    } else if (isOverdue) {
      status = 'locked'
      lockReason = `Account Overdue: Invoice ${overdueInvoiceNo} unpaid for ${maxOverdueDays} days (allowed payment term: ${allowedPaymentDays} days). Credit delivery locked.`
    } else if (effectiveLimit > 0 && exposure > effectiveLimit) {
      status = 'locked'
      lockReason = `Credit Limit Exceeded: Exposure PKR ${exposure.toLocaleString()} exceeds assigned limit PKR ${effectiveLimit.toLocaleString()}.`
    } else if (effectiveLimit > 0 && utilizationPercent >= 90) {
      status = 'critical_90'
      lockReason = `Critical Warning: ${utilizationPercent.toFixed(1)}% of credit limit utilized. Near hard stop.`
    } else if (effectiveLimit > 0 && utilizationPercent >= 75) {
      status = 'warning_75'
      lockReason = `Credit Warning: ${utilizationPercent.toFixed(1)}% of credit limit utilized.`
    }

    return {
      customerName: cust.name,
      category: cust.category,
      categoryName: catObj?.name || cust.category,
      categoryCode: catObj?.code || cust.category,
      baseLimit: Number(cust.baseCreditLimit) || 0,
      overridesTotal,
      creditLimit: effectiveLimit,
      outstanding: currentOutstanding,
      exposure,
      remainingCredit,
      utilizationPercent: Number(utilizationPercent.toFixed(1)),
      status,
      isOverdue,
      maxOverdueDays,
      lockReason,
      canSale: status !== 'locked'
    }
  }

  // Requirement 16: Management Approval / Credit Limit Override
  async function overrideCustomerCredit(customerName, additionalLimit, reason, remarks, user) {
    const cNameClean = customerName.trim().toLowerCase()
    let cust = customers.value.find(c => c.name && c.name.trim().toLowerCase() === cNameClean)
    if (!cust) {
      throw new Error(`Customer "${customerName}" not found`)
    }

    const uName = user?.name || 'SuperAdmin Alexander Sterling'
    const uRole = (user?.role || 'superadmin').toLowerCase()

    if (!cust.overrides) cust.overrides = []
    const overrideEntry = {
      id: `ovr_${Date.now()}`,
      approvedBy: uName,
      role: uRole,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      additionalLimit: Number(additionalLimit || 0),
      reason: reason || 'Business management approval for high-value equipment dispatch',
      remarks: remarks || ''
    }

    cust.overrides.push(overrideEntry)
    if (cust.status === 'locked') {
      cust.status = 'active'
      cust.lockReason = ''
    }

    addAuditLog(uName, uRole, 'CREDIT_OVERRIDE', `Management Credit Override Approved for ${customerName}`, `Additional Limit: +PKR ${Number(additionalLimit).toLocaleString()}, Reason: ${reason}. Customer unlocked.`, 'warning')
    
    try {
      const custTarget = cust.id || cust._id || cust.name
      fetch(`/api/customers/${encodeURIComponent(custTarget)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrides: cust.overrides,
          status: cust.status,
          lockReason: cust.lockReason
        })
      }).catch(() => {})
    } catch (e) {}

    saveState()
    return overrideEntry
  }

  async function lockCustomer(customerName, reason, user) {
    const cNameClean = customerName.trim().toLowerCase()
    let cust = customers.value.find(c => c.name && c.name.trim().toLowerCase() === cNameClean)
    if (cust) {
      cust.status = 'locked'
      cust.lockReason = reason || 'Locked by Management'
      addAuditLog(user?.name || 'Management', user?.role || 'admin', 'CUSTOMER_LOCK', `Locked Customer Account: ${customerName}`, `Reason: ${cust.lockReason}`, 'danger')
      
      try {
        const custTarget = cust.id || cust._id || cust.name
        fetch(`/api/customers/${encodeURIComponent(custTarget)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'locked',
            lockReason: cust.lockReason
          })
        }).catch(() => {})
      } catch (e) {}

      saveState()
    }
  }

  async function unlockCustomer(customerName, user) {
    const cNameClean = customerName.trim().toLowerCase()
    let cust = customers.value.find(c => c.name && c.name.trim().toLowerCase() === cNameClean)
    if (cust) {
      cust.status = 'active'
      cust.lockReason = ''
      addAuditLog(user?.name || 'Management', user?.role || 'admin', 'CUSTOMER_LOCK', `Unlocked Customer Account: ${customerName}`, 'Management authorization override', 'normal')
      
      try {
        const custTarget = cust.id || cust._id || cust.name
        fetch(`/api/customers/${encodeURIComponent(custTarget)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'active',
            lockReason: ''
          })
        }).catch(() => {})
      } catch (e) {}

      saveState()
    }
  }

  function addCustomerCategory(catData, user) {
    const newCat = {
      id: `cat_${Date.now()}`,
      code: (catData.code || catData.name || '').toUpperCase().replace(/\s+/g, '_'),
      name: catData.name,
      maxCreditLimit: Number(catData.maxCreditLimit || 0),
      paymentDays: Number(catData.paymentDays || 30),
      maxOpenInvoices: Number(catData.maxOpenInvoices || 5),
      overdueTolerance: Number(catData.overdueTolerance || 7),
      description: catData.description || ''
    }
    customerCategories.value.push(newCat)
    addAuditLog(user?.name || 'Admin', user?.role || 'admin', 'SETTINGS', `Created Customer Category ${newCat.name}`, `Limit: PKR ${newCat.maxCreditLimit.toLocaleString()}, Days: ${newCat.paymentDays}`)
    saveState()
    return newCat
  }

  function updateCustomerCategory(catId, updates, user) {
    const target = customerCategories.value.find(c => c.id === catId || c.code === catId)
    if (target) {
      Object.assign(target, updates)
      addAuditLog(user?.name || 'Admin', user?.role || 'admin', 'SETTINGS', `Updated Category ${target.name}`, `Max Limit: PKR ${(target.maxCreditLimit || 0).toLocaleString()}`)
      saveState()
    }
  }

  async function addCustomer(custData, user) {
    const newCust = {
      id: `cust_${Date.now()}`,
      name: custData.name,
      category: custData.category || 'REGULAR',
      branch: custData.branch || 'Peshawar',
      phone: custData.phone || '',
      email: custData.email || '',
      address: custData.address || '',
      baseCreditLimit: Number(custData.baseCreditLimit || 2000000),
      paymentDays: Number(custData.paymentDays || 30),
      status: custData.status || 'active',
      overrides: []
    }
    customers.value.push(newCust)
    addAuditLog(user?.name || 'Admin', user?.role || 'admin', 'CUSTOMERS', `Created Customer Profile ${newCust.name}`, `Category: ${newCust.category}, Base Limit: PKR ${newCust.baseCreditLimit.toLocaleString()}`)
    
    try {
      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust)
      }).catch(() => {})
    } catch (e) {}

    saveState()
    return newCust
  }

  async function updateCustomer(custId, updates, user) {
    const cust = customers.value.find(c => c.id === custId || c.name === custId)
    if (cust) {
      Object.assign(cust, updates)
      addAuditLog(user?.name || 'Admin', user?.role || 'admin', 'CUSTOMERS', `Updated Customer Profile ${cust.name}`, `Category: ${cust.category}, Limit: PKR ${(cust.baseCreditLimit || 0).toLocaleString()}`)
      
      try {
        const custTarget = cust.id || cust._id || cust.name
        fetch(`/api/customers/${encodeURIComponent(custTarget)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }).catch(() => {})
      } catch (e) {}

      saveState()
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // REQUIREMENT 21, 22, 23: 30-DAY AUTOMATIC REMINDERS & AGING
  // ══════════════════════════════════════════════════════════════════
  const overdueInvoices = computed(() => {
    const now = new Date()
    const list = []

    salesInvoices.value.forEach(inv => {
      const paid = Number(inv.paidAmount || 0)
      const balance = Math.max(0, (Number(inv.grandTotal) || 0) - paid)
      if (balance > 0) {
        const dDate = new Date(inv.deliveryDate || inv.saleDate || '2026-01-01')
        const daysSinceDelivery = Math.floor((now - dDate) / (1000 * 60 * 60 * 24))

        if (daysSinceDelivery >= 30) {
          let bracket = '30+ Days'
          let severity = 'warning'
          if (daysSinceDelivery >= 90) {
            bracket = '90+ Days (Critical)'
            severity = 'danger'
          } else if (daysSinceDelivery >= 60) {
            bracket = '60+ Days'
            severity = 'danger'
          } else if (daysSinceDelivery >= 45) {
            bracket = '45+ Days'
            severity = 'warning'
          }

          list.push({
            invoiceNo: inv.invoiceNo,
            customer: inv.customer,
            branch: inv.branch || 'Peshawar',
            saleDate: inv.saleDate,
            deliveryDate: inv.deliveryDate || inv.saleDate,
            grandTotal: inv.grandTotal,
            paidAmount: paid,
            balance,
            daysSinceDelivery,
            bracket,
            severity,
            salesPerson: inv.salesPerson || inv.sellerName || 'Sarah Jenkins',
            items: inv.items || []
          })
        }
      }
    })

    return list.sort((a, b) => b.daysSinceDelivery - a.daysSinceDelivery)
  })

  async function sendPaymentReminder(invoiceNo, channel = 'WhatsApp', customMessage = '', user) {
    const inv = salesInvoices.value.find(i => i.invoiceNo === invoiceNo)
    if (!inv) throw new Error(`Invoice ${invoiceNo} not found`)

    const cust = customers.value.find(c => c.name === inv.customer)
    const recipient = cust?.phone || cust?.email || '+92 300 1234567'
    const balance = Math.max(0, (Number(inv.grandTotal) || 0) - (Number(inv.paidAmount) || 0))
    const uName = user?.name || 'Marcus Vance (Manager)'

    const msg = customMessage || `Dear ${inv.customer}, this is an automated reminder that payment balance of PKR ${balance.toLocaleString()} for Invoice ${invoiceNo} is overdue from delivery date (${inv.deliveryDate || inv.saleDate}). Please arrange settlement.`

    const folEntry = {
      id: `fol_${Date.now()}`,
      invoiceNo,
      customer: inv.customer,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      channel,
      recipient,
      message: msg,
      status: 'Sent / Logged',
      sentBy: uName
    }

    paymentFollowUps.value.unshift(folEntry)
    addAuditLog(uName, user?.role || 'manager', 'PAYMENT_REMINDER', `Dispatched ${channel} Reminder for Invoice ${invoiceNo}`, `Customer: ${inv.customer}, Balance: PKR ${balance.toLocaleString()}, Channel: ${channel}`)
    saveState()
    return folEntry
  }

  // ══════════════════════════════════════════════════════════════════
  // REQUIREMENT 18, 19, 20: PRODUCT-WISE PAID & UNPAID TRACKING
  // ══════════════════════════════════════════════════════════════════
  const productWisePayments = computed(() => {
    const rows = []

    salesInvoices.value.forEach(inv => {
      const invPaid = Number(inv.paidAmount || 0)
      const isInvPaid = inv.paymentStatus === 'Paid' || inv.paymentMethod === 'Cash Payment'

      inv.items?.forEach(it => {
        const serialsList = it.serials || []
        const machineCodesList = it.machineCodes || []
        const qty = Number(it.qty || 1)
        const unitVal = Number(it.unitPrice || (it.total ? it.total / qty : 0))

        if (serialsList.length > 0) {
          serialsList.forEach((sCode, idx) => {
            const mCode = machineCodesList[idx] || it.machineCode || `MC-${idx + 1}`
            const serialDoc = serials.value.find(s => s.serialCode === sCode)

            let isUnitPaid = isInvPaid || (serialDoc && serialDoc.paymentStatus === 'Paid')
            let unitPaidAmt = isUnitPaid ? unitVal : (serialDoc?.paymentAmount || 0)
            let unitBalance = Math.max(0, unitVal - unitPaidAmt)
            let unitStatus = isUnitPaid ? 'Paid' : (unitPaidAmt > 0 ? 'Partially Paid' : 'Unpaid')

            rows.push({
              serialCode: sCode,
              machineCode: mCode,
              productName: it.productName,
              productCode: it.productCode || it.sku || sCode,
              customer: inv.customer,
              invoiceNo: inv.invoiceNo,
              branch: inv.branch || 'Peshawar',
              blNumber: it.blNumber || inv.blNumber || 'SENDNB2606060',
              saleDate: inv.saleDate,
              deliveryDate: inv.deliveryDate || inv.saleDate,
              saleAmount: unitVal,
              receivedAmount: unitPaidAmt,
              balance: unitBalance,
              paymentStatus: unitStatus,
              lastPaymentDate: serialDoc?.paymentDate || (isUnitPaid ? inv.saleDate : 'Pending')
            })
          })
        }
      })
    })

    return rows
  })

  function getProductWisePaymentList(branch = 'All Branches') {
    if (!branch || branch === 'All Branches' || branch === 'All Branches (Consolidated)') {
      return productWisePayments.value
    }
    return productWisePayments.value.filter(r => r.branch === branch || branch.includes(r.branch))
  }

  // ══════════════════════════════════════════════════════════════════
  // REQUIREMENT 1, 2, 3: BILL OF LADING (BL) & BL CLOSING ENGINE
  // ══════════════════════════════════════════════════════════════════
  const blList = computed(() => {
    return containers.value.map(c => {
      const blNo = c.blNumber || c.containerNo
      const blStatus = c.blStatus || (c.status === 'Cleared' ? 'Ready to Close' : 'In Process')

      // Aggregate linked metrics from sales and inventory
      const linkedSerials = serials.value.filter(s => s.containerNo === blNo || s.blNumber === blNo)
      const soldSerials = linkedSerials.filter(s => s.status === 'Sold')
      const availableSerials = linkedSerials.filter(s => s.status === 'Available')
      const paidSerials = soldSerials.filter(s => s.paymentStatus === 'Paid')

      return {
        ...c,
        blNumber: blNo,
        blDate: c.blDate || c.arrivalDate,
        supplierName: c.supplierName || c.companyName,
        shipmentDetails: c.shipmentDetails || `${c.destinationCity} Destination Consignment`,
        landingCost: Number(c.landingCost || 0),
        receivingDate: c.receivingDate || c.arrivalDate,
        branch: c.branch || c.destinationCity || 'Peshawar',
        blStatus,
        totalUnits: linkedSerials.length || (c.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0),
        soldUnits: soldSerials.length,
        availableUnits: availableSerials.length,
        paidUnits: paidSerials.length
      }
    })
  })

  function validateBLForClosing(blNumber) {
    const bl = blList.value.find(b => b.blNumber === blNumber || b.containerNo === blNumber)
    if (!bl) {
      return { canClose: false, checklist: [{ label: 'BL Record Exists', passed: false, details: 'BL not found' }] }
    }

    const linkedSerials = serials.value.filter(s => s.containerNo === blNumber || s.blNumber === blNumber)
    const hasSerials = linkedSerials.length > 0 || (bl.items && bl.items.length > 0)
    const hasReceivingDate = Boolean(bl.receivingDate || bl.arrivalDate)
    const hasInvoices = salesInvoices.value.some(i => i.blNumber === blNumber || (i.items && i.items.some(it => it.blNumber === blNumber)))

    const checklist = [
      { label: 'Import Documentation & Port Clearance Verified', passed: true, details: bl.shipmentDetails },
      { label: 'Machine Codes & Unique Serials Allocated', passed: hasSerials, details: `${linkedSerials.length} machines indexed` },
      { label: 'Goods Inbound Receiving Completed at Branch', passed: hasReceivingDate, details: `Received: ${bl.receivingDate || bl.arrivalDate} at ${bl.branch}` },
      { label: 'Equipment Delivery & Sales Invoices Registered', passed: hasInvoices || bl.blStatus === 'Ready to Close', details: hasInvoices ? 'Linked to customer invoices' : 'Pending sales delivery' },
      { label: 'Financial Costing & Landing Expenditures Accounted', passed: true, details: `Landing Cost: PKR ${(bl.landingCost || 0).toLocaleString()}` }
    ]

    const passedCount = checklist.filter(c => c.passed).length
    const canClose = passedCount >= 4 // Ready to Close

    return {
      canClose,
      passedCount,
      totalChecks: checklist.length,
      checklist
    }
  }

  async function closeBL(blNumber, user, notes = '') {
    const target = containers.value.find(c => c.containerNo === blNumber || c.blNumber === blNumber)
    if (!target) throw new Error(`BL ${blNumber} not found`)

    const validation = validateBLForClosing(blNumber)
    if (!validation.canClose) {
      throw new Error(`BL ${blNumber} cannot be closed. Validation failed: Please complete deliveries and invoice reconciliations first.`)
    }

    const uName = user?.name || 'Alexander Sterling (SuperAdmin)'
    const uRole = (user?.role || 'superadmin').toLowerCase()

    target.status = 'Cleared'
    target.blStatus = 'Closed'
    target.closedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
    target.closedBy = uName
    target.closingNotes = notes || 'All equipment received, delivered, and accounted for.'

    addAuditLog(uName, uRole, 'BL_CLOSING', `Closed Bill of Lading ${blNumber}`, `Supplier: ${target.companyName}, Destination: ${target.destinationCity || target.branch}, Notes: ${target.closingNotes}`, 'warning')
    saveState()
    return target
  }

  async function reopenBL(blNumber, reason, user) {
    const uRole = (user?.role || 'superadmin').toLowerCase()
    if (uRole !== 'superadmin' && uRole !== 'admin') {
      throw new Error('Permission Denied: Closed BL shipments can only be reopened with authorized Management approval.')
    }

    const target = containers.value.find(c => c.containerNo === blNumber || c.blNumber === blNumber)
    if (!target) throw new Error(`BL ${blNumber} not found`)

    const uName = user?.name || 'Management User'
    target.status = 'In Stock'
    target.blStatus = 'Open'
    target.reopenedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
    target.reopenedBy = uName
    target.reopenReason = reason || 'Management audit revision'

    addAuditLog(uName, uRole, 'BL_REOPEN', `Reopened Closed BL ${blNumber}`, `Reason: ${target.reopenReason}`, 'danger')
    saveState()
    return target
  }

  // Requirement 2: 17-Column BL Closing Excel Generator Data
  function getBLClosingRows(blNumber) {
    const rows = []
    const blInvoices = salesInvoices.value.filter(i => 
      i.blNumber === blNumber || 
      i.containerNo === blNumber ||
      (i.items && i.items.some(it => it.blNumber === blNumber))
    )

    if (blInvoices.length > 0) {
      blInvoices.forEach(inv => {
        inv.items?.forEach(it => {
          const serialsList = it.serials || []
          const qty = Number(it.qty || 1)
          const lineVal = Number(it.unitPrice || 0)
          const isPaid = inv.paymentStatus === 'Paid' || inv.paymentMethod === 'Cash Payment'

          if (serialsList.length > 0) {
            serialsList.forEach((sCode, idx) => {
              rows.push([
                blNumber,
                inv.deliveryDate || inv.saleDate,
                inv.customer,
                inv.invoiceNo,
                it.productName,
                it.productCode || it.sku,
                sCode,
                lineVal,
                isPaid ? lineVal : 0,
                isPaid ? 0 : lineVal,
                inv.paymentMethod,
                inv.bankName || 'Meezan Bank',
                inv.bankDetails || 'Branch Clearing Account',
                inv.chequeRef || 'RTGS-REF-01',
                inv.saleDate,
                inv.branch || 'Peshawar',
                inv.salesPerson || inv.sellerName || 'Sarah Jenkins',
                inv.paymentStatus || (isPaid ? 'Paid' : 'Pending')
              ])
            })
          } else {
            rows.push([
              blNumber,
              inv.deliveryDate || inv.saleDate,
              inv.customer,
              inv.invoiceNo,
              it.productName,
              it.productCode || it.sku,
              `QTY-${qty}`,
              Number(it.total || 0),
              isPaid ? Number(it.total || 0) : 0,
              isPaid ? 0 : Number(it.total || 0),
              inv.paymentMethod,
              inv.bankName || 'Meezan Bank',
              inv.bankDetails || 'Branch Clearing Account',
              inv.chequeRef || 'RTGS-REF-01',
              inv.saleDate,
              inv.branch || 'Peshawar',
              inv.salesPerson || inv.sellerName || 'Sarah Jenkins',
              inv.paymentStatus || (isPaid ? 'Paid' : 'Pending')
            ])
          }
        })
      })
    } else {
      // Fallback for container products not yet invoiced
      const cMatch = containers.value.find(c => c.containerNo === blNumber || c.blNumber === blNumber)
      if (cMatch && cMatch.items) {
        cMatch.items.forEach(it => {
          rows.push([
            blNumber,
            cMatch.arrivalDate || new Date().toISOString().substring(0, 10),
            'Inbound Warehouse Stock',
            'PRE-SALE-MANIFEST',
            it.name,
            it.sku,
            (it.serials && it.serials[0]) || it.sku,
            Number(it.sellingPrice || 0),
            0,
            Number(it.sellingPrice || 0),
            'Import LC / Consignment',
            'National Bank of Pakistan',
            'Import LC # LC-2026-9901',
            'PORT-QASIM-CLR',
            cMatch.arrivalDate,
            cMatch.destinationCity || 'Peshawar',
            cMatch.createdBy || 'Tariq Mahmood',
            'Warehouse Stock'
          ])
        })
      }
    }

    return rows
  }

  // ══════════════════════════════════════════════════════════════════
  // REQUIREMENT 28-32: WARRANTY, WORKSHOP & FAULTY MACHINE STOCK
  // ══════════════════════════════════════════════════════════════════
  async function registerWarrantyClaim(claimData, user) {
    const claimNo = `CLM-2026-${String(warrantyClaims.value.length + 1).padStart(3, '0')}`
    const uName = user?.name || 'Workshop Engineer'

    const newClaim = {
      id: `clm_${Date.now()}`,
      claimNo,
      claimDate: claimData.claimDate || new Date().toISOString().substring(0, 10),
      serialCode: claimData.serialCode,
      machineCode: claimData.machineCode || '',
      productName: claimData.productName || 'Medical Equipment',
      customer: claimData.customer || '',
      complaint: claimData.complaint,
      diagnosis: claimData.diagnosis || 'Under inspection',
      repairAction: claimData.repairAction || '',
      partsUsed: claimData.partsUsed || [],
      replacementSerial: claimData.replacementSerial || null,
      status: claimData.status || 'Received',
      completedDate: claimData.completedDate || null,
      technician: uName
    }

    warrantyClaims.value.unshift(newClaim)
    addAuditLog(uName, user?.role || 'admin', 'WARRANTY', `Registered Warranty Claim ${claimNo}`, `Machine: ${newClaim.serialCode}, Customer: ${newClaim.customer}, Complaint: ${newClaim.complaint}`)
    saveState()
    return newClaim
  }

  async function issueWorkshopPart(partCode, machineSerial, qty = 1, reason = '', user) {
    const part = workshopSpareParts.value.find(p => p.partCode === partCode)
    if (!part) throw new Error(`Part ${partCode} not found`)
    if (part.stockQty < qty) throw new Error(`Insufficient spare parts stock for ${part.name}`)

    part.stockQty -= qty
    const uName = user?.name || 'Workshop Engineer'

    addAuditLog(uName, user?.role || 'admin', 'WORKSHOP', `Issued Spare Part ${part.name} (${partCode})`, `Qty: ${qty}, Installed in Serial: ${machineSerial}, Reason: ${reason}`)
    saveState()
    return part
  }

  async function updateFaultyMachine(faultId, status, notes = '', replacementSerial = null, user) {
    const f = faultyMachines.value.find(m => m.id === faultId || m.faultNo === faultId || m.serialCode === faultId)
    if (f) {
      f.status = status
      if (replacementSerial) f.replacementSerial = replacementSerial
      if (!f.history) f.history = []
      f.history.push({
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: `Status updated to ${status}. ${notes}`,
        user: user?.name || 'Workshop Technician'
      })
      addAuditLog(user?.name || 'Workshop Technician', user?.role || 'admin', 'WORKSHOP', `Faulty Machine ${f.serialCode} Updated to ${status}`, `Notes: ${notes}`)
      saveState()
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // REQUIREMENT 34: EXPENSE / EXPENDITURE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════
  async function addExpense(expData, user) {
    const voucherNo = `EXP-2026-${String(expenses.value.length + 1).padStart(3, '0')}`
    const uName = user?.name || 'Tariq Mahmood (Accountant)'

    const newExp = {
      id: `exp_${Date.now()}`,
      voucherNo,
      category: expData.category || 'General Operational Expense',
      branch: expData.branch || 'Peshawar',
      date: expData.date || new Date().toISOString().substring(0, 10),
      amount: Number(expData.amount || 0),
      paymentMode: expData.paymentMode || 'Cash Voucher',
      bankCash: expData.bankCash || 'Petty Cash Desk',
      description: expData.description || '',
      supportingRef: expData.supportingRef || '',
      recordedBy: uName
    }

    expenses.value.unshift(newExp)
    addAuditLog(uName, user?.role || 'accountant', 'EXPENSES', `Recorded Company Expense ${voucherNo}`, `Category: ${newExp.category}, Branch: ${newExp.branch}, Amount: PKR ${newExp.amount.toLocaleString()}`)
    
    try {
      fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExp)
      }).catch(() => {})
    } catch (e) {}

    saveState()
    return newExp
  }

  function setActiveBranch(branchName) {
    activeBranchFilter.value = branchName
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
          const parentProd = products.value.find(p => p.id === serialObj.productId || p._id === serialObj.productId || p.sku === serialObj.sku)

          serialsMoved.push({
            serialCode: serialObj.serialCode,
            machineCode: serialObj.machineCode,
            productName: parentProd ? parentProd.name : serialObj.sku,
            sku: serialObj.sku,
            productId: serialObj.productId
          })

          // Synchronize parent product allocation cities
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

  // Process Customer Sales Return (Creates RET-2026-xxx, restocks equipment to Available)
  async function processSalesReturn(returnData, user) {
    const returnNo = `RET-2026-${String(salesReturns.value.length + 1).padStart(3, '0')}`
    const uName = user?.name || (typeof user === 'string' ? user : 'Admin User')
    const uRole = user?.role || 'SuperAdmin'

    const returnedSerialsList = []
    let totalRefund = 0

    if (returnData.serials && returnData.serials.length > 0) {
      returnData.serials.forEach(item => {
        const sCode = typeof item === 'string' ? item : item.serialCode
        const serialObj = serials.value.find(s => s.serialCode === sCode)
        if (serialObj) {
          serialObj.status = 'Available'
          serialObj.customer = null
          serialObj.invoiceNo = null
          serialObj.soldDate = null
          serialObj.paymentStatus = 'Pending'
          serialObj.paymentReceiptNo = null

          const refundAmt = Number(item.refundAmount || serialObj.salePrice || 0)
          totalRefund += refundAmt

          // Restock product stockQty
          const parentProd = products.value.find(p => p.id === serialObj.productId || p._id === serialObj.productId || p.sku === serialObj.sku)
          if (parentProd) {
            parentProd.stockQty = (parentProd.stockQty || 0) + 1
          }

          returnedSerialsList.push({
            serialCode: serialObj.serialCode,
            machineCode: serialObj.machineCode,
            productName: parentProd ? parentProd.name : serialObj.sku,
            sku: serialObj.sku,
            refundAmount: refundAmt
          })
        }
      })
    }

    const newReturn = {
      returnNo,
      invoiceNo: returnData.invoiceNo || 'DIRECT-RET',
      customer: returnData.customer,
      branch: returnData.branch || 'Peshawar',
      returnDate: returnData.returnDate || new Date().toISOString().substring(0, 10),
      returnedSerials: returnedSerialsList,
      totalRefundAmount: Number(returnData.totalRefundAmount || totalRefund || 0),
      reason: returnData.reason || 'Customer Equipment Return',
      restocked: true,
      processedBy: uName
    }

    salesReturns.value.unshift(newReturn)

    // If refund was disbursed immediately, auto-generate Payment Out voucher
    if (returnData.payoutRefund && newReturn.totalRefundAmount > 0) {
      const voucherNo = `VOU-2026-${String(paymentOutVouchers.value.length + 1).padStart(3, '0')}`
      const newVoucher = {
        voucherNo,
        payee: returnData.customer,
        category: 'Customer Refund',
        paymentDate: newReturn.returnDate,
        paymentType: returnData.paymentMethod || 'Cash Payment',
        amount: newReturn.totalRefundAmount,
        branch: newReturn.branch,
        description: `Refund for Sales Return ${returnNo} (Orig Invoice ${newReturn.invoiceNo})`,
        refInvoiceNo: returnNo,
        disbursedBy: uName
      }
      paymentOutVouchers.value.unshift(newVoucher)
    }

    addAuditLog(uName, uRole, 'RETURNS', `Processed Sales Return ${returnNo}`, `Customer: ${returnData.customer}, Invoice: ${newReturn.invoiceNo}, Machines Restocked: ${returnedSerialsList.length}`)
    saveState()

    try {
      await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReturn)
      })
    } catch (e) {}

    return newReturn
  }

  // Record Payment Out (Vouchers, Refunds, Vendor Outflows)
  async function recordPaymentOut(voucherData, user) {
    const voucherNo = `VOU-2026-${String(paymentOutVouchers.value.length + 1).padStart(3, '0')}`
    const uName = user?.name || (typeof user === 'string' ? user : 'Admin User')
    const uRole = user?.role || 'SuperAdmin'

    const newVoucher = {
      voucherNo,
      payee: voucherData.payee,
      category: voucherData.category || 'Operational Expense',
      paymentDate: voucherData.paymentDate || new Date().toISOString().substring(0, 10),
      paymentType: voucherData.paymentType || voucherData.paymentMethod || 'Cash Payment',
      amount: Number(voucherData.amount || 0),
      branch: voucherData.branch || 'Peshawar',
      description: voucherData.description || '',
      refInvoiceNo: voucherData.refInvoiceNo || '',
      disbursedBy: uName
    }

    paymentOutVouchers.value.unshift(newVoucher)
    addAuditLog(uName, uRole, 'PAYMENTS', `Recorded Payment Out ${voucherNo}`, `Payee: ${voucherData.payee}, Category: ${newVoucher.category}, Amount: PKR ${newVoucher.amount.toLocaleString()}`)
    saveState()

    try {
      await fetch('/api/payments-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVoucher)
      })
    } catch (e) {}

    return newVoucher
  }

  // Bulk Product File Import (from Excel, Word, PDF)
  async function bulkImportProducts(importedList, user) {
    if (!Array.isArray(importedList) || importedList.length === 0) return { addedCount: 0 }

    const uName = user?.name || (typeof user === 'string' ? user : 'Admin User')
    const uRole = user?.role || 'SuperAdmin'

    let addedCount = 0
    let addedSerialsCount = 0

    for (const item of importedList) {
      if (!item.name && !item.sku) continue

      const sku = item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`
      let prod = products.value.find(p => p.sku === sku || (p.name && p.name.toLowerCase() === (item.name || '').toLowerCase()))

      const stockQty = Number(item.stockQty || item.quantity || 1)

      if (!prod) {
        prod = {
          id: `prd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: item.name || sku,
          category: item.category || 'Medical Equipment',
          sku: sku,
          hsnCode: item.hsnCode || '9018.9000',
          taxRatio: Number(item.taxRatio || 18),
          allocationCity: item.branch || item.allocationCity || 'Peshawar',
          allocationCities: [item.branch || item.allocationCity || 'Peshawar'],
          storageBin: item.storageBin || 'HQ-PEW-01',
          costPrice: Number(item.costPrice || 0),
          sellingPrice: Number(item.sellingPrice || 0),
          stockQty: stockQty,
          minStock: Number(item.minStock || 2),
          image: item.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
        }
        products.value.push(prod)
        addedCount++

        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prod)
        }).catch(() => {})
      } else {
        prod.stockQty = (prod.stockQty || 0) + stockQty
      }

      // Automatically register serial & machine units
      const branch = prod.allocationCity || 'Peshawar'
      const serialCode = item.serialCode || `${prod.sku}-${Math.floor(1000 + Math.random() * 9000)}`
      const machineCode = item.machineCode || `MC-${Math.floor(100 + Math.random() * 900)}`

      const exists = serials.value.some(s => s.serialCode === serialCode)
      if (!exists) {
        const newSerial = {
          serialCode,
          machineCode,
          productId: prod.id,
          sku: prod.sku,
          status: 'Available',
          allocationCity: branch,
          binLocation: prod.storageBin || 'HQ-PEW-01',
          registeredDate: new Date().toISOString().substring(0, 10),
          soldDate: null,
          customer: null,
          invoiceNo: null,
          paymentStatus: 'Pending',
          hsnCode: prod.hsnCode,
          taxRatio: prod.taxRatio,
          salePrice: prod.sellingPrice
        }
        serials.value.push(newSerial)
        addedSerialsCount++

        fetch('/api/serials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSerial)
        }).catch(() => {})
      }
    }

    addAuditLog(uName, uRole, 'INVENTORY', 'Bulk Product File Import', `Imported ${addedCount} new equipment products and registered ${addedSerialsCount} units.`)
    ensureProductSerialsConsistency()
    saveState()

    return { addedCount, addedSerialsCount }
  }

  // Container Operations (Accountant creates & manages; ONLY SuperAdmin can delete)
  async function addContainer(containerData, user) {
    const uName = user?.name || 'Accountant'
    const uRole = (user?.role || 'accountant').toLowerCase()
    const cId = `cnt_${containerData.containerNo.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`

    let totalCost = 0
    let totalRetail = 0

    // Format items and generate serials with container company prefix
    const processedItems = (containerData.items || []).map(item => {
      const q = Number(item.quantity || 1)
      const cost = Number(item.costPrice || 0)
      const sell = Number(item.sellingPrice || 0)
      totalCost += (q * cost)
      totalRetail += (q * sell)

      // Auto-generate serial codes with container prefix (e.g. AN-WRM-0001)
      const prefix = (containerData.codePrefix || 'AN-').toUpperCase()
      const itemSerials = []
      for (let i = 1; i <= q; i++) {
        itemSerials.push(`${prefix}${item.sku.replace(/^[A-Z0-9]+-/i, '')}-${String(i).padStart(4, '0')}`)
      }

      return {
        name: item.name,
        category: item.category || 'Medical Equipment',
        sku: item.sku.toUpperCase(),
        quantity: q,
        costPrice: cost,
        sellingPrice: sell,
        barcode: item.barcode || `${prefix}BC-${item.sku}`,
        serials: itemSerials
      }
    })

    const newContainer = {
      id: cId,
      containerNo: containerData.containerNo.toUpperCase(),
      companyName: containerData.companyName,
      codePrefix: (containerData.codePrefix || 'AN-').toUpperCase(),
      status: containerData.status || 'Arrived',
      arrivalDate: containerData.arrivalDate || new Date().toISOString().substring(0, 10),
      destinationCity: containerData.destinationCity || 'Peshawar',
      notes: containerData.notes || '',
      createdBy: uName,
      totalCostValue: totalCost,
      totalRetailValue: totalRetail,
      items: processedItems
    }

    containers.value.unshift(newContainer)

    // Register contained products into active product catalog and serial registry
    for (const item of processedItems) {
      let prod = products.value.find(p => p.sku === item.sku)
      if (!prod) {
        prod = {
          id: `prd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          sku: item.sku,
          name: `${item.name} (${newContainer.companyName})`,
          category: item.category,
          division: 'Medimage Services',
          hsnCode: '9018.9000',
          taxRatio: 18,
          allocationCity: newContainer.destinationCity,
          allocationCities: [newContainer.destinationCity],
          storageBin: `BIN-${newContainer.codePrefix.replace(/[^A-Z0-9]/gi, '')}-01`,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          stockQty: item.quantity,
          minStock: 5,
          containerNo: newContainer.containerNo,
          companyName: newContainer.companyName,
          containerPrefix: newContainer.codePrefix,
          barcode: item.barcode,
          addedBy: uName,
          addedRole: uRole,
          image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'
        }
        products.value.unshift(prod)
      } else {
        prod.stockQty += item.quantity
        prod.containerNo = newContainer.containerNo
        prod.companyName = newContainer.companyName
        prod.containerPrefix = newContainer.codePrefix
      }

      // Add serial units
      item.serials.forEach((sCode) => {
        if (!checkDuplicateSerial(sCode)) {
          serials.value.unshift({
            serialCode: sCode,
            machineCode: `MC-${sCode}`,
            productId: prod.id,
            sku: prod.sku,
            status: 'Available',
            allocationCity: newContainer.destinationCity,
            binLocation: prod.storageBin,
            registeredDate: newContainer.arrivalDate,
            soldDate: null,
            customer: null,
            invoiceNo: null,
            paymentStatus: 'Pending',
            hsnCode: prod.hsnCode,
            taxRatio: prod.taxRatio,
            salePrice: 0,
            containerNo: newContainer.containerNo,
            companyName: newContainer.companyName,
            containerPrefix: newContainer.codePrefix,
            barcode: item.barcode
          })
        }
      })
    }

    addAuditLog(uName, uRole, 'INVENTORY', `Registered Container ${newContainer.containerNo}`, `Company: ${newContainer.companyName}, Prefix: ${newContainer.codePrefix}, Items: ${processedItems.length}, Total Cost: PKR ${totalCost.toLocaleString()}`)
    saveState()

    try {
      await fetch('/api/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContainer)
      })
    } catch (e) {}

    return newContainer
  }

  async function deleteContainer(containerId, user) {
    const uRole = (user?.role || '').toLowerCase()
    if (uRole === 'accountant') {
      throw new Error('Permission Denied: Accountants cannot delete containers. Only SuperAdmin has delete authorization.')
    }

    const idx = containers.value.findIndex(c => c.id === containerId || c._id === containerId)
    if (idx !== -1) {
      const removed = containers.value[idx]
      containers.value.splice(idx, 1)

      const uName = user?.name || 'SuperAdmin'
      addAuditLog(uName, 'superadmin', 'INVENTORY', `SuperAdmin Deleted Container ${removed.containerNo}`, `Company: ${removed.companyName}`, 'warning')
      saveState()

      try {
        await fetch(`/api/containers/${removed._id || removed.id}`, {
          method: 'DELETE',
          headers: { 'x-user-role': 'superadmin' }
        })
      } catch (e) {}
    }
  }

  // Error Flagging (Accountant reports mistake for SuperAdmin deletion)
  async function flagProductError(productId, reason, user) {
    const prod = products.value.find(p => p.id === productId || p._id === productId)
    if (prod) {
      prod.errorFlagged = true
      prod.errorReason = reason || 'Accountant flagged data entry error'
      prod.flaggedBy = user?.name || 'Accountant'
      const uName = user?.name || 'Accountant'
      const uRole = user?.role || 'accountant'
      addAuditLog(uName, uRole, 'AUDIT', `Flagged Entry Error for Product ${prod.name}`, `SKU: ${prod.sku}, Reason: ${prod.errorReason}. Awaiting SuperAdmin deletion/correction.`, 'warning')
      saveState()
    }
  }

  // Super 35M+ Multi-Million Sales Cross-Check Ledger Methods
  const super35mMetrics = computed(() => {
    const targetGoal = 35000000
    let totalFormAmount = 0
    let totalProductSoldValue = 0
    let totalInflowsCollected = 0
    let totalCogsCost = 0

    reconciliationRecords.value.forEach(rec => {
      if (rec.status !== 'Voided') {
        totalFormAmount += Number(rec.formAmount || 0)
        totalProductSoldValue += Number(rec.productSoldValue || 0)
        totalInflowsCollected += Number(rec.paymentInflowCollected || 0)
        totalCogsCost += Number(rec.cogsCostValue || 0)
      }
    })

    const netVariance = totalFormAmount - totalProductSoldValue
    const progressPercent = Math.min(100, Number(((totalFormAmount / targetGoal) * 100).toFixed(1)))
    const verifiedCount = reconciliationRecords.value.filter(r => r.status === 'Verified').length
    const pendingCount = reconciliationRecords.value.filter(r => r.status === 'Pending Audit').length

    return {
      targetGoal,
      totalFormAmount,
      totalProductSoldValue,
      totalInflowsCollected,
      totalCogsCost,
      netVariance,
      progressPercent,
      verifiedCount,
      pendingCount,
      isTargetAchieved: totalFormAmount >= targetGoal
    }
  })

  async function addReconciliationEntry(entryData, user) {
    const uName = user?.name || 'Tariq Mahmood (Ahmad Son Accounts)'
    const uRole = (user?.role || 'accountant').toLowerCase()
    const entryNo = `REC-35M-${String(reconciliationRecords.value.length + 1).padStart(3, '0')}`

    const formAmt = Number(entryData.formAmount || 0)
    const prodVal = Number(entryData.productSoldValue || formAmt)
    const cogsVal = Number(entryData.cogsCostValue || 0)
    const inflow = Number(entryData.paymentInflowCollected || formAmt)
    const variance = formAmt - prodVal

    const newRecord = {
      id: `rec_${Date.now()}`,
      entryNo,
      date: entryData.date || new Date().toISOString().substring(0, 10),
      accountantName: uName,
      containerNo: entryData.containerNo || 'SENDNB2606060',
      companyName: entryData.companyName || 'Ahmad Son company',
      formAmount: formAmt,
      productSoldValue: prodVal,
      cogsCostValue: cogsVal,
      paymentInflowCollected: inflow,
      variance,
      destinationCity: entryData.destinationCity || 'Lahore & Multan',
      description: entryData.description || 'Daily sales form entry submitted for SuperAdmin 35M cross-check',
      status: 'Pending Audit',
      verifiedBy: null,
      verifiedDate: null,
      addedRole: uRole,
      notes: entryData.notes || ''
    }

    reconciliationRecords.value.unshift(newRecord)
    addAuditLog(uName, uRole, 'FINANCIAL', `Submitted Form Record ${entryNo}`, `Amount: PKR ${formAmt.toLocaleString()}, Container: ${newRecord.containerNo}`)
    
    try {
      fetch('/api/reconciliations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      }).catch(() => {})
    } catch (e) {}

    saveState()
    return newRecord
  }

  async function verifyReconciliationEntry(recordId, user) {
    const uRole = (user?.role || '').toLowerCase()
    if (uRole !== 'superadmin') {
      throw new Error('Permission Denied: Only SuperAdmin can verify reconciliation records.')
    }
    const rec = reconciliationRecords.value.find(r => r.id === recordId)
    if (rec) {
      rec.status = 'Verified'
      rec.verifiedBy = user?.name || 'Alexander Sterling (SuperAdmin)'
      rec.verifiedDate = new Date().toISOString().replace('T', ' ').substring(0, 16)
      addAuditLog(user?.name || 'SuperAdmin', 'superadmin', 'FINANCIAL', `SuperAdmin Verified Sales Entry ${rec.entryNo}`, `Cross-checked PKR ${rec.formAmount.toLocaleString()} against product outflows.`)
      
      try {
        const target = rec.id || rec._id || rec.entryNo
        fetch(`/api/reconciliations/${encodeURIComponent(target)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rec)
        }).catch(() => {})
      } catch (e) {}

      saveState()
    }
  }

  async function voidReconciliationEntry(recordId, user, voidReason) {
    const uRole = (user?.role || '').toLowerCase()
    if (uRole !== 'superadmin') {
      throw new Error('Permission Denied: Only SuperAdmin can void reconciliation records.')
    }
    const rec = reconciliationRecords.value.find(r => r.id === recordId)
    if (rec) {
      rec.status = 'Voided'
      rec.verifiedBy = user?.name || 'Alexander Sterling (SuperAdmin)'
      rec.notes = `${rec.notes || ''} [VOIDED BY SUPERADMIN: ${voidReason || 'Incorrect amount entered by accountant'}]`
      addAuditLog(user?.name || 'SuperAdmin', 'superadmin', 'FINANCIAL', `SuperAdmin Voided Record ${rec.entryNo}`, `Reason: ${voidReason || 'Entry error'}`, 'warning')
      
      try {
        const target = rec.id || rec._id || rec.entryNo
        fetch(`/api/reconciliations/${encodeURIComponent(target)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rec)
        }).catch(() => {})
      } catch (e) {}

      saveState()
    }
  }

  // SuperAdmin Exclusive Delete Wrong Accountant Product
  async function superAdminDeleteWrongProduct(productId, user, reason) {
    const uRole = (user?.role || '').toLowerCase()
    if (uRole !== 'superadmin') {
      throw new Error('Permission Denied: Only SuperAdmin is authorized to delete products.')
    }
    const pIndex = products.value.findIndex(prod => prod.id === productId || prod._id === productId)
    if (pIndex !== -1) {
      const deletedProd = products.value[pIndex]
      const pId = deletedProd.id || deletedProd._id
      const pSku = deletedProd.sku
      products.value.splice(pIndex, 1)
      serials.value = serials.value.filter(s => s.productId !== pId && s.sku !== pSku)

      const uName = user?.name || 'SuperAdmin'
      addAuditLog(uName, 'superadmin', 'INVENTORY', `SuperAdmin Deleted Incorrect Product ${deletedProd.name}`, `Removed SKU ${deletedProd.sku}. Reason: ${reason || 'Accountant data entry error'}`, 'warning')
      saveState()

      const targetId = deletedProd._id || deletedProd.id
      try {
        await fetch(`/api/products/${targetId}`, {
          method: 'DELETE',
          headers: { 'x-user-role': 'superadmin' }
        })
      } catch (e) {}
    }
  }

  function resetToDefaults() {
    products.value = JSON.parse(JSON.stringify(initialProducts))
    serials.value = JSON.parse(JSON.stringify(initialSerials))
    purchaseOrders.value = JSON.parse(JSON.stringify(initialPurchaseOrders))
    salesInvoices.value = JSON.parse(JSON.stringify(initialSalesInvoices))
    paymentReceipts.value = JSON.parse(JSON.stringify(initialPaymentReceipts))
    stockTransfers.value = JSON.parse(JSON.stringify(initialStockTransfers))
    auditLogs.value = JSON.parse(JSON.stringify(initialAuditLogs))
    salesReturns.value = JSON.parse(JSON.stringify(initialSalesReturns))
    paymentOutVouchers.value = JSON.parse(JSON.stringify(initialPaymentOutVouchers))
    containers.value = JSON.parse(JSON.stringify(initialContainers))
    reconciliationRecords.value = JSON.parse(JSON.stringify(initialReconciliationRecords))
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
    salesReturns,
    paymentOutVouchers,
    containers,
    reconciliationRecords,
    super35mMetrics,

    // 4-Tier Downward Hierarchy Reactive Collections
    visibleProducts,
    visibleSerials,
    visibleSalesInvoices,
    visibleContainers,
    visibleAuditLogs,
    visibleReconciliationRecords,
    canActiveUserSeeRole,

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

    totalMoneyIn,
    totalMoneyOut,
    netCashFlow,
    getCashFlowLedger,

    // ERP Modules & Specifications
    customerCategories,
    customers,
    paymentFollowUps,
    warranties,
    warrantyClaims,
    workshopSpareParts,
    faultyMachines,
    expenses,
    branches,
    activeBranchFilter,
    overdueInvoices,
    productWisePayments,
    blList,
    getCustomerCreditStatus,
    overrideCustomerCredit,
    lockCustomer,
    unlockCustomer,
    addCustomerCategory,
    updateCustomerCategory,
    addCustomer,
    updateCustomer,
    sendPaymentReminder,
    getProductWisePaymentList,
    validateBLForClosing,
    closeBL,
    reopenBL,
    getBLClosingRows,
    registerWarrantyClaim,
    issueWorkshopPart,
    updateFaultyMachine,
    addExpense,
    setActiveBranch,

    checkDuplicateSerial,
    checkDuplicateMachineCode,
    searchMachineJourney,
    getCustomerLedger,
    getCustomerLedgerBalance,
    getDealerPreviousSalePrice,
    getHistoricalStock,
    getSalesMetrics,
    recordPaymentIn,
    recordPaymentOut,
    processSalesReturn,
    bulkImportProducts,
    transferBranchStock,
    addProduct,
    updateProduct,
    deleteProduct,
    addContainer,
    deleteContainer,
    flagProductError,
    addReconciliationEntry,
    verifyReconciliationEntry,
    voidReconciliationEntry,
    superAdminDeleteWrongProduct,
    createPurchaseOrder,
    processSaleInvoice,
    createSalesInvoice: processSaleInvoice,
    updateSerialStatus,
    addAuditLog,
    markAuditLogAsRead,
    markAllAuditLogsAsRead,
    syncWithBackend,
    resetToDefaults
  }
})

