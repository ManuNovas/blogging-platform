import { randomUUID } from "node:crypto";
import { PostInputAdapter } from "../../../src/adapters/input/PostInputAdapter";
import { PostOutputAdapter } from "../../../src/adapters/output/PostOutputAdapter";
import { PostUseCases } from "../../../src/application/use-cases/PostUseCases";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { Post } from "../../../src/domain/entities/Post";
import { HttpError } from "../../../src/adapters/errors/HttpError";

describe("PostInputAdapter", () => {
    let repository: PostOutputAdapter;
    let useCases: PostUseCases;
    let adapter: PostInputAdapter;

    beforeEach(() => {
        repository = new PostOutputAdapter("posts-test");
        useCases = new PostUseCases(repository);
        adapter = new PostInputAdapter(useCases);
    });

    describe("create", () => {

        it("should create a new blog post", async () => {
            const post: Post = {
                id: randomUUID(),
                title: "White magic in Final Fantasy",
                content: "Learn basic white magic spells in Final Fantasy",
                category: "Magic",
                tags: ["White", "Magic", "Final", "Fantasy"],
                createdAt: new Date().toISOString(),
            };
            jest.spyOn(useCases, "create").mockResolvedValueOnce(post);
            const result = await adapter.create({
                body: JSON.stringify({
                    title: post.title,
                    content: post.content,
                    category: post.category,
                    tags: post.tags,
                }),
            } as unknown as APIGatewayProxyEventV2);
            expect(result).toEqual({
                statusCode: 201,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(post),
            });
        });

        it("should return a http error if httpError has thrown", async () => {
            const status = 503;
            const message = "DynamoDB Unavailable";
            jest.spyOn(repository, "create").mockRejectedValueOnce(new HttpError(status, message));
            const result = await adapter.create({
                body: JSON.stringify({
                    title: "White magic in Final Fantasy",
                    content: "Learn basic white magic spells in Final Fantasy",
                    category: "Magic",
                    tags: ["White", "Magic", "Final", "Fantasy"],
                }),
            } as unknown as APIGatewayProxyEventV2);
            expect(result).toEqual({
                statusCode: status,
                body: message,
            });
        });

        it("should return a http error if schema validation fails", async () => {
            const result = await adapter.create({
                body: JSON.stringify({
                    title: "White magic in Final Fantasy",
                    category: "Magic",
                    tags: ["White", "Magic", "Final", "Fantasy"],
                }),
            } as unknown as APIGatewayProxyEventV2);
            expect(result).toEqual({
                statusCode: 400,
                body: "Schema validation failed",
            });
        });

        it("should return a http error if body is undefined", async () => {
            const result = await adapter.create({} as unknown as APIGatewayProxyEventV2);
            expect(result).toEqual({
                statusCode: 400,
                body: "Schema validation failed",
            });
        });

        it("should return a generic http error if Error has thrown", async () => {
            jest.spyOn(useCases, "create").mockRejectedValueOnce(new Error("Division by zero"));
            const result = await adapter.create({
                body: JSON.stringify({
                    title: "White magic in Final Fantasy",
                    content: "Learn basic white magic spells in Final Fantasy",
                    category: "Magic",
                    tags: ["White", "Magic", "Final", "Fantasy"],
                }),
            } as unknown as APIGatewayProxyEventV2);
            expect(result).toEqual({
                statusCode: 500,
                body: "Internal Server Error",
            });
        });

    });

    describe("getAll", () => {

        it("should return all blog posts", () => {
            const posts: Post[] = [
                {
                    id: randomUUID(),
                    title: "White magic in Final Fantasy",
                    content: "Learn basic white magic spells for Final Fantasy.",
                    category: "Magic",
                    tags: ["White", "Magic", "Final", "Fanatasy"],
                    createdAt: new Date().toISOString(),
                },
                {
                    id: randomUUID(),
                    title: "Black magic in Final Fantasy",
                    content: "Learn basic black magic spells for Final Fantasy.",
                    category: "Magic",
                    tags: ["White", "Magic", "Final", "Fanatasy"],
                    createdAt: new Date().toISOString(),
                },
            ];
            jest.spyOn(useCases, "getAll").mockResolvedValueOnce(posts);
            adapter.getAll({} as APIGatewayProxyEventV2).then((result) => {
                expect(result).toEqual({
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(posts),
                });
            });
        });

        it("should return filtered blog posts", () => {
            const posts: Post[] = [
                {
                    id: randomUUID(),
                    title: "White magic in Final Fantasy",
                    content: "Learn basic white magic spells for Final Fantasy.",
                    category: "Magic",
                    tags: ["White", "Magic", "Final", "Fanatasy"],
                    createdAt: new Date().toISOString(),
                },
            ];
            jest.spyOn(useCases, "getAll").mockResolvedValueOnce(posts);
            adapter.getAll({
                queryStringParameters: {
                    term: "White",
                },
            } as unknown as APIGatewayProxyEventV2).then((result) => {
                expect(result).toEqual({
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(posts),
                });
            });
        });

        it("should return an error if http is thrown", () => {
            const statusCode = 503;
            const body = "Tiemout connection";
            jest.spyOn(useCases, "getAll").mockRejectedValueOnce(new HttpError(statusCode, body));
            adapter.getAll({} as APIGatewayProxyEventV2).then((result) => {
                expect(result).toEqual({
                    statusCode,
                    body,
                });
            });
        });

    });

    describe("getOne", () => {

        it("should return a post by id", () => {
            const id = randomUUID();
            const post: Post = {
                id,
                title: "White magic in Final Fantasy",
                content: "Learn basic white magic spells for Final Fantasy.",
                category: "Magic",
                tags: ["White", "Magic", "Final", "Fanatasy"],
                createdAt: new Date().toISOString(),
            };
            jest.spyOn(useCases, "getOne").mockResolvedValueOnce(post);
            adapter.getOne({
                pathParameters: {id},
            } as unknown as APIGatewayProxyEventV2).then((result) => {
                expect(result).toEqual({
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(post),
                });
            });
        });

        it("should return an error if validation fails", () => {
            adapter.getOne({} as unknown as APIGatewayProxyEventV2).then((result) => {
                expect(result).toEqual({
                    statusCode: 400,
                    body: "Schema validation failed",
                });
            });
        });

    });

});
