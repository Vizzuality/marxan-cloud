import * as request from 'supertest';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn, userObj } from '../steps/given-user-is-logged-in';
import { GivenUserIsCreated } from '../steps/given-user-is-created';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Repository } from 'typeorm';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GivenUserExists } from '../steps/given-user-exists';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { GivenProjectExists } from '../steps/given-project';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { ScenarioLockDto } from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';

export async function getFixtures() {
  const app = await bootstrapApplication();
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const ownerUserId = await GivenUserExists(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const viewerUserId = await GivenUserExists(app, 'cc');

  const randomUserInfo = await GivenUserIsCreated(app);
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;

  const projectContributorRole = ProjectRoles.project_contributor;
  const projectViewerRole = ProjectRoles.project_viewer;

  const { projectId } = await GivenProjectExists(app, ownerToken);

  let scenarioId: string;
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
      for (const cleanup of cleanups.reverse()) {
        await cleanup();
      }
      await app.close();
    },

    GivenUserIsLoggedIn: async (user: string) => {
      if (user === 'random') {
        return randomUserInfo.accessToken;
      }
      const userToken = userObj[user as keyof typeof userObj];
      return await GivenUserIsLoggedIn(app, userToken);
    },

    GivenOwnerExists: async () => ownerUserId,
    GivenContributorExists: async () => contributorUserId,
    GivenViewerExists: async () => viewerUserId,

    GivenProjectWasCreated: async () => projectId,

    GivenScenarioWasCreated: async () => {
      const result = await ScenariosTestUtils.createScenario(app, ownerToken, {
        name: `Test scenario`,
        type: ScenarioType.marxan,
        projectId,
      });
      scenarioId = result.data.id;

      return scenarioId;
    },

    GivenTwoScenariosWereCreated: async () => {
      const firstScenario = await ScenariosTestUtils.createScenario(
        app,
        ownerToken,
        {
          name: `Test scenario 1`,
          type: ScenarioType.marxan,
          projectId,
        },
      );

      const secondScenario = await ScenariosTestUtils.createScenario(
        app,
        ownerToken,
        {
          name: `Test scenario 2`,
          type: ScenarioType.marxan,
          projectId,
        },
      );

      cleanups.push(
        async () =>
          await ScenariosTestUtils.deleteScenario(
            app,
            ownerToken,
            firstScenario.data.id,
          ),
      );
      cleanups.push(
        async () =>
          await ScenariosTestUtils.deleteScenario(
            app,
            ownerToken,
            secondScenario.data.id,
          ),
      );

      return {
        firstScenarioId: firstScenario.data.id,
        secondScenarioId: secondScenario.data.id,
      };
    },

    GivenContributorWasAddedToProject: async () =>
      await userProjectsRepo.save({
        projectId,
        roleName: projectContributorRole,
        userId: contributorUserId,
      }),

    GivenContributorWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      }),

    GivenContributorIsAddedToScenario: async (
      scenarioId: string,
      userId: string,
    ) =>
      await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioContributorRole,
        userId,
      }),

    GivenViewerWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioViewerRole,
        userId: viewerUserId,
      }),

    GivenViewerWasAddedToProject: async () =>
      await userProjectsRepo.save({
        projectId,
        roleName: projectViewerRole,
        userId: viewerUserId,
      }),

    GivenViewerIsAddedToScenario: async (scenarioId: string, userId: string) =>
      await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioViewerRole,
        userId,
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

    WhenAcquiringLockForScenario: async (scenarioId: string, token: string) =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/lock`)
        .set('Authorization', `Bearer ${token}`),
    WhenAcquiringLockForScenarioAsOwner: async () =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/lock`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenAcquiringLockForScenarioAsContributor: async () =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/lock`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenAcquiringLockForScenarioAsViewer: async () =>
      await request(app.getHttpServer())
        .post(`/api/v1/scenarios/${scenarioId}/lock`)
        .set('Authorization', `Bearer ${viewerToken}`),
    WhenUpdatingScenarioAsOwner: async () =>
      await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${scenarioId}`)
        .send({ name: 'Updated Scenario', description: 'Updated Description' })
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenUpdatingScenarioAsContributor: async () =>
      await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${scenarioId}`)
        .send({ name: 'Updated Scenario', description: 'Updated Description' })
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenReleasingLockForScenario: async (token: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/scenarios/${scenarioId}/release-lock`)
        .set('Authorization', `Bearer ${token}`),
    WhenGettingAllLocksFromProjectId: async (
      projectId: string,
      token: string,
    ) =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/editing-locks`)
        .set('Authorization', `Bearer ${token}`),
    WhenGettingAllLocksFromScenarioId: async (
      scenarioId: string,
      token: string,
    ) =>
      await request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/editing-locks`)
        .set('Authorization', `Bearer ${token}`),

    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },

    ThenBadRequestIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(400);
    },

    ThenOkIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
    },

    ThenLockIsSuccessfullyReleased: (response: request.Response) => {
      expect(response.status).toEqual(204);
    },

    ThenScenarioIsLockedIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(400);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(
        `Scenario ${scenarioId} is already being edited.`,
      );
    },

    ThenScenarioIsLockedByAnotherUserIsReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(400);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual('Scenario lock belong to a different user.');
    },

    ThenScenarioLockInfoForOwnerIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(201);
      expect(response.body.data.scenarioId).toEqual(scenarioId);
      expect(response.body.data.userId).toEqual(ownerUserId);
    },
    ThenScenarioLockInfoForContributorIsReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(201);
      expect(response.body.data.scenarioId).toEqual(scenarioId);
      expect(response.body.data.userId).toEqual(contributorUserId);
    },

    ThenScenarioIsUpdated: (response: request.Response) => {
      expect(response.body.data.type).toBe('scenarios');
      expect(response.body.data.attributes.name).toEqual('Updated Scenario');
      expect(response.body.data.attributes.description).toEqual(
        'Updated Description',
      );
    },

    ThenAllLocksAreReturned: (
      response: request.Response,
      userId: string,
      firstScenarioId: string,
      secondScenarioId: string,
    ) => {
      expect(response.body.data.length).toEqual(2);
      expect(response.body.data).toHaveLength(2);
      const firstScenario = response.body.data.find(
        (s: ScenarioLockDto) => s.scenarioId === firstScenarioId,
      );
      const secondScenario = response.body.data.find(
        (s: ScenarioLockDto) => s.scenarioId === secondScenarioId,
      );
      expect(firstScenario.userId).toEqual(userId);
      expect(secondScenario.userId).toEqual(userId);
    },
    ThenScenarioLockInfoIsReturned: (
      response: request.Response,
      scenarioId: string,
    ) => {
      expect(response.status).toEqual(201);
      expect(response.body.data.scenarioId).toEqual(scenarioId);
      expect(response.body.data.userId).toEqual(ownerUserId);
    },
  };
}
