import { defineType, defineField } from "sanity";

export const certificate = defineType({
  name: "certificate",
  title: "Certificates",
  type: "document",
  fields: [
    defineField({
      name: "certificateId",
      title: "Certificate ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "studentName",
      title: "Student Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "courseName",
      title: "Course Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "issueDate",
      title: "Issue Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "validUntil",
      title: "Valid Until",
      type: "date",
    }),
    defineField({
      name: "instructor",
      title: "Instructor",
      type: "string",
    }),
    defineField({
      name: "grade",
      title: "Grade/Score",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "studentName",
      subtitle: "courseName",
    },
  },
});
