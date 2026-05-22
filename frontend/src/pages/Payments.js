import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function Payments() {
  const { user, token } = useAuth();
  const role = user?.role;
  const headers = { Authorization: `Bearer ${token}` };

  const [payments, setPayments]     = useState([]);
  const [contracts, setContracts]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');

  // Form state
  const [contractId, setContractId] = useState('');
  const [amount, setAmount]         = useState('');
  const [method, setMethod]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, contRes] = await Promise.all([
        axios.get(`${API}/payments/my`, { headers }),
        axios.get(`${API}/contracts/my`, { headers }),
      ]);
      setPayments(payRes.data);
      setContracts(contRes.data.filter(c => c[4] === 'active'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!contractId || !amount || !method) {
      setError('All fields are required');
      return;
    }
    setError(''); setSubmitting(true);
    try {
      await axios.post(`${API}/payments`, {
        contract_id: contractId,
        amount,
        method,
      }, { headers });
      setSuccess('Payment recorded and contract marked as completed!');
      setShowForm(false);
      setContractId(''); setAmount(''); setMethod('');
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const methodLabel = m => ({
    easypaisa:     'Easypaisa',
    jazzcash:      'JazzCash',
    bank_transfer: 'Bank Transfer',
    cash:          'Cash',
  }[m] || m);

  const statusColor = s => ({
    paid:    { bg: 'rgba(0,200,150,0.1)', color: '#00c896' },
    pending: { bg: 'rgba(245,166,35,0.1)', color: '#f5a623' },
  }[s] || { bg: 'rgba(90,88,112,0.1)', color: '#5a5870' });

  return (
    <div className="page">
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '28px',
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            {role === 'client' ? 'Payments' : 'Earnings'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {role === 'client'
              ? `${payments.length} payment${payments.length !== 1 ? 's' : ''} made`
              : `${payments.length} payment${payments.length !== 1 ? 's' : ''} received`}
          </p>
        </div>
        {role === 'client' && contracts.length > 0 && (
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Record Payment'}
          </button>
        )}
      </div>

      {success && <div className="success-box">{success}</div>}

      {/* Payment form */}
      {showForm && role === 'client' && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
            Record a Payment
          </h3>

          {error && <div className="error-box">{error}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: 'var(--muted)', marginBottom: '8px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>Select Contract</label>
            <select value={contractId} onChange={e => {
              setContractId(e.target.value);
              const c = contracts.find(c => c[0] == e.target.value);
              if (c) setAmount(c[1]);
            }}>
              <option value="">-- Choose active contract --</option>
              {contracts.map((c, i) => (
                <option key={i} value={c[0]}>
                  {c[5]} — Rs.{Number(c[1]).toLocaleString()} ({c[7]})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 600,
                color: 'var(--muted)', marginBottom: '8px',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>Amount (Rs.)</label>
              <input
                type="number" placeholder="e.g. 15000"
                value={amount} onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 600,
                color: 'var(--muted)', marginBottom: '8px',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>Payment Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)}>
                <option value="">-- Select method --</option>
                <option value="easypaisa">Easypaisa</option>
                <option value="jazzcash">JazzCash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>

          <button
            onClick={handlePay} disabled={submitting}
            className="btn btn-primary"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Processing...' : 'Record Payment'}
          </button>
        </div>
      )}

      {/* Payments list */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      ) : payments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {role === 'client'
              ? 'No payments made yet. Complete a contract to record a payment.'
              : 'No earnings yet. Complete a contract to get paid.'}
          </p>
        </div>
      ) : (
        <>
          {/* Total earnings/spent */}
          <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div>
                <p style={{
                  fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
                  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px',
                }}>
                  {role === 'client' ? 'Total Spent' : 'Total Earned'}
                </p>
                <p style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontSize: '28px', fontWeight: 800,
                  color: 'var(--green)', letterSpacing: '-0.04em',
                }}>
                  Rs.{payments.reduce((sum, p) => sum + Number(p[1]), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
                  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px',
                }}>Transactions</p>
                <p style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontSize: '28px', fontWeight: 800,
                  color: 'var(--text)', letterSpacing: '-0.04em',
                }}>{payments.length}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', overflow: 'hidden',
          }}>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>{role === 'client' ? 'Freelancer' : 'Client'}</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const sc = statusColor(p[4]);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{p[5]}</td>
                      <td style={{ color: 'var(--muted)' }}>{p[6]}</td>
                      <td style={{ color: 'var(--green)', fontWeight: 600 }}>
                        Rs.{Number(p[1]).toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{methodLabel(p[3])}</td>
                      <td style={{ color: 'var(--muted)' }}>
                        {new Date(p[2]).toLocaleDateString('en-PK', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td>
                        <span style={{
                          background: sc.bg, color: sc.color,
                          padding: '3px 10px', borderRadius: '4px',
                          fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                        }}>{p[4]}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
