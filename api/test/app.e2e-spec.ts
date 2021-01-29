import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as faker from 'faker';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await Promise.all([app.close()]);
  });

  describe('Authentication', () => {
    let jwtToken: string;

    it('Retrieves a JWT token when authenticating with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'aa@example.com',
          password: 'aauserpassword',
        })
        .expect(201);

      jwtToken = response.body.accessToken;
    });

    it('Fails to authenticate a user with an incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
        .expect(401);

      expect(response.body.accessToken).not.toBeDefined();
    });

    it('Fails to authenticate a non-existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
        .expect(401);

      expect(response.body.accessToken).not.toBeDefined();
    });
  });
});
