import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const [step, setStep]                     = useState(1);
  const [role, setRole]                     = useState('');
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [phone, setPhone]                   = useState('');
  const [password, setPassword]             = useState('');
  const [companyName, setCompanyName]       = useState('');
  const [location, setLocation]             = useState('');
  const [bio, setBio]                       = useState('');
  const [hourlyRate, setHourlyRate]         = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Name, email and password are required');
      return;
    }
    setError(''); setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name, email, password, phone, role,
        company_name:     companyName,
        location,
        bio,
        hourly_rate:      hourlyRate,
        experience_level: experienceLevel,
      });
      login(
        { user_id: res.data.user_id, name, email, role },
        res.data.token
      );
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
            fontSize: '48px', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '24px',
          }}>
            Join as a<br />
            <span style={{ color: role === 'client' ? 'var(--orange)' : 'var(--teal)' }}>
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member'}
            </span>
          </h1>

          <p style={{
            color: 'var(--muted)', fontSize: '15px',
            lineHeight: 1.75, maxWidth: '360px',
          }}>
            {role === 'client'
              ? 'Post projects, review bids, hire the best freelancers in Pakistan.'
              : role === 'freelancer'
              ? 'Browse projects, place bids, build your reputation and get paid.'
              : 'Choose your role to get started on SkillLink.'}
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: '480px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px',
        borderLeft: '1px solid var(--border)',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(20px)',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '380px', paddingTop: '20px', paddingBottom: '20px' }}>
          <h2 style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '26px', fontWeight: 700,
            letterSpacing: '-0.04em', marginBottom: '6px',
          }}>Create account</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>
            Already have one?{' '}
            <Link to="/login" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>

          {error && <div className="error-box">{error}</div>}

          {/* Step 1 — Choose role */}
          {step === 1 && (
            <>
              <p style={{
                fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px',
              }}>I want to</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {[
                  { value: 'client',     label: 'Hire Freelancers',   sub: 'Post projects and find talent'    },
                  { value: 'freelancer', label: 'Work as Freelancer', sub: 'Browse projects and place bids'  },
                ].map(opt => (
                  <div key={opt.value} onClick={() => setRole(opt.value)} style={{
                    padding: '16px 20px', borderRadius: '10px', cursor: 'pointer',
                    border: `1px solid ${role === opt.value
                      ? opt.value === 'client' ? 'var(--orange)' : 'var(--teal)'
                      : 'var(--border)'}`,
                    background: role === opt.value
                      ? opt.value === 'client'
                        ? 'rgba(255,77,0,0.06)' : 'rgba(0,255,204,0.06)'
                      : 'var(--surface2)',
                    transition: 'all 0.15s',
                  }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{opt.label}</p>
                    <p style={{ color: 'var(--muted)', fontSize: '12px' }}>{opt.sub}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { if (!role) { setError('Please select a role'); return; } setError(''); setStep(2); }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px' }}
              >
                Continue →
              </button>
            </>
          )}

          {/* Step 2 — Fill details */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: 600,
                  color: 'var(--muted)', marginBottom: '8px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>Full Name</label>
                <input
                  placeholder="Ali Hassan"
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: 600,
                  color: 'var(--muted)', marginBottom: '8px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>Email</label>
                <input
                  type="email" placeholder="you@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: 600,
                  color: 'var(--muted)', marginBottom: '8px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>Phone</label>
                <input
                  placeholder="03001234567"
                  value={phone} onChange={e => setPhone(e.target.value)}
                />
              </div>

              {/* Client extra fields */}
              {role === 'client' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block', fontSize: '11px', fontWeight: 600,
                      color: 'var(--muted)', marginBottom: '8px',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>Company Name (optional)</label>
                    <input
                      placeholder="e.g. TechCorp"
                      value={companyName} onChange={e => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block', fontSize: '11px', fontWeight: 600,
                      color: 'var(--muted)', marginBottom: '8px',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>Location (optional)</label>
                    <input
                      placeholder="e.g. Lahore"
                      value={location} onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Freelancer extra fields */}
              {role === 'freelancer' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block', fontSize: '11px', fontWeight: 600,
                      color: 'var(--muted)', marginBottom: '8px',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>Bio (optional)</label>
                    <textarea
                      rows={2} placeholder="Tell clients about yourself..."
                      value={bio} onChange={e => setBio(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block', fontSize: '11px', fontWeight: 600,
                      color: 'var(--muted)', marginBottom: '8px',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>Hourly Rate (Rs.)</label>
                    <input
                      type="number" placeholder="e.g. 2000"
                      value={hourlyRate} onChange={e => setHourlyRate(e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block', fontSize: '11px', fontWeight: 600,
                      color: 'var(--muted)', marginBottom: '8px',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>Experience Level</label>
                    <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: 600,
                  color: 'var(--muted)', marginBottom: '8px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>Password</label>
                <input
                  type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: '13px' }}
                >← Back</button>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '13px', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Creating...' : 'Create Account →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}