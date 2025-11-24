import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ Critical: 0, Warning: 0, Info: 0 });
  const [topOffenders, setTopOffenders] = useState([]);
  const [autoClosed, setAutoClosed] = useState([]);
  const [filter, setFilter] = useState('24h'); // 24h or 7d
  const [trendData, setTrendData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [rules, setRules] = useState({});
  const { logout } = useAuth();

  const fetchAll = async () => {
    try {
      const [s, t, a, alerts, trend] = await Promise.all([
        API.get('/alerts/stats'),
        API.get('/alerts/top-offenders'),
        API.get('/alerts/auto-closed'),
        API.get('/alerts'),
        fetchTrendData()
      ]);
      setStats(s.data);
      setTopOffenders(t.data);
      setAutoClosed(a.data);
      setRecentAlerts(alerts.data);
      setTrendData(trend);
    } catch (err) { }
  };

  const fetchTrendData = async () => {
    // Mock daily trend (replace with real aggregation in production)
    try {
        const res = await API.get('/alerts/trends'); // NEW ENDPOINT
        return res.data; // Returns array like [{date: "2025-11-20", total: 45, escalated: 8, closed: 30}, ...]
      } catch {
        return []; // fallback
      }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    fetch('http://localhost:5001/rules.config.json')
      .then(r => r.json())
      .then(setRules);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      const trend = await fetchTrendData();
      setTrendData(trend.length > 0 ? trend : [
        { date: 'No Data', total: 0, escalated: 0, closed: 0 }
      ]);
    };
    load();
    const int = setInterval(load, 10000);
    return () => clearInterval(int);
  })

  const openDetails = async (alert) => {
    setSelectedAlert(alert);
    const res = await API.get(`/alerts/${alert.alertId}/history`);
    setAlertHistory(res.data);
  };

  const resolveAlert = async () => {
    await API.patch(`/alerts/${selectedAlert.alertId}/resolve`);
    setSelectedAlert(null);
    fetchAll();
  };

  const filteredClosed = autoClosed.filter(a => {
    const hours = (Date.now() - new Date(a.autoClosedAt)) / 3600000;
    return filter === '24h' ? hours <= 24 : hours <= 168;
  });

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Segoe UI' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '34px', color: '#1e40af', fontWeight: 'bold' }}>
          Intelligent Alert Escalation System
        </h1>
        <button onClick={logout} style={{ padding: '12px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px' }}>
          Logout
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
        {['Critical', 'Warning', 'Info'].map((s, i) => (
          <div key={s} style={{ background: ['#fee2e2', '#fef3c7', '#dbeafe'][i], padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '56px', color: ['#dc2626', '#d97706', '#2563eb'][i] }}>{stats[s] || 0}</h2>
            <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{s} Alerts</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        {/* Top Offenders */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '26px', color: '#dc2626', marginBottom: '20px' }}>Top 5 Offenders</h2>
          <table style={{ width: '100%' }}><tbody>
            {topOffenders.map((d, i) => (
              <tr key={d._id}><td>#{i+1}</td><td><strong>{d._id}</strong></td><td style={{color:'red',fontWeight:'bold'}}>{d.count}</td></tr>
            ))}
          </tbody></table>
        </div>

        {/* Auto-Closed with Filter */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '26px', color: '#16a34a' }}>Recent Auto-Closed</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          {filteredClosed.map(a => (
            <div key={a.alertId} style={{ background: '#f0fdf4', padding: '12px', margin: '8px 0', borderRadius: '8px', border: '1px solid #86efac' }}>
              <strong>{a.sourceType}</strong> → {a.autoClosedReason}<br/>
              <small>{a.metadata.driverId} • {new Date(a.autoClosedAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', marginBottom: '40px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '26px', color: '#7c3aed', marginBottom: '20px' }}>Alert Trends (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total Alerts" strokeWidth={3} />
            <Line type="monotone" dataKey="escalated" stroke="#dc2626" name="Escalated" strokeWidth={3} />
            <Line type="monotone" dataKey="closed" stroke="#16a34a" name="Auto-Closed" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Alerts + Drill-Down */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '26px', color: '#7c3aed', marginBottom: '20px' }}>Recent Alerts Timeline (Click for Details)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr><th>Time</th><th>Type</th><th>Driver</th><th>Severity</th><th>Status</th></tr>
          </thead>
          <tbody>
            {recentAlerts.slice(0, 10).map(a => (
              <tr key={a.alertId} onClick={() => openDetails(a)} style={{ cursor: 'pointer' }}>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
                <td>{a.sourceType}</td>
                <td>{a.metadata.driverId}</td>
                <td><span style={{ background: a.severity === 'Critical' ? '#fee2e2' : '#fef3c7', padding: '4px 12px', borderRadius: '20px', color: a.severity === 'Critical' ? '#dc2626' : '#d97706' }}>{a.severity}</span></td>
                <td style={{ fontWeight: 'bold', color: a.status === 'ESCALATED' ? 'red' : a.status === 'AUTO-CLOSED' ? 'green' : 'purple' }}>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Configuration Overview (Bonus) */}
      <div style={{ marginTop: '40px', background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '2px dashed #7c3aed' }}>
        <h2 style={{ fontSize: '26px', color: '#7c3aed' }}>Active Rule Configuration</h2>
        <pre style={{ background: 'white', padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
          {JSON.stringify(rules, null, 2)}
        </pre>
      </div>

      {/* Modal */}
      {selectedAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '24px', color: '#1e40af' }}>Alert Details & History</h3>
            <p><strong>Driver:</strong> {selectedAlert.metadata.driverId}</p>
            <p><strong>Status:</strong> <span style={{ color: selectedAlert.status === 'ESCALATED' ? 'red' : 'green' }}>{selectedAlert.status}</span></p>
            <h4>State History:</h4>
            {alertHistory.map(h => (
              <div key={h._id} style={{ background: '#f1f5f9', padding: '10px', margin: '5px 0', borderRadius: '8px' }}>
                {h.fromStatus || '—'} → <strong>{h.toStatus}</strong> ({h.reason})
              </div>
            ))}
            {selectedAlert.status !== 'RESOLVED' && selectedAlert.status !== 'AUTO-CLOSED' && (
              <button onClick={resolveAlert} style={{ marginTop: '20px', padding: '12px 24px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px' }}>
                Manually Resolve
              </button>
            )}
            <button onClick={() => setSelectedAlert(null)} style={{ marginLeft: '10px', padding: '12px 24px', background: '#64748b', color: 'white', border: 'none', borderRadius: '8px' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}