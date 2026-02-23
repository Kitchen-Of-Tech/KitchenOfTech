import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Site Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "siteDescription",
      title: "Site Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Site Logo",
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
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      description: "32x32 or 64x64 px",
    }),
    defineField({
      name: "email",
      title: "Contact Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Contact Phone",
      type: "string",
    }),
    defineField({
      name: "address",
      title: "Physical Address",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "socialMedia",
      title: "Social Media Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "Facebook", value: "facebook" },
                  { title: "Twitter", value: "twitter" },
                  { title: "Instagram", value: "instagram" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "YouTube", value: "youtube" },
                  { title: "GitHub", value: "github" },
                  { title: "TikTok", value: "tiktok" },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
            },
          ],
          preview: {
            select: {
              title: "platform",
              subtitle: "url",
            },
          },
        },
      ],
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
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 2,
        },
        {
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "string" }],
        },
        {
          name: "ogImage",
          title: "Open Graph Image",
          type: "image",
          description: "1200x630px recommended",
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "siteName",
      subtitle: "siteDescription",
      media: "logo",
    },
  },
});
