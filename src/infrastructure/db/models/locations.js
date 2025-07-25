import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  number_of_areas: {
    type: Number,
    required: true
  },
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  region: {
    type: String,
    required: true
  },
  generation: {
    type: String,
  }
}, { collection: 'locations' });

const Location = mongoose.models.Location || mongoose.model('Location', LocationSchema);
export default Location;