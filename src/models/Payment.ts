import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'INR', 'GBP'],
    default: 'USD',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paidDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending',
  },
  planType: {
    type: String,
    enum: ['daily', 'monthly', 'yearly'],
    required: true,
  },
  dayType: {
    type: String,
    enum: ['full', 'half'],
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);