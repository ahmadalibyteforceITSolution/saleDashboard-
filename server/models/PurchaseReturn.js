import mongoose from 'mongoose'

const purchaseReturnSchema = new mongoose.Schema({
  id: { type: String },
  returnNo: { type: String, default: () => `PR-${Date.now().toString().slice(-4)}` },
  debitNoteNo: { type: String, default: () => `DRN-${Date.now().toString().slice(-4)}` },
  blNumber: { type: String, default: '' },
  supplier: { type: String, default: 'General Supplier' },
  branch: { type: String, default: 'Peshawar' },
  returnDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  items: [{
    productId: String,
    productName: String,
    sku: String,
    qty: { type: Number, default: 1 },
    unitCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    serials: [String],
    machineCodes: [String],
    reason: { type: String, default: 'Supplier Return' }
  }],
  totalReturnAmount: { type: Number, default: 0 },
  reason: { type: String, default: 'Supplier Equipment Return' },
  status: { type: String, default: 'Approved' },
  refundStatus: { type: String, default: 'Adjusted in Supplier Ledger' },
  notes: { type: String, default: '' },
  processedBy: { type: String, default: 'Admin' }
}, { timestamps: true, strict: false })

export default mongoose.models.PurchaseReturn || mongoose.model('PurchaseReturn', purchaseReturnSchema)
