"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Link2, Copy, Check, Mail } from 'lucide-react';

export default function GenerateTestimonialLinkPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedLink('');
    setCopied(false);

    try {
      const response = await fetch('/api/testimonials/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate link');
      }

      setGeneratedLink(data.url);
      setEmail(''); // Clear form
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-dark overflow-x-hidden">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-6">
                <Link2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Generate Testimonial Link
              </h1>
              <p className="text-lg text-white/70">
                Create a unique link to collect testimonials from your clients.
                <br />
                Links are valid for 7 days and can be used once.
              </p>
            </div>

            {/* Form */}
            <div className="glass rounded-2xl p-8 border border-white/10">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                    Client Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-2">
                    Optional: Pre-fill the email field in the testimonial form
                  </p>
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Link'}
                </button>
              </form>

              {/* Generated Link */}
              {generatedLink && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    Link Generated Successfully!
                  </h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors flex items-center gap-2 text-white"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 text-sm">
                      <strong>Important:</strong> This link will expire in 7 days and can only be used once.
                      Share it with your client to collect their testimonial.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="glass rounded-xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔗</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Unique Links</h4>
                <p className="text-white/60 text-sm">Each link is unique and secure</p>
              </div>

              <div className="glass rounded-xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⏰</span>
                </div>
                <h4 className="text-white font-semibold mb-2">7-Day Validity</h4>
                <p className="text-white/60 text-sm">Links expire after 7 days</p>
              </div>

              <div className="glass rounded-xl p-6 border border-white/10 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Single Use</h4>
                <p className="text-white/60 text-sm">Each link can be used only once</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
