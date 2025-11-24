// AlertModal.jsx
import { useEffect, useState } from 'react';
import API from '../services/api';

export default function AlertModal({ alert, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await API.get(`/alerts/${alert.alertId}/history`);
      setHistory(res.data);
    };
    fetchHistory();
  }, [alert.alertId]);

  const handleResolve = async () => {
    await API.patch(`/alerts/${alert.alertId}/resolve`);
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6">Alert Details</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400">Alert ID</p>
            <p className="font-mono text-cyan-300">{alert.alertId}</p>
          </div>
          <div>
            <p className="text-gray-400">Driver ID</p>
            <p class2 className="font-bold">{alert.metadata.driverId}</p>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-3">State Transition History</h3>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-600 p-3 rounded">
                <div>
                  <span className="font-bold text-yellow-400">{h.fromStatus || '—'}</span>
                  <span className="mx-2">→</span>
                  <span className="font-bold text-green-400">{h.toStatus}</span>
                </div>
                <div className="text-right text-sm">
                  <p>{h.reason || 'Created'}</p>
                  <p className="text-gray-400">
                    {new Date(h.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {alert.status !== 'RESOLVED' && alert.status !== 'AUTO-CLOSED' && (
          <button
            onClick={handleResolve}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          >
            Manually Resolve Alert
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}