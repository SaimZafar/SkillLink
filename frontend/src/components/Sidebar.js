import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  const clientLinks = [
  { to: '/dashboard',                label: 'Dashboard'      },
  { to: '/dashboard/projects',       label: 'My Projects'    },
  { to: '/dashboard/bids',           label: 'Bids Received'  },
  { to: '/dashboard/contracts',      label: 'Contracts'      },
  { to: '/dashboard/payments',       label: 'Payments'       },
  { to: '/dashboard/reviews',        label: 'Reviews'        },
  { to: '/dashboard/disputes',       label: 'Disputes'       },
  { to: '/dashboard/notifications',  label: 'Notifications'  },
];

const freelancerLinks = [
  { to: '/dashboard',                label: 'Dashboard'       },
  { to: '/dashboard/projects',       label: 'Browse Projects' },
  { to: '/dashboard/bids',           label: 'My Bids'         },
  { to: '/dashboard/contracts',      label: 'Contracts'       },
  { to: '/dashboard/payments',       label: 'Earnings'        },
  { to: '/dashboard/reviews',        label: 'Reviews'         },
  { to: '/dashboard/disputes',       label: 'Disputes'        },
  { to: '/dashboard/notifications',  label: 'Notifications'   },
];

  const links = role === 'client' ? clientLinks : freelancerLinks;

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      position: 'fixed',
      left: 0, top: 0,
      width: '240px',
      height: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '10px', marginBottom: '36px', paddingLeft: '8px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '16px', color: '#000',
        }}>S</div>
        <span style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700, fontSize: '17px', letterSpacing: '-0.04em',
        }}>SkillLink</span>
      </div>

      {/* Role badge */}
      <div style={{
        marginBottom: '24px', paddingLeft: '8px',
      }}>
        <span style={{
          background: role === 'client'
            ? 'rgba(255,77,0,0.1)' : 'rgba(0,255,204,0.08)',
          color: role === 'client' ? 'var(--orange)' : 'var(--teal)',
          padding: '3px 10px', borderRadius: '4px',
          fontSize: '11px', fontWeight: 600,
          textTransform: 'capitalize', letterSpacing: '0.04em',
        }}>{role}</span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {links.map((link, i) => (
          <NavLink
            key={i}
            to={link.to}
            end={link.to === '/dashboard'}
            style={({ isActive }) => ({
              display: 'block',
              padding: '9px 12px',
              borderRadius: '8px',
              marginBottom: '2px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text)' : 'var(--muted)',
              background: isActive ? 'var(--surface2)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
              borderLeft: isActive
                ? '2px solid var(--teal)' : '2px solid transparent',
            })}
          >{link.label}</NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '16px',
        marginTop: '16px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '10px', marginBottom: '12px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(0,255,204,0.1)',
            border: '1px solid rgba(0,255,204,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700, fontSize: '13px', color: 'var(--teal)',
          }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              fontSize: '13px', fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{user?.name}</p>
            <p style={{
              fontSize: '11px', color: 'var(--muted)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{user?.email}</p>
          </div>
        </div>

        <button onClick={logout} style={{
          width: '100%', padding: '9px',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--muted)',
          fontSize: '13px', fontWeight: 500,
        }}>Sign out</button>
      </div>
    </div>
  );
}
