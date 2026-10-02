import mongoose from 'mongoose'

const saleInvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  customer: { type: String, default: 'General Customer' },
  branch: { type: String, default: 'Lahore' },
  division: { type: String, default: 'Medimage Services' },
  saleDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  deliveryDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  deliveryStatus: { type: String, default: 'Delivered' },
  paymentMethod: { type: String, default: 'Cash Payment' },
  paymentType: { type: String, default: 'Cash Payment' },
  paymentStatus: { type: String, default: 'Unpaid' },
  paidAmount: { type: Number, default: 0 },
  outstandingBalance: { type: Number, default: 0 },
  items: [{
    productId: String,
    productName: String,
    sku: String,
    productCode: String,
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    hsnCode: String,
    taxRatio: { type: Number, default: 18 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    serials: [String],
    machineCodes: [String]
  }],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  taxRatio: { type: Number, default: 18 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  marginPercent: { type: Number, default: 0 },
  sellerName: { type: String, default: 'Sales Officer' },
  salesPerson: { type: String, default: 'Sales Officer' },
  blNumber: { type: String, default: '' },
  previousBalance: { type: Number, default: 0 },
  currentInvoiceAmount: { type: Number, default: 0 },
  paymentReceived: { type: Number, default: 0 },
  finalOutstandingBalance: { type: Number, default: 0 }
}, { timestamps: true, strict: false })

export default mongoose.models.SaleInvoice || mongoose.model('SaleInvoice', saleInvoiceSchema)
