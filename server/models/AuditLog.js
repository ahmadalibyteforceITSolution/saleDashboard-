import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  id: { type: String },
  timestamp: { type: String, default: () => new Date().toISOString().replace('T', ' ').substring(0, 19) },
  user: { type: String, default: 'System' },
  role: { type: String, default: 'admin' },
  category: { type: String, default: 'GENERAL' },
  action: { type: String, default: 'System Action' },
  details: { type: String, default: '' },
  severity: { type: String, default: 'normal' },
  read: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true, strict: false })

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)
