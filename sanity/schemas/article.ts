import { defineType, defineField } from "sanity";

export const article = defineType({
  name: "article",
  title: "Articles",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Article Title",
      type: "string",
      validation: (Rule) => Rule.required().min(10),
      description: "Compelling title for the article",
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
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "articleAuthor" }],
      validation: (Rule) => Rule.required(),
      description: "Article author",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
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
      description: "Main article image (optional)",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary for article cards (auto-generated if empty)",
    }),
    defineField({
      name: "content",
      title: "Article Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H1", value: "h1" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
              { title: "Underline", value: "underline" },
              { title: "Strike", value: "strike-through" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative text",
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
          ],
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      validation: (Rule) => Rule.max(10),
      description: "Keywords for article categorization (max 10)",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Web Development", value: "web-development" },
          { title: "Mobile Development", value: "mobile-development" },
          { title: "AI & Machine Learning", value: "ai-ml" },
          { title: "Cloud Computing", value: "cloud-computing" },
          { title: "DevOps", value: "devops" },
          { title: "UI/UX Design", value: "ui-ux" },
          { title: "Cybersecurity", value: "cybersecurity" },
          { title: "Data Science", value: "data-science" },
          { title: "Blockchain", value: "blockchain" },
          { title: "General Tech", value: "general-tech" },
        ],
      },
      description: "Main category for filtering",
    }),
    defineField({
      name: "status",
      title: "Publication Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "published",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Last Updated",
      type: "datetime",
      readOnly: true,
    }),
    // Engagement metrics
    defineField({
      name: "upvotes",
      title: "Upvotes",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Total upvotes received",
    }),
    defineField({
      name: "downvotes",
      title: "Downvotes",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Total downvotes received",
    }),
    defineField({
      name: "views",
      title: "View Count",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Total article views",
    }),
    defineField({
      name: "commentCount",
      title: "Comment Count",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Total comments",
    }),
    defineField({
      name: "featured",
      title: "Featured Article",
      type: "boolean",
      initialValue: false,
      description: "Display in featured section?",
    }),
    defineField({
      name: "readingTime",
      title: "Reading Time (minutes)",
      type: "number",
      description: "Estimated reading time",
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "coverImage",
      status: "status",
      upvotes: "upvotes",
      views: "views",
    },
    prepare({ title, author, media, status, upvotes, views }) {
      return {
        title: title || "Untitled Article",
        subtitle: `${author || "Unknown Author"} • ${status || "draft"} • ↑${upvotes || 0} • 👁${views || 0}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Trending (Upvotes)",
      name: "trendingDesc",
      by: [{ field: "upvotes", direction: "desc" }],
    },
    {
      title: "Most Viewed",
      name: "viewsDesc",
      by: [{ field: "views", direction: "desc" }],
    },
    {
      title: "Newest First",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
