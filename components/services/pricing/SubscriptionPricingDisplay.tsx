'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import type { SubscriptionTier } from '@/types';
import Link from 'next/link';

interface SubscriptionPricingProps {
  tiers: SubscriptionTier[];
}

export function SubscriptionPricingDisplay({ tiers }: SubscriptionPricingProps) {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  // Group tiers by billing period
  const monthlyTiers = tiers.filter((t) => t.billingPeriod === 'month');
  const annualTiers = tiers.filter((t) => t.billingPeriod === 'year');
  const hasAnnualOption = annualTiers.length > 0;

  const displayTiers = billingPeriod === 'month' ? monthlyTiers : annualTiers;

  // Calculate savings percentage
  const getSavings = (monthlyPrice: number, annualPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const savings = ((monthlyTotal - annualPrice) / monthlyTotal) * 100;
    return Math.round(savings);
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      {hasAnnualOption && monthlyTiers.length > 0 && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-4 p-1 bg-white/5 border border-white/10 rounded-full">
            <button
              onClick={() => setBillingPeriod('month')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingPeriod === 'month'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('year')}
              className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
                billingPeriod === 'year'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Save up to 20%
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            <GlassCard
              className={`p-6 h-full flex flex-col ${
                tier.popular ? 'ring-2 ring-blue-500/50' : ''
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-sm font-semibold text-white">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Tier Name */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-gradient">
                    {tier.currency} {tier.price.toLocaleString()}
                  </span>
                  <span className="text-white/60">
                    /{billingPeriod === 'month' ? 'mo' : 'yr'}
                  </span>
                </div>

                {/* Savings Badge for Annual */}
                {billingPeriod === 'year' && monthlyTiers.length > 0 && (
                  <div className="mt-2">
                    {(() => {
                      const monthlyTier = monthlyTiers.find((t) => t.name === tier.name);
                      if (monthlyTier) {
                        const savings = getSavings(monthlyTier.price, tier.price);
                        return (
                          <span className="text-sm text-green-400">
                            Save {savings}% vs monthly
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="flex-1 space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Feature Comparison (if available) */}
              {tier.featureComparison && tier.featureComparison.length > 0 && (
                <div className="border-t border-white/10 pt-4 mb-6 space-y-2">
                  {tier.featureComparison.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{item.feature}</span>
                      <div className="flex items-center gap-2">
                        {item.included ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            {item.limit && (
                              <span className="text-white/60 text-xs">{item.limit}</span>
                            )}
                          </>
                        ) : (
                          <X className="w-4 h-4 text-white/30" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              <Link href="/meeting">
                <GradientButton
                  variant={tier.popular ? 'primary' : 'outline'}
                  size="lg"
                  fullWidth
                >
                  Get Started
                </GradientButton>
              </Link>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center text-white/60 text-sm">
        <p>All plans include 24/7 support and regular updates</p>
        <Link href="/meeting" className="text-blue-400 hover:text-blue-300 underline">
          Need a custom plan? Contact us
        </Link>
      </div>
    </div>
  );
}
