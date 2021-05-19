import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';

// import { ProxyService } from '../src/modules/proxy/proxy.service'
describe.skip('ProxyVectorTilesModule (e2e)', () => {
  let app: INestApplication;

  let jwtToken: string;

  beforeAll(async () => {
    app = await bootstrapApplication();
    jwtToken = await GivenUserIsLoggedIn(app);
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Proxy administrative areas', () => {
    // Make sure we have GADM data for this country in the test data which
    // is used to populate the geodb in CI pipelines.

    it(
      'Should give back a valid request for admin areas',
      async () => {
        return request(app.getHttpServer())
          .get('/api/v1/administrative-areas/1/preview/tiles/6/30/25.mvt')
          .set('Accept-Encoding', 'gzip, deflate')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
      },
      10 * 1000,
    );

    /**
     * @todo add error respone in main code
     */
    it('Should simulate an error', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/administrative-areas/1/preview/tiles/100/60/30.mvt')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    /**
     * @todo add level restriction on endpoint
     */
    it('Should throw a 400 error if filtering by level other than 0, 1 or 2', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/administrative-areas/3/preview/tiles/6/30/25.mvt')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    /**
     * @todo add zoom level restriction on endpoint
     */
    it('Should throw a 400 error if filtering by  z level greater than 20', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/administrative-areas/3/preview/tiles/21/30/25.mvt')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    /**
     * @todo add invalid tile test
     * @todo add mvt format test
     */
  });
});
