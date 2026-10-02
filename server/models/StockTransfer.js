import mongoose from 'mongoose'

const stockTransferSchema = new mongoose.Schema({
  id: { type: String },
  transferNo: { type: String, default: () => `TR-${Date.now().toString().slice(-4)}` },
  transferDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  fromBranch: { type: String, default: 'Peshawar' },
  toBranch: { type: String, default: 'Lahore' },
  sourceBranch: { type: String, default: 'Peshawar' },
  destinationBranch: { type: String, default: 'Lahore' },
  division: { type: String, default: 'Medimage Services' },
  serials: [{
    serialCode: String,
    machineCode: String,
    productName: String
  }],
  notes: { type: String, default: '' },
  transferredBy: { type: String, default: 'Admin' }
}, { timestamps: true, strict: false })

export default mongoose.models.StockTransfer || mongoose.model('StockTransfer', stockTransferSchema)
