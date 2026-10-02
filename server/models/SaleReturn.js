import mongoose from 'mongoose'

const saleReturnSchema = new mongoose.Schema({
  id: { type: String },
  returnNo: { type: String, default: () => `RET-${Date.now().toString().slice(-4)}` },
  invoiceNo: { type: String, default: '' },
  customer: { type: String, default: 'General Customer' },
  branch: { type: String, default: 'Lahore' },
  division: { type: String, default: 'Medimage Services' },
  returnDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  items: [{
    productId: String,
    productName: String,
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    serials: [String],
    machineCodes: [String]
  }],
  totalRefundAmount: { type: Number, default: 0 },
  reason: { type: String, default: 'Customer Return' },
  restocked: { type: Boolean, default: true },
  processedBy: { type: String, default: 'Admin' }
}, { timestamps: true, strict: false })

export default mongoose.models.SaleReturn || mongoose.model('SaleReturn', saleReturnSchema)
