"use client";

import { useEffect, useRef } from "react";

// Demo client logos - replace with Sanity data later
const demoLogos = [
  { id: 1, name: "TechCorp", logo: "/logos/client1.svg" },
  { id: 2, name: "InnovateLab", logo: "/logos/client2.svg" },
  { id: 3, name: "DigitalWave", logo: "/logos/client3.svg" },
  { id: 4, name: "CloudNine", logo: "/logos/client4.svg" },
  { id: 5, name: "FutureSoft", logo: "/logos/client5.svg" },
  { id: 6, name: "CodeMasters", logo: "/logos/client6.svg" },
];

export function BrandLogoBar() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Duplicate items for infinite scroll
    const scrollerInner = scroller.querySelector("[data-scroller-inner]");
    if (scrollerInner) {
      const items = Array.from(scrollerInner.children);
      items.forEach((item) => {
        const duplicate = item.cloneNode(true) as HTMLElement;
        scrollerInner.appendChild(duplicate);
      });
    }
  }, []);

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
            {demoLogos.map((client) => (
              <div
                key={client.id}
                className="flex-shrink-0 w-32 md:w-40 h-16 md:h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100"
              >
                {/* Placeholder for logo - replace with actual images */}
                <div className="w-full h-full flex items-center justify-center glass rounded-lg p-4">
                  <span className="text-white/70 font-semibold text-sm md:text-base text-center">
                    {client.name}
                  </span>
                </div>
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
