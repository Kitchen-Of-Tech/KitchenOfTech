/**
 * Cached data fetchers for Sanity CMS
 * 
 * These functions use React cache() to deduplicate requests within a render
 * and Next.js caching for persistence across requests
 */

import { cache } from 'react';
import { client, sanityFetch } from './client';
import { CACHE_TAGS, CACHE_DURATION } from '@/lib/cache';
import type { Service, ServiceCategory, ServiceSubcategory, Portfolio, TeamMember, BlogPost, Testimonial, SiteSettings, FooterSettings, Branding } from '@/types';
import type { Course } from '@/types/education';

// ============================================================================
// SERVICES
// ============================================================================

/**
 * Get all services with caching
 * Cache: 30 minutes (services don't change often)
 */
export const getCachedServices = cache(async (): Promise<Service[]> => {
  const SERVICES_QUERY = `*[_type == "service"] | order(order asc, _createdAt desc) {
    _id,
    title,
    slug,
    description,
    icon,
    features,
    category->,
    subcategory->,
    pricing,
    featured,
    order
  }`;

  return sanityFetch<Service[]>({
    query: SERVICES_QUERY,
    tags: [CACHE_TAGS.SERVICES],
    revalidate: CACHE_DURATION.SEMI_STATIC,
  });
});

/**
 * Get service by slug with caching
 * Cache: 30 minutes
 */
export const getCachedServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  const SERVICE_QUERY = `*[_type == "service" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    icon,
    features,
    category->,
    subcategory->,
    pricing,
    featured,
    order,
    longDescription,
    benefits,
    process,
    faqs
  }`;

  return sanityFetch<Service>({
    query: SERVICE_QUERY,
    params: { slug },
    tags: [CACHE_TAGS.SERVICES, `service-${slug}`],
    revalidate: CACHE_DURATION.SEMI_STATIC,
  });
});

/**
 * Get service categories with caching
 * Cache: 1 hour (rarely changes)
 */
export const getCachedServiceCategories = cache(async (): Promise<ServiceCategory[]> => {
  const CATEGORIES_QUERY = `*[_type == "serviceCategory"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    icon,
    color,
    order,
    featured
  }`;

  return sanityFetch<ServiceCategory[]>({
    query: CATEGORIES_QUERY,
    tags: [CACHE_TAGS.SERVICE_CATEGORIES],
    revalidate: CACHE_DURATION.STATIC,
  });
});

/**
 * Get service subcategories with caching
 * Cache: 1 hour
 */
export const getCachedServiceSubcategories = cache(async (): Promise<ServiceSubcategory[]> => {
  const SUBCATEGORIES_QUERY = `*[_type == "serviceSubcategory"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    category->,
    order
  }`;

  return sanityFetch<ServiceSubcategory[]>({
    query: SUBCATEGORIES_QUERY,
    tags: [CACHE_TAGS.SERVICE_SUBCATEGORIES],
    revalidate: CACHE_DURATION.STATIC,
  });
});

// ============================================================================
// PORTFOLIO
// ============================================================================

/**
 * Get portfolio items with caching
 * Cache: 30 minutes
 */
export const getCachedPortfolio = cache(async (): Promise<Portfolio[]> => {
  const PORTFOLIO_QUERY = `*[_type == "portfolio"] | order(order asc, _createdAt desc) {
    _id,
    title,
    slug,
    description,
    image,
    category,
    tags,
    featured,
    order,
    client,
    completedAt,
    projectUrl,
    githubUrl
  }`;

  return sanityFetch<Portfolio[]>({
    query: PORTFOLIO_QUERY,
    tags: [CACHE_TAGS.PORTFOLIO],
    revalidate: CACHE_DURATION.SEMI_STATIC,
  });
});

// ============================================================================
// TEAM
// ============================================================================

/**
 * Get team members with caching
 * Cache: 1 hour (team doesn't change often)
 */
export const getCachedTeamMembers = cache(async (): Promise<TeamMember[]> => {
  const TEAM_QUERY = `*[_type == "teamMember"] | order(order asc) {
    _id,
    name,
    slug,
    role,
    bio,
    image,
    email,
    phone,
    socialLinks,
    specialties,
    order
  }`;

  return sanityFetch<TeamMember[]>({
    query: TEAM_QUERY,
    tags: [CACHE_TAGS.TEAM],
    revalidate: CACHE_DURATION.STATIC,
  });
});

/**
 * Get team member by slug with caching
 * Cache: 1 hour
 */
export const getCachedTeamMemberBySlug = cache(async (slug: string): Promise<TeamMember | null> => {
  const TEAM_MEMBER_QUERY = `*[_type == "teamMember" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    role,
    bio,
    image,
    email,
    phone,
    socialLinks,
    specialties,
    order,
    experience,
    education,
    certifications
  }`;

  return sanityFetch<TeamMember>({
    query: TEAM_MEMBER_QUERY,
    params: { slug },
    tags: [CACHE_TAGS.TEAM, `team-${slug}`],
    revalidate: CACHE_DURATION.STATIC,
  });
});

// ============================================================================
// BLOG
// ============================================================================

/**
 * Get blog posts with caching
 * Cache: 5 minutes (blog updates frequently)
 */
export const getCachedBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const BLOG_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    image,
    author->,
    category,
    tags,
    publishedAt,
    featured
  }`;

  return sanityFetch<BlogPost[]>({
    query: BLOG_QUERY,
    tags: [CACHE_TAGS.BLOG],
    revalidate: CACHE_DURATION.DYNAMIC,
  });
});

/**
 * Get blog post by slug with caching
 * Cache: 30 minutes
 */
export const getCachedBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const BLOG_POST_QUERY = `*[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    image,
    author->,
    category,
    tags,
    publishedAt,
    featured,
    seo
  }`;

  return sanityFetch<BlogPost>({
    query: BLOG_POST_QUERY,
    params: { slug },
    tags: [CACHE_TAGS.BLOG, `blog-${slug}`],
    revalidate: CACHE_DURATION.SEMI_STATIC,
  });
});

// ============================================================================
// EDUCATION
// ============================================================================

/**
 * Get courses with caching
 * Cache: 30 minutes
 */
export const getCachedCourses = cache(async (): Promise<Course[]> => {
  const COURSES_QUERY = `*[_type == "course"] | order(order asc, _createdAt desc) {
    _id,
    title,
    slug,
    description,
    thumbnail,
    instructor->,
    category,
    level,
    duration,
    price,
    featured,
    published,
    order
  }`;

  return sanityFetch<Course[]>({
    query: COURSES_QUERY,
    tags: [CACHE_TAGS.COURSES],
    revalidate: CACHE_DURATION.SEMI_STATIC,
  });
});

/**
 * Get course by slug with caching
 * Cache: 30 minutes
 */
export const getCachedCourseBySlug = cache(async (slug: string): Promise<Course | null> => {
  const COURSE_QUERY = `*[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    thumbnail,
    instructor->,
    category,
    level,
    duration,
    price,
    featured,
    published,
    order,
    curriculum,
    requirements,
    objectives
  }`;

  return sanityFetch<Course>({
    query: COURSE_QUERY,
    params: { slug },
    tags: [CACHE_TAGS.COURSES, `course-${slug}`],
    revalidate: CACHE_DURATION.SEMI_STATIC,
  });
});

// ============================================================================
// TESTIMONIALS
// ============================================================================

/**
 * Get testimonials with caching
 * Cache: 1 hour (doesn't change often)
 */
export const getCachedTestimonials = cache(async (): Promise<Testimonial[]> => {
  const TESTIMONIALS_QUERY = `*[_type == "testimonial"] | order(order asc, _createdAt desc) {
    _id,
    name,
    role,
    company,
    content,
    image,
    rating,
    featured,
    order
  }`;

  return sanityFetch<Testimonial[]>({
    query: TESTIMONIALS_QUERY,
    tags: [CACHE_TAGS.TESTIMONIALS],
    revalidate: CACHE_DURATION.STATIC,
  });
});

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Get site settings with caching
 * Cache: 1 hour (rarely changes)
 */
export const getCachedSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0] {
    _id,
    siteName,
    siteDescription,
    logo,
    favicon,
    seoKeywords,
    contactEmail,
    contactPhone,
    address,
    socialMedia
  }`;

  return sanityFetch<SiteSettings>({
    query: SITE_SETTINGS_QUERY,
    tags: [CACHE_TAGS.SITE_SETTINGS],
    revalidate: CACHE_DURATION.STATIC,
  });
});

/**
 * Get footer settings with caching
 * Cache: 1 hour
 */
export const getCachedFooterSettings = cache(async (): Promise<FooterSettings | null> => {
  const FOOTER_SETTINGS_QUERY = `*[_type == "footerSettings"][0] {
    _id,
    companyLinks,
    serviceLinks,
    resourceLinks,
    legalLinks,
    copyrightText
  }`;

  return sanityFetch<FooterSettings>({
    query: FOOTER_SETTINGS_QUERY,
    tags: [CACHE_TAGS.FOOTER_SETTINGS],
    revalidate: CACHE_DURATION.STATIC,
  });
});

/**
 * Get branding with caching
 * Cache: 1 hour
 */
export const getCachedBranding = cache(async (): Promise<Branding | null> => {
  const BRANDING_QUERY = `*[_type == "branding"][0] {
    _id,
    primaryColor,
    secondaryColor,
    accentColor,
    logo,
    logoWhite,
    tagline
  }`;

  return sanityFetch<Branding>({
    query: BRANDING_QUERY,
    tags: [CACHE_TAGS.BRANDING],
    revalidate: CACHE_DURATION.STATIC,
  });
});

// ============================================================================
// FALLBACK: Direct client access for uncached queries
// ============================================================================

/**
 * Export client for direct access when custom caching is needed
 */
export { client };
