import mongoose from 'mongoose'

const expenseTourSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  tourName: { type: String, required: true },
  tourType: { type: String, default: 'International' }, // International, Local / Out of City
  person: { type: String, default: 'Director' },
  personRole: { type: String, default: 'Boss / Director' },
  country: { type: String, default: 'China' },
  city: { type: String, default: 'Guangzhou' },
  originCity: { type: String, default: 'Peshawar' },
  startDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  endDate: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  purpose: { type: String, default: 'Supplier/Company Meeting' },
  status: { type: String, default: 'Active' }, // Planned, Active, Completed, Closed
  budget: { type: Number, default: 0 },
  currency: { type: String, default: 'PKR' },
  branch: { type: String, default: 'Peshawar' },
  notes: { type: String, default: '' },
  recordedBy: { type: String, default: 'Admin' }
}, { timestamps: true, strict: false })

export default mongoose.model('ExpenseTour', expenseTourSchema)
