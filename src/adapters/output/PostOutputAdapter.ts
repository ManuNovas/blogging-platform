import { PostOutputPort } from "../../application/ports/output/PostOutputPort";
import { Post } from "../../domain/entities/Post";
import { DynamoDBDocumentClient, PutCommand, PutCommandInput, ScanCommandInput, ScanCommand, GetCommandInput, GetCommand, UpdateCommandInput, UpdateCommand, DeleteCommandInput, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { HttpError } from "../errors/HttpError";

export class PostOutputAdapter implements PostOutputPort {
    private readonly tableName: string;
    private readonly documentClient: DynamoDBDocumentClient;
    private readonly logger: Logger;

    constructor(tableName: string) {
        this.tableName = tableName;
        const client = new DynamoDBClient({});
        this.documentClient = DynamoDBDocumentClient.from(client);
        this.logger = new Logger({
            serviceName: "PostOutputAdapter",
        });
    }

    async create(post: Post): Promise<void> {
        const input: PutCommandInput = {
            TableName: this.tableName,
            Item: post,
        };
        const command = new PutCommand(input);
        try {
            const result = await this.documentClient.send(command);
            this.logger.info({
                message: "Post created in database",
            }, { result });
        } catch (error) {
            const message = "Error while creating post in database";
            this.logger.error({ message }, { error });
            throw new HttpError(503, message);
        }
    }

    async getAll(term?: string): Promise<Post[]> {
        const input: ScanCommandInput = {
            TableName: this.tableName,
        }
        if (term !== undefined) {
            input.FilterExpression = "contains(#title, :title) or contains(#content, :content) or contains(#category, :category)";
            input.ExpressionAttributeNames = {
                "#title": "title",
                "#content": "content",
                "#category": "category",
            };
            input.ExpressionAttributeValues = {
                ":title": term,
                ":content": term,
                ":category": term,
            };
        }
        const command = new ScanCommand(input);
        try {
            const result = await this.documentClient.send(command);
            return result.Items as unknown as Post[];
        } catch (error) {
            const message = "Failed to get posts from database";
            this.logger.error({ message }, { error });
            throw new HttpError(503, message);
        }
    }

    async getOne(id: string): Promise<Post> {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: { id },
        };
        const command = new GetCommand(input);
        const result = await this.documentClient.send(command);
        this.logger.info({
            message: "Command result",
        }, { result });
        if (result.Item === undefined) {
            throw new HttpError(404, "Post not found");
        }
        return result.Item as Post;
    }

    async update(post: Post): Promise<void> {
        const input: UpdateCommandInput = {
            TableName: this.tableName,
            Key: {
                id: post.id,
            },
            UpdateExpression: "set #title = :title, #content = :content, #category = :category, #tags = :tags, #updatedAt = :updatedAt",
            ExpressionAttributeNames: {
                "#title": "title",
                "#content": "content",
                "#category": "category",
                "#tags": "tags",
                "#updatedAt": "updatedAt",
            },
            ExpressionAttributeValues: {
                ":title": post.title,
                ":content": post.content,
                ":category": post.category,
                ":tags": post.tags,
                ":updatedAt": post.updatedAt,
            },
        };
        const command: UpdateCommand = new UpdateCommand(input);
        try {
            const result = await this.documentClient.send(command);
            this.logger.info({
                message: "Post updated in database",
            }, { result });
        } catch (error) {
            const message = "Error while updating post in database";
            this.logger.error({ message }, { error });
            throw new HttpError(503, message);
        }
    }

    async delete(id: string): Promise<void> {
        const input: DeleteCommandInput = {
            TableName: this.tableName,
            Key: { id },
        };
        const command = new DeleteCommand(input);
        try {
            await this.documentClient.send(command);
        } catch (error) {
            const message = "Error deleting post in database";
            this.logger.error({ message }, { error });
            throw new HttpError(503, message);
        }
    }
}
