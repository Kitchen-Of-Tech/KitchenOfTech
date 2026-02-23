/**
 * Kitchen of Tech — Sanity Service Content Seed Script
 * =====================================================
 * Programmatically inserts 6 Service Categories, 21 Subcategories,
 * and 21 Service documents with full SEO-optimized, professional content.
 *
 * Run: npx ts-node --project tsconfig.scripts.json scripts/seed-services.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

// ─────────────────────────────────────────────────────────────
// HELPER: portable text block builder
// ─────────────────────────────────────────────────────────────
function block(text: string) {
  return {
    _type: "block",
    _key: Math.random().toString(36).slice(2, 10),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 10), text, marks: [] }],
  };
}

function heading(text: string, level: 2 | 3 = 2) {
  return {
    _type: "block",
    _key: Math.random().toString(36).slice(2, 10),
    style: `h${level}`,
    markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 10), text, marks: [] }],
  };
}

// ─────────────────────────────────────────────────────────────
// STEP 1 — SERVICE CATEGORIES
// ─────────────────────────────────────────────────────────────
const categories = [
  {
    _id: "cat-creative-branding",
    _type: "serviceCategory",
    title: "Creative & Branding",
    slug: { _type: "slug", current: "creative-branding" },
    description:
      "Transform your brand identity with world-class design that resonates with your audience and sets you apart from the competition.",
    order: 1,
    featured: true,
    seo: {
      metaTitle: "Creative & Branding Services | Kitchen of Tech",
      metaDescription:
        "Professional logo design, corporate branding, packaging, and UI/UX design services that build memorable brand identities and drive business growth.",
    },
  },
  {
    _id: "cat-video-motion",
    _type: "serviceCategory",
    title: "Video & Motion",
    slug: { _type: "slug", current: "video-motion" },
    description:
      "Captivate your audience with professional video production, motion graphics, and animated content that tells your brand story powerfully.",
    order: 2,
    featured: true,
    seo: {
      metaTitle: "Video & Motion Graphics Services | Kitchen of Tech",
      metaDescription:
        "Corporate video editing, social media reels, explainer videos, and motion graphics that engage audiences and drive conversions.",
    },
  },
  {
    _id: "cat-digital-marketing",
    _type: "serviceCategory",
    title: "Digital Marketing",
    slug: { _type: "slug", current: "digital-marketing" },
    description:
      "Drive measurable growth with data-driven digital marketing strategies including paid ads, SEO, and conversion optimization.",
    order: 3,
    featured: true,
    seo: {
      metaTitle: "Digital Marketing Services | Kitchen of Tech",
      metaDescription:
        "Meta Ads, Google Ads, SEO optimization, and analytics services that grow your online presence and maximize your marketing ROI.",
    },
  },
  {
    _id: "cat-development",
    _type: "serviceCategory",
    title: "Development",
    slug: { _type: "slug", current: "development" },
    description:
      "Build powerful, scalable digital solutions from enterprise ERPs and CRMs to custom software and ecommerce platforms.",
    order: 4,
    featured: true,
    seo: {
      metaTitle: "Software Development Services | Kitchen of Tech",
      metaDescription:
        "Custom ERP, CRM, software development, and ecommerce solutions built with modern technology stacks for scalable business growth.",
    },
  },
  {
    _id: "cat-ai-automation",
    _type: "serviceCategory",
    title: "AI Automation",
    slug: { _type: "slug", current: "ai-automation" },
    description:
      "Supercharge your business efficiency with intelligent AI-powered automation, chatbots, and workflow optimization systems.",
    order: 5,
    featured: true,
    seo: {
      metaTitle: "AI Automation Services | Kitchen of Tech",
      metaDescription:
        "AI workflow automation with n8n, intelligent chatbot systems, and process optimization that reduce costs and scale your operations.",
    },
  },
  {
    _id: "cat-business-consultancy",
    _type: "serviceCategory",
    title: "Business Consultancy",
    slug: { _type: "slug", current: "business-consultancy" },
    description:
      "Strategic business consulting to define your digital roadmap, optimize your business model, and accelerate sustainable revenue growth.",
    order: 6,
    featured: true,
    seo: {
      metaTitle: "Business Consultancy Services | Kitchen of Tech",
      metaDescription:
        "Expert digital strategy, business model structuring, and revenue growth planning to transform your business and achieve lasting success.",
    },
  },
];

// ─────────────────────────────────────────────────────────────
// STEP 2 — SERVICE SUBCATEGORIES
// ─────────────────────────────────────────────────────────────
const subcategories = [
  // Creative & Branding
  { _id: "sub-logo-brand-identity", _type: "serviceSubcategory", title: "Logo & Brand Identity Systems", slug: { _type: "slug", current: "logo-brand-identity" }, category: { _type: "reference", _ref: "cat-creative-branding" }, order: 1, featured: true, description: "Complete logo design and brand identity systems including color palettes, typography, and usage guidelines." },
  { _id: "sub-corporate-branding", _type: "serviceSubcategory", title: "Corporate Branding Guidelines", slug: { _type: "slug", current: "corporate-branding-guidelines" }, category: { _type: "reference", _ref: "cat-creative-branding" }, order: 2, featured: false, description: "Comprehensive brand books and corporate identity guidelines ensuring visual consistency across all touchpoints." },
  { _id: "sub-packaging-print", _type: "serviceSubcategory", title: "Packaging & Print Design", slug: { _type: "slug", current: "packaging-print-design" }, category: { _type: "reference", _ref: "cat-creative-branding" }, order: 3, featured: false, description: "Professional packaging design and print materials that strengthen your brand at every physical touchpoint." },
  { _id: "sub-ui-ux-design", _type: "serviceSubcategory", title: "UI/UX Interface Design", slug: { _type: "slug", current: "ui-ux-design" }, category: { _type: "reference", _ref: "cat-creative-branding" }, order: 4, featured: true, description: "User-centered interface design and UX research that creates intuitive, engaging digital experiences." },
  // Video & Motion
  { _id: "sub-corporate-video", _type: "serviceSubcategory", title: "Corporate Video Editing", slug: { _type: "slug", current: "corporate-video-editing" }, category: { _type: "reference", _ref: "cat-video-motion" }, order: 1, featured: true, description: "Professional corporate video editing with color grading, sound design, and motion text for brand storytelling." },
  { _id: "sub-social-reels", _type: "serviceSubcategory", title: "Social Media Reels", slug: { _type: "slug", current: "social-media-reels" }, category: { _type: "reference", _ref: "cat-video-motion" }, order: 2, featured: true, description: "Scroll-stopping short-form video content optimized for Instagram, Facebook, TikTok, and YouTube Shorts." },
  { _id: "sub-motion-graphics", _type: "serviceSubcategory", title: "Motion Graphics", slug: { _type: "slug", current: "motion-graphics" }, category: { _type: "reference", _ref: "cat-video-motion" }, order: 3, featured: false, description: "Animated graphics, kinetic typography, and branded motion elements for videos and digital platforms." },
  { _id: "sub-explainer-videos", _type: "serviceSubcategory", title: "Explainer Videos", slug: { _type: "slug", current: "explainer-videos" }, category: { _type: "reference", _ref: "cat-video-motion" }, order: 4, featured: false, description: "Clear, engaging animated and live-action explainer videos that simplify complex concepts for your audience." },
  // Digital Marketing
  { _id: "sub-meta-advertising", _type: "serviceSubcategory", title: "Meta Advertising", slug: { _type: "slug", current: "meta-advertising" }, category: { _type: "reference", _ref: "cat-digital-marketing" }, order: 1, featured: true, description: "Strategic Facebook and Instagram ad campaigns with advanced targeting, creative optimization, and ROAS maximization." },
  { _id: "sub-google-advertising", _type: "serviceSubcategory", title: "Google Advertising", slug: { _type: "slug", current: "google-advertising" }, category: { _type: "reference", _ref: "cat-digital-marketing" }, order: 2, featured: true, description: "Google Search, Display, Shopping, and YouTube ad campaigns built for maximum visibility and cost-efficient leads." },
  { _id: "sub-seo-optimization", _type: "serviceSubcategory", title: "SEO Optimization", slug: { _type: "slug", current: "seo-optimization" }, category: { _type: "reference", _ref: "cat-digital-marketing" }, order: 3, featured: true, description: "Technical SEO, on-page optimization, and content strategy that drives sustainable organic traffic and rankings." },
  { _id: "sub-analytics-conversion", _type: "serviceSubcategory", title: "Analytics & Conversion Tracking", slug: { _type: "slug", current: "analytics-conversion-tracking" }, category: { _type: "reference", _ref: "cat-digital-marketing" }, order: 4, featured: false, description: "GA4 setup, event tracking, conversion funnels, and data dashboards that turn insights into profitable actions." },
  // Development
  { _id: "sub-erp-systems", _type: "serviceSubcategory", title: "ERP Systems", slug: { _type: "slug", current: "erp-systems" }, category: { _type: "reference", _ref: "cat-development" }, order: 1, featured: true, description: "End-to-end ERP solutions integrating finance, HR, inventory, procurement, and operations for enterprise efficiency." },
  { _id: "sub-crm-platforms", _type: "serviceSubcategory", title: "CRM Platforms", slug: { _type: "slug", current: "crm-platforms" }, category: { _type: "reference", _ref: "cat-development" }, order: 2, featured: true, description: "Custom CRM systems that streamline sales pipelines, customer relationships, and team collaboration." },
  { _id: "sub-custom-software", _type: "serviceSubcategory", title: "Custom Software Development", slug: { _type: "slug", current: "custom-software-development" }, category: { _type: "reference", _ref: "cat-development" }, order: 3, featured: true, description: "Tailor-made web and mobile applications built with modern frameworks to solve your unique business challenges." },
  { _id: "sub-ecommerce", _type: "serviceSubcategory", title: "Ecommerce Platforms", slug: { _type: "slug", current: "ecommerce-platforms" }, category: { _type: "reference", _ref: "cat-development" }, order: 4, featured: true, description: "Full-featured ecommerce stores with payment integration, inventory management, and conversion-optimized UX." },
  { _id: "sub-cms-platforms", _type: "serviceSubcategory", title: "WordPress / Shopify / Wix", slug: { _type: "slug", current: "wordpress-shopify-wix" }, category: { _type: "reference", _ref: "cat-development" }, order: 5, featured: false, description: "Professional website development on leading CMS and ecommerce platforms with custom themes and integrations." },
  // AI Automation
  { _id: "sub-workflow-automation", _type: "serviceSubcategory", title: "Workflow Automation (n8n)", slug: { _type: "slug", current: "workflow-automation-n8n" }, category: { _type: "reference", _ref: "cat-ai-automation" }, order: 1, featured: true, description: "End-to-end workflow automation using n8n to connect your apps, eliminate manual tasks, and streamline operations." },
  { _id: "sub-process-optimization", _type: "serviceSubcategory", title: "Process Optimization", slug: { _type: "slug", current: "process-optimization" }, category: { _type: "reference", _ref: "cat-ai-automation" }, order: 2, featured: false, description: "In-depth business process analysis and optimization to remove bottlenecks, reduce costs, and improve throughput." },
  { _id: "sub-ai-chatbots", _type: "serviceSubcategory", title: "AI Chatbot Systems", slug: { _type: "slug", current: "ai-chatbot-systems" }, category: { _type: "reference", _ref: "cat-ai-automation" }, order: 3, featured: true, description: "Intelligent AI chatbots for customer support, lead generation, and internal operations powered by GPT and LLMs." },
  // Business Consultancy
  { _id: "sub-digital-strategy", _type: "serviceSubcategory", title: "Digital Strategy", slug: { _type: "slug", current: "digital-strategy" }, category: { _type: "reference", _ref: "cat-business-consultancy" }, order: 1, featured: true, description: "Comprehensive digital transformation roadmaps aligning technology investments with business objectives." },
  { _id: "sub-business-model", _type: "serviceSubcategory", title: "Business Model Structuring", slug: { _type: "slug", current: "business-model-structuring" }, category: { _type: "reference", _ref: "cat-business-consultancy" }, order: 2, featured: false, description: "Refining and structuring scalable business models that attract investors and drive sustainable competitive advantage." },
  { _id: "sub-revenue-growth", _type: "serviceSubcategory", title: "Revenue Growth Planning", slug: { _type: "slug", current: "revenue-growth-planning" }, category: { _type: "reference", _ref: "cat-business-consultancy" }, order: 3, featured: true, description: "Data-driven revenue strategies including pricing models, market expansion, and customer acquisition planning." },
];

// ─────────────────────────────────────────────────────────────
// STEP 3 — SERVICES (21 full documents)
// ─────────────────────────────────────────────────────────────
const services = [

  // ──────────── 1. Logo & Brand Identity Systems ────────────
  {
    _id: "svc-logo-brand-identity",
    _type: "service",
    title: "Logo & Brand Identity Systems",
    slug: { _type: "slug", current: "logo-brand-identity-systems" },
    shortDescription:
      "Stand out with a distinctive, memorable brand identity. We craft logo systems and visual identities that communicate your values, build trust, and create lasting impressions across every touchpoint.",
    fullDescription: [
      heading("What Is a Brand Identity System?"),
      block("A brand identity system is the complete visual language of your business — your logo, color palette, typography, iconography, and usage rules working together as a unified whole. It ensures your brand looks consistent and professional whether someone encounters you on a business card, a billboard, or a website."),
      heading("Our Logo & Brand Identity Process", 3),
      block("We begin with a deep-dive discovery session to understand your industry, target audience, competitors, and vision. Our designers then create multiple concept directions, refining the strongest one into a complete identity system with primary logo, secondary variations, favicon, color codes, and typography guidelines."),
      heading("Why Invest in a Professional Brand Identity?", 3),
      block("Studies show that consistent brand presentation increases revenue by up to 33%. A professionally designed identity builds instant credibility, makes marketing materials more effective, and creates an emotional connection with your customers that drives loyalty and repeat business."),
    ],
    category: { _type: "reference", _ref: "cat-creative-branding" },
    subcategory: { _type: "reference", _ref: "sub-logo-brand-identity" },
    features: [
      { _key: "f1", title: "Primary Logo Design", description: "Multiple original logo concepts with 2 rounds of revisions, delivered in vector (SVG, AI, EPS) and raster (PNG, JPG) formats." },
      { _key: "f2", title: "Logo Variations", description: "Full-color, monochrome, reversed/white, horizontal, stacked, and favicon versions for versatile use." },
      { _key: "f3", title: "Color Palette System", description: "Primary, secondary, and accent colors defined with HEX, RGB, CMYK, and Pantone codes for print and digital accuracy." },
      { _key: "f4", title: "Typography Selection", description: "Curated primary and secondary font pairing with hierarchy rules (headings, body, captions) and free/licensed alternatives." },
      { _key: "f5", title: "Brand Pattern & Iconography", description: "Supporting graphic elements, patterns, and a custom icon set that extend your visual language." },
      { _key: "f6", title: "Brand Usage Guidelines", description: "A 10–20 page brand guide documenting correct and incorrect usage, spacing rules, color misuse, and real-world application examples." },
    ],
    technologies: ["Adobe Illustrator", "Adobe Photoshop", "Figma", "After Effects"],
    deliverables: [
      "Source files (AI, EPS, SVG)", "PNG/JPG exports (all variations & sizes)", "Favicon (ICO, PNG 32x32, 192x192)",
      "Brand style guide PDF", "Color palette reference sheet", "Typography specimen sheet",
    ],
    timeline: "1–3 weeks",
    pricingType: "project",
    projectPricing: {
      startingPrice: 500,
      priceRangeLow: 500,
      priceRangeHigh: 3000,
      currency: "USD",
      baseIncludes: ["3 logo concepts", "2 revision rounds", "5 logo file formats", "Color palette", "Typography guide"],
      addons: [
        { _key: "a1", title: "Full brand guideline document", price: 300, description: "15–25 page comprehensive brand book" },
        { _key: "a2", title: "Stationery design (business card, letterhead, envelope)", price: 250, description: "Print-ready professional stationery set" },
        { _key: "a3", title: "Social media template pack", price: 200, description: "10 branded Canva/Figma templates" },
      ],
    },
    order: 1,
    featured: true,
    faq: [
      { _key: "q1", question: "Do I own all rights to the final logo?", answer: "Yes. Upon final payment, you receive 100% exclusive ownership of all logo concepts and brand assets delivered. We provide a copyright transfer document upon request." },
      { _key: "q2", question: "How many design concepts will I receive?", answer: "You'll receive 3 distinct initial concepts. After you select a direction, we refine it through 2 rounds of revisions to reach the final design." },
      { _key: "q3", question: "What if I already have a logo but want a redesign?", answer: "Absolutely — we offer brand refresh and evolution services where we modernize your existing identity while preserving brand equity. Contact us to discuss the scope." },
      { _key: "q4", question: "What file formats will I receive?", answer: "You'll get SVG, AI, EPS (vector), PNG with transparent background, JPG, and favicon ICO — all at multiple sizes and in every logo variation." },
    ],
    seo: {
      metaTitle: "Logo & Brand Identity Design Services | Kitchen of Tech",
      metaDescription: "Professional logo design and complete brand identity systems. Custom logos, color palettes, typography guides, and brand books that build trust and grow your business.",
      keywords: ["logo design", "brand identity", "brand guidelines", "visual identity", "logo designer", "brand design services", "corporate identity"],
    },
  },

  // ──────────── 2. Corporate Branding Guidelines ────────────
  {
    _id: "svc-corporate-branding",
    _type: "service",
    title: "Corporate Branding Guidelines",
    slug: { _type: "slug", current: "corporate-branding-guidelines" },
    shortDescription:
      "Ensure every piece of communication looks and feels unmistakably yours. Our comprehensive brand guideline documents give your entire team — and your agency partners — the rules to represent your brand consistently and confidently.",
    fullDescription: [
      heading("Why Your Business Needs a Brand Book"),
      block("Without documented guidelines, your brand slowly degrades. Different team members use different fonts, wrong colors, outdated logos. A professional brand book eliminates inconsistency and gives everyone — from your social media manager to your print vendor — a single source of truth."),
      heading("What We Cover in a Corporate Brand Book", 3),
      block("Our brand books are thorough, visually rich documents that cover brand story and values, logo system rules, color usage, typography hierarchy, photography and illustration style, tone of voice, social media guidelines, and real-world application mockups."),
    ],
    category: { _type: "reference", _ref: "cat-creative-branding" },
    subcategory: { _type: "reference", _ref: "sub-corporate-branding" },
    features: [
      { _key: "f1", title: "Brand Story & Values Documentation", description: "Mission, vision, brand personality, and positioning statement articulated clearly." },
      { _key: "f2", title: "Complete Logo System Rules", description: "Do's and don'ts, minimum sizes, exclusion zones, and background usage rules." },
      { _key: "f3", title: "Color Usage System", description: "Primary, secondary, neutral, and semantic color usage across all media." },
      { _key: "f4", title: "Typography Hierarchy", description: "H1–H6, body, caption, and UI text specifications with web and print alternatives." },
      { _key: "f5", title: "Imagery & Photography Style", description: "Visual tone, subject matter guidelines, filters, and composition rules." },
      { _key: "f6", title: "Digital & Print Application Examples", description: "Real mockups showing your brand on business cards, social media, websites, presentations, and signage." },
    ],
    technologies: ["Adobe InDesign", "Figma", "Adobe Illustrator", "Notion (digital brand hub option)"],
    deliverables: ["20–50 page brand guidelines PDF", "Editable source file (InDesign/Figma)", "Brand asset folder (logos, colors, fonts)"],
    timeline: "2–4 weeks",
    pricingType: "project",
    projectPricing: {
      startingPrice: 800,
      priceRangeLow: 800,
      priceRangeHigh: 4000,
      currency: "USD",
      baseIncludes: ["20-page brand book", "Logo rules", "Color system", "Typography guide", "Digital application examples"],
    },
    order: 2,
    featured: false,
    faq: [
      { _key: "q1", question: "Can you create a brand book from an existing logo?", answer: "Yes. We analyze your current brand assets and build a comprehensive guideline document around them, even if the original designer provided no documentation." },
      { _key: "q2", question: "Do you offer a digital/interactive brand portal?", answer: "Yes — we offer a Notion-based or custom web portal option where all brand assets and guidelines are hosted online for instant team access. Ask about this add-on." },
    ],
    seo: {
      metaTitle: "Corporate Brand Guidelines & Brand Book Services | Kitchen of Tech",
      metaDescription: "Professional brand guideline documents and corporate identity systems that ensure visual consistency across all channels and communications.",
      keywords: ["brand guidelines", "brand book", "corporate identity", "brand standards", "style guide", "brand manual"],
    },
  },

  // ──────────── 3. Packaging & Print Design ────────────
  {
    _id: "svc-packaging-print",
    _type: "service",
    title: "Packaging & Print Design",
    slug: { _type: "slug", current: "packaging-print-design" },
    shortDescription:
      "First impressions matter — especially on shelves and in hands. We design packaging and print materials that command attention, communicate quality, and convert browsers into buyers.",
    fullDescription: [
      heading("The Power of Great Packaging Design"),
      block("72% of consumers say packaging design influences their purchasing decision. Whether it's a product box, a label, or a brochure, professional print design turns your physical touchpoints into powerful brand ambassadors. We design for both aesthetic impact and print-production accuracy."),
      heading("Our Print Design Capabilities", 3),
      block("From product packaging with structural dielines to business stationery, brochures, flyers, posters, banners, and event materials — we handle the full spectrum of print design. Every file is prepared to professional print-ready standards (CMYK, bleed, crop marks, correct DPI)."),
    ],
    category: { _type: "reference", _ref: "cat-creative-branding" },
    subcategory: { _type: "reference", _ref: "sub-packaging-print" },
    features: [
      { _key: "f1", title: "Product Packaging Design", description: "Box dielines, labels, pouches, and custom packaging structures with print-ready artwork." },
      { _key: "f2", title: "Business Stationery", description: "Business cards, letterheads, envelopes, and notepads aligned to brand guidelines." },
      { _key: "f3", title: "Marketing Collateral", description: "Brochures, catalogues, flyers, posters, and banners that drive awareness and action." },
      { _key: "f4", title: "Print-Ready File Preparation", description: "CMYK color mode, 3mm bleed, correct DPI (300+), and printer-specific technical specifications." },
    ],
    technologies: ["Adobe Illustrator", "Adobe InDesign", "Adobe Photoshop", "Dieline software"],
    deliverables: ["Print-ready PDF files", "Source files (AI/INDD)", "Digital preview mockups", "Printer specification sheet"],
    timeline: "1–3 weeks",
    pricingType: "project",
    projectPricing: { startingPrice: 300, priceRangeLow: 300, priceRangeHigh: 2500, currency: "USD", baseIncludes: ["1 design concept", "2 revision rounds", "Print-ready files"] },
    order: 3,
    featured: false,
    faq: [
      { _key: "q1", question: "Can you coordinate with our printer?", answer: "Yes. We liaise directly with your printer or recommend trusted print partners to ensure colour accuracy and structural integrity of packaging." },
      { _key: "q2", question: "Do you design dieline structures from scratch?", answer: "Yes. We can design custom packaging structures or adapt standard dielines to your product dimensions and brand." },
    ],
    seo: {
      metaTitle: "Packaging & Print Design Services | Kitchen of Tech",
      metaDescription: "Professional product packaging, business stationery, and marketing collateral design. Print-ready files that make your brand shine on shelves and in hands.",
      keywords: ["packaging design", "print design", "product label design", "brochure design", "print collateral", "business card design"],
    },
  },

  // ──────────── 4. UI/UX Interface Design ────────────
  {
    _id: "svc-ui-ux-design",
    _type: "service",
    title: "UI/UX Interface Design",
    slug: { _type: "slug", current: "ui-ux-interface-design" },
    shortDescription:
      "Great products are built on great experiences. We design intuitive, beautiful interfaces for web and mobile applications that delight users, reduce churn, and drive conversions — backed by UX research and data.",
    fullDescription: [
      heading("Design That Puts Users First"),
      block("UI/UX design is the bridge between your product's functionality and your user's goals. Poor UX costs businesses billions annually through abandoned carts, support tickets, and lost customers. We apply a user-centered design process — research, wireframing, prototyping, and testing — to create digital products that are both beautiful and effortlessly usable."),
      heading("Our UI/UX Design Process", 3),
      block("We start with user research (personas, journey maps, competitor analysis), move to information architecture and low-fidelity wireframes, then develop high-fidelity pixel-perfect designs in Figma with interactive prototypes. Every design decision is grounded in usability principles and conversion optimization."),
    ],
    category: { _type: "reference", _ref: "cat-creative-branding" },
    subcategory: { _type: "reference", _ref: "sub-ui-ux-design" },
    features: [
      { _key: "f1", title: "UX Research & Strategy", description: "User personas, journey mapping, competitive analysis, and usability audits to inform design decisions." },
      { _key: "f2", title: "Information Architecture", description: "Sitemap, user flow diagrams, and content hierarchy designed to minimize cognitive load." },
      { _key: "f3", title: "Wireframing & Prototyping", description: "Low-fidelity sketches to high-fidelity interactive Figma prototypes for testing before development." },
      { _key: "f4", title: "Visual Interface Design", description: "Pixel-perfect, responsive UI designs with a comprehensive design system (components, tokens, variants)." },
      { _key: "f5", title: "Design System Creation", description: "Reusable component library in Figma with atoms, molecules, organisms, and interaction states." },
      { _key: "f6", title: "Developer Handoff", description: "Annotated Figma files with spacing, typography, and interaction notes for seamless developer implementation." },
    ],
    technologies: ["Figma", "FigJam", "Maze (user testing)", "Hotjar", "Adobe XD"],
    deliverables: ["User research report", "Wireframes (all screens)", "High-fidelity designs", "Interactive prototype", "Design system / component library", "Developer handoff file"],
    timeline: "2–8 weeks",
    pricingType: "project",
    projectPricing: { startingPrice: 1500, priceRangeLow: 1500, priceRangeHigh: 15000, currency: "USD", baseIncludes: ["UX audit", "Wireframes", "High-fidelity UI", "Prototype", "Developer handoff"] },
    order: 4,
    featured: true,
    faq: [
      { _key: "q1", question: "Do you work with existing development teams?", answer: "Absolutely. We deliver developer-ready Figma files with clear annotations, a design system, and are available for handoff calls to ensure pixel-perfect implementation." },
      { _key: "q2", question: "Do you do usability testing?", answer: "Yes. We offer user testing sessions using Maze or Hotjar heatmaps to validate designs before and after launch, ensuring measurable UX improvements." },
      { _key: "q3", question: "Can you redesign an existing app or website?", answer: "Yes — UX audits and redesigns are a core part of our service. We identify pain points, benchmark against competitors, and deliver a modernized design." },
    ],
    seo: {
      metaTitle: "UI/UX Design Services | Kitchen of Tech",
      metaDescription: "Professional UI/UX design for web and mobile apps. User research, wireframing, Figma prototypes, and design systems that improve conversions and user satisfaction.",
      keywords: ["UI UX design", "user interface design", "UX research", "Figma design", "app design", "web design", "design system", "product design"],
    },
  },

  // ──────────── 5. Corporate Video Editing ────────────
  {
    _id: "svc-corporate-video",
    _type: "service",
    title: "Corporate Video Editing",
    slug: { _type: "slug", current: "corporate-video-editing" },
    shortDescription:
      "Turn raw footage into polished, professional corporate videos. From company culture films to product demos and event recaps, we deliver broadcast-quality edits with colour grading, sound design, and branded motion graphics.",
    fullDescription: [
      heading("Why Corporate Video Drives Business Results"),
      block("Video content generates 66% more qualified leads per year and increases brand recall by 95% compared to text. A professionally edited corporate video positions your brand as credible, modern, and trustworthy — whether it's on your homepage, a pitch deck, or a trade show screen."),
      heading("Our Video Editing Workflow", 3),
      block("We accept footage from any camera or phone. Our editors cut a structured story from your raw footage, apply professional colour grading, add licensed background music and sound effects, incorporate lower-third titles and branded motion graphics, and deliver the final video in all required formats and aspect ratios."),
    ],
    category: { _type: "reference", _ref: "cat-video-motion" },
    subcategory: { _type: "reference", _ref: "sub-corporate-video" },
    features: [
      { _key: "f1", title: "Professional Video Editing", description: "Multi-track timeline editing with J & L cuts, B-roll integration, and narrative pacing." },
      { _key: "f2", title: "Color Grading & Correction", description: "LUTs, exposure correction, and colour science that make your footage look cinematic and consistent." },
      { _key: "f3", title: "Sound Design & Music", description: "Audio leveling, noise removal, licensed background music, and SFX integration." },
      { _key: "f4", title: "Branded Motion Graphics", description: "Custom animated lower thirds, intro/outro, logo reveals, and transitions aligned to your brand." },
      { _key: "f5", title: "Multi-Format Export", description: "Delivery in 4K/1080p for broadcast, web-optimized H.264/H.265, and platform-specific versions." },
      { _key: "f6", title: "Subtitle & Caption Files", description: "Closed captions and SRT files for accessibility and social media auto-play performance." },
    ],
    technologies: ["Adobe Premiere Pro", "DaVinci Resolve", "After Effects", "Audition"],
    deliverables: ["Edited master video file", "Web-optimized export", "Social media cuts (16:9, 9:16, 1:1)", "SRT subtitle file", "Thumbnail designs"],
    timeline: "3–7 business days per video",
    pricingType: "project",
    projectPricing: { startingPrice: 300, priceRangeLow: 300, priceRangeHigh: 3000, currency: "USD", baseIncludes: ["Full edit", "Color grade", "Sound mix", "1 round revisions", "2 export formats"] },
    order: 5,
    featured: true,
    faq: [
      { _key: "q1", question: "What video formats do you accept?", answer: "We accept footage from any device — DSLRs, mirrorless cameras, GoPros, drones, and smartphones. All common formats: MP4, MOV, MXF, R3D, ProRes." },
      { _key: "q2", question: "Can you add subtitles in multiple languages?", answer: "Yes. We offer multilingual subtitle creation and embed options. Pricing depends on number of languages and video length." },
    ],
    seo: {
      metaTitle: "Corporate Video Editing Services | Kitchen of Tech",
      metaDescription: "Professional corporate video editing with color grading, motion graphics, and sound design. Broadcast-quality videos that build brand credibility and drive engagement.",
      keywords: ["corporate video editing", "video production", "video editor", "brand video", "color grading", "motion graphics video"],
    },
  },

  // ──────────── 6. Social Media Reels ────────────
  {
    _id: "svc-social-reels",
    _type: "service",
    title: "Social Media Reels & Short-Form Content",
    slug: { _type: "slug", current: "social-media-reels" },
    shortDescription:
      "Go viral with scroll-stopping short-form video content. We produce and edit high-energy reels, TikToks, and YouTube Shorts engineered for maximum reach, saves, and shares — turning your brand into a content powerhouse.",
    fullDescription: [
      heading("Short-Form Video: The Fastest Growing Content Format"),
      block("Instagram Reels, TikTok, and YouTube Shorts collectively generate over 1 trillion views per month. Short-form video has 2.5x the engagement rate of long-form content and is the #1 format recommended by platform algorithms. Brands that embrace it see explosive organic growth."),
      heading("What Makes Our Reels Different", 3),
      block("We don't just cut clips together. We apply trend research, hook engineering (the first 3 seconds make or break a reel), strategic caption and hashtag optimization, and platform-native editing techniques — jump cuts, transitions, text overlays, trending audio — to maximize each video's organic reach."),
    ],
    category: { _type: "reference", _ref: "cat-video-motion" },
    subcategory: { _type: "reference", _ref: "sub-social-reels" },
    features: [
      { _key: "f1", title: "Hook Engineering", description: "Data-driven 3-second hooks designed to stop the scroll and drive view-through rates above 50%." },
      { _key: "f2", title: "Trend Research & Audio Selection", description: "Weekly trend analysis to align your content with viral audio, effects, and formats." },
      { _key: "f3", title: "Animated Text & Captions", description: "Dynamic on-screen text, auto-captions, and animated subtitles that boost retention and accessibility." },
      { _key: "f4", title: "Platform-Native Optimization", description: "Separate edits optimized for Instagram (9:16), TikTok, YouTube Shorts, and Facebook Reels." },
      { _key: "f5", title: "Thumbnail & Cover Frame", description: "Branded thumbnail and loop-friendly cover frames that attract profile visitors." },
    ],
    technologies: ["Adobe Premiere Pro", "CapCut Pro", "After Effects", "Canva"],
    deliverables: ["Edited reel video (9:16 MP4)", "Square version (1:1)", "Caption & hashtag strategy", "Thumbnail graphic"],
    timeline: "2–3 business days per reel",
    pricingType: "subscription",
    subscriptionTiers: [
      { _key: "t1", name: "Starter", price: 400, currency: "USD", billingPeriod: "month", popular: false, features: ["4 reels/month", "Basic text overlays", "1 round revisions", "Standard captions"] },
      { _key: "t2", name: "Growth", price: 800, currency: "USD", billingPeriod: "month", popular: true, features: ["10 reels/month", "Custom animations", "2 rounds revisions", "Hashtag strategy", "Thumbnail design", "Trending audio research"] },
      { _key: "t3", name: "Scale", price: 1500, currency: "USD", billingPeriod: "month", popular: false, features: ["20 reels/month", "Full motion graphics", "Unlimited revisions", "Content calendar", "Analytics report", "Dedicated editor"] },
    ],
    order: 6,
    featured: true,
    faq: [
      { _key: "q1", question: "Do I need to provide footage?", answer: "You can provide footage or we can work with stock footage, screen recordings, and existing brand assets. We also partner with videographers if you need shooting services." },
      { _key: "q2", question: "How do you handle posting schedules?", answer: "Our Growth and Scale plans include a content calendar with optimal posting times. We can also manage direct publishing to your accounts if required." },
    ],
    seo: {
      metaTitle: "Social Media Reels & Short-Form Video Services | Kitchen of Tech",
      metaDescription: "Scroll-stopping Instagram Reels, TikTok, and YouTube Shorts production. Platform-optimized short-form video content that grows your audience and drives engagement.",
      keywords: ["social media reels", "instagram reels", "tiktok video", "youtube shorts", "short form video", "social media video editing", "viral content"],
    },
  },

  // ──────────── 7. Motion Graphics ────────────
  {
    _id: "svc-motion-graphics",
    _type: "service",
    title: "Motion Graphics & Animation",
    slug: { _type: "slug", current: "motion-graphics-animation" },
    shortDescription:
      "Bring your brand to life with fluid, eye-catching motion graphics. From animated logos to full-screen kinetic typography and data visualization, we create motion content that informs, engages, and impresses.",
    fullDescription: [
      heading("Why Motion Graphics Elevate Your Brand"),
      block("Static content blends into the background. Motion naturally draws the eye and holds attention 2x longer. Animated graphics are the backbone of modern brand communications — from website hero sections and app loading screens to trade show displays and digital advertising."),
    ],
    category: { _type: "reference", _ref: "cat-video-motion" },
    subcategory: { _type: "reference", _ref: "sub-motion-graphics" },
    features: [
      { _key: "f1", title: "Logo Animation", description: "Smooth logo reveal animations in 2–5 styles for video intros, loading screens, and email signatures." },
      { _key: "f2", title: "Kinetic Typography", description: "Text-driven animated sequences for quotes, stats, announcements, and lower thirds." },
      { _key: "f3", title: "Infographic Animation", description: "Animated charts, data visualizations, and process flows that simplify complex information." },
      { _key: "f4", title: "UI/App Animation", description: "Micro-interactions, screen transitions, and onboarding animations for web and mobile apps." },
      { _key: "f5", title: "Social Media Motion Templates", description: "Editable After Effects or Canva templates for in-house team use." },
    ],
    technologies: ["Adobe After Effects", "Lottie / LottieFiles", "Adobe Illustrator", "Cinema 4D", "Premiere Pro"],
    deliverables: ["MP4 / MOV master files", "Lottie JSON (for web/app)", "GIF versions", "Source project file (AE)", "Exported at 1080p & 4K"],
    timeline: "3–10 business days",
    pricingType: "project",
    projectPricing: { startingPrice: 250, priceRangeLow: 250, priceRangeHigh: 5000, currency: "USD", baseIncludes: ["1 motion piece", "1 revision round", "MP4 + GIF export"] },
    order: 7,
    featured: false,
    faq: [
      { _key: "q1", question: "Can you create Lottie animations for my website?", answer: "Yes. We design and export Lottie JSON animations that are lightweight, scalable, and perfect for web and mobile app use." },
    ],
    seo: {
      metaTitle: "Motion Graphics & Animation Services | Kitchen of Tech",
      metaDescription: "Professional motion graphics, animated logos, kinetic typography, and Lottie animations that bring your brand to life on screen.",
      keywords: ["motion graphics", "animation services", "logo animation", "after effects", "lottie animation", "kinetic typography", "animated video"],
    },
  },

  // ──────────── 8. Explainer Videos ────────────
  {
    _id: "svc-explainer-videos",
    _type: "service",
    title: "Explainer Videos",
    slug: { _type: "slug", current: "explainer-videos" },
    shortDescription:
      "Communicate your product, service, or idea in 60–120 seconds with a compelling explainer video. We handle scripting, storyboarding, animation, and voiceover — delivering a video that educates, converts, and sells for you 24/7.",
    fullDescription: [
      heading("The ROI of a Great Explainer Video"),
      block("Companies with explainer videos on their homepage see conversion rates increase by 20–80%. A well-crafted 90-second explainer replaces a sales call, simplifies a complex value proposition, and builds trust instantly. It's the most cost-effective sales tool a business can own."),
    ],
    category: { _type: "reference", _ref: "cat-video-motion" },
    subcategory: { _type: "reference", _ref: "sub-explainer-videos" },
    features: [
      { _key: "f1", title: "Script Writing", description: "Conversion-focused script written to your audience's pain points and your product's unique value proposition." },
      { _key: "f2", title: "Storyboard & Visual Style", description: "Scene-by-scene visual planning with character, color, and illustration style definition." },
      { _key: "f3", title: "Professional Voiceover", description: "Native speaker VO recording in your preferred language, tone, and gender." },
      { _key: "f4", title: "2D Animated Production", description: "Full character animation, scene transitions, and lip-sync synchronized to voiceover." },
      { _key: "f5", title: "Background Music & SFX", description: "Licensed music and sound design that match your brand's emotional tone." },
    ],
    technologies: ["Adobe After Effects", "Adobe Illustrator", "Character Animator", "Audition", "Vyond"],
    deliverables: ["Final video (MP4 1080p/4K)", "Web-optimized version", "Raw audio file", "Social media cut (60s)", "Thumbnail graphic"],
    timeline: "2–4 weeks",
    pricingType: "project",
    projectPricing: { startingPrice: 1200, priceRangeLow: 1200, priceRangeHigh: 8000, currency: "USD", baseIncludes: ["Script (up to 150 words)", "Storyboard", "Full 2D animation", "Voiceover", "Music", "1 revision round"] },
    order: 8,
    featured: false,
    faq: [
      { _key: "q1", question: "What length explainer video do I need?", answer: "For homepage and landing pages, 60–90 seconds is optimal. For product demos or onboarding, 90–180 seconds works better. We help you determine the ideal length during the scripting phase." },
      { _key: "q2", question: "Can I provide my own voiceover?", answer: "Yes — you can provide a recorded voiceover or hire your own VO artist. We'll provide the script and sync the animation to your audio." },
    ],
    seo: {
      metaTitle: "Explainer Video Production Services | Kitchen of Tech",
      metaDescription: "Professional 2D animated explainer videos with script writing, voiceover, and animation. Convert more website visitors with a compelling 60–90 second explainer.",
      keywords: ["explainer video", "animated video production", "product explainer", "2D animation", "explainer video company", "startup explainer video"],
    },
  },

  // ──────────── 9. Meta Advertising ────────────
  {
    _id: "svc-meta-advertising",
    _type: "service",
    title: "Meta Advertising (Facebook & Instagram Ads)",
    slug: { _type: "slug", current: "meta-advertising" },
    shortDescription:
      "Reach your ideal customers with precision. Our Meta Ads experts build and manage data-driven Facebook and Instagram advertising campaigns that generate qualified leads, drive sales, and maximize your return on ad spend.",
    fullDescription: [
      heading("Why Meta Advertising Delivers Unmatched ROI"),
      block("With 3.29 billion monthly active users across Facebook and Instagram, Meta's advertising platform offers the most powerful audience targeting in digital marketing. Advanced interest, behavioral, demographic, and lookalike targeting means your ads reach exactly the right people — not everyone. Our team uses proven campaign structures (TOFU/MOFU/BOFU funnels), creative testing methodologies, and conversion optimization to consistently deliver 3–8x ROAS for our clients."),
      heading("Our Meta Ads Management Process", 3),
      block("We start with audience research and competitor analysis, build your campaign architecture from scratch, create or advise on ad creatives, set up pixel tracking and conversion events, then manage ongoing optimization — scaling what works, cutting what doesn't, and providing transparent monthly reports."),
    ],
    category: { _type: "reference", _ref: "cat-digital-marketing" },
    subcategory: { _type: "reference", _ref: "sub-meta-advertising" },
    features: [
      { _key: "f1", title: "Audience Research & Targeting Strategy", description: "Interest, behavioral, demographic, custom audience, and lookalike audience strategy built from your customer data." },
      { _key: "f2", title: "Campaign Architecture (TOFU/MOFU/BOFU)", description: "Full-funnel campaign structure targeting cold, warm, and hot audiences with relevant messaging at each stage." },
      { _key: "f3", title: "Ad Creative Consultation", description: "Creative brief, copy writing for all ad variations, and hooks optimized for each placement type." },
      { _key: "f4", title: "Meta Pixel & Conversion API Setup", description: "Server-side tracking implementation for accurate attribution in a post-iOS14 world." },
      { _key: "f5", title: "A/B Testing & Creative Rotation", description: "Systematic testing of audiences, creatives, copy, and offers to continuously improve CPA." },
      { _key: "f6", title: "Monthly Performance Reporting", description: "Transparent reports covering spend, impressions, CPM, CTR, CPC, CPL, ROAS, and recommendations." },
    ],
    technologies: ["Meta Business Suite", "Meta Ads Manager", "Meta Pixel", "Conversions API", "Google Analytics 4", "Power BI"],
    deliverables: ["Campaign setup & launch", "Monthly performance reports", "Ad copy & creative briefs", "Pixel & CAPI setup", "Monthly strategy calls"],
    timeline: "Ongoing (minimum 3 months recommended)",
    pricingType: "subscription",
    subscriptionTiers: [
      { _key: "t1", name: "Launch", price: 600, currency: "USD", billingPeriod: "month", popular: false, features: ["Up to $3K ad spend", "1 campaign", "3 ad sets", "Bi-weekly reporting", "Pixel setup"] },
      { _key: "t2", name: "Growth", price: 1200, currency: "USD", billingPeriod: "month", popular: true, features: ["Up to $10K ad spend", "3 campaigns", "Full-funnel strategy", "Weekly reporting", "Creative briefs", "A/B testing", "CAPI setup"] },
      { _key: "t3", name: "Scale", price: 2500, currency: "USD", billingPeriod: "month", popular: false, features: ["Unlimited ad spend", "Unlimited campaigns", "Dedicated strategist", "Daily monitoring", "Custom dashboard", "Monthly strategy call", "Catalog ads"] },
    ],
    order: 9,
    featured: true,
    faq: [
      { _key: "q1", question: "What ad budget do I need to get started?", answer: "We recommend a minimum of $1,000/month in ad spend to generate statistically significant data for optimization. Most successful campaigns run $3,000–$10,000/month." },
      { _key: "q2", question: "How long before I see results?", answer: "Most campaigns enter a learning phase in the first 2–4 weeks. Significant results and optimization typically materialize within 6–10 weeks. We always set realistic expectations." },
      { _key: "q3", question: "Do I retain ownership of the ad account?", answer: "Always. We work inside your own Business Manager and Ad Account. You retain 100% ownership of all data, audiences, and campaign history." },
    ],
    seo: {
      metaTitle: "Meta Ads Management (Facebook & Instagram) | Kitchen of Tech",
      metaDescription: "Expert Facebook and Instagram advertising management. Full-funnel campaigns, audience targeting, creative strategy, and conversion tracking that maximize your ROAS.",
      keywords: ["meta ads", "facebook advertising", "instagram ads", "facebook ad management", "meta advertising agency", "ROAS optimization", "social media advertising"],
    },
  },

  // ──────────── 10. Google Advertising ────────────
  {
    _id: "svc-google-advertising",
    _type: "service",
    title: "Google Advertising (Search, Display & YouTube Ads)",
    slug: { _type: "slug", current: "google-advertising" },
    shortDescription:
      "Dominate Google Search results and reach customers at the exact moment they're looking for your product or service. Our certified Google Ads specialists build and manage campaigns that lower your cost-per-lead and drive profitable growth.",
    fullDescription: [
      heading("Google Ads: Intent-Based Marketing at Scale"),
      block("Unlike social advertising where you interrupt users, Google Search Ads reach people actively searching for exactly what you offer. With 8.5 billion searches per day, Google Ads is the fastest way to put your business in front of high-intent buyers. When managed expertly, Google Ads delivers a $2 return for every $1 spent on average — and significantly more for optimized campaigns."),
      heading("Campaign Types We Manage", 3),
      block("Search campaigns for high-intent keywords, Display campaigns for brand awareness and retargeting, Shopping campaigns for ecommerce, YouTube video ads for brand reach, and Performance Max campaigns that use Google's AI to maximize conversions across all channels simultaneously."),
    ],
    category: { _type: "reference", _ref: "cat-digital-marketing" },
    subcategory: { _type: "reference", _ref: "sub-google-advertising" },
    features: [
      { _key: "f1", title: "Keyword Research & Match Type Strategy", description: "In-depth keyword discovery, negative keyword lists, and match type strategy to capture qualified traffic while eliminating waste." },
      { _key: "f2", title: "Ad Copy Writing & Testing", description: "Multiple RSA ad variations with emotional triggers, USPs, and strong CTAs, tested systematically for highest CTR and Quality Score." },
      { _key: "f3", title: "Landing Page Recommendations", description: "Conversion rate optimization recommendations for your landing pages to ensure your ad spend converts." },
      { _key: "f4", title: "Google Tag Manager & Conversion Tracking", description: "GTM setup, Google Ads conversion tags, and cross-channel attribution configuration." },
      { _key: "f5", title: "Bid Strategy Management", description: "Smart bidding strategies (Target CPA, Target ROAS, Maximize Conversions) monitored and adjusted weekly." },
      { _key: "f6", title: "Remarketing Campaigns", description: "Audience list building and remarketing campaigns to re-engage website visitors who didn't convert." },
    ],
    technologies: ["Google Ads", "Google Tag Manager", "Google Analytics 4", "Google Merchant Center", "Google Data Studio (Looker)"],
    deliverables: ["Campaign setup & launch", "Conversion tracking setup", "Monthly performance reports", "Keyword & negative keyword lists", "Monthly strategy review"],
    timeline: "Ongoing (minimum 3 months)",
    pricingType: "subscription",
    subscriptionTiers: [
      { _key: "t1", name: "Starter", price: 500, currency: "USD", billingPeriod: "month", popular: false, features: ["Up to $3K ad spend", "Search campaigns only", "Keyword research", "Bi-weekly reporting"] },
      { _key: "t2", name: "Professional", price: 1000, currency: "USD", billingPeriod: "month", popular: true, features: ["Up to $10K ad spend", "Search + Display + Remarketing", "Landing page audit", "Weekly reporting", "Conversion optimization", "GTM setup"] },
      { _key: "t3", name: "Enterprise", price: 2000, currency: "USD", billingPeriod: "month", popular: false, features: ["Unlimited spend", "All campaign types", "Shopping/PMax campaigns", "Custom dashboards", "Dedicated account manager"] },
    ],
    order: 10,
    featured: true,
    faq: [
      { _key: "q1", question: "How is your management fee structured?", answer: "We charge a flat monthly management fee (shown above) regardless of your ad spend, so your service cost is predictable and we're always incentivized to maximize your results." },
      { _key: "q2", question: "Can you take over an existing Google Ads account?", answer: "Yes. We perform a thorough audit of your existing account, identify wasted spend, and restructure campaigns for better performance before making any changes." },
    ],
    seo: {
      metaTitle: "Google Ads Management Services | Kitchen of Tech",
      metaDescription: "Expert Google Ads management including Search, Display, Shopping, and YouTube campaigns. Data-driven strategies that lower CPA and maximize your ad spend ROI.",
      keywords: ["google ads management", "google advertising", "ppc management", "search ads", "google ads agency", "pay per click", "google shopping ads"],
    },
  },

  // ──────────── 11. SEO Optimization ────────────
  {
    _id: "svc-seo-optimization",
    _type: "service",
    title: "SEO Optimization",
    slug: { _type: "slug", current: "seo-optimization" },
    shortDescription:
      "Rank higher, get found by more customers, and reduce your dependence on paid ads. Our data-driven SEO strategies combine technical optimization, compelling content, and authoritative link building to deliver sustainable first-page Google rankings.",
    fullDescription: [
      heading("SEO: Your Most Valuable Long-Term Marketing Asset"),
      block("93% of all online experiences begin with a search engine. Organic search drives 51% of all website traffic — and unlike paid ads, the traffic you earn through SEO doesn't stop when you turn off the budget. A well-executed SEO strategy compounds over time, delivering exponentially greater returns as your domain authority grows."),
      heading("Our Holistic SEO Approach", 3),
      block("We take a three-pillar approach to SEO: Technical (site speed, Core Web Vitals, crawlability, structured data), On-Page (keyword optimization, content strategy, internal linking), and Off-Page (white-hat link building, digital PR, local citations). All three pillars must be strong for lasting first-page rankings."),
    ],
    category: { _type: "reference", _ref: "cat-digital-marketing" },
    subcategory: { _type: "reference", _ref: "sub-seo-optimization" },
    features: [
      { _key: "f1", title: "Technical SEO Audit & Fixes", description: "Crawl error resolution, site speed optimization, Core Web Vitals, mobile usability, structured data (schema.org), and XML sitemap." },
      { _key: "f2", title: "Keyword Research & Strategy", description: "In-depth keyword mapping, search intent analysis, topic cluster strategy, and competitor gap analysis." },
      { _key: "f3", title: "On-Page Optimization", description: "Title tags, meta descriptions, heading structure, content optimization, and internal linking architecture." },
      { _key: "f4", title: "Content Strategy & Creation", description: "SEO-optimized blog content, landing pages, and pillar pages that rank for target keywords and drive conversions." },
      { _key: "f5", title: "Link Building", description: "White-hat outreach, guest posting, digital PR, and resource page link acquisition from relevant, high-authority websites." },
      { _key: "f6", title: "Local SEO", description: "Google Business Profile optimization, local citation building, and location-specific keyword targeting." },
    ],
    technologies: ["Ahrefs", "SEMrush", "Google Search Console", "Screaming Frog", "Google Analytics 4", "PageSpeed Insights"],
    deliverables: ["SEO audit report", "Keyword strategy document", "Monthly ranking reports", "Optimized content", "Technical fixes log", "Backlink profile report"],
    timeline: "Ongoing (first results in 3–6 months)",
    pricingType: "subscription",
    subscriptionTiers: [
      { _key: "t1", name: "Local SEO", price: 500, currency: "USD", billingPeriod: "month", popular: false, features: ["Local keyword targeting", "GBP optimization", "5 on-page optimizations/mo", "Monthly reporting", "Technical audit"] },
      { _key: "t2", name: "Growth SEO", price: 1200, currency: "USD", billingPeriod: "month", popular: true, features: ["30 target keywords", "Technical SEO", "2 blog posts/mo", "Link building (5/mo)", "Weekly reporting", "Content calendar"] },
      { _key: "t3", name: "Authority SEO", price: 2500, currency: "USD", billingPeriod: "month", popular: false, features: ["100+ target keywords", "Full technical optimization", "8 blog posts/mo", "Link building (20/mo)", "Custom dashboard", "Dedicated strategist"] },
    ],
    order: 11,
    featured: true,
    faq: [
      { _key: "q1", question: "How long does SEO take to show results?", answer: "Technical fixes and on-page optimizations show movement within 1–3 months. Significant ranking improvements for competitive keywords typically take 4–8 months. SEO is a long-term investment, not a quick fix." },
      { _key: "q2", question: "Do you guarantee first-page rankings?", answer: "No reputable SEO agency can guarantee specific rankings — search algorithms are complex and competitive. We guarantee industry best practices, transparent reporting, and measurable traffic growth over time." },
    ],
    seo: {
      metaTitle: "SEO Optimization Services | Kitchen of Tech",
      metaDescription: "Data-driven SEO services including technical audits, keyword strategy, content creation, and link building. Sustainable first-page Google rankings that drive organic traffic.",
      keywords: ["SEO services", "search engine optimization", "SEO agency", "technical SEO", "local SEO", "link building", "organic traffic", "keyword ranking"],
    },
  },

  // ──────────── 12. Analytics & Conversion Tracking ────────────
  {
    _id: "svc-analytics-conversion",
    _type: "service",
    title: "Analytics & Conversion Tracking",
    slug: { _type: "slug", current: "analytics-conversion-tracking" },
    shortDescription:
      "Stop making marketing decisions based on guesswork. We implement precise analytics and conversion tracking infrastructure — GA4, GTM, Meta CAPI, and custom dashboards — so you know exactly what's driving revenue and what isn't.",
    fullDescription: [
      heading("Why Accurate Tracking Is Your Most Critical Marketing Asset"),
      block("You can't optimize what you can't measure. Most businesses make critical marketing decisions — where to spend their budget, which channels to invest in — with broken or incomplete data. Our analytics implementations give you a single, accurate source of truth across all channels."),
    ],
    category: { _type: "reference", _ref: "cat-digital-marketing" },
    subcategory: { _type: "reference", _ref: "sub-analytics-conversion" },
    features: [
      { _key: "f1", title: "GA4 Implementation & Configuration", description: "Full GA4 setup with enhanced measurement, custom dimensions, and e-commerce tracking." },
      { _key: "f2", title: "Google Tag Manager Setup", description: "GTM container setup, trigger/tag configuration, and data layer implementation for clean, scalable tracking." },
      { _key: "f3", title: "Conversion Event Mapping", description: "Identification and implementation of all key conversion events: purchases, form submissions, calls, downloads." },
      { _key: "f4", title: "Meta Pixel & Conversions API", description: "Browser pixel and server-side CAPI setup for accurate Meta attribution in a post-iOS14 environment." },
      { _key: "f5", title: "Custom Analytics Dashboard", description: "Looker Studio or Power BI dashboard aggregating all marketing channel data in one view." },
      { _key: "f6", title: "Funnel & Behaviour Analysis", description: "User journey analysis, funnel drop-off identification, and heatmap interpretation (Hotjar/Microsoft Clarity)." },
    ],
    technologies: ["Google Analytics 4", "Google Tag Manager", "Meta Pixel + CAPI", "Looker Studio", "Hotjar", "Microsoft Clarity", "Power BI"],
    deliverables: ["Analytics audit report", "GA4 + GTM configuration", "Tracking implementation", "Custom dashboard", "Data validation report"],
    timeline: "1–3 weeks for setup",
    pricingType: "project",
    projectPricing: { startingPrice: 800, priceRangeLow: 800, priceRangeHigh: 5000, currency: "USD", baseIncludes: ["GA4 setup", "GTM configuration", "Conversion tracking", "Basic dashboard"] },
    order: 12,
    featured: false,
    faq: [
      { _key: "q1", question: "Can you fix our broken tracking without rebuilding everything?", answer: "Yes. We audit your existing setup, identify gaps and discrepancies, and surgically fix issues rather than rebuilding unnecessarily." },
    ],
    seo: {
      metaTitle: "Analytics & Conversion Tracking Setup | Kitchen of Tech",
      metaDescription: "GA4, Google Tag Manager, Meta Pixel, and Conversions API implementation. Accurate analytics and conversion tracking that powers smarter marketing decisions.",
      keywords: ["google analytics 4", "conversion tracking", "GTM setup", "analytics implementation", "meta pixel", "marketing analytics", "data tracking"],
    },
  },

  // ──────────── 13. ERP Systems ────────────
  {
    _id: "svc-erp-systems",
    _type: "service",
    title: "ERP Systems",
    slug: { _type: "slug", current: "erp-systems" },
    shortDescription:
      "Unify your entire business operations — finance, HR, inventory, procurement, and production — on one powerful, integrated ERP platform. We build and deploy custom ERP solutions that eliminate data silos and give leadership real-time operational visibility.",
    fullDescription: [
      heading("What Is an ERP System and Why Does Your Business Need One?"),
      block("An Enterprise Resource Planning (ERP) system is the central nervous system of a modern business. It connects all departments — accounting, human resources, inventory, procurement, manufacturing, and customer service — into a single, unified database. This eliminates double data entry, reduces errors, provides real-time reporting, and enables smarter, faster decision-making."),
      heading("Custom ERP vs. Off-the-Shelf Solutions", 3),
      block("While SAP, Oracle, and Odoo are powerful, they come with high licensing costs, bloated features, and inflexible workflows. A custom ERP built specifically for your business processes means you pay only for what you need, it integrates perfectly with your existing tools, and it grows with you without expensive per-seat licensing fees."),
    ],
    category: { _type: "reference", _ref: "cat-development" },
    subcategory: { _type: "reference", _ref: "sub-erp-systems" },
    features: [
      { _key: "f1", title: "Financial Management Module", description: "General ledger, accounts payable/receivable, invoicing, expense management, and financial reporting." },
      { _key: "f2", title: "HR & Payroll Module", description: "Employee records, attendance, leave management, performance tracking, and automated payroll processing." },
      { _key: "f3", title: "Inventory & Warehouse Management", description: "Real-time stock tracking, multi-warehouse management, purchase orders, and demand forecasting." },
      { _key: "f4", title: "Procurement & Vendor Management", description: "Purchase requisitions, vendor database, approval workflows, and procurement analytics." },
      { _key: "f5", title: "Real-Time Reporting & Dashboards", description: "Executive dashboards with KPIs, drill-down analytics, and automated report scheduling." },
      { _key: "f6", title: "Role-Based Access Control", description: "Granular user permissions ensuring each team member sees only the data and functions they need." },
    ],
    technologies: ["React", "Next.js", "Node.js", "PostgreSQL", "Redis", "Docker", "REST API", "Chart.js"],
    deliverables: ["Custom ERP application", "Admin panel", "User training sessions", "API documentation", "Deployment to cloud", "3 months post-launch support"],
    timeline: "3–9 months",
    pricingType: "custom",
    customPricing: { displayText: "Custom Quote", description: "ERP pricing depends on the number of modules, users, integrations, and complexity. Projects typically range from $15,000 to $150,000+. Contact us for a detailed scoping session.", showBallparkRanges: true, ballparkRanges: [{ _key: "r1", tier: "SME (up to 50 users)", rangeLow: 15000, rangeHigh: 40000, currency: "USD" }, { _key: "r2", tier: "Mid-Market (50–200 users)", rangeLow: 40000, rangeHigh: 100000, currency: "USD" }, { _key: "r3", tier: "Enterprise (200+ users)", rangeLow: 100000, rangeHigh: 300000, currency: "USD" }] },
    order: 13,
    featured: true,
    faq: [
      { _key: "q1", question: "Can the ERP integrate with our existing tools?", answer: "Yes. We build API integrations for common tools including accounting software (QuickBooks, Xero), payment gateways, ecommerce platforms, HR tools, and communication platforms." },
      { _key: "q2", question: "What happens after the ERP is launched?", answer: "We provide 3 months of post-launch support including bug fixes, user training, and minor feature adjustments. Extended support and maintenance retainers are available." },
    ],
    seo: {
      metaTitle: "Custom ERP System Development | Kitchen of Tech",
      metaDescription: "Custom ERP development for finance, HR, inventory, and procurement management. Unified business systems that eliminate silos and provide real-time operational visibility.",
      keywords: ["ERP system development", "custom ERP", "enterprise resource planning", "ERP software", "business management system", "inventory management system"],
    },
  },

  // ──────────── 14. CRM Platforms ────────────
  {
    _id: "svc-crm-platforms",
    _type: "service",
    title: "CRM Platforms",
    slug: { _type: "slug", current: "crm-platforms" },
    shortDescription:
      "Convert more leads and retain more customers with a CRM tailored to your sales process. We build custom CRM systems that centralize customer data, automate follow-ups, and give your sales team the tools to close deals faster.",
    fullDescription: [
      heading("Why a Custom CRM Outperforms Generic Solutions"),
      block("While Salesforce, HubSpot, and Pipedrive are feature-rich, they're built for the average business — not yours. A custom CRM is built around your exact sales process, terminology, and data needs. No unused features cluttering the UI. No expensive per-seat licensing fees. No forced workflows that don't match how your team actually sells."),
    ],
    category: { _type: "reference", _ref: "cat-development" },
    subcategory: { _type: "reference", _ref: "sub-crm-platforms" },
    features: [
      { _key: "f1", title: "Lead & Contact Management", description: "Centralized contact database with activity timeline, communication history, and custom fields." },
      { _key: "f2", title: "Visual Sales Pipeline", description: "Drag-and-drop Kanban pipeline with deal stages, probability tracking, and forecasting." },
      { _key: "f3", title: "Task & Follow-Up Automation", description: "Automated task creation, email reminders, and follow-up sequences triggered by deal stage changes." },
      { _key: "f4", title: "Email & Communication Integration", description: "Two-way email sync (Gmail/Outlook), call logging, and WhatsApp/SMS integration." },
      { _key: "f5", title: "Reports & Sales Analytics", description: "Win/loss analysis, sales velocity, rep performance, and revenue forecasting dashboards." },
      { _key: "f6", title: "Team Collaboration Tools", description: "Internal notes, @mentions, shared activity feeds, and team performance leaderboards." },
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "Redis", "SendGrid", "REST API", "Chart.js", "WebSockets"],
    deliverables: ["Custom CRM application", "Admin dashboard", "Training documentation", "API integration setup", "Cloud deployment", "2 months support"],
    timeline: "2–5 months",
    pricingType: "custom",
    customPricing: { displayText: "Custom Quote", description: "CRM pricing depends on user count, required modules, and integrations. Typical projects range from $8,000 to $60,000.", showBallparkRanges: true, ballparkRanges: [{ _key: "r1", tier: "Startup CRM", rangeLow: 8000, rangeHigh: 20000, currency: "USD" }, { _key: "r2", tier: "Growing Business CRM", rangeLow: 20000, rangeHigh: 60000, currency: "USD" }] },
    order: 14,
    featured: true,
    faq: [
      { _key: "q1", question: "Can you migrate our data from Salesforce or HubSpot?", answer: "Yes. We build data migration pipelines to import your existing contacts, deals, activities, and notes from any CRM, ensuring zero data loss." },
    ],
    seo: {
      metaTitle: "Custom CRM Development Services | Kitchen of Tech",
      metaDescription: "Custom CRM platforms for lead management, sales pipelines, and customer relationship management. Built to your exact sales process without expensive licensing fees.",
      keywords: ["custom CRM development", "CRM software", "sales CRM", "customer relationship management", "lead management system", "sales pipeline software"],
    },
  },

  // ──────────── 15. Custom Software Development ────────────
  {
    _id: "svc-custom-software",
    _type: "service",
    title: "Custom Software Development",
    slug: { _type: "slug", current: "custom-software-development" },
    shortDescription:
      "Your business is unique — your software should be too. We design and develop bespoke web and mobile applications that automate your workflows, serve your customers better, and give you a competitive technology advantage that off-the-shelf tools simply can't match.",
    fullDescription: [
      heading("Why Custom Software Is a Competitive Advantage"),
      block("When every competitor uses the same SaaS tools, you all have the same capabilities. Custom software is the one technology investment that creates an exclusive advantage — automating your specific processes, integrating your unique data sources, and enabling capabilities no competitor can replicate by simply purchasing a subscription."),
      heading("Our Development Process", 3),
      block("We follow an agile sprint methodology: Discovery (requirements, architecture design), Design (UI/UX wireframes and prototypes), Development (2-week sprints with demos), Testing (QA, security audits, performance testing), and Deployment (CI/CD pipeline, cloud infrastructure). You have full visibility at every stage."),
    ],
    category: { _type: "reference", _ref: "cat-development" },
    subcategory: { _type: "reference", _ref: "sub-custom-software" },
    features: [
      { _key: "f1", title: "Web Application Development", description: "Full-stack web apps using React/Next.js frontend and Node.js/Python/Go backend architectures." },
      { _key: "f2", title: "Mobile App Development", description: "iOS and Android apps using React Native or Flutter for cross-platform with native performance." },
      { _key: "f3", title: "API Development & Integration", description: "RESTful and GraphQL APIs, third-party integrations, and microservices architecture." },
      { _key: "f4", title: "Database Design & Optimization", description: "PostgreSQL, MongoDB, or MySQL schema design, query optimization, and data modeling." },
      { _key: "f5", title: "Cloud Deployment & DevOps", description: "AWS, GCP, or Azure deployment with CI/CD pipelines, Docker containerization, and monitoring." },
      { _key: "f6", title: "Security & Compliance", description: "OWASP security practices, data encryption, authentication (JWT/OAuth), and GDPR compliance." },
    ],
    technologies: ["React", "Next.js", "Node.js", "Python", "React Native", "Flutter", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Redis"],
    deliverables: ["Production-ready application", "Source code (GitHub)", "API documentation", "Deployment setup", "Test suite", "Technical documentation", "3 months support"],
    timeline: "3–12 months",
    pricingType: "custom",
    customPricing: { displayText: "Custom Quote", description: "Custom software pricing varies significantly based on complexity, platform, and team size. We provide a detailed fixed-price or time-and-materials quote after a discovery session.", showBallparkRanges: true, ballparkRanges: [{ _key: "r1", tier: "MVP / Prototype", rangeLow: 10000, rangeHigh: 30000, currency: "USD" }, { _key: "r2", tier: "Full Product", rangeLow: 30000, rangeHigh: 200000, currency: "USD" }] },
    order: 15,
    featured: true,
    faq: [
      { _key: "q1", question: "Do you sign NDAs?", answer: "Yes. We sign NDAs before any project discussion. Your idea and business logic remain completely confidential." },
      { _key: "q2", question: "Who owns the source code?", answer: "You do. Upon project completion and final payment, you receive full ownership of all source code, design files, and documentation." },
      { _key: "q3", question: "Can you take over a project another developer started?", answer: "Yes. We perform a thorough code audit, document the existing codebase, and continue development from where it left off." },
    ],
    seo: {
      metaTitle: "Custom Software Development Services | Kitchen of Tech",
      metaDescription: "Bespoke web and mobile application development. Custom software built with modern tech stacks that automates workflows and gives your business a competitive edge.",
      keywords: ["custom software development", "web application development", "mobile app development", "bespoke software", "software development company", "full stack development"],
    },
  },

  // ──────────── 16. Ecommerce Platforms ────────────
  {
    _id: "svc-ecommerce",
    _type: "service",
    title: "Ecommerce Platform Development",
    slug: { _type: "slug", current: "ecommerce-platform-development" },
    shortDescription:
      "Launch and scale a high-converting online store. We build custom ecommerce platforms and optimized Shopify/WooCommerce stores with seamless payment processing, intuitive product management, and conversion-focused UX that turns visitors into buyers.",
    fullDescription: [
      heading("Build an Ecommerce Store That Sells"),
      block("The average ecommerce conversion rate is 1–4%. A well-designed, fast, and trustworthy online store can achieve 5–8%+ conversion rates — meaning 2–4x more revenue from the same traffic. Every design and technical decision we make is guided by one goal: maximizing your store's ability to convert visitors into paying customers."),
    ],
    category: { _type: "reference", _ref: "cat-development" },
    subcategory: { _type: "reference", _ref: "sub-ecommerce" },
    features: [
      { _key: "f1", title: "Custom Storefront Design", description: "Conversion-optimized, mobile-first storefront design with brand-aligned aesthetics and intuitive UX." },
      { _key: "f2", title: "Product & Inventory Management", description: "Multi-variant products, bulk import, stock alerts, and category management." },
      { _key: "f3", title: "Payment Gateway Integration", description: "Stripe, PayPal, Paddle, SSLCommerz, and local payment method integration with secure checkout." },
      { _key: "f4", title: "Order Management System", description: "Order processing, fulfillment workflow, shipping integration, and automated customer notifications." },
      { _key: "f5", title: "SEO & Performance Optimization", description: "Product schema markup, page speed optimization, and SEO-friendly URL structures." },
      { _key: "f6", title: "Analytics & Sales Dashboard", description: "Revenue, conversion rate, AOV, customer LTV, and product performance analytics." },
    ],
    technologies: ["Next.js", "Shopify", "WooCommerce", "Stripe", "Sanity CMS", "PostgreSQL", "Vercel", "Cloudflare"],
    deliverables: ["Full ecommerce website", "Admin/product management panel", "Payment integration", "Shipping setup", "Analytics dashboard", "Launch checklist", "30-day support"],
    timeline: "6–16 weeks",
    pricingType: "project",
    projectPricing: { startingPrice: 3000, priceRangeLow: 3000, priceRangeHigh: 50000, currency: "USD", baseIncludes: ["Custom design", "Up to 100 products", "Payment integration", "Order management", "Basic SEO"] },
    order: 16,
    featured: true,
    faq: [
      { _key: "q1", question: "Shopify vs custom ecommerce — which should I choose?", answer: "Shopify is ideal for most product-based businesses: fast to launch, easy to manage, excellent app ecosystem. Custom ecommerce is better when you have unique requirements that Shopify can't accommodate, or when you want zero platform dependency." },
      { _key: "q2", question: "Can you migrate my existing store?", answer: "Yes. We migrate products, customers, orders, reviews, and SEO settings from any platform including WooCommerce, Magento, BigCommerce, or Shopify." },
    ],
    seo: {
      metaTitle: "Ecommerce Development Services | Kitchen of Tech",
      metaDescription: "Custom ecommerce platform development and Shopify/WooCommerce stores. Conversion-optimized online stores with payment integration and inventory management.",
      keywords: ["ecommerce development", "online store development", "shopify development", "woocommerce development", "ecommerce website", "online shop"],
    },
  },

  // ──────────── 17. WordPress / Shopify / Wix ────────────
  {
    _id: "svc-cms-platforms",
    _type: "service",
    title: "WordPress, Shopify & Wix Development",
    slug: { _type: "slug", current: "wordpress-shopify-wix-development" },
    shortDescription:
      "Get a professional, fully functional website fast — without the cost of custom development. We build, customize, and optimize websites on WordPress, Shopify, and Wix with pixel-perfect designs, performance optimization, and all the features your business needs.",
    fullDescription: [
      heading("The Power of Platform-Based Development"),
      block("CMS platforms like WordPress, Shopify, and Wix power 60%+ of the web because they offer the best balance of speed, cost, and capability for most businesses. The key is working with a developer who knows how to push these platforms beyond their templates — building genuinely custom experiences while keeping your site easy to manage without technical skills."),
    ],
    category: { _type: "reference", _ref: "cat-development" },
    subcategory: { _type: "reference", _ref: "sub-cms-platforms" },
    features: [
      { _key: "f1", title: "Custom Theme & Template Development", description: "Bespoke theme development or premium theme customization with your exact brand identity." },
      { _key: "f2", title: "Plugin/App Integration & Configuration", description: "WooCommerce, ACF, Elementor, Yoast, Shopify Apps, and custom plugin development." },
      { _key: "f3", title: "Speed & Performance Optimization", description: "Core Web Vitals optimization, image compression, caching, and CDN setup for 90+ PageSpeed scores." },
      { _key: "f4", title: "Security Hardening", description: "SSL, firewall, malware scanning, admin URL protection, and regular backup configuration." },
      { _key: "f5", title: "SEO Technical Setup", description: "Yoast/Rank Math configuration, sitemaps, robots.txt, canonical URLs, and schema markup." },
      { _key: "f6", title: "Client Training & Documentation", description: "Recorded training sessions and written guides for managing your site independently." },
    ],
    technologies: ["WordPress", "Shopify", "Wix", "Elementor", "WooCommerce", "ACF", "PHP", "Liquid", "CSS/JS"],
    deliverables: ["Completed website", "All plugin licences (where applicable)", "Training video", "Written documentation", "30-day post-launch support"],
    timeline: "2–6 weeks",
    pricingType: "project",
    projectPricing: { startingPrice: 1000, priceRangeLow: 1000, priceRangeHigh: 15000, currency: "USD", baseIncludes: ["Up to 10 pages", "Custom design", "Plugin setup", "Speed optimization", "Basic SEO", "Training"] },
    order: 17,
    featured: false,
    faq: [
      { _key: "q1", question: "Which platform do you recommend for my business?", answer: "WordPress for content-heavy or complex sites, Shopify for product-based ecommerce, Wix for simple brochure sites that need frequent self-management. We'll advise the best fit during your consultation." },
    ],
    seo: {
      metaTitle: "WordPress, Shopify & Wix Development Services | Kitchen of Tech",
      metaDescription: "Professional WordPress, Shopify, and Wix website development. Custom themes, plugin integration, speed optimization, and SEO setup for business websites.",
      keywords: ["wordpress development", "shopify development", "wix development", "website development", "wordpress website", "CMS development"],
    },
  },

  // ──────────── 18. Workflow Automation (n8n) ────────────
  {
    _id: "svc-workflow-automation",
    _type: "service",
    title: "Workflow Automation with n8n",
    slug: { _type: "slug", current: "workflow-automation-n8n" },
    shortDescription:
      "Stop wasting hours on repetitive manual tasks. We build intelligent workflow automations using n8n that connect your apps, eliminate data entry, automate follow-ups, and let your team focus on high-value work that actually grows the business.",
    fullDescription: [
      heading("What Can Be Automated with n8n?"),
      block("n8n is a powerful open-source workflow automation platform that connects 400+ apps and services. Unlike Zapier, n8n runs on your own infrastructure — meaning no per-task pricing, complete data privacy, and unlimited workflow complexity. We use it to automate lead qualification, CRM data enrichment, invoice generation, HR onboarding, social media publishing, reporting, customer support routing, and virtually any repetitive process your team performs."),
      heading("How We Build Your Automations", 3),
      block("We begin with a process mapping workshop to identify your highest-ROI automation opportunities. We then design, build, and test each workflow — handling edge cases, error logging, and retry logic — so your automations are robust and reliable, not fragile scripts that break silently."),
    ],
    category: { _type: "reference", _ref: "cat-ai-automation" },
    subcategory: { _type: "reference", _ref: "sub-workflow-automation" },
    features: [
      { _key: "f1", title: "Process Discovery & Automation Audit", description: "Workshop to map current workflows, quantify time savings, and prioritize automation opportunities by ROI." },
      { _key: "f2", title: "Multi-App Integration Workflows", description: "Connect CRM, email, Slack, Google Sheets, databases, payment systems, and any app with an API." },
      { _key: "f3", title: "Data Transformation & Enrichment", description: "Automatic data formatting, validation, enrichment (Clearbit, Hunter.io), and routing based on business logic." },
      { _key: "f4", title: "Error Handling & Monitoring", description: "Built-in error catches, retry logic, Slack/email alerts on failures, and workflow execution logs." },
      { _key: "f5", title: "Self-Hosted n8n Deployment", description: "n8n deployed on your own cloud infrastructure (AWS/GCP) for data privacy and unlimited executions." },
      { _key: "f6", title: "Documentation & Team Training", description: "Visual workflow documentation and team training so you can maintain and extend automations in-house." },
    ],
    technologies: ["n8n", "Make (Integromat)", "REST APIs", "Webhooks", "JavaScript", "Node.js", "PostgreSQL", "Docker", "AWS", "OpenAI API"],
    deliverables: ["Deployed automation workflows", "Workflow documentation", "Error monitoring setup", "Training session recording", "30-day support"],
    timeline: "1–4 weeks per workflow set",
    pricingType: "project",
    projectPricing: { startingPrice: 800, priceRangeLow: 800, priceRangeHigh: 20000, currency: "USD", baseIncludes: ["Process audit", "Up to 3 workflows", "Error handling", "Documentation", "2 weeks support"] },
    order: 18,
    featured: true,
    faq: [
      { _key: "q1", question: "Do I need technical knowledge to manage the automations after?", answer: "No. We build with a visual interface and document every workflow clearly. We also provide training so your team can make minor adjustments without needing a developer." },
      { _key: "q2", question: "Is n8n better than Zapier or Make?", answer: "For businesses with complex workflows or data privacy requirements, n8n is superior — it's self-hosted (your data never leaves your servers), has no per-task pricing, and supports far more complex logic. For simple 1-2 step workflows, Zapier may be faster to set up." },
    ],
    seo: {
      metaTitle: "n8n Workflow Automation Services | Kitchen of Tech",
      metaDescription: "Business workflow automation with n8n. Connect your apps, eliminate manual tasks, and automate repetitive processes with robust, self-hosted automation workflows.",
      keywords: ["n8n automation", "workflow automation", "business process automation", "n8n development", "no-code automation", "process automation", "RPA"],
    },
  },

  // ──────────── 19. AI Chatbot Systems ────────────
  {
    _id: "svc-ai-chatbots",
    _type: "service",
    title: "AI Chatbot Systems",
    slug: { _type: "slug", current: "ai-chatbot-systems" },
    shortDescription:
      "Deploy intelligent AI assistants that handle customer queries, qualify leads, and automate support — 24/7, in any language, at a fraction of the cost of a human team. Our AI chatbots integrate with your knowledge base, CRM, and communication channels to deliver genuinely helpful, on-brand conversations.",
    fullDescription: [
      heading("Beyond Basic Bots: AI That Actually Helps"),
      block("Traditional rule-based chatbots frustrate customers with rigid decision trees. Our AI chatbots are powered by large language models (GPT-4, Claude) trained on your specific business knowledge — products, policies, FAQs, and procedures. They understand context, handle nuanced questions, seamlessly hand off to human agents, and learn from every interaction."),
      heading("Where AI Chatbots Deliver Immediate ROI", 3),
      block("Customer support teams using AI chatbots resolve 60–80% of common inquiries automatically, cutting support costs by 30–50%. For lead generation, AI-powered qualification bots increase lead capture rates by 3–5x compared to static forms — because conversation converts better than forms."),
    ],
    category: { _type: "reference", _ref: "cat-ai-automation" },
    subcategory: { _type: "reference", _ref: "sub-ai-chatbots" },
    features: [
      { _key: "f1", title: "LLM-Powered Conversations", description: "GPT-4 or Claude 3.5-powered responses with your business context, tone of voice, and brand personality." },
      { _key: "f2", title: "Knowledge Base Integration", description: "Train the bot on your documentation, FAQs, product catalog, and policies using RAG (Retrieval-Augmented Generation)." },
      { _key: "f3", title: "CRM & Lead Capture Integration", description: "Automatic lead qualification, data collection, and direct push to HubSpot, Salesforce, or custom CRM." },
      { _key: "f4", title: "Multi-Channel Deployment", description: "Deploy on website, WhatsApp Business, Facebook Messenger, Telegram, and Slack simultaneously." },
      { _key: "f5", title: "Human Handoff & Escalation", description: "Smart escalation detection with seamless handoff to human agents in Intercom, Zendesk, or custom live chat." },
      { _key: "f6", title: "Analytics & Conversation Insights", description: "Dashboard showing conversation volumes, resolution rates, common queries, and sentiment analysis." },
    ],
    technologies: ["OpenAI GPT-4", "Claude (Anthropic)", "LangChain", "Pinecone (vector DB)", "Next.js", "WhatsApp Business API", "Vercel AI SDK"],
    deliverables: ["Custom AI chatbot", "Knowledge base setup", "Channel integrations", "Admin dashboard", "Training documentation", "1 month post-launch support"],
    timeline: "3–8 weeks",
    pricingType: "project",
    projectPricing: { startingPrice: 2000, priceRangeLow: 2000, priceRangeHigh: 25000, currency: "USD", baseIncludes: ["Bot design & training", "Website integration", "Knowledge base upload", "1 channel deployment", "Analytics dashboard"] },
    order: 19,
    featured: true,
    faq: [
      { _key: "q1", question: "Will the chatbot give incorrect answers?", answer: "We use RAG architecture which grounds every answer in your specific documentation — significantly reducing hallucinations. We also configure the bot to acknowledge uncertainty and escalate to humans for complex queries." },
      { _key: "q2", question: "Can the chatbot be available in multiple languages?", answer: "Yes. GPT-4 supports 95+ languages and responds in the language of the user automatically. We can restrict to specific languages if preferred." },
    ],
    seo: {
      metaTitle: "AI Chatbot Development Services | Kitchen of Tech",
      metaDescription: "Custom AI chatbot systems powered by GPT-4 and Claude. Deploy intelligent customer support, lead generation, and automation bots on your website, WhatsApp, and more.",
      keywords: ["AI chatbot development", "GPT-4 chatbot", "customer support chatbot", "AI assistant", "chatbot integration", "conversational AI", "WhatsApp chatbot"],
    },
  },

  // ──────────── 20. Digital Strategy ────────────
  {
    _id: "svc-digital-strategy",
    _type: "service",
    title: "Digital Strategy Consulting",
    slug: { _type: "slug", current: "digital-strategy-consulting" },
    shortDescription:
      "Make technology work for your business with a clear, actionable digital strategy. We assess your current digital maturity, identify high-impact opportunities, and build a prioritized roadmap that aligns technology investment with your business objectives.",
    fullDescription: [
      heading("What Is a Digital Strategy and Why You Need One"),
      block("Most businesses accumulate technology and digital initiatives reactively — a website here, a social media account there, an ad campaign when sales slow down. A digital strategy changes this. It's a deliberate plan that identifies exactly where technology can drive the most business value, what resources are required, and in what sequence investments should be made for maximum impact."),
      heading("Our Digital Strategy Framework", 3),
      block("We use a proven 4-phase framework: (1) Digital Audit — assessing your current digital footprint, technology stack, customer journey, and competitive position. (2) Opportunity Mapping — identifying gaps between where you are and where you could be. (3) Roadmap Development — prioritizing initiatives by ROI, feasibility, and strategic importance. (4) Implementation Planning — defining resources, timelines, KPIs, and governance structures."),
    ],
    category: { _type: "reference", _ref: "cat-business-consultancy" },
    subcategory: { _type: "reference", _ref: "sub-digital-strategy" },
    features: [
      { _key: "f1", title: "Digital Maturity Assessment", description: "Structured evaluation of your digital presence, technology infrastructure, data capabilities, and team competencies." },
      { _key: "f2", title: "Competitor & Market Analysis", description: "Digital benchmarking against 3–5 competitors with gap analysis and differentiation opportunities." },
      { _key: "f3", title: "Customer Journey Mapping", description: "End-to-end visualization of your customer's digital touchpoints with friction points and optimization opportunities." },
      { _key: "f4", title: "Technology Stack Recommendations", description: "Objective recommendations for your tech stack (CMS, CRM, marketing automation, analytics) based on your needs and budget." },
      { _key: "f5", title: "Prioritized Digital Roadmap", description: "12–24 month initiative roadmap with business case, expected ROI, dependencies, and milestones." },
      { _key: "f6", title: "Executive Presentation", description: "Board/leadership-ready strategy presentation with data visualizations and clear investment recommendations." },
    ],
    technologies: ["Google Analytics 4", "SEMrush", "Ahrefs", "Miro (journey mapping)", "PowerPoint / Keynote", "Notion (roadmap)"],
    deliverables: ["Digital audit report", "Competitor analysis", "Customer journey maps", "Technology recommendations", "Prioritized roadmap", "Executive presentation", "Implementation workbook"],
    timeline: "3–6 weeks",
    pricingType: "project",
    projectPricing: { startingPrice: 3000, priceRangeLow: 3000, priceRangeHigh: 25000, currency: "USD", baseIncludes: ["Digital audit", "Competitor analysis", "Opportunity map", "12-month roadmap", "Executive presentation"] },
    order: 20,
    featured: true,
    faq: [
      { _key: "q1", question: "Do you help with implementation after the strategy?", answer: "Yes. Many clients engage us to execute the roadmap — whether that's website development, digital marketing, software projects, or AI automation. Strategy and execution under one roof eliminates the translation gap." },
    ],
    seo: {
      metaTitle: "Digital Strategy Consulting Services | Kitchen of Tech",
      metaDescription: "Expert digital strategy consulting with digital audits, competitor analysis, technology recommendations, and prioritized roadmaps that align technology with business goals.",
      keywords: ["digital strategy", "digital transformation", "digital strategy consulting", "technology roadmap", "digital marketing strategy", "IT strategy"],
    },
  },

  // ──────────── 21. Revenue Growth Planning ────────────
  {
    _id: "svc-revenue-growth",
    _type: "service",
    title: "Revenue Growth Planning",
    slug: { _type: "slug", current: "revenue-growth-planning" },
    shortDescription:
      "Build a clear, data-driven plan to grow your revenue systematically. We analyse your current revenue model, identify growth levers, model expansion scenarios, and create a quarterly execution plan with measurable milestones that your team can actually execute.",
    fullDescription: [
      heading("Revenue Growth Is Not an Accident"),
      block("The fastest-growing companies don't rely on luck. They identify their most powerful growth levers — whether that's increasing average order value, improving customer retention, entering new markets, or optimizing sales conversion — and they pursue them systematically with clear targets and accountability."),
      heading("What Our Revenue Growth Engagement Covers", 3),
      block("We start with a revenue audit: understanding your current revenue streams, customer acquisition costs, lifetime value, churn rates, and unit economics. From this baseline, we identify the 3–5 highest-leverage growth opportunities and build a detailed 90-day and 12-month execution plan with measurable KPIs, tactics, owners, and resource requirements."),
    ],
    category: { _type: "reference", _ref: "cat-business-consultancy" },
    subcategory: { _type: "reference", _ref: "sub-revenue-growth" },
    features: [
      { _key: "f1", title: "Revenue Model Audit", description: "Analysis of all revenue streams, pricing, CAC, LTV, churn, and unit economics to establish a growth baseline." },
      { _key: "f2", title: "Growth Lever Identification", description: "Systematic identification and prioritization of the highest-ROI growth opportunities specific to your business." },
      { _key: "f3", title: "Market Expansion Analysis", description: "New segment, channel, and geographic expansion opportunities with market size estimates and entry strategies." },
      { _key: "f4", title: "Pricing Strategy Optimization", description: "Value-based pricing analysis, tier structure recommendations, and upsell/cross-sell opportunity mapping." },
      { _key: "f5", title: "90-Day Revenue Sprint Plan", description: "Tactical execution plan for the highest-priority growth initiative with weekly milestones and accountability structure." },
      { _key: "f6", title: "Financial Modelling & Projections", description: "Revenue scenario modelling (base, optimistic, pessimistic) with assumptions, sensitivities, and investment returns." },
    ],
    technologies: ["Excel / Google Sheets (financial modelling)", "Notion", "Miro", "PowerPoint / Keynote"],
    deliverables: ["Revenue audit report", "Growth opportunity analysis", "Financial model (Excel)", "12-month growth roadmap", "90-day sprint plan", "Executive presentation"],
    timeline: "3–5 weeks",
    pricingType: "project",
    projectPricing: { startingPrice: 4000, priceRangeLow: 4000, priceRangeHigh: 30000, currency: "USD", baseIncludes: ["Revenue audit", "Growth opportunity map", "Pricing analysis", "Financial model", "12-month roadmap", "90-day sprint plan"] },
    order: 21,
    featured: true,
    faq: [
      { _key: "q1", question: "Is this only for large enterprises?", answer: "Not at all. Revenue growth planning is most impactful for startups and growing SMEs (£500K–£10M revenue) at an inflection point. It provides the clarity and focus needed to make the right bets at the right time." },
      { _key: "q2", question: "How is this different from general business consulting?", answer: "We focus specifically on revenue — the inputs that directly drive top-line growth — rather than general operational or management consulting. The output is always a concrete, actionable execution plan, not a generic strategy document." },
    ],
    seo: {
      metaTitle: "Revenue Growth Planning & Consulting | Kitchen of Tech",
      metaDescription: "Data-driven revenue growth planning with market analysis, pricing strategy, financial modelling, and a 90-day execution roadmap to scale your business profitably.",
      keywords: ["revenue growth strategy", "business growth consulting", "revenue planning", "growth strategy", "sales growth", "business scaling", "revenue optimization"],
    },
  },
];

// ─────────────────────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n🚀 Kitchen of Tech — Service Content Seeder");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── Step 1: Check token permissions ──
  console.log("🔑 Verifying API token permissions...");
  try {
    await client.fetch('*[_type == "serviceCategory"][0..0]{ _id }');
    console.log("   ✅ Read access confirmed\n");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("   ❌ Read access failed:", msg);
    process.exit(1);
  }

  // ── Helper: upsert a document (try createOrReplace, fall back to create) ──
  async function upsert(doc: Record<string, unknown>) {
    try {
      return await client.createOrReplace(doc);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists") || msg.includes("conflict")) {
        // Document exists but token can't update — skip silently
        console.log(`      ⚠️  Skipped (already exists): ${doc._id}`);
        return null;
      }
      // Try plain create for new documents
      return await client.create(doc);
    }
  }

  // ── Step 2: Insert categories ──
  console.log("📂 Creating Service Categories...");
  for (const cat of categories) {
    try {
      await client.createOrReplace(cat);
      process.stdout.write(".");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // If update permission denied, try create
      if (msg.includes("update") || msg.includes("permission")) {
        try {
          await client.create(cat);
          process.stdout.write(".");
        } catch (e2: unknown) {
          const msg2 = e2 instanceof Error ? e2.message : String(e2);
          if (!msg2.includes("already exists") && !msg2.includes("409")) {
            console.error(`\n   ❌ Failed ${cat._id}: ${msg2}`);
          } else {
            process.stdout.write("s"); // skipped
          }
        }
      } else {
        console.error(`\n   ❌ Failed ${cat._id}: ${msg}`);
      }
    }
  }
  console.log(`\n   ✅ ${categories.length} categories processed\n`);

  // ── Step 3: Insert subcategories ──
  console.log("🏷️  Creating Service Subcategories...");
  for (const sub of subcategories) {
    try {
      await client.createOrReplace(sub);
      process.stdout.write(".");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("update") || msg.includes("permission")) {
        try {
          await client.create(sub);
          process.stdout.write(".");
        } catch (e2: unknown) {
          const msg2 = e2 instanceof Error ? e2.message : String(e2);
          if (!msg2.includes("already exists") && !msg2.includes("409")) {
            console.error(`\n   ❌ Failed ${sub._id}: ${msg2}`);
          } else {
            process.stdout.write("s");
          }
        }
      } else {
        console.error(`\n   ❌ Failed ${sub._id}: ${msg}`);
      }
    }
  }
  console.log(`\n   ✅ ${subcategories.length} subcategories processed\n`);

  // ── Step 4: Insert services (batched) ──
  console.log("🛠️  Creating Services...");
  let successCount = 0;
  for (const svc of services) {
    try {
      await client.createOrReplace(svc);
      process.stdout.write(".");
      successCount++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("update") || msg.includes("permission")) {
        try {
          await client.create(svc);
          process.stdout.write(".");
          successCount++;
        } catch (e2: unknown) {
          const msg2 = e2 instanceof Error ? e2.message : String(e2);
          if (!msg2.includes("already exists") && !msg2.includes("409")) {
            console.error(`\n   ❌ Failed ${svc._id}: ${msg2}`);
          } else {
            process.stdout.write("s");
            successCount++;
          }
        }
      } else {
        console.error(`\n   ❌ Failed ${svc._id}: ${msg}`);
      }
    }
  }
  console.log(`\n   ✅ ${successCount}/${services.length} services processed\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seeding complete!");
  console.log(`   📂 ${categories.length} Service Categories`);
  console.log(`   🏷️  ${subcategories.length} Service Subcategories`);
  console.log(`   🛠️  ${services.length} Services`);
  console.log("\n🔗 View your content at: https://www.sanity.io/manage");
  console.log("🔗 Local Studio: http://localhost:3000/studio\n");
}

seed().catch((err) => {
  console.error("\n❌ Seeding failed:", err.message);
  process.exit(1);
});
