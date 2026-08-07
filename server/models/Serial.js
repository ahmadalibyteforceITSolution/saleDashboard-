import mongoose from 'mongoose'

const serialSchema = new mongoose.Schema({
  serialCode: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  sku: { type: String, required: true },
  status: { type: String, required: true, enum: ['Available', 'Sold', 'Reserved', 'Defective', 'Transferred', 'Returned'], default: 'Available' },
  allocationCity: { type: String, required: true, default: 'Peshawar' },
  binLocation: { type: String, required: true, default: 'HQ-MAIN-01' },
  registeredDate: { type: String, required: true },
  soldDate: { type: String, default: null },
  customer: { type: String, default: null },
  invoiceNo: { type: String, default: null },
  machineCode: { type: String, required: true },
  division: { type: String, default: 'Medimage Services' },
  hsnCode: { type: String, default: '9018.12' },
  taxRatio: { type: Number, default: 18 },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partially Paid'], default: 'Pending' },
  salePrice: { type: Number, default: 0 },
  purchaseInvoiceNo: { type: String, default: null },
  purchaseDate: { type: String, default: null },
  paymentReceiptNo: { type: String, default: null },
  paymentDate: { type: String, default: null },
  paymentAmount: { type: Number, default: 0 },
  paymentNotes: { type: String, default: '' },
  returnDate: { type: String, default: null },
  returnInvoiceNo: { type: String, default: null }
}, { timestamps: true })

export default mongoose.model('Serial', serialSchema)
