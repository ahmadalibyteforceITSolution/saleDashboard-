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

      // Log Security Audit
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
      // Offline / Fallback User Creation
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

      const badgeColor = user.role === 'superadmin' ? 'purple' : user.role === 'admin' ? 'info' : 'success'
      return res.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          avatar: user.avatar,
          badgeColor
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
          badgeColor
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

// --- Products Routes ---
app.get('/api/products', async (req, res) => {
  try {
    if (!isConnected) await connectDB()
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/products', async (req, res) => {
  try {
    if (!isConnected) await connectDB()
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Serials Routes ---
app.get('/api/serials', async (req, res) => {
  try {
    if (!isConnected) await connectDB()
    const serials = await Serial.find().sort({ createdAt: -1 })
    res.json(serials)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/serials/:code', async (req, res) => {
  try {
    if (!isConnected) await connectDB()
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
    if (!isConnected) await connectDB()
    const pos = await PurchaseOrder.find().sort({ createdAt: -1 })
    res.json(pos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/purchases', async (req, res) => {
  try {
    if (!isConnected) await connectDB()
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
    if (!isConnected) await connectDB()
    const sales = await SaleInvoice.find().sort({ createdAt: -1 })
    res.json(sales)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/sales', async (req, res) => {
  try {
    if (!isConnected) await connectDB()
    const invoice = new SaleInvoice(req.body)
    await invoice.save()
    res.status(201).json(invoice)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Audit Logs Routes ---
app.get('/api/audit', async (req, res) => {
  try {
    if (!isConnected) await connectDB()
    const logs = await AuditLog.find().sort({ createdAt: -1 })
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/audit', async (req, res) => {
  try {
    if (!isConnected) await connectDB()
    const log = new AuditLog(req.body)
    await log.save()
    res.status(201).json(log)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[Express Server] Listening on http://localhost:${PORT}`)
  })
}

export default app
