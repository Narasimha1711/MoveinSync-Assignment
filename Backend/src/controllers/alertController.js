import { v4 as uuidv4 } from 'uuid';
import Alert from '../models/Alert.js';
import AlertHistory from '../models/AlertHistory.js';
import { evaluateEscalation } from '../services/ruleEngine.js';
import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';

export const createAlert = async (req, res) => {
  try {
    const { sourceType, severity = 'Info', metadata } = req.body;
    const driverId = metadata.driverId;

    const alert = await Alert.create({
      alertId: uuidv4(),
      sourceType,
      severity,
      metadata,
      driverId
    });

    await AlertHistory.create({
      alertId: alert.alertId,
      fromStatus: null,
      toStatus: 'OPEN',
      reason: 'Alert created',
      triggeredBy: req.user.id
    });

    await evaluateEscalation(alert);

    // Invalidate cache
    await redisClient.del('dashboard_stats');
    await redisClient.del('top_offenders');

    logger.info('Alert created', { alertId: alert.alertId });
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    logger.error('Create alert failed', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const cached = await redisClient.get('dashboard_stats');
    if (cached) return res.json(JSON.parse(cached));

    const stats = await Alert.aggregate([
      { $match: { status: { $in: ['OPEN', 'ESCALATED'] } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    const result = { Critical: 0, Warning: 0, Info: 0 };
    stats.forEach(s => result[s._id] = s.count);

    await redisClient.setEx('dashboard_stats', 60, JSON.stringify(result));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTopOffenders = async (req, res) => {
  try {
    const cached = await redisClient.get('top_offenders');
    if (cached) return res.json(JSON.parse(cached));

    const top = await Alert.aggregate([
      { $match: { status: { $in: ['OPEN', 'ESCALATED'] } } },
      { $group: { _id: '$driverId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    await redisClient.setEx('top_offenders', 300, JSON.stringify(top));
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRecentAutoClosed = async (req, res) => {
  const alerts = await Alert.find({ status: 'AUTO-CLOSED' })
    .sort({ autoClosedAt: -1 })
    .limit(10)
    .select('alertId sourceType autoClosedReason autoClosedAt metadata');
  res.json(alerts);
};

export const getAlertHistory = async (req, res) => {
  const history = await AlertHistory.find({ alertId: req.params.alertId })
    .sort({ createdAt: 1 });
  res.json(history);
};

export const resolveAlertManually = async (req, res) => {
  const alert = await Alert.findOne({ alertId: req.params.alertId });
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  alert.status = 'RESOLVED';
  alert.resolvedAt = new Date();
  await alert.save();

  await AlertHistory.create({
    alertId: alert.alertId,
    fromStatus: 'ESCALATED',
    toStatus: 'RESOLVED',
    reason: 'Manual resolution',
    triggeredBy: req.user.id
  });

  res.json({ message: 'Alert resolved manually' });
};