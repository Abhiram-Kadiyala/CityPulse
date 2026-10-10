import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { listIssues, getIssue, createIssue, updateIssue, deleteIssue } from '../controllers/issueController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';
import { UPLOAD_DIR } from '../config/paths.js';

const r = Router();
const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + (ALLOWED[file.mimetype] || path.extname(file.originalname).toLowerCase()))
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => ALLOWED[file.mimetype] ? cb(null, true) : cb(Object.assign(new Error('Photo must be a JPG, PNG or WebP image'), { status: 400 }))
});
// Surface multer/file-type errors as 400 instead of silently dropping the photo or returning 500.
const uploadPhoto = (req, res, next) => upload.single('photo')(req, res, err => {
  if (!err) return next();
  if (err.name === 'MulterError') return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'Photo must be 5 MB or smaller' : err.message });
  return res.status(err.status || 500).json({ message: err.status ? err.message : 'Upload failed' });
});

r.get('/', listIssues);
r.get('/:id', getIssue);
r.post('/', optionalAuth, uploadPhoto, createIssue);
r.patch('/:id', protect, adminOnly, updateIssue);
r.delete('/:id', protect, adminOnly, deleteIssue);
export default r;
