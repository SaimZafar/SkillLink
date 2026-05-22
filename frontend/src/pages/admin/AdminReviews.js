import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/admin';

export default function AdminReviews() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [reviews, setReviews]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => { fetchReviews(); }, []);

  useEffect(() => {
    let data = reviews;
    if (search) data = data.filter(r =>
      r[4]?.toLowerCase().includes(search.toLowerCase()) ||
      r[5]?.toLowerCase().includes(search.toLowerCase()) ||
      r[6]?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, reviews]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/reviews`, { headers });
      setReviews(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + Number(r[1]), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Reviews</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {filtered.length} reviews on the platform
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Reviews',  value: reviews.length, color: 'var(--text)'   },
          { label: 'Average Rating', value: `${avgRating} / 5`, color: 'var(--yellow)' },
        ].map((s, i) => (
          <div key={i} className="card">
            <p style={{
              fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px',
            }}>{s.label}</p>
            <p style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: '28px', fontWeight: 800,
              color: s.color, letterSpacing: '-0.04em',
            }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          placeholder="Search by reviewer, reviewee or project..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading reviews...</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--muted)' }}>No reviews found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((r, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--yellow)', fontSize: '16px', letterSpacing: '2px' }}>
                      {stars(r[1])}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--yellow)' }}>
                      {r[1]}/5
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{r[4]}</span>
                    {' → '}
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{r[5]}</span>
                    {' · '}{r[6]}
                  </p>
                  {r[2] && (
                    <p style={{ fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic', color: 'var(--text)' }}>
                      "{r[2]}"
                    </p>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '16px', flexShrink: 0 }}>
                  {new Date(r[3]).toLocaleDateString('en-PK', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
