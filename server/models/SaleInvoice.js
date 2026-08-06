import mongoose from 'mongoose'

const saleInvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  saleDate: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  items: [{
    productId: String,
    productName: String,
    qty: Number,
    unitPrice: Number,
    unitCost: Number,
    total: Number,
    serials: [String]
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  netProfit: { type: Number, required: true },
  marginPercent: { type: Number, required: true },
  sellerName: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('SaleInvoice', saleInvoiceSchema)
