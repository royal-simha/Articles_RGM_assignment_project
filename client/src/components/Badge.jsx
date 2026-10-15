import React from 'react';

export const StatusBadge = ({ status }) => {
  const isPublished = status === 'published';
  return (
    <span className={`badge ${isPublished ? 'badge-published' : 'badge-draft'}`}>
      <span style={{ fontSize: '0.65rem' }}>{isPublished ? '●' : '○'}</span>
      {status}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  let badgeClass = 'badge-reader';
  if (role === 'creator') badgeClass = 'badge-creator';
  if (role === 'admin') badgeClass = 'badge-admin';

  return <span className={`badge ${badgeClass}`}>{role}</span>;
};
