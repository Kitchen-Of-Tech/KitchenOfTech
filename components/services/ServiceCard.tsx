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
          <GlassCard className="h-full overflow-hidden hover:scale-[1.02] transition-all duration-300 relative p-0">
            {/* Cover Image Section */}
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20">
              {/* Featured Badge */}
              {service.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-yellow-500/50 rounded-full shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-400">Featured</span>
                  </div>
                </div>
              )}

              {/* Cover Image or Gradient Fallback */}
              {service.coverImage?.asset?._ref ? (
                <div className="relative w-full h-full">
                  <Image
                    src={urlFor(service.coverImage as SanityImageSource).width(800).height(450).url()}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Gradient Background */}
                  <div 
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: categoryColor
                        ? `linear-gradient(135deg, ${categoryColor}40 0%, ${categoryColor}10 100%)`
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.4) 100%)',
                    }}
                  />
                  
                  {/* Icon or Letter */}
                  {service.icon?.asset?._ref ? (
                    <div className="relative z-10 w-24 h-24">
                      <Image
                        src={urlFor(service.icon as SanityImageSource).width(96).height(96).url()}
                        alt={service.title}
                        fill
                        sizes="96px"
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  ) : (
                    <div
                      className="relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center text-5xl font-bold backdrop-blur-sm border-2"
                      style={{
                        backgroundColor: categoryColor ? `${categoryColor}30` : 'rgba(255, 255, 255, 0.1)',
                        borderColor: categoryColor ? `${categoryColor}50` : 'rgba(255, 255, 255, 0.2)',
                        color: categoryColor || '#fff',
                      }}
                    >
                      {service.title.charAt(0)}
                    </div>
                  )}
                </div>
              )}

              {/* Category Color Accent Bar */}
              {categoryColor && (
                <div
                  className="absolute top-0 left-0 w-full h-1.5"
                  style={{
                    background: `linear-gradient(90deg, ${categoryColor} 0%, transparent 100%)`,
                  }}
                />
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
              {/* Subcategory Tag */}
              {service.subcategory && (
                <div className="mb-3">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      backgroundColor: categoryColor ? `${categoryColor}15` : 'rgba(59, 130, 246, 0.15)',
                      borderColor: categoryColor ? `${categoryColor}40` : 'rgba(59, 130, 246, 0.4)',
                      color: categoryColor || '#60a5fa',
                    }}
                  >
                    {service.subcategory.title}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gradient transition-all leading-tight">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                {service.shortDescription}
              </p>

              {/* Pricing Section */}
              <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1 font-semibold">Pricing</p>
                <p className="text-lg font-bold text-white">{getPricingDisplay()}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Hire Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMeetingForm(true);
                  }}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl group/btn"
                >
                  <Calendar className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  Hire Now
                </button>

                {/* Learn More */}
                <div className="flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl transition-all text-white font-medium">
                  <span>Details</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: categoryColor
                  ? `radial-gradient(circle at 50% 0%, ${categoryColor}20 0%, transparent 60%)`
                  : 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.2) 0%, transparent 60%)',
              }}
            />
          </GlassCard>
        </Link>
      </motion.div>
    </>
  );
}
