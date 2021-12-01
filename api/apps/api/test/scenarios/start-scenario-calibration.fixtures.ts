import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { E2E_CONFIG } from '../e2e.config';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const organizationId = (
    await OrganizationsTestUtils.createOrganization(app, token, {
      ...E2E_CONFIG.organizations.valid.minimal(),
      name: `Org name ${Date.now()}`,
    })
  ).data.id;
  const response = await ProjectsTestUtils.createProject(app, token, {
    ...E2E_CONFIG.projects.valid.minimal(),
    organizationId: organizationId,
    name: `Project name ${Date.now()}`,
  });
  console.log('--------PROJECT--------');
  console.dir(response, { depth: Infinity });
  console.log('--------PROJECT--------');
  const projectId = response.data.id;
  let scenarioId: string;
  const updatedRange = [1, 50];
  return {
    cleanup: async () => {
      await ProjectsTestUtils.deleteProject(app, token, projectId);
      await ScenariosTestUtils.deleteScenario(app, token, scenarioId);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        token,
        organizationId,
      );
      await app.close();
    },
    GivenScenarioWasCreated: async () => {
      const result = await ScenariosTestUtils.createScenario(app, token, {
        name: `Test scenario`,
        projectId,
      });
      scenarioId = result.data.id;
    },
    WhenScenarioCalibrationIsLaunchedItShouldNotFail: () => ({
      WithRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            range: updatedRange,
          })
          .expect(HttpStatus.CREATED),
      WithoutRange: async () =>
        await request(app.getHttpServer())
          .post(`/api/v1/scenarios/${scenarioId}/calibration`)
          .set('Authorization', `Bearer ${token}`)
          .expect(HttpStatus.CREATED),
    }),
    ThenWhenReadingProjectCalibrationItHasTheNewRange: async () => {
      const projectData = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/calibration`)
        .set('Authorization', `Bearer ${token}`);

      expect(projectData.body.range).toEqual(updatedRange);
    },
    ThenShouldFailWhenUpdatingProjectCalibrationWithA: () => {
      return {
        RangeWithNegativeNumbers: async () => {
          await request(app.getHttpServer())
            .post(`/api/v1/scenario/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [-1, -50],
            })
            .expect(HttpStatus.BAD_REQUEST);
        },
        RangeWithAMinGreaterThanMax: async () => {
          await request(app.getHttpServer())
            .post(`/api/v1/scenario/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [50, 1],
            })
            .expect(HttpStatus.BAD_REQUEST);
        },
        RangeWithValuesThatAreNotNumbers: async () => {
          await request(app.getHttpServer())
            .post(`/api/v1/scenario/${scenarioId}/calibration`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              range: [1, '50'],
            })
            .expect(HttpStatus.BAD_REQUEST);
        },
      };
    },
  };
};
