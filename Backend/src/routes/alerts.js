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
router.get('/:alertId/history', getAlertHistory);
router.patch('/:alertId/resolve', resolveAlertManually);


export default router;