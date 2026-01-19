import { Star, Quote, Filter, Building2, Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";
import Image from "next/image";
import Link from "next/link";

// Demo testimonials data
const demoTestimonials = [
  {
    id: 1,
    clientName: "John Smith",
    clientCompany: "Tech Innovations Inc.",
    clientLogo: "https://logo.clearbit.com/apple.com",
    clientImage: "https://i.pravatar.cc/150?img=12",
    role: "CEO",
    rating: 5,
    testimonial: "Kitchen of Tech transformed our digital presence completely. Their expertise in web development and design is unmatched. The team delivered beyond our expectations, on time and within budget.",
    projectType: "Web Development",
    date: "2024-01-10",
    featured: true,
  },
  {
    id: 2,
    clientName: "Sarah Johnson",
    clientCompany: "Retail Solutions Co.",
    clientLogo: "https://logo.clearbit.com/shopify.com",
    clientImage: "https://i.pravatar.cc/150?img=47",
    role: "Marketing Director",
    rating: 5,
    testimonial: "The mobile app they developed for us has been a game-changer. User engagement increased by 300% in just three months. Their attention to detail and user experience is exceptional.",
    projectType: "Mobile Development",
    date: "2024-01-05",
    featured: true,
  },
  {
    id: 3,
    clientName: "Michael Chen",
    clientCompany: "Global Finance Group",
    clientLogo: "https://logo.clearbit.com/stripe.com",
    clientImage: "https://i.pravatar.cc/150?img=33",
    role: "CTO",
    rating: 5,
    testimonial: "Outstanding work on our enterprise platform. The team handled complex requirements with ease and delivered a scalable solution that supports our global operations seamlessly.",
    projectType: "Cloud Services",
    date: "2023-12-20",
    featured: true,
  },
  {
    id: 4,
    clientName: "Emily Rodriguez",
    clientCompany: "Creative Studio Ltd.",
    clientLogo: "https://logo.clearbit.com/adobe.com",
    clientImage: "https://i.pravatar.cc/150?img=45",
    role: "Creative Director",
    rating: 5,
    testimonial: "Their UI/UX design process is thorough and professional. They really took the time to understand our brand and users, resulting in a beautiful and intuitive interface.",
    projectType: "UI/UX Design",
    date: "2023-12-15",
    featured: false,
  },
  {
    id: 5,
    clientName: "David Park",
    clientCompany: "E-Commerce Ventures",
    clientLogo: "https://logo.clearbit.com/amazon.com",
    clientImage: "https://i.pravatar.cc/150?img=68",
    role: "Founder",
    rating: 5,
    testimonial: "The e-commerce platform they built is robust, fast, and easy to manage. Sales have increased significantly, and customer feedback has been overwhelmingly positive.",
    projectType: "Web Development",
    date: "2023-12-01",
    featured: false,
  },
  {
    id: 6,
    clientName: "Lisa Anderson",
    clientCompany: "Health Tech Solutions",
    clientLogo: "https://logo.clearbit.com/microsoft.com",
    clientImage: "https://i.pravatar.cc/150?img=48",
    role: "Product Manager",
    rating: 5,
    testimonial: "Kitchen of Tech developed an AI-powered solution that streamlined our operations. The technology is cutting-edge and the implementation was smooth.",
    projectType: "AI Solutions",
    date: "2023-11-25",
    featured: false,
  },
  {
    id: 7,
    clientName: "Robert Williams",
    clientCompany: "Startup Hub Inc.",
    clientLogo: "https://logo.clearbit.com/google.com",
    clientImage: "https://i.pravatar.cc/150?img=15",
    role: "Co-Founder",
    rating: 5,
    testimonial: "From branding to website development, they handled everything professionally. Our brand identity is now strong and recognizable in the market.",
    projectType: "Branding",
    date: "2023-11-10",
    featured: false,
  },
  {
    id: 8,
    clientName: "Jennifer Lee",
    clientCompany: "Digital Marketing Pro",
    clientLogo: "https://logo.clearbit.com/hubspot.com",
    clientImage: "https://i.pravatar.cc/150?img=25",
    role: "CEO",
    rating: 5,
    testimonial: "Their digital marketing strategy delivered incredible results. We saw a 250% increase in qualified leads within the first quarter. Highly recommended!",
    projectType: "Digital Marketing",
    date: "2023-10-30",
    featured: false,
  },
  {
    id: 9,
    clientName: "Thomas Brown",
    clientCompany: "Enterprise Corp",
    clientLogo: "https://logo.clearbit.com/ibm.com",
    clientImage: "https://i.pravatar.cc/150?img=52",
    role: "IT Director",
    rating: 5,
    testimonial: "The cloud migration was executed flawlessly. Zero downtime, improved performance, and significant cost savings. Professional team all the way.",
    projectType: "Cloud Services",
    date: "2023-10-15",
    featured: false,
  },
];

const projectTypes = [
  "All Projects",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Cloud Services",
  "AI Solutions",
  "Digital Marketing",
  "Branding",
];

export const metadata = {
  title: "Testimonials | Kitchen of Tech",
  description: "Read what our clients say about working with Kitchen of Tech. Real reviews from satisfied customers across various industries.",
};

export default function TestimonialsPage() {
  const featuredTestimonials = demoTestimonials.filter((t) => t.featured);
  const regularTestimonials = demoTestimonials.filter((t) => !t.featured);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">Client </span>
                  <span className="text-gradient">Testimonials</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70">
                  Hear from clients who trusted us to bring their vision to life
                </p>
              </div>
            </ScrollReveal>

            {/* Filter */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="mt-12 max-w-4xl mx-auto">
                <GlassCard className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Filter className="w-5 h-5 text-white/50 shrink-0" />
                    {projectTypes.map((type) => (
                      <button
                        key={type}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all hover:shadow-glow-sm border border-white/10 hover:border-primary/50"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Featured Testimonials */}
        <section className="py-12 md:py-20">
          <div className="container-custom">
            <ScrollReveal animation="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12">
                Featured Reviews
              </h2>
            </ScrollReveal>

            <div className="space-y-8">
              {featuredTestimonials.map((testimonial, index) => (
                <ScrollReveal key={testimonial.id} animation="fade-up" delay={index * 100}>
                  <GlassCard hover className="group p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Client Info */}
                      <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                          <Image
                            src={testimonial.clientImage}
                            alt={testimonial.clientName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {testimonial.clientName}
                        </h3>
                        <p className="text-primary text-sm font-medium mb-2">
                          {testimonial.role}
                        </p>
                        <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                          <Building2 className="w-4 h-4" />
                          <span>{testimonial.clientCompany}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/50 text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(testimonial.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Testimonial Content */}
                      <div className="lg:col-span-9">
                        <div className="flex items-start gap-4 mb-4">
                          <Quote className="w-10 h-10 text-primary shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              {renderStars(testimonial.rating)}
                              <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                                {testimonial.projectType}
                              </span>
                            </div>
                            <p className="text-lg text-white/80 leading-relaxed">
                              {testimonial.testimonial}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* All Testimonials Grid */}
        <section className="py-12 md:py-20">
          <div className="container-custom">
            <ScrollReveal animation="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12">
                More Client Reviews
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularTestimonials.map((testimonial, index) => (
                <ScrollReveal key={testimonial.id} animation="fade-up" delay={index * 100}>
                  <GlassCard hover className="group p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={testimonial.clientImage}
                          alt={testimonial.clientName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {testimonial.clientName}
                        </h3>
                        <p className="text-primary text-sm font-medium mb-2">
                          {testimonial.role}
                        </p>
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    {/* Company */}
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                      <Building2 className="w-4 h-4" />
                      <span className="truncate">{testimonial.clientCompany}</span>
                    </div>

                    {/* Testimonial */}
                    <div className="flex-1 mb-4">
                      <Quote className="w-8 h-8 text-primary/50 mb-2" />
                      <p className="text-white/70 text-sm leading-relaxed">
                        {testimonial.testimonial}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                        {testimonial.projectType}
                      </span>
                      <div className="flex items-center gap-1 text-white/50 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(testimonial.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </GlassCard>
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
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Client Satisfaction
                  </h2>
                  <p className="text-lg text-white/70">
                    Numbers that speak for themselves
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: "Happy Clients", value: "100+" },
                    { label: "5-Star Reviews", value: "95%" },
                    { label: "Repeat Business", value: "80%" },
                    { label: "Projects Delivered", value: "500+" },
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
                  Ready to Join Our Success Stories?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                  Let&apos;s create something amazing together and add your testimonial to our wall of success
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/meeting">
                    <GradientButton variant="primary" size="lg">
                      Start Your Project
                    </GradientButton>
                  </Link>
                  <Link href="/portfolio">
                    <GradientButton variant="outline" size="lg">
                      View Our Work
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
