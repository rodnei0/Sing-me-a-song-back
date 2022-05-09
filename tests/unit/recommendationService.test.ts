import faker from "@faker-js/faker";
import { jest } from "@jest/globals";
import { Recommendation } from "@prisma/client";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService";

describe("Recommendation service unit tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it("should remove a recommendation if score < -5", async () => {
        const id = 1;
        const score = -6;
        const recommedation: Recommendation = {
            id: id,
            name: faker.random.word(),
            youtubeLink: faker.internet.url(),
            score: score
        };

        jest.spyOn(recommendationRepository, "find").mockResolvedValue(recommedation);
        jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue(null);
        jest.spyOn(recommendationRepository, "remove").mockResolvedValue(null);

        await recommendationService.downvote(id);

        expect(recommendationRepository.remove).toBeCalledTimes(1);
        expect(recommendationRepository.remove).toBeCalledWith(recommedation.id);
    });

    it("should throw a not found error if there is no recommendation found in getRandom()", async () => {
        const recommedation = [];

        jest.spyOn(Math, "random").mockReturnValue(null);
        jest.spyOn(recommendationService, "getScoreFilter").mockReturnValue(null);
        jest.spyOn(recommendationService, "getByScore").mockResolvedValue(recommedation);

        await expect(recommendationService.getRandom()).rejects.toStrictEqual({"message": "", "type": "not_found"});
    });

    it("should throw a not found error if there is no recommendation found in upvote()", async () => {
        const id = 1;

        jest.spyOn(recommendationRepository, "find").mockResolvedValue(null);

        await expect(recommendationService.upvote(id)).rejects.toStrictEqual({"message": "", "type": "not_found"});
    });

    it("should throw a not found error if there is no recommendation found in downvote()", async () => {
        const id = 1;

        jest.spyOn(recommendationRepository, "find").mockResolvedValue(null);

        await expect(recommendationService.downvote(id)).rejects.toStrictEqual({"message": "", "type": "not_found"});
    });
});