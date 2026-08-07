import mongoose from 'mongoose'

const saleInvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  branch: { type: String, default: 'Peshawar' },
  division: { type: String, default: 'Medimage Services' },
  saleDate: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  items: [{
    productId: String,
    productName: String,
    qty: Number,
    unitPrice: Number,
    unitCost: Number,
    hsnCode: String,
    taxRatio: Number,
    total: Number,
    serials: [String],
    machineCodes: [String]
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  taxRatio: { type: Number, default: 18 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  netProfit: { type: Number, required: true },
  marginPercent: { type: Number, required: true },
  sellerName: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('SaleInvoice', saleInvoiceSchema)
