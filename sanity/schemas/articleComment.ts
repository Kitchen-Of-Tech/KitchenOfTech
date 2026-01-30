import { defineType, defineField } from "sanity";

export const articleComment = defineType({
  name: "articleComment",
  title: "Article Comments",
  type: "document",
  fields: [
    defineField({
      name: "article",
      title: "Article",
      type: "reference",
      to: [{ type: "article" }],
      validation: (Rule) => Rule.required(),
      description: "Article this comment belongs to",
    }),
    defineField({
      name: "author",
      title: "Comment Author",
      type: "reference",
      to: [{ type: "articleAuthor" }],
      validation: (Rule) => Rule.required(),
      description: "Person who wrote the comment",
    }),
    defineField({
      name: "content",
      title: "Comment Content",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().min(3).max(500),
      description: "Comment text (max 500 characters)",
    }),
    defineField({
      name: "parentComment",
      title: "Parent Comment",
      type: "reference",
      to: [{ type: "articleComment" }],
      description: "For nested replies (optional)",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isEdited",
      title: "Edited",
      type: "boolean",
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: "editedAt",
      title: "Last Edited",
      type: "datetime",
      readOnly: true,
      hidden: ({ document }) => !document?.isEdited,
    }),
    defineField({
      name: "isDeleted",
      title: "Deleted",
      type: "boolean",
      initialValue: false,
      description: "Soft delete flag",
    }),
    defineField({
      name: "deletedReason",
      title: "Deletion Reason",
      type: "string",
      hidden: ({ document }) => !document?.isDeleted,
    }),
  ],
  preview: {
    select: {
      content: "content",
      author: "author.name",
      article: "article.title",
      createdAt: "createdAt",
    },
    prepare({ content, author, article, createdAt }) {
      const preview = content?.substring(0, 60) || "No content";
      const date = createdAt ? new Date(createdAt).toLocaleDateString() : "";
      return {
        title: `${author || "Unknown"}: ${preview}${content?.length > 60 ? "..." : ""}`,
        subtitle: `On "${article || "Unknown Article"}" • ${date}`,
      };
    },
  },
});
