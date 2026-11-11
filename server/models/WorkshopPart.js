import mongoose from 'mongoose'

const workshopPartSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  partCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String },
  model: { type: String },
  category: { type: String, default: 'General Spare Parts' },
  stockQty: { type: Number, default: 0 },
  minQty: { type: Number, default: 2 },
  unitCost: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  location: { type: String, default: 'Workshop Rack A' },
  supplier: { type: String }
}, { timestamps: true, strict: false })

export default mongoose.model('WorkshopPart', workshopPartSchema)
