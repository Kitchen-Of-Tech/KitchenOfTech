import { defineType, defineField } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  fields: [
    defineField({
      name: "clientName",
      title: "Client Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clientCompany",
      title: "Client Company",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clientLogo",
      title: "Client Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: "testimonial",
      title: "Testimonial",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "projectType",
      title: "Project Type",
      type: "string",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "clientName",
      subtitle: "clientCompany",
      media: "clientLogo",
    },
  },
});
