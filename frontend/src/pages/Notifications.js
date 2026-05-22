import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function Notifications() {
  const { user, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [success, setSuccess]             = useState('');
  const [error, setError]                 = useState('');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/notifications/my`, { headers });
      setNotifications(res.data);
    } catch (err) {
      console.error('Fetch notifications error:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/${id}/read`, {}, { headers });
      setNotifications(prev =>
        prev.map(n => n[0] === id ? [n[0], n[1], n[2], 'Y', n[4]] : n)
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/notifications/read-all`, {}, { headers });
      setNotifications(prev =>
        prev.map(n => [n[0], n[1], n[2], 'Y', n[4]])
      );
      setSuccess('All notifications marked as read.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const typeStyle = (t) => ({
    bid_accepted: { bg: 'rgba(0,200,150,0.1)',  color: '#00c896', label: 'Bid Accepted' },
    payment:      { bg: 'rgba(37,99,235,0.1)',  color: '#2563eb', label: 'Payment'      },
    review:       { bg: 'rgba(245,166,35,0.1)', color: '#f5a623', label: 'Review'       },
  }[t] || {       bg: 'rgba(107,107,128,0.1)', color: '#6b6b80', label: 'General'       });

  const unreadCount = notifications.filter(n => n[3] === 'N').length;

  return (
    <div className="page">

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '28px',
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            Notifications
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {loading ? '...' : unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'You are all caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn btn-ghost"
            style={{ fontSize: '13px' }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Messages */}
      {success && <div className="success-box">{success}</div>}
      {error   && <div className="error-box">{error}</div>}

      {/* Content */}
      {loading ? (
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading notifications...</p>

      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '56px 32px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(0,255,204,0.08)',
            border: '1px solid rgba(0,255,204,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '22px',
          }}>🔔</div>
          <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
            No notifications yet
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            You will be notified when bids are accepted, payments are made, or reviews are received.
          </p>
        </div>

      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n, i) => {
            const ts     = typeStyle(n[4]);
            const isUnread = n[3] === 'N';

            return (
              <div
                key={i}
                className="card"
                onClick={() => isUnread && markRead(n[0])}
                style={{
                  borderLeft: `2px solid ${isUnread ? 'var(--teal)' : 'transparent'}`,
                  background: isUnread ? 'var(--surface)' : 'var(--surface)',
                  opacity: isUnread ? 1 : 0.55,
                  cursor: isUnread ? 'pointer' : 'default',
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: '16px',
                }}>

                  {/* Left — badge + message */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '8px', marginBottom: '8px',
                    }}>
                      <span style={{
                        background: ts.bg, color: ts.color,
                        padding: '3px 10px', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600,
                        letterSpacing: '0.02em',
                      }}>{ts.label}</span>

                      {isUnread && (
                        <span style={{
                          width: '6px', height: '6px',
                          borderRadius: '50%',
                          background: 'var(--teal)',
                          display: 'inline-block',
                          flexShrink: 0,
                        }} />
                      )}
                    </div>

                    <p style={{
                      fontSize: '14px', color: 'var(--text)',
                      lineHeight: 1.6, marginBottom: isUnread ? '8px' : 0,
                    }}>{n[1]}</p>

                    {isUnread && (
                      <p style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 500 }}>
                        Click to mark as read
                      </p>
                    )}
                  </div>

                  {/* Right — date */}
                  <p style={{
                    fontSize: '12px', color: 'var(--muted)',
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}>
                    {new Date(n[2]).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric',
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
