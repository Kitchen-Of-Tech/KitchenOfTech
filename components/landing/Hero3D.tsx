"use client";

import { GradientButton } from "@/components/ui/GradientButton";
import { Laptop3D } from "@/components/landing/Laptop3D";
import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "@/lib/sanity/client";
import { HOME_PAGE_QUERY } from "@/lib/sanity/queries";

interface HomePageData {
  heroSection?: {
    title: string;
    subtitle: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
  };
  serviceTags?: Array<{
    tag: string;
    order: number;
  }>;
}

export function Hero3D() {
  const [pageData, setPageData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback data
  const defaultData: HomePageData = {
    heroSection: {
      title: "Transform Your Digital Presence with Kitchen Of Tech",
      subtitle: "Cutting-edge IT solutions and creative services that bring your vision to life with innovation, expertise, and excellence",
      primaryButtonText: "Explore Our Services",
      primaryButtonLink: "/services",
      secondaryButtonText: "Schedule a Meeting",
      secondaryButtonLink: "/meeting",
    },
    serviceTags: [
      { tag: "Web Development", order: 1 },
      { tag: "Mobile Apps", order: 2 },
      { tag: "UI/UX Design", order: 3 },
      { tag: "Digital Marketing", order: 4 },
      { tag: "AI Solutions", order: 5 },
      { tag: "Cloud Services", order: 6 },
    ],
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await client.fetch<HomePageData>(HOME_PAGE_QUERY);
        if (data && data.heroSection) {
          setPageData(data);
        } else {
          setPageData(defaultData);
        }
      } catch (error) {
        console.error("Error fetching home page content:", error);
        setPageData(defaultData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroData = pageData?.heroSection || defaultData.heroSection!;
  const serviceTags = pageData?.serviceTags || defaultData.serviceTags!;

  // Split title intelligently for gradient effect
  const titleWords = heroData.title.split(' ');
  const splitIndex = Math.ceil(titleWords.length * 0.4); // First 40% normal, rest gradient
  const normalTitle = titleWords.slice(0, splitIndex).join(' ');
  const gradientTitle = titleWords.slice(splitIndex).join(' ');

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="text-white text-xl">Loading...</div>
      </section>
    );
  }
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
                <span className="text-white">{normalTitle}</span>
                {gradientTitle && (
                  <>
                    <br />
                    <span className="text-gradient">{gradientTitle}</span>
                  </>
                )}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {heroData.subtitle}
              </p>
            </div>

            {/* Services Tags */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {serviceTags.map((service, index) => (
                <span
                  key={index}
                  className="px-4 py-2 glass rounded-full text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-default"
                >
                  {service.tag}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Link href={heroData.primaryButtonLink || "/services"}>
                <GradientButton variant="primary" size="lg">
                  {heroData.primaryButtonText || "Explore Our Services"}
                </GradientButton>
              </Link>
              <Link href={heroData.secondaryButtonLink || "/meeting"}>
                <GradientButton variant="outline" size="lg">
                  {heroData.secondaryButtonText || "Schedule a Meeting"}
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
