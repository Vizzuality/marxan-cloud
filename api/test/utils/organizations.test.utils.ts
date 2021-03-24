import * as request from 'supertest';
import { INestApplication, Logger } from '@nestjs/common';
import { CreateOrganizationDTO } from 'modules/organizations/dto/create.organization.dto';
import { OrganizationResultSingular } from 'modules/organizations/organization.api.entity';

/**
 * Utility functions for tests related to Organizations.
 *
 * Hopefully helping to reduce some boilerplate in operations that need to be
 * carried out throughout tests.
 *
 * Create functions return the raw response body - no need to assert anything
 * here as these utility functions mainly do some work at the edge of what is
 * actually being tested.
 */
 export class OrganizationsTestUtils {
  static async createOrganization(
    app: INestApplication,
    jwtToken: string,
    organizationDTO: Partial<CreateOrganizationDTO>,
  ): Promise<OrganizationResultSingular> {
    Logger.debug(jwtToken);
    return await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(organizationDTO)
      .then((response) => response.body)
      .catch((error) => {
        Logger.error(error);
      });
  }

  static async deleteOrganization(
    app: INestApplication,
    jwtToken: string,
    id: string,
  ): Promise<void> {
    await request(app.getHttpServer())
      .delete(`/api/v1/organizations/${id}`)
      .set('Authorization', `Bearer ${jwtToken}`);
  }
}
