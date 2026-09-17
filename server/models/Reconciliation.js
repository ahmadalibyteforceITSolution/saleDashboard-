import mongoose from 'mongoose'

const reconciliationSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  entryNo: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  accountantName: { type: String, default: 'Accountant' },
  containerNo: { type: String, default: '' },
  companyName: { type: String, default: '' },
  formAmount: { type: Number, default: 0 },
  productSoldValue: { type: Number, default: 0 },
  cogsCostValue: { type: Number, default: 0 },
  paymentInflowCollected: { type: Number, default: 0 },
  variance: { type: Number, default: 0 },
  destinationCity: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, default: 'Pending Audit' },
  verifiedBy: { type: String, default: null },
  verifiedDate: { type: String, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model('Reconciliation', reconciliationSchema)
