import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Award, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sanityFetch, urlFor } from "@/lib/sanity/client";
import { ALL_BOOTCAMPS_QUERY } from "@/lib/sanity/queries";
import type { Bootcamp } from "@/types";
import type { Image as SanityImageSource } from "sanity";

export const metadata = {
  title: "BootKot - Intensive Bootcamps",
  description:
    "Join our intensive bootcamps and learn in-demand skills. Register now for the next batch starting soon.",
};

export const revalidate = 3600;

async function getAllBootcamps(): Promise<Bootcamp[]> {
  try {
    const bootcamps = await sanityFetch<Bootcamp[]>({
      query: ALL_BOOTCAMPS_QUERY,
      tags: ["bootcamp"],
    });
    return bootcamps ?? [];
  } catch (error) {
    console.error("Error fetching bootcamps:", error);
    return [];
  }
}

export default async function BootKotPage() {
  const bootcamps = await getAllBootcamps();

  return (
    <div className="min-h-screen bg-dark">
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
          {/* CSS grid pattern instead of missing SVG file */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-block px-4 py-2 bg-primary/20 rounded-full border border-primary/50">
                  <span className="text-primary text-sm font-semibold">
                    Launch Your Tech Career
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">BootKot</span>{" "}
                  <span className="text-gradient">Bootcamps</span>
                </h1>
                <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto">
                  Master in-demand tech skills through intensive, hands-on
                  bootcamps built for real-world careers.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Bootcamp Cards */}
        {bootcamps.length > 0 ? (
          <section className="pb-24">
            <div className="container-custom">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {bootcamps.map((bootcamp, index) => (
                  <ScrollReveal
                    key={bootcamp._id}
                    animation="fade-up"
                    delay={index * 100}
                  >
                    <Link href={`/bootkot/${bootcamp.slug.current}`}>
                      <GlassCard
                        hover
                        className="group h-full overflow-hidden cursor-pointer"
                      >
                        {bootcamp.bannerImage?.asset && (
                          <div className="relative h-56 overflow-hidden">
                            <Image
                              src={urlFor(
                                bootcamp.bannerImage as SanityImageSource
                              )
                                .width(700)
                                .height(400)
                                .url()}
                              alt={bootcamp.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            <div className="absolute top-4 right-4">
                              <span className="px-3 py-1 bg-primary/80 text-white text-xs font-semibold rounded-full capitalize">
                                {bootcamp.status}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-all mb-2">
                            {bootcamp.name}
                          </h3>
                          <p className="text-white/65 text-sm mb-5 line-clamp-2">
                            {bootcamp.shortDescription}
                          </p>

                          <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b border-white/10">
                            <div className="flex items-center gap-2 text-white/70">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-xs">
                                {new Date(
                                  bootcamp.startDate
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-xs">
                                {bootcamp.duration} weeks
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <Award className="w-4 h-4 text-primary" />
                              <span className="text-xs capitalize">
                                {bootcamp.level}
                              </span>
                            </div>
                          </div>

                          {bootcamp.technologies &&
                            bootcamp.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-5">
                                {bootcamp.technologies
                                  .slice(0, 4)
                                  .map((tech) => (
                                    <span
                                      key={tech}
                                      className="px-2 py-0.5 bg-white/5 text-white/60 text-xs rounded-md border border-white/10"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                {bootcamp.technologies.length > 4 && (
                                  <span className="px-2 py-0.5 bg-white/5 text-white/60 text-xs rounded-md border border-white/10">
                                    +{bootcamp.technologies.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}

                          <div className="flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
                            <span>View Details</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="pb-24">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <GlassCard className="p-12 text-center max-w-xl mx-auto">
                  <div className="text-5xl mb-4"></div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    No Bootcamps Available Right Now
                  </h2>
                  <p className="text-white/65 mb-8">
                    We&apos;re preparing our next bootcamp. Get in touch to be
                    notified when registrations open.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Get in Touch
                  </Link>
                </GlassCard>
              </ScrollReveal>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}