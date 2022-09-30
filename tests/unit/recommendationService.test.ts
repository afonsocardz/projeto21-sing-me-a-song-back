import { recommendationService } from '../../src/services/recommendationsService';
import { recommendationRepository } from '../../src/repositories/recommendationRepository';
import recommendationFactory from '../factories/recommendationFactory';
import { Recommendation } from '@prisma/client';
import { prisma } from '../../src/database';

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE recommendations`
})
afterAll(async () => {
  await prisma.$disconnect();
})

describe('Testa service de recomendações', () => {
  it('Testa função insert', async () => {
    const recommendation = await recommendationFactory.recommendation();
    jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(null);
    jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => { })
    await recommendationService.insert(recommendation);
    expect(recommendationRepository.create).toBeCalled();
  })
  it('Testa função upvote', async () => {
    const recommendation: Recommendation = await recommendationFactory.createRecommendation();
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
      return recommendation
    });
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => { });
    await recommendationService.upvote(recommendation.id);
    expect(recommendationRepository.updateScore).toBeCalled();
  });
  describe('Testa função downvote', () => {
    it('Testa caso de sucesso de downvote', async () => {
      const recommendation: Recommendation = await recommendationFactory.createRecommendation();
      await recommendationFactory.mockUpdateScore(recommendation);
      await recommendationService.downvote(recommendation.id);
      expect(recommendationRepository.updateScore).toBeCalled();
    });
    it('Testa remoção quando score menor que -5', async () => {
      const recommendation = await recommendationFactory.scoredRecommendation(-5);
      jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => { })
      await recommendationFactory.mockUpdateScore(recommendation);
      await recommendationService.downvote(recommendation.id);
      expect(recommendationRepository.remove).toBeCalled();
    });
  })
  it('Testa função get', async () => {
    const recommendation = await recommendationFactory.scoredRecommendation();
    jest.spyOn(recommendationRepository,"findAll").mockImplementationOnce(():any  =>{
      return [recommendation];
    });
    const result = await recommendationService.get();
    expect(result).toBeInstanceOf(Array);
  })
  it('Testa função getTop', async () => {
    const amount: number = 100;
    const recommendations = await recommendationFactory.rankedRecommendations();
    jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce(():any => {
      return recommendations
    });
    const result = await recommendationService.getTop(amount);
    const isGreater = result[0].score > result[1].score;
    expect(result).toBeInstanceOf(Array);
    expect(isGreater).toBe(true);
  })

})