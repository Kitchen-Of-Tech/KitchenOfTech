import { defineType, defineField } from "sanity";

export const navbar = defineType({
  name: "navbar",
  title: "Navigation Bar",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Navigation Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "href",
              title: "Link",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "order",
              title: "Order",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "ctaButton",
      title: "CTA Button",
      type: "object",
      fields: [
        {
          name: "label",
          title: "Label",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "href",
          title: "Link",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: "dropdownItems",
      title: "Dropdown Items (Other)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "items",
              title: "Sub Items",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    {
                      name: "label",
                      title: "Label",
                      type: "string",
                    },
                    {
                      name: "href",
                      title: "Link",
                      type: "string",
                    },
                    {
                      name: "order",
                      title: "Order",
                      type: "number",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
});
