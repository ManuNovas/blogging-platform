import { PostUseCases } from "../../application/use-cases/PostUseCases";
import { PostInputAdapter } from "../input/PostInputAdapter";
import { PostOutputAdapter } from "../output/PostOutputAdapter";

const tableName = process.env.POSTS_TABLE_NAME ?? "posts-dev-v1";
const repository = new PostOutputAdapter(tableName);
const useCases = new PostUseCases(repository);
const adapter = new PostInputAdapter(useCases);

export const create = adapter.create.bind(adapter);
