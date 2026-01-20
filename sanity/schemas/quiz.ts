import { defineType, defineField } from "sanity";

export const quiz = defineType({
  name: "quiz",
  title: "Quiz",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Quiz Title",
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
      name: "passingScore",
      title: "Passing Score (%)",
      type: "number",
      initialValue: 80,
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: "timeLimit",
      title: "Time Limit (minutes)",
      type: "number",
      description: "Leave empty for no time limit",
    }),
    defineField({
      name: "maxAttempts",
      title: "Maximum Attempts",
      type: "number",
      initialValue: 3,
      description: "Number of times student can retake the quiz",
    }),
    defineField({
      name: "showCorrectAnswers",
      title: "Show Correct Answers After Submission",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "randomizeQuestions",
      title: "Randomize Question Order",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "questions",
      title: "Questions",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "question",
              title: "Question",
              type: "text",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "questionType",
              title: "Question Type",
              type: "string",
              options: {
                list: [
                  { title: "Multiple Choice (Single)", value: "single" },
                  { title: "Multiple Choice (Multiple)", value: "multiple" },
                  { title: "True/False", value: "boolean" },
                ],
              },
              initialValue: "single",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "options",
              title: "Options",
              type: "array",
              of: [{ type: "string" }],
              hidden: ({ parent }) => parent?.questionType === "boolean",
            },
            {
              name: "correctAnswer",
              title: "Correct Answer(s)",
              type: "array",
              of: [{ type: "string" }],
              description: "For single choice: select one. For multiple: select all correct options. For True/False: enter 'true' or 'false'",
              validation: (Rule) => Rule.required().min(1),
            },
            {
              name: "explanation",
              title: "Explanation",
              type: "text",
              description: "Explanation shown after answering (optional)",
            },
            {
              name: "points",
              title: "Points",
              type: "number",
              initialValue: 1,
              validation: (Rule) => Rule.required().min(1),
            },
          ],
          preview: {
            select: {
              title: "question",
              subtitle: "questionType",
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "passingScore",
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: `Passing: ${subtitle}%`,
      };
    },
  },
});
