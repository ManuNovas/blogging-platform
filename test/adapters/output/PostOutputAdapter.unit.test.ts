import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PostOutputAdapter } from "../../../src/adapters/output/PostOutputAdapter";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Post } from "../../../src/domain/entities/Post";
import { randomUUID } from "crypto";
import { HttpError } from "../../../src/adapters/errors/HttpError";

describe("PostOutputAdapter", () => {
    const clientMock = mockClient(DynamoDBClient);
    const documentClientMock = mockClient(DynamoDBDocumentClient);
    const post: Post = {
        id: randomUUID(),
        title: "White magic in Final Fantasy",
        content: "Learn basic white magic spells for Final Fantasy.",
        category: "Magic",
        tags: ["White", "Magic", "Final", "Fanatasy"],
        createdAt: new Date().toISOString(),
    };
    let adapter: PostOutputAdapter;

    beforeEach(() => {
        adapter = new PostOutputAdapter("posts-test");
        clientMock.reset();
        documentClientMock.reset();
    });

    describe("create", () => {

        it("should create a new post in dynamodb", async () => {
            documentClientMock.on(PutCommand).resolvesOnce({ Attributes: post });
            await adapter.create(post);
            expect(documentClientMock.commandCalls(PutCommand).length).toBe(1);
        });

        it("should throw a http error if document client rejects the command", async () => {
            documentClientMock.on(PutCommand).rejectsOnce();
            try {
                await adapter.create(post);
            } catch (error) {
                expect(error).toBeInstanceOf(HttpError);
            }
        });

    });

    describe("getAll", () => {

        it("should return all post from repository", () => {
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
            documentClientMock.on(ScanCommand).resolvesOnce({
                Items: posts
            });
            adapter.getAll().then((result) => {
                expect(result).toEqual(posts);
            });
        });

        it("should return filtered post from repository", () => {
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
            documentClientMock.on(ScanCommand).resolvesOnce({
                Items: posts
            });
            adapter.getAll("White").then((result) => {
                expect(result).toEqual(posts);
            });
        });

        it("should throw a http error when dynamodb fails", () => {
            documentClientMock.on(ScanCommand).rejectsOnce(new Error("Timeout connection"));
            adapter.getAll().then((result) => {
                console.log(result);
            }).catch((error) => {
                expect(error).toBeInstanceOf(HttpError);
            });
        });

    });

    describe("getOne", () => {

        it("should return a post from database", () => {
            documentClientMock.on(GetCommand).resolvesOnce({
                Item: post,
            });
            adapter.getOne(post.id).then((result) => {
                expect(result).toEqual(post);
            });
        });

        it("should throw a http error if post is not found", () => {
            documentClientMock.on(GetCommand).rejectsOnce();
            adapter.getOne("1").catch((error) => {
                expect(error).toBeInstanceOf(HttpError);
            });
        });

    });

});
