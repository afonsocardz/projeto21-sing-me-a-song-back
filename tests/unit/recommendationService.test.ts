import { recommendationService } from '../../src/services/recommendationsService';
import { recommendationRepository } from '../../src/repositories/recommendationRepository';
import recommendationFactory from '../factories/recommendationFactory';
import { Recommendation } from '@prisma/client';

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe('Testa service de recomendações', () => {
  describe('Testa função insert', () => {
    it('Testa sucesso insert', async () => {
      const recommendation = await recommendationFactory.recommendation();
      jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(null);
      jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => { })
      await recommendationService.insert(recommendation);
      expect(recommendationRepository.create).toBeCalled();
    })
    it('Testa quando recommendation já existe', async () => {
      const recommendation = await recommendationFactory.recommendation();
      jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => {
        return recommendation;
      });
      const promise = recommendationService.insert(recommendation);
      expect(promise).rejects.toEqual({ type: "conflict", message: "Recommendations names must be unique" })
      expect(recommendationRepository.create).not.toBeCalled();
    })
  })
  it('Testa função upvote', async () => {
    const recommendation: Recommendation = await recommendationFactory.scoredRecommendation();
    jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
      return recommendation
    });
    jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => { });
    await recommendationService.upvote(recommendation.id);
    expect(recommendationRepository.updateScore).toBeCalled();
  });
  describe('Testa função downvote', () => {
    it('Testa caso de sucesso de downvote', async () => {
      const recommendation: Recommendation = await recommendationFactory.scoredRecommendation();
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
    jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {
      return [recommendation];
    });
    const result = await recommendationService.get();
    expect(result).toBeInstanceOf(Array);
  })
  it('Testa função getTop', async () => {
    const amount: number = 100;
    const recommendations = await recommendationFactory.rankedRecommendations();
    jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce((): any => {
      return recommendations
    });
    const result = await recommendationService.getTop(amount);
    const isGreater = result[0].score >= result[1].score;
    expect(result).toBeInstanceOf(Array);
    expect(isGreater).toBe(true);
  });
  describe('Testa função getRandom', () => {
    it('Testa sucesso getRandom', async () => {
      const recommendations = await recommendationFactory.rankedRecommendations();
      jest.spyOn(Math, "random").mockReturnValue(0.5);
      jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {
        return recommendations;
      });
      const result = await recommendationService.getRandom();
      expect(result).not.toBe(null);
    })
    it('Testa quando aleatório não é encontrado', async () => {
      jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);
      const promise = recommendationService.getRandom();
      expect(promise).rejects.toEqual({type:'not_found', message: ''});
    })
    
  });
  it('Testa erro da função getByIdOrFail', async () => {
    const id = 999;
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);
    const promise = recommendationService.upvote(id);
    expect(promise).rejects.toEqual({ type: 'not_found', message: '' });
  })

})