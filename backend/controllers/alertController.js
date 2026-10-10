import Alert from '../models/Alert.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const pick = (src, keys) => Object.fromEntries(keys.filter(k => src[k] !== undefined).map(k => [k, src[k]]));
export const listAlerts = asyncHandler(async (req, res) => { res.json(await Alert.find().sort({ createdAt: -1 }).limit(200)); });
export const getAlert = asyncHandler(async (req, res) => {
  const a = await Alert.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Alert not found' });
  res.json(a);
});
export const createAlert = asyncHandler(async (req, res) => {
  // Whitelist fields: prevents callers from setting status/acknowledgedBy directly.
  const a = await Alert.create(pick(req.body, ['type', 'title', 'description', 'location', 'priority']));
  res.status(201).json(a);
});
export const updateAlert = asyncHandler(async (req, res) => {
  const patch = pick(req.body, ['status', 'priority', 'description', 'title']);
  if (patch.status === 'Acknowledged') patch.acknowledgedBy = req.user._id;
  const a = await Alert.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
  if (!a) return res.status(404).json({ message: 'Alert not found' });
  res.json(a);
});
