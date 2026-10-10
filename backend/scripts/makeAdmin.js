// Usage: npm run make-admin -- user@example.com
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
const email = (process.argv[2] || '').trim().toLowerCase();
if (!email) { console.error('Usage: npm run make-admin -- <email>'); process.exit(1); }
try {
  await mongoose.connect(process.env.MONGO_URI);
  const u = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  console.log(u ? `${u.email} is now an admin.` : `No user found with email ${email}. Register first.`);
} catch (e) { console.error(e.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
