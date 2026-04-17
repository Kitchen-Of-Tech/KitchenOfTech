import { defineType, defineField } from "sanity";

export const clientLogo = defineType({
  name: "clientLogo",
  title: "Client Logos",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Client Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "website",
      title: "Client Website URL",
      type: "url",
      description: "Optional website link for the client",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: true,
      description: "Show this client logo on the home page slider",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      validation: (Rule) => Rule.min(0),
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "logo",
    },
  },
});
