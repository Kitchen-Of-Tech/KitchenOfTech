import { groq } from "next-sanity";

// Branding Query
export const BRANDING_QUERY = groq`
  *[_type == "branding"][0] {
    _id,
    siteName,
    logo,
    favicon,
    tagline,
    description,
    socialMedia[] {
      platform,
      url,
      icon
    },
    seo {
      metaTitle,
      metaDescription,
      ogImage,
      keywords[]
    }
  }
`;

// Navbar Query
export const NAVBAR_QUERY = groq`
  *[_type == "navbar"][0] {
    _id,
    items[] {
      label,
      href,
      order
    },
    ctaButton {
      label,
      href
    },
    dropdownItems[] {
      label,
      items[] {
        label,
        href,
        order
      }
    }
  }
`;

// Services Query
export const SERVICES_QUERY = groq`
  *[_type == "service"] | order(order asc) {
    _id,
    title,
    slug,
    shortDescription,
    icon,
    order,
    featured
  }
`;

// Single Service Query
export const SERVICE_QUERY = groq`
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    shortDescription,
    fullDescription,
    icon,
    features[] {
      title,
      description,
      icon
    },
    pricing {
      startingPrice,
      currency,
      pricingModel
    },
    gallery[] {
      asset,
      alt
    },
    seo {
      metaTitle,
      metaDescription,
      ogImage,
      keywords[]
    }
  }
`;

// Testimonials Query
export const TESTIMONIALS_QUERY = groq`
  *[_type == "testimonial"] | order(_createdAt desc) {
    _id,
    clientName,
    clientCompany,
    clientLogo,
    rating,
    testimonial,
    projectType,
    featured,
    _createdAt
  }
`;

// Featured Testimonials Query
export const FEATURED_TESTIMONIALS_QUERY = groq`
  *[_type == "testimonial" && featured == true] | order(_createdAt desc) [0...6] {
    _id,
    clientName,
    clientCompany,
    clientLogo,
    rating,
    testimonial,
    projectType,
    _createdAt
  }
`;

// Blog Posts Query
export const BLOG_POSTS_QUERY = groq`
  *[_type == "blog"] | order(publishedDate desc) {
    _id,
    title,
    slug,
    author-> {
      name,
      image
    },
    publishedDate,
    excerpt,
    featuredImage,
    category,
    tags[],
    readTime
  }
`;

// Single Blog Post Query
export const BLOG_POST_QUERY = groq`
  *[_type == "blog" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    author-> {
      name,
      bio,
      image,
      socialLinks
    },
    publishedDate,
    content,
    featuredImage,
    category,
    tags[],
    readTime,
    seo {
      metaTitle,
      metaDescription,
      ogImage,
      keywords[]
    }
  }
`;

// Team Members Query
export const TEAM_QUERY = groq`
  *[_type == "team"] | order(order asc) {
    _id,
    name,
    role,
    bio,
    image,
    socialLinks[] {
      platform,
      url
    },
    expertise[],
    order
  }
`;

// Client Logos Query
export const CLIENT_LOGOS_QUERY = groq`
  *[_type == "clientLogo"] | order(order asc) {
    _id,
    name,
    logo,
    order
  }
`;

// Certificate Verification Query
export const CERTIFICATE_QUERY = groq`
  *[_type == "certificate" && certificateId == $id][0] {
    _id,
    certificateId,
    studentName,
    courseName,
    issueDate,
    validUntil,
    instructor,
    grade
  }
`;
