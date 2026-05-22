import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/admin';

export default function AdminContracts() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [contracts, setContracts] = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');

  useEffect(() => { fetchContracts(); }, []);

  useEffect(() => {
    let data = contracts;
    if (statusFilter !== 'all') data = data.filter(c => c[4] === statusFilter);
    if (search) data = data.filter(c =>
      c[5]?.toLowerCase().includes(search.toLowerCase()) ||
      c[6]?.toLowerCase().includes(search.toLowerCase()) ||
      c[7]?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, statusFilter, contracts]);

  const fetchContracts = async () => {
    try {
      const res = await axios.get(`${API}/contracts`, { headers });
      setContracts(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = s => ({
    active:    { bg: 'rgba(37,99,235,0.1)',  color: '#2563eb' },
    completed: { bg: 'rgba(0,200,150,0.1)',  color: '#00c896' },
    disputed:  { bg: 'rgba(255,51,51,0.1)',  color: '#ff3333' },
  }[s] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Contracts</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {filtered.length} contracts on the platform
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by project, client or freelancer..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'active', 'completed', 'disputed'].map(s => (
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
        <p style={{ color: 'var(--muted)' }}>Loading contracts...</p>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <table>
            <thead>
              <tr>
                <th>Contract</th>
                <th>Project</th>
                <th>Client</th>
                <th>Freelancer</th>
                <th>Amount</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const sc = statusColor(c[4]);
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>#{c[0]}</td>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: '13px' }}>{c[5]}</p>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{c[6]}</td>
                    <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{c[7]}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 600, fontSize: '13px' }}>
                      Rs.{Number(c[1]).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      {new Date(c[2]).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      {new Date(c[3]).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                      }}>{c[4]}</span>
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
