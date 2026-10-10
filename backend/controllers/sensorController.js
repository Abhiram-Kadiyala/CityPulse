import Sensor from '../models/Sensor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const demo = [
  { type: 'Water level', value: 62, unit: '%', location: 'Musi river monitoring demo', status: 'Warning', demo: true },
  { type: 'Air quality', value: 84, unit: 'AQI', location: 'Central Hyderabad demo', status: 'Warning', demo: true },
  { type: 'Rainfall', value: 18, unit: 'mm/hr', location: 'Hyderabad demo', status: 'Normal', demo: true },
  { type: 'Traffic', value: 71, unit: '%', location: 'HITEC City demo', status: 'Warning', demo: true },
  { type: 'Garbage collection', value: 89, unit: '%', location: 'Secunderabad demo', status: 'Normal', demo: true }
];
export async function listSensors(req, res){
  try { const saved = await Sensor.find().sort({ observedAt: -1 }).limit(100); res.json(saved.length ? saved : demo); }
  catch { res.json(demo); }
}
export const getSensor = asyncHandler(async (req, res) => {
  const s = await Sensor.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Sensor not found' });
  res.json(s);
});
