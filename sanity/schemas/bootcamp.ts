import { defineType, defineField } from "sanity";

export const bootcamp = defineType({
  name: "bootcamp",
  title: "Bootcamps",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info" },
    { name: "details", title: "Details" },
    { name: "banner", title: "Banner & Media" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    // BASIC INFO
    defineField({
      name: "name",
      title: "Bootcamp Name",
      type: "string",
      group: "basic",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basic",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      group: "basic",
      rows: 3,
      validation: (Rule) => Rule.required(),
      description: "Brief summary for listings",
    }),

    // DETAILS
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      group: "details",
      of: [{ type: "block" }],
      description: "Comprehensive bootcamp description",
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      group: "details",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
      group: "details",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Duration (in weeks)",
      type: "number",
      group: "details",
      description: "Total duration in weeks",
    }),
    defineField({
      name: "location",
      title: "Location/Format",
      type: "string",
      group: "details",
      description: "e.g., Online, Offline, Hybrid",
      options: {
        list: [
          { title: "Online", value: "online" },
          { title: "Offline", value: "offline" },
          { title: "Hybrid", value: "hybrid" },
        ],
      },
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced", value: "advanced" },
        ],
      },
    }),
    defineField({
      name: "maxParticipants",
      title: "Maximum Participants",
      type: "number",
      group: "details",
      description: "Maximum number of participants allowed",
    }),
    defineField({
      name: "registeredParticipants",
      title: "Registered Participants",
      type: "number",
      group: "details",
      initialValue: 0,
      readOnly: true,
      description: "Auto-updated based on registrations",
    }),
    defineField({
      name: "technologies",
      title: "Technologies Covered",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
      description: "Technologies taught in this bootcamp",
    }),
    defineField({
      name: "syllabus",
      title: "Syllabus",
      type: "array",
      group: "details",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "week",
              title: "Week",
              type: "number",
            },
            {
              name: "title",
              title: "Week Title",
              type: "string",
            },
            {
              name: "topics",
              title: "Topics Covered",
              type: "array",
              of: [{ type: "string" }],
            },
          ],
        },
      ],
    }),
    defineField({
      name: "prerequisites",
      title: "Prerequisites",
      type: "text",
      group: "details",
      rows: 3,
      description: "Prerequisites needed for the bootcamp",
    }),
    defineField({
      name: "outcomes",
      title: "Learning Outcomes",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
      description: "What participants will learn",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      group: "details",
      description: "Registration fee in currency (0 for free)",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "USD", value: "USD" },
          { title: "BDT", value: "BDT" },
          { title: "INR", value: "INR" },
          { title: "EUR", value: "EUR" },
        ],
      },
      initialValue: "USD",
    }),

    // BANNER & MEDIA
    defineField({
      name: "bannerImage",
      title: "Banner Image",
      type: "image",
      group: "banner",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
      description: "Main banner image for the bootcamp",
    }),
    defineField({
      name: "instructors",
      title: "Instructors",
      type: "array",
      group: "banner",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Name",
              type: "string",
            },
            {
              name: "title",
              title: "Title/Role",
              type: "string",
            },
            {
              name: "bio",
              title: "Bio",
              type: "text",
              rows: 2,
            },
            {
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "specialization",
              title: "Specialization",
              type: "string",
            },
          ],
        },
      ],
    }),

    // SETTINGS
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Planning", value: "planning" },
          { title: "Open for Registration", value: "open" },
          { title: "Running", value: "running" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "planning",
    }),
    defineField({
      name: "registrationDeadline",
      title: "Registration Deadline",
      type: "datetime",
      group: "settings",
    }),
    defineField({
      name: "registrationOpenDate",
      title: "Registration Opens On",
      type: "datetime",
      group: "settings",
      description: "When the registration form becomes available. Leave blank to open immediately.",
    }),
    defineField({
      name: "registrationCloseDate",
      title: "Registration Closes On",
      type: "datetime",
      group: "settings",
      description: "When the registration form closes. Leave blank to keep open until deadline.",
    }),
    defineField({
      name: "googleFormUrl",
      title: "Google Form URL",
      type: "url",
      group: "settings",
      description: "Optional: Link to an external Google Form for registration. If set, form submissions redirect here instead.",
    }),
    defineField({
      name: "facebookGroupUrl",
      title: "Facebook Group URL",
      type: "url",
      group: "settings",
      description: "Link to the official Facebook group for this bootcamp. Shown to participants after successful registration.",
    }),
    defineField({
      name: "featured",
      title: "Featured Bootcamp",
      type: "boolean",
      group: "settings",
      initialValue: false,
    }),
    defineField({
      name: "certificateIncluded",
      title: "Certificate Included",
      type: "boolean",
      group: "settings",
      initialValue: true,
    }),
    defineField({
      name: "googleSheets",
      title: "Google Sheets Configuration",
      type: "object",
      group: "settings",
      description: "Configure Google Sheets for registration data storage",
      fields: [
        {
          name: "spreadsheetId",
          title: "Spreadsheet ID",
          type: "string",
          validation: (Rule) => Rule.required().min(10),
          description: "Google Sheets spreadsheet ID from the URL",
        },
        {
          name: "apiKey",
          title: "Google Sheets API Key",
          type: "string",
          validation: (Rule) => Rule.required().min(10),
          description: "API key with Google Sheets access",
        },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      group: "settings",
      fields: [
        {
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 2,
        },
        {
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "string" }],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      status: "status",
      startDate: "startDate",
      media: "bannerImage",
    },
    prepare({ title, status, startDate, media }) {
      const start = startDate ? new Date(startDate).toLocaleDateString() : "TBD";
      return {
        title,
        subtitle: `${status?.toUpperCase()} • Starts: ${start}`,
        media,
      };
    },
  },
});
