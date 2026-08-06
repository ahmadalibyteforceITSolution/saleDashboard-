import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

import Product from './models/Product.js'
import Serial from './models/Serial.js'
import PurchaseOrder from './models/PurchaseOrder.js'
import SaleInvoice from './models/SaleInvoice.js'
import AuditLog from './models/AuditLog.js'

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

// --- Products Routes ---
app.get('/api/products', async (req, res) => {
  try {
    if (!isConnected) return res.json([])
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/products', async (req, res) => {
  try {
    if (!isConnected) return res.json({ status: 'ok', fallback: true })
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
    if (!isConnected) return res.json([])
    const serials = await Serial.find().sort({ createdAt: -1 })
    res.json(serials)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/serials/:code', async (req, res) => {
  try {
    if (!isConnected) return res.json({ status: 'ok', fallback: true })
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
    if (!isConnected) return res.json([])
    const pos = await PurchaseOrder.find().sort({ createdAt: -1 })
    res.json(pos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/purchases', async (req, res) => {
  try {
    if (!isConnected) return res.json({ status: 'ok', fallback: true })
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
    if (!isConnected) return res.json([])
    const sales = await SaleInvoice.find().sort({ createdAt: -1 })
    res.json(sales)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/sales', async (req, res) => {
  try {
    if (!isConnected) return res.json({ status: 'ok', fallback: true })
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
    if (!isConnected) return res.json([])
    const logs = await AuditLog.find().sort({ createdAt: -1 })
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/audit', async (req, res) => {
  try {
    if (!isConnected) return res.json({ status: 'ok', fallback: true })
    const log = new AuditLog(req.body)
    await log.save()
    res.status(201).json(log)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`[Express Server] Server listening on http://localhost:${PORT}`)
})
