import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Search, Tag } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { GradientButton } from '@/components/ui/GradientButton';
import { sanityFetch, urlFor } from '@/lib/sanity/client';
import { BLOG_POSTS_QUERY, BRANDING_QUERY } from '@/lib/sanity/queries';
import type { BlogPost, Branding } from '@/types';

const categories = [
  'All Posts',
  'Web Development',
  'Design',
  'Mobile Development',
  'Artificial Intelligence',
  'Cloud Computing',
  'Marketing',
];

export async function generateMetadata() {
  const branding = await sanityFetch<Branding>({ query: BRANDING_QUERY });
  
  return {
    title: Blog | ,
    description: 'Latest insights, tutorials, and industry trends in web development, design, mobile apps, AI, and digital marketing.',
  };
}

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await sanityFetch<BlogPost[]>({ 
    query: BLOG_POSTS_QUERY,
    tags: ['blog'],
  });

  const featuredPosts = posts.filter((post) => post.featured);
  const regularPosts = posts.filter((post) => !post.featured);

  return (
    <div className='min-h-screen'>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className='relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent' />
          
          <div className='container-custom relative z-10'>
            <ScrollReveal animation='fade-up'>
              <div className='text-center max-w-4xl mx-auto space-y-6'>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold'>
                  <span className='text-white'>Our </span>
                  <span className='text-gradient'>Blog</span>
                </h1>
                <p className='text-xl md:text-2xl text-white/70'>
                  Insights, tutorials, and industry trends to help you stay ahead
                </p>
              </div>
            </ScrollReveal>

            {/* Search and Filter */}
            <ScrollReveal animation='fade-up' delay={200}>
              <div className='mt-12 max-w-4xl mx-auto'>
                <GlassCard className='p-6'>
                  <div className='flex flex-col md:flex-row gap-4'>
                    <div className='flex-1 relative'>
                      <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50' />
                      <input
                        type='text'
                        placeholder='Search articles...'
                        className='w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors'
                      />
                    </div>
                    <select className='px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors cursor-pointer'>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </GlassCard>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className='py-12 md:py-20'>
            <div className='container-custom'>
              <ScrollReveal animation='fade-up'>
                <h2 className='text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12'>
                  Featured Articles
                </h2>
              </ScrollReveal>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8'>
                {featuredPosts.map((post, index) => (
                  <ScrollReveal key={post._id} animation='fade-up' delay={index * 100}>
                    <Link href={/blog/}>
                      <GlassCard hover className='group overflow-hidden h-full'>
                        <div className='relative h-64 overflow-hidden'>
                          {post.featuredImage && (
                            <Image
                              src={urlFor(post.featuredImage).width(800).height(600).url()}
                              alt={post.title}
                              fill
                              className='object-cover group-hover:scale-110 transition-transform duration-500'
                            />
                          )}
                          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />
                          
                          {post.category && (
                            <div className='absolute top-4 left-4'>
                              <span className='px-3 py-1 bg-primary/80 backdrop-blur-sm text-white text-sm font-medium rounded-full'>
                                {post.category}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='p-6 md:p-8'>
                          <h3 className='text-2xl font-bold text-white group-hover:text-gradient transition-all mb-3'>
                            {post.title}
                          </h3>
                          <p className='text-white/70 leading-relaxed mb-6'>
                            {post.excerpt}
                          </p>

                          <div className='flex flex-wrap items-center gap-4 text-sm text-white/50'>
                            {post.author && (
                              <div className='flex items-center gap-2'>
                                {post.author.image && (
                                  <Image
                                    src={urlFor(post.author.image).width(24).height(24).url()}
                                    alt={post.author.name}
                                    width={24}
                                    height={24}
                                    className='rounded-full'
                                  />
                                )}
                                <span>{post.author.name}</span>
                              </div>
                            )}
                            {post.publishedDate && (
                              <div className='flex items-center gap-2'>
                                <Calendar className='w-4 h-4' />
                                <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {post.readTime && (
                              <div className='flex items-center gap-2'>
                                <Clock className='w-4 h-4' />
                                <span>{post.readTime}</span>
                              </div>
                            )}
                          </div>

                          {post.tags && post.tags.length > 0 && (
                            <div className='flex flex-wrap gap-2 mt-4'>
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className='px-2 py-1 bg-white/5 text-white/60 text-xs rounded-md'
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className='py-20 md:py-32'>
          <div className='container-custom'>
            <ScrollReveal animation='scale-in'>
              <GlassCard gradient className='p-8 md:p-16 text-center'>
                <Tag className='w-12 h-12 text-primary mx-auto mb-6' />
                <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
                  Subscribe to Our Newsletter
                </h2>
                <p className='text-lg text-white/70 mb-8 max-w-2xl mx-auto'>
                  Get the latest articles, tutorials, and industry insights delivered to your inbox
                </p>
                <form className='flex flex-col sm:flex-row gap-4 max-w-xl mx-auto'>
                  <input
                    type='email'
                    placeholder='Enter your email address'
                    className='flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors'
                  />
                  <GradientButton variant='primary' size='lg'>
                    Subscribe
                  </GradientButton>
                </form>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
