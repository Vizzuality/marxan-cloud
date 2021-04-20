import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('JSON API Specs (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });
  it('should return a response shaped as JSON:API Error spec', async () => {
    const jsonApiErrorResponse = {
      status: null,
      title: null,
      meta: {
        timestamp: null,
        path: null,
        type: null,
      },
    };
    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        username: 'fakeuser@example.com',
        password: 'fakePassword',
      });
    response.body.errors.forEach((err: any) => {
      expect(Object.keys(err)).toEqual(Object.keys(jsonApiErrorResponse));
      expect(Object.keys(err.meta)).toEqual(
        expect.arrayContaining(Object.keys(jsonApiErrorResponse.meta)),
      );
    });
  });
});
