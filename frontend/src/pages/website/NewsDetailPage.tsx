import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Share2, ArrowRight } from 'lucide-react';
import { websiteService, type NewsItem } from '@/services/website.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Base URL without /api for image paths that already include /api
const BASE_URL = API_URL.replace('/api', '');

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadNews(slug);
    }
  }, [slug]);

  const loadNews = async (newsSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await websiteService.getNewsBySlug(newsSlug);
      setNews(data);

      // Load related news from same category
      if (data.category) {
        const related = await websiteService.getNewsList({
          category: data.category.slug,
          limit: 4,
        });
        setRelatedNews(related.data.filter((n) => n.uuid !== data.uuid).slice(0, 3));
      }
    } catch (err: any) {
      setError('Berita tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // path already includes /api prefix from backend
    return `${BASE_URL}${path}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (navigator.share && news) {
      try {
        await navigator.share({
          title: news.title,
          text: news.excerpt || '',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h1 className="text-2xl font-bold mb-4">{error || 'News not found'}</h1>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-lime-600 dark:text-lime-400 hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Image */}
      <section className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden bg-muted">
        {news.image ? (
          <img
            src={getImageUrl(news.image.path) || ''}
            alt={news.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl">📰</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Back Button */}
        <Link
          to="/news"
          className="absolute top-8 left-4 sm:left-8 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            {news.category && (
              <span className="inline-block px-3 py-1 bg-lime-500 text-white text-sm font-medium rounded-full mb-4">
                {news.category.name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {news.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(news.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {news.viewCount} views
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Share Buttons */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
            <span className="text-sm text-muted-foreground">Share:</span>
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(news.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>

          {/* Excerpt */}
          {news.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {news.excerpt}
            </p>
          )}

          {/* Main Content */}
          <article
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-lime-600 dark:prose-a:text-lime-400 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: news.content || '' }}
          />
        </div>
      </section>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Related News</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedNews.map((item) => (
                <Link
                  key={item.uuid}
                  to={`/news/${item.slug}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-40 overflow-hidden bg-muted">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image.path) || ''}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">📰</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.publishedAt)}
                      </p>
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
