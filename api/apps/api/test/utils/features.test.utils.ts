import * as request from 'supertest';
import { INestApplication, Logger } from '@nestjs/common';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

/**
 * Utility functions for tests related to features.
 *
 * Hopefully helping to reduce some boilerplate in operations that need to be
 * carried out throughout tests.
 *
 * Create functions return the raw response body - no need to assert anything
 * here as these utility functions mainly do some work at the edge of what is
 * actually being tested.
 */
export class FeaturesTestUtils {
  static async getFeature(
    app: INestApplication,
    jwtToken: string,
    projectId: string,
  ): Promise<GeoFeature> {
    return await request(app.getHttpServer())
      .get(`/api/v1/projects/${projectId}/features`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .then((response) => response.body.data[0])
      .catch((error) => {
        Logger.error(error);
      });
  }
}
