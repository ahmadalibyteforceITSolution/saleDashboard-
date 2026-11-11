import mongoose from 'mongoose'

const recycleBinSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  recordType: { type: String, required: true },
  recordId: { type: String, required: true },
  title: { type: String, default: '' },
  details: { type: String, default: '' },
  originalData: { type: Object, required: true },
  deletedBy: { type: String, default: 'Admin' },
  deletedAt: { type: String, default: () => new Date().toISOString() },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('RecycleBin', recycleBinSchema)
