import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { SunIcon, MoonIcon, EditIcon, ShieldIcon, BarChartIcon, UserIcon } from './Icons';

export const Navbar = () => {
  const { user, isAuthenticated, isCreator, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <div className="nav-brand-logo">
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 'bold' }}>
              NS
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', letterSpacing: '-0.03em' }}>
            NS-Articles<span style={{ color: 'var(--accent-primary)' }}>.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
                Explore
              </NavLink>
            </li>

            {isCreator && (
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <BarChartIcon size={16} />
                    Dashboard
                  </span>
                </NavLink>
              </li>
            )}

            {isCreator && (
              <li>
                <NavLink to="/editor" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <EditIcon size={16} />
                    Write Article
                  </span>
                </NavLink>
              </li>
            )}

            {isAdmin && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldIcon size={16} />
                    Admin
                  </span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Action Controls & User Dropdown */}
        <div className="nav-actions">
          {/* Theme Toggle */}
          <button
            className="btn-icon"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
          </button>

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  padding: '0.35rem 0.75rem 0.35rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {user.name[0]}
                  </div>
                )}
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>▼</span>
              </button>

              {menuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 0.5rem)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '200px',
                      zIndex: 100,
                      padding: '0.5rem 0',
                    }}
                  >
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginTop: '0.35rem',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <UserIcon size={16} />
                      Profile Settings
                    </Link>

                    {isCreator && (
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <BarChartIcon size={16} />
                        Creator Dashboard
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <ShieldIcon size={16} />
                        Admin Console
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-light)', margin: '0.35rem 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        padding: '0.65rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--color-danger)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-danger-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
