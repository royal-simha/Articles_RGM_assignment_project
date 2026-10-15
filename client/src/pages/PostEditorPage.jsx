import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ApiClient from '../api/client';
import { useToast } from '../context/ToastContext';
import { MarkdownRenderer } from '../utils/markdown';
import { ArrowRightIcon } from '../components/Icons';

export const PostEditorPage = () => {
  const { id } = useParams(); // If present, edit mode; else create mode
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState('draft');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Preset curated editorial cover images
  const presetImages = [
    { label: 'Minimal Workspace', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Technology / Microchips', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Code & Screen', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Abstract Architecture', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Database & Data Center', url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80' },
  ];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await ApiClient.getCategories();
        if (res.data) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch existing post if edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchPost = async () => {
      setLoading(true);
      try {
        // Find post from creator's posts
        const res = await ApiClient.getMyPosts();
        const post = res.data?.posts?.find((p) => p.id === id);

        if (!post) {
          toastError('Post not found in your drafts or articles');
          navigate('/dashboard');
          return;
        }

        setTitle(post.title || '');
        setSummary(post.summary || '');
        setContent(post.content || '');
        setCategoryId(post.categoryId || '');
        setCoverImageUrl(post.coverImageUrl || '');
        setStatus(post.status || 'draft');
        if (post.tags && Array.isArray(post.tags)) {
          setTagInput(post.tags.map((t) => t.name).join(', '));
        }
      } catch (err) {
        toastError(err.message || 'Error loading post');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (targetStatus) => {
    if (!title.trim()) {
      toastError('Article title is required');
      return;
    }
    if (!content.trim()) {
      toastError('Article content is required');
      return;
    }

    // Parse tags from comma separated string
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      summary: summary.trim() || null,
      content: content.trim(),
      categoryId: categoryId || null,
      tags,
      coverImageUrl: coverImageUrl.trim() || null,
      status: targetStatus,
    };

    setSaving(true);
    try {
      if (isEditMode) {
        const res = await ApiClient.updatePost(id, payload);
        success(`Article ${targetStatus === 'published' ? 'published' : 'saved as draft'}`);
        navigate(targetStatus === 'published' ? `/posts/${res.data.slug}` : '/dashboard');
      } else {
        const res = await ApiClient.createPost(payload);
        success(`Article ${targetStatus === 'published' ? 'published' : 'saved as draft'}`);
        navigate(targetStatus === 'published' ? `/posts/${res.data.slug}` : '/dashboard');
      }
    } catch (err) {
      toastError(err.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container main-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading article data...</p>
      </div>
    );
  }

  return (
    <div className="container main-content">
      {/* Top Bar Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <Link to="/dashboard">Studio</Link> &gt; {isEditMode ? 'Edit Article' : 'New Article'}
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginTop: '0.2rem' }}>
            {isEditMode ? 'Refine Article' : 'Compose Dispatch'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Mode toggle preview vs edit */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit Mode' : 'Markdown Preview'}
          </button>

          {/* Save Draft */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={saving}
            onClick={() => handleSubmit('draft')}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {/* Publish */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={saving}
            onClick={() => handleSubmit('published')}
          >
            {saving ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Tab */
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)' }}>
              {categories.find((c) => c.id === categoryId)?.name || 'Uncategorized'}
            </span>
            <h1 className="article-title" style={{ margin: '0.5rem 0' }}>{title || 'Untitled Article'}</h1>
            {summary && <p className="article-summary-lead">{summary}</p>}
          </div>

          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt="Cover Preview"
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}
            />
          )}

          <MarkdownRenderer content={content || '*No content written yet.*'} />
        </div>
      ) : (
        /* Editor Form */
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Editing Column */}
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="titleInput">Article Title *</label>
              <input
                id="titleInput"
                type="text"
                className="form-input"
                placeholder="e.g. Architecting Resilient Full-Stack Systems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ fontSize: '1.25rem', fontWeight: 600 }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="summaryInput">Summary / Excerpt</label>
              <textarea
                id="summaryInput"
                className="form-textarea"
                placeholder="A compelling 1-2 sentence overview for the homepage and card previews..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
              />
              <span className="form-hint">Brief summary shown on editorial article cards.</span>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="contentInput" style={{ marginBottom: 0 }}>
                  Article Content (Markdown Supported) *
                </label>
                <span className="form-hint">
                  Supports # Heading, **bold**, *italic*, &gt; quote, ```code```
                </span>
              </div>
              <textarea
                id="contentInput"
                className="form-textarea"
                placeholder="Write your article here using Markdown...&#10;&#10;## Introduction&#10;Start exploring your thoughts...&#10;&#10;```javascript&#10;const express = require('express');&#10;```"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.925rem', lineHeight: 1.6 }}
                required
              />
            </div>
          </div>

          {/* Right Sidebar: Metadata & Presets */}
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', fontWeight: 600 }}>
                Article Metadata
              </h3>

              {/* Category Dropdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="categorySelect">Topic Category</label>
                <select
                  id="categorySelect"
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="tagsInput">Tags</label>
                <input
                  id="tagsInput"
                  type="text"
                  className="form-input"
                  placeholder="react, nodejs, postgresql"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <span className="form-hint">Separate multiple tags with commas</span>
              </div>

              {/* Cover Image URL */}
              <div className="form-group">
                <label className="form-label" htmlFor="coverInput">Cover Image URL</label>
                <input
                  id="coverInput"
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>

              {/* Quick Preset Image Buttons */}
              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Preset Editorial Covers:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {presetImages.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.775rem', justifyContent: 'flex-start', textAlign: 'left' }}
                      onClick={() => setCoverImageUrl(preset.url)}
                    >
                      📷 {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Cover Preview Thumbnail */}
            {coverImageUrl && (
              <div className="card" style={{ padding: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  Cover Thumbnail Preview:
                </span>
                <img
                  src={coverImageUrl}
                  alt="Thumbnail"
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
