import Link from "next/link";
import { Tag } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";
import { sanityFetch } from "@/lib/sanity/client";
import { BLOG_POSTS_QUERY, BRANDING_QUERY } from "@/lib/sanity/queries";
import type { BlogPost, Branding } from "@/types";

export async function generateMetadata() {
  await sanityFetch<Branding>({ query: BRANDING_QUERY });
  
  return {
    title: "Blog | Kitchen of Tech",
    description: "Latest insights, tutorials, and industry trends in web development, design, mobile apps, AI, and digital marketing.",
  };
}

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await sanityFetch<BlogPost[]>({ 
    query: BLOG_POSTS_QUERY,
    tags: ["blog"],
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          
          <div className="container-custom relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  <span className="text-white">Our </span>
                  <span className="text-gradient">Blog</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70">
                  Insights, tutorials, and industry trends to help you stay ahead
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {posts.length === 0 && (
          <section className="py-20">
            <div className="container-custom">
              <ScrollReveal animation="fade-up">
                <GlassCard className="p-12 text-center">
                  <Tag className="w-12 h-12 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    No Posts Yet
                  </h3>
                  <p className="text-white/70 mb-8 max-w-md mx-auto">
                    We are working on bringing you amazing content. Check back soon for the latest insights and tutorials!
                  </p>
                  <Link href="/services">
                    <GradientButton variant="primary">
                      Explore Our Services
                    </GradientButton>
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
