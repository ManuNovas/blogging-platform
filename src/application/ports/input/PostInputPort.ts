import { GetAllDto } from "../../../domain/dtos/GetAllDto";
import { StoreDto } from "../../../domain/dtos/StoreDto";
import { Post } from "../../../domain/entities/Post";

export interface PostInputPort {
    create(dto: StoreDto): Promise<Post>;

    getAll(dto: GetAllDto): Promise<Post[]>;
}
