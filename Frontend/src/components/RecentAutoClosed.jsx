import { useEffect, useState } from 'react';
import API from '../services/api';
import { Clock, CheckCircle } from 'lucide-react';

export default function RecentAutoClosed() {
  const [closed, setClosed] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get('/alerts/auto-closed');
      setClosed(res.data);
    };
    fetch();
    const int = setInterval(fetch, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
        <CheckCircle /> Recent Auto-Closed Alerts
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {closed.length === 0 ? (
          <p className="text-gray-400">No auto-closed alerts yet</p>
        ) : (
          closed.map((a) => (
            <div key={a.alertId} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm text-cyan-300">{a.alertId.slice(0, 8)}...</p>
                  <p className="text-white font-medium">{a.sourceType.replace('_', ' ')}</p>
                  <p className="text-green-300 text-sm">Driver: {a.metadata.driverId}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{a.autoClosedReason}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(a.autoClosedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}