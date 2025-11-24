import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  alertId: { type: String, required: true },
  fromStatus: String,
  toStatus: String,
  reason: String,
  triggeredBy: String
}, { timestamps: true });

export default mongoose.model('AlertHistory', historySchema);