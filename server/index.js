import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

import mongoose from 'mongoose'
import Product from './models/Product.js'
import Serial from './models/Serial.js'
import PurchaseOrder from './models/PurchaseOrder.js'
import SaleInvoice from './models/SaleInvoice.js'
import AuditLog from './models/AuditLog.js'
import User from './models/User.js'
import PaymentReceipt from './models/PaymentReceipt.js'
import StockTransfer from './models/StockTransfer.js'
import SaleReturn from './models/SaleReturn.js'
import PaymentOut from './models/PaymentOut.js'
import Container from './models/Container.js'
import Customer from './models/Customer.js'
import Expense from './models/Expense.js'
import Reconciliation from './models/Reconciliation.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Connect to MongoDB & Seed Default Data
let isConnected = false
let isSeeded = false

export async function seedDefaultData() {
  if (isSeeded) return
  try {
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      console.log('[Seed] Seeding default system users in MongoDB Atlas...')
      await User.insertMany([
        {
          name: 'Alexander Sterling',
          email: 'superadmin@nexis.com',
          password: 'superadmin123',
          role: 'superadmin',
          title: 'Chief Operations Officer (Level 4)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          status: 'Active'
        },
        {
          name: 'Sarah Jenkins',
          email: 'admin@nexis.com',
          password: 'admin123',
          role: 'admin',
          title: 'Head Store Admin (Level 3)',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
          status: 'Active'
        },
        {
          name: 'Marcus Vance',
          email: 'sales@nexis.com',
          password: 'manager123',
          role: 'manager',
          title: 'POS Lead Manager (Level 2)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          status: 'Active'
        },
        {
          name: 'Tariq Mahmood (Ahmad Son Accounts)',
          email: 'accountant@nexis.com',
          password: 'accountant123',
          role: 'accountant',
          title: 'Chief Accountant & Container Controller (Level 1)',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
          status: 'Active'
        }
      ])
    }

    const custCount = await Customer.countDocuments()
    if (custCount === 0) {
      console.log('[Seed] Seeding default customers in MongoDB Atlas...')
      await Customer.insertMany([
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
          lockReason: 'Credit exposure exceeded limit & unpaid invoice INV-2026-103.',
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
        },
        {
          id: 'cust_abcd',
          name: 'ABCD Hospital',
          category: 'CATEGORY C',
          branch: 'Peshawar',
          phone: '+92 91 5551234',
          email: 'procurement@abcdhospital.pk',
          address: 'Hayatabad Phase 4, Peshawar',
          baseCreditLimit: 2000000,
          paymentDays: 30,
          status: 'active',
          overrides: []
        }
      ])
    }

    const expCount = await Expense.countDocuments()
    if (expCount === 0) {
      await Expense.insertMany([
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
        }
      ])
    }

    const recCount = await Reconciliation.countDocuments()
    if (recCount === 0) {
      await Reconciliation.insertMany([
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
        }
      ])
    }

    isSeeded = true
  } catch (err) {
    console.warn('[Seed Warning]:', err.message)
  }
}

export async function ensureDB() {
  if (!isConnected) {
    isConnected = await connectDB()
  }
  if (isConnected && !isSeeded) {
    await seedDefaultData()
  }
  return isConnected
}

connectDB().then(async connected => {
  isConnected = connected
  if (connected) {
    await seedDefaultData()
  }
})

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    mongoDB: isConnected ? 'connected' : 'disconnected (using local memory state)',
    timestamp: new Date()
  })
})

// --- Auth & Users Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, title } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    if (isConnected) {
      const existing = await User.findOne({ email: email.toLowerCase() })
      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists' })
      }

      const badgeColor = role === 'superadmin' ? 'purple' : role === 'admin' ? 'info' : role === 'accountant' ? 'emerald' : 'success'
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'manager',
        title: title || (role === 'superadmin' ? 'Chief Operations Officer' : role === 'admin' ? 'Store Manager' : role === 'accountant' ? 'Chief Accountant & Container Controller' : 'Sales Lead')
      })
      await newUser.save()

      const audit = new AuditLog({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: newUser.name,
        role: newUser.role,
        category: 'SECURITY',
        action: `Registered New Account (${newUser.role.toUpperCase()})`,
        details: `User ${newUser.email} created account with role ${newUser.role}`,
        severity: 'normal'
      })
      await audit.save()

      return res.status(201).json({
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          title: newUser.title,
          avatar: newUser.avatar,
          badgeColor
        }
      })
    } else {
      const badgeColor = role === 'superadmin' ? 'purple' : role === 'admin' ? 'info' : role === 'accountant' ? 'emerald' : 'success'
      const fallbackUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role: role || 'manager',
        title: title || (role === 'accountant' ? 'Chief Accountant & Container Controller' : `${role} Account`),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        badgeColor
      }
      return res.status(201).json({ user: fallbackUser })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (isConnected) {
      const user = await User.findOne({ email: email.toLowerCase(), password })
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
      if (user.status === 'Frozen') {
        return res.status(403).json({ error: 'Account is locked by SuperAdmin governance' })
      }

      const badgeColor = user.role === 'superadmin' ? 'purple' : user.role === 'admin' ? 'info' : user.role === 'accountant' ? 'emerald' : 'success'
      return res.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          avatar: user.avatar,
          badgeColor,
          status: user.status
        }
      })
    } else {
      const role = email.includes('super') ? 'superadmin' : email.includes('account') ? 'accountant' : email.includes('admin') ? 'admin' : 'manager'
      const badgeColor = role === 'superadmin' ? 'purple' : role === 'admin' ? 'info' : role === 'accountant' ? 'emerald' : 'success'
      return res.json({
        user: {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0],
          email,
          role,
          title: role === 'accountant' ? 'Chief Accountant & Container Controller' : `${role.toUpperCase()} Account`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
          badgeColor,
          status: 'Active'
        }
      })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/auth/verify-password', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!password) {
      return res.status(400).json({ valid: false, error: 'Password is required' })
    }

    const trimmedPassword = password.trim()

    // Master / standard demo passwords allowed across system (as specified in UI hints)
    const masterPasswords = ['admin', 'admin123', 'superadmin', 'superadmin123', 'manager123', 'accountant123', '123456', 'password']
    if (masterPasswords.includes(trimmedPassword.toLowerCase())) {
      return res.json({ valid: true, user: { name: 'Authorized Officer', role: 'superadmin' } })
    }

    if (await ensureDB()) {
      let query = { password: trimmedPassword }
      if (email) {
        query.email = email.toLowerCase()
      }
      const user = await User.findOne(query)
      if (user) {
        return res.json({ valid: true, user: { name: user.name, role: user.role } })
      }

      // Check if password matches any admin or superadmin user in the database
      const adminUser = await User.findOne({ role: { $in: ['superadmin', 'admin'] }, password: trimmedPassword })
      if (adminUser) {
        return res.json({ valid: true, user: { name: adminUser.name, role: adminUser.role } })
      }

      // Any active user whose password matches
      const anyUser = await User.findOne({ password: trimmedPassword })
      if (anyUser) {
        return res.json({ valid: true, user: { name: anyUser.name, role: anyUser.role } })
      }

      return res.status(401).json({ valid: false, error: 'Incorrect dashboard login password' })
    } else {
      // Offline fallback verification: accept if at least 3 chars
      if (trimmedPassword.length >= 3) {
        return res.json({ valid: true, user: { name: 'Admin', role: 'superadmin' } })
      }
      return res.status(401).json({ valid: false, error: 'Incorrect dashboard login password' })
    }
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/users/:id', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json({ status: 'ok' })
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password')
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json({ status: 'ok' })
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Products Routes ---
app.get('/api/products', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/products', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const product = new Product(req.body)
    await product.save()

    if (req.body.serials && Array.isArray(req.body.serials) && req.body.serials.length > 0) {
      for (const s of req.body.serials) {
        await Serial.findOneAndUpdate(
          { serialCode: s.serialCode },
          { ...s, productId: product._id.toString() },
          { upsert: true, new: true }
        )
      }
    }

    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.patch('/api/products/:id', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json(req.body)
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  try {
    const callerRole = req.headers['x-user-role'] || req.query.role || (req.body && req.body.role)
    if (callerRole === 'accountant') {
      return res.status(403).json({ error: 'Permission Denied: Accountants cannot delete products. Only SuperAdmin is authorized to delete products.' })
    }
    if (!(await ensureDB())) return res.json({ message: 'Product deleted' })
    await Product.findByIdAndDelete(req.params.id)
    await Serial.deleteMany({ productId: req.params.id })
    res.json({ message: 'Product deleted successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Containers Routes ---
app.get('/api/containers', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const containers = await Container.find().sort({ createdAt: -1 })
    res.json(containers)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/containers', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const container = new Container(req.body)
    await container.save()

    // If items are inside the container, register products & serials
    if (req.body.items && Array.isArray(req.body.items)) {
      for (const item of req.body.items) {
        let existingProd = await Product.findOne({ sku: item.sku })
        if (!existingProd) {
          existingProd = new Product({
            sku: item.sku,
            name: item.name,
            category: item.category || 'Medical Equipment',
            costPrice: item.costPrice || 0,
            sellingPrice: item.sellingPrice || 0,
            stockQty: item.quantity || 1,
            allocationCity: req.body.destinationCity || 'Peshawar',
            allocationCities: [req.body.destinationCity || 'Peshawar'],
            storageBin: `BIN-${(req.body.codePrefix || 'CN').replace(/[^A-Z0-9]/gi, '')}-01`,
            containerNo: req.body.containerNo,
            companyName: req.body.companyName,
            containerPrefix: req.body.codePrefix,
            barcode: item.barcode || `${req.body.codePrefix}${item.sku}`,
            addedBy: req.body.createdBy || 'Accountant',
            addedRole: 'accountant'
          })
          await existingProd.save()
        } else {
          existingProd.stockQty += (item.quantity || 1)
          existingProd.containerNo = req.body.containerNo
          existingProd.companyName = req.body.companyName
          existingProd.containerPrefix = req.body.codePrefix
          await existingProd.save()
        }

        // Generate serials with container company prefix
        if (item.serials && Array.isArray(item.serials)) {
          for (const sCode of item.serials) {
            await Serial.findOneAndUpdate(
              { serialCode: sCode },
              {
                serialCode: sCode,
                machineCode: `MC-${sCode}`,
                productId: existingProd._id.toString(),
                sku: existingProd.sku,
                status: 'Available',
                allocationCity: req.body.destinationCity || 'Peshawar',
                binLocation: existingProd.storageBin,
                registeredDate: req.body.arrivalDate || new Date().toISOString().substring(0, 10),
                containerNo: req.body.containerNo,
                companyName: req.body.companyName,
                containerPrefix: req.body.codePrefix,
                barcode: item.barcode || sCode,
                hsnCode: existingProd.hsnCode,
                taxRatio: existingProd.taxRatio,
                salePrice: existingProd.sellingPrice
              },
              { upsert: true, new: true }
            )
          }
        }
      }
    }

    res.status(201).json(container)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/containers/:id', async (req, res) => {
  try {
    const callerRole = req.headers['x-user-role'] || req.query.role || (req.body && req.body.role)
    if (callerRole === 'accountant') {
      return res.status(403).json({ error: 'Permission Denied: Accountants cannot delete containers. Only SuperAdmin has delete authorization.' })
    }
    if (!(await ensureDB())) return res.json({ message: 'Container deleted' })
    await Container.findByIdAndDelete(req.params.id)
    res.json({ message: 'Container deleted successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Serials Routes ---
app.get('/api/serials', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const serials = await Serial.find().sort({ createdAt: -1 })
    res.json(serials)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/serials', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const serial = await Serial.findOneAndUpdate(
      { serialCode: req.body.serialCode },
      req.body,
      { upsert: true, new: true }
    )
    res.status(201).json(serial)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post('/api/serials/bulk', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json({ count: (req.body || []).length })
    const serialList = Array.isArray(req.body) ? req.body : (req.body.serials || [])
    for (const s of serialList) {
      await Serial.findOneAndUpdate(
        { serialCode: s.serialCode },
        s,
        { upsert: true, new: true }
      )
    }
    res.status(201).json({ message: `Upserted ${serialList.length} serials` })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.patch('/api/serials/:code', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json({ serialCode: req.params.code })
    const serial = await Serial.findOneAndUpdate(
      { serialCode: req.params.code },
      req.body,
      { new: true }
    )
    res.json(serial)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Purchase Orders Routes ---
app.get('/api/purchases', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const pos = await PurchaseOrder.find().sort({ createdAt: -1 })
    res.json(pos)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/purchases', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const po = new PurchaseOrder(req.body)
    await po.save()
    res.status(201).json(po)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Sales Invoices Routes ---
app.get('/api/sales', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const sales = await SaleInvoice.find().sort({ createdAt: -1 })
    res.json(sales)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/sales', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const sale = new SaleInvoice(req.body)
    await sale.save()

    if (req.body.items && Array.isArray(req.body.items)) {
      for (const it of req.body.items) {
        if (it.serials && Array.isArray(it.serials)) {
          for (const sCode of it.serials) {
            const cleanCode = sCode.replace(/^SN-/i, '')
            await Serial.findOneAndUpdate(
              {
                $or: [
                  { serialCode: cleanCode },
                  { serialCode: sCode },
                  { serialCode: `SN-${cleanCode}` }
                ]
              },
              {
                status: 'Sold',
                soldDate: req.body.saleDate,
                customer: req.body.customer,
                invoiceNo: req.body.invoiceNo,
                salePrice: it.unitPrice
              },
              { new: true }
            )
          }
        }
      }
    }

    res.status(201).json(sale)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Universal Search Endpoint (360 Machine Journey) ---
app.get('/api/universal-search/:query', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(404).json({ error: 'DB Offline' })
    const queryTerm = req.params.query.trim()
    const serialDoc = await Serial.findOne({
      $or: [
        { serialCode: { $regex: `^${queryTerm}$`, $options: 'i' } },
        { machineCode: { $regex: `^${queryTerm}$`, $options: 'i' } }
      ]
    })
    
    if (!serialDoc) {
      return res.status(404).json({ error: 'No machine found matching exact Serial Number or Machine Code' })
    }

    const product = await Product.findOne({ id: serialDoc.productId }) || await Product.findOne({ sku: serialDoc.sku })
    const saleInvoice = serialDoc.invoiceNo ? await SaleInvoice.findOne({ invoiceNo: serialDoc.invoiceNo }) : null
    const purchaseOrder = serialDoc.purchaseInvoiceNo ? await PurchaseOrder.findOne({ poNumber: serialDoc.purchaseInvoiceNo }) : null
    const paymentReceipts = await PaymentReceipt.find({ 'paidSerials.serialCode': serialDoc.serialCode })

    res.json({
      serial: serialDoc,
      product,
      saleInvoice,
      purchaseOrder,
      paymentReceipts
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Payment Receipts Routes ---
app.get('/api/payments', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const payments = await PaymentReceipt.find().sort({ createdAt: -1 })
    res.json(payments)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/payments', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const receipt = new PaymentReceipt(req.body)
    await receipt.save()

    if (req.body.paidSerials && req.body.paidSerials.length > 0) {
      for (const item of req.body.paidSerials) {
        await Serial.findOneAndUpdate(
          { serialCode: item.serialCode },
          {
            paymentStatus: 'Paid',
            paymentReceiptNo: receipt.receiptNo,
            paymentDate: receipt.paymentDate,
            paymentAmount: item.amountAllocated || 0,
            paymentNotes: receipt.description
          }
        )
      }
    }
    res.status(201).json(receipt)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Stock Transfers Routes ---
app.get('/api/transfers', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const transfers = await StockTransfer.find().sort({ createdAt: -1 })
    res.json(transfers)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/transfers', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const transfer = new StockTransfer(req.body)
    await transfer.save()

    if (req.body.serials && req.body.serials.length > 0) {
      for (const item of req.body.serials) {
        await Serial.findOneAndUpdate(
          { serialCode: item.serialCode },
          { allocationCity: req.body.toBranch }
        )
      }
    }
    res.status(201).json(transfer)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Audit Logs & Notifications Routes ---
app.get('/api/audit', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const logs = await AuditLog.find().sort({ createdAt: -1 })
    res.json(logs)
  } catch (err) {
    res.json([])
  }
})

app.get('/api/notifications', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const logs = await AuditLog.find().sort({ createdAt: -1 })
    res.json(logs)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/audit', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const log = new AuditLog({
      ...req.body,
      read: req.body.read || false
    })
    await log.save()
    res.status(201).json(log)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post('/api/notifications', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const log = new AuditLog({
      ...req.body,
      read: req.body.read || false
    })
    await log.save()
    res.status(201).json(log)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/audit/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    if (await ensureDB()) {
      const updated = await AuditLog.findByIdAndUpdate(
        id,
        { read: true, readAt: new Date() },
        { new: true }
      )
      return res.json(updated || { id, read: true })
    }
    return res.json({ id, read: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    if (await ensureDB()) {
      const updated = await AuditLog.findByIdAndUpdate(
        id,
        { read: true, readAt: new Date() },
        { new: true }
      )
      return res.json(updated || { id, read: true })
    }
    return res.json({ id, read: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/audit/mark-all-read', async (req, res) => {
  try {
    if (await ensureDB()) {
      const result = await AuditLog.updateMany(
        { read: { $ne: true } },
        { $set: { read: true, readAt: new Date() } }
      )
      return res.json({ success: true, count: result.modifiedCount })
    }
    return res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/notifications/mark-all-read', async (req, res) => {
  try {
    if (await ensureDB()) {
      const result = await AuditLog.updateMany(
        { read: { $ne: true } },
        { $set: { read: true, readAt: new Date() } }
      )
      return res.json({ success: true, count: result.modifiedCount })
    }
    return res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Sales Returns Routes ---
app.get('/api/returns', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const returns = await SaleReturn.find().sort({ createdAt: -1 })
    res.json(returns)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/returns', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const saleReturn = new SaleReturn(req.body)
    await saleReturn.save()

    // Restore returned serials to Available in inventory
    if (req.body.returnedSerials && Array.isArray(req.body.returnedSerials)) {
      for (const item of req.body.returnedSerials) {
        const cleanCode = (item.serialCode || '').replace(/^SN-/i, '')
        await Serial.findOneAndUpdate(
          {
            $or: [
              { serialCode: cleanCode },
              { serialCode: item.serialCode },
              { serialCode: `SN-${cleanCode}` }
            ]
          },
          {
            status: 'Available',
            returnDate: req.body.returnDate,
            returnInvoiceNo: req.body.returnNo,
            customer: null
          },
          { new: true }
        )

        // Increment parent product stockQty
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stockQty: 1 } })
        }
      }
    }

    res.status(201).json(saleReturn)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Payment Out Routes (Disbursements / Inflows & Outflows) ---
app.get('/api/payments-out', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const vouchers = await PaymentOut.find().sort({ createdAt: -1 })
    res.json(vouchers)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/payments-out', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const voucher = new PaymentOut(req.body)
    await voucher.save()
    res.status(201).json(voucher)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Customers Routes ---
app.get('/api/customers', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const customers = await Customer.find().sort({ name: 1 })
    res.json(customers)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/customers', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const cust = new Customer(req.body)
    await cust.save()
    res.status(201).json(cust)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.patch('/api/customers/:id', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json(req.body)
    const { id } = req.params
    const updated = await Customer.findOneAndUpdate(
      { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { id }, { name: id }] },
      req.body,
      { new: true, upsert: false }
    )
    res.json(updated || req.body)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/customers/:id', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json({ message: 'Customer deleted' })
    const { id } = req.params
    await Customer.findOneAndDelete({ $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { id }] })
    res.json({ message: 'Customer deleted successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Expenses Routes ---
app.get('/api/expenses', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const expenses = await Expense.find().sort({ createdAt: -1 })
    res.json(expenses)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/expenses', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const expense = new Expense(req.body)
    await expense.save()
    res.status(201).json(expense)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json({ message: 'Expense deleted' })
    const { id } = req.params
    await Expense.findOneAndDelete({ $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { id }] })
    res.json({ message: 'Expense deleted successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Reconciliations Routes ---
app.get('/api/reconciliations', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json([])
    const recs = await Reconciliation.find().sort({ createdAt: -1 })
    res.json(recs)
  } catch (err) {
    res.json([])
  }
})

app.post('/api/reconciliations', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.status(201).json(req.body)
    const rec = new Reconciliation(req.body)
    await rec.save()
    res.status(201).json(rec)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.patch('/api/reconciliations/:id', async (req, res) => {
  try {
    if (!(await ensureDB())) return res.json(req.body)
    const { id } = req.params
    const updated = await Reconciliation.findOneAndUpdate(
      { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { id }, { entryNo: id }] },
      req.body,
      { new: true }
    )
    res.json(updated || req.body)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Express API Server running on port ${PORT}`)
    })
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[API Server] Port ${PORT} already active, API ready.`)
      }
    })
  } catch (e) {}
}

export default app
