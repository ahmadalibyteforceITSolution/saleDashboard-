import mongoose from 'mongoose'

const paymentReceiptSchema = new mongoose.Schema({
  receiptNo: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  paymentDate: { type: String, required: true },
  paymentType: { type: String, enum: ['Cash Payment', 'Bank Payment'], required: true },
  amount: { type: Number, required: true },
  branch: { type: String, default: 'Peshawar' },
  division: { type: String, default: 'Medimage Services' },
  description: { type: String, default: '' },
  paidSerials: [{
    serialCode: String,
    machineCode: String,
    productName: String,
    amountAllocated: Number
  }],
  receivedBy: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('PaymentReceipt', paymentReceiptSchema)
