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
import {
  Scenario,
  ScenarioType,
} from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Repository } from 'typeorm';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GivenUserExists } from './steps/given-user-exists';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { GivenProjectExists } from './steps/given-project';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';

// TODO: This test file is highly coupled, some tests relies on other tests, some expectations are not clear. This one should be a priority to refactor
let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 12_000);

describe('ScenariosModule (e2e)', () => {
  it('Creating a scenario with incomplete data should fail', async () => {
    const response = await fixtures.WhenCreatingAScenarioWithIncompleteData();
    fixtures.ThenBadRequestIsReturned(response);
  });

  it('Creating a scenario with minimum required data should succeed', async () => {
    const response =
      await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsOwner();
    fixtures.ThenScenarioIsCreatedAndNoJobHasBeenSubmitted(response);
  });

  it('Creating a scenario has its internal project-scope id properly informed', async () => {
    const response =
      await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsOwner();
    //ProjectScenarioId will be one because it's the first Scenario in the project
    fixtures.ThenScenarioIsCreatedWithProjectScenarioId(response, 1);
  });

  it('Creating a scenario has its internal project-scope id properly informed with the max existing project-scope id +1', async () => {
    const projectScenarioIdPreviousMax = 572;
    await fixtures.GivenPreviousScenario(
      'existing',
      projectScenarioIdPreviousMax,
    );
    const response =
      await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsOwner();
    //ProjectScenarioId will be one because it's the first Scenario in the project
    fixtures.ThenScenarioIsCreatedWithProjectScenarioId(
      response,
      projectScenarioIdPreviousMax + 1,
    );
  });

  it('Creating a scenario that has an internal project-scope id greater then the allowed max (999) will fail', async () => {
    const projectScenarioIdPreviousMax = 999;
    await fixtures.GivenPreviousScenario(
      'existing',
      projectScenarioIdPreviousMax,
    );
    const response =
      await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsOwner(false);
    fixtures.ThenScenarioCouldNotBeCreatedMessageIsReturned(response);
  });

  it('Creating a scenario will succeed because the user is a project contributor', async () => {
    await fixtures.GivenContributorWasAddedToProject();
    const response =
      await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsContributor();
    fixtures.ThenScenarioIsCreated(response);
  });

  it('Creating a scenario will fail because the user is a project viewer', async () => {
    await fixtures.GivenViewerWasAddedToProject();
    const response = await fixtures.WhenCreatingAScenarioAsAProjectViewer();
    fixtures.ThenForbiddenIsReturned(response);
  });

  it('Creating a scenario will fail because the associated project does not have a default cost surface', async () => {
    await fixtures.GivenProjectHasNoDefaultCostSurface();
    const response =
      await fixtures.WhenCreatingAScenarioWithMinimumRequiredDataAsOwner(false);
    fixtures.ThenCostSurfaceNotFoundMessageIsReturned(response);
  });

  it('Creating a scenario with complete data should succeed', async () => {
    const response =
      await fixtures.WhenCreatingAScenarioWithCompleteDataAsOwner();
    fixtures.ThenScenarioAndJobAreCreated(response);
  });

  it('Gets scenarios as a scenario owner', async () => {
    const response = await fixtures.WhenGettingScenariosAsOwner();
    fixtures.ThenAllScenariosFromOwnerAreReturned(response);
  });

  it('Gets scenarios as a scenario contributor', async () => {
    const scenarioId = await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenContributorWasAddedToScenario(scenarioId);

    const response = await fixtures.WhenGettingScenariosAsContributor();

    fixtures.ThenAllScenariosFromContributorAreReturned(response);
  });

  it('Gets scenarios as a scenario viewer', async () => {
    const scenarioId = await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario(scenarioId);
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
    const response =
      await fixtures.WhenGettingPaginatedScenariosWithPageNumberAsOwner();
    fixtures.ThenProperLengthIsReturned(response);
  });

  it(`Gets scenarios with a free search`, async () => {
    const name = 'Find me!';
    const partialName = 'Fin';
    const scenarioId = await fixtures.GivenScenarioWasCreated(name);

    const response =
      await fixtures.WhenGettingScenariosWithFreeSearchAsOwner(partialName);

    fixtures.ThenCorrectScenariosAreReturned(response, { scenarioId, name });
  });

  it('Getting scenario by id response includes cost surface name', async () => {
    await fixtures.GivenScenarioWasCreated('test singular');
    const response =
      await fixtures.WhenGettingScenarioByIdWithCostSurfaceInfo();
    fixtures.ThenCostSurfaceNameIsIncludedInSingularResponse(response);
  });
  it('Getting scenarios response includes cost surface name', async () => {
    await fixtures.GivenScenarioWasCreated('test plural');
    await fixtures.GivenScenarioWasCreated('test plural2');
    const response = await fixtures.WhenGettingScenariosWithCostSurfaceInfo();
    fixtures.ThenCostSurfaceNameIsIncludedInPluralResponse(response);
  });

  it('Contributor fails to delete scenario', async () => {
    const scenarioId = await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenContributorWasAddedToScenario(scenarioId);

    const response = await fixtures.WhenDeletingScenarioAsContributor();

    fixtures.ThenForbiddenIsReturned(response);
  });

  it('Viewer fails to delete scenario', async () => {
    const scenarioId = await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario(scenarioId);
    const response = await fixtures.WhenDeletingScenarioAsViewer();
    fixtures.ThenForbiddenIsReturned(response);
  });

  it('Owner successfully deletes the newly created scenario', async () => {
    const scenarioId = await fixtures.GivenScenarioWasCreated();
    await fixtures.GivenViewerWasAddedToScenario(scenarioId);
    const response = await fixtures.WhenDeletingScenarioAsOwner();
    fixtures.ThenOkIsReturned(response);
  });

  it('should not allow to create scenario with invalid marxan properties', async () => {
    const response =
      await fixtures.WhenCreatingScenarioWithInvalidMarxanProperties();
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
  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );
  const userProjectsRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );
  const scenariosRepo: Repository<Scenario> = app.get(
    getRepositoryToken(Scenario),
  );
  const costSurfaceRepo: Repository<CostSurface> = app.get(
    getRepositoryToken(CostSurface),
  );

  return {
    GivenUserIsLoggedIn: async (user: string) => {
      if (user === 'random') {
        return randomUserInfo.accessToken;
      }
      const userToken = userObj[user as keyof typeof userObj];

      return await GivenUserIsLoggedIn(app, userToken);
    },

    GivenScenarioWasCreated: async (name = 'Test scenario') => {
      const result = await ScenariosTestUtils.createScenario(app, ownerToken, {
        name,
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

    GivenContributorWasAddedToScenario: async (scenarioId: string) =>
      await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      }),

    GivenViewerWasAddedToScenario: async (scenarioId: string) =>
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
    },

    GivenPreviousScenario: async (name: string, projectScenarioId: number) => {
      const costSurface = await costSurfaceRepo.findOneOrFail({
        where: { projectId, isDefault: true },
      });
      const scenario = await scenariosRepo.save({
        name,
        type: ScenarioType.marxan,
        projectId,
        costSurfaceId: costSurface.id,
      });
      await scenariosRepo.save({
        id: scenario.id,
        projectScenarioId,
        costSurfaceId: costSurface.id,
      });
    },
    GivenProjectHasNoDefaultCostSurface: async () => {
      await costSurfaceRepo.delete({ projectId, isDefault: true });
    },

    WhenCreatingAScenarioWithIncompleteData: async () =>
      await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(E2E_CONFIG.scenarios.invalid.missingRequiredFields()),

    WhenCreatingAScenarioWithMinimumRequiredDataAsOwner: async (
      grabId = true,
    ) => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(minimalCreateScenarioDTO);

      if (grabId) {
        scenarioId = response.body.data.id;
      }
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

    WhenGettingScenarioByIdWithCostSurfaceInfo: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}?include=costSurface`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenGettingScenariosWithCostSurfaceInfo: async () =>
      await request(app.getHttpServer())
        .get('/api/v1/scenarios?include=costSurface')
        .set('Authorization', `Bearer ${ownerToken}`),
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

    WhenGettingScenariosWithFreeSearchAsOwner: async (searchWord: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/scenarios?q=${searchWord}`)
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

    ThenScenarioIsCreatedWithProjectScenarioId: (
      response: request.Response,
      projectScenarioId: number,
    ) => {
      expect(response.body.data.type).toBe('scenarios');
      expect(response.body.data.attributes.projectScenarioId).toEqual(
        projectScenarioId,
      );
    },

    ThenScenarioCouldNotBeCreatedMessageIsReturned: (
      response: request.Response,
    ) => {
      expect(response.body.errors[0].title).toEqual(
        `Scenario for Project with id ${projectId} could not be created`,
      );
    },

    ThenCostSurfaceNotFoundMessageIsReturned: (response: request.Response) => {
      expect(response.body.errors[0].title).toEqual(
        `Cost Surface not found for Project with id ${projectId}`,
      );
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
      expect(scenarioNames).toHaveLength(1);
      expect(response.body.meta).toEqual({
        page: expect.any(Number),
        size: expect.any(Number),
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
      });
    },

    ThenCostSurfaceNameIsIncludedInSingularResponse: (
      response: request.Response,
    ) => {
      const resource = response.body.data;
      const includedEntity = response.body.included;
      expect(resource.relationships.costSurface.data.id).toBeDefined();
      expect(includedEntity[0].type).toBe('costSurfaces');
      expect(includedEntity[0].attributes.name).toBeDefined();
      expect(includedEntity[0].attributes.isDefault).toBeDefined();
    },
    ThenCostSurfaceNameIsIncludedInPluralResponse: (
      response: request.Response,
    ) => {
      const resources = response.body.data;
      const includedEntities = response.body.included;
      for (const resource of resources) {
        expect(resource.relationships.costSurface.data.id).toBeDefined();
      }
      for (const includedEntity of includedEntities) {
        expect(includedEntity.type).toBe('costSurfaces');
        expect(includedEntity.attributes.name).toBeDefined();
        expect(includedEntity.attributes.isDefault).toBeDefined();
      }
    },

    ThenAllScenariosFromContributorAreReturned: (
      response: request.Response,
    ) => {
      const resources = response.body.data;

      expect(resources[0].type).toBe('scenarios');
      const scenarioNames: string[] = resources.map(
        (s: any) => s.attributes.name,
      );
      expect(scenarioNames).toHaveLength(1);
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
      expect(scenarioNames).toHaveLength(1);
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
    ThenCorrectScenariosAreReturned: (
      response: request.Response,
      data: { scenarioId: string; name: string },
    ) => {
      const resources = response.body.data;
      expect(resources).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'scenarios',
            attributes: expect.objectContaining({
              id: data.scenarioId,
              name: data.name,
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
