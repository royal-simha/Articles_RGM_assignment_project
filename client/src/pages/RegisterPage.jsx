import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('reader'); // 'reader' | 'creator'

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setFormError('Password must contain at least one letter and one number');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role });
      success('Account created successfully! Welcome to Chronicle.');
      navigate(role === 'creator' ? '/dashboard' : '/');
    } catch (err) {
      setFormError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '0.25rem',
            }}
          >
            Chronicle<span style={{ color: 'var(--accent-primary)' }}>.</span>
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create your account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Join our community of authors and readers.
          </p>
        </div>

        {formError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="regName">Full Name *</label>
            <input
              id="regName"
              type="text"
              className="form-input"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regEmail">Email Address *</label>
            <input
              id="regEmail"
              type="email"
              className="form-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Account Role Selector */}
          <div className="form-group">
            <label className="form-label">I want to:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                style={{
                  border: `2px solid ${role === 'reader' ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                  background: role === 'reader' ? 'var(--accent-light)' : 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setRole('reader')}
              >
                <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.25rem' }}>📖</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block' }}>Read & Comment</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reader Account</span>
              </div>

              <div
                style={{
                  border: `2px solid ${role === 'creator' ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                  background: role === 'creator' ? 'var(--accent-light)' : 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setRole('creator')}
              >
                <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.25rem' }}>✍️</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block' }}>Write & Publish</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Creator Account</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regPass">Password *</label>
            <input
              id="regPass"
              type="password"
              className="form-input"
              placeholder="At least 8 chars, 1 letter, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPass">Confirm Password *</label>
            <input
              id="confirmPass"
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
