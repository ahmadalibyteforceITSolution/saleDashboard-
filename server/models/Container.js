import mongoose from 'mongoose'

const containerSchema = new mongoose.Schema({
  id: { type: String },
  containerNo: { type: String, required: true },
  blNumber: { type: String },
  blDate: { type: String },
  companyName: { type: String, default: 'General Supplier' },
  supplierName: { type: String, default: 'General Supplier' },
  codePrefix: { type: String, default: 'BL-' },
  status: { type: String, default: 'In Stock' },
  blStatus: { type: String, default: 'In Process' },
  arrivalDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  receivingDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  destinationCity: { type: String, default: 'Lahore' },
  branch: { type: String, default: 'Lahore' },
  shipmentDetails: { type: String, default: 'Warehouse Consignment' },
  notes: { type: String, default: '' },
  description: { type: String, default: '' },
  createdBy: { type: String, default: 'Admin' },
  creatorRole: { type: String, default: 'admin' },
  items: [{
    name: String,
    productName: String,
    category: { type: String, default: 'Medical Equipment' },
    sku: String,
    productCode: String,
    quantity: { type: Number, default: 1 },
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    barcode: { type: String, default: null },
    serials: [{ type: String }]
  }],
  directExpenses: {
    customsDuty: { type: Number, default: 0 },
    freightPort: { type: Number, default: 0 },
    demurrageLanding: { type: Number, default: 0 },
    totalDirect: { type: Number, default: 0 }
  },
  indirectExpenses: {
    transportation: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    warehousingMisc: { type: Number, default: 0 },
    totalIndirect: { type: Number, default: 0 }
  },
  basePurchaseCost: { type: Number, default: 0 },
  purchaseCost: { type: Number, default: 0 },
  landingCost: { type: Number, default: 0 },
  totalCostValue: { type: Number, default: 0 },
  totalRetailValue: { type: Number, default: 0 },
  totalUnits: { type: Number, default: 0 },
  serialNumbers: [{ type: String }]
}, { timestamps: true, strict: false })

export default mongoose.models.Container || mongoose.model('Container', containerSchema)
