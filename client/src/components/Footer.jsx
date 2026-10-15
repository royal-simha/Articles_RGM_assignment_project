import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 'bold',
                }}
              >
                C
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700 }}>
                NS-Articles
              </span>
            </div>
            <p style={{ maxWidth: '340px', lineHeight: 1.6, fontSize: '0.875rem' }}>
              A modern, database-driven editorial publication engine built for discerning authors and engaged readers.
              Featuring rigorous role-based access control and persistent relational storage.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>
                  Latest Articles
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: 'var(--text-secondary)' }}>
                  Become a Creator
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: 'var(--text-secondary)' }}>
                  Reader Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Architecture
            </h4>
            <p style={{ fontSize: '0.825rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Powered by Node.js, Express, React, Vite, and Prisma ORM with normalized PostgreSQL relational modeling.
            </p>
            <span className="badge badge-published">System Status: Operational</span>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <p>© 2026 NS-Articles Publishing System. (Gajula Narasimha), (Galla Nanda Kishore) All rights reserved.</p>
          <p>Full-Stack Application · October 2026</p>
        </div>
      </div>
    </footer>
  );
};
