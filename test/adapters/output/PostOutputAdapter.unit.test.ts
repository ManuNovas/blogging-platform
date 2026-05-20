import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PostOutputAdapter } from "../../../src/adapters/output/PostOutputAdapter";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
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
            documentClientMock.on(PutCommand).resolvesOnce({Attributes: post});
            await adapter.create(post);
            expect(documentClientMock.commandCalls(PutCommand).length).toBe(1);
        });

        it("should throw a http error if document client rejects the command", async () => {
            documentClientMock.on(PutCommand).rejectsOnce();
            try{
                await adapter.create(post);
            }catch(error){
                expect(error).toBeInstanceOf(HttpError);
            }
        });

    });

});
