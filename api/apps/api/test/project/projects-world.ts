import { INestApplication } from '@nestjs/common';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { E2E_CONFIG } from '../e2e.config';
import { ProjectsTestUtils } from '../utils/projects.test.utils';

/**
 * See note about the choice of country and admin area codes for the
 * following project creation operations in `protected-areas.e2e-spec.ts`.
 */
const country = 'NAM';
const l1AdminArea = 'NAM.13_1';
const l2AdminArea = 'NAM.13.5_1';

export const createWorld = async (app: INestApplication, jwtToken: string) => {
  const organizationId = (
    await OrganizationsTestUtils.createOrganization(
      app,
      jwtToken,
      E2E_CONFIG.organizations.valid.minimal(),
    )
  ).data.id;

  const projectWithCountry = (
    await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryId: country,
      }),
      organizationId,
    })
  ).data.id;

  const projectWithGid1 = (
    await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryId: country,
        adminAreaLevel1Id: l1AdminArea,
      }),
      organizationId,
    })
  ).data.id;

  const projectWithGid2 = (
    await ProjectsTestUtils.createProject(app, jwtToken, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea({
        countryId: country,
        adminAreaLevel1Id: l1AdminArea,
        adminAreaLevel2Id: l2AdminArea,
      }),
      organizationId,
    })
  ).data.id;

  return {
    organizationId,
    projectWithCountry,
    projectWithGid1,
    projectWithGid2,
  };
};
