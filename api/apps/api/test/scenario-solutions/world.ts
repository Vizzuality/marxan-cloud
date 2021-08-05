import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import * as request from 'supertest';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { GivenProjectExists } from '../steps/given-project';
import { E2E_CONFIG } from '../e2e.config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import { Repository } from 'typeorm';

export const createWorld = async () => {
  const app = await bootstrapApplication();
  const jwt = await GivenUserIsLoggedIn(app);
  const { projectId, cleanup: cleanupProject } = await GivenProjectExists(
    app,
    jwt,
    {
      countryCode: 'BWA',
      adminAreaLevel1Id: 'BWA.12_1',
      adminAreaLevel2Id: 'BWA.12.1_1',
    },
  );
  const scenario = await ScenariosTestUtils.createScenario(app, jwt, {
    ...E2E_CONFIG.scenarios.valid.minimal(),
    projectId,
  });

  const marxanOutputRepo: Repository<ScenariosOutputResultsApiEntity> = app.get(
    getRepositoryToken(ScenariosOutputResultsApiEntity),
  );

  return {
    GivenScenarioHasSolutionsReady: async () => {
      // TODO implement again once all stuff is in place
      await marxanOutputRepo.save(
        marxanOutputRepo.create({
          scenarioId: scenario.data.id,
          runId: null,
          scoreValue: 4000,
        }),
      );
    },
    WhenGettingSolutions: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenario.data.id}/marxan/solutions`)
        .set('Authorization', `Bearer ${jwt}`),
    cleanup: async () => {
      await marxanOutputRepo.delete({
        scenarioId: scenario.data.id,
      });
      await ScenariosTestUtils.deleteScenario(app, jwt, scenario.data.id);
      await cleanupProject();
      await app.close();
    },
  };
};
