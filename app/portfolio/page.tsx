import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Filter } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";
import { client, urlFor } from "@/lib/sanity/client";
import { PORTFOLIO_QUERY } from "@/lib/sanity/queries";
import type { Portfolio } from "@/types";

export const metadata = {
  title: "Portfolio | Kitchen of Tech",
  description: "Explore our portfolio of successful projects across web development, mobile apps, UI/UX design, and digital solutions.",
};

export default async function PortfolioPage() {
  // Fetch portfolio items from Sanity
  const portfolioItems = await client.fetch<Portfolio[]>(PORTFOLIO_QUERY);

  // Get unique categories from fetched data (using industry as category)
  const allCategories = portfolioItems.map(item => item.industry).filter(Boolean);
  const categories = ["All", ...Array.from(new Set(allCategories))];

  // Split into featured and regular
  const featuredProjects = portfolioItems.filter((project) => project.featured);
  const regularProjects = portfolioItems.filter((project) => !project.featured);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-secondary/10 via-transparent to-transparent" />
          
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">Our </span>
                  <span className="text-gradient">Portfolio</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70">
                  Showcasing innovative projects that drive real business results
                </p>
              </div>
            </ScrollReveal>

            {/* Category Filter */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="mt-12 max-w-4xl mx-auto">
                <GlassCard className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Filter className="w-5 h-5 text-white/50 shrink-0" />
                    {categories.map((category) => (
                      <button
                        key={category}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all hover:shadow-glow-sm border border-white/10 hover:border-primary/50"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <section className="py-12 md:py-20">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12">
                  Featured Projects
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 gap-8 lg:gap-12">
                {featuredProjects.map((project, index) => (
                  <ScrollReveal key={project._id} animation="fade-up" delay={index * 100}>
                    <GlassCard hover className="group overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image */}
                        <div className="relative h-80 lg:h-auto overflow-hidden">
                          {project.featuredImage?.asset && (
                            <Image
                              src={urlFor(project.featuredImage).width(800).height(600).url()}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent lg:bg-linear-to-r" />
                        </div>

                        {/* Content */}
                        <div className="p-6 lg:p-8 flex flex-col justify-center">
                          {/* Category Badge */}
                          <div className="mb-4">
                            <span className="px-3 py-1 bg-primary/20 backdrop-blur-sm text-primary text-sm font-medium rounded-full">
                              {project.industry}
                            </span>
                          </div>

                          <h3 className="text-3xl font-bold text-white group-hover:text-gradient transition-all mb-4">
                            {project.title}
                          </h3>
                          <p className="text-white/70 leading-relaxed mb-6 text-lg">
                            {project.shortDescription}
                          </p>

                          {/* Technologies */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.technologies?.map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1 bg-white/5 text-white/80 text-sm rounded-lg border border-white/10"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          {/* CTA */}
                          <Link href={project.liveUrl || '#'}>
                            <GradientButton variant="primary" size="md">
                              <span>View Case Study</span>
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </GradientButton>
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Projects Grid */}
        <section className="py-12 md:py-20">
          <div className="container-custom">
            <ScrollReveal animation="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12">
                More Projects
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {regularProjects.map((project, index) => (
                <ScrollReveal key={project._id} animation="fade-up" delay={index * 100}>
                  <Link href={project.liveUrl || '#'}>
                    <GlassCard hover className="group overflow-hidden h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={urlFor(project.featuredImage).width(800).height(600).url()}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-primary/80 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                            {project.industry}
                          </span>
                        </div>

                        {/* Hover Icon */}
                        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-all mb-3">
                          {project.title}
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed mb-4 flex-1">
                          {project.shortDescription}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2">
                          {project.technologies?.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <ScrollReveal animation="fade-up">
              <GlassCard gradient className="p-8 md:p-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: "Projects Completed", value: "150+" },
                    { label: "Happy Clients", value: "80+" },
                    { label: "Countries Served", value: "25+" },
                    { label: "Team Members", value: "30+" },
                  ].map((stat, index) => (
                    <ScrollReveal key={stat.label} animation="fade-up" delay={index * 100}>
                      <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                          {stat.value}
                        </div>
                        <div className="text-white/70 text-sm md:text-base">
                          {stat.label}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>

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
                  <Link href="/services">
                    <GradientButton variant="outline" size="lg">
                      View Services
                    </GradientButton>
                  </Link>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
