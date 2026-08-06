import mongoose from 'mongoose'

const serialSchema = new mongoose.Schema({
  serialCode: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  sku: { type: String, required: true },
  status: { type: String, required: true, enum: ['Available', 'Sold', 'Reserved', 'Defective'], default: 'Available' },
  binLocation: { type: String, required: true },
  registeredDate: { type: String, required: true },
  soldDate: { type: String, default: null },
  customer: { type: String, default: null },
  invoiceNo: { type: String, default: null }
}, { timestamps: true })

export default mongoose.model('Serial', serialSchema)
