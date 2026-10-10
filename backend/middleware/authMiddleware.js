import jwt from 'jsonwebtoken';
import User from '../models/User.js';

async function userFromRequest(req){
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.id).select('_id name email role');
}
export async function protect(req, res, next){
  try {
    if (!(req.headers.authorization || '').trim()) return res.status(401).json({ message: 'Authentication required' });
    req.user = await userFromRequest(req);
    if (!req.user) return res.status(401).json({ message: 'Account not found' });
    next();
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}
// Attaches req.user when a valid token is present, but never blocks the request.
export async function optionalAuth(req, res, next){
  try { req.user = await userFromRequest(req); } catch { req.user = null; }
  next();
}
export function adminOnly(req, res, next){
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required' });
  next();
}
