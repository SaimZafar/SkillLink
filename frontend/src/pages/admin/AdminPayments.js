import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/admin';

export default function AdminPayments() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [payments, setPayments]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => { fetchPayments(); }, []);

  useEffect(() => {
    let data = payments;
    if (search) data = data.filter(p =>
      p[7]?.toLowerCase().includes(search.toLowerCase()) ||
      p[6]?.toLowerCase().includes(search.toLowerCase()) ||
      p[8]?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [search, payments]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API}/payments`, { headers });
      setPayments(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const methodLabel = m => ({
    easypaisa:     'Easypaisa',
    jazzcash:      'JazzCash',
    bank_transfer: 'Bank Transfer',
    cash:          'Cash',
  }[m] || m);

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p[1]), 0);

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>Payments</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {filtered.length} payments processed on the platform
        </p>
      </div>

      {/* Revenue summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px', marginBottom: '24px',
      }}>
        {[
          {
            label: 'Total Revenue',
            value: `Rs.${totalRevenue.toLocaleString()}`,
            color: 'var(--teal)',
          },
          {
            label: 'Total Transactions',
            value: payments.length,
            color: 'var(--text)',
          },
          {
            label: 'Avg Payment',
            value: payments.length > 0
              ? `Rs.${Math.round(totalRevenue / payments.length).toLocaleString()}`
              : 'Rs.0',
            color: 'var(--yellow)',
          },
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
          placeholder="Search by project, client or freelancer..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading payments...</p>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Project</th>
                <th>Client</th>
                <th>Freelancer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--muted)', fontSize: '13px' }}>#{p[0]}</td>
                  <td style={{ fontWeight: 600, fontSize: '13px' }}>{p[7]}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{p[8]}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{p[6]}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 600, fontSize: '13px' }}>
                    Rs.{Number(p[1]).toLocaleString()}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                    {methodLabel(p[3])}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '13px' }}>
                    {new Date(p[2]).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td>
                    <span style={{
                      background: 'rgba(0,200,150,0.1)', color: '#00c896',
                      padding: '3px 10px', borderRadius: '4px',
                      fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                    }}>{p[4]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
