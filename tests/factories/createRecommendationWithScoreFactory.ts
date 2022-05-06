import prisma from '../../src/database.js';
import { faker } from "@faker-js/faker";
import { Recommendation } from '@prisma/client';

export type CreateRecommendationDataWithScore = Omit<Recommendation, "id" >;

export default async function createRecommendationWithScore(howMany: number) {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
    const recommendations = [];

    for (let index = 0; index < howMany; index++) {
        const recommendation: CreateRecommendationDataWithScore = {
            name: faker.lorem.word(),
            youtubeLink: faker.internet.url(),
            score: index
        }
        recommendations.push(recommendation)
    }
    await prisma.recommendation.createMany({
        data: recommendations
    })

    const result = await prisma.recommendation.findMany();

    return result
}