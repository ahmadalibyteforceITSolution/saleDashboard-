import mongoose from 'mongoose'

const saleReturnSchema = new mongoose.Schema({
  returnNo: { type: String, required: true, unique: true },
  invoiceNo: { type: String, required: true },
  customer: { type: String, required: true },
  branch: { type: String, default: 'Peshawar' },
  division: { type: String, default: 'Medimage Services' },
  returnDate: { type: String, required: true },
  items: [{
    productId: String,
    productName: String,
    qty: Number,
    unitPrice: Number,
    serials: [String],
    machineCodes: [String]
  }],
  totalRefundAmount: { type: Number, required: true },
  reason: { type: String, default: 'Customer Return' },
  restocked: { type: Boolean, default: true },
  processedBy: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('SaleReturn', saleReturnSchema)
