import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in both fields'); return; }
    setError(''); setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(
        { user_id: res.data.user_id, name: res.data.name, email: res.data.email, role: res.data.role },
        res.data.token
      );
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: `
        radial-gradient(ellipse at 15% 50%, rgba(0,255,204,0.06) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 30%, rgba(255,77,0,0.06) 0%, transparent 55%),
        #07080f
      `,
    }}>

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0,255,204,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,255,204,0.03) 1px, transparent 1px)`,
          backgroundSize: '48px 48px', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '64px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'var(--teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800, fontSize: '18px', color: '#000',
            }}>S</div>
            <span style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700, fontSize: '18px', letterSpacing: '-0.04em',
            }}>SkillLink</span>
          </div>

          <h1 style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '52px', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '24px',
          }}>
            Pakistan's<br />
            <span style={{ color: 'var(--teal)' }}>Freelance</span><br />
            Marketplace
          </h1>

          <p style={{
            color: 'var(--muted)', fontSize: '15px',
            lineHeight: 1.75, maxWidth: '360px', marginBottom: '48px',
          }}>
            Connect clients with skilled freelancers. Post projects, place bids,
            sign contracts — all in one place.
          </p>

          <div style={{ display: 'flex', gap: '40px' }}>
            {[
              { label: 'Registered Users', value: '12+' },
              { label: 'Live Projects',    value: '6'   },
              { label: 'Contracts Signed', value: '5'   },
            ].map((s, i) => (
              <div key={i}>
                <p style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontSize: '32px', fontWeight: 800,
                  color: 'var(--teal)', letterSpacing: '-0.04em',
                }}>{s.value}</p>
                <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: '460px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px',
        borderLeft: '1px solid var(--border)',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <h2 style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '26px', fontWeight: 700,
            letterSpacing: '-0.04em', marginBottom: '6px',
          }}>Sign in</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}>
              Create one
            </Link>
          </p>

          {error && <div className="error-box">{error}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: 'var(--muted)', marginBottom: '8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Email</label>
            <input
              type="email" placeholder="you@email.com"
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
            background: loading ? 'var(--surface2)' : 'var(--teal)',
            border: 'none', borderRadius: '8px',
            color: '#000', fontSize: '14px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>

          <p style={{
            textAlign: 'center', marginTop: '28px',
            color: 'var(--border)', fontSize: '10px', letterSpacing: '0.08em',
          }}>
          </p>
        </div>
      </div>
    </div>
  );
}
