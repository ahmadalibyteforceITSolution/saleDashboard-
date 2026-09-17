import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  category: { type: String, default: 'REGULAR' },
  branch: { type: String, default: 'Peshawar' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  baseCreditLimit: { type: Number, default: 2000000 },
  paymentDays: { type: Number, default: 30 },
  status: { type: String, enum: ['active', 'locked'], default: 'active' },
  lockReason: { type: String, default: '' },
  overrides: { type: Array, default: [] },
  notes: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model('Customer', customerSchema)
