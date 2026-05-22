import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function Projects() {
  const { user, token } = useAuth();
  const role = user?.role;
  const headers = { Authorization: `Bearer ${token}` };

  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // New project form
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget]           = useState('');
  const [deadline, setDeadline]       = useState('');
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const url = role === 'client'
        ? `${API}/projects/client/${user.user_id}`
        : `${API}/projects`;
      const res = await axios.get(url, role === 'client' ? { headers } : {});
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!title || !budget || !deadline) {
      setError('Title, budget and deadline are required');
      return;
    }
    setError(''); setSubmitting(true);
    try {
      await axios.post(`${API}/projects`, { title, description, budget, deadline }, { headers });
      setSuccess('Project posted successfully!');
      setShowForm(false);
      setTitle(''); setDescription(''); setBudget(''); setDeadline('');
      fetchProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`${API}/projects/${id}`, { headers });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  const filtered = projects.filter(p =>
    p[1]?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = s => ({
    open:        { bg: 'rgba(0,255,204,0.1)',  color: '#00ffcc' },
    in_progress: { bg: 'rgba(37,99,235,0.1)',  color: '#2563eb' },
    completed:   { bg: 'rgba(0,200,150,0.1)',  color: '#00c896' },
  }[s] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  return (
    <div className="page">
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '28px',
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            {role === 'client' ? 'My Projects' : 'Browse Projects'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {role === 'client'
              ? `${filtered.length} projects posted`
              : `${filtered.length} open projects available`}
          </p>
        </div>
        {role === 'client' && (
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Post Project'}
          </button>
        )}
      </div>

      {success && <div className="success-box">{success}</div>}

      {/* Post project form */}
      {showForm && role === 'client' && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            Post a New Project
          </h3>

          {error && <div className="error-box">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 600,
                color: 'var(--muted)', marginBottom: '8px',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>Project Title</label>
              <input
                placeholder="e.g. Build a React website"
                value={title} onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 600,
                color: 'var(--muted)', marginBottom: '8px',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>Budget (Rs.)</label>
              <input
                type="number" placeholder="e.g. 15000"
                value={budget} onChange={e => setBudget(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: 'var(--muted)', marginBottom: '8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Description</label>
            <textarea
              rows={3} placeholder="Describe what you need..."
              value={description} onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: 'var(--muted)', marginBottom: '8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Deadline</label>
            <input
              type="date"
              value={deadline} onChange={e => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <button
            onClick={handlePost} disabled={submitting}
            className="btn btn-primary"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Posting...' : 'Post Project'}
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          placeholder="Search projects..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Projects list */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading projects...</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            {role === 'client' ? 'No projects yet. Post your first one!' : 'No open projects found.'}
          </p>
          {role === 'client' && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Post a Project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((p, i) => {
            const sc = statusColor(p[5]);
            return (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <p style={{ fontWeight: 600, fontSize: '15px' }}>{p[1]}</p>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                      }}>{p[5]?.replace('_', ' ')}</span>
                    </div>

                    {p[2] && (
                      <p style={{
                        color: 'var(--muted)', fontSize: '13px',
                        marginBottom: '12px', lineHeight: 1.6,
                        maxWidth: '600px',
                      }}>{p[2]}</p>
                    )}

                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>
                        Rs.{Number(p[3]).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Deadline: {new Date(p[4]).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {role === 'client' && (
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          {p[7] || 0} bid{p[7] !== 1 ? 's' : ''} received
                        </span>
                      )}
                      {role === 'freelancer' && (
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          Posted by {p[6]} · {p[9] || 0} bid{p[9] !== 1 ? 's' : ''}
                        </span>
                      )}
                      {p[8] && (
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          {p[8]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
                    {role === 'client' && p[5] === 'open' && (
                      <button
                        onClick={() => handleDelete(p[0])}
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '8px 14px' }}
                      >Delete</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
