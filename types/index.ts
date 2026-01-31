export interface SanityImage {
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
}

export interface SiteSettings {
  _id: string;
  siteName: string;
  siteDescription: string;
  logo: SanityImage;
  favicon: SanityImage;
  email: string;
  phone?: string;
  address?: string;
  socialMedia: {
    platform: string;
    url: string;
  }[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage: SanityImage;
  };
}

export interface FooterSettings {
  _id: string;
  companyLinks: {
    label: string;
    href: string;
  }[];
  servicesLinks: {
    label: string;
    href: string;
  }[];
  resourcesLinks: {
    label: string;
    href: string;
  }[];
  legalLinks: {
    label: string;
    href: string;
  }[];
  copyrightText?: string;
}

export interface Branding {
  _id: string;
  siteName: string;
  logo: SanityImage;
  favicon: {
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  tagline: string;
  description: string;
  socialMedia: {
    platform: string;
    url: string;
    icon?: string;
  }[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: SanityImage;
    keywords: string[];
  };
}

export interface NavbarItem {
  label: string;
  href: string;
  order: number;
}

export interface Navbar {
  _id: string;
  items: NavbarItem[];
  ctaButton: {
    label: string;
    href: string;
  };
  dropdownItems: {
    label: string;
    items: NavbarItem[];
  }[];
}

export interface ClientLogo {
  _id: string;
  name: string;
  logo: SanityImage;
  website?: string;
  order: number;
  featured: boolean;
}

export interface Service {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  shortDescription: string;
  fullDescription?: unknown[];
  icon: SanityImage;
  coverImage?: SanityImage;
  category?: ServiceCategory;
  subcategory?: ServiceSubcategory;
  features?: {
    title: string;
    description: string;
    icon: SanityImage;
  }[];
  technologies?: string[];
  deliverables?: string[];
  timeline?: string;
  pricingType: 'subscription' | 'project' | 'hourly' | 'custom';
  subscriptionTiers?: SubscriptionTier[];
  projectPricing?: ProjectPricing;
  hourlyPricing?: HourlyPricing;
  customPricing?: CustomPricing;
  portfolioItems?: Portfolio[];
  gallery?: SanityImage[];
  faq?: FAQ[];
  order?: number;
  featured?: boolean;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    ogImage: SanityImage;
    keywords: string[];
  };
}

export interface ServiceCategory {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  icon?: SanityImage;
  color?: {
    hex: string;
  };
  order: number;
  featured: boolean;
  seo?: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface ServiceSubcategory {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  category: ServiceCategory;
  description?: string;
  icon?: SanityImage;
  order: number;
  featured: boolean;
}

export interface SubscriptionTier {
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'month' | 'year' | 'once';
  popular?: boolean;
  features: string[];
  featureComparison?: {
    feature: string;
    included: boolean;
    limit?: string;
  }[];
}

export interface ProjectPricing {
  startingPrice?: number;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  currency: string;
  baseIncludes?: string[];
  addons?: {
    title: string;
    price: number;
    description: string;
  }[];
}

export interface HourlyPricing {
  rateLow: number;
  rateHigh: number;
  currency: string;
  rateType: 'hour' | 'day' | 'week';
  minimumEngagement?: string;
  expertiseLevels?: {
    level: string;
    rate: number;
    description?: string;
  }[];
  averageProjectHours?: string;
}

export interface CustomPricing {
  displayText: string;
  description?: string;
  showBallparkRanges?: boolean;
  ballparkRanges?: {
    tier: string;
    rangeLow: number;
    rangeHigh: number;
    currency: string;
  }[];
}

export interface Portfolio {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  client: string;
  clientLogo?: SanityImage;
  shortDescription: string;
  fullDescription?: unknown[];
  challenge?: string;
  solution?: string;
  approach?: {
    phase: string;
    description: string;
  }[];
  results?: {
    metric: string;
    value: string;
    description?: string;
  }[];
  testimonial?: Testimonial;
  services?: Service[];
  technologies?: string[];
  industry?: string;
  featuredImage: SanityImage;
  gallery?: SanityImage[];
  videoUrl?: string;
  liveUrl?: string;
  featured: boolean;
  completedDate?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    ogImage: SanityImage;
  };
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Testimonial {
  _id: string;
  clientName: string;
  clientCompany: string;
  clientLogo: SanityImage;
  rating: number;
  testimonial: string;
  projectType: string;
  featured: boolean;
  _createdAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  author: {
    name: string;
    bio?: string;
    image: SanityImage;
    socialLinks?: {
      platform: string;
      url: string;
    }[];
  };
  publishedDate: string;
  excerpt?: string;
  content?: unknown[]; // Portable Text
  featuredImage: SanityImage;
  category: string;
  tags: string[];
  readTime?: number;
  featured?: boolean;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    ogImage: SanityImage;
    keywords: string[];
  };
}

// TEAM MEMBER TYPES
export interface TeamExperience {
  company: string;
  position: string;
  duration: string;
  description?: string;
  current: boolean;
}

export interface TeamEducation {
  degree: string;
  institution: string;
  year?: string;
}

export interface TeamSkill {
  skill: string;
  proficiency: number;
  category?: 'frontend' | 'backend' | 'design' | 'devops' | 'marketing' | 'management' | 'other';
}

export interface TeamCertification {
  name: string;
  issuer?: string;
  year?: string;
  credentialUrl?: string;
}

export interface TeamPassion {
  passion: string;
  description?: string;
  icon?: SanityImage;
}

export interface TeamPortfolioItem {
  title: string;
  description?: string;
  image?: SanityImage;
  url?: string;
  technologies?: string[];
  featured: boolean;
}

export interface TeamExternalLink {
  platform: 'github' | 'dribbble' | 'behance' | 'codepen' | 'website' | 'other';
  url: string;
  label?: string;
}

export interface TeamSocialLink {
  platform: 'linkedin' | 'twitter' | 'github' | 'dribbble' | 'behance' | 'instagram' | 'youtube';
  url: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  designation: string;
  image: SanityImage;
  shortDescription: string;
  available: boolean;
  featured: boolean;
  order: number;
  fullDescription?: unknown[];
  yearsOfExperience?: number;
  experiences?: TeamExperience[];
  education?: TeamEducation[];
  primarySkills?: TeamSkill[];
  technologies?: string[];
  certifications?: TeamCertification[];
  passions?: TeamPassion[];
  portfolioItems?: TeamPortfolioItem[];
  externalPortfolioLinks?: TeamExternalLink[];
  socialLinks?: TeamSocialLink[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface Certificate {
  _id: string;
  name: string;
  logo: SanityImage;
  order: number;
}

export interface Certificate {
  _id: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  validUntil: string;
  instructor?: string;
  grade?: string;
}

export interface MeetingRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
  preferred_date?: string;
}

// Articles System Types
export interface ArticleAuthor {
  _id: string;
  name: string;
  facebookId: string;
  email?: string;
  phone?: string;
  profileImage?: SanityImage;
  bio?: string;
  joinedAt: string;
  isActive: boolean;
  isBanned: boolean;
  bannedReason?: string;
  totalArticles: number;
  totalUpvotes: number;
  totalDownvotes: number;
  totalViews: number;
}

export interface Article {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  author: ArticleAuthor;
  coverImage?: SanityImage;
  excerpt?: string;
  content: unknown[]; // Portable Text content
  tags?: string[];
  category?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string;
  updatedAt?: string;
  upvotes: number;
  downvotes: number;
  views: number;
  commentCount: number;
  featured: boolean;
  readingTime?: number;
}

export interface ArticleComment {
  _id: string;
  article: {
    _ref: string;
    _type: 'reference';
  };
  author: ArticleAuthor;
  content: string;
  parentComment?: {
    _ref: string;
    _type: 'reference';
  };
  createdAt: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedReason?: string;
}

export interface ArticleVote {
  _id: string;
  article: {
    _ref: string;
    _type: 'reference';
  };
  voter: {
    _ref: string;
    _type: 'reference';
  };
  voteType: 'upvote' | 'downvote';
  votedAt: string;
  ipAddress?: string;
}

