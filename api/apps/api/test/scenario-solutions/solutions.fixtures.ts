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
import { HttpStatus } from '@nestjs/common';
import { v4 } from 'uuid';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const bestSolutionId = v4();
  const anotherSolutionId = v4();
  const unexistentScenarioId = v4();

  const { projectId, cleanup: cleanupProject } = await GivenProjectExists(
    app,
    ownerToken,
    {
      countryId: 'BWA',
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
      await marxanOutputRepo.save([
        marxanOutputRepo.create({
          id: anotherSolutionId,
          scenarioId,
          runId: 1,
          scoreValue: 4000,
          costValue: 2000,
          missingValues: 1,
          planningUnits: 123,
        }),
      ]);
    },
    GivenScenarioHasBestSolutionReady: async () => {
      await marxanOutputRepo.save([
        marxanOutputRepo.create({
          id: bestSolutionId,
          scenarioId,
          runId: 2,
          scoreValue: 5000,
          costValue: 1000,
          missingValues: 1,
          planningUnits: 123,
          best: true,
        }),
      ]);
    },
    GivenScenarioDoesNotHaveBestSolutionReady: async () => {},
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
    WhenGettingBestSolutionForAnScenarioThatDoesNotExists: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${unexistentScenarioId}/marxan/solutions/best`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenGettingSolutionsForAnScenarioThatDoesNotExists: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${unexistentScenarioId}/marxan/solutions`)
        .set('Authorization', `Bearer ${ownerToken}`),
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
    WhenGettingBestSolutionAsOwner: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/solutions/best`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenGettingBestSolutionAsContributor: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/solutions/best`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenGettingBestSolutionAsViewer: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/solutions/best`)
        .set('Authorization', `Bearer ${viewerToken}`),
    ThenSolutionsShouldBeResolved: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.meta).toEqual({
        page: 1,
        size: 25,
        totalItems: 1,
        totalPages: 1,
      });
      expect(response.body.data.length).toEqual(1);
      expect(response.body.data[0].attributes).toEqual({
        costValue: 2000,
        id: anotherSolutionId,
        missingValues: 1,
        planningUnits: 123,
        runId: 1,
        scoreValue: 4000,
      });
    },
    ThenBestSolutionShouldBeResolved: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.attributes).toEqual({
        costValue: 1000,
        id: bestSolutionId,
        missingValues: 1,
        planningUnits: 123,
        runId: 2,
        scoreValue: 5000,
      });
    },
    ThenBestSolutionNotFoundShouldBeResolved: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.errors[0].status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.errors[0].title).toEqual(
        `Could not find best solution for scenario with ID: ${scenarioId}.`,
      );
    },
    ThenScenarioNotFoundShouldBeResolved: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.errors[0].status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.errors[0].title).toEqual(
        `Scenario ${unexistentScenarioId} could not be found.`,
      );
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
