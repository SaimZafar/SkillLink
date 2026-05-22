import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in both fields'); return; }
    setError(''); setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/auth/login', { email, password });
      login(
        { user_id: res.data.admin_id, name: res.data.name, email: res.data.email, role: 'admin' },
        res.data.token
      );
      window.location.href = '/admin';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: `
        radial-gradient(ellipse at 20% 50%, rgba(255,77,0,0.07) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 30%, rgba(255,77,0,0.04) 0%, transparent 55%),
        #07080f
      `,
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        padding: '40px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '10px', marginBottom: '32px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'var(--orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 800, fontSize: '18px', color: '#fff',
          }}>S</div>
          <div>
            <p style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700, fontSize: '16px', letterSpacing: '-0.04em',
            }}>SkillLink</p>
            <p style={{ fontSize: '11px', color: 'var(--orange)', fontWeight: 600, letterSpacing: '0.06em' }}>
              ADMIN PANEL
            </p>
          </div>
        </div>

        <h2 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: '24px', fontWeight: 700,
          letterSpacing: '-0.04em', marginBottom: '6px',
        }}>Admin Sign in</h2>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>
          Restricted access — admins only
        </p>

        {error && <div className="error-box">{error}</div>}

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '11px', fontWeight: 600,
            color: 'var(--muted)', marginBottom: '8px',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Email</label>
          <input
            type="email" placeholder="admin@skilllink.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block', fontSize: '11px', fontWeight: 600,
            color: 'var(--muted)', marginBottom: '8px',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Password</label>
          <input
            type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', padding: '13px',
          background: loading ? 'var(--surface2)' : 'var(--orange)',
          border: 'none', borderRadius: '8px',
          color: '#fff', fontSize: '14px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>
      </div>
    </div>
  );
}
