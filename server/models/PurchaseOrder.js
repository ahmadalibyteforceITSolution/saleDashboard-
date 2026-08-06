import mongoose from 'mongoose'

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplier: { type: String, required: true },
  orderDate: { type: String, required: true },
  status: { type: String, required: true, default: 'Completed' },
  items: [{
    productId: String,
    productName: String,
    qty: Number,
    unitCost: Number,
    totalCost: Number
  }],
  totalAmount: { type: Number, required: true },
  createdBy: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('PurchaseOrder', purchaseOrderSchema)
