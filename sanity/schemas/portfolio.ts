import { defineType, defineField } from "sanity";

export const portfolio = defineType({
  name: "portfolio",
  title: "Portfolio",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info" },
    { name: "details", title: "Project Details" },
    { name: "results", title: "Results & Impact" },
    { name: "media", title: "Media & Gallery" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // BASIC INFO
    defineField({
      name: "title",
      title: "Project Title",
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
      name: "client",
      title: "Client Name",
      type: "string",
      group: "basic",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clientLogo",
      title: "Client Logo",
      type: "image",
      group: "basic",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      group: "basic",
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
      description: "Brief summary for cards and previews",
    }),
    defineField({
      name: "featured",
      title: "Featured Project",
      type: "boolean",
      group: "basic",
      initialValue: false,
    }),
    defineField({
      name: "completedDate",
      title: "Completion Date",
      type: "date",
      group: "basic",
    }),

    // PROJECT DETAILS
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      group: "details",
      of: [{ type: "block" }],
      description: "Comprehensive project overview",
    }),
    defineField({
      name: "challenge",
      title: "The Challenge",
      type: "text",
      group: "details",
      rows: 4,
      description: "What problem did the client face?",
    }),
    defineField({
      name: "solution",
      title: "Our Solution",
      type: "text",
      group: "details",
      rows: 4,
      description: "How did you solve the problem?",
    }),
    defineField({
      name: "approach",
      title: "Our Approach",
      type: "array",
      group: "details",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "phase",
              title: "Phase",
              type: "string",
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
      description: "Step-by-step project approach",
    }),

    // RESULTS & IMPACT
    defineField({
      name: "results",
      title: "Key Results",
      type: "array",
      group: "results",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "metric",
              title: "Metric Name",
              type: "string",
              description: "e.g., 'Revenue Growth', 'User Engagement'",
            },
            {
              name: "value",
              title: "Value",
              type: "string",
              description: "e.g., '+250%', '3x faster', '10,000+ users'",
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
            },
          ],
          preview: {
            select: {
              title: "metric",
              subtitle: "value",
            },
          },
        },
      ],
    }),
    defineField({
      name: "testimonial",
      title: "Client Testimonial",
      type: "reference",
      group: "results",
      to: [{ type: "testimonial" }],
      description: "Link existing testimonial or add one separately",
    }),

    // SERVICES & TECH
    defineField({
      name: "services",
      title: "Related Services",
      type: "array",
      group: "details",
      of: [
        {
          type: "reference",
          to: [{ type: "service" }],
        },
      ],
      description: "What services were used in this project?",
    }),
    defineField({
      name: "technologies",
      title: "Technologies Used",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description: "Tech stack: React, Node.js, AWS, etc.",
    }),
    defineField({
      name: "industry",
      title: "Industry",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "E-commerce", value: "ecommerce" },
          { title: "Healthcare", value: "healthcare" },
          { title: "Finance", value: "finance" },
          { title: "Education", value: "education" },
          { title: "Real Estate", value: "real-estate" },
          { title: "SaaS", value: "saas" },
          { title: "Media & Entertainment", value: "media" },
          { title: "Food & Beverage", value: "food" },
          { title: "Travel & Tourism", value: "travel" },
          { title: "Other", value: "other" },
        ],
      },
    }),

    // MEDIA & GALLERY
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      group: "media",
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Project Gallery",
      type: "array",
      group: "media",
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
            {
              name: "caption",
              title: "Caption",
              type: "string",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "videoUrl",
      title: "Project Video URL",
      type: "url",
      group: "media",
      description: "YouTube, Vimeo, or direct video URL",
    }),
    defineField({
      name: "liveUrl",
      title: "Live Project URL",
      type: "url",
      group: "media",
      description: "Link to the live website/app",
    }),

    // SEO
    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      group: "seo",
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
          title: "Social Share Image",
          type: "image",
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      client: "client",
      media: "featuredImage",
      featured: "featured",
    },
    prepare({ title, client, media, featured }) {
      return {
        title: featured ? `⭐ ${title}` : title,
        subtitle: client ? `Client: ${client}` : "No client",
        media,
      };
    },
  },
});
