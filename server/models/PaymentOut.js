import mongoose from 'mongoose'

const paymentOutSchema = new mongoose.Schema({
  voucherNo: { type: String, required: true, unique: true },
  payee: { type: String, required: true },
  category: { 
    type: String, 
    default: 'Operational Expense'
  },
  paymentDate: { type: String, required: true },
  paymentType: { type: String, required: true },
  amount: { type: Number, required: true },
  branch: { type: String, default: 'Peshawar' },
  division: { type: String, default: 'Medimage Services' },
  description: { type: String, default: '' },
  refInvoiceNo: { type: String, default: null },
  refSerialCode: { type: String, default: null },
  disbursedBy: { type: String, required: true }
}, { timestamps: true, strict: false })

export default mongoose.model('PaymentOut', paymentOutSchema)
