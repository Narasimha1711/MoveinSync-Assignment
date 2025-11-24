import fs from 'fs';
import path from 'path';
import Alert from '../models/Alert.js';
import AlertHistory from '../models/AlertHistory.js';

const RULES = JSON.parse(fs.readFileSync('./src/config/rules.config.json', 'utf-8'));

export const evaluateEscalation = async (alert) => {
  const rule = RULES[alert.sourceType];
  if (!rule || !rule.escalate_if_count) return;

  const minutesAgo = new Date(Date.now() - rule.window_mins * 60 * 1000);

  const count = await Alert.countDocuments({
    driverId: alert.metadata.driverId,
    sourceType: alert.sourceType,
    createdAt: { $gte: minutesAgo },
    status: { $in: ['OPEN', 'ESCALATED'] }
  });

  if (count >= rule.escalate_if_count && alert.status !== 'ESCALATED') {
    alert.severity = rule.escalate_to || 'Critical';
    alert.status = 'ESCALATED';
    alert.escalatedAt = new Date();
    await alert.save();

    await AlertHistory.create({
      alertId: alert.alertId,
      fromStatus: 'OPEN',
      toStatus: 'ESCALATED',
      reason: `${rule.escalate_if_count} ${alert.sourceType} alerts in ${rule.window_mins} mins`,
      triggeredBy: 'rule-engine'
    });
  }
};