import prisma from "../../src/database.js";
import { faker } from "@faker-js/faker";
import { Recommendation } from "@prisma/client";

export type CreateRecommendationDataWithScore = Omit<Recommendation, "id" >;

export default async function createRecommendationWithScore(score: number) {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;

    const recommendation: CreateRecommendationDataWithScore = {
        name: faker.lorem.word(),
        youtubeLink: faker.internet.url(),
        score: score
    };

    await prisma.recommendation.create({
        data: recommendation
    });

    const result = await prisma.recommendation.findFirst();

    return result;
}