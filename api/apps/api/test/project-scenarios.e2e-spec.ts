import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';
import { CreateScenarioDTO } from '@marxan-api/modules/scenarios/dto/create.scenario.dto';
import { FakeQueue } from './utils/queues';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn, userObj } from './steps/given-user-is-logged-in';
import { GivenUserIsCreated } from './steps/given-user-is-created';
import { queueName } from '@marxan-api/modules/planning-units-protection-level/queue.name';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { ScenariosTestUtils } from './utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Repository } from 'typeorm';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GivenUserExists } from './steps/given-user-exists';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { GivenProjectExists } from './steps/given-project';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { ProjectsTestUtils } from './utils/projects.test.utils';
import { User } from '@marxan-api/modules/users/user.api.entity';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 12_000);
afterEach(async () => {
  await fixtures?.cleanup();
});

describe('ScenariosModule (e2e)', () => {
  afterEach(async () => {
    await fixtures.cleanup();
  });

  it('Creating a scenario with incomplete data should fail', async () => {
    const response = await fixtures.WhenCreatingAScenarioWithIncompleteData();
    fixtures.ThenBadRequestIsReturned(response);
  });

  it('Creating a scenario with minimum required data should succeed', async () => {
    const response = await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsOwner();
    fixtures.ThenScenarioIsCreatedAndNoJobHasBeenSubmitted(response);
  });

  it('Creating a scenario will succeed because the user is a project contributor', async () => {
    await fixtures.GivenContributorWasAddedToProject();
    const response = await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsContributor();
    fixtures.ThenScenarioIsCreated(response);
  });

  it('Creating a scenario will fail because the user is a project viewer', async () => {
    await fixtures.GivenViewerWasAddedToProject();
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

  const randomUserInfo = await GivenUserIsCreated(app);
  const queue = FakeQueue.getByName(queueName);
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;

  const projectContributorRole = ProjectRoles.project_contributor;
  const projectViewerRole = ProjectRoles.project_viewer;

  const { projectId } = await GivenProjectExists(app, ownerToken);

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
    'Example scenario 1 Project 1 Org 1',
    'Example scenario 2 Project 1 Org 1',
    'Example scenario 1 Project 2 Org 2',
    'Example scenario 2 Project 2 Org 2',
  ];
  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );
  const userProjectsRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );
  const usersRepo: Repository<User> = app.get(getRepositoryToken(User));

  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, ownerToken, scenarioId);
      await ProjectsTestUtils.deleteProject(app, ownerToken, projectId);
      await app.close();
    },

    GivenUserIsLoggedIn: async (user: string) => {
      if (user === 'random') {
        return randomUserInfo.accessToken;
      }
      const userToken = userObj[user as keyof typeof userObj];
      return await GivenUserIsLoggedIn(app, userToken);
    },

    GivenScenarioWasCreated: async () => {
      const result = await ScenariosTestUtils.createScenario(app, ownerToken, {
        name: `Test scenario`,
        type: ScenarioType.marxan,
        projectId,
      });
      scenarioId = result.data.id;

      return scenarioId;
    },

    GivenContributorWasAddedToProject: async () =>
      await userProjectsRepo.save({
        projectId,
        roleName: projectContributorRole,
        userId: contributorUserId,
      }),

    GivenViewerWasAddedToProject: async () =>
      await userProjectsRepo.save({
        projectId,
        roleName: projectViewerRole,
        userId: viewerUserId,
      }),

    GivenContributorWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      }),

    GivenViewerWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioViewerRole,
        userId: viewerUserId,
      }),

    GivenUserWasAddedToScenario: async () => {
      await userScenariosRepo.save({
        scenarioId,
        userId: randomUserInfo.user.id,
        roleName: scenarioContributorRole,
      });
      cleanups.push(async () => {
        await usersRepo.delete({ id: randomUserInfo.user.id });
        return;
      });
    },

    WhenCreatingAScenarioWithIncompleteData: async () =>
      await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(E2E_CONFIG.scenarios.invalid.missingRequiredFields()),

    WhenCreatingAScenarioWithMinimumRequiredDataAsOwner: async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(minimalCreateScenarioDTO);

      scenarioId = response.body.data.id;
      return response;
    },

    WhenCreatingAScenarioWithMinimumRequiredDataAsContributor: async () => {
      await userProjectsRepo.save({
        projectId,
        roleName: ProjectRoles.project_contributor,
        userId: contributorUserId,
      });
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${contributorToken}`)
        .send(minimalCreateScenarioDTO);

      scenarioId = response.body.data.id;
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

      scenarioId = response.body.data.id;
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
        .set('Authorization', `Bearer ${randomUserInfo.accessToken}`),

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

    ThenScenarioIsUpdated: (response: request.Response) => {
      expect(response.body.data.type).toBe('scenarios');
      expect(response.body.data.attributes.name).toEqual('Updated Scenario');
      expect(response.body.data.attributes.description).toEqual(
        'Updated Description',
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
