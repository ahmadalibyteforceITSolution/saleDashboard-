import mongoose from 'mongoose'

const paymentOutSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  voucherNo: { type: String, default: () => `VOUCH-${Date.now().toString().slice(-6)}` },
  payee: { type: String, default: 'General Payee' },
  category: { 
    type: String, 
    default: 'Operational Expense'
  },
  paymentDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  paymentType: { type: String, default: 'Cash' },
  amount: { type: Number, default: 0 },
  branch: { type: String, default: 'Peshawar' },
  division: { type: String, default: 'Medimage Services' },
  description: { type: String, default: '' },
  refInvoiceNo: { type: String, default: null },
  refSerialCode: { type: String, default: null },
  disbursedBy: { type: String, default: 'Admin' }
}, { timestamps: true, strict: false })

export default mongoose.model('PaymentOut', paymentOutSchema)

