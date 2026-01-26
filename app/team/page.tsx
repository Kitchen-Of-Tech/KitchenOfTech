import { client } from '@/lib/sanity/client';
import { TEAM_MEMBERS_QUERY } from '@/lib/sanity/queries';
import type { TeamMember } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Users, Award, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export const metadata = {
  title: 'Our Team | KitchenOfTech',
  description: 'Meet the talented team behind KitchenOfTech. Expert developers, designers, and strategists dedicated to your success.',
};

export default async function TeamPage() {
  const teamMembers = await client.fetch<TeamMember[]>(TEAM_MEMBERS_QUERY);

  const featuredMembers = teamMembers.filter(member => member.featured);
  const availableMembers = teamMembers.filter(member => member.available);
  const regularMembers = teamMembers.filter(member => !member.featured);

  return (
    <div className="min-h-screen">
      <Navbar />
      <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Our Team</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient">
              Meet Our Talented Team
            </h1>
            
            <p className="text-xl text-white/70 leading-relaxed">
              A diverse group of passionate professionals dedicated to turning your ideas into reality
            </p>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            <GlassCard className="p-6 text-center">
              <div className="text-4xl font-bold text-gradient mb-2">
                {teamMembers.length}+
              </div>
              <div className="text-white/60 text-sm">Team Members</div>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="text-4xl font-bold text-gradient mb-2">
                {availableMembers.length}
              </div>
              <div className="text-white/60 text-sm">Available Now</div>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="text-4xl font-bold text-gradient mb-2">
                15+
              </div>
              <div className="text-white/60 text-sm">Years Experience</div>
            </GlassCard>
            
            <GlassCard className="p-6 text-center">
              <div className="text-4xl font-bold text-gradient mb-2">
                500+
              </div>
              <div className="text-white/60 text-sm">Projects Delivered</div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Featured Team Members */}
      {featuredMembers.length > 0 && (
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Award className="w-6 h-6 text-yellow-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Featured Members
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMembers.map((member, idx) => (
                <TeamMemberCard key={member._id} member={member} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Team Members */}
      <section className="relative py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {featuredMembers.length > 0 ? 'All Team Members' : 'Our Team Members'}
            </h2>
          </div>
          
          {regularMembers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {regularMembers.map((member, idx) => (
                <TeamMemberCard 
                  key={member._id} 
                  member={member} 
                  index={featuredMembers.length + idx} 
                />
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No additional team members yet.</p>
            </GlassCard>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <GlassCard className="p-12 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 border-blue-500/20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want to Join Our Team?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              We&apos;re always looking for talented individuals to join our growing team.
            </p>
            <a href="/contact" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
              Get in Touch
            </a>
          </GlassCard>
        </div>
      </section>
      </main>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
