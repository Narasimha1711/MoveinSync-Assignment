// AlertTimeline.jsx
import { useState } from 'react';
import AlertModal from './AlertModal';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function AlertTimeline({ alerts }) {
  const [selectedAlert, setSelectedAlert] = useState(null);

  const getIcon = (severity) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="text-red-500" />;
      case 'Warning': return <AlertTriangle className="text-yellow-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  return (
    <>
      <div className="bg-gray-800 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Recent Alerts Timeline</h2>
        <div className="space-y-3">
          {alerts.slice(0, 10).map((alert) => (
            <div
              key={alert.alertId}
              onClick={() => setSelectedAlert(alert)}
              className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getIcon(alert.severity)}
                  <div>
                    <p className="font-medium">{alert.sourceType.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-400">Driver: {alert.metadata.driverId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    alert.status === 'ESCALATED' ? 'bg-red-900 text-red-300' :
                    alert.status === 'AUTO-CLOSED' ? 'bg-green-900 text-green-300' :
                    alert.status === 'RESOLVED' ? 'bg-blue-900 text-blue-300' :
                    'bg-yellow-900 text-yellow-300'
                  }`}>
                    {alert.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAlert && (
        <AlertModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </>
  );
}