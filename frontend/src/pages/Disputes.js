import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function Disputes() {
  const { user, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [disputes, setDisputes]   = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [success, setSuccess]     = useState('');
  const [error, setError]         = useState('');

  // Form state
  const [contractId, setContractId] = useState('');
  const [reason, setReason]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [disRes, contRes] = await Promise.all([
        axios.get(`${API}/disputes/my`, { headers }),
        axios.get(`${API}/contracts/my`, { headers }),
      ]);
      setDisputes(disRes.data);
      setContracts(contRes.data.filter(c => c[4] === 'active'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRaise = async () => {
    if (!contractId || !reason) {
      setError('Contract and reason are required');
      return;
    }
    setError(''); setSubmitting(true);
    try {
      await axios.post(`${API}/disputes`, { contract_id: contractId, reason }, { headers });
      setSuccess('Dispute raised successfully.');
      setShowForm(false);
      setContractId(''); setReason('');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to raise dispute');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Mark this dispute as resolved?')) return;
    try {
      await axios.put(`${API}/disputes/${id}/resolve`, {}, { headers });
      setSuccess('Dispute marked as resolved.');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resolve dispute');
    }
  };

  const statusColor = s => ({
    open:     { bg: 'rgba(255,51,51,0.1)',  color: '#ff3333' },
    resolved: { bg: 'rgba(0,200,150,0.1)', color: '#00c896' },
  }[s] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  return (
    <div className="page">
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '28px',
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Disputes</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {disputes.filter(d => d[3] === 'open').length} open ·{' '}
            {disputes.filter(d => d[3] === 'resolved').length} resolved
          </p>
        </div>
        {contracts.length > 0 && (
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="btn btn-danger"
            style={{ border: 'none' }}
          >
            {showForm ? 'Cancel' : '+ Raise Dispute'}
          </button>
        )}
      </div>

      {success && <div className="success-box">{success}</div>}

      {/* Raise dispute form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            Raise a Dispute
          </h3>

          {error && <div className="error-box">{error}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: 'var(--muted)', marginBottom: '8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Select Active Contract</label>
            <select value={contractId} onChange={e => setContractId(e.target.value)}>
              <option value="">-- Choose contract --</option>
              {contracts.map((c, i) => (
                <option key={i} value={c[0]}>
                  {c[5]} — Rs.{Number(c[1]).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: 'var(--muted)', marginBottom: '8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Reason</label>
            <textarea
              rows={4}
              placeholder="Describe the issue in detail..."
              value={reason} onChange={e => setReason(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            onClick={handleRaise} disabled={submitting}
            className="btn btn-danger"
            style={{ border: 'none', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Submitting...' : 'Raise Dispute'}
          </button>
        </div>
      )}

      {/* Disputes list */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading disputes...</p>
      ) : disputes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            No disputes raised. Hopefully it stays that way!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {disputes.map((d, i) => {
            const sc = statusColor(d[3]);
            return (
              <div key={i} className="card">
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '12px', marginBottom: '8px',
                    }}>
                      <p style={{ fontWeight: 600, fontSize: '15px' }}>{d[6]}</p>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                      }}>{d[3]}</span>
                    </div>

                    <p style={{
                      color: 'var(--muted)', fontSize: '12px', marginBottom: '10px',
                    }}>
                      Raised by {d[5]} · Contract #{d[4]}
                      {' · '}Rs.{Number(d[7]).toLocaleString()}
                    </p>

                    <p style={{
                      fontSize: '14px', color: 'var(--text)',
                      lineHeight: 1.6, marginBottom: '12px',
                    }}>{d[2]}</p>

                    {d[3] === 'open' && (
                      <button
                        onClick={() => handleResolve(d[0])}
                        className="btn btn-ghost"
                        style={{ fontSize: '12px', padding: '8px 16px' }}
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>

                  <p style={{
                    fontSize: '12px', color: 'var(--muted)',
                    marginLeft: '16px', flexShrink: 0,
                  }}>
                    {new Date(d[8]).toLocaleDateString('en-PK', {
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
