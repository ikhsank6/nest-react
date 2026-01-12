import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Globe, MessageCircle } from 'lucide-react';
import { websiteService, type AboutUsData } from '@/services/website.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    return `${API_URL}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
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

  return (
    <div className="pt-16">
      {/* Hero Banner */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-purple-500/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          opacity: 0.05,
        }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Logo */}
            <div className="flex justify-center order-2 md:order-1">
              {aboutUs.logo ? (
                <img
                  src={getImageUrl(aboutUs.logo.path) || ''}
                  alt={aboutUs.companyName}
                  className="max-w-md w-full rounded-3xl shadow-2xl"
                />
              ) : (
                <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-2xl">
                  <span className="text-8xl">🏢</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="order-1 md:order-2">
              <span className="text-sm font-medium text-orange-500 mb-2 block">
                About Us
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                  {aboutUs.companyName}
                </span>
              </h1>
              <div
                className="text-muted-foreground mb-8 prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: aboutUs.description }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-orange-500 mb-2 block">
              Get in Touch
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">Contact Information</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Address */}
            {aboutUs.address && (
              <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground text-sm">{aboutUs.address}</p>
                {aboutUs.mapsUrl && (
                  <a
                    href={aboutUs.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-orange-500 text-sm mt-2 hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    View on Maps
                  </a>
                )}
              </div>
            )}

            {/* Phone */}
            {aboutUs.phone && (
              <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <a
                  href={`tel:${aboutUs.phone}`}
                  className="text-muted-foreground text-sm hover:text-orange-500 transition-colors"
                >
                  {aboutUs.phone}
                </a>
              </div>
            )}

            {/* Email */}
            {aboutUs.email && (
              <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a
                  href={`mailto:${aboutUs.email}`}
                  className="text-muted-foreground text-sm hover:text-orange-500 transition-colors"
                >
                  {aboutUs.email}
                </a>
              </div>
            )}

            {/* WhatsApp */}
            {aboutUs.whatsapp && (
              <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <a
                  href={`https://wa.me/${aboutUs.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm hover:text-green-500 transition-colors"
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
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-sm font-medium text-orange-500 mb-2 block">
                Stay Connected
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">Follow Us</h2>
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
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
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
      <section className="py-16 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Let's Work Together
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Have a project in mind? We'd love to hear from you.
          </p>
          <a
            href={aboutUs.email ? `mailto:${aboutUs.email}` : '#'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-500 font-medium rounded-full hover:bg-white/90 transition-colors shadow-xl"
          >
            <Mail className="w-5 h-5" />
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
