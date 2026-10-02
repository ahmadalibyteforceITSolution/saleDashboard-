import mongoose from 'mongoose'

const bankAccountSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  accountTitle: { type: String, default: 'Medimage Services Ltd' },
  accountNumber: { type: String, default: '' },
  bankCode: { type: String, default: 'HBL' },
  iban: { type: String, default: '' },
  branch: { type: String, default: 'Lahore' },
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 }
}, {
  timestamps: true,
  strict: false
})

export default mongoose.models.BankAccount || mongoose.model('BankAccount', bankAccountSchema)
