import { defineField, defineType } from "sanity";

export const pageType = defineType({
    type: "document",
    name: "page",
    title: "Page",
    preview: {
        select: {
            title: "page"
        }
    },
    fields: [
        defineField({
            type: "string",
            name: "page",
            options: {
                list: [
                    { title: "Home", value: "home" },
                    { title: "About", value: "about" },
                ]
            },
            hidden: true
        }),
        defineField({
            type: "string",
            name: "heading",
            readOnly: true,
        }),
        defineField({
            type: "string",
            name: "subheading"
        }),
    ]
})
