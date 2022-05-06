import prisma from '../../src/database.js';
import { faker } from "@faker-js/faker";
import { CreateRecommendationData } from '../../src/services/recommendationsService.js'

export default async function createRecommendation(howMany: number) {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
    const recommendations = [];

    for (let i = 0; i < howMany; i++) {
        const recommendation: CreateRecommendationData = {
            name: faker.lorem.word(),
            youtubeLink: faker.internet.url()
        }
        recommendations.push(recommendation)
    }
    
    await prisma.recommendation.createMany({
        data: recommendations
    })

    const result = await prisma.recommendation.findMany();

    return result
}