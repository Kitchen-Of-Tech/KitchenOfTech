'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Clock,
  CheckCircle2,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Github,
  Youtube
} from 'lucide-react';
import { motion } from 'framer-motion';
import { client } from '@/lib/sanity/client';
import { CONTACT_PAGE_QUERY } from '@/lib/sanity/queries';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
  clock: Clock,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  github: Github,
  youtube: Youtube,
};

interface ContactPageData {
  heroSection?: {
    badge?: string;
    title?: string;
    description?: string;
  };
  contactInfo?: Array<{
    icon: string;
    title: string;
    value: string;
    link?: string;
    description: string;
  }>;
  formSettings?: {
    title?: string;
    description?: string;
    successMessage?: string;
    submitButtonText?: string;
  };
  whyChooseUs?: {
    title?: string;
    items?: Array<{
      title: string;
      description: string;
    }>;
  };
  socialLinks?: Array<{
    platform: string;
    url: string;
    label?: string;
  }>;
  quote?: {
    text?: string;
    author?: string;
  };
  mapSettings?: {
    enabled?: boolean;
    embedUrl?: string;
    placeholderText?: string;
  };
}

export default function ContactPage() {
  const [pageData, setPageData] = useState<ContactPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch contact page data from Sanity
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const data = await client.fetch<ContactPageData>(CONTACT_PAGE_QUERY);
        setPageData(data);
      } catch (error) {
        console.error('Error fetching contact page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Simulate API call - you can integrate with your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback data if Sanity data is not available
  const heroData = pageData?.heroSection || {
    badge: 'Get In Touch',
    title: "Let's Start a Conversation",
    description: "Have a project in mind? We'd love to hear about it. Drop us a message and we'll get back to you as soon as possible.",
  };

  const contactInfoData = pageData?.contactInfo || [];
  
  const formSettings = pageData?.formSettings || {
    title: 'Send us a Message',
    description: "Fill out the form below and we'll get back to you within 24 hours.",
    successMessage: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
    submitButtonText: 'Send Message',
  };

  const whyChooseUsData = pageData?.whyChooseUs || {
    title: 'Why Choose Us?',
    items: [],
  };

  const socialLinksData = pageData?.socialLinks || [];
  
  const quoteData = pageData?.quote || {
    text: "Great things in business are never done by one person. They're done by a team of people.",
    author: 'Steve Jobs',
  };

  const mapSettings = pageData?.mapSettings || {
    enabled: false,
    embedUrl: null,
    placeholderText: 'Map Coming Soon',
  };

  // Helper function to get icon color based on platform
  const getSocialColor = (platform: string) => {
    const colors: Record<string, string> = {
      linkedin: 'hover:text-blue-400',
      facebook: 'hover:text-blue-500',
      twitter: 'hover:text-sky-400',
      instagram: 'hover:text-pink-500',
      github: 'hover:text-gray-300',
      youtube: 'hover:text-red-500',
    };
    return colors[platform.toLowerCase()] || 'hover:text-blue-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">{heroData.badge}</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-gradient">{heroData.title}</span>
            </h1>
            
            <p className="text-xl text-white/60 leading-relaxed">
              {heroData.description}
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {contactInfoData.map((info, index) => {
              const IconComponent = iconMap[info.icon] || Mail;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <GlassCard className="p-6 text-center group hover:border-blue-500/50 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                    {info.link ? (
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-white/80 font-medium">{info.value}</p>
                    )}
                    <p className="text-sm text-white/50 mt-2">{info.description}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Main Content - Form and Info */}
          <div className="grid lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="lg:col-span-3"
            >
              <GlassCard className="p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-3">{formSettings.title}</h2>
                  <p className="text-white/60">{formSettings.description}</p>
                </div>

                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 text-sm">
                      {formSettings.successMessage}
                    </p>
                  </motion.div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-white font-medium mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-white font-medium mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-white font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-white font-medium mb-2">
                        Subject <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Project Inquiry"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-white font-medium mb-2">
                      Your Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group"
                  >
                    <GradientButton size="lg" className="w-full">
                      <span className="flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            {formSettings.submitButtonText}
                          </>
                        )}
                      </span>
                    </GradientButton>
                  </button>
                </form>
              </GlassCard>
            </motion.div>

            {/* Side Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Why Choose Us */}
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">{whyChooseUsData.title}</h3>
                <div className="space-y-4">
                  {whyChooseUsData.items?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-white font-semibold">{item.title}</h4>
                        <p className="text-white/60 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Social Links */}
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Connect With Us</h3>
                <p className="text-white/60 mb-6 text-sm">
                  Follow us on social media for the latest updates, tips, and insights.
                </p>
                <div className="flex flex-wrap gap-3">
                  {socialLinksData.map((social, index) => {
                    const SocialIcon = iconMap[social.platform.toLowerCase()] || Linkedin;
                    const colorClass = getSocialColor(social.platform);
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label || social.platform}
                        className={`w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:bg-white/10 hover:border-blue-500/50 ${colorClass} transition-all duration-300 hover:scale-110`}
                      >
                        <SocialIcon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Quote */}
              <GlassCard className="p-8 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 border-blue-500/20">
                <div className="text-6xl text-blue-400/20 mb-4">&quot;</div>
                <p className="text-white/80 italic leading-relaxed mb-4">
                  {quoteData.text}
                </p>
                <p className="text-white/60 text-sm">— {quoteData.author}</p>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {mapSettings.enabled && (
        <section className="relative py-20 bg-gradient-to-b from-black to-gray-950">
          <div className="container mx-auto px-4">
            <GlassCard className="overflow-hidden">
              {mapSettings.embedUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={mapSettings.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location Map"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-white/60">{mapSettings.placeholderText || 'Map integration coming soon'}</p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
