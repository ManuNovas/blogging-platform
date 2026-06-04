export const storeSchema = {
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

export const getAllSchema = {
    type: "object",
    properties: {
        term: {
            type: "string",
            nullable: true,
            maxLength: 128,
        },
    },
};

export const idSchema = {
    type: "object",
    properties: {
        id: {
            type: "string",
            minLength: 1,
            maxLength: 128,
        },
    },
};
