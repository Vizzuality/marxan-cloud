import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2E_CONFIG } from './e2e.config';

describe('ProxyVectorTilesModule (e2e)', () => {
  let app: INestApplication;

  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        username: E2E_CONFIG.users.basic.aa.username,
        password: E2E_CONFIG.users.basic.aa.password,
      })
      .expect(201);

    jwtToken = response.body.accessToken;
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Countries', () => {
    // Make sure we have GADM data for this country in the test data which
    // is used to populate the geodb in CI pipelines.

    it('Should give back a valid mvt tiles for admin areas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/geoprocessing/administrative-areas/1/preview/tiles/6/30/25.mvt')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
    });

  });
});
