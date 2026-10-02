import mongoose from 'mongoose'

const paymentReceiptSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  receiptNo: { type: String, default: () => `RCP-${Date.now().toString().slice(-6)}` },
  customer: { type: String, default: 'General Customer' },
  paymentDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  paymentType: { type: String, default: 'Cash Payment' },
  amount: { type: Number, default: 0 },
  branch: { type: String, default: 'Peshawar' },
  division: { type: String, default: 'Medimage Services' },
  description: { type: String, default: '' },
  paidSerials: { type: Array, default: [] },
  receivedBy: { type: String, default: 'Admin' }
}, { timestamps: true, strict: false })

export default mongoose.model('PaymentReceipt', paymentReceiptSchema)

