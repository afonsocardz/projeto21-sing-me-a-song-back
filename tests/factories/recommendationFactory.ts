import {faker} from '@faker-js/faker';
import { prisma } from "../../src/database";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

async function recommendation(): Promise<CreateRecommendationData>{
  return {
    name: faker.name.firstName(),
    youtubeLink: 'https://www.youtube.com/video'
  }
}

async function createRecommendation(){
  const myRecommendation = await recommendation();
  return await prisma.recommendation.create({data: myRecommendation});
}

export default {recommendation, createRecommendation};