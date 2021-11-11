import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@marxan-api/app.module';
import { E2E_CONFIG } from './e2e.config';
import { JSONAPICountryData } from '@marxan-api/modules/countries/country.geo.entity';
import { JSONAPIAdminAreaData } from '@marxan-api/modules/admin-areas/admin-area.geo.entity';
import { tearDown } from './utils/tear-down';

afterAll(async () => {
  await tearDown();
});

describe('CountriesModule (e2e)', () => {
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
    let _aCountry: JSONAPICountryData;
    let aLevel1AdminArea: JSONAPIAdminAreaData;
    // Make sure we have GADM data for this country in the test data which
    // is used to populate the geodb in CI pipelines.
    const countryCodeForTests = 'AGO';

    it('Should list countries (paginated; pages of up to 25 items, no explicit page number - should default to 1)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/countries?page[size]=25')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('countries');
      expect(resources.length).toBeLessThanOrEqual(25);
      expect(resources.length).toBeGreaterThanOrEqual(1);
    });

    it('Should list administrative areas within a given country', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/countries/${countryCodeForTests}/administrative-areas?page[size]=25`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('admin_areas');
      expect(resources.length).toBeLessThanOrEqual(25);
      expect(resources.length).toBeGreaterThanOrEqual(1);
    });

    it('Should return a administrative area in expected form', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/countries/${countryCodeForTests}/administrative-areas?page[size]=1`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources).toEqual([
        {
          attributes: {
            bbox: [
              24.08211708,
              11.66874886,
              -4.372591018676758,
              -18.042081832885742,
            ],
            gid0: 'AGO',
            gid1: null,
            gid2: null,
            maxPuAreaSize: 1252305,
            minPuAreaSize: 136,
            name0: 'Angola',
            name1: null,
            name2: null,
          },
          type: 'admin_areas',
        },
      ]);
    });

    it('Should return a country in expected form', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/countries/${countryCodeForTests}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources).toEqual({
        attributes: {
          bbox: [
            24.08211708,
            11.66874886,
            -4.372591018676758,
            -18.042081832885742,
          ],
          gid0: 'AGO',
          maxPuAreaSize: 1252305,
          minPuAreaSize: 136,
          name0: 'Angola',
          theGeom: expect.any(Object),
        },
        id: 'AGO',
        type: 'countries',
      });
    });

    it('Should throw a 400 error if filtering by level other than 1 or 2', async () => {
      await request(app.getHttpServer())
        .get(
          `/api/v1/countries/${countryCodeForTests}/administrative-areas?level=3`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    it('When listing admin areas within a country by level 1, only level 1 areas should be returned', async () => {
      const response = await request(app.getHttpServer())
        /**
         * Currently no country has more than 6000 between level 1 and level 2
         * areas, so we set that as limit to make sure we would get all the
         * areas in case the filter by level would not work anymore.
         * We also omit `theGeom` to keep payloads smaller.
         */
        .get(
          `/api/v1/countries/${countryCodeForTests}/administrative-areas?level=1&page[size]=6000&omitFields=theGeom`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources: JSONAPIAdminAreaData[] = response.body.data;
      aLevel1AdminArea = resources[0];
      // We (try to) select all the response items whose gid2 is set (these
      // would be level 2 areas).
      const level2Areas = resources.filter((e) => e?.attributes?.gid2);
      // And we expect to have none.
      expect(level2Areas.length).toBe(0);
      expect(resources[0].type).toBe('admin_areas');
      expect(resources.length).toBeLessThanOrEqual(6000);
      expect(resources.length).toBeGreaterThanOrEqual(1);
    });

    it('Should list level 2 areas within a given level 1 area', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/administrative-areas/${aLevel1AdminArea.attributes.gid1}/subdivisions?omitFields=theGeom`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('admin_areas');
    });
  });
});
