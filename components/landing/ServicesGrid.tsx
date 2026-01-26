"use client";

import Link from "next/link";
import { ArrowRight, Code, Smartphone, Palette, TrendingUp, Brain, Cloud } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useEffect, useState } from "react";
import { client } from "@/lib/sanity/client";
import { SERVICES_QUERY } from "@/lib/sanity/queries";
import type { Service } from "@/types";

// Fallback services if Sanity has no data
const defaultServices = [
  {
    id: 1,
    title: "Web Development",
    description: "Custom websites and web applications built with cutting-edge technologies for optimal performance.",
    icon: Code,
    slug: "web-development",
  },
  {
    id: 2,
    title: "Mobile Apps",
    description: "Native and cross-platform mobile applications that deliver exceptional user experiences.",
    icon: Smartphone,
    slug: "mobile-apps",
  },
  {
    id: 3,
    title: "UI/UX Design",
    description: "Beautiful, intuitive interfaces designed to engage users and drive conversions.",
    icon: Palette,
    slug: "ui-ux-design",
  },
  {
    id: 4,
    title: "Digital Marketing",
    description: "Strategic marketing campaigns that amplify your brand and reach your target audience.",
    icon: TrendingUp,
    slug: "digital-marketing",
  },
  {
    id: 5,
    title: "AI Solutions",
    description: "Intelligent automation and machine learning solutions to transform your business.",
    icon: Brain,
    slug: "ai-solutions",
  },
  {
    id: 6,
    title: "Cloud Services",
    description: "Scalable cloud infrastructure and deployment solutions for modern applications.",
    icon: Cloud,
    slug: "cloud-services",
  },
];

type ServiceDisplay = {
  id: string | number;
  title: string;
  description: string;
  icon: typeof Code;
  slug: string;
};

export function ServicesGrid() {
  const [services, setServices] = useState<ServiceDisplay[]>(defaultServices);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const sanityServices = await client.fetch<Service[]>(SERVICES_QUERY);
        if (sanityServices && sanityServices.length > 0) {
          // Map Sanity services to display format
          const mappedServices: ServiceDisplay[] = sanityServices.slice(0, 6).map((service) => ({
            id: service._id,
            title: service.title,
            description: service.shortDescription || "Explore our professional services",
            icon: Code, // Default icon, you can add icon field to Sanity schema later
            slug: service.slug.current,
          }));
          setServices(mappedServices);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        // Keep default services
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container-custom relative z-10">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="text-white">Our </span>
              <span className="text-gradient">Services</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Comprehensive IT and creative solutions tailored to your business needs
            </p>
          </div>
        </ScrollReveal>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <ScrollReveal
                key={service.id}
                animation="fade-up"
                delay={index * 100}
              >
                <GlassCard
                  hover
                  className="group p-6 md:p-8 h-full flex flex-col transition-all duration-300 hover:scale-105"
                >
                  {/* Icon */}
                  <div className="mb-6 w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:shadow-glow-md transition-shadow">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-gradient transition-all">
                      {service.title}
                    </h3>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors font-medium group/link"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>

        {/* View All Button */}
        <ScrollReveal animation="fade-up" delay={600}>
          <div className="text-center mt-12 md:mt-16">
            <Link href="/services">
              <GradientButton variant="secondary" size="lg">
                View All Services
              </GradientButton>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
