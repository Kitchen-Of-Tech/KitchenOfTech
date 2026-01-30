"use client";

import { GradientButton } from "@/components/ui/GradientButton";
import { Laptop3D } from "@/components/landing/Laptop3D";
import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "@/lib/sanity/client";
import { SERVICE_CATEGORIES_QUERY, SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { ServiceCategory, SiteSettings } from "@/types";

export function Hero3D() {
  const [heroTitle, setHeroTitle] = useState("Transform Your Digital Presence");
  const [heroSubtitle, setHeroSubtitle] = useState("Cutting-edge IT solutions and creative services that bring your vision to life");
  const [serviceTags, setServiceTags] = useState<string[]>([
    "Web Development",
    "Mobile Apps",
    "UI/UX Design",
    "Digital Marketing",
    "AI Solutions",
    "Cloud Services",
  ]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch site settings for hero content
        const settings = await client.fetch<SiteSettings>(SITE_SETTINGS_QUERY);
        if (settings) {
          // Use seo.metaTitle and siteDescription as hero content if available
          if (settings.seo?.metaTitle) {
            setHeroTitle(settings.seo.metaTitle);
          } else if (settings.siteName) {
            setHeroTitle(`Transform Your Digital Presence with ${settings.siteName}`);
          }
          
          if (settings.siteDescription) {
            setHeroSubtitle(settings.siteDescription);
          }
        }

        // Fetch service categories for tags
        const categories = await client.fetch<ServiceCategory[]>(SERVICE_CATEGORIES_QUERY);
        if (categories && categories.length > 0) {
          const tags = categories.slice(0, 6).map(cat => cat.title);
          setServiceTags(tags);
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
        // Keep default fallback values
      }
    };

    fetchContent();
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Content Container */}
      <div className="container-custom relative z-10 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Text Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4 animate-fade-up">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">{heroTitle.split(' ').slice(0, 2).join(' ')}</span>
                <br />
                <span className="text-gradient">{heroTitle.split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto lg:mx-0">
                {heroSubtitle}
              </p>
            </div>

            {/* Services Tags */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {serviceTags.map((service) => (
                <span
                  key={service}
                  className="px-4 py-2 glass rounded-full text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-default"
                >
                  {service}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Link href="/services">
                <GradientButton variant="primary" size="lg">
                  Explore Our Services
                </GradientButton>
              </Link>
              <Link href="/meeting">
                <GradientButton variant="outline" size="lg">
                  Schedule a Meeting
                </GradientButton>
              </Link>
            </div>
          </div>

          {/* Right Side - 3D Laptop */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <Laptop3D />
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
