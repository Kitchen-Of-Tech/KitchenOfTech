import { groq } from "next-sanity";

// Site Settings Query
export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    _id,
    siteName,
    siteDescription,
    logo,
    favicon,
    email,
    phone,
    address,
    socialMedia[] {
      platform,
      url
    },
    seo {
      metaTitle,
      metaDescription,
      keywords[],
      ogImage
    }
  }
`;

// Footer Settings Query
export const FOOTER_SETTINGS_QUERY = groq`
  *[_type == "footerSettings"][0] {
    _id,
    companyLinks[] {
      label,
      href
    },
    servicesLinks[] {
      label,
      href
    },
    resourcesLinks[] {
      label,
      href
    },
    legalLinks[] {
      label,
      href
    },
    copyrightText
  }
`;

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

// Service Categories Query
export const SERVICE_CATEGORIES_QUERY = groq`
  *[_type == "serviceCategory"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    icon,
    color,
    order,
    featured,
    "serviceCount": count(*[_type == "service" && references(^._id)])
  }
`;

// Service Subcategories Query
export const SERVICE_SUBCATEGORIES_QUERY = groq`
  *[_type == "serviceSubcategory"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    icon,
    order,
    featured,
    category-> {
      _id,
      title,
      slug,
      color
    },
    "serviceCount": count(*[_type == "service" && references(^._id)])
  }
`;

// Services Query (Enhanced)
export const SERVICES_QUERY = groq`
  *[_type == "service"] | order(order asc) {
    _id,
    title,
    slug,
    shortDescription,
    icon,
    category-> {
      _id,
      title,
      slug,
      color
    },
    subcategory-> {
      _id,
      title,
      slug
    },
    pricingType,
    order,
    featured
  }
`;

// Services by Category
export const SERVICES_BY_CATEGORY_QUERY = groq`
  *[_type == "service" && references($categoryId)] | order(order asc) {
    _id,
    title,
    slug,
    shortDescription,
    icon,
    subcategory-> {
      _id,
      title,
      slug
    },
    pricingType,
    order,
    featured
  }
`;

// Services by Subcategory
export const SERVICES_BY_SUBCATEGORY_QUERY = groq`
  *[_type == "service" && subcategory._ref == $subcategoryId] | order(order asc) {
    _id,
    title,
    slug,
    shortDescription,
    icon,
    pricingType,
    order,
    featured
  }
`;

// Single Service Query (Enhanced)
export const SERVICE_QUERY = groq`
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    shortDescription,
    fullDescription,
    icon,
    category-> {
      _id,
      title,
      slug,
      color
    },
    subcategory-> {
      _id,
      title,
      slug
    },
    features[] {
      title,
      description,
      icon
    },
    technologies[],
    deliverables[],
    timeline,
    pricingType,
    subscriptionTiers[] {
      name,
      price,
      currency,
      billingPeriod,
      popular,
      features[],
      featureComparison[] {
        feature,
        included,
        limit
      }
    },
    projectPricing {
      startingPrice,
      priceRangeLow,
      priceRangeHigh,
      currency,
      baseIncludes[],
      addons[] {
        title,
        price,
        description
      }
    },
    hourlyPricing {
      rateLow,
      rateHigh,
      currency,
      rateType,
      minimumEngagement,
      expertiseLevels[] {
        level,
        rate,
        description
      },
      averageProjectHours
    },
    customPricing {
      displayText,
      description,
      showBallparkRanges,
      ballparkRanges[] {
        tier,
        rangeLow,
        rangeHigh,
        currency
      }
    },
    portfolioItems[]-> {
      _id,
      title,
      slug,
      client,
      clientLogo,
      shortDescription,
      featuredImage,
      results[] {
        metric,
        value,
        description
      },
      technologies[],
      liveUrl
    },
    gallery[] {
      asset,
      alt
    },
    faq[] {
      question,
      answer
    },
    seo {
      metaTitle,
      metaDescription,
      ogImage,
      keywords[]
    }
  }
`;

// Portfolio Query
export const PORTFOLIO_QUERY = groq`
  *[_type == "portfolio"] | order(completedDate desc) {
    _id,
    title,
    slug,
    client,
    clientLogo,
    shortDescription,
    featuredImage,
    services[]-> {
      _id,
      title,
      slug
    },
    technologies[],
    industry,
    featured,
    completedDate
  }
`;

// Single Portfolio Query
export const PORTFOLIO_ITEM_QUERY = groq`
  *[_type == "portfolio" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    client,
    clientLogo,
    shortDescription,
    fullDescription,
    challenge,
    solution,
    approach[] {
      phase,
      description
    },
    results[] {
      metric,
      value,
      description
    },
    testimonial-> {
      _id,
      clientName,
      clientCompany,
      rating,
      testimonial
    },
    services[]-> {
      _id,
      title,
      slug,
      shortDescription,
      icon
    },
    technologies[],
    industry,
    featuredImage,
    gallery[] {
      asset,
      alt,
      caption
    },
    videoUrl,
    liveUrl,
    completedDate,
    seo {
      metaTitle,
      metaDescription,
      ogImage
    }
  }
`;

// Featured Portfolio Query
export const FEATURED_PORTFOLIO_QUERY = groq`
  *[_type == "portfolio" && featured == true] | order(completedDate desc) [0...6] {
    _id,
    title,
    slug,
    client,
    clientLogo,
    shortDescription,
    featuredImage,
    results[] {
      metric,
      value
    },
    technologies[],
    completedDate
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

// TEAM MEMBERS QUERIES

// All Team Members Query (for list page)
export const TEAM_MEMBERS_QUERY = groq`
  *[_type == "team"] | order(order asc, name asc) {
    _id,
    name,
    slug,
    designation,
    image,
    shortDescription,
    available,
    featured,
    order,
    yearsOfExperience,
    technologies,
    socialLinks[] {
      platform,
      url
    }
  }
`;

// Featured Team Members Query
export const FEATURED_TEAM_MEMBERS_QUERY = groq`
  *[_type == "team" && featured == true] | order(order asc) [0...6] {
    _id,
    name,
    slug,
    designation,
    image,
    shortDescription,
    available,
    featured,
    technologies
  }
`;

// Single Team Member Query (for detail page)
export const TEAM_MEMBER_QUERY = groq`
  *[_type == "team" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    designation,
    image,
    shortDescription,
    available,
    featured,
    order,
    fullDescription,
    yearsOfExperience,
    experiences[] {
      company,
      position,
      duration,
      description,
      current
    },
    education[] {
      degree,
      institution,
      year
    },
    primarySkills[] {
      skill,
      proficiency,
      category
    },
    technologies,
    certifications[] {
      name,
      issuer,
      year,
      credentialUrl
    },
    passions[] {
      passion,
      description,
      icon
    },
    portfolioItems[] {
      title,
      description,
      image,
      url,
      technologies,
      featured
    },
    externalPortfolioLinks[] {
      platform,
      url,
      label
    },
    socialLinks[] {
      platform,
      url
    },
    seo {
      metaTitle,
      metaDescription
    }
  }
`;

// Available Team Members Query
export const AVAILABLE_TEAM_MEMBERS_QUERY = groq`
  *[_type == "team" && available == true] | order(order asc, name asc) {
    _id,
    name,
    slug,
    designation,
    image,
    shortDescription,
    available,
    featured,
    yearsOfExperience,
    technologies
  }
`;
