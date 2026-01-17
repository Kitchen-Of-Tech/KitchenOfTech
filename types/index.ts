export interface SanityImage {
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
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

export interface Service {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  shortDescription: string;
  fullDescription?: string;
  icon: SanityImage;
  features?: {
    title: string;
    description: string;
    icon: SanityImage;
  }[];
  pricing?: {
    startingPrice: number;
    currency: string;
    pricingModel: string;
  };
  gallery?: SanityImage[];
  order?: number;
  featured?: boolean;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    ogImage: SanityImage;
    keywords: string[];
  };
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
  seo?: {
    metaTitle: string;
    metaDescription: string;
    ogImage: SanityImage;
    keywords: string[];
  };
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image: SanityImage;
  socialLinks: {
    platform: string;
    url: string;
  }[];
  expertise: string[];
  order: number;
}

export interface ClientLogo {
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
