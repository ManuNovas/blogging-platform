import { Logger } from "@aws-lambda-powertools/logger";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { PostInputPort } from "../../application/ports/input/PostInputPort";
import { validate } from "@aws-lambda-powertools/validation";
import { createSchema, getAllSchema } from "./schemas/PostSchemas";
import { StoreDto } from "../../domain/dtos/StoreDto";
import { HttpError } from "../errors/HttpError";
import { SchemaValidationError } from "@aws-lambda-powertools/validation/errors";
import { GetAllDto } from "../../domain/dtos/GetAllDto";

export class PostInputAdapter {
    private readonly inputPort: PostInputPort;
    private readonly logger: Logger;

    constructor(inputPort: PostInputPort) {
        this.inputPort = inputPort;
        this.logger = new Logger({
            serviceName: "PostInputAdapter",
        });
    }

    private jsonResponse(status: number, entity: any): APIGatewayProxyResultV2 {
        return {
            statusCode: status,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(entity),
        };
    }

    private handleError(error: any): APIGatewayProxyResultV2 {
        this.logger.error({
            message: "Error while executing the input adapter",
        }, { error });
        if (error instanceof HttpError) {
            return {
                statusCode: error.status,
                body: error.message,
            };
        }
        if (error instanceof SchemaValidationError) {
            return {
                statusCode: 400,
                body: error.message,
            };
        }
        return {
            statusCode: 500,
            body: "Internal Server Error",
        };
    }

    async create(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
        try {
            const dto = JSON.parse(event.body ?? "{}") as StoreDto;
            validate({
                payload: dto,
                schema: createSchema,
            });
            const post = await this.inputPort.create(dto);
            return this.jsonResponse(201, post);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getAll(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
        try {
            const dto = event.queryStringParameters ?? {} as GetAllDto;
            validate({
                payload: dto,
                schema: getAllSchema,
            });
            const posts = await this.inputPort.getAll(dto);
            return this.jsonResponse(200, posts);
        } catch (error) {
            return this.handleError(error);
        }
    }
}
