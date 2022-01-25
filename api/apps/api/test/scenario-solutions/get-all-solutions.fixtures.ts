import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import * as request from 'supertest';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { GivenProjectExists } from '../steps/given-project';
import { E2E_CONFIG } from '../e2e.config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import { Repository } from 'typeorm';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { GivenUserExists } from '../steps/given-user-exists';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const { projectId, cleanup: cleanupProject } = await GivenProjectExists(
    app,
    ownerToken,
    {
      countryCode: 'BWA',
      adminAreaLevel1Id: 'BWA.12_1',
      adminAreaLevel2Id: 'BWA.12.1_1',
    },
  );
  const scenario = await ScenariosTestUtils.createScenario(app, ownerToken, {
    ...E2E_CONFIG.scenarios.valid.minimal(),
    projectId,
  });
  const scenarioId = scenario.data.id;
  const marxanOutputRepo: Repository<ScenariosOutputResultsApiEntity> = app.get(
    getRepositoryToken(ScenariosOutputResultsApiEntity),
  );

  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );

  return {
    GivenScenarioHasSolutionsReady: async () => {
      await marxanOutputRepo.save(
        marxanOutputRepo.create({
          scenarioId,
          runId: 1,
          scoreValue: 4000,
          costValue: 2000,
          missingValues: 1,
          planningUnits: 123,
        }),
      );
    },
    GivenContributorWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      }),

    GivenViewerWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioViewerRole,
        userId: viewerUserId,
      }),
    WhenGettingSolutionsAsOwner: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/solutions`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenGettingSolutionsAsContributor: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/solutions`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenGettingSolutionsAsViewer: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/solutions`)
        .set('Authorization', `Bearer ${viewerToken}`),
    ThenSolutionsShouldBeResolved: async (response: request.Response) => {
      expect(response.body.meta).toEqual({
        page: 1,
        size: 25,
        totalItems: 1,
        totalPages: 1,
      });
      expect(response.body.data.length).toEqual(1);
      expect(response.body.data[0].attributes).toEqual({
        costValue: 2000,
        id: expect.any(String),
        missingValues: 1,
        planningUnits: 123,
        runId: 1,
        scoreValue: 4000,
      });
    },
    cleanup: async () => {
      await marxanOutputRepo.delete({
        scenarioId: scenarioId,
      });
      await ScenariosTestUtils.deleteScenario(app, ownerToken, scenarioId);
      await cleanupProject();
      await app.close();
    },
  };
};
