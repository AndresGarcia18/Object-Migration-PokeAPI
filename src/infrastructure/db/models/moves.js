import mongoose from 'mongoose';

const MoveSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  pp: {
    type: Number,
    required: true,
  },
  power: {
    type: Number,
  }
}, { collection: 'moves' });

const Move = mongoose.models.Move || mongoose.model('Move', MoveSchema);
export default Move;