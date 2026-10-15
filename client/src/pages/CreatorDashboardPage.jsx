import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { formatDate } from '../utils/formatDate';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, BookOpenIcon, BarChartIcon } from '../components/Icons';

export const CreatorDashboardPage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status toggle loading
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCreatorPosts = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getMyPosts({ status: filterStatus, search: searchQuery });
      if (res.data) {
        setPosts(res.data.posts || []);
        setStats(res.data.stats || { total: 0, published: 0, draft: 0 });
      }
    } catch (err) {
      toastError(err.message || 'Failed to load creator posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorPosts();
  }, [filterStatus, searchQuery]);

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    setUpdatingId(post.id);

    try {
      await ApiClient.updatePost(post.id, { status: newStatus });
      success(`Article status changed to ${newStatus}`);
      fetchCreatorPosts();
    } catch (err) {
      toastError(err.message || 'Failed to update article status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setDeleting(true);

    try {
      await ApiClient.deletePost(postToDelete.id);
      success('Article deleted successfully');
      setPostToDelete(null);
      fetchCreatorPosts();
    } catch (err) {
      toastError(err.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container main-content">
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-primary)',
            }}
          >
            Author Workspace
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', marginTop: '0.2rem' }}>
            Creator Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome back, {user?.name}. Manage your drafts, publish dispatches, and track audience discussion.
          </p>
        </div>

        <Link to="/editor" className="btn btn-primary">
          <PlusIcon size={18} /> New Article
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Articles</span>
          <p className="stat-value">{stats.total}</p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Published</span>
          <p className="stat-value" style={{ color: 'var(--color-success)' }}>
            {stats.published}
          </p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Drafts</span>
          <p className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {stats.draft}
          </p>
        </div>

        <div className="stat-card">
          <span className="stat-label">Role</span>
          <p className="stat-value" style={{ fontSize: '1.5rem', textTransform: 'capitalize' }}>
            {user?.role}
          </p>
        </div>
      </div>

      {/* Controls: Search and Status Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          background: 'var(--bg-card)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${filterStatus === '' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('')}
          >
            All ({stats.total})
          </button>
          <button
            className={`btn btn-sm ${filterStatus === 'published' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('published')}
          >
            Published ({stats.published})
          </button>
          <button
            className={`btn btn-sm ${filterStatus === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('draft')}
          >
            Drafts ({stats.draft})
          </button>
        </div>

        {/* Search within creator posts */}
        <div style={{ position: 'relative', width: '280px' }}>
          <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <SearchIcon size={16} />
          </div>
          <input
            type="text"
            placeholder="Filter by title..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', height: '36px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your articles...
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No articles match this view"
          description={
            searchQuery || filterStatus
              ? 'Try adjusting your status filter or search keyword.'
              : "You haven't written any articles yet. Create your first draft today!"
          }
          action={
            <Link to="/editor" className="btn btn-primary btn-sm">
              <PlusIcon size={16} /> Start Writing
            </Link>
          }
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Article Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Comments</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td style={{ fontWeight: 600, maxWidth: '320px' }}>
                    <Link
                      to={`/posts/${post.slug}`}
                      style={{ color: 'var(--text-primary)', transition: 'color 0.15s' }}
                    >
                      {post.title}
                    </Link>
                  </td>

                  <td>
                    {post.category ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {post.category.name}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Uncategorized</span>
                    )}
                  </td>

                  <td>
                    <StatusBadge status={post.status} />
                  </td>

                  <td style={{ color: 'var(--text-muted)' }}>
                    {post.commentsCount || 0}
                  </td>

                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {formatDate(post.updatedAt)}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                      {/* Publish / Unpublish Toggle */}
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleToggleStatus(post)}
                        disabled={updatingId === post.id}
                        title={post.status === 'published' ? 'Revert to Draft' : 'Publish to Live'}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        {updatingId === post.id
                          ? '...'
                          : post.status === 'published'
                          ? 'Unpublish'
                          : 'Publish'}
                      </button>

                      {/* Edit */}
                      <Link
                        to={`/editor/${post.id}`}
                        className="btn-icon"
                        style={{ padding: '0.35rem' }}
                        title="Edit Article"
                      >
                        <EditIcon size={14} />
                      </Link>

                      {/* Delete */}
                      <button
                        className="btn-icon"
                        style={{ padding: '0.35rem', color: 'var(--color-danger)' }}
                        onClick={() => setPostToDelete(post)}
                        title="Delete Article"
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        title="Delete Article Confirmation"
        footer={
          <>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPostToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong>"{postToDelete?.title}"</strong>?
          This will immediately remove the article and its associated comments from the database.
        </p>
      </Modal>
    </div>
  );
};
