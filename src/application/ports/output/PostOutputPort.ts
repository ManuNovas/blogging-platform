import { Post } from "../../../domain/entities/Post";

export interface PostOutputPort {
    create(post: Post): void;
}
