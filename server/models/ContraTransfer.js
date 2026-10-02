import mongoose from 'mongoose'

const contraTransferSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  fromAccount: { type: String, required: true },
  toAccount: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  transferType: { type: String, default: 'Bank to Cash (Safe Replenishment)' },
  refNo: { type: String, default: '' },
  notes: { type: String, default: '' },
  transferredBy: { type: String, default: 'Admin' }
}, {
  timestamps: true,
  strict: false
})

export default mongoose.models.ContraTransfer || mongoose.model('ContraTransfer', contraTransferSchema)
