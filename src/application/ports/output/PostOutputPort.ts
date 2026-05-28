import { Post } from "../../../domain/entities/Post";

export interface PostOutputPort {
    create(post: Post): Promise<void>;

    getAll(term?: string): Promise<Post[]>;
}
