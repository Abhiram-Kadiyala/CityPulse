import fs from 'fs';
import path from 'path';
import Issue from '../models/Issue.js';
import { UPLOAD_DIR } from '../config/paths.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const removeUpload = p => { if (p) fs.unlink(path.join(UPLOAD_DIR, path.basename(p)), () => {}); };

export const listIssues = asyncHandler(async (req, res) => {
  const q = {};
  // String() blocks NoSQL operator injection such as ?status[$ne]=x
  for (const k of ['category', 'priority', 'status']) if (req.query[k]) q[k] = String(req.query[k]);
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(String(req.query.search).slice(0, 80)), 'i');
    q.$or = [{ title: rx }, { location: rx }];
  }
  res.json(await Issue.find(q).sort({ createdAt: -1 }).limit(500).populate('reportedBy', 'name'));
});
export const getIssue = asyncHandler(async (req, res) => {
  const item = await Issue.findById(req.params.id).populate('reportedBy', 'name');
  if (!item) return res.status(404).json({ message: 'Issue not found' });
  res.json(item);
});
export async function createIssue(req, res, next){
  const photoPath = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    const { title, category, description, location, lat, lng, priority, contactPhone } = req.body;
    const latN = Number(lat), lngN = Number(lng);
    if (!title || !category || !description || !location || lat === '' || lng === '' || lat == null || lng == null || !Number.isFinite(latN) || !Number.isFinite(lngN)) {
      removeUpload(photoPath);
      return res.status(400).json({ message: 'Please complete all required fields and choose a map location' });
    }
    const item = await Issue.create({
      title, category, description, location, coordinates: { lat: latN, lng: lngN },
      priority: priority || 'Medium', contactPhone: contactPhone || undefined, photoPath, reportedBy: req.user?._id
    });
    const out = item.toObject();
    delete out.contactPhone; // never echo the private phone number
    res.status(201).json(out);
  } catch (e) {
    removeUpload(photoPath);
    if (e.name === 'ValidationError') return res.status(400).json({ message: e.message });
    next(e);
  }
}
export const updateIssue = asyncHandler(async (req, res) => {
  const allowed = {};
  for (const k of ['status', 'priority', 'category', 'adminNotes']) if (req.body[k] !== undefined) allowed[k] = req.body[k];
  const item = await Issue.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Issue not found' });
  res.json(item);
});
export const deleteIssue = asyncHandler(async (req, res) => {
  const item = await Issue.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Issue not found' });
  removeUpload(item.photoPath);
  res.json({ message: 'Issue deleted' });
});
