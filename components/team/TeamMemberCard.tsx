'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/lib/sanity/client';
import type { Image as SanityImageSource } from 'sanity';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import type { TeamMember } from '@/types';
import { Badge, CheckCircle2 } from 'lucide-react';

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
}

export function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Link href={`/team/${member.slug.current}`} className="block h-full group">
        <GlassCard className="p-6 h-full flex flex-col hover:scale-[1.02] transition-all duration-300 hover:border-blue-500/50 relative overflow-hidden">
          {/* Featured Badge */}
          {member.featured && (
            <div className="absolute top-4 right-4 z-10">
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <Badge className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">Featured</span>
                </div>
              </div>
            </div>
          )}

          {/* Profile Image */}
          <div className="relative mb-6 mx-auto">
            <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/10 group-hover:ring-blue-500/50 transition-all">
              {member.image && (
                <Image
                  src={urlFor(member.image as SanityImageSource).width(200).height(200).url()}
                  alt={member.name}
                  fill
                  sizes="128px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMWExYTFhIi8+PC9zdmc+"
                />
              )}
            </div>
            
            {/* Available Badge */}
            {member.available && (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="text-center space-y-3 flex-1 flex flex-col">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gradient transition-all">
                {member.name}
              </h3>
              <p className="text-blue-400 font-medium text-sm">
                {member.designation}
              </p>
            </div>

            <p className="text-white/70 text-sm leading-relaxed line-clamp-3 flex-1">
              {member.shortDescription}
            </p>

            {/* Technologies */}
            {member.technologies && member.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {member.technologies.slice(0, 3).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-md text-white/60"
                  >
                    {tech}
                  </span>
                ))}
                {member.technologies.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-md text-white/60">
                    +{member.technologies.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Years of Experience */}
            {member.yearsOfExperience && (
              <div className="text-xs text-white/50 pt-2">
                {member.yearsOfExperience}+ years of experience
              </div>
            )}
          </div>

          {/* Hire Me Button */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <GradientButton
              variant={member.available ? 'primary' : 'outline'}
              size="md"
              fullWidth
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                // TODO: Handle hire me action
                console.log('Hire me clicked for:', member.name);
              }}
            >
              {member.available ? 'Hire Me' : 'View Profile'}
            </GradientButton>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
