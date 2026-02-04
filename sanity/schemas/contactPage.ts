import { defineType, defineField } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "heroSection",
      title: "Hero Section",
      type: "object",
      fields: [
        {
          name: "badge",
          title: "Badge Text",
          type: "string",
          initialValue: "Get In Touch",
        },
        {
          name: "title",
          title: "Title",
          type: "string",
          initialValue: "Let's Start a Conversation",
        },
        {
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
        },
      ],
    }),
    defineField({
      name: "contactInfo",
      title: "Contact Information Cards",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Email", value: "mail" },
                  { title: "Phone", value: "phone" },
                  { title: "Location", value: "mapPin" },
                  { title: "Clock", value: "clock" },
                ],
              },
            },
            {
              name: "title",
              title: "Title",
              type: "string",
            },
            {
              name: "value",
              title: "Value",
              type: "string",
            },
            {
              name: "link",
              title: "Link",
              type: "string",
              description: "Optional link (e.g., mailto:, tel:, or URL)",
            },
            {
              name: "description",
              title: "Description",
              type: "string",
            },
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "value",
            },
          },
        },
      ],
    }),
    defineField({
      name: "formSettings",
      title: "Contact Form Settings",
      type: "object",
      fields: [
        {
          name: "title",
          title: "Form Title",
          type: "string",
          initialValue: "Send us a Message",
        },
        {
          name: "description",
          title: "Form Description",
          type: "string",
        },
        {
          name: "successMessage",
          title: "Success Message",
          type: "text",
          rows: 2,
        },
        {
          name: "submitButtonText",
          title: "Submit Button Text",
          type: "string",
          initialValue: "Send Message",
        },
      ],
    }),
    defineField({
      name: "whyChooseUs",
      title: "Why Choose Us Section",
      type: "object",
      fields: [
        {
          name: "title",
          title: "Title",
          type: "string",
          initialValue: "Why Choose Us?",
        },
        {
          name: "items",
          title: "Items",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "title",
                  title: "Title",
                  type: "string",
                },
                {
                  name: "description",
                  title: "Description",
                  type: "string",
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: "socialLinks",
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
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "Facebook", value: "facebook" },
                  { title: "Twitter", value: "twitter" },
                  { title: "Instagram", value: "instagram" },
                  { title: "GitHub", value: "github" },
                  { title: "YouTube", value: "youtube" },
                ],
              },
            },
            {
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
            },
            {
              name: "label",
              title: "Label",
              type: "string",
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
      name: "quote",
      title: "Inspirational Quote",
      type: "object",
      fields: [
        {
          name: "text",
          title: "Quote Text",
          type: "text",
          rows: 3,
        },
        {
          name: "author",
          title: "Author",
          type: "string",
        },
      ],
    }),
    defineField({
      name: "mapSettings",
      title: "Map Settings",
      type: "object",
      fields: [
        {
          name: "enabled",
          title: "Show Map",
          type: "boolean",
          initialValue: true,
        },
        {
          name: "embedUrl",
          title: "Google Maps Embed URL",
          type: "url",
          description: "Paste the iframe src URL from Google Maps embed code",
        },
        {
          name: "placeholderText",
          title: "Placeholder Text",
          type: "string",
          description: "Text to show if map is not configured",
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
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Contact Page Settings",
      };
    },
  },
});
