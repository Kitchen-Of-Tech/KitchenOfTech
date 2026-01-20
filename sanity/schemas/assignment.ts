import { defineType, defineField } from "sanity";

export const assignment = defineType({
  name: "assignment",
  title: "Assignment",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Assignment Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
        },
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "instructions",
      title: "Instructions",
      type: "text",
      rows: 5,
      description: "Clear instructions for students on how to complete and submit",
    }),
    defineField({
      name: "facebookGroupUrl",
      title: "Facebook Group URL",
      type: "url",
      description: "Link to the Facebook group where students should post their work",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dueDate",
      title: "Due Date",
      type: "datetime",
      description: "Optional deadline for submission",
    }),
    defineField({
      name: "resources",
      title: "Resources",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Resource Title" },
            { name: "url", type: "url", title: "Resource URL" },
            { name: "type", type: "string", title: "Type", options: {
              list: ["Article", "Video", "Tool", "Template", "Other"]
            }},
          ],
        },
      ],
    }),
    defineField({
      name: "maxScore",
      title: "Maximum Score",
      type: "number",
      initialValue: 100,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "autoComplete",
      title: "Auto Complete on Submission",
      type: "boolean",
      initialValue: true,
      description: "Automatically mark as complete when student submits Facebook post link",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "dueDate",
    },
  },
});
