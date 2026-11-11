import mongoose from 'mongoose'

const workshopInwardSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  inwardNo: { type: String, required: true, unique: true },
  date: { type: String },
  receivingDate: { type: String },
  supplier: { type: String },
  purchaseInvoice: { type: String },
  blRef: { type: String },
  items: { type: Array, default: [] },
  totalCost: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true, strict: false })

export default mongoose.model('WorkshopInward', workshopInwardSchema)
