import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle,
  MapPin,
  BookOpen,
  DollarSign,
} from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { Footer } from '@/components/layout/Footer';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { sanityFetch, urlFor } from '@/lib/sanity/client';
import { BOOTCAMP_DETAIL_QUERY } from '@/lib/sanity/queries';
import BootcampRegistrationForm from '@/components/bootcamp/BootcampRegistrationForm';
import type { Bootcamp } from '@/types';
import type { Image as SanityImageSource } from 'sanity';

interface Props {
  params: Promise<{ slug: string }>;
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bootcamp = await sanityFetch<Bootcamp>({
    query: BOOTCAMP_DETAIL_QUERY,
    params: { slug },
    tags: ['bootcamp'],
  });

  if (!bootcamp) return { title: 'Bootcamp Not Found' };

  return {
    title: `${bootcamp.name} | BootKot`,
    description: bootcamp.shortDescription,
    openGraph: bootcamp.bannerImage?.asset
      ? {
          images: [
            urlFor(bootcamp.bannerImage as SanityImageSource)
              .width(1200)
              .height(630)
              .url(),
          ],
        }
      : undefined,
  };
}

export const revalidate = 3600;

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-500/20 text-green-400 border-green-500/40',
  planning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  completed: 'bg-white/10 text-white/50 border-white/20',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/40',
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function BootcampDetailPage({ params }: Props) {
  const { slug } = await params;

  const bootcamp = await sanityFetch<Bootcamp>({
    query: BOOTCAMP_DETAIL_QUERY,
    params: { slug },
    tags: ['bootcamp'],
  });

  if (!bootcamp) notFound();

  const startDate = new Date(bootcamp.startDate);
  const endDate = bootcamp.endDate ? new Date(bootcamp.endDate) : null;
  const statusColor = STATUS_COLORS[bootcamp.status] ?? STATUS_COLORS.planning;

  const spotsLeft =
    bootcamp.maxParticipants != null && bootcamp.registeredParticipants != null
      ? bootcamp.maxParticipants - bootcamp.registeredParticipants
      : null;

  const isFree = bootcamp.price === 0 || bootcamp.price == null;

  return (
    <div className="min-h-screen bg-dark">
      <main className="pb-20 pt-24">
        {/* Back link */}
        <div className="container-custom mb-6">
          <Link
            href="/bootkot"
            className="inline-flex items-center gap-2 text-white/60 hover:text-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bootcamps
          </Link>
        </div>

        {/* ── BANNER ──────────────────────────────────────────────────── */}
        {bootcamp.bannerImage?.asset && (
          <section className="container-custom mb-10">
            <ScrollReveal animation="fade-up">
              <div className="relative h-80 md:h-[440px] lg:h-[520px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={urlFor(bootcamp.bannerImage as SanityImageSource)
                    .width(1400)
                    .height(600)
                    .url()}
                  alt={bootcamp.name}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                {/* Overlay content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border capitalize ${statusColor}`}
                    >
                      {bootcamp.status === 'open' ? 'Open for Registration' : bootcamp.status}
                    </span>
                    {bootcamp.level && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full border bg-white/10 text-white/80 border-white/20 capitalize">
                        {bootcamp.level} Level
                      </span>
                    )}
                    {bootcamp.location && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full border bg-white/10 text-white/80 border-white/20 capitalize">
                        {bootcamp.location}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {bootcamp.name}
                  </h1>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* No banner — show title in container */}
        {!bootcamp.bannerImage?.asset && (
          <div className="container-custom mb-10">
            <ScrollReveal animation="fade-up">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border capitalize ${statusColor}`}>
                  {bootcamp.status === 'open' ? 'Open for Registration' : bootcamp.status}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {bootcamp.name}
              </h1>
            </ScrollReveal>
          </div>
        )}

        {/* ── MAIN GRID ────────────────────────────────────────────────── */}
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
            {/* ── LEFT: Content ──────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Quick stats */}
              <ScrollReveal animation="fade-up">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-white/50 text-xs">Start Date</span>
                    </div>
                    <p className="text-white font-bold text-sm">
                      {startDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </GlassCard>

                  {bootcamp.duration != null && (
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-white/50 text-xs">Duration</span>
                      </div>
                      <p className="text-white font-bold text-sm">{bootcamp.duration} weeks</p>
                    </GlassCard>
                  )}

                  {bootcamp.maxParticipants != null && (
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-white/50 text-xs">Seats</span>
                      </div>
                      <p className="text-white font-bold text-sm">
                        {spotsLeft !== null ? `${spotsLeft} left` : bootcamp.maxParticipants}
                      </p>
                    </GlassCard>
                  )}

                  <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-white/50 text-xs">Fee</span>
                    </div>
                    <p className="text-white font-bold text-sm">
                      {isFree
                        ? 'FREE'
                        : `${bootcamp.currency ?? 'USD'} ${bootcamp.price}`}
                    </p>
                  </GlassCard>
                </div>
              </ScrollReveal>

              {/* Description */}
              <ScrollReveal animation="fade-up">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    About This Bootcamp
                  </h2>
                  <p className="text-white/75 leading-relaxed text-base mb-4">
                    {bootcamp.shortDescription}
                  </p>
                  {bootcamp.fullDescription && (
                    <div className="text-white/70 space-y-3 leading-relaxed text-base">
                      <PortableText value={bootcamp.fullDescription as never} />
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Details card */}
              <ScrollReveal animation="fade-up">
                <GlassCard className="p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-5">Bootcamp Details</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <dt className="text-white/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Dates
                      </dt>
                      <dd className="text-white font-medium text-sm">
                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {endDate && (
                          <>
                            {' → '}
                            {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </>
                        )}
                      </dd>
                    </div>

                    {bootcamp.location && (
                      <div>
                        <dt className="text-white/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Format
                        </dt>
                        <dd className="text-white font-medium text-sm capitalize">{bootcamp.location}</dd>
                      </div>
                    )}

                    {bootcamp.level && (
                      <div>
                        <dt className="text-white/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" /> Level
                        </dt>
                        <dd className="text-white font-medium text-sm capitalize">{bootcamp.level}</dd>
                      </div>
                    )}

                    {bootcamp.certificateIncluded && (
                      <div>
                        <dt className="text-white/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" /> Certificate
                        </dt>
                        <dd className="text-white font-medium text-sm">Included on completion</dd>
                      </div>
                    )}

                    {bootcamp.registrationDeadline && (
                      <div>
                        <dt className="text-white/50 text-xs uppercase tracking-wider mb-1">
                          Registration Deadline
                        </dt>
                        <dd className="text-red-400 font-medium text-sm">
                          {new Date(bootcamp.registrationDeadline).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </dd>
                      </div>
                    )}
                  </dl>
                </GlassCard>
              </ScrollReveal>

              {/* Prerequisites */}
              {bootcamp.prerequisites && (
                <ScrollReveal animation="fade-up">
                  <GlassCard className="p-6 md:p-8">
                    <h3 className="text-xl font-bold text-white mb-3">Prerequisites</h3>
                    <p className="text-white/75 leading-relaxed">{bootcamp.prerequisites}</p>
                  </GlassCard>
                </ScrollReveal>
              )}

              {/* Learning Outcomes */}
              {bootcamp.outcomes && bootcamp.outcomes.length > 0 && (
                <ScrollReveal animation="fade-up">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">What You Will Learn</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {bootcamp.outcomes.map((outcome, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-white/80 text-sm leading-relaxed">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Technologies */}
              {bootcamp.technologies && bootcamp.technologies.length > 0 && (
                <ScrollReveal animation="fade-up">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Technologies Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      {bootcamp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-primary/15 text-primary text-sm font-medium rounded-lg border border-primary/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Syllabus */}
              {bootcamp.syllabus && bootcamp.syllabus.length > 0 && (
                <ScrollReveal animation="fade-up">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Syllabus</h3>
                    <div className="space-y-3">
                      {bootcamp.syllabus.map((week) => (
                        <GlassCard key={week.week} className="p-4">
                          <h4 className="font-bold text-white mb-2 text-sm">
                            Week {week.week}: {week.title}
                          </h4>
                          {(week.topics ?? []).length > 0 && (
                            <ul className="space-y-1">
                              {(week.topics ?? []).map((topic, i) => (
                                <li key={i} className="text-white/60 text-xs flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span>
                                  {topic}
                                </li>
                              ))}
                            </ul>
                          )}
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Instructors */}
              {bootcamp.instructors && bootcamp.instructors.length > 0 && (
                <ScrollReveal animation="fade-up">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Instructors</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {bootcamp.instructors.map((instructor, i) => (
                        <GlassCard key={i} className="p-5 flex gap-4">
                          {instructor.image?.asset && (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/30">
                              <Image
                                src={urlFor(instructor.image as SanityImageSource)
                                  .width(128)
                                  .height(128)
                                  .url()}
                                alt={instructor.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-white truncate">{instructor.name}</h4>
                            <p className="text-primary text-xs font-semibold mb-1">{instructor.title}</p>
                            {instructor.specialization && (
                              <p className="text-white/50 text-xs">{instructor.specialization}</p>
                            )}
                            {instructor.bio && (
                              <p className="text-white/60 text-xs mt-1 line-clamp-2">{instructor.bio}</p>
                            )}
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

            </div>{/* end left */}

            {/* ── RIGHT: Sticky Registration Form ──────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-4">
                <ScrollReveal animation="fade-up">
                  <BootcampRegistrationForm bootcamp={bootcamp} />
                </ScrollReveal>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
