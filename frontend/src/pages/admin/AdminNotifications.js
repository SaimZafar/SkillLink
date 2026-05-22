import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/admin';

export default function AdminNotifications() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [notifications, setNotifications] = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [typeFilter, setType]             = useState('all');

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    let data = notifications;
    if (typeFilter !== 'all') data = data.filter(n => n[4] === typeFilter);
    if (search) data = data.filter(n =>
      n[5]?.toLowerCase().includes(search.toLowerCase()) ||
      n[1]?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, typeFilter, notifications]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/notifications`, { headers });
      setNotifications(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const types = ['all', ...new Set(notifications.map(n => n[4]).filter(Boolean))];

  const typeColor = t => ({
    bid_accepted: { bg: 'rgba(0,255,204,0.08)',  color: '#00ffcc' },
    payment:      { bg: 'rgba(0,200,150,0.1)',   color: '#00c896' },
    dispute:      { bg: 'rgba(255,51,51,0.1)',   color: '#ff3333' },
    review:       { bg: 'rgba(245,166,35,0.1)',  color: '#f5a623' },
  }[t] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  const unreadCount = notifications.filter(n => n[3] === 'N').length;

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Notifications</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {notifications.length} total · {unreadCount} unread
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by user or message..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: '10px 16px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 600,
              border: `1px solid ${typeFilter === t ? 'var(--orange)' : 'var(--border)'}`,
              background: typeFilter === t ? 'rgba(255,77,0,0.08)' : 'var(--surface)',
              color: typeFilter === t ? 'var(--orange)' : 'var(--muted)',
              cursor: 'pointer',
            }}>{t === 'all' ? 'All Types' : t.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading notifications...</p>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Message</th>
                <th>Type</th>
                <th>Date</th>
                <th>Read</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n, i) => {
                const tc = typeColor(n[4]);
                return (
                  <tr key={i} style={{
                    background: n[3] === 'N' ? 'rgba(0,255,204,0.02)' : 'transparent',
                  }}>
                    <td style={{ fontWeight: 600, fontSize: '13px' }}>{n[5]}</td>
                    <td style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '400px' }}>
                      {n[1]}
                    </td>
                    <td>
                      <span style={{
                        background: tc.bg, color: tc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600,
                        textTransform: 'capitalize',
                      }}>{n[4]?.replace('_', ' ')}</span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      {new Date(n[2]).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <span style={{
                        background: n[3] === 'Y' ? 'rgba(0,200,150,0.1)' : 'rgba(245,166,35,0.1)',
                        color: n[3] === 'Y' ? '#00c896' : '#f5a623',
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600,
                      }}>{n[3] === 'Y' ? 'Read' : 'Unread'}</span>
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
