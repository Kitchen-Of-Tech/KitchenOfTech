'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import MeetingForm from '@/components/meetings/MeetingForm';
import { Calendar, CheckCircle2, Clock, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function MeetingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pt-24 pb-16">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 border border-blue-500/30 backdrop-blur-sm mb-6">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold text-white">Schedule Your Meeting</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Let&apos;s Discuss Your{' '}
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                Project
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Book a meeting with our team to discuss your requirements, explore solutions, and get a personalized quote for your project.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            <GlassCard className="p-6 text-center hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <Clock className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Quick Response</h3>
              <p className="text-white/60 text-sm">We&apos;ll get back to you within 24 hours</p>
            </GlassCard>

            <GlassCard className="p-6 text-center hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                <Users className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Expert Team</h3>
              <p className="text-white/60 text-sm">Meet with experienced professionals</p>
            </GlassCard>

            <GlassCard className="p-6 text-center hover:scale-105 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Tailored Solutions</h3>
              <p className="text-white/60 text-sm">Custom solutions for your unique needs</p>
            </GlassCard>
          </div>

          {/* Meeting Form */}
          <div className="max-w-2xl mx-auto">
            <MeetingForm />
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-white/60 text-sm">
              By submitting this form, you agree to our{' '}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</a>
              {' '}and{' '}
              <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">Terms of Service</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
