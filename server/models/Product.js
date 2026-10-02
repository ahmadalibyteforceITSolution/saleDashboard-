import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  sku: { type: String, default: () => `MED-${Date.now().toString().slice(-4)}`, uppercase: true },
  name: { type: String, default: 'Medical Equipment' },
  category: { type: String, default: 'Medical Equipment' },
  allocationCity: { type: String, default: 'Peshawar' },
  allocationCities: { type: [String], default: ['Peshawar', 'Multan', 'Lahore'] },
  storageBin: { type: String, default: 'HQ-MAIN-01' },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  stockQty: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  hsnCode: { type: String, default: '9018.12' },
  taxRatio: { type: Number, default: 18 },
  division: { type: String, default: 'Medimage Services' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80' },
  containerNo: { type: String, default: null },
  companyName: { type: String, default: null },
  containerPrefix: { type: String, default: null },
  barcode: { type: String, default: null },
  addedBy: { type: String, default: 'Admin' },
  addedRole: { type: String, default: 'admin' }
}, { timestamps: true, strict: false })

export default mongoose.model('Product', productSchema)
