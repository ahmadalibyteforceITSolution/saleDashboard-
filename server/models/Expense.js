import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  voucherNo: { type: String, required: true },
  category: { type: String, required: true },
  branch: { type: String, default: 'Peshawar' },
  date: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  amount: { type: Number, required: true },
  paymentMode: { type: String, default: 'Cash Voucher' },
  bankCash: { type: String, default: '' },
  description: { type: String, default: '' },
  supportingRef: { type: String, default: '' },
  recordedBy: { type: String, default: 'Admin' }
}, { timestamps: true })

export default mongoose.model('Expense', expenseSchema)
