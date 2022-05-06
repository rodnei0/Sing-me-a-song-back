import app from '../../src/app.js';
import supertest from 'supertest';
import prisma from '../../src/database.js';
import { jest } from "@jest/globals";
import createRecommendationWithScore from '../factories/createRecommendationWithScoreFactory.js';

describe("POST /recommendations", () => {
    afterAll(truncateRecommendations);
    afterAll(disconnect);

    it("giving a valid body should return status 201 and persist the recommendation", async () => {
        const body = {
            "name": "Falamansa - Xote dos Milagres",
            "youtubeLink": "https://www.youtube.com/watch?v=chwyjJbcs1Y"
        };

        const result = await supertest(app).post("/recommendations").send(body);
        const recommedation = await prisma.recommendation.findUnique({
            where: {
              name: "Falamansa - Xote dos Milagres",
            },
          });

        expect(result.status).toEqual(201);
        expect(recommedation).not.toBeNull();
    });

    it("giving an invalid body should return status 422", async () => {
        const body = {};

        const result = await supertest(app).post("/recommendations").send(body);

        expect(result.status).toEqual(422);
    });
});

describe("GET /recommendations", () => {
    afterAll(truncateRecommendations);
    afterAll(disconnect);

    it("should return the last 10 recommendations", async () => {
        await createRecommendationWithScore(11);

        const result = await supertest(app).get("/recommendations");
        expect(result.body.length).toBeLessThan(11)
    });
});

describe("GET /recommendations/:id", () => {
    afterAll(truncateRecommendations);
    afterAll(disconnect);

    it("should return an object with the id provided", async () => {
        const recommedation = await createRecommendationWithScore(1);
        const id = recommedation[0].id;

        const result = await supertest(app).get(`/recommendations/${id}`);

        expect(result.body.id).toEqual(id);
    });
});

describe("GET /recommendations/random", () => {
    afterAll(truncateRecommendations);
    afterAll(disconnect);
    
    it("should return a recommendation with score > 10 70% of the time>", async () => {
        await createRecommendationWithScore(12);

        jest.spyOn(Math, 'random').mockReturnValue(0.6);

        const result = await supertest(app).get("/recommendations/random");

        expect(result.body.id).toBeGreaterThan(10);
    });
});

describe("GET /recommendations/top/:amount", () => {
    afterAll(truncateRecommendations);
    afterAll(disconnect);
    
    it("should return the top 2 recommedations given 3 recommendations", async () => {
        const recommedations = await createRecommendationWithScore(3);

        const result = await supertest(app).get("/recommendations/top/2");

        const recommedation1 = result.body[0];
        const recommedation2 = result.body[1];

        expect(result.body).not.toBeNull;
        expect(result.body.length).toEqual(2);
        expect(recommedation1.score).toBeGreaterThan(recommedation2.score);
    });
});

describe("POST /recommendations/:id/upvote", () => {
    afterAll(truncateRecommendations);
    afterAll(disconnect);
    
    it("should return a recommendation with the score = 1", async () => {
        const recommedation = await createRecommendationWithScore(1);
        const id = recommedation[0].id;

        const result = await supertest(app).post(`/recommendations/${id}/upvote`);
        const response = await prisma.recommendation.findUnique({
            where: {
              id: id,
            },
          });
        expect(result.status).toEqual(200);
        expect(response).not.toBeNull();
        expect(response.score).toEqual(1);
    });
});

describe("POST /recommendations/:id/downvote", () => {
    afterAll(truncateRecommendations);
    afterAll(disconnect);
    
    it("should return a recommendation with the score = -1", async () => {
        const recommedation = await createRecommendationWithScore(1);
        const id = recommedation[0].id;

        const result = await supertest(app).post(`/recommendations/${id}/downvote`);
        const response = await prisma.recommendation.findUnique({
            where: {
              id: id,
            },
          });
        expect(result.status).toEqual(200);
        expect(response).not.toBeNull();
        expect(response.score).toEqual(-1);
    });
});

async function truncateRecommendations() {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}

async function disconnect() {
    await prisma.$disconnect();
}