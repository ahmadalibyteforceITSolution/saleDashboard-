import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['superadmin', 'admin', 'manager'], default: 'manager' },
  title: { type: String, default: 'Team Member' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80' },
  status: { type: String, default: 'Active' }
}, { timestamps: true })

export default mongoose.model('User', userSchema)
