import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2E_CONFIG } from './e2e.config';

// import { ProxyService } from '../src/modules/proxy/proxy.service'
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

  describe('Proxy administrative areas', () => {
    // Make sure we have GADM data for this country in the test data which
    // is used to populate the geodb in CI pipelines.

    it('Should give back a valid request for admin areas', async () => {
      const response = await request(app.getHttpServer())
        .get(
          '/api/v1/geoprocessing/administrative-areas/1/preview/tiles/6/30/25.mvt',
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
    });

    /**
     * @todo add error respone in main code
     */
    it('Should simulate an error', async () => {
      const response = await request(app.getHttpServer())
        .get(
          '/api/v1/geoprocessing/administrative-areas/1/preview/tiles/100/60/30.mvt',
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    /**
     * @todo add level restriction on endpoint
     */
    it('Should throw a 400 error if filtering by level other than 0, 1 or 2', async () => {
      const response = await request(app.getHttpServer())
        .get(
          '/api/v1/geoprocessing/administrative-areas/3/preview/tiles/6/30/25.mvt',
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    /**
     * @todo add zoom level restriction on endpoint
     */
    it('Should throw a 400 error if filtering by  z level greater than 20', async () => {
      const response = await request(app.getHttpServer())
        .get(
          '/api/v1/geoprocessing/administrative-areas/3/preview/tiles/21/30/25.mvt',
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    /**
     * @todo add invalid tile test
     * @todo add mvt format test
     */
  });
});
