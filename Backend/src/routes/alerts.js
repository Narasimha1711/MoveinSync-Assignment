import express from 'express';
import { createAlert, getDashboardStats, getTopOffenders, getRecentAutoClosed, getAlertHistory, resolveAlertManually } from '../controllers/alertController.js';
import { protect } from '../middleware/auth.js';
import { validateAlert } from '../middleware/validate.js';
import Alert from '../models/Alert.js';
const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/', validateAlert, createAlert);
router.get('/stats', getDashboardStats);
router.get('/top-offenders', getTopOffenders);
router.get('/auto-closed', getRecentAutoClosed);
// REAL DAILY TRENDS FROM MONGODB
router.get('/trends', async (req, res) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
      const trends = await Alert.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: 1 },
            escalated: { $sum: { $cond: [{ $eq: ["$status", "ESCALATED"] }, 1, 0] } },
            closed: { $sum: { $cond: [{ $in: ["$status", ["AUTO-CLOSED", "RESOLVED"]] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: {
              $dateToString: { format: "%b %d", date: { $dateFromString: { dateString: "$_id" } } }
            },
            total: 1,
            escalated: 1,
            closed: 1
          }
        }
      ]);
  
      res.json(trends);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
router.get('/:alertId/history', getAlertHistory);
router.patch('/:alertId/resolve', resolveAlertManually);


export default router;