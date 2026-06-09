import { randomUUID } from "node:crypto";
import { PostOutputAdapter } from "../../../src/adapters/output/PostOutputAdapter";
import { PostUseCases } from "../../../src/application/use-cases/PostUseCases";
import { Post } from "../../../src/domain/entities/Post";

describe("PostUseCases", () => {
    let repository: PostOutputAdapter;
    let useCases: PostUseCases;

    beforeEach(() => {
        repository = new PostOutputAdapter("posts-test");
        useCases = new PostUseCases(repository);
    });

    describe("create", () => {

        it("should create a new post", async () => {
            jest.spyOn(repository, "create").mockResolvedValueOnce();
            const result = await useCases.create({
                title: "White magic in Final Fantasy",
                content: "Learn basic whit magic spells for Final Fantasy",
                category: "Magic",
                tags: ["White", "Magic", "Final", "Fantasy"],
            });
            expect(result).toEqual({
                id: expect.any(String),
                title: "White magic in Final Fantasy",
                content: "Learn basic whit magic spells for Final Fantasy",
                category: "Magic",
                tags: ["White", "Magic", "Final", "Fantasy"],
                createdAt: expect.any(String),
            });
        });

    });

    describe("getAll", () => {
        
        it("should return all posts from repository", () => {
            const posts: Post[] = [
                {
                    id: randomUUID(),
                    title: "White magic in Final Fantasy",
                    content: "Learn basic white magic spells in Final Fantasy",
                    category: "Magic",
                    tags: ["White", "Magic", "Final", "Fantasy"],
                    createdAt: new Date().toISOString(),
                },
            ];
            jest.spyOn(repository, "getAll").mockResolvedValueOnce(posts);
            useCases.getAll({
                term: "White",
            }).then((result) => {
                expect(result).toEqual(posts);
            });
        });

    });

    describe("getOne", () => {

        it("should return a post by id", () => {
            const id = randomUUID();
            const post: Post = {
                id,
                title: "White magic in Final Fantasy",
                content: "Learn basic white magic spells in Final Fantasy",
                category: "Magic",
                tags: ["White", "Magic", "Final", "Fantasy"],
                createdAt: new Date().toISOString(),
            };
            jest.spyOn(repository, "getOne").mockResolvedValueOnce(post);
            useCases.getOne({id}).then((result) => {
                expect(result).toEqual(post);
            });
        });

    });

    describe("update", () => {

        it("should update a post by id", () => {
            const id = randomUUID();
            jest.spyOn(repository, "getOne").mockResolvedValueOnce({
                id,
                title: "White magic in Final Fantasy",
                content: "Learn basic white magic spells in Final Fantasy",
                category: "Magic",
                tags: ["White", "Magic", "Final", "Fantasy"],
                createdAt: new Date().toISOString(),
            });
            jest.spyOn(repository, "update").mockResolvedValueOnce();
            useCases.update(id, {
                title: "Black Magic in Final Fantasy",
                content: "Learn basic black magic spells in Final Fantasy",
                category: "Magic",
                tags: ["Black", "Magic", "Final", "Fantasy"],
            }).then((result) => {
                expect(result).toEqual({
                    id,
                    title: "Black Magic in Final Fantasy",
                    content: "Learn basic black magic spells in Final Fantasy",
                    category: "Magic",
                    tags: ["Black", "Magic", "Final", "Fantasy"],
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                });
            });
        });

    });

    describe("delete", () => {

        it("should delete a post by id", () => {
            const id = randomUUID();
            jest.spyOn(repository, "getOne").mockResolvedValueOnce({
                id,
                title: "White magic in Final Fantasy",
                content: "Learn basic white magic spells in Final Fanatasy",
                category: "Magic",
                tags: ["White", "Magic", "Final", "Fantasy"],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            jest.spyOn(repository, "delete").mockResolvedValueOnce();
            useCases.delete(id).then(() => {
                expect(repository.delete).toHaveBeenCalledTimes(1);
            });
        });

    });

});
