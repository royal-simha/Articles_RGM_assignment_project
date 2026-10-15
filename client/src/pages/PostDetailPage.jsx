import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ApiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArticleDetailSkeleton } from '../components/SkeletonLoader';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { MarkdownRenderer } from '../utils/markdown';
import { formatDate, formatTimeAgo } from '../utils/formatDate';
import { calculateReadingTime } from '../utils/readingTime';
import { EditIcon, TrashIcon, MessageSquareIcon, ArrowRightIcon } from '../components/Icons';

export const PostDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New comment input
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const postRes = await ApiClient.getPostBySlug(slug);
        if (postRes.data) {
          setPost(postRes.data);
          // Fetch comments
          const commentsRes = await ApiClient.getPostComments(postRes.data.id);
          if (commentsRes.data) {
            setComments(commentsRes.data);
          }
        }
      } catch (err) {
        setError(err.message || 'Article not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [slug]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await ApiClient.addComment(post.id, commentContent.trim());
      if (res.data) {
        setComments((prev) => [res.data, ...prev]);
        setCommentContent('');
        success('Comment posted successfully');
      }
    } catch (err) {
      toastError(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const res = await ApiClient.updateComment(commentId, editContent.trim());
      if (res.data) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, content: res.data.content, updatedAt: res.data.updatedAt } : c))
        );
        setEditingCommentId(null);
        success('Comment updated');
      }
    } catch (err) {
      toastError(err.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await ApiClient.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      success('Comment removed');
    } catch (err) {
      toastError(err.message || 'Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    setDeletingPost(true);
    try {
      await ApiClient.deletePost(post.id);
      success('Article deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      toastError(err.message || 'Failed to delete article');
      setDeletingPost(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container main-content">
        <ArticleDetailSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container main-content" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Article Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {error || "The requested article does not exist or you don't have permission to view it."}
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Dispatches
        </Link>
      </div>
    );
  }

  const isAuthor = user && user.id === post.authorId;
  const canManagePost = isAuthor || isAdmin;
  const readingTime = calculateReadingTime(post.content);

  return (
    <article className="container-narrow main-content">
      {/* Category & Status Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {post.category && (
          <Link
            to={`/?category=${post.category.slug}`}
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--accent-primary)',
            }}
          >
            {post.category.name}
          </Link>
        )}
        <span style={{ color: 'var(--text-muted)' }}>•</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{readingTime}</span>
        {post.status === 'draft' && <StatusBadge status={post.status} />}
      </div>

      {/* Article Title */}
      <h1 className="article-title">{post.title}</h1>

      {/* Lead Excerpt */}
      {post.summary && <p className="article-summary-lead">{post.summary}</p>}

      {/* Author & Publish Metadata */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 0',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {post.author?.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {post.author?.name[0]}
            </div>
          )}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{post.author?.name}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Published {formatDate(post.publishedAt || post.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Controls for Author / Admin */}
        {canManagePost && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/editor/${post.id}`} className="btn btn-secondary btn-sm">
              <EditIcon size={14} /> Edit
            </Link>
            <button
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--color-danger)', borderColor: 'rgba(201, 42, 42, 0.3)' }}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <TrashIcon size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="article-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      {/* Main Body Markdown Content */}
      <MarkdownRenderer content={post.content} />

      {/* Tags Section */}
      {post.tags && post.tags.length > 0 && (
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Filed Under
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {post.tags.map((tag) => (
              <Link key={tag.id || tag.slug} to={`/?tag=${tag.slug}`} className="tag-chip">
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio Card */}
      {post.author && (
        <div
          style={{
            marginTop: '3.5rem',
            padding: '2rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          {post.author.avatarUrl && (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-primary)' }}>
              Written by
            </span>
            <h3 style={{ fontSize: '1.2rem', margin: '0.2rem 0 0.4rem' }}>{post.author.name}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {post.author.bio || 'Contributing writer and software artisan on Chronicle Editorial.'}
            </p>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <section className="comments-section" id="comments">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
          <MessageSquareIcon size={22} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Discussion ({comments.length})
          </h2>
        </div>

        {/* Comment Submission Form */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} style={{ marginBottom: '3rem' }}>
            <div className="form-group">
              <label htmlFor="commentInput" className="form-label">
                Add to the conversation as <strong>{user.name}</strong>
              </label>
              <textarea
                id="commentInput"
                className="form-textarea"
                placeholder="Share your thoughts, questions, or critical perspective..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submittingComment || !commentContent.trim()}
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div
            style={{
              padding: '1.5rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2.5rem',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
              Join the conversation. Readers and creators can sign in to participate in discussion.
            </p>
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In to Comment
            </Link>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No comments on this article yet. Be the first to share your insights!
          </p>
        ) : (
          <div>
            {comments.map((comment) => {
              const isCommentAuthor = user && user.id === comment.authorId;
              const canModerate = isCommentAuthor || isAuthor || isAdmin;

              return (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      {comment.author?.avatarUrl ? (
                        <img
                          src={comment.author.avatarUrl}
                          alt={comment.author.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--bg-subtle)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                        >
                          {comment.author?.name ? comment.author.name[0] : 'U'}
                        </div>
                      )}
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {comment.author?.name || 'Reader'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Comment Controls */}
                    {canModerate && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {isCommentAuthor && editingCommentId !== comment.id && (
                          <button
                            className="btn-icon"
                            style={{ padding: '0.3rem' }}
                            onClick={() => handleStartEditComment(comment)}
                            title="Edit Comment"
                          >
                            <EditIcon size={14} />
                          </button>
                        )}
                        <button
                          className="btn-icon"
                          style={{ padding: '0.3rem', color: 'var(--color-danger)' }}
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Delete Comment"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Body / Edit Form */}
                  {editingCommentId === comment.id ? (
                    <div style={{ marginTop: '0.75rem' }}>
                      <textarea
                        className="form-textarea"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSaveEditComment(comment.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-body">{comment.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Article"
        footer={
          <>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deletingPost}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDeletePost}
              disabled={deletingPost}
            >
              {deletingPost ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to permanently delete <strong>"{post.title}"</strong>?
          This action cannot be undone and will delete all associated comments.
        </p>
      </Modal>
    </article>
  );
};
