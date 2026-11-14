import mongoose from 'mongoose'

const expenseCategorySchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  type: { type: String, default: 'General' }, // Travel, Office, Meetings, Vehicle, Technical, Marketing, Financial, General
  icon: { type: String, default: 'Tag' },
  color: { type: String, default: 'indigo' },
  subCategories: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isPredefined: { type: Boolean, default: false },
  createdBy: { type: String, default: 'System' }
}, { timestamps: true, strict: false })

export default mongoose.model('ExpenseCategory', expenseCategorySchema)
