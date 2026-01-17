# Kitchen of Tech - Enterprise IT & Creative Agency Website

A modern, full-stack website built with Next.js 16, Sanity CMS, Supabase, and Tailwind CSS v3.

## 🚀 Features

- **Modern Tech Stack**: Next.js 16, TypeScript, Tailwind CSS v3
- **CMS Integration**: Sanity.io for dynamic content management
- **Database**: Supabase (PostgreSQL) for form submissions and analytics
- **Animations**: Framer Motion, GSAP, Lenis smooth scroll
- **Analytics**: Google Analytics 4 with custom event tracking
- **SEO Optimized**: Dynamic metadata, OpenGraph, Twitter cards
- **Fully Responsive**: Mobile-first design with glass morphism UI

## 📄 Pages

- `/` - Landing page with 3D hero, services, testimonials
- `/services` - Services listing with filters
- `/services/[slug]` - Dynamic service detail pages
- `/blog` - Blog listing with search and categories  
- `/portfolio` - Portfolio showcase with filters
- `/team` - Team members with social links
- `/testimonials` - Client testimonials and reviews
- `/certificate-verify` - Certificate verification system
- `/studio` - Sanity Studio (CMS admin)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.local` and update with your credentials:

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Site URL
NEXT_PUBLIC_SITE_URL=https://kitchenoftech.org
```

### 3. Database Setup

Run the SQL schema in Supabase:

```bash
# File location: supabase/schema.sql
# Execute in Supabase SQL Editor
```

### 4. Sanity Studio Setup

```bash
# Access Sanity Studio at /studio
# Login with your Sanity account
# Start adding content (services, blog posts, team members, etc.)
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. **Connect Repository**
   ```bash
   vercel
   ```

2. **Add Environment Variables** in Vercel Dashboard
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`

3. **Configure Domain**
   - Add `kitchenoftech.org` in Domains section
   - Update DNS records:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## 🎨 Tech Stack

### Frontend
- **Next.js 16.1.3** - React framework with App Router
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **Framer Motion 12.26.2** - Animations
- **Lenis 1.3.17** - Smooth scrolling

### Backend & CMS
- **Sanity.io 5.4.0** - Headless CMS
- **Supabase** - PostgreSQL database
- **React Query 5.90.18** - Data fetching

### Forms & Validation
- **React Hook Form 7.71.1** - Form handling
- **Zod 3.x** - Schema validation

## 📊 Analytics & Tracking

### Google Analytics 4

Track custom events:

```typescript
import { trackEvent, trackButtonClick, trackFormSubmit } from '@/components/analytics/GoogleAnalytics';

// Button click
trackButtonClick('contact_cta', 'homepage_hero');

// Form submission
trackFormSubmit('contact_form', true);

// Custom event
trackEvent('user_action', { action_type: 'download' });
```

## 🗂️ Project Structure

```
├── app/
│   ├── (routes)/           # Page routes
│   ├── api/                # API routes
│   ├── studio/             # Sanity Studio
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── analytics/          # GA4 tracking
│   ├── landing/            # Landing page sections
│   ├── layout/             # Navbar, Footer
│   ├── providers/          # Context providers
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── sanity/             # Sanity client & queries
│   ├── supabase/           # Supabase client
│   └── utils.ts            # Utility functions
├── sanity/
│   └── schemas/            # Sanity content types
├── supabase/
│   └── schema.sql          # Database schema
├── types/
│   └── index.ts            # TypeScript types
└── tailwind.config.ts      # Tailwind configuration
```

## 🎯 Performance

- **Lighthouse Score**: 90+ target
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with App Router
- **ISR**: Incremental Static Regeneration (1 hour revalidation)

## 📝 Content Management

### Adding Services

1. Go to `/studio`
2. Navigate to "Services"
3. Click "Create" and fill in:
   - Title
   - Slug
   - Description
   - Features
   - Pricing
   - Images

### Adding Blog Posts

1. Go to `/studio`
2. Navigate to "Blog"
3. Create new post with:
   - Title, slug, author
   - Featured image
   - Content (rich text)
   - Category, tags
   - SEO metadata

## 🔧 Troubleshooting

### Tailwind Classes Not Working

Make sure you're using Tailwind v3 (not v4):
```bash
npm install -D tailwindcss@3.4.17 postcss@8.4.49 autoprefixer@10.4.20
```

### Sanity Studio 404

Ensure `next.config.js` includes:
```javascript
async rewrites() {
  return [
    { source: '/studio/:path*', destination: '/studio/:path*' }
  ];
}
```

## 📧 Support

For issues or questions:
- **Email**: support@kitchenoftech.org
- **Documentation**: [Sanity](https://www.sanity.io/docs) | [Next.js](https://nextjs.org/docs)

## 📄 License

© 2024 Kitchen of Tech. All rights reserved.
