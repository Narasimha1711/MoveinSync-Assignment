import Alert from '../models/Alert.js';
import AlertHistory from '../models/AlertHistory.js';
import fs from 'fs';

const RULES = JSON.parse(fs.readFileSync('./src/config/rules.config.json', 'utf-8'));

export const runAutoCloseJob = async () => {
  console.log('Running auto-close job...');
  const alerts = await Alert.find({ status: { $in: ['OPEN', 'ESCALATED'] } });

  for (const alert of alerts) {
    const rule = RULES[alert.sourceType];

    let shouldClose = false;
    let reason = '';

    if (rule?.auto_close_if === 'document_renewed' && alert.metadata.document_renewed === true) {
      shouldClose = true;
      reason = 'Document renewed';
    }

    if (rule?.expire_after_hours) {
      const hoursOld = (Date.now() - alert.createdAt) / (1000 * 60 * 60);
      if (hoursOld > rule.expire_after_hours) {
        shouldClose = true;
        reason = 'Time window expired';
      }
    }

    if (shouldClose && alert.status !== 'AUTO-CLOSED') {
      alert.status = 'AUTO-CLOSED';
      alert.autoClosedAt = new Date();
      alert.autoClosedReason = reason;
      await alert.save();

      await AlertHistory.create({
        alertId: alert.alertId,
        fromStatus: alert.status,
        toStatus: 'AUTO-CLOSED',
        reason,
        triggeredBy: 'background-job'
      });
    }
  }
};