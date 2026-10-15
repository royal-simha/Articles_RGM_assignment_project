import React, { useState, useEffect } from 'react';
import ApiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RoleBadge } from '../components/Badge';
import { formatDate } from '../utils/formatDate';
import { ShieldIcon, UserIcon, MessageSquareIcon, TrashIcon, CheckIcon, CloseIcon } from '../components/Icons';

export const AdminDashboardPage = () => {
  const { user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'comments' | 'categories'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category creation state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Search filter
  const [searchUser, setSearchUser] = useState('');

  const fetchStats = async () => {
    try {
      const res = await ApiClient.getAdminStats();
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getAdminUsers({ search: searchUser });
      if (res.data) setUsers(res.data);
    } catch (err) {
      toastError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getAdminComments();
      if (res.data) setComments(res.data);
    } catch (err) {
      toastError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'comments') {
      fetchComments();
    }
  }, [activeTab, searchUser]);

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await ApiClient.toggleUserStatus(userId);
      success(res.message || 'User status updated');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toastError(err.message || 'Failed to toggle user status');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await ApiClient.updateUserRole(userId, newRole);
      success('User role updated');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toastError(err.message || 'Failed to change role');
    }
  };

  const handleModerateComment = async (commentId, newStatus) => {
    try {
      await ApiClient.moderateComment(commentId, newStatus);
      success(`Comment marked as ${newStatus}`);
      fetchComments();
      fetchStats();
    } catch (err) {
      toastError(err.message || 'Failed to moderate comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await ApiClient.deleteComment(commentId);
      success('Comment removed');
      fetchComments();
      fetchStats();
    } catch (err) {
      toastError(err.message || 'Failed to delete comment');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCat(true);
    try {
      await ApiClient.createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined,
      });
      success('Category created successfully');
      setNewCatName('');
      setNewCatDesc('');
    } catch (err) {
      toastError(err.message || 'Failed to create category');
    } finally {
      setCreatingCat(false);
    }
  };

  return (
    <div className="container main-content">
      {/* Admin Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(121, 40, 202, 0.15)',
              color: '#7928ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldIcon size={18} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7928ca' }}>
            System Administration
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem' }}>Platform Control Console</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage global user permissions, oversee content moderation queues, and enforce system security policies.
        </p>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Registered Users</span>
            <p className="stat-value">{stats.totalUsers}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Readers: {stats.usersByRole?.reader || 0} · Creators: {stats.usersByRole?.creator || 0} · Admins: {stats.usersByRole?.admin || 0}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Published Articles</span>
            <p className="stat-value" style={{ color: 'var(--color-success)' }}>
              {stats.publishedPosts}
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Out of {stats.totalPosts} total ({stats.draftPosts} drafts)
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Total Comments</span>
            <p className="stat-value">{stats.totalComments}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Across all published dispatches
            </span>
          </div>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <UserIcon size={16} /> User Management
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'comments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquareIcon size={16} /> Comment Moderation
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('categories')}
        >
          🏷️ Create Category
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div>
          <div style={{ marginBottom: '1.25rem', maxWidth: '320px' }}>
            <input
              type="text"
              placeholder="Search user by name or email..."
              className="form-input"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{ height: '38px', fontSize: '0.85rem' }}
            />
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading users...</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Articles</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'var(--bg-subtle)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                              }}
                            >
                              {u.name[0]}
                            </div>
                          )}
                          <span>{u.name}</span>
                        </div>
                      </td>

                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>

                      <td>
                        <select
                          className="form-select"
                          value={u.role}
                          disabled={u.id === currentUser?.id}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                        >
                          <option value="reader">Reader</option>
                          <option value="creator">Creator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>
                        <span
                          className={`badge ${u.isActive ? 'badge-published' : 'badge-draft'}`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td>{u.postsCount || 0}</td>

                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {formatDate(u.createdAt)}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {u.id !== currentUser?.id ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.3rem 0.6rem',
                              color: u.isActive ? 'var(--color-danger)' : 'var(--color-success)',
                            }}
                            onClick={() => handleToggleUserStatus(u.id)}
                          >
                            {u.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMMENT MODERATION */}
      {activeTab === 'comments' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
              No comments to moderate.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Author</th>
                    <th>Comment Snippet</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, maxWidth: '200px' }}>
                        {c.post?.title || 'Unknown Post'}
                      </td>
                      <td>{c.author?.name || 'Reader'}</td>
                      <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{c.content}</td>
                      <td>
                        <span
                          className={`badge ${
                            c.status === 'approved'
                              ? 'badge-published'
                              : c.status === 'rejected'
                              ? 'badge-draft'
                              : 'badge-reader'
                          }`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {formatDate(c.createdAt)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {c.status !== 'approved' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: 'var(--color-success)' }}
                              onClick={() => handleModerateComment(c.id, 'approved')}
                              title="Approve Comment"
                            >
                              <CheckIcon size={14} />
                            </button>
                          )}
                          {c.status !== 'rejected' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: 'var(--color-warning)' }}
                              onClick={() => handleModerateComment(c.id, 'rejected')}
                              title="Reject Comment"
                            >
                              <CloseIcon size={14} />
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', color: 'var(--color-danger)' }}
                            onClick={() => handleDeleteComment(c.id)}
                            title="Delete Comment"
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREATE CATEGORY */}
      {activeTab === 'categories' && (
        <div className="card" style={{ maxWidth: '560px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            Create New Editorial Category
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Categories help readers discover articles across specific domains of knowledge.
          </p>

          <form onSubmit={handleCreateCategory}>
            <div className="form-group">
              <label className="form-label" htmlFor="catName">Category Name *</label>
              <input
                id="catName"
                type="text"
                className="form-input"
                placeholder="e.g. Cloud Infrastructure"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="catDesc">Description</label>
              <textarea
                id="catDesc"
                className="form-textarea"
                placeholder="Brief summary of topics covered in this category..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={creatingCat || !newCatName.trim()}
            >
              {creatingCat ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
