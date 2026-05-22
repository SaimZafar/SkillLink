import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function Bids() {
  const { user, token } = useAuth();
  const role = user?.role;
  const headers = { Authorization: `Bearer ${token}` };

  const [projects, setProjects] = useState([]);
  const [bids, setBids]         = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  // Freelancer bid form
  const [showForm, setShowForm]         = useState(false);
  const [bidProject, setBidProject]     = useState('');
  const [amount, setAmount]             = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (role === 'client') {
        const projRes = await axios.get(`${API}/projects/client/${user.user_id}`, { headers });
        setProjects(projRes.data);
        if (projRes.data.length > 0) {
          setSelected(projRes.data[0][0]);
          const bidRes = await axios.get(`${API}/bids/project/${projRes.data[0][0]}`, { headers });
          setBids(bidRes.data);
        }
      } else {
        const [projRes, bidRes] = await Promise.all([
          axios.get(`${API}/projects`),
          axios.get(`${API}/bids/freelancer/${user.user_id}`, { headers }),
        ]);
        setProjects(projRes.data.filter(p => p[5] === 'open'));
        setBids(bidRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidsForProject = async (projectId) => {
    try {
      setSelected(projectId);
      const res = await axios.get(`${API}/bids/project/${projectId}`, { headers });
      setBids(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (bidId) => {
    if (!window.confirm('Accept this bid? A contract will be created automatically.')) return;
    try {
      await axios.put(`${API}/bids/${bidId}/accept`, {}, { headers });
      setSuccess('Bid accepted! Contract created successfully.');
      fetchBidsForProject(selected);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept bid');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSubmitBid = async () => {
    if (!bidProject || !amount || !deliveryTime) {
      setError('All fields are required');
      return;
    }
    setError(''); setSubmitting(true);
    try {
      await axios.post(`${API}/bids`, {
        project_id:    bidProject,
        amount,
        delivery_time: deliveryTime,
      }, { headers });
      setSuccess('Bid submitted successfully!');
      setShowForm(false);
      setAmount(''); setDeliveryTime(''); setBidProject('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = s => ({
    pending:  { bg: 'rgba(245,166,35,0.1)', color: '#f5a623' },
    accepted: { bg: 'rgba(0,200,150,0.1)',  color: '#00c896' },
    rejected: { bg: 'rgba(255,51,51,0.1)',  color: '#ff3333' },
  }[s] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  // ── FREELANCER VIEW ──
  if (role === 'freelancer') {
    return (
      <div className="page">
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '28px',
        }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>My Bids</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              {bids.length} bid{bids.length !== 1 ? 's' : ''} submitted
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Place a Bid'}
          </button>
        </div>

        {success && <div className="success-box">{success}</div>}
        {error   && <div className="error-box">{error}</div>}

        {/* Bid form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
              Place a Bid
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 600,
                color: 'var(--muted)', marginBottom: '8px',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>Select Project</label>
              <select value={bidProject} onChange={e => setBidProject(e.target.value)}>
                <option value="">-- Choose a project --</option>
                {projects.map((p, i) => (
                  <option key={i} value={p[0]}>{p[1]} — Rs.{Number(p[3]).toLocaleString()}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: 600,
                  color: 'var(--muted)', marginBottom: '8px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>Your Bid (Rs.)</label>
                <input
                  type="number" placeholder="e.g. 12000"
                  value={amount} onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: 600,
                  color: 'var(--muted)', marginBottom: '8px',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>Delivery Time (days)</label>
                <input
                  type="number" placeholder="e.g. 7"
                  value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleSubmitBid} disabled={submitting}
              className="btn btn-primary"
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Submitting...' : 'Submit Bid'}
            </button>
          </div>
        )}

        {/* Bids list */}
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading bids...</p>
        ) : bids.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              No bids placed yet. Browse projects and place your first bid!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bids.map((b, i) => {
              const sc = statusColor(b[3]);
              return (
                <div key={i} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <p style={{ fontWeight: 600, fontSize: '15px' }}>{b[5]}</p>
                        <span style={{
                          background: sc.bg, color: sc.color,
                          padding: '3px 10px', borderRadius: '4px',
                          fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                        }}>{b[3]}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>
                          Rs.{Number(b[1]).toLocaleString()} bid
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          {b[2]} days delivery
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          Client budget: Rs.{Number(b[6]).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          By {b[9]}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '12px', flexShrink: 0 }}>
                      {new Date(b[4]).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── CLIENT VIEW ──
  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Bids Received</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Select a project to view its bids
        </p>
      </div>

      {success && <div className="success-box">{success}</div>}
      {error   && <div className="error-box">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            No projects posted yet. Post a project to receive bids.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>

          {/* Project selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projects.map((p, i) => (
              <div key={i} onClick={() => fetchBidsForProject(p[0])} style={{
                padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                border: `1px solid ${selected === p[0] ? 'var(--teal)' : 'var(--border)'}`,
                background: selected === p[0] ? 'rgba(0,255,204,0.05)' : 'var(--surface)',
                transition: 'all 0.15s',
              }}>
                <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{p[1]}</p>
                <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  Rs.{Number(p[3]).toLocaleString()} · {p[7] || 0} bid{p[7] !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>

          {/* Bids panel */}
          <div>
            {bids.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                  No bids received on this project yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bids.map((b, i) => {
                  const sc = statusColor(b[3]);
                  return (
                    <div key={i} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <p style={{ fontWeight: 600, fontSize: '15px' }}>{b[5]}</p>
                            <span style={{
                              background: sc.bg, color: sc.color,
                              padding: '3px 10px', borderRadius: '4px',
                              fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                            }}>{b[3]}</span>
                            {b[8] && (
                              <span style={{ fontSize: '12px', color: 'var(--yellow)' }}>
                                ★ {Number(b[8]).toFixed(1)}
                              </span>
                            )}
                          </div>
                          <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '8px' }}>
                            {b[9]} · {b[10]}
                          </p>
                          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>
                              Rs.{Number(b[1]).toLocaleString()}
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                              {b[2]} days delivery
                            </span>
                          </div>
                        </div>

                        {b[3] === 'pending' && (
                          <button
                            onClick={() => handleAccept(b[0])}
                            className="btn btn-primary"
                            style={{ marginLeft: '16px', flexShrink: 0, fontSize: '13px' }}
                          >
                            Accept Bid
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
