import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api/admin';

export default function AdminDashboard() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/stats`, { headers });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: 'Total Users',      value: stats.users,       color: '#00ffcc', page: '/admin/users'     },
    { label: 'Clients',          value: stats.clients,     color: '#ff4d00', page: '/admin/users'     },
    { label: 'Freelancers',      value: stats.freelancers, color: '#2563eb', page: '/admin/users'     },
    { label: 'Total Projects',   value: stats.projects,    color: '#9b5de5', page: '/admin/projects'  },
    { label: 'Total Bids',       value: stats.bids,        color: '#f5a623', page: '/admin/bids'      },
    { label: 'Contracts',        value: stats.contracts,   color: '#00c896', page: '/admin/contracts' },
    { label: 'Payments',         value: stats.payments,    color: '#2563eb', page: '/admin/payments'  },
    { label: 'Disputes',         value: stats.disputes,    color: '#ff3333', page: '/admin/disputes'  },
  ] : [];

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Admin Dashboard
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Full platform overview — all data across SkillLink
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading stats...</p>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px', marginBottom: '32px',
          }}>
            {statCards.map((s, i) => (
              <div key={i} className="card" onClick={() => navigate(s.page)}
                style={{ cursor: 'pointer' }}>
                <p style={{
                  fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
                  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px',
                }}>{s.label}</p>
                <p style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontSize: '36px', fontWeight: 800,
                  color: s.color, letterSpacing: '-0.04em',
                }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(0,200,150,0.08), rgba(0,255,204,0.04))',
            border: '1px solid rgba(0,255,204,0.15)',
            marginBottom: '32px', padding: '28px 32px',
          }}>
            <p style={{
              fontSize: '12px', fontWeight: 600, color: 'var(--teal)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px',
            }}>Total Platform Revenue</p>
            <p style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: '48px', fontWeight: 800,
              color: 'var(--teal)', letterSpacing: '-0.04em',
            }}>
              Rs.{Number(stats.revenue).toLocaleString()}
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '8px' }}>
              Total payments processed across all contracts
            </p>
          </div>

          {/* Quick links */}
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Quick Access
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '10px',
          }}>
            {[
              { label: 'All Users',    page: '/admin/users'         },
              { label: 'Projects',     page: '/admin/projects'      },
              { label: 'Bids',         page: '/admin/bids'          },
              { label: 'Contracts',    page: '/admin/contracts'     },
              { label: 'Payments',     page: '/admin/payments'      },
              { label: 'Reviews',      page: '/admin/reviews'       },
              { label: 'Skills',       page: '/admin/skills'        },
              { label: 'Disputes',     page: '/admin/disputes'      },
              { label: 'Notifications',page: '/admin/notifications' },
            ].map((l, i) => (
              <button key={i} onClick={() => navigate(l.page)} style={{
                padding: '12px', borderRadius: '8px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
                textAlign: 'center',
              }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--orange)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >{l.label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
