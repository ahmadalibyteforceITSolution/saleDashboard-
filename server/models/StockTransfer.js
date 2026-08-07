import mongoose from 'mongoose'

const stockTransferSchema = new mongoose.Schema({
  transferNo: { type: String, required: true, unique: true },
  transferDate: { type: String, required: true },
  fromBranch: { type: String, required: true },
  toBranch: { type: String, required: true },
  division: { type: String, default: 'Medimage Services' },
  serials: [{
    serialCode: String,
    machineCode: String,
    productName: String
  }],
  notes: { type: String, default: '' },
  transferredBy: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('StockTransfer', stockTransferSchema)
