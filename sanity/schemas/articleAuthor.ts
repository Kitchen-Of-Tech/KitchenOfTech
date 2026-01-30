import { defineType, defineField } from "sanity";

export const articleAuthor = defineType({
  name: "articleAuthor",
  title: "Article Authors",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Author Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Full name of the author",
    }),
    defineField({
      name: "facebookId",
      title: "Facebook ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Unique Facebook user ID for authentication",
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      validation: (Rule) => Rule.email(),
      description: "Author's email address",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      description: "Author's contact phone number",
    }),
    defineField({
      name: "profileImage",
      title: "Profile Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Author's profile photo from Facebook",
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(300),
      description: "Short author bio",
    }),
    defineField({
      name: "joinedAt",
      title: "Joined Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isActive",
      title: "Active Status",
      type: "boolean",
      initialValue: true,
      description: "Can this author submit articles?",
    }),
    defineField({
      name: "isBanned",
      title: "Banned",
      type: "boolean",
      initialValue: false,
      description: "Is this author banned from posting?",
    }),
    defineField({
      name: "bannedReason",
      title: "Ban Reason",
      type: "text",
      rows: 2,
      hidden: ({ document }) => !document?.isBanned,
    }),
    // Stats (calculated fields)
    defineField({
      name: "totalArticles",
      title: "Total Articles",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Total number of published articles",
    }),
    defineField({
      name: "totalUpvotes",
      title: "Total Upvotes",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Total upvotes across all articles",
    }),
    defineField({
      name: "totalDownvotes",
      title: "Total Downvotes",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Total downvotes across all articles",
    }),
    defineField({
      name: "totalViews",
      title: "Total Views",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Total article views",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      media: "profileImage",
      articles: "totalArticles",
      upvotes: "totalUpvotes",
    },
    prepare({ title, subtitle, media, articles, upvotes }) {
      return {
        title: title || "Unknown Author",
        subtitle: `${subtitle || "No email"} • ${articles || 0} articles • ${upvotes || 0} upvotes`,
        media,
      };
    },
  },
});
