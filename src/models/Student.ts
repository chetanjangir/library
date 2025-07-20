import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  joinDate: {
    type: Date,
    default: Date.now,
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
  halfDaySlot: {
    type: String,
    enum: ['morning', 'evening'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
  },
  seatNumber: {
    type: Number,
  },
  subscriptionEndDate: {
    type: Date,
    required: true,
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'INR', 'GBP'],
    default: 'USD',
  },
  monthlyAmount: {
    type: Number,
    required: true,
  },
  halfDayAmount: {
    type: Number,
    required: true,
  },
  fullDayAmount: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);