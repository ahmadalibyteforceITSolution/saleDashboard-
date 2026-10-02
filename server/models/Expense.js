import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  voucherNo: { type: String, default: () => `EXP-${Date.now().toString().slice(-6)}` },
  category: { type: String, default: 'General Expense' },
  branch: { type: String, default: 'Peshawar' },
  date: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  amount: { type: Number, default: 0 },
  paymentMode: { type: String, default: 'Cash Voucher' },
  bankCash: { type: String, default: '' },
  description: { type: String, default: '' },
  supportingRef: { type: String, default: '' },
  recordedBy: { type: String, default: 'Admin' }
}, { timestamps: true, strict: false })

export default mongoose.model('Expense', expenseSchema)

