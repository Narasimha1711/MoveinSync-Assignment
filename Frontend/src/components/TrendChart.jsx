import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Mock data for demo (in real project, fetch from backend with daily aggregation)
    setData([
      { day: 'Mon', total: 12, escalated: 3, closed: 8 },
      { day: 'Tue', total: 19, escalated: 5, closed: 12 },
      { day: 'Wed', total: 15, escalated: 7, closed: 10 },
      { day: 'Thu', total: 25, escalated: 9, closed: 14 },
      { day: 'Fri', total: 30, escalated: 12, closed: 16 },
      { day: 'Sat', total: 18, escalated: 4, closed: 15 },
      { day: 'Sun', total: 10, escalated: 2, closed: 9 },
    ]);
  }, []);

  return (
    <div className="bg-gray-800 p-8 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-purple-400">Alert Trends (Last 7 Days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="day" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#60a5fa" name="Total Alerts" strokeWidth={3} />
          <Line type="monotone" dataKey="escalated" stroke="#f87171" name="Escalated" strokeWidth={3} />
          <Line type="monotone" dataKey="closed" stroke="#34d399" name="Auto-Closed" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}