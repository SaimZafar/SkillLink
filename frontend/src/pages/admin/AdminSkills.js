import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/admin';

export default function AdminSkills() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [skills, setSkills]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [catFilter, setCat]     = useState('all');

  useEffect(() => { fetchSkills(); }, []);

  useEffect(() => {
    let data = skills;
    if (catFilter !== 'all') data = data.filter(s => s[5] === catFilter);
    if (search) data = data.filter(s =>
      s[0]?.toLowerCase().includes(search.toLowerCase()) ||
      s[4]?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, catFilter, skills]);

  const fetchSkills = async () => {
    try {
      const res = await axios.get(`${API}/skills`, { headers });
      setSkills(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(skills.map(s => s[5]).filter(Boolean))];

  const catColor = c => ({
    Tech:       { bg: 'rgba(37,99,235,0.1)',   color: '#2563eb' },
    Design:     { bg: 'rgba(155,93,229,0.1)',  color: '#9b5de5' },
    Marketing:  { bg: 'rgba(255,77,0,0.1)',    color: '#ff4d00' },
    Writing:    { bg: 'rgba(0,200,150,0.1)',   color: '#00c896' },
  }[c] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Skills</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {filtered.length} freelancer-skill assignments on the platform
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by freelancer or skill..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '10px 16px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 600,
              border: `1px solid ${catFilter === c ? 'var(--orange)' : 'var(--border)'}`,
              background: catFilter === c ? 'rgba(255,77,0,0.08)' : 'var(--surface)',
              color: catFilter === c ? 'var(--orange)' : 'var(--muted)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}>{c === 'all' ? 'All Categories' : c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading skills...</p>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <table>
            <thead>
              <tr>
                <th>Freelancer</th>
                <th>Skill</th>
                <th>Category</th>
                <th>Hourly Rate</th>
                <th>Experience</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const cc = catColor(s[5]);
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, fontSize: '13px' }}>{s[0]}</td>
                    <td style={{ fontSize: '13px', fontWeight: 500 }}>{s[4]}</td>
                    <td>
                      <span style={{
                        background: cc.bg, color: cc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600,
                      }}>{s[5]}</span>
                    </td>
                    <td style={{ color: 'var(--green)', fontWeight: 600, fontSize: '13px' }}>
                      Rs.{Number(s[1]).toLocaleString()}/hr
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '13px', textTransform: 'capitalize' }}>
                      {s[2]}
                    </td>
                    <td>
                      <span style={{
                        background: s[3] === 'yes' ? 'rgba(0,200,150,0.1)' : 'rgba(255,51,51,0.1)',
                        color: s[3] === 'yes' ? '#00c896' : '#ff3333',
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600,
                      }}>{s[3] === 'yes' ? 'Available' : 'Busy'}</span>
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
