import React from 'react';
import { BookOpenIcon } from './Icons';

export const EmptyState = ({ title = 'No articles found', description = 'Try refining your search terms or selecting a different category.', action = null }) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 1.5rem',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-subtle)',
        maxWidth: '560px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <BookOpenIcon size={28} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: action ? '1.5rem' : 0 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
