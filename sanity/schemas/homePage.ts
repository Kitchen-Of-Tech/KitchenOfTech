import { defineType, defineField } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "heroSection",
      title: "Hero Section",
      type: "object",
      fields: [
        {
          name: "title",
          title: "Hero Title",
          type: "string",
          description: "Main headline (e.g., 'Transform Your Digital Presence with Kitchen Of Tech')",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "subtitle",
          title: "Hero Subtitle",
          type: "text",
          rows: 3,
          description: "Compelling description below the title",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "primaryButtonText",
          title: "Primary Button Text",
          type: "string",
          initialValue: "Explore Our Services",
        },
        {
          name: "primaryButtonLink",
          title: "Primary Button Link",
          type: "string",
          initialValue: "/services",
        },
        {
          name: "secondaryButtonText",
          title: "Secondary Button Text",
          type: "string",
          initialValue: "Schedule a Meeting",
        },
        {
          name: "secondaryButtonLink",
          title: "Secondary Button Link",
          type: "string",
          initialValue: "/meeting",
        },
      ],
    }),
    defineField({
      name: "serviceTags",
      title: "Service Tags",
      type: "array",
      description: "Quick service tags displayed below hero title (e.g., 'Web Development', 'AI Solutions')",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "tag",
              title: "Tag Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "order",
              title: "Display Order",
              type: "number",
              initialValue: 0,
            },
          ],
          preview: {
            select: {
              title: "tag",
              subtitle: "order",
            },
            prepare({ title, subtitle }) {
              return {
                title: title,
                subtitle: `Order: ${subtitle}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "clientLogoSection",
      title: "Client Logo Section",
      type: "object",
      fields: [
        {
          name: "enabled",
          title: "Show Client Logos",
          type: "boolean",
          initialValue: true,
        },
        {
          name: "title",
          title: "Section Title",
          type: "string",
          initialValue: "Trusted by Industry Leaders",
        },
        {
          name: "subtitle",
          title: "Section Subtitle",
          type: "string",
          initialValue: "Join hundreds of satisfied clients worldwide",
        },
      ],
    }),
    defineField({
      name: "stats",
      title: "Statistics Section",
      type: "object",
      description: "Key numbers to showcase (optional)",
      fields: [
        {
          name: "enabled",
          title: "Show Statistics",
          type: "boolean",
          initialValue: false,
        },
        {
          name: "items",
          title: "Stats Items",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "number",
                  title: "Number",
                  type: "string",
                  description: "e.g., '500+', '10K', '99%'",
                },
                {
                  name: "label",
                  title: "Label",
                  type: "string",
                  description: "e.g., 'Projects Completed', 'Happy Clients'",
                },
                {
                  name: "icon",
                  title: "Icon",
                  type: "string",
                  options: {
                    list: [
                      { title: "Users", value: "users" },
                      { title: "Briefcase", value: "briefcase" },
                      { title: "Star", value: "star" },
                      { title: "Award", value: "award" },
                      { title: "Target", value: "target" },
                      { title: "Zap", value: "zap" },
                    ],
                  },
                },
              ],
              preview: {
                select: {
                  title: "number",
                  subtitle: "label",
                },
              },
            },
          ],
        },
      ],
    }),
    defineField({
      name: "featuredSection",
      title: "Featured Section",
      type: "object",
      description: "Additional content section (optional)",
      fields: [
        {
          name: "enabled",
          title: "Show Featured Section",
          type: "boolean",
          initialValue: false,
        },
        {
          name: "title",
          title: "Section Title",
          type: "string",
        },
        {
          name: "description",
          title: "Description",
          type: "text",
          rows: 4,
        },
        {
          name: "image",
          title: "Featured Image",
          type: "image",
          options: {
            hotspot: true,
          },
        },
        {
          name: "buttonText",
          title: "Button Text",
          type: "string",
        },
        {
          name: "buttonLink",
          title: "Button Link",
          type: "string",
        },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      fields: [
        {
          name: "title",
          title: "Page Title",
          type: "string",
          description: "Browser tab title",
        },
        {
          name: "description",
          title: "Meta Description",
          type: "text",
          rows: 3,
        },
        {
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "string" }],
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
    prepare() {
      return {
        title: "Home Page Settings",
      };
    },
  },
});
