import { defineType, defineField } from "sanity";

export const articleVote = defineType({
  name: "articleVote",
  title: "Article Votes",
  type: "document",
  fields: [
    defineField({
      name: "article",
      title: "Article",
      type: "reference",
      to: [{ type: "article" }],
      validation: (Rule) => Rule.required(),
      description: "Article being voted on",
    }),
    defineField({
      name: "voter",
      title: "Voter",
      type: "reference",
      to: [{ type: "articleAuthor" }],
      validation: (Rule) => Rule.required(),
      description: "User who cast the vote",
    }),
    defineField({
      name: "voteType",
      title: "Vote Type",
      type: "string",
      options: {
        list: [
          { title: "Upvote", value: "upvote" },
          { title: "Downvote", value: "downvote" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "votedAt",
      title: "Voted At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ipAddress",
      title: "IP Address",
      type: "string",
      description: "For fraud prevention",
    }),
  ],
  preview: {
    select: {
      article: "article.title",
      voter: "voter.name",
      voteType: "voteType",
      votedAt: "votedAt",
    },
    prepare({ article, voter, voteType, votedAt }) {
      const icon = voteType === "upvote" ? "👍" : "👎";
      const date = votedAt ? new Date(votedAt).toLocaleDateString() : "";
      return {
        title: `${icon} ${voter || "Unknown"} voted on "${article || "Unknown Article"}"`,
        subtitle: `${voteType || "unknown"} • ${date}`,
      };
    },
  },
});
