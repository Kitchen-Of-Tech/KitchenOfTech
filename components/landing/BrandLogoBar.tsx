"use client";

import { useEffect, useRef, useState } from "react";
import { client, urlFor } from "@/lib/sanity/client";
import { CLIENT_LOGOS_QUERY } from "@/lib/sanity/queries";
import type { ClientLogo } from "@/types";
import type { Image as SanityImageSource } from "sanity";
import Image from "next/image";

export function BrandLogoBar() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
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

    fetchLogos();
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || logos.length === 0) return;

    // Duplicate items for infinite scroll
    const scrollerInner = scroller.querySelector("[data-scroller-inner]");
    if (scrollerInner) {
      const items = Array.from(scrollerInner.children);
      items.forEach((item) => {
        const duplicate = item.cloneNode(true) as HTMLElement;
        scrollerInner.appendChild(duplicate);
      });
    }
  }, [logos]);

  // Don't render if no logos
  if (!loading && logos.length === 0) {
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
            Trusted by Industry Leaders
          </h2>
          <p className="text-white/60">
            Join hundreds of satisfied clients worldwide
          </p>
        </div>

        {/* Logo Scroller */}
        <div
          ref={scrollerRef}
          className="relative overflow-hidden mask-gradient"
          data-scroller
        >
          <div
            data-scroller-inner
            className="flex gap-12 md:gap-16 items-center animate-scroll"
            style={{
              width: "max-content",
            }}
          >
            {logos.map((client) => (
              <div
                key={client._id}
                className="flex-shrink-0 w-32 md:w-40 h-16 md:h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100"
              >
                {client.logo?.asset ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={urlFor(client.logo as SanityImageSource).width(200).height(100).url()}
                      alt={client.name}
                      fill
                      sizes="(max-width: 768px) 128px, 160px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center glass rounded-lg p-4">
                    <span className="text-white/70 font-semibold text-sm md:text-base text-center">
                      {client.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .mask-gradient {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        }
      `}</style>
    </section>
  );
}
