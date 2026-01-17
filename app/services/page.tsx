import Link from "next/link";
import { Code } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";
import { sanityFetch } from "@/lib/sanity/client";
import { SERVICES_QUERY, BRANDING_QUERY } from "@/lib/sanity/queries";
import type { Service, Branding } from "@/types";

export async function generateMetadata() {
  const branding = await sanityFetch<Branding>({ query: BRANDING_QUERY });
  
  return {
    title: `Services | ${branding?.siteName || "Kitchen of Tech"}`,
    description: branding?.description || "Comprehensive IT and creative solutions for your business.",
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function ServicesPage() {
  const services = await sanityFetch<Service[]>({ 
    query: SERVICES_QUERY,
    tags: ["service"],
  });

  // Fallback demo services if Sanity is empty
  const demoServices = [
    {
      _id: "demo-1",
      title: "Web Development",
      slug: { current: "web-development" },
      shortDescription: "Custom websites and web applications built with cutting-edge technologies.",
      icon: { asset: { _ref: "", _type: "reference" as const } },
      features: [
        { title: "Responsive Design", description: "", icon: { asset: { _ref: "", _type: "reference" as const } } },
        { title: "SEO Optimized", description: "", icon: { asset: { _ref: "", _type: "reference" as const } } },
        { title: "Fast Performance", description: "", icon: { asset: { _ref: "", _type: "reference" as const } } },
      ],
    },
    {
      _id: "demo-2",
      title: "Mobile Apps",
      slug: { current: "mobile-apps" },
      shortDescription: "Native and cross-platform mobile applications for iOS and Android.",
      icon: { asset: { _ref: "", _type: "reference" as const } },
      features: [
        { title: "Cross-Platform", description: "", icon: { asset: { _ref: "", _type: "reference" as const } } },
        { title: "Native Performance", description: "", icon: { asset: { _ref: "", _type: "reference" as const } } },
      ],
    },
    {
      _id: "demo-3",
      title: "UI/UX Design",
      slug: { current: "ui-ux-design" },
      shortDescription: "Beautiful, intuitive interfaces designed to engage users.",
      icon: { asset: { _ref: "", _type: "reference" as const } },
      features: [
        { title: "User Research", description: "", icon: { asset: { _ref: "", _type: "reference" as const } } },
        { title: "Prototyping", description: "", icon: { asset: { _ref: "", _type: "reference" as const } } },
      ],
    },
  ];

  const displayServices = services && services.length > 0 ? services : demoServices;
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-transparent to-transparent" />
          
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">Our </span>
                  <span className="text-gradient">Services</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70">
                  Comprehensive solutions to power your digital transformation
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 md:py-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayServices.map((service, index) => (
                <ScrollReveal key={service._id} animation="fade-up" delay={index * 100}>
                  <GlassCard hover className="group p-6 md:p-8 h-full flex flex-col">
                    {/* Icon */}
                    <div className="mb-6 w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:shadow-glow-md transition-shadow">
                      <Code className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <h3 className="text-2xl font-bold text-white group-hover:text-gradient transition-all">
                        {service.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {service.shortDescription}
                      </p>

                      {/* Features */}
                      {service.features && service.features.length > 0 && (
                        <ul className="space-y-2 pt-4">
                          {service.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-white/60">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {feature.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/services/${service.slug.current}`}
                      className="mt-6 w-full"
                    >
                      <GradientButton variant="outline" size="md" fullWidth>
                        Learn More
                      </GradientButton>
                    </Link>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <ScrollReveal animation="scale-in">
              <GlassCard className="p-8 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Not Sure Which Service You Need?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                  Schedule a free consultation with our team and we'll help you find the perfect solution
                </p>
                <Link href="/meeting">
                  <GradientButton variant="primary" size="lg">
                    Schedule Free Consultation
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
