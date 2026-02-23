import Link from "next/link";
import Image from "next/image";
import { Tag, Calendar, Clock, User } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientButton } from "@/components/ui/GradientButton";
import { sanityFetch, urlFor } from "@/lib/sanity/client";
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

        {posts.length > 0 && (
          <section className="py-20">
            <div className="container-custom">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <ScrollReveal key={post._id} animation="fade-up">
                    <Link href={`/blog/${post.slug.current}`} className="block h-full group">
                      <GlassCard className="overflow-hidden h-full flex flex-col hover:border-white/30 transition-all duration-300 group-hover:-translate-y-1">
                        {/* Featured Image */}
                        <div className="relative h-52 w-full overflow-hidden bg-white/5 flex-shrink-0">
                          {post.featuredImage?.asset ? (
                            <Image
                              src={urlFor(post.featuredImage as Parameters<typeof urlFor>[0]).width(600).height(340).url()}
                              alt={post.featuredImage.alt || post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag className="w-10 h-10 text-white/20" />
                            </div>
                          )}
                          {post.category && (
                            <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full bg-primary/80 backdrop-blur-sm text-white">
                              {post.category}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 p-6 gap-3">
                          <h2 className="text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                            {post.title}
                          </h2>

                          {post.excerpt && (
                            <p className="text-sm text-white/60 line-clamp-3 flex-1">
                              {post.excerpt}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-white/50 mt-auto pt-3 border-t border-white/10 flex-wrap">
                            {post.author?.name && (
                              <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {post.author.name}
                              </span>
                            )}
                            {post.publishedDate && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.publishedDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                            {post.readTime && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {post.readTime} min read
                              </span>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

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
