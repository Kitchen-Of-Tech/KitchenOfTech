import { defineType, defineField } from "sanity";

export const serviceCategory = defineType({
  name: "serviceCategory",
  title: "Service Categories",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Category Title",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., 'Development', 'Design', 'Marketing'",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "icon",
      title: "Icon/Image",
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
      name: "color",
      title: "Brand Color",
      type: "color",
      description: "Used for category theme and accents",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "featured",
      title: "Featured Category",
      type: "boolean",
      initialValue: false,
      description: "Show on homepage",
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
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "icon",
      order: "order",
    },
    prepare({ title, subtitle, media, order }) {
      return {
        title: `${order || 0}. ${title}`,
        subtitle,
        media,
      };
    },
  },
});
