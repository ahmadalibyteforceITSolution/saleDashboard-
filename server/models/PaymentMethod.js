import mongoose from 'mongoose'

const paymentMethodSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true, unique: true },
  type: { type: String, default: 'Bank Account' },
  branch: { type: String, default: 'All' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  strict: false
})

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema)
