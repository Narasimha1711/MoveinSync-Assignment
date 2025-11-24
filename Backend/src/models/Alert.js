import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  alertId: { type: String, unique: true, required: true },
  sourceType: { type: String, required: true },
  severity: { type: String, enum: ['Info', 'Warning', 'Critical'], default: 'Info' },
  status: { 
    type: String, 
    enum: ['OPEN', 'ESCALATED', 'AUTO-CLOSED', 'RESOLVED'],
    default: 'OPEN'
  },
  metadata: { type: mongoose.Schema.Types.Mixed, required: true },
  driverId: { type: String, required: true },
  escalatedAt: Date,
  autoClosedAt: Date,
  autoClosedReason: String
}, { timestamps: true });

export default mongoose.model('Alert', alertSchema);