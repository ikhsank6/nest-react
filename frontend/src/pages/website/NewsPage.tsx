import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Eye, Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { websiteService, type NewsItem, type NewsCategory } from '@/services/website.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Base URL without /api for image paths that already include /api
const BASE_URL = API_URL.replace('/api', '');

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadNews();
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const data = await websiteService.getNewsCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadNews = async () => {
    setLoading(true);
    try {
      const page = parseInt(searchParams.get('page') || '1');
      const search = searchParams.get('search') || undefined;
      const category = searchParams.get('category') || undefined;

      const result = await websiteService.getNewsList({
        page,
        limit: 9,
        search,
        category,
      });

      setNewsList(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (category) params.set('category', category);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Banner */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-lime-500/10 text-lime-600 dark:text-lime-400 rounded-full text-sm font-medium mb-4">
              📰 News & Updates
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Latest News
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay informed with our latest updates, announcements, and insights.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-muted border border-transparent focus:border-foreground/20 outline-none transition-all"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? 'bg-foreground text-background'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.uuid}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-foreground text-background'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
            </div>
          ) : newsList.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className="text-xl font-semibold mb-2">No news found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsList.map((news) => (
                  <Link
                    key={news.uuid}
                    to={`/news/${news.slug}`}
                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {news.image ? (
                        <img
                          src={getImageUrl(news.image.path) || ''}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">📰</span>
                        </div>
                      )}
                      {news.category && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-foreground text-background text-xs font-medium rounded-full">
                          {news.category.name}
                        </span>
                      )}
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                        {news.title}
                      </h3>
                      {news.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {news.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(news.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {news.viewCount}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {meta.lastPage > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(meta.currentPage - 1)}
                    disabled={meta.currentPage === 1}
                    className="p-3 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: meta.lastPage }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === meta.lastPage ||
                        Math.abs(page - meta.currentPage) <= 1
                    )
                    .map((page, index, array) => {
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <span key={`ellipsis-${page}`}>
                            <span className="px-2 text-muted-foreground">…</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`w-12 h-12 rounded-full font-medium transition-colors ${
                                page === meta.currentPage
                                  ? 'bg-foreground text-background'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {page}
                            </button>
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-12 h-12 rounded-full font-medium transition-colors ${
                            page === meta.currentPage
                              ? 'bg-foreground text-background'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                  <button
                    onClick={() => handlePageChange(meta.currentPage + 1)}
                    disabled={meta.currentPage === meta.lastPage}
                    className="p-3 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
