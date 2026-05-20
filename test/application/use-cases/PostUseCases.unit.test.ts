import { PostOutputAdapter } from "../../../src/adapters/output/PostOutputAdapter";
import { PostUseCases } from "../../../src/application/use-cases/PostUseCases";

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

});
