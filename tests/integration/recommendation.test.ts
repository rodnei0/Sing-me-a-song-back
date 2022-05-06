import app from '../../src/app.js';
import supertest from 'supertest';
import prisma from '../../src/database.js';
import { faker } from "@faker-js/faker";
import { CreateRecommendationData } from '../../src/services/recommendationsService.js'
import createRecommendation from '../factories/createRecommendationFactory.js';

// describe("POST /recommendations", () => {
//     afterAll(truncateRecommendations);
//     afterAll(disconnect);

//     it("giving a valid body should return status 201 and persist the recommendation", async () => {
//         const body = {
//             "name": "Falamansa - Xote dos Milagres",
//             "youtubeLink": "https://www.youtube.com/watch?v=chwyjJbcs1Y"
//         };

//         const result = await supertest(app).post("/recommendations").send(body);
//         const recommedation = await prisma.recommendation.findUnique({
//             where: {
//               name: "Falamansa - Xote dos Milagres",
//             },
//           });

//         expect(result.status).toEqual(201);
//         expect(recommedation).not.toBeNull();
//     });

//     it("giving an invalid body should return status 422", async () => {
//         const body = {};

//         const result = await supertest(app).post("/recommendations").send(body);

//         expect(result.status).toEqual(422);
//     });
// });

// describe("GET /recommendations", () => {
//     afterAll(truncateRecommendations);
//     afterAll(disconnect);

//     it("should return the last 10 recommendations", async () => {
//         await createRecommendation(12);

//         const result = await supertest(app).get("/recommendations");
//         expect(result.body.length).toBeLessThan(11)
//     });
// });

// describe("GET /recommendations/:id", () => {
//     afterAll(truncateRecommendations);
//     afterAll(disconnect);

//     it("should return an object with the id provided", async () => {
//         const recommedation = await createRecommendation(1);
//         const id = recommedation[0].id;

//         const result = await supertest(app).get(`/recommendations/${id}`);

//         expect(result.body.id).toEqual(id);
//     });
// });

// describe("GET /recommendations/random", () => {
//     // beforeAll(truncateRecommendations);
//     // afterAll(disconnect);
    
//     it("should return an array", async () => {
//         createRecommendation();

//         const result = await supertest(app).get("/recommendations/random");
//         //ver sobre o tipo recommedation
//         expect(typeof result.body).toEqual('object');
//     });
// });

describe("GET /recommendations/top/:amount", () => {
    // afterAll(truncateRecommendations);
    afterAll(disconnect);
    
    it("should return the top 2 recommedations given 3 recommendations", async () => {
        const recommedation = await createRecommendation(3);
        // console.log(recommedation)

        // const updateRecommedations = [];
        // recommedation.map((item, index) => {
        //     updateRecommedations.push(index)
        // },
        recommedation.forEach(async (item, index) => {
            // console.log(item.id)
            // console.log(index)
            await prisma.recommendation.update({
                where: {
                    id: item.id
                },
                data: {
                    score: index
                }
            })
        })

        const result = await supertest(app).get("/recommendations/top/3");
        console.log(result.body)

        const recommedation1 = result.body[0];
        const recommedation2 = result.body[1];

        expect(result.body).not.toBeNull;
        expect(recommedation1.id > recommedation2.id).toBe(true);
    });
});

// describe("POST /recommendations/:id/upvote", () => {
//     afterAll(truncateRecommendations);
//     afterAll(disconnect);
    
//     it("should return a recommendation with the score = 1", async () => {
//         const recommedation = await createRecommendation(1);
//         const id = recommedation[0].id;

//         const result = await supertest(app).post(`/recommendations/${id}/upvote`);
//         const response = await prisma.recommendation.findUnique({
//             where: {
//               id: id,
//             },
//           });
//         expect(result.status).toEqual(200);
//         expect(response).not.toBeNull();
//         expect(response.score).toEqual(1);
//     });
// });

// describe("POST /recommendations/:id/downvote", () => {
//     afterAll(truncateRecommendations);
//     afterAll(disconnect);
    
//     it("should return a recommendation with the score = -1", async () => {
//         const recommedation = await createRecommendation(1);
//         const id = recommedation[0].id;

//         const result = await supertest(app).post(`/recommendations/${id}/downvote`);
//         const response = await prisma.recommendation.findUnique({
//             where: {
//               id: id,
//             },
//           });
//         expect(result.status).toEqual(200);
//         expect(response).not.toBeNull();
//         expect(response.score).toEqual(-1);
//     });
// });


async function truncateRecommendations() {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}

async function disconnect() {
    await prisma.$disconnect();
}