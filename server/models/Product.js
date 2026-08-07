import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  allocationCity: { type: String, required: true, default: 'Peshawar' },
  allocationCities: { type: [String], default: ['Peshawar', 'Multan', 'Lahore'] },
  storageBin: { type: String, required: true, default: 'HQ-MAIN-01' },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stockQty: { type: Number, required: true, default: 0 },
  minStock: { type: Number, required: true, default: 5 },
  hsnCode: { type: String, default: '9018.12' },
  taxRatio: { type: Number, default: 18 },
  division: { type: String, default: 'Medimage Services' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80' }
}, { timestamps: true })

export default mongoose.model('Product', productSchema)
