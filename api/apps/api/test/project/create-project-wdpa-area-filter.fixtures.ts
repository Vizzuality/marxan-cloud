import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { E2E_CONFIG } from '../e2e.config';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import * as request from 'supertest';
import { IUCNCategory } from '@marxan/iucn';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const organizationId = (
    await OrganizationsTestUtils.createOrganization(app, token, {
      ...E2E_CONFIG.organizations.valid.minimal(),
      name: `Org name ${Date.now()}`,
    })
  ).data.id;
  const addedProjects: string[] = [];
  return {
    cleanup: async () => {
      await Promise.all(
        addedProjects.map((id) =>
          ProjectsTestUtils.deleteProject(app, token, id),
        ),
      );
      await OrganizationsTestUtils.deleteOrganization(
        app,
        token,
        organizationId,
      );
      await app.close();
    },
    GivenProjectWasCreated: async (countryId: string) => {
      const projectId = (
        await ProjectsTestUtils.createProject(app, token, {
          name: `Project name ${Date.now()}`,
          organizationId,
          metadata: {},
          countryId,
        })
      ).data.id;
      addedProjects.push(projectId);
      return projectId;
    },
    GivenScenarioWasCreated: async (projectId: string) =>
      (
        await ScenariosTestUtils.createScenario(app, token, {
          name: `Scenario for ${projectId} ${Date.now()}`,
          projectId,
          type: ScenarioType.marxan,
        })
      ).data.id,
    WhenScenarioIsUpdated: async (
      scenarioId: string,
      categories: IUCNCategory[],
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          wdpaIucnCategories: categories,
        }),
    ThenProtectedAreaFiltersAreDifferent: async (
      scenarioIdOne: string,
      scenarioIdTwo: string,
    ) => {
      const scenarioOneData = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioIdOne}`)
        .set('Authorization', `Bearer ${token}`);

      const scenarioTwoData = await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioIdTwo}`)
        .set('Authorization', `Bearer ${token}`);

      expect(
        scenarioOneData.body.data.attributes.protectedAreaFilterByIds.length,
      ).toBeGreaterThan(0);
      expect(
        scenarioTwoData.body.data.attributes.protectedAreaFilterByIds.length,
      ).toBeGreaterThan(0);

      expect(
        scenarioOneData.body.data.attributes.protectedAreaFilterByIds,
      ).not.toEqual(
        scenarioTwoData.body.data.attributes.protectedAreaFilterByIds,
      );
    },
  };
};
