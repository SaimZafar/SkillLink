import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function Reviews() {
  const { user, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [received, setReceived]   = useState([]);
  const [given, setGiven]         = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('received');
  const [showForm, setShowForm]   = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');

  // Form state
  const [contractId, setContractId]   = useState('');
  const [revieweeId, setRevieweeId]   = useState('');
  const [rating, setRating]           = useState(5);
  const [comment, setComment]         = useState('');
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, givRes, contRes] = await Promise.all([
        axios.get(`${API}/reviews/my`, { headers }),
        axios.get(`${API}/reviews/given`, { headers }),
        axios.get(`${API}/contracts/my`, { headers }),
      ]);
      setReceived(recRes.data);
      setGiven(givRes.data);
      setContracts(contRes.data.filter(c => c[4] === 'completed'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!contractId || !revieweeId || !rating) {
      setError('Please fill all required fields');
      return;
    }
    setError(''); setSubmitting(true);
    try {
      await axios.post(`${API}/reviews`, {
        contract_id: contractId,
        reviewee_id: revieweeId,
        rating,
        comment,
      }, { headers });
      setSuccess('Review submitted successfully!');
      setShowForm(false);
      setContractId(''); setRevieweeId(''); setRating(5); setComment('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

  const ReviewCard = ({ r, type }) => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--yellow)', fontSize: '16px', letterSpacing: '2px' }}>
              {stars(r[1])}
            </span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--yellow)' }}>
              {r[1]}/5
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>
            {type === 'received' ? `From: ${r[5]}` : `To: ${r[5]}`}
            {' · '}{r[6]}
          </p>
          {r[2] && (
            <p style={{
              fontSize: '14px', color: 'var(--text)',
              lineHeight: 1.6, fontStyle: 'italic',
            }}>"{r[2]}"</p>
          )}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '16px', flexShrink: 0 }}>
          {new Date(r[3]).toLocaleDateString('en-PK', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </p>
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '28px',
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Reviews</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {received.length} received · {given.length} given
          </p>
        </div>
        {contracts.length > 0 && (
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Leave Review'}
          </button>
        )}
      </div>

      {success && <div className="success-box">{success}</div>}

      {/* Review form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            Leave a Review
          </h3>

          {error && <div className="error-box">{error}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: 'var(--muted)', marginBottom: '8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Select Completed Contract</label>
            <select value={contractId} onChange={e => {
  const val = e.target.value;
  setContractId(val);
  const c = contracts.find(c => String(c[0]) === String(val));
  if (c) {
    setRevieweeId(c[9]);
  }
}}>
              <option value="">-- Choose contract --</option>
              {contracts.map((c, i) => (
                <option key={i} value={c[0]}>
                  {c[5]} — {user.role === 'client' ? c[7] : c[7]}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: 'var(--muted)', marginBottom: '8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Rating</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)} style={{
                  width: '40px', height: '40px', borderRadius: '8px',
                  border: `1px solid ${rating >= n ? 'var(--yellow)' : 'var(--border)'}`,
                  background: rating >= n ? 'rgba(245,166,35,0.1)' : 'var(--surface2)',
                  color: rating >= n ? 'var(--yellow)' : 'var(--muted)',
                  fontSize: '18px', cursor: 'pointer',
                }}>★</button>
              ))}
              <span style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: '13px', marginLeft: '8px' }}>
                {rating}/5
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: 'var(--muted)', marginBottom: '8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Comment (optional)</label>
            <textarea
              rows={3} placeholder="Share your experience..."
              value={comment} onChange={e => setComment(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            onClick={handleSubmit} disabled={submitting}
            className="btn btn-primary"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['received', 'given'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 20px', borderRadius: '8px',
            border: `1px solid ${tab === t ? 'var(--teal)' : 'var(--border)'}`,
            background: tab === t ? 'rgba(0,255,204,0.08)' : 'var(--surface)',
            color: tab === t ? 'var(--teal)' : 'var(--muted)',
            fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {/* Reviews list */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading reviews...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(tab === 'received' ? received : given).length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                No {tab} reviews yet.
              </p>
            </div>
          ) : (
            (tab === 'received' ? received : given).map((r, i) => (
              <ReviewCard key={i} r={r} type={tab} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
