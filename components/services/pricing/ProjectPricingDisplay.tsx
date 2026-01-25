'use client';

import { Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import type { ProjectPricing } from '@/types';
import Link from 'next/link';

interface ProjectPricingDisplayProps {
  pricing: ProjectPricing;
}

export function ProjectPricingDisplay({ pricing }: ProjectPricingDisplayProps) {
  const hasRange = pricing.priceRangeLow && pricing.priceRangeHigh;
  const hasAddons = pricing.addons && pricing.addons.length > 0;

  return (
    <div className="space-y-8">
      {/* Main Pricing Card */}
      <GlassCard className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Pricing Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Project Investment</h3>
              
              {/* Starting Price */}
              {pricing.startingPrice && (
                <div className="mb-4">
                  <div className="text-sm text-white/60 mb-2">Starting from</div>
                  <div className="text-5xl font-bold text-gradient">
                    {pricing.currency} {pricing.startingPrice.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Price Range */}
              {hasRange && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-sm text-white/60 mb-2">Typical Project Range</div>
                  <div className="text-2xl font-bold text-white">
                    {pricing.currency} {pricing.priceRangeLow?.toLocaleString()} -{' '}
                    {pricing.priceRangeHigh?.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/50 mt-2">
                    Based on project scope and complexity
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Link href="/meeting">
                <GradientButton variant="primary" size="lg" fullWidth>
                  Get Exact Quote
                </GradientButton>
              </Link>
              <p className="text-xs text-white/60 text-center">
                Free consultation • No obligation • Fast response
              </p>
            </div>
          </div>

          {/* Right: What's Included */}
          {pricing.baseIncludes && pricing.baseIncludes.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Base Package Includes:
              </h4>
              <div className="space-y-3">
                {pricing.baseIncludes.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/80">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Add-ons Section */}
      {hasAddons && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Optional Add-ons</h3>
            <p className="text-white/60">Enhance your project with these additional services</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricing.addons?.map((addon, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <GlassCard className="p-6 h-full hover:scale-[1.02] transition-transform">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{addon.title}</h4>
                      <p className="text-sm text-white/60">{addon.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gradient">
                      +{pricing.currency} {addon.price.toLocaleString()}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <GlassCard className="p-6 bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Flexible Payment Options</h4>
            <p className="text-white/70 text-sm">
              We offer milestone-based payments and flexible terms to suit your budget. 
              Typical projects include 50% upfront and 50% upon completion, with larger 
              projects broken into multiple milestones.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
