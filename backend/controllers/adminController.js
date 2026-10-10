import Issue from '../models/Issue.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const stats = asyncHandler(async (req, res) => {
  const [total, pending, inProgress, resolved, critical, activeAlerts, users] = await Promise.all([
    Issue.countDocuments(), Issue.countDocuments({ status: 'Pending' }), Issue.countDocuments({ status: 'In Progress' }),
    Issue.countDocuments({ status: 'Resolved' }), Issue.countDocuments({ priority: 'Critical' }),
    Alert.countDocuments({ status: 'Active' }), User.countDocuments()
  ]);
  res.json({ total, pending, inProgress, resolved, critical, activeAlerts, users });
});
