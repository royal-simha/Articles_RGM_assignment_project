import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { calculateReadingTime } from '../utils/readingTime';
import { MessageSquareIcon } from './Icons';

export const BlogCard = ({ post }) => {
  const fallbackCover = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
  const readingTime = calculateReadingTime(post.content || '');

  return (
    <article className="blog-card">
      <Link to={`/posts/${post.slug}`} className="blog-card-image" tabIndex={-1}>
        <img
          src={post.coverImageUrl || fallbackCover}
          alt={post.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackCover;
          }}
        />
      </Link>

      <div className="blog-card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
          {post.category && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {post.category.name}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {readingTime}
          </span>
        </div>

        <h3 className="blog-card-title">
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="blog-card-excerpt">
          {post.summary || post.content?.substring(0, 140) + '...'}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag.id || tag.slug} className="tag-chip">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="blog-card-footer">
          <div className="author-meta">
            {post.author?.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="author-avatar"
              />
            ) : (
              <div
                className="author-avatar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--accent-light)',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {post.author?.name ? post.author.name[0] : 'U'}
              </div>
            )}
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', lineHeight: 1.2 }}>
                {post.author?.name || 'Anonymous'}
              </span>
              <span style={{ fontSize: '0.75rem' }}>
                {formatDate(post.publishedAt || post.createdAt)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
            <MessageSquareIcon size={14} />
            <span>{post.commentsCount || 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
