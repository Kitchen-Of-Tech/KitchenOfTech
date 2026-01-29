import { defineType, defineField } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  fields: [
    defineField({
      name: "clientName",
      title: "Client Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Full name of the person giving the testimonial",
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      validation: (Rule) => Rule.required().email(),
      description: "Contact email of the testimonial author",
    }),
    defineField({
      name: "clientCompany",
      title: "Client Company",
      type: "string",
      description: "Company name (optional)",
    }),
    defineField({
      name: "position",
      title: "Position/Job Title",
      type: "string",
      description: "Job title or role (optional)",
    }),
    defineField({
      name: "clientImage",
      title: "Client Photo",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Photo of the person (uploaded by client)",
    }),
    defineField({
      name: "clientLogo",
      title: "Company Logo",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Company logo (optional, added by admin)",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
      initialValue: 5,
      description: "Star rating (1-5)",
    }),
    defineField({
      name: "testimonial",
      title: "Testimonial Message",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().min(50).max(1000),
      description: "The actual testimonial content",
    }),
    defineField({
      name: "projectType",
      title: "Project Type",
      type: "string",
      options: {
        list: [
          { title: "Web Development", value: "web-development" },
          { title: "Mobile Development", value: "mobile-development" },
          { title: "UI/UX Design", value: "ui-ux-design" },
          { title: "Cloud Services", value: "cloud-services" },
          { title: "E-commerce", value: "e-commerce" },
          { title: "Custom Software", value: "custom-software" },
          { title: "Consulting", value: "consulting" },
          { title: "Other", value: "other" },
        ],
      },
      description: "Type of project/service this testimonial is for",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending Review", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
      description: "Approval status of the testimonial",
    }),
    defineField({
      name: "verifiedBadge",
      title: "Verified Badge",
      type: "boolean",
      initialValue: false,
      description: "Show verified badge for authentic testimonials",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
      description: "Feature this testimonial on homepage",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      description: "When the testimonial was submitted",
    }),
    defineField({
      name: "approvedAt",
      title: "Approved At",
      type: "datetime",
      description: "When the testimonial was approved",
    }),
    defineField({
      name: "rejectedAt",
      title: "Rejected At",
      type: "datetime",
      description: "When the testimonial was rejected",
    }),
    defineField({
      name: "linkToken",
      title: "Link Token",
      type: "string",
      description: "Token from testimonial link (if submitted via link)",
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "clientName",
      subtitle: "clientCompany",
      media: "clientImage",
      rating: "rating",
      status: "status",
    },
    prepare({ title, subtitle, media, rating, status }) {
      return {
        title: title,
        subtitle: `${subtitle || "No Company"} • ${rating}★ • ${status}`,
        media: media,
      };
    },
  },
  orderings: [
    {
      title: "Submitted Date, Newest",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
    {
      title: "Rating, Highest",
      name: "ratingDesc",
      by: [{ field: "rating", direction: "desc" }],
    },
    {
      title: "Status",
      name: "status",
      by: [{ field: "status", direction: "asc" }],
    },
  ],
});
