import mongoose from 'mongoose';
export default async function connectDB(){
  if(!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
  if(!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
}
