import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function Contracts() {
  const { user, token } = useAuth();
  const role = user?.role;
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/contracts/my`, { headers });
      setContracts(res.data);
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
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Contracts
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          {contracts.length} contract{contracts.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading contracts...</p>
      ) : contracts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            No contracts yet.
            {role === 'client'
              ? ' Accept a bid to create your first contract.'
              : ' Win a bid to get your first contract.'}
          </p>
          <button onClick={() => navigate('/dashboard/bids')} className="btn btn-primary">
            {role === 'client' ? 'View Bids' : 'Browse Projects'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contracts.map((c, i) => {
            const sc = statusColor(c[4]);
            const otherName = role === 'client' ? c[7] : c[7];
            const otherLabel = role === 'client' ? 'Freelancer' : 'Client';

            return (
              <div key={i} className="card">
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1 }}>
                    {/* Title row */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '12px', marginBottom: '8px',
                    }}>
                      <p style={{ fontWeight: 600, fontSize: '15px' }}>{c[5]}</p>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                      }}>{c[4]}</span>
                    </div>

                    {/* Meta row */}
                    <div style={{
                      display: 'flex', gap: '24px',
                      flexWrap: 'wrap', marginBottom: '16px',
                    }}>
                      <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>
                        Rs.{Number(c[1]).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {otherLabel}: {otherName}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Started: {new Date(c[2]).toLocaleDateString('en-PK', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Due: {new Date(c[3]).toLocaleDateString('en-PK', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {role === 'client' && c[4] === 'active' && (
                        <button
                          onClick={() => navigate('/dashboard/payments')}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '8px 16px' }}
                        >
                          Record Payment
                        </button>
                      )}
                      {c[4] === 'completed' && (
                        <button
                          onClick={() => navigate('/dashboard/reviews')}
                          className="btn btn-ghost"
                          style={{ fontSize: '12px', padding: '8px 16px' }}
                        >
                          Leave Review
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/dashboard/disputes')}
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '8px 16px' }}
                      >
                        Raise Dispute
                      </button>
                    </div>
                  </div>

                  {/* Contract ID */}
                  <p style={{
                    fontSize: '11px', color: 'var(--muted)',
                    marginLeft: '16px', flexShrink: 0,
                  }}>
                    #{c[0]}
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
