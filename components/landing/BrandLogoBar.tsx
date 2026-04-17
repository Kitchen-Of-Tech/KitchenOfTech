"use client";

import { useEffect, useRef, useState } from "react";
import { client, urlFor } from "@/lib/sanity/client";
import { CLIENT_LOGOS_QUERY, HOME_PAGE_QUERY } from "@/lib/sanity/queries";
import type { ClientLogo } from "@/types";
import type { Image as SanityImageSource } from "sanity";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ClientLogoSection {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
}

export function BrandLogoBar() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionSettings, setSectionSettings] = useState<ClientLogoSection>({
    enabled: true,
    title: "Trusted by Industry Leaders",
    subtitle: "Join hundreds of satisfied clients worldwide",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch home page settings
        const homeData = await client.fetch<{ clientLogoSection?: ClientLogoSection }>(HOME_PAGE_QUERY);
        if (homeData?.clientLogoSection) {
          setSectionSettings(homeData.clientLogoSection);
        }

        // Fetch client logos
        const clientLogos = await client.fetch<ClientLogo[]>(CLIENT_LOGOS_QUERY);
        if (clientLogos && clientLogos.length > 0) {
          setLogos(clientLogos.filter(logo => logo.featured));
        }
      } catch (error) {
        console.error("Error fetching client logos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? logos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === logos.length - 1 ? 0 : prev + 1));
  };

  const visibleCount = 4; // Number of logos visible at once
  const getVisibleLogos = () => {
    const visible = [];
    for (let i = 0; i < visibleCount && i < logos.length; i++) {
      visible.push(logos[(currentIndex + i) % logos.length]);
    }
    return visible;
  };

  // Don't render if disabled or no logos
  if (!loading && (sectionSettings.enabled === false || logos.length === 0)) {
    return null;
  }

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      
      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {sectionSettings.title}
          </h2>
          <p className="text-white/60">
            {sectionSettings.subtitle}
          </p>
        </div>

        {/* Logo Slider */}
        <div className="container-custom">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Previous Button */}
            {logos.length > visibleCount && (
              <button
                onClick={handlePrevious}
                aria-label="Previous clients"
                className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 flex items-center justify-center transition-all hover:shadow-glow-sm"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            )}

            {/* Logo Container */}
            <div className="flex-1 overflow-hidden">
              <div
                ref={scrollerRef}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 transition-opacity duration-300"
              >
                {getVisibleLogos().map((client, index) => (
                  <div
                    key={`${client._id}-${index}`}
                    className="flex flex-col items-center justify-center"
                  >
                    <a
                      href={client.website || "#"}
                      target={client.website ? "_blank" : undefined}
                      rel={client.website ? "noopener noreferrer" : undefined}
                      className={`relative group w-full h-20 md:h-24 flex items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all ${
                        client.website ? "hover:bg-white/10 cursor-pointer" : ""
                      }`}
                    >
                      {client.logo?.asset ? (
                        <div className="relative w-5/6 h-5/6">
                          <Image
                            src={urlFor(client.logo as SanityImageSource)
                              .width(300)
                              .height(150)
                              .url()}
                            alt={client.name}
                            fill
                            sizes="(max-width: 768px) 100px, 150px"
                            className="object-contain grayscale group-hover:grayscale-0 transition-all"
                          />
                        </div>
                      ) : (
                        <span className="text-white/70 font-semibold text-xs md:text-sm text-center px-2">
                          {client.name}
                        </span>
                      )}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            {logos.length > visibleCount && (
              <button
                onClick={handleNext}
                aria-label="Next clients"
                className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 flex items-center justify-center transition-all hover:shadow-glow-sm"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            )}
          </div>

          {/* Pagination Dots */}
          {logos.length > visibleCount && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: logos.length }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to client ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
