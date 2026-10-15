import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="container main-content" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '6rem',
          fontWeight: 700,
          color: 'var(--accent-primary)',
          lineHeight: 1,
          display: 'block',
          marginBottom: '1rem',
        }}
      >
        404
      </span>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', marginBottom: '1rem' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
        The article, directory, or page you are looking for has been moved, renamed, or is unavailable.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Dispatches
      </Link>
    </div>
  );
};
