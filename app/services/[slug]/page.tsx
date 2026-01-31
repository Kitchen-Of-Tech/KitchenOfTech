import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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
import { ServiceMeetingButton } from '@/components/services/ServiceMeetingButton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

// Force dynamic rendering to avoid build-time Sanity query issues
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

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
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const service = await client.fetch<Service>(SERVICE_QUERY, {
      slug: slug
    });

    if (!service) {
      return {
        title: 'Service Not Found | KitchenOfTech',
        description: 'The requested service could not be found.',
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
  } catch (error) {
    console.error('Error generating metadata for service:', error);
    return {
      title: 'Service | KitchenOfTech',
      description: 'Explore our comprehensive range of digital services',
    };
  }
}

export default async function ServiceDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const service = await client.fetch<Service>(SERVICE_QUERY, {
    slug: slug
  });

  if (!service) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
          {/* Enhanced Background Effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl" />
          </div>

          {/* Breadcrumb Navigation - Enhanced */}
          <section className="relative py-6 border-b border-white/10 bg-black/30 backdrop-blur-xl">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">All Services</span>
                </Link>
                {service.category && (
                  <div className="hidden md:flex items-center gap-2 text-sm text-white/50">
                    <span>{service.category.title}</span>
                    {service.subcategory && (
                      <>
                        <span>/</span>
                        <span className="text-white/70">{service.subcategory.title}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Hero Section - Redesigned */}
          <section className="relative py-16 md:py-24 lg:py-32">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Content */}
                <div className="space-y-8 order-2 lg:order-1">
                  {/* Category Badge - Mobile Only */}
                  {service.category && (
                    <div className="md:hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 border border-blue-500/30 backdrop-blur-sm">
                      <span className="text-sm font-semibold text-white">
                        {service.category.title}
                      </span>
                      {service.subcategory && (
                        <>
                          <span className="text-white/40">•</span>
                          <span className="text-sm text-white/80">
                            {service.subcategory.title}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Featured Badge */}
                  {service.featured && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-200">Featured Service</span>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                    <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                      {service.title}
                    </span>
                  </h1>

                  {/* Short Description */}
                  <p className="text-lg md:text-xl lg:text-2xl text-white/80 leading-relaxed font-light">
                    {service.shortDescription}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-6 pt-2">
                    {service.timeline && (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wide">Timeline</p>
                          <p className="text-white font-semibold">{service.timeline}</p>
                        </div>
                      </div>
                    )}
                    {service.deliverables && service.deliverables.length > 0 && (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wide">Deliverables</p>
                          <p className="text-white font-semibold">{service.deliverables.length} Items</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <ServiceMeetingButton
                      service={{
                        slug: service.slug.current,
                        title: service.title
                      }}
                    />
                    <Link href="/contact">
                      <GradientButton variant="outline" size="lg" className="w-full sm:w-auto">
                        Get Custom Quote
                      </GradientButton>
                    </Link>
                  </div>
                </div>

                {/* Image - Enhanced */}
                {(service.coverImage || service.icon) && (
                  <div className="relative order-1 lg:order-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
                    <GlassCard className="relative p-2 bg-gradient-to-br from-white/10 via-white/5 to-white/0 border-white/20">
                      <div className={`relative ${service.coverImage ? 'aspect-[4/3]' : 'aspect-square'} rounded-2xl overflow-hidden shadow-2xl`}>
                        <Image
                          src={
                            service.coverImage 
                              ? urlFor(service.coverImage as SanityImageSource).width(900).height(675).url()
                              : urlFor(service.icon as SanityImageSource).width(700).height(700).url()
                          }
                          alt={service.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
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

      {/* Deliverables Section - Redesigned */}
      {service.deliverables && service.deliverables.length > 0 && (
        <section className="relative py-16 md:py-20">
          <div className="container mx-auto px-4">
            <GlassCard className="p-8 md:p-12 lg:p-16 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent border-blue-500/20">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                    What You&apos;ll Get
                  </h2>
                  <p className="text-white/60 text-lg">
                    Comprehensive deliverables tailored to your success
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {service.deliverables.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-white/90 leading-relaxed font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      {/* Features Section - Redesigned */}
      {service.features && service.features.length > 0 && (
        <section className="relative py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
                Everything you need to bring your vision to life
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {service.features.map((feature, idx) => (
                <GlassCard 
                  key={idx} 
                  className="group p-8 hover:scale-[1.03] hover:border-blue-500/50 transition-all duration-300 bg-gradient-to-br from-white/5 to-white/0"
                >
                  <div className="flex flex-col gap-5">
                    {feature.icon && (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-white/10">
                        <Image
                          src={urlFor(feature.icon as SanityImageSource).width(64).height(64).url()}
                          alt={feature.title}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
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

      {/* Pricing Section - Enhanced */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Transparent Pricing
            </h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              Flexible plans designed to scale with your business
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

      {/* Technologies Section - Redesigned */}
      {service.technologies && service.technologies.length > 0 && (
        <section className="relative py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Built With Best-in-Class Tech
              </h2>
              <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
                Leveraging industry-leading tools and technologies
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
              {service.technologies.map((tech, idx) => (
                <div
                  key={idx}
                  className="group px-6 lg:px-8 py-3.5 lg:py-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-blue-500/50 hover:from-blue-500/10 hover:to-purple-500/10 transition-all hover:scale-105 cursor-default"
                >
                  <span className="text-white/90 font-semibold group-hover:text-white transition-colors">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section - Enhanced */}
      {service.faq && service.faq.length > 0 && (
        <section className="relative py-16 md:py-20 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Got Questions?
              </h2>
              <p className="text-white/60 text-lg md:text-xl">
                Find answers to the most common questions
              </p>
            </div>

            <div className="space-y-5">
              {service.faq.map((item, idx) => (
                <GlassCard 
                  key={idx} 
                  className="group p-6 md:p-8 hover:border-blue-500/50 hover:bg-white/5 transition-all"
                >
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {item.question}
                  </h3>
                  <p className="text-white/70 leading-relaxed text-base md:text-lg">
                    {item.answer}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA - Redesigned */}
      <section className="relative py-20 md:py-28">
        <div className="container mx-auto px-4">
          <GlassCard className="relative overflow-hidden p-12 md:p-16 lg:p-20 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 border-blue-500/30 text-center">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                Ready to Transform Your Vision into Reality?
              </h2>
              <p className="text-white/80 text-lg md:text-xl lg:text-2xl leading-relaxed font-light">
                Let&apos;s collaborate and create something extraordinary together. Our team is ready to bring your ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <ServiceMeetingButton
                  service={{
                    slug: service.slug.current,
                    title: service.title
                  }}
                />
                <Link href="/contact">
                  <GradientButton variant="outline" size="lg" className="w-full sm:w-auto">
                    Get Custom Quote
                  </GradientButton>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
        </main>
        <Footer />
      </>
    );
}
