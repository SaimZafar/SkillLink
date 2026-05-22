import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const { user, logout } = useAuth();

  const links = [
    { to: '/admin',               label: 'Dashboard'     },
    { to: '/admin/users',         label: 'Users'         },
    { to: '/admin/projects',      label: 'Projects'      },
    { to: '/admin/bids',          label: 'Bids'          },
    { to: '/admin/contracts',     label: 'Contracts'     },
    { to: '/admin/payments',      label: 'Payments'      },
    { to: '/admin/reviews',       label: 'Reviews'       },
    { to: '/admin/skills',        label: 'Skills'        },
    { to: '/admin/disputes',      label: 'Disputes'      },
    { to: '/admin/notifications', label: 'Notifications' },
  ];

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
        gap: '10px', marginBottom: '16px', paddingLeft: '8px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--orange)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '16px', color: '#fff',
        }}>S</div>
        <span style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700, fontSize: '17px', letterSpacing: '-0.04em',
        }}>SkillLink</span>
      </div>

      {/* Admin badge */}
      <div style={{ marginBottom: '24px', paddingLeft: '8px' }}>
        <span style={{
          background: 'rgba(255,77,0,0.1)',
          color: 'var(--orange)',
          padding: '3px 10px', borderRadius: '4px',
          fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.04em',
        }}>ADMIN PANEL</span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {links.map((link, i) => (
          <NavLink
            key={i}
            to={link.to}
            end={link.to === '/admin'}
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
                ? '2px solid var(--orange)' : '2px solid transparent',
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
            background: 'rgba(255,77,0,0.1)',
            border: '1px solid rgba(255,77,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700, fontSize: '13px', color: 'var(--orange)',
          }}>A</div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{user?.email}</p>
          </div>
        </div>

        <button onClick={logout} style={{
          width: '100%', padding: '9px',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--muted)',
          fontSize: '13px', fontWeight: 500,
          cursor: 'pointer',
        }}>Sign out</button>
      </div>
    </div>
  );
}
