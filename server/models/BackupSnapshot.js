import mongoose from 'mongoose'

const backupSnapshotSchema = new mongoose.Schema({
  backupId: { type: String, required: true, unique: true },
  title: { type: String, default: 'Manual System Backup' },
  timestamp: { type: String, default: () => new Date().toISOString() },
  createdAt: { type: Date, default: Date.now },
  totalCollections: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
  sizeBytes: { type: Number, default: 0 },
  createdBy: { type: String, default: 'SuperAdmin' },
  status: { type: String, default: 'Active' },
  collectionsSummary: { type: Object, default: {} },
  snapshotData: { type: Object, default: {} }
})

export default mongoose.model('BackupSnapshot', backupSnapshotSchema)
