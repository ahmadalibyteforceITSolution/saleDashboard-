import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  user: { type: String, required: true },
  role: { type: String, required: true },
  category: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  severity: { type: String, default: 'normal' }
}, { timestamps: true })

export default mongoose.model('AuditLog', auditLogSchema)
