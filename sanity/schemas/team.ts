import { defineType, defineField } from "sanity";
import { Users, Award, Briefcase, Link as LinkIcon } from "lucide-react";

export const team = defineType({
  name: "team",
  title: "Team Members",
  type: "document",
  icon: Users,
  groups: [
    {
      name: "basic",
      title: "Basic Info",
      icon: Users,
    },
    {
      name: "details",
      title: "Detailed Info",
      icon: Briefcase,
    },
    {
      name: "skills",
      title: "Skills & Expertise",
      icon: Award,
    },
    {
      name: "portfolio",
      title: "Portfolio & Links",
      icon: LinkIcon,
    },
  ],
  fields: [
    // BASIC INFO
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "basic",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      group: "basic",
    }),
    defineField({
      name: "designation",
      title: "Designation/Title",
      type: "string",
      description: "e.g., Senior Full-Stack Developer, UI/UX Designer",
      validation: (Rule) => Rule.required(),
      group: "basic",
    }),
    defineField({
      name: "image",
      title: "Profile Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
      group: "basic",
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      description: "Brief description for team card (2-3 lines)",
      rows: 3,
      validation: (Rule) => Rule.required(),
      group: "basic",
    }),
    defineField({
      name: "available",
      title: "Available for Hire",
      type: "boolean",
      description: "Toggle to show/hide availability status",
      initialValue: true,
      group: "basic",
    }),
    defineField({
      name: "featured",
      title: "Featured Member",
      type: "boolean",
      description: "Show this member prominently",
      initialValue: false,
      group: "basic",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first",
      validation: (Rule) => Rule.min(0),
      initialValue: 0,
      group: "basic",
    }),

    // DETAILED INFO
    defineField({
      name: "fullDescription",
      title: "Full Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Comprehensive description for detail page",
      group: "details",
    }),
    defineField({
      name: "yearsOfExperience",
      title: "Years of Experience",
      type: "number",
      validation: (Rule) => Rule.min(0).max(50),
      group: "details",
    }),
    defineField({
      name: "experiences",
      title: "Work Experience",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "company",
              title: "Company Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "position",
              title: "Position/Role",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "duration",
              title: "Duration",
              type: "string",
              description: "e.g., Jan 2020 - Present",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
            },
            {
              name: "current",
              title: "Current Position",
              type: "boolean",
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: "position",
              subtitle: "company",
            },
          },
        },
      ],
      group: "details",
    }),
    defineField({
      name: "education",
      title: "Education",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "degree",
              title: "Degree",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "institution",
              title: "Institution",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "year",
              title: "Year/Duration",
              type: "string",
            },
          ],
        },
      ],
      group: "details",
    }),

    // SKILLS & EXPERTISE
    defineField({
      name: "primarySkills",
      title: "Primary Skills",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "skill",
              title: "Skill Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "proficiency",
              title: "Proficiency Level",
              type: "number",
              description: "1-100 scale",
              validation: (Rule) => Rule.required().min(1).max(100),
            },
            {
              name: "category",
              title: "Category",
              type: "string",
              options: {
                list: [
                  { title: "Frontend", value: "frontend" },
                  { title: "Backend", value: "backend" },
                  { title: "Design", value: "design" },
                  { title: "DevOps", value: "devops" },
                  { title: "Marketing", value: "marketing" },
                  { title: "Management", value: "management" },
                  { title: "Other", value: "other" },
                ],
              },
            },
          ],
          preview: {
            select: {
              title: "skill",
              subtitle: "proficiency",
            },
            prepare({ title, subtitle }) {
              return {
                title,
                subtitle: `${subtitle}% proficiency`,
              };
            },
          },
        },
      ],
      group: "skills",
    }),
    defineField({
      name: "technologies",
      title: "Technologies & Tools",
      type: "array",
      of: [{ type: "string" }],
      description: "List of technologies, frameworks, and tools",
      group: "skills",
    }),
    defineField({
      name: "certifications",
      title: "Certifications",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Certification Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "issuer",
              title: "Issuing Organization",
              type: "string",
            },
            {
              name: "year",
              title: "Year Obtained",
              type: "string",
            },
            {
              name: "credentialUrl",
              title: "Credential URL",
              type: "url",
            },
          ],
        },
      ],
      group: "skills",
    }),
    defineField({
      name: "passions",
      title: "Passions & Interests",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "passion",
              title: "Passion/Interest",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
            },
            {
              name: "icon",
              title: "Icon",
              type: "image",
              options: {
                hotspot: true,
              },
            },
          ],
          preview: {
            select: {
              title: "passion",
              media: "icon",
            },
          },
        },
      ],
      group: "skills",
    }),

    // PORTFOLIO & LINKS
    defineField({
      name: "portfolioItems",
      title: "Portfolio Projects",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "title",
              title: "Project Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
            },
            {
              name: "image",
              title: "Project Image",
              type: "image",
              options: {
                hotspot: true,
              },
            },
            {
              name: "url",
              title: "Project URL",
              type: "url",
            },
            {
              name: "technologies",
              title: "Technologies Used",
              type: "array",
              of: [{ type: "string" }],
            },
            {
              name: "featured",
              title: "Featured Project",
              type: "boolean",
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: "title",
              media: "image",
            },
          },
        },
      ],
      group: "portfolio",
    }),
    defineField({
      name: "externalPortfolioLinks",
      title: "External Portfolio Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "GitHub", value: "github" },
                  { title: "Dribbble", value: "dribbble" },
                  { title: "Behance", value: "behance" },
                  { title: "CodePen", value: "codepen" },
                  { title: "Portfolio Website", value: "website" },
                  { title: "Other", value: "other" },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "label",
              title: "Custom Label",
              type: "string",
              description: "Optional custom label for 'Other' platform",
            },
          ],
        },
      ],
      group: "portfolio",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Media Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "Twitter/X", value: "twitter" },
                  { title: "GitHub", value: "github" },
                  { title: "Dribbble", value: "dribbble" },
                  { title: "Behance", value: "behance" },
                  { title: "Instagram", value: "instagram" },
                  { title: "YouTube", value: "youtube" },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
      group: "portfolio",
    }),

    // SEO
    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          description: "Override default title for SEO",
        },
        {
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "designation",
      media: "image",
      available: "available",
    },
    prepare({ title, subtitle, media, available }) {
      return {
        title,
        subtitle: `${subtitle}${available ? " • Available" : " • Not Available"}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
