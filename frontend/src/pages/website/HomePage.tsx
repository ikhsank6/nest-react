import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Eye, ChevronLeft, ChevronRight, Play, Check } from 'lucide-react';
import { websiteService, type HomePageData } from '@/services/website.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Base URL without /api for image paths that already include /api
const BASE_URL = API_URL.replace('/api', '');

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
    return `${BASE_URL}${path}`;
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { value: '230+', label: 'Happy Clients' },
    { value: '50+', label: 'Projects Done' },
    { value: '10+', label: 'Years Experience' },
    { value: '99%', label: 'Satisfaction' },
  ];

  const features = [
    { title: 'Modern Design', description: 'Clean and contemporary aesthetics' },
    { title: 'Fast Performance', description: 'Optimized for speed and efficiency' },
    { title: 'Secure Platform', description: 'Enterprise-grade security' },
    { title: '24/7 Support', description: 'Always here to help you' },
  ];

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Stay ahead of the curve with our{' '}
                <span className="text-muted-foreground">forward-thinking</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                We help businesses succeed in the digital world with innovative solutions and cutting-edge technology.
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  to="/about"
                  className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Schedule Call
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/news"
                  className="px-6 py-3 border border-border rounded-full font-medium hover:bg-muted transition-colors"
                >
                  View Case Study
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold text-lime-500">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Carousel or Image */}
            <div className="order-1 lg:order-2 relative">
              {data?.carousels && data.carousels.length > 0 ? (
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted">
                  {data.carousels.map((carousel, index) => (
                    <div
                      key={carousel.uuid}
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {carousel.image && (
                        <img
                          src={getImageUrl(carousel.image.path) || ''}
                          alt={carousel.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-white font-semibold text-xl mb-2">{carousel.title}</h3>
                        {carousel.subtitle && (
                          <p className="text-white/80 text-sm">{carousel.subtitle}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Carousel Navigation */}
                  {data.carousels.length > 1 && (
                    <div className="absolute bottom-6 right-6 flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentSlide((prev) =>
                            prev === 0 ? data.carousels.length - 1 : prev - 1
                          )
                        }
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentSlide((prev) =>
                            prev === data.carousels.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-3xl bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-lime-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                    <p className="text-muted-foreground">Watch our intro video</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {data?.aboutUs && (
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image */}
              <div className="relative">
                {data.aboutUs.logo ? (
                  <img
                    src={getImageUrl(data.aboutUs.logo.path) || ''}
                    alt={data.aboutUs.companyName}
                    className="w-full max-w-md mx-auto rounded-3xl"
                  />
                ) : (
                  <div className="w-full max-w-md mx-auto aspect-square rounded-3xl bg-muted flex items-center justify-center">
                    <span className="text-8xl">🏢</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <span className="inline-block px-4 py-1.5 bg-lime-500/10 text-lime-600 dark:text-lime-400 rounded-full text-sm font-medium mb-4">
                  About Us
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  {data.aboutUs.companyName}
                </h2>
                <div
                  className="text-muted-foreground mb-8 prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html:
                      data.aboutUs.description.length > 400
                        ? data.aboutUs.description.substring(0, 400) + '...'
                        : data.aboutUs.description,
                  }}
                />
                <div className="space-y-3 mb-8">
                  {features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">{feature.title}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-foreground font-medium hover:gap-3 transition-all"
                >
                  Learn more about us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How We Work Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Stats Card */}
            <div className="bg-background/5 rounded-3xl p-8 border border-background/10">
              <div className="text-6xl font-bold text-lime-400 mb-2">920+</div>
              <p className="text-background/60 mb-6">Project finish with superbly</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-lime-400" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-background/30 flex items-center justify-center text-background/60">
                  +
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="text-background/40 tracking-[0.3em] text-sm mb-4 block">
                HOW WE WORK
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Provide the best service with out of the box ideas
              </h2>
              <p className="text-background/60 mb-8">
                We are passionate about digital marketing and dedicated to helping businesses succeed in the digital world. With years of experience and a deep understanding of the ever-evolving digital landscape, we stay at the forefront of industry trends and technologies.
              </p>
              <button className="w-16 h-16 rounded-full bg-lime-400 flex items-center justify-center hover:bg-lime-500 transition-colors">
                <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      {data?.latestNews && data.latestNews.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <span className="inline-block px-4 py-1.5 bg-muted rounded-full text-sm font-medium mb-4">
                  📰 Latest News
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Digital Marketing & SEO Services That Grow Traffic
                </h2>
              </div>
              <Link
                to="/news"
                className="px-6 py-3 border border-border rounded-full font-medium hover:bg-muted transition-colors shrink-0"
              >
                See more
              </Link>
            </div>

            {/* News Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.latestNews.slice(0, 3).map((news) => (
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
                    <div className="text-xs text-muted-foreground mb-3">5 min read</div>
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
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Ready to work with us?
          </h2>
          <Link
            to="/about"
            className="inline-flex items-center gap-3 px-8 py-4 bg-background text-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
