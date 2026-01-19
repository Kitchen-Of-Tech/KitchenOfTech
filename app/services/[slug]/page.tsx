import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface ServiceFeature {
  title: string;
  description: string;
}

interface ServicePricing {
  startingPrice: number;
  currency: string;
  pricingModel: string;
}

interface Service {
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: ServiceFeature[];
  technologies: string[];
  pricing: ServicePricing;
}

// Demo service data - Replace with Sanity fetch
const demoServices: Record<string, Service> = {
  "web-development": {
    title: "Web Development",
    shortDescription: "Custom websites and web applications built with cutting-edge technologies",
    fullDescription: "We create stunning, high-performance websites and web applications tailored to your business needs. Our team leverages the latest technologies and best practices to deliver solutions that not only look great but also drive results.",
    features: [
      {
        title: "Responsive Design",
        description: "Mobile-first approach ensuring perfect display on all devices",
      },
      {
        title: "Performance Optimized",
        description: "Lightning-fast load times and optimal user experience",
      },
      {
        title: "SEO Friendly",
        description: "Built-in SEO optimization for better search engine rankings",
      },
      {
        title: "Scalable Architecture",
        description: "Future-proof solutions that grow with your business",
      },
      {
        title: "Custom CMS",
        description: "Easy content management without technical knowledge",
      },
      {
        title: "24/7 Support",
        description: "Ongoing maintenance and support for peace of mind",
      },
    ],
    technologies: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS"],
    pricing: {
      startingPrice: 2999,
      currency: "USD",
      pricingModel: "Fixed",
    },
  },
  "mobile-apps": {
    title: "Mobile App Development",
    shortDescription: "Native and cross-platform mobile applications",
    fullDescription: "Transform your ideas into powerful mobile applications. We develop both native and cross-platform apps that deliver exceptional user experiences across iOS and Android devices.",
    features: [
      {
        title: "Cross-Platform",
        description: "Single codebase for iOS and Android",
      },
      {
        title: "Native Performance",
        description: "Smooth animations and fast response times",
      },
      {
        title: "Offline Support",
        description: "Work seamlessly even without internet",
      },
      {
        title: "Push Notifications",
        description: "Engage users with timely updates",
      },
      {
        title: "Analytics Integration",
        description: "Track user behavior and app performance",
      },
      {
        title: "App Store Deployment",
        description: "Complete submission to App Store and Play Store",
      },
    ],
    technologies: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"],
    pricing: {
      startingPrice: 4999,
      currency: "USD",
      pricingModel: "Fixed",
    },
  },
  "ui-ux-design": {
    title: "UI/UX Design",
    shortDescription: "Beautiful, intuitive interfaces that users love",
    fullDescription: "Our design team creates stunning user interfaces and seamless user experiences. We focus on understanding your users and crafting designs that not only look beautiful but also drive engagement and conversions.",
    features: [
      {
        title: "User Research",
        description: "Deep understanding of your target audience",
      },
      {
        title: "Wireframing",
        description: "Clear structure and information architecture",
      },
      {
        title: "Prototyping",
        description: "Interactive prototypes for validation",
      },
      {
        title: "Visual Design",
        description: "Stunning interfaces that capture attention",
      },
      {
        title: "Design System",
        description: "Consistent components and guidelines",
      },
      {
        title: "Usability Testing",
        description: "Validated designs with real users",
      },
    ],
    technologies: ["Figma", "Adobe XD", "Sketch", "InVision", "Principle"],
    pricing: {
      startingPrice: 1999,
      currency: "USD",
      pricingModel: "Fixed",
    },
  },
};

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = demoServices[params.slug];
  
  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: `${service.title} | Kitchen of Tech`,
    description: service.shortDescription,
    openGraph: {
      title: service.title,
      description: service.shortDescription,
      type: "website",
    },
  };
}

export default function ServiceDetailPage({ params }: Props) {
  const service = demoServices[params.slug];

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          
          <div className="container-custom relative z-10">
            {/* Back Button */}
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Services
            </Link>

            {/* Title */}
            <ScrollReveal animation="fade-up">
              <div className="max-w-4xl space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-gradient">{service.title}</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70">
                  {service.shortDescription}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Description Section */}
        <section className="py-12 md:py-20">
          <div className="container-custom">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <ScrollReveal animation="fade-up">
                  <GlassCard className="p-6 md:p-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                      Overview
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed">
                      {service.fullDescription}
                    </p>
                  </GlassCard>
                </ScrollReveal>

                {/* Features */}
                <ScrollReveal animation="fade-up" delay={200}>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                      What&apos;s Included
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {service.features.map((feature: { title: string; description: string }, index: number) => (
                        <GlassCard key={index} className="p-6 hover:scale-105 transition-transform">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                              <Check className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-2">
                                {feature.title}
                              </h3>
                              <p className="text-white/70 text-sm">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Technologies */}
                <ScrollReveal animation="fade-up" delay={400}>
                  <GlassCard className="p-6 md:p-10">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Technologies We Use
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {service.technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className="px-4 py-2 glass-hover rounded-full text-white/80 text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </ScrollReveal>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <ScrollReveal animation="fade-left">
                  <GlassCard className="p-6 md:p-8 sticky top-24">
                    <h3 className="text-xl font-bold text-white mb-6">
                      Get Started
                    </h3>
                    
                    {/* Pricing */}
                    <div className="mb-8">
                      <div className="text-white/60 text-sm mb-2">Starting from</div>
                      <div className="text-3xl font-bold text-gradient">
                        ${service.pricing.startingPrice.toLocaleString()}
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        {service.pricing.pricingModel} Price
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-4">
                      <Link href="/meeting">
                        <GradientButton variant="primary" size="lg" fullWidth>
                          Schedule Meeting
                        </GradientButton>
                      </Link>
                      <Link href="/contact">
                        <GradientButton variant="outline" size="lg" fullWidth>
                          Get a Quote
                        </GradientButton>
                      </Link>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <p className="text-white/70 text-sm mb-4">
                        Have questions? We&apos;re here to help!
                      </p>
                      <a
                        href="mailto:info@kitchenoftech.org"
                        className="text-primary hover:text-primary-light transition-colors text-sm font-medium"
                      >
                        info@kitchenoftech.org
                      </a>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <ScrollReveal animation="scale-in">
              <GlassCard className="p-8 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Let&apos;s discuss your project and create something amazing together
                </p>
                <Link href="/meeting">
                  <GradientButton variant="primary" size="lg">
                    Schedule a Free Consultation
                  </GradientButton>
                </Link>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// Generate static params for known services
export function generateStaticParams() {
  return Object.keys(demoServices).map((slug) => ({
    slug,
  }));
}
