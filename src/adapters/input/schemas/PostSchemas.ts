export const createSchema = {
    type: "object",
    properties: {
        title: {
            type: "string",
            minLength: 1,
            maxLength: 128,
        },
        content: {
            type: "string",
            minLength: 1,
        },
        category: {
            type: "string",
            minLength: 1,
            maxLength: 64,
        },
        tags: {
            type: "array",
            minItems: 1,
            maxItems: 32,
            items: {
                type: "string",
                minLength: 1,
                maxLength: 16,
            },
        },
    },
    required: ["title", "content", "category", "tags"],
};
