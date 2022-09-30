import { faker } from '@faker-js/faker';
import { Recommendation } from '@prisma/client';
import { prisma } from "../../src/database";
import { recommendationRepository } from '../../src/repositories/recommendationRepository';
import { CreateRecommendationData } from "../../src/services/recommendationsService";

async function recommendation(): Promise<CreateRecommendationData> {
  return {
    name: faker.name.firstName(),
    youtubeLink: 'https://www.youtube.com/video'
  }
}

async function scoredRecommendation(score?: number | undefined): Promise<Recommendation> {
  if(!score){
    score = Number(faker.random.numeric(5));
  }
  return {
    id: Number(faker.random.numeric(2)),
    name: faker.name.firstName(),
    youtubeLink: 'https://www.youtube.com/video',
    score,
  }
}

function compareScore( a:Recommendation, b:Recommendation ) {
  if ( a.score > b.score ){
    return -1;
  }
  if ( a.score < b.score ){
    return 1;
  }
  return 0;
}

async function rankedRecommendations(){
  const recommendations: Recommendation[] = [];
  for(let i = 0; i < 4; i ++){
    recommendations.push(await scoredRecommendation());
  }
  return recommendations.sort(compareScore);
}

async function createRecommendation() {
  const myRecommendation = await recommendation();
  return await prisma.recommendation.create({ data: myRecommendation });
}

async function mockUpdateScore(recommendation: Recommendation) {
  jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
    return recommendation;
  })
  jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {
    return {
      ...recommendation,
      score: Number(recommendation.score) - 1
    }
  });
}

export default { recommendation, createRecommendation, mockUpdateScore, scoredRecommendation, rankedRecommendations };