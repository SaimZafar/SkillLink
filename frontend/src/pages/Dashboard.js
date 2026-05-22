import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const headers = { Authorization: `Bearer ${token}` };

  const [stats, setStats]       = useState({ projects: 0, bids: 0, contracts: 0, notifications: 0 });
  const [projects, setProjects] = useState([]);
  const [bids, setBids]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (role === 'client') {
        const [projRes, notifRes] = await Promise.all([
          axios.get(`${API}/projects/client/${user.user_id}`, { headers }),
          axios.get(`${API}/notifications/unread-count`, { headers }),
        ]);
        const projs = projRes.data;
        setProjects(projs.slice(0, 5));
        const totalBids = projs.reduce((sum, p) => sum + (p[7] || 0), 0);
        setStats({
          projects:      projs.length,
          bids:          totalBids,
          contracts:     projs.filter(p => p[5] === 'in_progress' || p[5] === 'completed').length,
          notifications: notifRes.data.count,
        });
      } else {
        const [projRes, bidRes, notifRes] = await Promise.all([
          axios.get(`${API}/projects`),
          axios.get(`${API}/bids/freelancer/${user.user_id}`, { headers }),
          axios.get(`${API}/notifications/unread-count`, { headers }),
        ]);
        setProjects(projRes.data.filter(p => p[5] === 'open').slice(0, 5));
        setBids(bidRes.data.slice(0, 5));
        setStats({
          projects:      projRes.data.filter(p => p[5] === 'open').length,
          bids:          bidRes.data.length,
          contracts:     bidRes.data.filter(b => b[3] === 'accepted').length,
          notifications: notifRes.data.count,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = s => ({
    open:        { bg: 'rgba(0,255,204,0.1)',  color: '#00ffcc' },
    in_progress: { bg: 'rgba(37,99,235,0.1)',  color: '#2563eb' },
    completed:   { bg: 'rgba(0,200,150,0.1)',  color: '#00c896' },
    pending:     { bg: 'rgba(245,166,35,0.1)', color: '#f5a623' },
    accepted:    { bg: 'rgba(0,200,150,0.1)',  color: '#00c896' },
    rejected:    { bg: 'rgba(255,51,51,0.1)',  color: '#ff3333' },
  }[s] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  const clientStats = [
    { label: 'My Projects',      value: stats.projects,      color: '#ff4d00' },
    { label: 'Total Bids',       value: stats.bids,          color: '#2563eb' },
    { label: 'Active Contracts', value: stats.contracts,     color: '#00c896' },
    { label: 'Unread Alerts',    value: stats.notifications, color: '#f5a623' },
  ];

  const freelancerStats = [
    { label: 'Open Projects',  value: stats.projects,      color: '#00ffcc' },
    { label: 'My Bids',        value: stats.bids,          color: '#2563eb' },
    { label: 'Won Contracts',  value: stats.contracts,     color: '#00c896' },
    { label: 'Unread Alerts',  value: stats.notifications, color: '#f5a623' },
  ];

  const statCards = role === 'client' ? clientStats : freelancerStats;

  return (
    <div className="page">
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Welcome back, {user?.name?.split(' ')[0]}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {role === 'client'
            ? 'Here is an overview of your projects and activity.'
            : 'Here are the latest opportunities and your bid activity.'}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '40px',
      }}>
        {statCards.map((s, i) => (
          <div key={i} className="card">
            <p style={{
              fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px',
            }}>{s.label}</p>
            <p style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: '36px', fontWeight: 800,
              color: s.color, letterSpacing: '-0.04em',
            }}>
              {loading ? '—' : s.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Left — Projects */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
              {role === 'client' ? 'My Projects' : 'Open Projects'}
            </h3>
            <button onClick={() => navigate('/dashboard/projects')} style={{
              background: 'none', border: 'none',
              color: 'var(--teal)', fontSize: '12px',
              fontWeight: 600, cursor: 'pointer',
            }}>View all →</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading...</p>
            ) : projects.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '12px' }}>
                  {role === 'client' ? 'No projects yet.' : 'No open projects.'}
                </p>
                {role === 'client' && (
                  <button onClick={() => navigate('/dashboard/projects')} className="btn btn-primary">
                    Post a Project
                  </button>
                )}
              </div>
            ) : projects.map((p, i) => {
              const sc = statusColor(p[5]);
              return (
                <div key={i} className="card" style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/dashboard/projects')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{p[1]}</p>
                      <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                        Rs.{Number(p[3]).toLocaleString()} budget
                        {p[7] > 0 && ` · ${p[7]} bid${p[7] > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <span style={{
                      background: sc.bg, color: sc.color,
                      padding: '3px 10px', borderRadius: '4px',
                      fontSize: '11px', fontWeight: 600,
                      textTransform: 'capitalize', whiteSpace: 'nowrap',
                      marginLeft: '12px',
                    }}>{p[5]?.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Bids */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
              {role === 'client' ? 'Recent Activity' : 'My Recent Bids'}
            </h3>
            <button onClick={() => navigate('/dashboard/bids')} style={{
              background: 'none', border: 'none',
              color: 'var(--teal)', fontSize: '12px',
              fontWeight: 600, cursor: 'pointer',
            }}>View all →</button>
          </div>

          {role === 'freelancer' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loading ? (
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading...</p>
              ) : bids.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '12px' }}>
                    No bids placed yet.
                  </p>
                  <button onClick={() => navigate('/dashboard/projects')} className="btn btn-primary">
                    Browse Projects
                  </button>
                </div>
              ) : bids.map((b, i) => {
                const sc = statusColor(b[3]);
                return (
                  <div key={i} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{b[5]}</p>
                        <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                          Your bid: Rs.{Number(b[1]).toLocaleString()}
                          {` · ${b[2]} days delivery`}
                        </p>
                      </div>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600,
                        textTransform: 'capitalize', whiteSpace: 'nowrap',
                        marginLeft: '12px',
                      }}>{b[3]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '12px' }}>
                Go to Bids Received to review and accept bids on your projects.
              </p>
              <button onClick={() => navigate('/dashboard/bids')} className="btn btn-primary">
                View Bids
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}