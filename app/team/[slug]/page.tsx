import { client } from '@/lib/sanity/client';
import { TEAM_MEMBER_QUERY, TEAM_MEMBERS_QUERY } from '@/lib/sanity/queries';
import type { TeamMember } from '@/types';
import type { Image as SanityImageSource } from 'sanity';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { urlFor } from '@/lib/sanity/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  Heart, 
  ExternalLink,
  CheckCircle2,
  Calendar,
  TrendingUp
} from 'lucide-react';

export async function generateStaticParams() {
  const members = await client.fetch<TeamMember[]>(TEAM_MEMBERS_QUERY);
  return members.map((member) => ({
    slug: member.slug.current,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await client.fetch<TeamMember>(TEAM_MEMBER_QUERY, { slug });
  
  if (!member) return { title: 'Team Member Not Found' };

  return {
    title: `${member.name} - ${member.designation} | KitchenOfTech`,
    description: member.shortDescription || `Learn more about ${member.name}, ${member.designation} at KitchenOfTech`,
  };
}

export default async function TeamMemberDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await client.fetch<TeamMember>(TEAM_MEMBER_QUERY, { slug });

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Link 
              href="/team" 
              className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors"
            >
               Back to Team
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Image */}
              <div className="relative">
                {member.image?.asset && (
                  <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden ring-4 ring-blue-500/20 shadow-2xl shadow-blue-500/20">
                    <Image
                      src={urlFor(member.image as SanityImageSource).width(400).height(400).url()}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {member.available && (
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-2 bg-green-500/20 border border-green-500/30 backdrop-blur-sm rounded-full px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Available</span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-3">
                    {member.name}
                  </h1>
                  <p className="text-2xl md:text-3xl text-blue-400 font-semibold mb-4">
                    {member.designation}
                  </p>
                  {member.shortDescription && (
                    <p className="text-lg text-white/70 leading-relaxed">
                      {member.shortDescription}
                    </p>
                  )}
                </div>

                {member.yearsOfExperience && (
                  <div className="flex items-center gap-2 text-white/60">
                    <TrendingUp className="w-5 h-5" />
                    <span>{member.yearsOfExperience}+ years of experience</span>
                  </div>
                )}

                <Link href="/contact">
                  <GradientButton size="lg">
                    Hire {member.name.split(' ')[0]}
                  </GradientButton>
                </Link>

                {/* Social Links */}
                {member.socialLinks && member.socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {member.socialLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-blue-500/50 transition-all text-sm capitalize"
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      {member.technologies && member.technologies.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Technologies & Tools</h2>
              <GlassCard className="p-6">
                <div className="flex flex-wrap gap-3">
                  {member.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg text-sm font-medium text-white hover:scale-105 transition-transform"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
      )}

      {/* Skills */}
      {member.primarySkills && member.primarySkills.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Skills & Expertise</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {member.primarySkills.map((skill, idx) => (
                  <GlassCard key={idx} className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">{skill.skill}</span>
                        <span className="text-sm text-blue-400 font-medium">{skill.proficiency}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                      {skill.category && (
                        <span className="text-xs text-white/50 capitalize">{skill.category}</span>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Work Experience */}
      {member.experiences && member.experiences.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Work Experience</h2>
              </div>
              <div className="space-y-6">
                {member.experiences.map((exp, idx) => (
                  <GlassCard key={idx} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{exp.position}</h3>
                        <p className="text-blue-400 font-semibold mb-2">{exp.company}</p>
                        {exp.description && (
                          <p className="text-white/70 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-white/60 whitespace-nowrap">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{exp.duration}</span>
                        {exp.current && (
                          <span className="ml-2 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Education */}
      {member.education && member.education.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Education</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {member.education.map((edu, idx) => (
                  <GlassCard key={idx} className="p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{edu.degree}</h3>
                    <p className="text-blue-400 mb-2">{edu.institution}</p>
                    <p className="text-sm text-white/60">{edu.year}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Certifications */}
      {member.certifications && member.certifications.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Certifications</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {member.certifications.map((cert, idx) => (
                  <GlassCard key={idx} className="p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{cert.name}</h3>
                    <p className="text-blue-400 mb-2">{cert.issuer}</p>
                    <p className="text-sm text-white/60 mb-3">{cert.year}</p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View Credential <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Passions */}
      {member.passions && member.passions.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Passions & Interests</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {member.passions.map((passion, idx) => (
                  <GlassCard key={idx} className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{passion.passion}</h3>
                    {passion.description && (
                      <p className="text-white/70 text-sm leading-relaxed">{passion.description}</p>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Projects */}
      {member.portfolioItems && member.portfolioItems.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Portfolio Projects</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {member.portfolioItems.map((item, idx) => (
                  <GlassCard key={idx} className="p-0 overflow-hidden group">
                    {item.image?.asset && (
                      <div className="relative w-full h-48 overflow-hidden">
                        <Image
                          src={urlFor(item.image as SanityImageSource).width(600).height(400).url()}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {item.featured && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 backdrop-blur-sm rounded-full">
                            <span className="text-xs font-medium text-yellow-400">Featured</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      {item.description && (
                        <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                      )}
                      {item.technologies && item.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.technologies.map((tech, techIdx) => (
                            <span
                              key={techIdx}
                              className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View Project <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* External Links */}
      {member.externalPortfolioLinks && member.externalPortfolioLinks.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">External Profiles</h2>
              <GlassCard className="p-6">
                <div className="flex flex-wrap gap-4">
                  {member.externalPortfolioLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg hover:scale-105 transition-all"
                    >
                      <span className="font-medium text-white capitalize">{link.label || link.platform}</span>
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                    </a>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <GlassCard className="p-12 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 border-blue-500/20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Work with {member.name.split(' ')[0]}?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                {member.available 
                  ? `${member.name.split(' ')[0]} is currently available for new projects and collaborations.`
                  : `Reach out to discuss future opportunities with ${member.name.split(' ')[0]}.`
                }
              </p>
              <Link href="/contact">
                <GradientButton size="lg">
                  Hire {member.name.split(' ')[0]} Now
                </GradientButton>
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
