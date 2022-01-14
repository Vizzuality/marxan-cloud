import { Logger } from '@nestjs/common';
import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';
import { CreateScenarioDTO } from '@marxan-api/modules/scenarios/dto/create.scenario.dto';
import { FakeQueue } from './utils/queues';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';
import { queueName } from '@marxan-api/modules/planning-units-protection-level/queue.name';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { ScenariosTestUtils } from './utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Repository } from 'typeorm';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GivenUserExists } from './steps/given-user-exists';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';

let fixtures: FixtureType<typeof getFixtures>;
const logger = new Logger('test');

beforeEach(async () => {
  fixtures = await getFixtures();
});
afterEach(async () => {
  await fixtures?.cleanup();
});

describe('ScenariosModule (e2e)', () => {
  // beforeEach(async () => {
  //   const response = await request(app.getHttpServer())
  //     .get('/api/v1/projects')
  //     .set('Authorization', `Bearer ${ownerToken}`)
  //     .expect(200);
  //   projects = response.body.data;
  // });

  afterEach(async () => {
    await fixtures.cleanup();
  });

  // it('Gets projects', async () => {
  //   expect(projects[0].type).toBe('projects');
  // });

  it('Creating a scenario with incomplete data should fail', async () => {
    const response = await fixtures.WhenCreatingAScenarioWithIncompleteData();
    fixtures.ThenBadRequestIsReturned(response);
  });

  it('Creating a scenario with minimum required data should succeed', async () => {
    const response = await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsOwner();
    fixtures.ThenScenarioIsCreatedAndNoJobHasBeenSubmitted(response);
  });

  it('Creating a scenario will succeed because the user is a project contributor', async () => {
    const response = await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsContributor();
    fixtures.ThenScenarioIsCreated(response);
  });

  it('Creating a scenario will fail because the user is a project viewer', async () => {
    const response = await fixtures.WhenCreatingAScenarioAsAProjectViewer();
    fixtures.ThenForbiddenIsReturned(response);
  });

  it('Creating a scenario with complete data should succeed', async () => {
    const response = await fixtures.WhenCreatingAScenarioWithCompleteDataAsOwner();
    fixtures.ThenScenarioAndJobAreCreated(response);
  });

  it('Gets scenarios as a scenario owner', async () => {
    const response = await fixtures.WhenGettingScenariosAsOwner();
    fixtures.ThenAllScenariosFromOwnerAreReturned(response);
  });

  it('Gets scenarios as a scenario contributor', async () => {
    const response = await fixtures.WhenGettingScenariosAsContributor();
    fixtures.ThenAllScenariosFromContributorAreReturned(response);
  });

  it('Gets scenarios as a scenario viewer', async () => {
    const response = await fixtures.WhenGettingScenariosAsViewer();
    fixtures.ThenAllScenariosFromViewerAreReturned(response);
  });

  it('Gets no scenarios as a user not assigned to any scenario', async () => {
    const response = await fixtures.WhenGettingScenariosAsUserWithNoScenarios();
    fixtures.ThenNoScenarioIsReturned(response);
  });

  it('Gets scenarios (paginated; pages of up to 5 items, no explicit page number - should default to 1)', async () => {
    const response = await fixtures.WhenGettingPaginatedScenariosAsOwner();
    fixtures.ThenProperLengthIsReturned(response);
  });

  it('Gets scenarios (paginated; pages of up to 5 items, first page)', async () => {
    const response = await fixtures.WhenGettingPaginatedScenariosWithPageNumberAsOwner();
    fixtures.ThenProperLengthIsReturned(response);
  });

  it(`Gets scenarios with a free search`, async () => {
    const response = await fixtures.WhenGettingScenariosWithFreeSearchAsOwner();
    fixtures.ThenCorrectScenariosAreReturned(response);
  });

  it('Contributor fails to delete scenario', async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenContributorWasAddedToScenario();
    const response = await fixtures.WhenDeletingScenarioAsContributor();
    fixtures.ThenForbiddenIsReturned(response);
  });

  it('Viewer fails to delete scenario', async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario();
    const response = await fixtures.WhenDeletingScenarioAsViewer();
    fixtures.ThenForbiddenIsReturned(response);
  });

  it('Owner successfully deletes the newly created scenario', async () => {
    await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario();
    const response = await fixtures.WhenDeletingScenarioAsOwner();
    fixtures.ThenOkIsReturned(response);
  });

  it('should not allow to create scenario with invalid marxan properties', async () => {
    const response = await fixtures.WhenCreatingScenarioWithInvalidMarxanProperties();
    fixtures.ThenInvalidEnumValueMessageIsReturned(response);
  });
});

async function getFixtures() {
  const app = await bootstrapApplication();
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const noScenariosUserToken = await GivenUserIsLoggedIn(app, 'dd');
  const queue = FakeQueue.getByName(queueName);

  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;

  const allProjectsResponse = await request(app.getHttpServer())
    .get('/api/v1/projects')
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200);
  const projectId = allProjectsResponse.body.data[0].id;

  const minimalCreateScenarioDTO: Partial<CreateScenarioDTO> = {
    ...E2E_CONFIG.scenarios.valid.minimal(),
    projectId,
  };

  const completeCreateScenarioDTO: Partial<CreateScenarioDTO> = {
    ...E2E_CONFIG.scenarios.valid.complete(),
    projectId,
  };

  let scenarioId: string;
  const seedScenarioNames = [
    'Example scenario 1 Project 2 Org 2',
    'Example scenario 2 Project 2 Org 2',
  ];
  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );
  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, ownerToken, scenarioId);
      for (const cleanup of cleanups.reverse()) {
        await cleanup();
      }
      await app.close();
    },

    GivenScenarioWasCreated: async () => {
      const result = await ScenariosTestUtils.createScenario(app, ownerToken, {
        name: `Test scenario`,
        type: ScenarioType.marxan,
        projectId,
      });
      scenarioId = result.data.id;
      return result.data.id;
    },

    GivenContributorWasAddedToScenario: async () => {
      const userCreated = await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      });
      return userCreated;
    },

    GivenViewerWasAddedToScenario: async () => {
      const userCreated = await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioViewerRole,
        userId: viewerUserId,
      });
      return userCreated;
    },

    WhenCreatingAScenarioWithIncompleteData: async () => {
      return await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(E2E_CONFIG.scenarios.invalid.missingRequiredFields());
    },

    WhenCreatingAScenarioWithMinimumRequiredDataAsOwner: async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(minimalCreateScenarioDTO);
      cleanups.push(
        async () =>
          await ScenariosTestUtils.deleteScenario(
            app,
            ownerToken,
            response.body.data.attributes.id,
          ),
      );
      return response;
    },

    WhenCreatingAScenarioWithMinimumRequiredDataAsContributor: async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${contributorToken}`)
        .send(minimalCreateScenarioDTO);
      cleanups.push(
        async () =>
          await ScenariosTestUtils.deleteScenario(
            app,
            contributorToken,
            response.body.data.attributes.id,
          ),
      );
      return response;
    },

    WhenCreatingAScenarioAsAProjectViewer: async () =>
      await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(minimalCreateScenarioDTO),

    WhenCreatingAScenarioWithCompleteDataAsOwner: async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(completeCreateScenarioDTO);
      cleanups.push(
        async () =>
          await ScenariosTestUtils.deleteScenario(
            app,
            ownerToken,
            response.body.data.attributes.id,
          ),
      );
      return response;
    },

    WhenGettingScenariosAsOwner: async () =>
      await request(app.getHttpServer())
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${ownerToken}`),

    WhenGettingScenariosAsContributor: async () =>
      await request(app.getHttpServer())
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenGettingScenariosAsViewer: async () =>
      await request(app.getHttpServer())
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${viewerToken}`),

    WhenGettingScenariosAsUserWithNoScenarios: async () =>
      await request(app.getHttpServer())
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${noScenariosUserToken}`),

    WhenGettingPaginatedScenariosAsOwner: async () =>
      await request(app.getHttpServer())
        .get('/api/v1/scenarios?page[size]=5')
        .set('Authorization', `Bearer ${ownerToken}`),

    WhenGettingPaginatedScenariosWithPageNumberAsOwner: async () =>
      await request(app.getHttpServer())
        .get('/api/v1/scenarios?page[size]=5&page[number]=1')
        .set('Authorization', `Bearer ${ownerToken}`),

    WhenGettingScenariosWithFreeSearchAsOwner: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/scenarios?q=oRG%202`)
        .set(`Authorization`, `Bearer ${ownerToken}`),

    WhenDeletingScenarioAsContributor: async () =>
      await request(app.getHttpServer())
        .delete('/api/v1/scenarios/' + scenarioId)
        .set('Authorization', `Bearer ${contributorToken}`),

    WhenDeletingScenarioAsViewer: async () =>
      await request(app.getHttpServer())
        .delete('/api/v1/scenarios/' + scenarioId)
        .set('Authorization', `Bearer ${viewerToken}`),

    WhenDeletingScenarioAsOwner: async () =>
      await request(app.getHttpServer())
        .delete('/api/v1/scenarios/' + scenarioId)
        .set('Authorization', `Bearer ${ownerToken}`),

    WhenCreatingScenarioWithInvalidMarxanProperties: async () =>
      await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          ...E2E_CONFIG.scenarios.valid.minimal(),
          projectId,
          metadata: {
            marxanInputParameterFile: {
              HEURTYPE: 99999999213231,
            },
          },
        }),

    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },

    ThenBadRequestIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(400);
    },

    ThenOkIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
    },

    ThenScenarioIsCreatedAndNoJobHasBeenSubmitted: (
      response: request.Response,
    ) => {
      expect(response.body.data.type).toBe('scenarios');
      expect(response.body.data.attributes.name).toEqual(
        minimalCreateScenarioDTO.name,
      );

      // Minimal data - no job submitted
      expect(Object.values(queue.jobs).length).toEqual(0);
    },
    ThenScenarioAndJobAreCreated: (response: request.Response) => {
      expect(response.body.data.type).toBe('scenarios');
      expect(response.body.data.attributes.name).toEqual(
        completeCreateScenarioDTO.name,
      );
      /**
       * @todo: there is an error on this test
       */
      // const job = Object.values(queue.jobs)[0];
      // expect(job).toBeDefined();
      // expect(job.name).toMatch(/calculate-planning-units-protection-level/);
      // expect(job.data?.scenarioId).toBeDefined();
    },
    ThenScenarioIsCreated: (response: request.Response) => {
      expect(response.body.data.type).toBe('scenarios');
      expect(response.body.data.attributes.name).toEqual(
        minimalCreateScenarioDTO.name,
      );
    },

    ThenAllScenariosFromOwnerAreReturned: (response: request.Response) => {
      const resources = response.body.data;

      expect(resources[0].type).toBe('scenarios');
      const scenarioNames: string[] = resources.map(
        (s: any) => s.attributes.name,
      );
      expect(scenarioNames.sort()).toEqual(seedScenarioNames.sort());
      expect(response.body.meta).toEqual({
        page: expect.any(Number),
        size: expect.any(Number),
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
      });
    },

    ThenAllScenariosFromContributorAreReturned: (
      response: request.Response,
    ) => {
      const resources = response.body.data;

      expect(resources[0].type).toBe('scenarios');
      const scenarioNames: string[] = resources.map(
        (s: any) => s.attributes.name,
      );
      expect(scenarioNames.sort()).toEqual(seedScenarioNames.sort());
      expect(response.body.meta).toEqual({
        page: expect.any(Number),
        size: expect.any(Number),
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
      });
    },

    ThenAllScenariosFromViewerAreReturned: (response: request.Response) => {
      const resources = response.body.data;

      expect(resources[0].type).toBe('scenarios');
      const scenarioNames: string[] = resources.map(
        (s: any) => s.attributes.name,
      );
      expect(scenarioNames.sort()).toEqual(seedScenarioNames.sort());
      expect(response.body.meta).toEqual({
        page: expect.any(Number),
        size: expect.any(Number),
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
      });
    },
    ThenNoScenarioIsReturned: (response: request.Response) => {
      const resources = response.body.data;
      expect(resources).toHaveLength(0);
    },
    ThenProperLengthIsReturned: (response: request.Response) => {
      const resources = response.body.data;
      expect(resources[0].type).toBe('scenarios');
      expect(resources.length).toBeLessThanOrEqual(5);
      expect(resources.length).toBeGreaterThanOrEqual(1);
    },
    ThenCorrectScenariosAreReturned: (response: request.Response) => {
      const resources = response.body.data;
      expect(resources).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'scenarios',
            attributes: expect.objectContaining({
              name: 'Example scenario 1 Project 2 Org 2',
            }),
          }),
          expect.objectContaining({
            type: 'scenarios',
            attributes: expect.objectContaining({
              name: 'Example scenario 2 Project 2 Org 2',
            }),
          }),
        ]),
      );
    },
    ThenInvalidEnumValueMessageIsReturned: (response: request.Response) => {
      expect(
        response.body.errors[0].meta.rawError.response.message[0].constraints
          .isEnum,
      ).toMatchInlineSnapshot(`"HEURTYPE must be a valid enum value"`);
    },
  };
}
