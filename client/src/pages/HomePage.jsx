import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ApiClient from '../api/client';
import { BlogCard } from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { SearchIcon, ArrowRightIcon } from '../components/Icons';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { calculateReadingTime } from '../utils/readingTime';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [inputSearch, setInputSearch] = useState(searchQuery);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await ApiClient.getCategories();
        if (res.data) setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch published posts whenever params change
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ApiClient.getPosts({
          page: currentPage,
          limit: 9,
          search: searchQuery,
          category: selectedCategory,
        });
        if (res.data) {
          setPosts(res.data);
          setPagination(res.meta || { page: 1, totalPages: 1, total: res.data.length });
        }
      } catch (err) {
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, searchQuery, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (inputSearch.trim()) {
      params.set('search', inputSearch.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleCategoryClick = (catSlug) => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategory === catSlug) {
      params.delete('category');
    } else {
      params.set('category', catSlug);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const featuredPost = posts.length > 0 && currentPage === 1 && !searchQuery ? posts[0] : null;
  const gridPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <div className="container main-content">
      {/* Editorial Hero Header */}
      <section className="hero-section">
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            marginBottom: '0.8rem',
            display: 'inline-block',
          }}
        >
          Curated Editorial Publication
        </span>
        <h1 className="hero-headline">
          Ideas, Architectures, and the Craft of Modern Engineering.
        </h1>
        <p className="hero-subtext">
          A dedicated space for software artisans, systems thinkers, and readers exploring the boundaries of technology.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            maxWidth: '540px',
            margin: '0 auto',
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }}>
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            placeholder="Search articles by title, topic, or keyword..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '2.75rem',
              paddingRight: '6.5rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{
              position: 'absolute',
              right: '0.4rem',
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 1rem',
            }}
          >
            Search
          </button>
        </form>
      </section>

      {/* Category Pills Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '2.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem' }}>
          Filters:
        </span>
        <button
          className={`category-pill ${!selectedCategory ? 'active' : ''}`}
          onClick={() => handleCategoryClick('')}
        >
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${selectedCategory === cat.slug ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.slug)}
          >
            {cat.name}
            {cat.postsCount !== undefined && (
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({cat.postsCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Featured Top Story (Only on Page 1 without search filter) */}
      {featuredPost && (
        <article className="featured-story">
          <Link to={`/posts/${featuredPost.slug}`} className="featured-image-wrapper">
            <img
              src={featuredPost.coverImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'}
              alt={featuredPost.title}
            />
          </Link>
          <div className="featured-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-creator">Top Story</span>
              {featuredPost.category && (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {featuredPost.category.name}
                </span>
              )}
            </div>

            <h2 className="featured-title">
              <Link to={`/posts/${featuredPost.slug}`}>{featuredPost.title}</Link>
            </h2>

            <p className="featured-summary">{featuredPost.summary}</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div className="author-meta">
                {featuredPost.author?.avatarUrl ? (
                  <img src={featuredPost.author.avatarUrl} alt={featuredPost.author.name} className="author-avatar" />
                ) : (
                  <div className="author-avatar" style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', textAlign: 'center', lineHeight: '30px' }}>
                    {featuredPost.author?.name[0]}
                  </div>
                )}
                <div>
                  <span style={{ fontWeight: 600, display: 'block', fontSize: '0.875rem' }}>
                    {featuredPost.author?.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(featuredPost.publishedAt)} · {calculateReadingTime(featuredPost.content)}
                  </span>
                </div>
              </div>

              <Link to={`/posts/${featuredPost.slug}`} className="btn btn-outline btn-sm">
                Read Story <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
        </article>
      )}

      {/* Articles Grid Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory ? `Category: ${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}` : 'Latest Dispatches'}
        </h2>
        {pagination.total > 0 && (
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing {posts.length} of {pagination.total} articles
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: '2rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <p><strong>Error loading articles:</strong> {error}</p>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="blog-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <BlogCardSkeleton key={n} />
          ))}
        </div>
      ) : gridPosts.length === 0 && !featuredPost ? (
        /* Empty State */
        <EmptyState
          title="No articles found"
          description={
            searchQuery || selectedCategory
              ? "We couldn't find any articles matching your search criteria. Try a different query or reset filters."
              : 'There are currently no published articles in the archive. Check back soon!'
          }
          action={
            (searchQuery || selectedCategory) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setInputSearch('');
                  setSearchParams({});
                }}
              >
                Clear Filters
              </button>
            )
          }
        />
      ) : (
        /* Blog Cards Grid */
        <div className="blog-grid">
          {gridPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              className={`btn btn-sm ${pageNum === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button
            className="btn btn-secondary btn-sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
