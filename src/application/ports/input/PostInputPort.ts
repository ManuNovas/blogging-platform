import { GetAllDto } from "../../../domain/dtos/GetAllDto";
import { GetOneDto } from "../../../domain/dtos/GetOneDto";
import { StoreDto } from "../../../domain/dtos/StoreDto";
import { Post } from "../../../domain/entities/Post";

export interface PostInputPort {
    create(dto: StoreDto): Promise<Post>;

    getAll(dto: GetAllDto): Promise<Post[]>;

    getOne(dto: GetOneDto): Promise<Post>;

    update(id: string, dto: StoreDto): Promise<Post>;
}
