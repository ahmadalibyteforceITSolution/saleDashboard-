import mongoose from 'mongoose'

const purchaseOrderSchema = new mongoose.Schema({
  id: { type: String },
  poNumber: { type: String, required: true },
  blNumber: { type: String },
  supplier: { type: String, default: 'General Supplier' },
  supplierName: { type: String, default: 'General Supplier' },
  orderDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  status: { type: String, default: 'Completed' },
  branch: { type: String, default: 'Lahore' },
  allocationCity: { type: String, default: 'Lahore' },
  items: [{
    productId: String,
    productName: String,
    sku: String,
    qty: { type: Number, default: 1 },
    unitCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  }],
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  paymentType: { type: String, default: 'Cash Payment' },
  description: { type: String, default: '' },
  remarks: { type: String, default: '' },
  createdBy: { type: String, default: 'Admin' }
}, { timestamps: true, strict: false })

export default mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema)
