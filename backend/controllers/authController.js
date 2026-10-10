import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const tokenFor = u => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res){
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !EMAIL_RE.test(email) || password.length < 8 || password.length > 72)
      return res.status(400).json({ message: 'Name, a valid email and password (8–72 characters) are required' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ message: 'Email already registered' });
    res.status(500).json({ message: 'Could not register user' });
  }
}
export async function login(req, res){
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch { res.status(500).json({ message: 'Could not log in' }); }
}
export async function me(req, res){ res.json({ user: req.user }); }
