import { INestApplication } from '@nestjs/common';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { E2E_CONFIG } from '../e2e.config';

export const GivenProjectExists = async (
  app: INestApplication,
  jwt: string,
  projectData?: {
    countryCode: string;
    adminAreaLevel1Id?: string;
    adminAreaLevel2Id?: string;
    name?: string;
  },
  organizationData?: {
    name?: string;
  },
): Promise<{
  projectId: string;
  organizationId: string;
  cleanup: () => Promise<void>;
}> => {
  const organizationId = (
    await OrganizationsTestUtils.createOrganization(app, jwt, {
      ...E2E_CONFIG.organizations.valid.minimal(),
      ...(organizationData?.name ? { name: organizationData.name } : {}),
    })
  ).data.id;
  const projectId = (
    await ProjectsTestUtils.createProject(app, jwt, {
      ...E2E_CONFIG.projects.valid.minimalInGivenAdminArea(projectData),
      organizationId,
    })
  ).data.id;
  return {
    projectId,
    organizationId,
    cleanup: async () => {
      // TODO DEBT: no cascade remove?
      await ProjectsTestUtils.deleteProject(app, jwt, projectId);
      await OrganizationsTestUtils.deleteOrganization(app, jwt, organizationId);
    },
  };
};
