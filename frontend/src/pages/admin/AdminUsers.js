import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/admin';

export default function AdminUsers() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [users, setUsers]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('all');

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let data = users;
    if (roleFilter !== 'all') data = data.filter(u => u[5] === roleFilter);
    if (search) data = data.filter(u =>
      u[1]?.toLowerCase().includes(search.toLowerCase()) ||
      u[2]?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`, { headers });
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const roleStyle = r => ({
    client:     { bg: 'rgba(255,77,0,0.1)',   color: '#ff4d00' },
    freelancer: { bg: 'rgba(0,255,204,0.08)', color: '#00ffcc' },
  }[r] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  const colors = ['#00ffcc','#2563eb','#ff4d00','#9b5de5','#f5a623','#00c896','#ff3333','#06b6d4'];

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Users</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {filtered.length} users registered on the platform
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'client', 'freelancer'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: '10px 16px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 600,
              border: `1px solid ${roleFilter === r ? 'var(--orange)' : 'var(--border)'}`,
              background: roleFilter === r ? 'rgba(255,77,0,0.08)' : 'var(--surface)',
              color: roleFilter === r ? 'var(--orange)' : 'var(--muted)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}>{r === 'all' ? 'All' : r + 's'}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading users...</p>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Details</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rs = roleStyle(u[5]);
                const initials = u[1]?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const color = colors[i % colors.length];
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '8px',
                          background: `${color}18`, border: `1px solid ${color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                          fontWeight: 700, fontSize: '12px', color, flexShrink: 0,
                        }}>{initials}</div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '13px' }}>{u[1]}</p>
                          <p style={{ color: 'var(--muted)', fontSize: '11px' }}>ID #{u[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{u[2]}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{u[3] || '—'}</td>
                    <td>
                      <span style={{
                        background: rs.bg, color: rs.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                      }}>{u[5] || '—'}</span>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {u[5] === 'client' && (
                        <span style={{ color: 'var(--muted)' }}>
                          {u[6] || 'No company'}{u[7] ? ` · ${u[7]}` : ''}
                        </span>
                      )}
                      {u[5] === 'freelancer' && (
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                          Rs.{Number(u[8] || 0).toLocaleString()}/hr
                          {u[9] ? ` · ${Number(u[9]).toFixed(1)} ★` : ''}
                          {u[10] ? ` · ${u[10]}` : ''}
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      {u[4] ? new Date(u[4]).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : '—'}
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
