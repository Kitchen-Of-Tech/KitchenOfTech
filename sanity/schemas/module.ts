import { defineType, defineField } from "sanity";

export const module = defineType({
  name: "module",
  title: "Course Module",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Module Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lessons",
      title: "Lessons",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "lesson" }],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "quiz",
      title: "Module Quiz",
      type: "reference",
      to: [{ type: "quiz" }],
      description: "Optional quiz at the end of this module",
    }),
    defineField({
      name: "assignment",
      title: "Module Assignment",
      type: "reference",
      to: [{ type: "assignment" }],
      description: "Optional assignment for this module",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "order",
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: `Module ${subtitle}`,
      };
    },
  },
});
