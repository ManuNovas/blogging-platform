import { StoreDto } from "../../../domain/dtos/StoreDto";
import { Post } from "../../../domain/entities/Post";

export interface PostInputPort {
    create(dto: StoreDto): Promise<Post>;
}
