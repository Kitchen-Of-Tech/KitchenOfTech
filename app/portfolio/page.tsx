import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Filter } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";

// Demo portfolio projects
const demoProjects = [
  {
    id: 1,
    title: "E-Commerce Platform Redesign",
    category: "Web Development",
    description: "Complete redesign and development of a modern e-commerce platform with advanced filtering and checkout features.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop",
    technologies: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"],
    link: "#",
    featured: true,
  },
  {
    id: 2,
    title: "FinTech Mobile App",
    category: "Mobile Development",
    description: "Secure mobile banking application with biometric authentication and real-time transaction monitoring.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop",
    technologies: ["React Native", "Node.js", "MongoDB", "AWS"],
    link: "#",
    featured: true,
  },
  {
    id: 3,
    title: "Healthcare Dashboard UI",
    category: "UI/UX Design",
    description: "Intuitive dashboard design for healthcare professionals with patient management and analytics features.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
    technologies: ["Figma", "Adobe XD", "Prototyping"],
    link: "#",
    featured: true,
  },
  {
    id: 4,
    title: "AI-Powered Analytics Tool",
    category: "AI Solutions",
    description: "Machine learning platform for predictive analytics and automated business insights generation.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    technologies: ["Python", "TensorFlow", "React", "FastAPI"],
    link: "#",
    featured: false,
  },
  {
    id: 5,
    title: "Real Estate Portal",
    category: "Web Development",
    description: "Property listing platform with virtual tours, advanced search filters, and agent management system.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
    technologies: ["Vue.js", "Laravel", "MySQL", "Mapbox"],
    link: "#",
    featured: false,
  },
  {
    id: 6,
    title: "Fitness Tracking App",
    category: "Mobile Development",
    description: "Cross-platform fitness app with workout tracking, nutrition logging, and social features.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    technologies: ["Flutter", "Firebase", "Apple Health", "Google Fit"],
    link: "#",
    featured: false,
  },
  {
    id: 7,
    title: "SaaS Brand Identity",
    category: "Branding",
    description: "Complete brand identity design for a B2B SaaS startup including logo, color system, and guidelines.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    technologies: ["Illustrator", "Photoshop", "Brand Strategy"],
    link: "#",
    featured: false,
  },
  {
    id: 8,
    title: "Cloud Infrastructure Migration",
    category: "Cloud Services",
    description: "Enterprise cloud migration from on-premise to AWS with auto-scaling and disaster recovery setup.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
    technologies: ["AWS", "Docker", "Kubernetes", "Terraform"],
    link: "#",
    featured: false,
  },
  {
    id: 9,
    title: "Restaurant Ordering System",
    category: "Web Development",
    description: "Online food ordering platform with real-time order tracking and kitchen management system.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    technologies: ["React", "Node.js", "Socket.io", "MongoDB"],
    link: "#",
    featured: false,
  },
];

const categories = [
  "All Projects",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "AI Solutions",
  "Cloud Services",
  "Branding",
];

export const metadata = {
  title: "Portfolio | Kitchen of Tech",
  description: "Explore our portfolio of successful projects across web development, mobile apps, UI/UX design, and digital solutions.",
};

export default function PortfolioPage() {
  const featuredProjects = demoProjects.filter((project) => project.featured);
  const regularProjects = demoProjects.filter((project) => !project.featured);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-secondary/10 via-transparent to-transparent" />
          
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">Our </span>
                  <span className="text-gradient">Portfolio</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70">
                  Showcasing innovative projects that drive real business results
                </p>
              </div>
            </ScrollReveal>

            {/* Category Filter */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="mt-12 max-w-4xl mx-auto">
                <GlassCard className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Filter className="w-5 h-5 text-white/50 shrink-0" />
                    {categories.map((category) => (
                      <button
                        key={category}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all hover:shadow-glow-sm border border-white/10 hover:border-primary/50"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <section className="py-12 md:py-20">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12">
                  Featured Projects
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 gap-8 lg:gap-12">
                {featuredProjects.map((project, index) => (
                  <ScrollReveal key={project.id} animation="fade-up" delay={index * 100}>
                    <GlassCard hover className="group overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image */}
                        <div className="relative h-80 lg:h-auto overflow-hidden">
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent lg:bg-linear-to-r" />
                        </div>

                        {/* Content */}
                        <div className="p-6 lg:p-8 flex flex-col justify-center">
                          {/* Category Badge */}
                          <div className="mb-4">
                            <span className="px-3 py-1 bg-primary/20 backdrop-blur-sm text-primary text-sm font-medium rounded-full">
                              {project.category}
                            </span>
                          </div>

                          <h3 className="text-3xl font-bold text-white group-hover:text-gradient transition-all mb-4">
                            {project.title}
                          </h3>
                          <p className="text-white/70 leading-relaxed mb-6 text-lg">
                            {project.description}
                          </p>

                          {/* Technologies */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1 bg-white/5 text-white/80 text-sm rounded-lg border border-white/10"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          {/* CTA */}
                          <Link href={project.link}>
                            <GradientButton variant="primary" size="md">
                              <span>View Case Study</span>
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </GradientButton>
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Projects Grid */}
        <section className="py-12 md:py-20">
          <div className="container-custom">
            <ScrollReveal animation="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12">
                More Projects
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {regularProjects.map((project, index) => (
                <ScrollReveal key={project.id} animation="fade-up" delay={index * 100}>
                  <Link href={project.link}>
                    <GlassCard hover className="group overflow-hidden h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-primary/80 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                            {project.category}
                          </span>
                        </div>

                        {/* Hover Icon */}
                        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-all mb-3">
                          {project.title}
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed mb-4 flex-1">
                          {project.description}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <ScrollReveal animation="fade-up">
              <GlassCard gradient className="p-8 md:p-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: "Projects Completed", value: "150+" },
                    { label: "Happy Clients", value: "80+" },
                    { label: "Countries Served", value: "25+" },
                    { label: "Team Members", value: "30+" },
                  ].map((stat, index) => (
                    <ScrollReveal key={stat.label} animation="fade-up" delay={index * 100}>
                      <div className="text-center">
                        <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                          {stat.value}
                        </div>
                        <div className="text-white/70 text-sm md:text-base">
                          {stat.label}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container-custom">
            <ScrollReveal animation="scale-in">
              <GlassCard className="p-8 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Start Your Project?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                  Let&apos;s collaborate to bring your vision to life with innovative solutions
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/meeting">
                    <GradientButton variant="primary" size="lg">
                      Schedule a Meeting
                    </GradientButton>
                  </Link>
                  <Link href="/services">
                    <GradientButton variant="outline" size="lg">
                      View Services
                    </GradientButton>
                  </Link>
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
