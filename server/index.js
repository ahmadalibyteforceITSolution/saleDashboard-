import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

import Product from './models/Product.js'
import Serial from './models/Serial.js'
import PurchaseOrder from './models/PurchaseOrder.js'
import SaleInvoice from './models/SaleInvoice.js'
import AuditLog from './models/AuditLog.js'
import User from './models/User.js'
import PaymentReceipt from './models/PaymentReceipt.js'
import StockTransfer from './models/StockTransfer.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Connect to MongoDB
let isConnected = false
connectDB().then(connected => {
  isConnected = connected
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

      const badgeColor = role === 'superadmin' ? 'purple' : role === 'admin' ? 'info' : 'success'
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'manager',
        title: title || (role === 'superadmin' ? 'Chief Operations Officer' : role === 'admin' ? 'Store Manager' : 'Sales Lead')
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
      const badgeColor = role === 'superadmin' ? 'purple' : role === 'admin' ? 'info' : 'success'
      const fallbackUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role: role || 'manager',
        title: title || `${role} Account`,
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

      const badgeColor = user.role === 'superadmin' ? 'purple' : user.role === 'admin' ? 'info' : 'success'
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
      const role = email.includes('super') ? 'superadmin' : email.includes('admin') ? 'admin' : 'manager'
      const badgeColor = role === 'superadmin' ? 'purple' : role === 'admin' ? 'info' : 'success'
      return res.json({
        user: {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0],
          email,
          role,
          title: `${role.toUpperCase()} Account`,
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

app.get('/api/users', async (req, res) => {
  try {
    if (!isConnected) return res.json([])
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/users/:id', async (req, res) => {
  try {
    if (!isConnected) return res.json({ status: 'ok' })
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password')
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    if (!isConnected) return res.json({ status: 'ok' })
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Helper DB connection check ---
async function ensureDB() {
  if (!isConnected) {
    isConnected = await connectDB()
  }
  return isConnected
}

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
    if (!(await ensureDB())) return res.json({ message: 'Product deleted' })
    await Product.findByIdAndDelete(req.params.id)
    await Serial.deleteMany({ productId: req.params.id })
    res.json({ message: 'Product deleted successfully' })
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

// --- Audit Logs Routes ---
app.get('/api/audit', async (req, res) => {
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
    const log = new AuditLog(req.body)
    await log.save()
    res.status(201).json(log)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Express API Server running on port ${PORT}`)
  })
}

export default app
