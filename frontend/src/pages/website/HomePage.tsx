import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { websiteService, type HomePageData } from '@/services/website.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function HomePage() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    if (data?.carousels && data.carousels.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === data.carousels.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data?.carousels]);

  const loadHomeData = async () => {
    try {
      const homeData = await websiteService.getHomePageData();
      setData(homeData);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Hero / Carousel Section */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        {data?.carousels && data.carousels.length > 0 ? (
          <>
            {/* Slides */}
            {data.carousels.map((carousel, index) => (
              <div
                key={carousel.uuid}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Background Image */}
                {carousel.image && (
                  <img
                    src={getImageUrl(carousel.image.path) || ''}
                    alt={carousel.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

                {/* Content */}
                <div className="relative z-10 h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        {carousel.title}
                      </h1>
                      {carousel.subtitle && (
                        <p className="text-lg md:text-xl text-white/80 mb-8">
                          {carousel.subtitle}
                        </p>
                      )}
                      {carousel.linkUrl && (
                        <Link
                          to={carousel.linkUrl}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25"
                        >
                          {carousel.linkText || 'Learn More'}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {data.carousels.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      prev === 0 ? data.carousels.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      prev === data.carousels.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {data.carousels.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? 'w-8 bg-orange-500'
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          /* Default Hero */
          <div className="h-full bg-gradient-to-br from-orange-500/20 via-pink-500/10 to-purple-500/20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                    Welcome to NestReact
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  Building modern web applications with cutting-edge technology.
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* About Section */}
      {data?.aboutUs && (
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Logo/Image */}
              <div className="flex justify-center">
                {data.aboutUs.logo ? (
                  <img
                    src={getImageUrl(data.aboutUs.logo.path) || ''}
                    alt={data.aboutUs.companyName}
                    className="max-w-sm w-full rounded-2xl shadow-2xl"
                  />
                ) : (
                  <div className="w-80 h-80 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                    <span className="text-6xl">🏢</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <span className="text-sm font-medium text-orange-500 mb-2 block">
                  About Us
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {data.aboutUs.companyName}
                </h2>
                <div
                  className="text-muted-foreground mb-8 prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html:
                      data.aboutUs.description.length > 500
                        ? data.aboutUs.description.substring(0, 500) + '...'
                        : data.aboutUs.description,
                  }}
                />
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-orange-500 font-medium hover:underline"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest News Section */}
      {data?.latestNews && data.latestNews.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-sm font-medium text-orange-500 mb-2 block">
                  Latest News
                </span>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Stay Updated
                </h2>
              </div>
              <Link
                to="/news"
                className="hidden sm:inline-flex items-center gap-2 text-orange-500 font-medium hover:underline"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* News Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.latestNews.map((news) => (
                <Link
                  key={news.uuid}
                  to={`/news/${news.slug}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {news.image ? (
                      <img
                        src={getImageUrl(news.image.path) || ''}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                        <span className="text-4xl">📰</span>
                      </div>
                    )}
                    {news.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                        {news.category.name}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                      {news.title}
                    </h3>
                    {news.excerpt && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {news.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(news.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {news.viewCount} views
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile View All Button */}
            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-full"
              >
                View All News
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join us today and discover how we can help transform your business
            with innovative solutions.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-500 font-medium rounded-full hover:bg-white/90 transition-colors shadow-xl"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
