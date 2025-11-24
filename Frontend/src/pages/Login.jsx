import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '400px' }}>
        <h1 style={{ textAlign: 'center', color: '#1e40af', marginBottom: '30px', fontSize: '28px' }}>
          MoveInSync Alert System
        </h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Username</label>
            <input
              type="text"
              value={username}

              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '16px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '16px' }}
              required
            />
          </div>
          <button
            type="submit"
            style={{ width: '100%', padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Login
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
          {/* Default: admin / 123456 */}
        </p>
      </div>
    </div>
  );
}