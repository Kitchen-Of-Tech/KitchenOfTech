import Image from "next/image";
import { Facebook, Twitter, Linkedin, Github, Mail, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";
import Link from "next/link";

// Demo team members data
const demoTeam = [
  {
    id: 1,
    name: "Alex Thompson",
    role: "CEO & Founder",
    bio: "Visionary leader with 15+ years of experience in tech innovation and business strategy.",
    image: "https://i.pravatar.cc/400?img=12",
    location: "San Francisco, CA",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      github: "https://github.com",
      email: "mailto:alex@kitchenoftech.org",
    },
    expertise: ["Business Strategy", "Digital Transformation", "Leadership"],
    order: 1,
    featured: true,
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Chief Technology Officer",
    bio: "Full-stack architect passionate about building scalable solutions and mentoring developers.",
    image: "https://i.pravatar.cc/400?img=47",
    location: "New York, NY",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      github: "https://github.com",
      email: "mailto:sarah@kitchenoftech.org",
    },
    expertise: ["System Architecture", "Cloud Infrastructure", "DevOps"],
    order: 2,
    featured: true,
  },
  {
    id: 3,
    name: "Michael Rodriguez",
    role: "Creative Director",
    bio: "Award-winning designer crafting exceptional user experiences with attention to detail.",
    image: "https://i.pravatar.cc/400?img=33",
    location: "Los Angeles, CA",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "mailto:michael@kitchenoftech.org",
    },
    expertise: ["UI/UX Design", "Brand Identity", "Design Systems"],
    order: 3,
    featured: true,
  },
  {
    id: 4,
    name: "Emily Johnson",
    role: "Lead Developer",
    bio: "Expert in modern web technologies with a focus on performance and user experience.",
    image: "https://i.pravatar.cc/400?img=45",
    location: "Austin, TX",
    socialLinks: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "mailto:emily@kitchenoftech.org",
    },
    expertise: ["React", "Next.js", "TypeScript", "Performance"],
    order: 4,
    featured: false,
  },
  {
    id: 5,
    name: "David Park",
    role: "AI/ML Engineer",
    bio: "Machine learning specialist developing intelligent solutions for complex business problems.",
    image: "https://i.pravatar.cc/400?img=68",
    location: "Seattle, WA",
    socialLinks: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "mailto:david@kitchenoftech.org",
    },
    expertise: ["Machine Learning", "Python", "TensorFlow", "Data Science"],
    order: 5,
    featured: false,
  },
  {
    id: 6,
    name: "Lisa Anderson",
    role: "Marketing Director",
    bio: "Strategic marketer driving brand growth through data-driven campaigns and storytelling.",
    image: "https://i.pravatar.cc/400?img=48",
    location: "Chicago, IL",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "mailto:lisa@kitchenoftech.org",
    },
    expertise: ["Digital Marketing", "SEO", "Content Strategy", "Analytics"],
    order: 6,
    featured: false,
  },
  {
    id: 7,
    name: "James Wilson",
    role: "Mobile Developer",
    bio: "iOS and Android expert creating seamless cross-platform mobile experiences.",
    image: "https://i.pravatar.cc/400?img=15",
    location: "Boston, MA",
    socialLinks: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "mailto:james@kitchenoftech.org",
    },
    expertise: ["React Native", "Flutter", "iOS", "Android"],
    order: 7,
    featured: false,
  },
  {
    id: 8,
    name: "Nina Patel",
    role: "Product Manager",
    bio: "Product strategist transforming ideas into successful digital products users love.",
    image: "https://i.pravatar.cc/400?img=25",
    location: "Denver, CO",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "mailto:nina@kitchenoftech.org",
    },
    expertise: ["Product Strategy", "Agile", "User Research", "Roadmapping"],
    order: 8,
    featured: false,
  },
];

const teamStats = [
  { label: "Team Members", value: "30+" },
  { label: "Countries", value: "12" },
  { label: "Years Experience", value: "15+" },
  { label: "Projects Delivered", value: "500+" },
];

export const metadata = {
  title: "Our Team | Kitchen of Tech",
  description: "Meet the talented team behind Kitchen of Tech. Expert developers, designers, and strategists dedicated to your success.",
};

export default function TeamPage() {
  const featuredMembers = demoTeam.filter((member) => member.featured);
  const regularMembers = demoTeam.filter((member) => !member.featured);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return Linkedin;
      case "twitter":
        return Twitter;
      case "github":
        return Github;
      case "email":
        return Mail;
      case "facebook":
        return Facebook;
      default:
        return Mail;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-transparent to-transparent" />
          
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">Meet Our </span>
                  <span className="text-gradient">Team</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70">
                  Talented individuals passionate about creating exceptional digital experiences
                </p>
              </div>
            </ScrollReveal>

            {/* Team Stats */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                {teamStats.map((stat, index) => (
                  <GlassCard key={stat.label} className="p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </GlassCard>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-12 md:py-20">
          <div className="container-custom">
            <ScrollReveal animation="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 text-center">
                Leadership Team
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredMembers.map((member, index) => (
                <ScrollReveal key={member.id} animation="fade-up" delay={index * 100}>
                  <GlassCard hover className="group overflow-hidden h-full">
                    {/* Image */}
                    <div className="relative h-80 overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      
                      {/* Social Links Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex justify-center gap-3">
                          {Object.entries(member.socialLinks).map(([platform, url]) => {
                            const Icon = getSocialIcon(platform);
                            return (
                              <a
                                key={platform}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full glass-hover flex items-center justify-center hover:bg-primary/20 transition-colors"
                              >
                                <Icon className="w-5 h-5 text-white" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {member.location && (
                        <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{member.location}</span>
                        </div>
                      )}
                      
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary font-medium mb-4">
                        {member.role}
                      </p>
                      <p className="text-white/70 text-sm leading-relaxed mb-4">
                        {member.bio}
                      </p>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-white/5 text-white/70 text-xs rounded-full border border-white/10"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* All Team Members */}
        <section className="py-12 md:py-20">
          <div className="container-custom">
            <ScrollReveal animation="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 text-center">
                Our Team
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularMembers.map((member, index) => (
                <ScrollReveal key={member.id} animation="fade-up" delay={index * 100}>
                  <GlassCard hover className="group text-center">
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden rounded-t-2xl">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary text-sm font-medium mb-3">
                        {member.role}
                      </p>
                      {member.location && (
                        <div className="flex items-center justify-center gap-2 text-xs text-white/50 mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>{member.location}</span>
                        </div>
                      )}
                      <p className="text-white/70 text-sm leading-relaxed mb-4">
                        {member.bio}
                      </p>

                      {/* Social Links */}
                      <div className="flex justify-center gap-2 mb-4">
                        {Object.entries(member.socialLinks).map(([platform, url]) => {
                          const Icon = getSocialIcon(platform);
                          return (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-full glass-hover flex items-center justify-center hover:bg-primary/20 transition-colors"
                            >
                              <Icon className="w-4 h-4 text-white" />
                            </a>
                          );
                        })}
                      </div>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-1 justify-center">
                        {member.expertise.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Join Team CTA */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <ScrollReveal animation="scale-in">
              <GlassCard gradient className="p-8 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Want to Join Our Team?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                  We&apos;re always looking for talented individuals to join our growing team
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/careers">
                    <GradientButton variant="primary" size="lg">
                      View Open Positions
                    </GradientButton>
                  </Link>
                  <a href="mailto:careers@kitchenoftech.org">
                    <GradientButton variant="outline" size="lg">
                      Send Your Resume
                    </GradientButton>
                  </a>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
