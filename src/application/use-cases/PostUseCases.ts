import { randomUUID } from "node:crypto";
import { StoreDto } from "../../domain/dtos/StoreDto";
import { Post } from "../../domain/entities/Post";
import { PostInputPort } from "../ports/input/PostInputPort";
import { PostOutputPort } from "../ports/output/PostOutputPort";
import { GetAllDto } from "../../domain/dtos/GetAllDto";
import { PathParameterDto } from "../../domain/dtos/PathParameterDto";

export class PostUseCases implements PostInputPort {
    private readonly repository: PostOutputPort;

    constructor(repository: PostOutputPort) {
        this.repository = repository;
    }

    async create(dto: StoreDto): Promise<Post> {
        const post: Post = {
            id: randomUUID(),
            title: dto.title,
            content: dto.content,
            category: dto.category,
            tags: dto.tags,
            createdAt: new Date().toISOString(),
        };
        await this.repository.create(post);
        return post;
    }

    async getAll(dto: GetAllDto): Promise<Post[]> {
        return this.repository.getAll(dto.term);
    }

    async getOne(dto: PathParameterDto): Promise<Post> {
        return this.repository.getOne(dto.id);
    }

    async update(id: string, dto: StoreDto): Promise<Post> {
        const post = await this.repository.getOne(id);
        post.title = dto.title
        post.content = dto.content;
        post.category = dto.category;
        post.tags = dto.tags;
        post.updatedAt = new Date().toISOString(),
            await this.repository.update(post);
        return post;
    }
}
