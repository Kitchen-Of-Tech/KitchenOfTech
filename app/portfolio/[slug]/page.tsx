import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { client, urlFor } from '@/lib/sanity/client';
import { PORTFOLIO_ITEM_QUERY, PORTFOLIO_QUERY } from '@/lib/sanity/queries';
import type { Portfolio } from '@/types';
import type { Image as SanityImageSource } from 'sanity';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Force dynamic rendering to avoid build-time Sanity query issues
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// Generate static params for all portfolio items
export async function generateStaticParams() {
  try {
    const portfolios = await client.fetch<Portfolio[]>(PORTFOLIO_QUERY);
    return portfolios.map((portfolio) => ({
      slug: portfolio.slug.current,
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
    const portfolio = await client.fetch<Portfolio>(PORTFOLIO_ITEM_QUERY, {
      slug,
    });

    if (!portfolio) {
      return {
        title: 'Project Not Found',
      };
    }

    return {
      title: portfolio.seo?.metaTitle || `${portfolio.title} | Kitchen of Tech`,
      description: portfolio.seo?.metaDescription || portfolio.shortDescription,
      openGraph: {
        title: portfolio.seo?.metaTitle || portfolio.title,
        description: portfolio.seo?.metaDescription || portfolio.shortDescription,
        images: portfolio.seo?.ogImage
          ? [
              {
                url: urlFor(portfolio.seo.ogImage as SanityImageSource).url(),
                width: 1200,
                height: 630,
              },
            ]
          : portfolio.featuredImage
          ? [
              {
                url: urlFor(portfolio.featuredImage as SanityImageSource).url(),
                width: 1200,
                height: 630,
              },
            ]
          : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Project Not Found',
    };
  }
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portfolio = await client.fetch<Portfolio>(PORTFOLIO_ITEM_QUERY, {
    slug,
  });

  if (!portfolio) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        <main>
          {/* Back Button */}
          <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="container-custom py-4">
              <Link href="/portfolio" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Back to Portfolio
              </Link>
            </div>
          </div>

          {/* Hero Section with Image */}
          <section className="relative pt-12 pb-12 overflow-hidden">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden">
                  {portfolio.featuredImage?.asset && (
                    <Image
                      src={urlFor(portfolio.featuredImage as SanityImageSource).width(1200).height(600).url()}
                      alt={portfolio.title}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMWExYTFhIi8+PC9zdmc+"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Header Section */}
          <section className="py-12 md:py-16">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <div className="mb-8">
                  <span className="px-3 py-1 bg-primary/20 backdrop-blur-sm text-primary text-sm font-medium rounded-full">
                    {portfolio.industry || 'Featured Project'}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  {portfolio.title}
                </h1>

                <p className="text-xl text-white/70 max-w-3xl mb-8">
                  {portfolio.shortDescription}
                </p>

                {/* Client Info */}
                <div className="flex flex-col sm:flex-row gap-8 mb-8">
                  <div>
                    <div className="text-white/60 text-sm font-medium mb-2">Client</div>
                    <div className="flex items-center gap-3">
                      {portfolio.clientLogo?.asset && (
                        <Image
                          src={urlFor(portfolio.clientLogo as SanityImageSource).width(50).height(50).url()}
                          alt={portfolio.client}
                          width={50}
                          height={50}
                          className="h-12 w-auto"
                        />
                      )}
                      <span className="text-white font-semibold">{portfolio.client}</span>
                    </div>
                  </div>

                  {portfolio.completedDate && (
                    <div>
                      <div className="text-white/60 text-sm font-medium mb-2">Completed</div>
                      <div className="text-white font-semibold">
                        {new Date(portfolio.completedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {portfolio.liveUrl && (
                    <a href={portfolio.liveUrl} target="_blank" rel="noopener noreferrer">
                      <GradientButton variant="primary" size="lg">
                        <span>View Live Project</span>
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </GradientButton>
                    </a>
                  )}
                  {portfolio.videoUrl && (
                    <a href={portfolio.videoUrl} target="_blank" rel="noopener noreferrer">
                      <GradientButton variant="outline" size="lg">
                        <span>Watch Demo</span>
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </GradientButton>
                    </a>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Challenge Section */}
          {portfolio.challenge && (
            <section className="py-12 md:py-20 bg-white/5 backdrop-blur-sm">
              <div className="container-custom">
                <ScrollReveal animation="fade-up">
                  <GlassCard className="p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-white mb-6">The Challenge</h2>
                    <p className="text-lg text-white/70 leading-relaxed">
                      {portfolio.challenge}
                    </p>
                  </GlassCard>
                </ScrollReveal>
              </div>
            </section>
          )}

          {/* Solution Section */}
          {portfolio.solution && (
            <section className="py-12 md:py-20">
              <div className="container-custom">
                <ScrollReveal animation="fade-up">
                  <GlassCard className="p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-white mb-6">Our Solution</h2>
                    <p className="text-lg text-white/70 leading-relaxed">
                      {portfolio.solution}
                    </p>
                  </GlassCard>
                </ScrollReveal>
              </div>
            </section>
          )}

          {/* Approach Section */}
          {portfolio.approach && portfolio.approach.length > 0 && (
            <section className="py-12 md:py-20 bg-white/5 backdrop-blur-sm">
              <div className="container-custom">
                <ScrollReveal animation="fade-up">
                  <h2 className="text-3xl font-bold text-white mb-12">Our Approach</h2>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {portfolio.approach.map((phase, index) => (
                    <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                      <GlassCard className="p-6 h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {index + 1}
                          </div>
                          <h3 className="text-white font-semibold">{phase.phase}</h3>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {phase.description}
                        </p>
                      </GlassCard>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Results Section */}
          {portfolio.results && portfolio.results.length > 0 && (
            <section className="py-12 md:py-20">
              <div className="container-custom">
                <ScrollReveal animation="fade-up">
                  <h2 className="text-3xl font-bold text-white mb-12">Results & Impact</h2>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {portfolio.results.map((result, index) => (
                    <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                      <GlassCard hover className="p-8 text-center h-full flex flex-col justify-center">
                        <div className="text-4xl font-bold text-gradient mb-3">
                          {result.value}
                        </div>
                        <div className="text-white font-semibold mb-2">{result.metric}</div>
                        {result.description && (
                          <div className="text-white/60 text-sm">
                            {result.description}
                          </div>
                        )}
                      </GlassCard>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Gallery Section */}
          {portfolio.gallery && portfolio.gallery.length > 0 && (
            <section className="py-12 md:py-20 bg-white/5 backdrop-blur-sm">
              <div className="container-custom">
                <ScrollReveal animation="fade-up">
                  <h2 className="text-3xl font-bold text-white mb-12">Project Showcase</h2>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {portfolio.gallery.map((image, index) => (
                    <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                      <GlassCard className="overflow-hidden h-96">
                        <div className="relative w-full h-full">
                          <Image
                            src={urlFor(image as SanityImageSource).width(800).height(600).url()}
                            alt={image.alt || 'Gallery image'}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </GlassCard>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Technologies Section */}
          {portfolio.technologies && portfolio.technologies.length > 0 && (
            <section className="py-12 md:py-20">
              <div className="container-custom">
                <ScrollReveal animation="fade-up">
                  <h2 className="text-3xl font-bold text-white mb-8">Technologies Used</h2>

                  <div className="flex flex-wrap gap-3">
                    {portfolio.technologies.map((tech) => (
                      <ScrollReveal key={tech} animation="fade-up">
                        <span className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg font-medium">
                          {tech}
                        </span>
                      </ScrollReveal>
                    ))}
                  </div>
                </ScrollReveal>
              </div>
            </section>
          )}

          {/* Services Section */}
          {portfolio.services && portfolio.services.length > 0 && (
            <section className="py-12 md:py-20 bg-white/5 backdrop-blur-sm">
              <div className="container-custom">
                <ScrollReveal animation="fade-up">
                  <h2 className="text-3xl font-bold text-white mb-8">Services Provided</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.services.map((service) => (
                      <ScrollReveal key={service._id} animation="fade-up">
                        <Link href={`/services/${service.slug.current}`}>
                          <GlassCard hover className="p-6 h-full cursor-pointer">
                            <h3 className="text-white font-semibold mb-2 group-hover:text-gradient transition-colors">
                              {service.title}
                            </h3>
                            {service.shortDescription && (
                              <p className="text-white/60 text-sm">
                                {service.shortDescription}
                              </p>
                            )}
                          </GlassCard>
                        </Link>
                      </ScrollReveal>
                    ))}
                  </div>
                </ScrollReveal>
              </div>
            </section>
          )}

          {/* Testimonial Section */}
          {portfolio.testimonial && (
            <section className="py-12 md:py-20">
              <div className="container-custom">
                <ScrollReveal animation="fade-up">
                  <GlassCard gradient className="p-8 md:p-12">
                    <div className="max-w-3xl mx-auto text-center">
                      <div className="mb-6 flex justify-center gap-1">
                        {[...Array(portfolio.testimonial.rating || 5)].map((_, i) => (
                          <div key={i} className="text-yellow-400 text-xl">★</div>
                        ))}
                      </div>
                      <p className="text-xl text-white/90 italic mb-8 leading-relaxed">
                        &quot;{portfolio.testimonial.testimonial}&quot;
                      </p>
                      <div>
                        <div className="text-white font-semibold">
                          {portfolio.testimonial.clientName}
                        </div>
                        <div className="text-white/60 text-sm">
                          {portfolio.testimonial.clientCompany}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-20 md:py-32">
            <div className="container-custom">
              <ScrollReveal animation="scale-in">
                <GlassCard className="p-8 md:p-16 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to Start Your Project?
                  </h2>
                  <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                    Let&apos;s collaborate to bring your vision to life with innovative solutions
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/meeting">
                      <GradientButton variant="primary" size="lg">
                        Schedule a Meeting
                      </GradientButton>
                    </Link>
                    <Link href="/portfolio">
                      <GradientButton variant="outline" size="lg">
                        View More Projects
                      </GradientButton>
                    </Link>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>
          </section>
        </main>
        <Footer />
      </ErrorBoundary>
    </div>
  );
}
