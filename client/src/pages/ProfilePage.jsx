import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RoleBadge } from '../components/Badge';
import { formatDate } from '../utils/formatDate';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });
      success('Profile updated successfully');
    } catch (err) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-narrow main-content">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Profile & Account Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your public author persona and account details.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {/* User Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {name ? name[0] : 'U'}
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <RoleBadge role={user?.role} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Member since {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="profileName">Display Name *</label>
            <input
              id="profileName"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profileBio">Author Biography</label>
            <textarea
              id="profileBio"
              className="form-textarea"
              placeholder="Tell readers about your background, publications, or engineering interests..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profileAvatar">Avatar Image URL</label>
            <input
              id="profileAvatar"
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <span className="form-hint">Paste a link to a portrait or square avatar photo.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
