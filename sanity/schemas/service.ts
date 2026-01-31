import { defineType, defineField } from "sanity";

export const service = defineType({
  name: "service",
  title: "Services",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info" },
    { name: "content", title: "Content & Features" },
    { name: "categorization", title: "Categories" },
    { name: "pricing", title: "Pricing" },
    { name: "portfolio", title: "Portfolio & Examples" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // BASIC INFO
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "basic",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basic",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      group: "basic",
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "icon",
      title: "Icon/Image",
      type: "image",
      group: "basic",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "basic",
      options: {
        hotspot: true,
      },
      description: "Large cover image for service cards and detail pages (recommended size: 1200x600)",
    }),
    
    // CATEGORIZATION
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "categorization",
      to: [{ type: "serviceCategory" }],
      description: "Main category (e.g., Development, Design)",
    }),
    defineField({
      name: "subcategory",
      title: "Subcategory",
      type: "reference",
      group: "categorization",
      to: [{ type: "serviceSubcategory" }],
      description: "Specific subcategory (e.g., Web Development, Mobile Apps)",
    }),
    
    // CONTENT & FEATURES
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "title",
              title: "Feature Title",
              type: "string",
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
            },
            {
              name: "icon",
              title: "Icon",
              type: "image",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "technologies",
      title: "Technologies/Tools",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description: "Tech stack: React, Node.js, Figma, etc.",
    }),
    defineField({
      name: "deliverables",
      title: "What's Included",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      description: "List of deliverables the client will receive",
    }),
    defineField({
      name: "timeline",
      title: "Typical Timeline",
      type: "string",
      group: "content",
      description: "e.g., '2-4 weeks', '3-6 months', 'Ongoing'",
    }),
    
    // PRICING STRUCTURE
    defineField({
      name: "pricingType",
      title: "Pricing Type",
      type: "string",
      group: "pricing",
      options: {
        list: [
          { title: "Subscription (Tiered)", value: "subscription" },
          { title: "One-Time/Project-Based", value: "project" },
          { title: "Hourly/Effort-Based", value: "hourly" },
          { title: "Custom Quote", value: "custom" },
        ],
        layout: "radio",
      },
      initialValue: "project",
      validation: (Rule) => Rule.required(),
    }),
    
    // SUBSCRIPTION PRICING
    defineField({
      name: "subscriptionTiers",
      title: "Subscription Tiers",
      type: "array",
      group: "pricing",
      hidden: ({ parent }) => parent?.pricingType !== "subscription",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Tier Name",
              type: "string",
              description: "e.g., Starter, Professional, Enterprise",
            },
            {
              name: "price",
              title: "Price",
              type: "number",
            },
            {
              name: "currency",
              title: "Currency",
              type: "string",
              options: {
                list: ["USD", "EUR", "GBP", "BDT"],
              },
              initialValue: "USD",
            },
            {
              name: "billingPeriod",
              title: "Billing Period",
              type: "string",
              options: {
                list: [
                  { title: "Monthly", value: "month" },
                  { title: "Annual", value: "year" },
                  { title: "One-time", value: "once" },
                ],
              },
              initialValue: "month",
            },
            {
              name: "popular",
              title: "Most Popular",
              type: "boolean",
              description: "Highlight this tier",
            },
            {
              name: "features",
              title: "Features",
              type: "array",
              of: [{ type: "string" }],
            },
            {
              name: "featureComparison",
              title: "Feature Comparison (Optional)",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    {
                      name: "feature",
                      title: "Feature Name",
                      type: "string",
                    },
                    {
                      name: "included",
                      title: "Included",
                      type: "boolean",
                    },
                    {
                      name: "limit",
                      title: "Limit/Details",
                      type: "string",
                      description: "e.g., '10 users', 'Unlimited', '100GB'",
                    },
                  ],
                },
              ],
            },
          ],
          preview: {
            select: {
              title: "name",
              price: "price",
              currency: "currency",
              period: "billingPeriod",
            },
            prepare({ title, price, currency, period }) {
              return {
                title: title || "Unnamed Tier",
                subtitle: `${currency} ${price}/${period}`,
              };
            },
          },
        },
      ],
    }),
    
    // PROJECT-BASED PRICING
    defineField({
      name: "projectPricing",
      title: "Project Pricing",
      type: "object",
      group: "pricing",
      hidden: ({ parent }) => parent?.pricingType !== "project",
      fields: [
        {
          name: "startingPrice",
          title: "Starting Price",
          type: "number",
          description: "Minimum project cost",
        },
        {
          name: "priceRangeLow",
          title: "Price Range (Low)",
          type: "number",
          description: "Optional: Typical minimum",
        },
        {
          name: "priceRangeHigh",
          title: "Price Range (High)",
          type: "number",
          description: "Optional: Typical maximum",
        },
        {
          name: "currency",
          title: "Currency",
          type: "string",
          options: {
            list: ["USD", "EUR", "GBP", "BDT"],
          },
          initialValue: "USD",
        },
        {
          name: "baseIncludes",
          title: "Base Package Includes",
          type: "array",
          of: [{ type: "string" }],
          description: "What's included in the starting price",
        },
        {
          name: "addons",
          title: "Optional Add-ons",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "title",
                  title: "Add-on Title",
                  type: "string",
                },
                {
                  name: "price",
                  title: "Additional Cost",
                  type: "number",
                },
                {
                  name: "description",
                  title: "Description",
                  type: "text",
                  rows: 2,
                },
              ],
            },
          ],
        },
      ],
    }),
    
    // HOURLY PRICING
    defineField({
      name: "hourlyPricing",
      title: "Hourly/Effort-Based Pricing",
      type: "object",
      group: "pricing",
      hidden: ({ parent }) => parent?.pricingType !== "hourly",
      fields: [
        {
          name: "rateLow",
          title: "Rate Low",
          type: "number",
          description: "Minimum hourly rate",
        },
        {
          name: "rateHigh",
          title: "Rate High",
          type: "number",
          description: "Maximum hourly rate",
        },
        {
          name: "currency",
          title: "Currency",
          type: "string",
          options: {
            list: ["USD", "EUR", "GBP", "BDT"],
          },
          initialValue: "USD",
        },
        {
          name: "rateType",
          title: "Rate Type",
          type: "string",
          options: {
            list: [
              { title: "Per Hour", value: "hour" },
              { title: "Per Day", value: "day" },
              { title: "Per Week", value: "week" },
            ],
          },
          initialValue: "hour",
        },
        {
          name: "minimumEngagement",
          title: "Minimum Engagement",
          type: "string",
          description: "e.g., '40 hours', '1 week', '1 month'",
        },
        {
          name: "expertiseLevels",
          title: "Expertise Levels",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "level",
                  title: "Level",
                  type: "string",
                  description: "e.g., Junior, Mid-Level, Senior",
                },
                {
                  name: "rate",
                  title: "Rate",
                  type: "number",
                },
                {
                  name: "description",
                  title: "Description",
                  type: "text",
                  rows: 2,
                },
              ],
            },
          ],
        },
        {
          name: "averageProjectHours",
          title: "Average Project Hours",
          type: "string",
          description: "e.g., '80-160 hours', 'Varies by scope'",
        },
      ],
    }),
    
    // CUSTOM QUOTE PRICING
    defineField({
      name: "customPricing",
      title: "Custom Quote Pricing",
      type: "object",
      group: "pricing",
      hidden: ({ parent }) => parent?.pricingType !== "custom",
      fields: [
        {
          name: "displayText",
          title: "Display Text",
          type: "string",
          description: "e.g., 'Contact for Quote', 'Custom Pricing'",
          initialValue: "Contact for Quote",
        },
        {
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
          description: "Explain why custom pricing is needed",
        },
        {
          name: "showBallparkRanges",
          title: "Show Ballpark Ranges",
          type: "boolean",
          description: "Display approximate price ranges",
        },
        {
          name: "ballparkRanges",
          title: "Ballpark Ranges (Optional)",
          type: "array",
          hidden: ({ parent }) => !parent?.showBallparkRanges,
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "tier",
                  title: "Tier/Scope",
                  type: "string",
                  description: "e.g., 'Small Business', 'Enterprise'",
                },
                {
                  name: "rangeLow",
                  title: "Range Low",
                  type: "number",
                },
                {
                  name: "rangeHigh",
                  title: "Range High",
                  type: "number",
                },
                {
                  name: "currency",
                  title: "Currency",
                  type: "string",
                  options: {
                    list: ["USD", "EUR", "GBP", "BDT"],
                  },
                  initialValue: "USD",
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              title: "Alternative Text",
              type: "string",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          validation: (Rule) => Rule.max(60),
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 2,
          validation: (Rule) => Rule.max(160),
        },
        {
          name: "ogImage",
          title: "Open Graph Image",
          type: "image",
        },
        {
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "string" }],
        },
      ],
    }),
    
    // PORTFOLIO & EXAMPLES
    defineField({
      name: "portfolioItems",
      title: "Portfolio Examples",
      type: "array",
      group: "portfolio",
      of: [
        {
          type: "reference",
          to: [{ type: "portfolio" }],
        },
      ],
      description: "Link portfolio projects that showcase this service",
    }),
    
    // FAQ
    defineField({
      name: "faq",
      title: "Frequently Asked Questions",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "question",
              title: "Question",
              type: "string",
            },
            {
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 3,
            },
          ],
          preview: {
            select: {
              title: "question",
              subtitle: "answer",
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "icon",
      category: "category.title",
      subcategory: "subcategory.title",
      featured: "featured",
    },
    prepare({ title, media, category, subcategory, featured }) {
      const categoryInfo = category && subcategory 
        ? `${category} → ${subcategory}` 
        : category || "Uncategorized";
      
      return {
        title: featured ? `⭐ ${title}` : title,
        subtitle: categoryInfo,
        media,
      };
    },
  },
});
