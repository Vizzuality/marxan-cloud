import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { E2E_CONFIG } from '../e2e.config';

import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';

export const createWorld = async (app: INestApplication) => {
  const jwtToken = await GivenUserIsLoggedIn(app);
  const organization = await OrganizationsTestUtils.createOrganization(
    app,
    jwtToken,
    E2E_CONFIG.organizations.valid.minimal(),
  );

  return {
    jwtToken,
    organizationId: organization.data.id,
    WhenCreatingProjectWithoutAdminAreas: async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...E2E_CONFIG.projects.valid.minimal(),
          countryId: undefined,
          adminAreaLevel1Id: undefined,
          adminAreaLevel2Id: undefined,
          planningUnitGridShape: PlanningUnitGridShape.FromShapefile,
          organizationId: organization.data.id,
        });
      if (response.status !== 201)
        throw new Error(
          `WhenCreatingProjectWithoutAdminAreas couldn't be done.`,
        );
    },
    WhenCreatingProjectWithAdminAreas: async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...E2E_CONFIG.projects.valid.complete({
            countryCode: 'NAM',
            adminLevel1: 'NAM.8_1',
            adminLevel2: 'NAM.8.6_1',
          }),
          organizationId: organization.data.id,
        });
      if (response.status !== 201)
        throw new Error(`WhenCreatingProjectWithAdminAreas couldn't be done.`);
    },
  };
};
