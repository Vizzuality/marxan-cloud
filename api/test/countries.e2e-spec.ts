import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';
import { Country } from 'modules/countries/country.api.entity';

describe('CountriesModule (e2e)', () => {
  let app: INestApplication;

  let jwtToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        username: E2E_CONFIG.users.aa.username,
        password: E2E_CONFIG.users.aa.password,
      })
      .expect(201);

    jwtToken = response.body.accessToken;
  });

  afterEach(async () => {
    await Promise.all([app.close()]);
  });

  describe('Countries', () => {
    let aCountry: Country;

    it('Should list countries (paginated; pages of up to 25 items, no explicit page number - should default to 1)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/countries?page[size]=25')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('countries');
      expect(resources.length).toBeLessThanOrEqual(25);
      expect(resources.length).toBeGreaterThanOrEqual(1);

      aCountry = resources[0];
    });

    it('Should list administrative areas within a given country', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/countries/${aCountry.alpha3}/administrative-areas?page[size]=25`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('administrative-areas');
      expect(resources.length).toBeLessThanOrEqual(25);
      expect(resources.length).toBeGreaterThanOrEqual(1);
    });
  });
});
