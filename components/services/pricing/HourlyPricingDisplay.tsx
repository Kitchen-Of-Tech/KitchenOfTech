'use client';

import { Clock, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import type { HourlyPricing } from '@/types';
import Link from 'next/link';

interface HourlyPricingDisplayProps {
  pricing: HourlyPricing;
}

export function HourlyPricingDisplay({ pricing }: HourlyPricingDisplayProps) {
  const rateTypeDisplay = {
    hour: 'hour',
    day: 'day',
    week: 'week',
  }[pricing.rateType];

  const hasExpertiseLevels = pricing.expertiseLevels && pricing.expertiseLevels.length > 0;

  return (
    <div className="space-y-8">
      {/* Main Rate Card */}
      <GlassCard className="p-8">
        <div className="text-center space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Flexible Engagement</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Hourly Rate</h3>
          </div>

          <div>
            <div className="text-5xl font-bold text-gradient mb-2">
              {pricing.currency} {pricing.rateLow} - {pricing.rateHigh}
            </div>
            <div className="text-white/60">per {rateTypeDisplay}</div>
          </div>

          {pricing.minimumEngagement && (
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-sm text-white/60 mb-1">Minimum Engagement</div>
              <div className="font-semibold text-white">{pricing.minimumEngagement}</div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Expertise Levels */}
      {hasExpertiseLevels && (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-xl font-bold text-white mb-2">Rate by Expertise Level</h4>
            <p className="text-white/60">Choose the right level for your project needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {pricing.expertiseLevels?.map((level, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <GlassCard className="p-6 hover:scale-[1.02] transition-transform">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <h5 className="text-lg font-semibold text-white">{level.level}</h5>
                    <div className="text-3xl font-bold text-gradient">
                      {pricing.currency} {level.rate}
                    </div>
                    <div className="text-xs text-white/60">per {rateTypeDisplay}</div>
                    {level.description && (
                      <p className="text-sm text-white/70 pt-2 border-t border-white/10">
                        {level.description}
                      </p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Average Project Info */}
      {pricing.averageProjectHours && (
        <GlassCard className="p-6 bg-purple-500/5 border-purple-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-2">Average Project Duration</h4>
              <p className="text-white/70 text-sm mb-3">
                {pricing.averageProjectHours}
              </p>
              <div className="text-xs text-white/60">
                Actual time may vary based on project complexity and scope. We provide 
                detailed estimates after initial consultation.
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Calculator Section */}
      <GlassCard className="p-8">
        <div className="text-center space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">Ready to Get Started?</h4>
            <p className="text-white/60">
              Book a free consultation to discuss your project scope and get a detailed estimate
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/meeting">
              <GradientButton variant="primary" size="lg">
                Schedule Consultation
              </GradientButton>
            </Link>
            <Link href="/contact">
              <GradientButton variant="outline" size="lg">
                Request Estimate
              </GradientButton>
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gradient mb-1">100%</div>
                <div className="text-xs text-white/60">Transparent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient mb-1">24/7</div>
                <div className="text-xs text-white/60">Communication</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient mb-1">Weekly</div>
                <div className="text-xs text-white/60">Invoicing</div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
