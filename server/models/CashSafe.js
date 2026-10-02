import mongoose from 'mongoose'

const cashSafeSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  custodian: { type: String, default: 'Cashier Desk' },
  branch: { type: String, default: 'Lahore' },
  location: { type: String, default: '' },
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 }
}, {
  timestamps: true,
  strict: false
})

export default mongoose.models.CashSafe || mongoose.model('CashSafe', cashSafeSchema)
