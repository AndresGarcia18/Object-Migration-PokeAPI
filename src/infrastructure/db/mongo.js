
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectMongo;