import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState({ Critical: 0, Warning: 0, Info: 0 });
  const [topOffenders, setTopOffenders] = useState([]);
  const [autoClosed, setAutoClosed] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const { logout } = useAuth();

  const fetchData = async () => {
    try {
      const [statsRes, topRes, closedRes, alertsRes] = await Promise.all([
        API.get('/alerts/stats'),
        API.get('/alerts/top-offenders'),
        API.get('/alerts/auto-closed'),
        API.get('/alerts')  // This now works!
      ]);

      setStats(statsRes.data);
      setTopOffenders(topRes.data);
      setAutoClosed(closedRes.data);
      setRecentAlerts(alertsRes.data);
    } catch (err) {
      console.error("Fetch failed:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const openAlertDetails = async (alert) => {
    setSelectedAlert(alert);
    try {
      const res = await API.get(`/alerts/${alert.alertId}/history`);
      setAlertHistory(res.data);
    } catch (err) {
      setAlertHistory([]);
    }
  };

  const resolveAlert = async () => {
    await API.patch(`/alerts/${selectedAlert.alertId}/resolve`);
    setSelectedAlert(null);
    fetchData();
  };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', color: '#1e40af', fontWeight: 'bold' }}>
          Intelligent Alert Escalation System
        </h1>
        <button onClick={logout} style={{ padding: '12px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      {/* Live Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
        <div style={{ background: '#fee2e2', padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '56px', color: '#dc2626' }}>{stats.Critical || 0}</h2>
          <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#991b1b' }}>Critical</p>
        </div>
        <div style={{ background: '#fef3c7', padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '56px', color: '#d97706' }}>{stats.Warning || 0}</h2>
          <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#92400e' }}>Warning</p>
        </div>
        <div style={{ background: '#dbeafe', padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '56px', color: '#2563eb' }}>{stats.Info || 0}</h2>
          <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e40af' }}>Info</p>
        </div>
      </div>

      {/* Rest of your beautiful dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '26px', marginBottom: '20px', color: '#dc2626' }}>Top 5 Offenders</h2>
          {topOffenders.length === 0 ? <p>No data</p> : (
            <table style={{ width: '100%' }}>
              <thead><tr><th>Rank</th><th>Driver</th><th>Count</th></tr></thead>
              <tbody>
                {topOffenders.map((d, i) => (
                  <tr key={d._id}><td>#{i+1}</td><td>{d._id}</td><td style={{color:'red',fontWeight:'bold'}}>{d.count}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '26px', marginBottom: '20px', color: '#16a34a' }}>Recent Auto-Closed</h2>
          {autoClosed.length === 0 ? <p>No auto-closed yet</p> : autoClosed.slice(0,5).map(a => (
            <div key={a.alertId} style={{ background: '#f0fdf4', padding: '12px', margin: '8px 0', borderRadius: '8px', border: '1px solid #86efac' }}>
              <strong>{a.sourceType}</strong> - {a.metadata.driverId}<br/>
              <small style={{color:'#16a34a'}}>{a.autoClosedReason}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div style={{ marginTop: '40px', background: 'white', padding: '30px', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '26px', marginBottom: '20px', color: '#7c3aed' }}>Recent Alerts (Click Row)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Time</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Driver</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentAlerts.slice(0, 10).map(a => (
              <tr key={a.alertId} onClick={() => openAlertDetails(a)} style={{ cursor: 'pointer', background: recentAlerts.indexOf(a)%2===0 ? '#fdfdfe' : 'white' }}>
                <td style={{ padding: '15px' }}>{new Date(a.createdAt).toLocaleString()}</td>
                <td style={{ padding: '15px' }}>{a.sourceType}</td>
                <td style={{ padding: '15px' }}>{a.metadata.driverId}</td>
                <td style={{ padding: '15px', fontWeight: 'bold', color: a.status === 'ESCALATED' ? 'red' : a.status === 'AUTO-CLOSED' ? 'green' : 'purple' }}>
                  {a.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '600px' }}>
            <h3 style={{ fontSize: '24px', color: '#1e40af' }}>Alert Details</h3>
            <p><strong>ID:</strong> {selectedAlert.alertId}</p>
            <p><strong>Driver:</strong> {selectedAlert.metadata.driverId}</p>
            <p><strong>Status:</strong> <span style={{ color: selectedAlert.status === 'ESCALATED' ? 'red' : 'green' }}>{selectedAlert.status}</span></p>
            
            <h4 style={{ margin: '20px 0 10px' }}>History</h4>
            {alertHistory.map(h => (
              <div key={h._id} style={{ background: '#f8fafc', padding: '10px', margin: '5px 0', borderRadius: '8px' }}>
                {h.fromStatus} → <strong>{h.toStatus}</strong> ({h.reason})
              </div>
            ))}

            {selectedAlert.status !== 'RESOLVED' && selectedAlert.status !== 'AUTO-CLOSED' && (
              <button onClick={resolveAlert} style={{ marginTop: '20px', padding: '12px 24px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px' }}>
                Resolve Manually
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