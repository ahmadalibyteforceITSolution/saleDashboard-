import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  storageBin: { type: String, required: true, default: 'WH-GEN-01' },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stockQty: { type: Number, required: true, default: 0 },
  minStock: { type: Number, required: true, default: 5 },
  image: { type: String, default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80' }
}, { timestamps: true })

export default mongoose.model('Product', productSchema)
