import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { BlmCalibrationRunResultDto } from '../../src/modules/scenarios/dto/scenario-blm-calibration-results.dto';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);

  const { projectId, organizationId } = await GivenProjectExists(
    app,
    token,
    {
      countryCode: 'AGO',
      name: `Project name ${Date.now()}`,
    },
    {
      name: `Org name ${Date.now()}`,
    },
  );

  await ProjectsTestUtils.generateBlmValues(app, projectId);
  let scenarioId: string;
  const blmRange = [0, 100];

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
        type: ScenarioType.marxan,
        projectId,
      });
      scenarioId = result.data.id;
    },
    WhenBlmCalibrationIsLaunched: async () =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/calibration`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          range: blmRange,
        })
        .expect(HttpStatus.CREATED),
    ThenCalibrationResultsShouldBeAvailableViaAPI: async () => {
      const response: { body: BlmCalibrationRunResultDto[] } = await request(
        app.getHttpServer(),
      )
        .get(`/api/v1/scenarios/${scenarioId}/calibration`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const results = response.body;

      expect(results.length).toBeGreaterThan(0);

      results.forEach((result) => {
        expect(result.id).toBeDefined();
        expect(result.scenarioId).toBe(scenarioId);
        expect(result.cost).toBeGreaterThanOrEqual(0);
        expect(result.blmValue).toBeGreaterThanOrEqual(blmRange[0]);
        expect(result.blmValue).toBeLessThanOrEqual(blmRange[1]);
        expect(result.boundaryLength).toBeGreaterThanOrEqual(0);
      });
    },
  };
};
