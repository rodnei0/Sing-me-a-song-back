import { Recommendation } from "@prisma/client";
import { recommendationRepository } from "../repositories/recommendationRepository.js";
import { notFoundError } from "../utils/errorUtils.js";

export type CreateRecommendationData = Omit<Recommendation, "id" | "score">;

async function insert(createRecommendationData: CreateRecommendationData) {
  await recommendationRepository.create(createRecommendationData);
}

async function upvote(id: number) {
  const recommendation = await recommendationRepository.find(id);
  if (!recommendation) throw notFoundError();

  await recommendationRepository.updateScore(id, "increment");
}

async function downvote(id: number) {
  const recommendation = await recommendationRepository.find(id);
  if (!recommendation) throw notFoundError();

  await recommendationRepository.updateScore(id, "decrement");

  if (recommendation.score < -5) {
    await recommendationRepository.remove(id);
  }
}

async function getById(id: number) {
  return recommendationRepository.find(id);
}

async function get() {
  return recommendationRepository.findAll();
}

async function getTop(amount: number) {
  return recommendationRepository.getAmountByScore(amount);
}

async function getRandom() {

  const random = Math.random();
  // console.log('random',random)
  const scoreFilter = getScoreFilter(random);
  // console.log('scoreFilter',scoreFilter)


  const recommendations = await getByScore(scoreFilter);
  // console.log('recommendations',recommendations)
  if (recommendations.length === 0) {
    throw notFoundError();
  }

  const randomIndex = Math.floor(Math.random() * recommendations.length);
  return recommendations[randomIndex];
}

async function getByScore(scoreFilter: "gt" | "lte") {
  const recommendations = await recommendationRepository.findAll({
    score: 10,
    scoreFilter,
  });

  if (recommendations.length > 0) {
    // console.log('recommendations dentro',recommendations);
    return recommendations;
  }

  return recommendationRepository.findAll();
}

function getScoreFilter(random: number) {
  if (random < 0.7) {
    return "gt";
  }

  return "lte";
}

export const recommendationService = {
  insert,
  upvote,
  downvote,
  getRandom,
  get,
  getById,
  getTop,
};
