'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Calendar } from 'lucide-react';
import type { Image as SanityImageSource } from 'sanity';
import type { Service } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { urlFor } from '@/lib/sanity/client';
import MeetingForm from '@/components/meetings/MeetingForm';

interface ServiceCardProps {
  service: Service;
  index: number;
  categoryColor?: string;
}

export function ServiceCard({ service, index, categoryColor }: ServiceCardProps) {
  const [showMeetingForm, setShowMeetingForm] = useState(false);

  const getPricingDisplay = () => {
    switch (service.pricingType) {
      case 'subscription':
        if (service.subscriptionTiers && service.subscriptionTiers.length > 0) {
          const lowestTier = service.subscriptionTiers.reduce((prev, current) =>
            prev.price < current.price ? prev : current
          );
          return `From ${lowestTier.currency} ${lowestTier.price}/${lowestTier.billingPeriod}`;
        }
        return 'Subscription Plans';

      case 'project':
        if (service.projectPricing?.startingPrice) {
          return `From ${service.projectPricing.currency} ${service.projectPricing.startingPrice.toLocaleString()}`;
        }
        if (service.projectPricing?.priceRangeLow && service.projectPricing?.priceRangeHigh) {
          return `${service.projectPricing.currency} ${service.projectPricing.priceRangeLow.toLocaleString()} - ${service.projectPricing.priceRangeHigh.toLocaleString()}`;
        }
        return 'Project-based';

      case 'hourly':
        if (service.hourlyPricing) {
          return `${service.hourlyPricing.currency} ${service.hourlyPricing.rateLow}-${service.hourlyPricing.rateHigh}/${service.hourlyPricing.rateType}`;
        }
        return 'Hourly Rate';

      case 'custom':
        return service.customPricing?.displayText || 'Contact for Quote';

      default:
        return 'View Pricing';
    }
  };

  return (
    <>
      {/* Meeting Form Modal */}
      {showMeetingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <MeetingForm
              preselectedService={{
                slug: service.slug.current,
                title: service.title,
              }}
              onClose={() => setShowMeetingForm(false)}
              onSuccess={() => setShowMeetingForm(false)}
            />
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="h-full"
      >
      <Link href={`/services/${service.slug.current}`} className="block h-full group">
        <GlassCard className="h-full p-6 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
          {/* Featured Badge */}
          {service.featured && (
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400">Featured</span>
              </div>
            </div>
          )}

          {/* Gradient Accent */}
          {categoryColor && (
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{
                background: `linear-gradient(90deg, ${categoryColor} 0%, transparent 100%)`,
              }}
            />
          )}

          <div className="relative z-10 flex flex-col h-full">
            {/* Cover Image or Icon */}
            <div className="mb-4">
              {service.coverImage?.asset?._ref ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={urlFor(service.coverImage as SanityImageSource).width(600).height(400).url()}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : service.icon?.asset?._ref ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/5 p-3">
                  <Image
                    src={urlFor(service.icon as SanityImageSource).width(64).height(64).url()}
                    alt={service.title}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: categoryColor
                      ? `${categoryColor}20`
                      : 'rgba(255, 255, 255, 0.05)',
                    color: categoryColor || '#fff',
                  }}
                >
                  {service.title.charAt(0)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-all">
                {service.title}
              </h3>

              <p className="text-white/60 text-sm line-clamp-3">
                {service.shortDescription}
              </p>

              {/* Subcategory Tag */}
              {service.subcategory && (
                <div className="inline-block">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
                    {service.subcategory.title}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 mb-1">Pricing</p>
                  <p className="text-sm font-semibold text-white">{getPricingDisplay()}</p>
                </div>

                <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="text-sm font-medium">Learn More</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Request Meeting Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMeetingForm(true);
                }}
                className="w-full px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Calendar className="w-4 h-4" />
                Request Meeting
              </button>
            </div>
          </div>

          {/* Hover Glow Effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: categoryColor
                ? `radial-gradient(circle at center, ${categoryColor}15 0%, transparent 70%)`
                : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            }}
          />
        </GlassCard>
      </Link>
      </motion.div>
    </>
  );
}
