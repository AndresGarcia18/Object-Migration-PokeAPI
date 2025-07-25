import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  step: { type: String, required: true },
  status: { type: String, enum: ['error'], default: 'error' },
  message: { type: String },
  error: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Log', logSchema); 