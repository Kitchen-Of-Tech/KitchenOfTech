import { notFound } from 'next/navigation';
import { client, urlFor } from '@/lib/sanity/client';
import { SERVICE_QUERY, SERVICES_QUERY } from '@/lib/sanity/queries';
import type { Service } from '@/types';
import type { Image as SanityImageSource } from 'sanity';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Award, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { SubscriptionPricingDisplay } from '@/components/services/pricing/SubscriptionPricingDisplay';
import { ProjectPricingDisplay } from '@/components/services/pricing/ProjectPricingDisplay';
import { HourlyPricingDisplay } from '@/components/services/pricing/HourlyPricingDisplay';
import { CustomPricingDisplay } from '@/components/services/pricing/CustomPricingDisplay';

// Force dynamic rendering to avoid build-time Sanity query issues
export const dynamic = 'force-dynamic';

// Generate static params for all services
export async function generateStaticParams() {
  try {
    const services = await client.fetch<Service[]>(SERVICES_QUERY);
    return services.map((service) => ({
      slug: service.slug.current,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const service = await client.fetch<Service>(SERVICE_QUERY, { 
    slug: params.slug 
  });

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: service.seo?.metaTitle || `${service.title} | KitchenOfTech`,
    description: service.seo?.metaDescription || service.shortDescription,
    openGraph: {
      title: service.seo?.metaTitle || service.title,
      description: service.seo?.metaDescription || service.shortDescription,
      images: service.seo?.ogImage 
        ? [urlFor(service.seo.ogImage as SanityImageSource).width(1200).height(630).url()]
        : service.icon 
        ? [urlFor(service.icon as SanityImageSource).width(1200).height(630).url()]
        : [],
    },
  };
}

export default async function ServiceDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const service = await client.fetch<Service>(SERVICE_QUERY, { 
    slug: params.slug 
  });

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Breadcrumb Navigation */}
      <section className="relative py-8 border-b border-white/10">
        <div className="container mx-auto px-4">
          <Link 
            href="/services"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Services</span>
          </Link>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              {/* Category Badge */}
              {service.category && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <span className="text-sm font-medium text-white/80">
                    {service.category.title}
                  </span>
                  {service.subcategory && (
                    <>
                      <span className="text-white/40">/</span>
                      <span className="text-sm text-white/60">
                        {service.subcategory.title}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient">
                {service.title}
              </h1>

              {/* Short Description */}
              <p className="text-xl text-white/80 leading-relaxed">
                {service.shortDescription}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                {service.timeline && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-white/70">{service.timeline}</span>
                  </div>
                )}
                {service.featured && (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="text-white/70">Featured Service</span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/meeting">
                  <GradientButton variant="primary" size="lg">
                    Get Started
                  </GradientButton>
                </Link>
                <Link href="/contact">
                  <GradientButton variant="outline" size="lg">
                    Contact Us
                  </GradientButton>
                </Link>
              </div>
            </div>

            {/* Image */}
            {service.icon && (
              <div className="relative">
                <GlassCard className="p-8 bg-gradient-to-br from-white/5 to-white/0">
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <Image
                      src={urlFor(service.icon as SanityImageSource).width(600).height(600).url()}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-cover"
                      priority
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzFhMWExYSIvPjwvc3ZnPg=="
                    />
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      {service.deliverables && service.deliverables.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <GlassCard className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-white mb-6">
                What You&apos;ll Get
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {service.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      {/* Features Section */}
      {service.features && service.features.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Key Features
              </h2>
              <p className="text-white/60 text-lg">
                Everything you need to succeed
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.features.map((feature, idx) => (
                <GlassCard key={idx} className="p-6 hover:scale-[1.02] transition-transform">
                  <div className="flex flex-col items-start gap-4">
                    {feature.icon && (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={urlFor(feature.icon as SanityImageSource).width(48).height(48).url()}
                          alt={feature.title}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="relative py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pricing & Plans
            </h2>
            <p className="text-white/60 text-lg">
              Choose the plan that fits your needs
            </p>
          </div>

          {/* Conditional Pricing Display */}
          {service.pricingType === 'subscription' && service.subscriptionTiers && service.subscriptionTiers.length > 0 && (
            <SubscriptionPricingDisplay tiers={service.subscriptionTiers} />
          )}

          {service.pricingType === 'project' && service.projectPricing && (
            <ProjectPricingDisplay pricing={service.projectPricing} />
          )}

          {service.pricingType === 'hourly' && service.hourlyPricing && (
            <HourlyPricingDisplay pricing={service.hourlyPricing} />
          )}

          {service.pricingType === 'custom' && service.customPricing && (
            <CustomPricingDisplay pricing={service.customPricing} />
          )}
        </div>
      </section>

      {/* FAQ Section */}
      {service.faq && service.faq.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-white/60 text-lg">
                Get answers to common questions
              </p>
            </div>

            <div className="space-y-4">
              {service.faq.map((item, idx) => (
                <GlassCard key={idx} className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {item.question}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {item.answer}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Technologies Section */}
      {service.technologies && service.technologies.length > 0 && (
        <section className="relative py-12 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Technologies We Use
              </h2>
              <p className="text-white/60 text-lg">
                Built with industry-leading tools
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {service.technologies.map((tech, idx) => (
                <div
                  key={idx}
                  className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors"
                >
                  <span className="text-white/80 font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <GlassCard className="p-12 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 border-blue-500/20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss your project and how we can help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/meeting">
                <GradientButton variant="primary" size="lg">
                  Schedule Free Consultation
                </GradientButton>
              </Link>
              <Link href="/contact">
                <GradientButton variant="outline" size="lg">
                  Get Custom Quote
                </GradientButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
