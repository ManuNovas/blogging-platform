import { PostOutputPort } from "../../application/ports/output/PostOutputPort";
import { Post } from "../../domain/entities/Post";
import { DynamoDBDocumentClient, PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
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
}
