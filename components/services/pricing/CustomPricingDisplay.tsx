'use client';

import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import type { CustomPricing } from '@/types';
import Link from 'next/link';

interface CustomPricingDisplayProps {
  pricing: CustomPricing;
}

export function CustomPricingDisplay({ pricing }: CustomPricingDisplayProps) {
  const hasBallparkRanges = pricing.ballparkRanges && pricing.ballparkRanges.length > 0;

  return (
    <div className="space-y-8">
      {/* Main Custom Pricing Card */}
      <GlassCard className="p-8 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-purple-500/20">
        <div className="text-center space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Custom Solution</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              {pricing.displayText || 'Custom Pricing'}
            </h3>
          </div>

          {pricing.description && (
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              {pricing.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/meeting">
              <GradientButton variant="primary" size="lg" className="group">
                Schedule Discovery Call
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </GradientButton>
            </Link>
            <Link href="/contact">
              <GradientButton variant="outline" size="lg">
                Send RFP
              </GradientButton>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Ballpark Ranges */}
      {hasBallparkRanges && (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-xl font-bold text-white mb-2">Estimated Price Ranges</h4>
            <p className="text-white/60">To help you plan your budget</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {pricing.ballparkRanges?.map((range, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <GlassCard className="p-6 hover:scale-[1.02] transition-transform">
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-lg font-semibold text-white mb-1">{range.tier}</h5>
                      <div className="text-2xl font-bold text-gradient">
                        {range.rangeLow && range.rangeHigh 
                          ? `${range.currency}${range.rangeLow.toLocaleString()} - ${range.currency}${range.rangeHigh.toLocaleString()}`
                          : 'Contact for Quote'
                        }
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-white/60">
              * Final pricing depends on project scope, complexity, and timeline. 
              All estimates include detailed breakdown and payment terms.
            </p>
          </div>
        </div>
      )}

      {/* Process Cards */}
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h4 className="text-xl font-bold text-white mb-2">Our Custom Project Process</h4>
          <p className="text-white/60">How we work with you to deliver exceptional results</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Discovery Phase */}
          <GlassCard className="p-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-400">1</span>
              </div>
              <h5 className="text-lg font-semibold text-white">Discovery & Analysis</h5>
              <p className="text-sm text-white/70 leading-relaxed">
                We start with a comprehensive discovery session to understand your unique 
                requirements, goals, and constraints. We&apos;ll analyze your existing systems 
                and identify opportunities.
              </p>
            </div>
          </GlassCard>

          {/* Proposal Phase */}
          <GlassCard className="p-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-400">2</span>
              </div>
              <h5 className="text-lg font-semibold text-white">Custom Proposal</h5>
              <p className="text-sm text-white/70 leading-relaxed">
                Within 3-5 business days, you&apos;ll receive a detailed proposal including 
                scope, timeline, milestones, deliverables, and transparent pricing with 
                payment terms.
              </p>
            </div>
          </GlassCard>

          {/* Execution Phase */}
          <GlassCard className="p-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-cyan-400">3</span>
              </div>
              <h5 className="text-lg font-semibold text-white">Agile Execution</h5>
              <p className="text-sm text-white/70 leading-relaxed">
                We work in iterative sprints with regular check-ins and demos. You&apos;ll 
                have full visibility into progress with weekly updates and a dedicated 
                project manager.
              </p>
            </div>
          </GlassCard>

          {/* Delivery Phase */}
          <GlassCard className="p-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-green-400">4</span>
              </div>
              <h5 className="text-lg font-semibold text-white">Delivery & Support</h5>
              <p className="text-sm text-white/70 leading-relaxed">
                Final delivery includes comprehensive documentation, training, and 30 days 
                of post-launch support. We ensure smooth handoff and continued success.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* CTA Section */}
      <GlassCard className="p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Ready to Discuss Your Project?</h4>
              <p className="text-white/70">
                Let&apos;s schedule a free 30-minute consultation to explore how we can 
                bring your vision to life.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/meeting">
              <GradientButton variant="primary" size="lg">
                Book Free Consultation
              </GradientButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
