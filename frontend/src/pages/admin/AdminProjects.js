import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/admin';

export default function AdminProjects() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('all');

  useEffect(() => { fetchProjects(); }, []);

  useEffect(() => {
    let data = projects;
    if (statusFilter !== 'all') data = data.filter(p => p[5] === statusFilter);
    if (search) data = data.filter(p =>
      p[1]?.toLowerCase().includes(search.toLowerCase()) ||
      p[6]?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, statusFilter, projects]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/projects`, { headers });
      setProjects(res.data);
      setFiltered(res.data);
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
  }[s] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Projects</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {filtered.length} projects on the platform
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by title or client..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'open', 'in_progress', 'completed'].map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{
              padding: '10px 16px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 600,
              border: `1px solid ${statusFilter === s ? 'var(--orange)' : 'var(--border)'}`,
              background: statusFilter === s ? 'rgba(255,77,0,0.08)' : 'var(--surface)',
              color: statusFilter === s ? 'var(--orange)' : 'var(--muted)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}>{s === 'all' ? 'All' : s.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading projects...</p>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Deadline</th>
                <th>Bids</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const sc = statusColor(p[5]);
                return (
                  <tr key={i}>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{p[1]}</p>
                      <p style={{ color: 'var(--muted)', fontSize: '11px' }}>ID #{p[0]}</p>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      <p style={{ fontWeight: 500 }}>{p[6]}</p>
                      {p[7] && <p style={{ color: 'var(--muted)', fontSize: '11px' }}>{p[7]}</p>}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{p[8] || '—'}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 600, fontSize: '13px' }}>
                      Rs.{Number(p[3]).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      {new Date(p[4]).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{p[9] || 0}</td>
                    <td>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                      }}>{p[5]?.replace('_', ' ')}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
