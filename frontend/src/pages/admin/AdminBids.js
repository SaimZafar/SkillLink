import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/admin';

export default function AdminBids() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [bids, setBids]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');

  useEffect(() => { fetchBids(); }, []);

  useEffect(() => {
    let data = bids;
    if (statusFilter !== 'all') data = data.filter(b => b[3] === statusFilter);
    if (search) data = data.filter(b =>
      b[5]?.toLowerCase().includes(search.toLowerCase()) ||
      b[7]?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, statusFilter, bids]);

  const fetchBids = async () => {
    try {
      const res = await axios.get(`${API}/bids`, { headers });
      setBids(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = s => ({
    pending:  { bg: 'rgba(245,166,35,0.1)', color: '#f5a623' },
    accepted: { bg: 'rgba(0,200,150,0.1)',  color: '#00c896' },
    rejected: { bg: 'rgba(255,51,51,0.1)',  color: '#ff3333' },
  }[s] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Bids</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {filtered.length} bids placed on the platform
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by project or freelancer..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'accepted', 'rejected'].map(s => (
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
        <p style={{ color: 'var(--muted)' }}>Loading bids...</p>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Freelancer</th>
                <th>Bid Amount</th>
                <th>Project Budget</th>
                <th>Delivery</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const sc = statusColor(b[3]);
                return (
                  <tr key={i}>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{b[5]}</p>
                      <p style={{ color: 'var(--muted)', fontSize: '11px' }}>ID #{b[0]}</p>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      <p style={{ fontWeight: 500 }}>{b[7]}</p>
                      {b[8] && (
                        <p style={{ color: 'var(--muted)', fontSize: '11px', textTransform: 'capitalize' }}>
                          {b[8]}
                        </p>
                      )}
                    </td>
                    <td style={{ color: 'var(--green)', fontWeight: 600, fontSize: '13px' }}>
                      Rs.{Number(b[1]).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      Rs.{Number(b[6]).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      {b[2]} days
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      {new Date(b[4]).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                      }}>{b[3]}</span>
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
