import { useEffect, useState } from 'react';
import API from '../services/api';

export default function DashboardStats() {
  const [stats, setStats] = useState({ Critical: 0, Warning: 0, Info: 0 });

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get('/alerts/stats');
      setStats(res.data);
    };
    fetch();
    const int = setInterval(fetch, 10000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="bg-red-900 p-8 rounded-xl text-center">
        <h3 className="text-5xl font-bold">{stats.Critical}</h3>
        <p className="text-red-300 text-xl mt-2">Critical Alerts</p>
      </div>
      <div className="bg-yellow-900 p-8 rounded-xl text-center">
        <h3 className="text-5xl font-bold">{stats.Warning}</h3>
        <p className="text-yellow-300 text-xl mt-2">Warning Alerts</p>
      </div>
      <div className="bg-blue-900 p-8 rounded-xl text-center">
        <h3 className="text-5xl font-bold">{stats.Info}</h3>
        <p className="text-blue-300 text-xl mt-2">Info Alerts</p>
      </div>
    </div>
  );
}