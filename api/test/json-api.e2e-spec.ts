import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { omit } from 'lodash';

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

  it('should return a response shaped as JSON:API Error spec, including ', async () => {
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
      /**
       * Should not include rawError and stack props in meta object if app is running on prod env
       */
      if (process.env.NODE_ENV !== 'development') {
        expect(Object.keys(err.meta)).toEqual(
          Object.keys(omit(jsonApiErrorResponse.meta, ['rawError', 'stack'])),
        );
      }
      if (process.env.NODE_ENV === 'development') {
        expect(Object.keys(err.meta)).toEqual(
          Object.keys(jsonApiErrorResponse.meta),
        );
      }
    });
  });
});
