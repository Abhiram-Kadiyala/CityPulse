import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { UPLOAD_DIR } from './config/paths.js';

const app = express();
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOAD_DIR, { setHeaders: res => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin') }));
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'CityPulse API' }));
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.name === 'MulterError') return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'Photo must be 5 MB or smaller' : err.message });
  if (err.status === 400 || err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid request body' });
  if (err.status === 413) return res.status(413).json({ message: 'Request too large' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`CityPulse API listening on ${port}`)))
  .catch(e => { console.error('Startup failed:', e.message); process.exit(1); });
