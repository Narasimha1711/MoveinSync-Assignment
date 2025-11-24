import { useEffect, useState } from 'react';
import API from '../services/api';

export default function TopOffenders() {
  const [offenders, setOffenders] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get('/alerts/top-offenders');
      setOffenders(res.data);
    };
    fetch();
    const int = setInterval(fetch, 15000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-orange-400">Top 5 Offenders</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 border-b">
            <th>Rank</th>
            <th>Driver ID</th>
            <th>Open Alerts</th>
          </tr>
        </thead>
        <tbody>
          {offenders.map((o, i) => (
            <tr key={o._id} className="border-b border-gray-700">
              <td className="py-3">#{i + 1}</td>
              <td className="font-mono">{o._id}</td>
              <td className="text-red-400 font-bold">{o.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}