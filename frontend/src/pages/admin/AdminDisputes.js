import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/admin';

export default function AdminDisputes() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [disputes, setDisputes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('all');

  useEffect(() => { fetchDisputes(); }, []);

  useEffect(() => {
    let data = disputes;
    if (statusFilter !== 'all') data = data.filter(d => d[2] === statusFilter);
    if (search) data = data.filter(d =>
      d[4]?.toLowerCase().includes(search.toLowerCase()) ||
      d[7]?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, statusFilter, disputes]);

  const fetchDisputes = async () => {
    try {
      const res = await axios.get(`${API}/disputes`, { headers });
      setDisputes(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = s => ({
    open:     { bg: 'rgba(255,51,51,0.1)',  color: '#ff3333' },
    resolved: { bg: 'rgba(0,200,150,0.1)', color: '#00c896' },
  }[s] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Disputes</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {disputes.filter(d => d[2] === 'open').length} open ·{' '}
          {disputes.filter(d => d[2] === 'resolved').length} resolved
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by raised by or project..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'open', 'resolved'].map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{
              padding: '10px 16px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 600,
              border: `1px solid ${statusFilter === s ? 'var(--orange)' : 'var(--border)'}`,
              background: statusFilter === s ? 'rgba(255,77,0,0.08)' : 'var(--surface)',
              color: statusFilter === s ? 'var(--orange)' : 'var(--muted)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading disputes...</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--muted)' }}>No disputes found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((d, i) => {
            const sc = statusColor(d[2]);
            return (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <p style={{ fontWeight: 600, fontSize: '15px' }}>{d[7]}</p>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                      }}>{d[2]}</span>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '10px' }}>
                      Raised by <span style={{ color: 'var(--text)', fontWeight: 600 }}>{d[4]}</span>
                      {' · '}Contract #{d[5]}
                      {' · '}Rs.{Number(d[6]).toLocaleString()}
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text)' }}>{d[1]}</p>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '16px', flexShrink: 0 }}>
                    {new Date(d[3]).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
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
