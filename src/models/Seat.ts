import mongoose from 'mongoose';

const SeatSchema = new mongoose.Schema({
  seatNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['full', 'half-shared', 'vacant'],
    default: 'vacant',
  },
  fullDayStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  morningStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  eveningStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Seat || mongoose.model('Seat', SeatSchema);