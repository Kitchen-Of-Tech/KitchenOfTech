"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Star, Send, Check, X, Loader } from 'lucide-react';

export default function TestimonialSubmissionPage() {
  const params = useParams();
  const token = params.token as string;

  const [validating, setValidating] = useState(true);
  const [linkValid, setLinkValid] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [prefilledEmail, setPrefilledEmail] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    message: '',
    rating: 5,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const validate = async () => {
      try {
        const response = await fetch(`/api/testimonials/links/${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setLinkValid(true);
          if (data.link.email) {
            setPrefilledEmail(data.link.email);
            setForm(prev => ({ ...prev, email: data.link.email }));
          }
        } else {
          setLinkError(data.error || 'Invalid link');
        }
      } catch {
        setLinkError('Failed to validate link');
      } finally {
        setValidating(false);
      }
    };
    
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          link_token: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit testimonial');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setForm({ ...form, rating: star })}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= form.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-white/30'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-white/70">Validating link...</p>
        </div>
      </div>
    );
  }

  // Invalid link state
  if (!linkValid) {
    return (
      <div className="min-h-screen bg-gradient-dark overflow-x-hidden">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-6">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Invalid Link</h1>
              <p className="text-lg text-white/70 mb-8">{linkError}</p>
              <div className="glass rounded-xl p-6 border border-red-500/20 bg-red-500/5">
                <p className="text-white/80 mb-4">This link may have:</p>
                <ul className="text-left text-white/60 space-y-2 max-w-md mx-auto">
                  <li>• Expired (links are valid for 7 days)</li>
                  <li>• Already been used (links are single-use)</li>
                  <li>• Been entered incorrectly</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-dark overflow-x-hidden">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6 animate-bounce">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Thank You!</h1>
              <p className="text-lg text-white/70 mb-8">
                Your testimonial has been submitted successfully!
              </p>
              <div className="glass rounded-xl p-8 border border-white/10">
                <p className="text-white/80 mb-4">
                  We appreciate you taking the time to share your feedback.
                </p>
                <p className="text-white/60">
                  Your testimonial is now under review by our team and will be published soon.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-gradient-dark overflow-x-hidden">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Share Your Experience
              </h1>
              <p className="text-lg text-white/70">
                We&apos;d love to hear about your experience with Kitchen of Tech
              </p>
            </div>

            {/* Form */}
            <div className="glass rounded-2xl p-8 border border-white/10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={!!prefilledEmail}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="Your Role"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Your Testimonial <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    placeholder="Tell us about your experience working with Kitchen of Tech..."
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Rating <span className="text-red-400">*</span>
                  </label>
                  {renderStars()}
                  <p className="text-white/60 text-xs mt-2">
                    {form.rating} out of 5 stars
                  </p>
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Testimonial
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
