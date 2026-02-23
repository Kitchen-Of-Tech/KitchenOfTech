import { defineType, defineField } from "sanity";

export const serviceSubcategory = defineType({
  name: "serviceSubcategory",
  title: "Service Subcategories",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Subcategory Title",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., 'Web Development', 'Mobile Apps', 'Logo Design'",
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
      name: "category",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "serviceCategory" }],
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
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
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
      title: "title",
      category: "category.title",
      media: "icon",
      order: "order",
    },
    prepare({ title, category, media, order }) {
      return {
        title: `${order || 0}. ${title}`,
        subtitle: category ? `Category: ${category}` : "No category",
        media,
      };
    },
  },
});
