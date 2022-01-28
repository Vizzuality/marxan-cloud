import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { bootstrapApplication } from '../../utils/api-application';
import { GivenUserIsLoggedIn } from '../../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../../steps/given-project';
import { GivenScenarioExists } from '../../steps/given-scenario-exists';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ScenariosTestUtils } from '../../utils/scenarios.test.utils';

export const getFixtures = async () => {
  const app: INestApplication = await bootstrapApplication();
  const cleanups: (() => Promise<void>)[] = [];

  let authToken: string;
  let project: string;
  let scenario: string;

  return {
    GivenUserIsLoggedIn: async () => {
      authToken = await GivenUserIsLoggedIn(app);
    },
    GivenProjectOrganizationExists: async () => {
      const organizationProject = await GivenProjectExists(app, authToken, {
        countryCode: 'AGO',
        adminAreaLevel1Id: 'AGO.15_1',
        adminAreaLevel2Id: 'AGO.15.4_1',
      });

      project = organizationProject.projectId;
      cleanups.push(organizationProject.cleanup);
    },
    GivenScenarioExists: async (name: string) => {
      scenario = (
        await GivenScenarioExists(app, project, authToken, {
          name,
          type: ScenarioType.marxan,
        })
      ).id;
      cleanups.push(() =>
        ScenariosTestUtils.deleteScenario(app, authToken, scenario),
      );
    },
    GivenCostSurfaceTemplateFilled: async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenario}/cost-surface/shapefile-template`)
        .set('Authorization', `Bearer ${authToken}`);
    },
    WhenMarxanExecutionIsRequested: async () => {
      // TODO currently not implemented yet: 501
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenario}/marxan`)
        .set('Authorization', `Bearer ${authToken}`);
    },
    WhenMarxanExecutionIsCompleted: async () => {
      return void 0;
    },
    ThenResultsAreAvailable: async () => {
      return void 0;
    },
    cleanup: async () => {
      await Promise.all(cleanups.map((c) => c()));
      await app.close();
    },
  };
};
