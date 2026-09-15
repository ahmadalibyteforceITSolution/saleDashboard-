import mongoose from 'mongoose'

const containerItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Medical Equipment' },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  costPrice: { type: Number, required: true, default: 0 },
  sellingPrice: { type: Number, required: true, default: 0 },
  barcode: { type: String, default: null },
  serials: [{ type: String }]
}, { _id: false })

const containerSchema = new mongoose.Schema({
  containerNo: { type: String, required: true, unique: true, uppercase: true },
  companyName: { type: String, required: true },
  codePrefix: { type: String, required: true, uppercase: true },
  status: { type: String, enum: ['Arrived', 'In Inspection', 'In Stock', 'Cleared'], default: 'Arrived' },
  arrivalDate: { type: String, required: true },
  destinationCity: { type: String, default: 'Peshawar' },
  notes: { type: String, default: '' },
  createdBy: { type: String, default: 'Accountant' },
  items: [containerItemSchema],
  totalCostValue: { type: Number, default: 0 },
  totalRetailValue: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Container', containerSchema)
