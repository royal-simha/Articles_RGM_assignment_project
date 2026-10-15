import React from 'react';

export const BlogCardSkeleton = () => (
  <div className="blog-card" style={{ height: '380px' }}>
    <div className="skeleton" style={{ height: '200px', width: '100%' }} />
    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: '14px', width: '30%' }} />
      <div className="skeleton" style={{ height: '24px', width: '85%' }} />
      <div className="skeleton" style={{ height: '16px', width: '95%' }} />
      <div className="skeleton" style={{ height: '16px', width: '70%' }} />
      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
        <div className="skeleton" style={{ height: '12px', width: '35%' }} />
      </div>
    </div>
  </div>
);

export const ArticleDetailSkeleton = () => (
  <div className="container-narrow">
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div className="skeleton" style={{ height: '20px', width: '120px', margin: '0 auto 1rem' }} />
      <div className="skeleton" style={{ height: '48px', width: '90%', margin: '0 auto 1rem' }} />
      <div className="skeleton" style={{ height: '20px', width: '60%', margin: '0 auto' }} />
    </div>
    <div className="skeleton" style={{ height: '420px', width: '100%', borderRadius: '16px', marginBottom: '2rem' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="skeleton" style={{ height: '18px', width: '100%' }} />
      <div className="skeleton" style={{ height: '18px', width: '96%' }} />
      <div className="skeleton" style={{ height: '18px', width: '92%' }} />
      <div className="skeleton" style={{ height: '18px', width: '98%' }} />
    </div>
  </div>
);
