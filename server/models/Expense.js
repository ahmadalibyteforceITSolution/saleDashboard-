import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  voucherNo: { type: String, default: () => `EXP-${Date.now().toString().slice(-6)}` },
  date: { type: String, default: () => new Date().toISOString().substring(0, 10) },
  
  // Categorization
  category: { type: String, default: 'General Expense' },
  subCategory: { type: String, default: '' },
  
  // Person / Employee Tracking
  person: { type: String, default: 'Director' },
  personRole: { type: String, default: 'Boss / Director' },
  
  // Tour / Visit Link (optional)
  tourId: { type: String, default: '' },
  tourName: { type: String, default: '' },
  
  // Purpose & Details
  purpose: { type: String, default: '' },
  description: { type: String, default: '' },
  vendor: { type: String, default: '' }, // Supplier / Vendor / Payee
  
  // Financial & Multi-Currency
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'PKR' }, // PKR, USD, EUR, CNY, AED, SAR, GBP
  exchangeRate: { type: Number, default: 1 },
  pkrAmount: { type: Number, default: 0 }, // Auto computed: amount * exchangeRate
  
  // Payment Integration
  paymentMethod: { type: String, default: 'Cash' }, // Cash, Bank Account, Credit Card, Paid by Employee
  bankAccount: { type: String, default: '' },
  paymentMode: { type: String, default: 'Cash Voucher' }, // Backward compatibility
  bankCash: { type: String, default: '' },
  referenceNo: { type: String, default: '' },
  
  // Employee Reimbursement Tracking
  isEmployeeReimbursement: { type: Boolean, default: false },
  reimbursementStatus: { type: String, default: 'None' }, // None, Pending, Reimbursed
  reimbursedDate: { type: String, default: '' },
  reimbursedFrom: { type: String, default: '' },
  
  // Organizational Hierarchy
  branch: { type: String, default: 'Peshawar' },
  department: { type: String, default: 'Management / Executive' },
  
  // Approval System
  status: { type: String, default: 'Approved' }, // Draft, Submitted, Approved, Paid, Posted, Rejected
  approvedBy: { type: String, default: 'Admin' },
  approvedAt: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  
  // Attachments & Notes
  attachment: { type: String, default: '' }, // Base64 or URL
  attachmentName: { type: String, default: '' },
  attachmentType: { type: String, default: '' }, // image/png, application/pdf, etc.
  remarks: { type: String, default: '' },
  supportingRef: { type: String, default: '' },
  
  // Accounting / Ledger Voucher
  journalVoucherNo: { type: String, default: '' },
  recordedBy: { type: String, default: 'Admin' }
}, { timestamps: true, strict: false })

export default mongoose.model('Expense', expenseSchema)
