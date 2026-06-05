import { Post } from "../../../domain/entities/Post";

export interface PostOutputPort {
    create(post: Post): Promise<void>;

    getAll(term?: string): Promise<Post[]>;

    getOne(id: string): Promise<Post>;

    update(post: Post): Promise<void>;

    delete(id: string): Promise<void>;
}
