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
  describe(`Running with NODE_ENV=development`, () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should return a response shaped as JSON:API Error spec', async () => {
      const jsonApiErrorResponse = {
        id: null,
        links: null,
        status: null,
        code: null,
        source: null,
        title: null,
        meta: {
          timestamp: null,
          path: null,
          type: null,
          rawError: null,
          stack: null,
        },
      };
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: 'fakeuser@example.com',
          password: 'fakePassword',
        });
      response.body.errors.forEach((err: any) => {
        expect(Object.keys(jsonApiErrorResponse)).toEqual(
          expect.arrayContaining(Object.keys(err)),
        );
        if (process.env.NODE_ENV != 'development') {
          expect(Object.keys(err)).toEqual(
            expect.arrayContaining(Object.keys(jsonApiErrorResponse.meta)),
          );
        }
        expect(Object.keys(jsonApiErrorResponse.meta)).toEqual(
          expect.arrayContaining(Object.keys(err.meta)),
        );
      });
    });
  })

  describe(`Running with NODE_ENV=production`, () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should return a response shaped as JSON:API Error spec', async () => {
      const jsonApiErrorResponse = {
        id: null,
        links: null,
        status: null,
        code: null,
        source: null,
        title: null,
        meta: {
          timestamp: null,
          path: null,
          type: null,
          rawError: null,
          stack: null,
        },
      };
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: 'fakeuser@example.com',
          password: 'fakePassword',
        });
      response.body.errors.forEach((err: any) => {
        expect(Object.keys(jsonApiErrorResponse)).toEqual(
          expect.arrayContaining(Object.keys(err)),
        );
        if (process.env.NODE_ENV != 'development') {
          expect(Object.keys(err)).toEqual(
            expect.arrayContaining(Object.keys(jsonApiErrorResponse.meta)),
          );
        }
        expect(Object.keys(jsonApiErrorResponse.meta)).toEqual(
          expect.arrayContaining(Object.keys(err.meta)),
        );
      });
    });
  })
});
