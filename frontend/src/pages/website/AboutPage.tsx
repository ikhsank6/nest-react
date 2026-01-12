import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, MessageCircle, ArrowRight, Check } from 'lucide-react';
import { websiteService, type AboutUsData } from '@/services/website.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Base URL without /api for image paths that already include /api
const BASE_URL = API_URL.replace('/api', '');

export default function AboutPage() {
  const [aboutUs, setAboutUs] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAboutUs();
  }, []);

  const loadAboutUs = async () => {
    try {
      const data = await websiteService.getAboutUs();
      setAboutUs(data);
    } catch (error) {
      console.error('Error loading about us:', error);
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

  if (!aboutUs) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🏢</span>
          <h1 className="text-2xl font-bold mb-4">About Us</h1>
          <p className="text-muted-foreground">
            Company information is not available yet.
          </p>
        </div>
      </div>
    );
  }

  const socialLinks = [
    { key: 'facebook', url: aboutUs.facebook, icon: '📘', label: 'Facebook' },
    { key: 'instagram', url: aboutUs.instagram, icon: '📸', label: 'Instagram' },
    { key: 'twitter', url: aboutUs.twitter, icon: '🐦', label: 'Twitter' },
    { key: 'youtube', url: aboutUs.youtube, icon: '📺', label: 'YouTube' },
    { key: 'linkedin', url: aboutUs.linkedin, icon: '💼', label: 'LinkedIn' },
  ].filter((s) => s.url);

  const features = [
    'Modern & Innovative Solutions',
    'Experienced Professional Team',
    'Customer-Focused Approach',
    '24/7 Dedicated Support',
  ];

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Banner */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              {aboutUs.logo ? (
                <img
                  src={getImageUrl(aboutUs.logo.path) || ''}
                  alt={aboutUs.companyName}
                  className="w-full max-w-md mx-auto rounded-3xl"
                />
              ) : (
                <div className="w-full max-w-md mx-auto aspect-square rounded-3xl bg-muted flex items-center justify-center">
                  <span className="text-8xl">🏢</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <span className="inline-block px-4 py-1.5 bg-lime-500/10 text-lime-600 dark:text-lime-400 rounded-full text-sm font-medium mb-4">
                About Us
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                {aboutUs.companyName}
              </h1>
              <div
                className="text-muted-foreground mb-8 prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: aboutUs.description }}
              />
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-muted rounded-full text-sm font-medium mb-4">
              📍 Get in Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">Contact Information</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Address */}
            {aboutUs.address && (
              <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-lime-500/10 transition-colors">
                  <MapPin className="w-6 h-6 text-muted-foreground group-hover:text-lime-600" />
                </div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground text-sm">{aboutUs.address}</p>
                {aboutUs.mapsUrl && (
                  <a
                    href={aboutUs.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-lime-600 dark:text-lime-400 text-sm mt-3 hover:gap-2 transition-all"
                  >
                    View on Maps
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Phone */}
            {aboutUs.phone && (
              <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-lime-500/10 transition-colors">
                  <Phone className="w-6 h-6 text-muted-foreground group-hover:text-lime-600" />
                </div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <a
                  href={`tel:${aboutUs.phone}`}
                  className="text-muted-foreground text-sm hover:text-lime-600 transition-colors"
                >
                  {aboutUs.phone}
                </a>
              </div>
            )}

            {/* Email */}
            {aboutUs.email && (
              <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-lime-500/10 transition-colors">
                  <Mail className="w-6 h-6 text-muted-foreground group-hover:text-lime-600" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a
                  href={`mailto:${aboutUs.email}`}
                  className="text-muted-foreground text-sm hover:text-lime-600 transition-colors"
                >
                  {aboutUs.email}
                </a>
              </div>
            )}

            {/* WhatsApp */}
            {aboutUs.whatsapp && (
              <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-green-500/10 transition-colors">
                  <MessageCircle className="w-6 h-6 text-muted-foreground group-hover:text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <a
                  href={`https://wa.me/${aboutUs.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm hover:text-green-600 transition-colors"
                >
                  {aboutUs.whatsapp}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Media */}
      {socialLinks.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-background rounded-full text-sm font-medium mb-4 border border-border">
                🌐 Stay Connected
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold">Follow Us</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.key}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <span className="text-2xl">{social.icon}</span>
                  <span className="font-medium">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map */}
      {aboutUs.mapsUrl && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl overflow-hidden border border-border shadow-lg">
              <iframe
                src={aboutUs.mapsUrl.replace('/maps/', '/maps/embed?pb=')}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Let's Work Together
          </h2>
          <p className="text-background/60 text-lg mb-8">
            Have a project in mind? We'd love to hear from you.
          </p>
          <a
            href={aboutUs.email ? `mailto:${aboutUs.email}` : '#'}
            className="inline-flex items-center gap-3 px-8 py-4 bg-background text-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <Mail className="w-5 h-5" />
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
