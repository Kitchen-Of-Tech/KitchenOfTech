import { defineType, defineField } from "sanity";

export const lesson = defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Lesson Title",
      type: "string",
      validation: (Rule) => Rule.required(),
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
      name: "videoUrl",
      title: "YouTube Video URL",
      type: "url",
      description: "Unlisted or private YouTube video URL",
      validation: (Rule) => Rule.required().uri({
        scheme: ['http', 'https'],
      }),
    }),
    defineField({
      name: "videoId",
      title: "YouTube Video ID",
      type: "string",
      description: "Automatically extracted from URL (e.g., dQw4w9WgXcQ)",
    }),
    defineField({
      name: "duration",
      title: "Duration (minutes)",
      type: "number",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isFree",
      title: "Free Preview",
      type: "boolean",
      initialValue: false,
      description: "Allow non-enrolled students to watch this lesson",
    }),
    defineField({
      name: "transcript",
      title: "Transcript",
      type: "text",
      rows: 10,
      description: "Video transcript/subtitles (optional)",
    }),
    defineField({
      name: "resources",
      title: "Downloadable Resources",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Resource Title", validation: (Rule) => Rule.required() },
            { name: "file", type: "file", title: "File" },
            { name: "url", type: "url", title: "External URL" },
            { name: "description", type: "text", title: "Description" },
          ],
        },
      ],
    }),
    defineField({
      name: "notes",
      title: "Lesson Notes",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Code", value: "code" },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
        },
        {
          type: "code",
          options: {
            language: "javascript",
            languageAlternatives: [
              { title: "JavaScript", value: "javascript" },
              { title: "TypeScript", value: "typescript" },
              { title: "Python", value: "python" },
              { title: "HTML", value: "html" },
              { title: "CSS", value: "css" },
              { title: "JSON", value: "json" },
            ],
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "duration",
      media: "isFree",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: `${subtitle} min ${media ? "• FREE" : ""}`,
      };
    },
  },
});
