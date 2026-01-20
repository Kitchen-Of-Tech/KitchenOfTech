import { defineType, defineField } from "sanity";

export const course = defineType({
  name: "course",
  title: "Courses",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info" },
    { name: "content", title: "Content" },
    { name: "pricing", title: "Pricing" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // BASIC INFO
    defineField({
      name: "title",
      title: "Course Title",
      type: "string",
      group: "basic",
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basic",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      group: "basic",
      description: "Short tagline for the course",
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      group: "basic",
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      group: "basic",
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
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image",
      type: "image",
      group: "basic",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "promoVideo",
      title: "Promo Video URL",
      type: "url",
      group: "basic",
      description: "YouTube URL for course preview/promo video",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "Web Development", value: "web-development" },
          { title: "Mobile Development", value: "mobile-development" },
          { title: "UI/UX Design", value: "ui-ux-design" },
          { title: "Data Science", value: "data-science" },
          { title: "Machine Learning", value: "machine-learning" },
          { title: "Digital Marketing", value: "digital-marketing" },
          { title: "Business", value: "business" },
          { title: "Cloud Computing", value: "cloud-computing" },
          { title: "Cybersecurity", value: "cybersecurity" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "level",
      title: "Difficulty Level",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced", value: "advanced" },
          { title: "All Levels", value: "all-levels" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      group: "basic",
      initialValue: "English",
      options: {
        list: [
          { title: "English", value: "English" },
          { title: "Bengali", value: "Bengali" },
          { title: "Hindi", value: "Hindi" },
        ],
      },
    }),
    defineField({
      name: "instructor",
      title: "Instructor",
      type: "reference",
      group: "basic",
      to: [{ type: "instructor" }],
      validation: (Rule) => Rule.required(),
    }),
    
    // CONTENT
    defineField({
      name: "modules",
      title: "Course Modules",
      type: "array",
      group: "content",
      of: [
        {
          type: "reference",
          to: [{ type: "module" }],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "learningOutcomes",
      title: "What You'll Learn",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.required().min(3).max(10),
    }),
    defineField({
      name: "requirements",
      title: "Requirements/Prerequisites",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "targetAudience",
      title: "Who This Course Is For",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "skills",
      title: "Skills You'll Gain",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      description: "Tags/keywords for skills covered",
    }),
    
    // PRICING
    defineField({
      name: "price",
      title: "Price (USD)",
      type: "number",
      group: "pricing",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Original Price (for discount display)",
      type: "number",
      group: "pricing",
      description: "Show as crossed-out price if different from actual price",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      group: "pricing",
      initialValue: "USD",
      options: {
        list: ["USD", "BDT", "EUR", "GBP", "INR"],
      },
    }),
    defineField({
      name: "defaultCoupon",
      title: "Default Coupon Code",
      type: "string",
      group: "pricing",
      description: "Coupon code for free courses (e.g., FREE100 for 100% off)",
    }),
    defineField({
      name: "isFree",
      title: "Is Free Course",
      type: "boolean",
      group: "pricing",
      initialValue: false,
      description: "Mark as free (will show FREE badge)",
    }),
    
    // STATUS & PUBLISHING
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "draft",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured Course",
      type: "boolean",
      group: "basic",
      initialValue: false,
      description: "Show in featured section",
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      group: "basic",
    }),
    
    // SEO
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      group: "seo",
      rows: 3,
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "seoKeywords",
      title: "SEO Keywords",
      type: "array",
      group: "seo",
      of: [{ type: "string" }],
    }),
    
    // STATS (Auto-calculated or manually entered)
    defineField({
      name: "totalDuration",
      title: "Total Duration (hours)",
      type: "number",
      description: "Auto-calculated from lessons or manually entered",
    }),
    defineField({
      name: "totalLessons",
      title: "Total Lessons",
      type: "number",
      description: "Auto-calculated from modules",
    }),
    defineField({
      name: "totalEnrollments",
      title: "Total Enrollments",
      type: "number",
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "averageRating",
      title: "Average Rating",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "totalReviews",
      title: "Total Reviews",
      type: "number",
      initialValue: 0,
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "thumbnail",
      status: "status",
      isFree: "isFree",
    },
    prepare({ title, subtitle, media, status, isFree }) {
      return {
        title,
        subtitle: `${subtitle} • ${status} ${isFree ? "• FREE" : ""}`,
        media,
      };
    },
  },
});
