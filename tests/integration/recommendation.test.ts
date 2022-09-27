import { Recommendation } from '@prisma/client';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database';
import recommendationFactory from '../factories/recommendationFactory';

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE recommendations`
})
afterAll(async () => {
  await prisma.$disconnect();
})

describe('Testa rota recommendations', () => {
  it('Testa /POST criação de recomendação', async () => {
    const recommendation = await recommendationFactory.recommendation();
    const result = await request(app).post('/recommendations/').send(recommendation);
    expect(result.status).toBe(201);
  })
  it('Testa /POST função de voto positivo', async () => {
    const { id } = await recommendationFactory.createRecommendation();
    const result = await request(app).post(`/recommendations/${id}/upvote`).send()
    expect(result.status).toBe(200);
  });
  it('Testa /POST função de voto negativo', async () =>{
    const { id } = await recommendationFactory.createRecommendation();
    await request(app).post(`/recommendations/${id}/upvote`).send();
    const result = await request(app).post(`/recommendations/${id}/downvote`).send()
    expect(result.status).toBe(200);
  })
  it('Testa /GET lista de recomendações', async () => {
    await recommendationFactory.createRecommendation();
    const result = await request(app).get('/recommendations/');
    expect(result.body).toBeInstanceOf(Array);
  });
  it('Teste /GET lista topo de recomendações', async ()=> {
    const recommendations: Recommendation[] = [];
    for(let i = 0; i < 2; i++){
      const recommendation = await recommendationFactory.createRecommendation();
      recommendations.push(recommendation);
    }
    await request(app).post(`/recommendations/${recommendations[0].id}/upvote`).send();
    const {body} = await request(app).get('/recommendations/top/1');
    expect(body[0].score).toBe(1);
  })
  it('Testa /GET recomendação por ID', async ()=> {
    const {id} = await recommendationFactory.createRecommendation();
    const {body} = await request(app).get(`/recommendations/${id}`);
    expect(body.id).toBe(id);
  });
  it('Testa /GET retorna aleatóriamente', async () => {
    const recommendations: Recommendation[] = [];
    for(let i = 0; i < 2; i++){
      const recommendation = await recommendationFactory.createRecommendation();
      recommendations.push(recommendation);
    }
    await request(app).post(`/recommendations/${recommendations[0].id}/upvote`).send();
    const result = await request(app).get(`/recommendations/random`);
    expect(result.status).toBe(200);
  })
})


 