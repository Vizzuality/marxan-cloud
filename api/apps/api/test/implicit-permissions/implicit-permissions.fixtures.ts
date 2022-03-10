import * as request from 'supertest';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn, userObj } from '../steps/given-user-is-logged-in';
import { GivenUserIsCreated } from '../steps/given-user-is-created';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GivenUserExists } from '../steps/given-user-exists';
import { GivenProjectExists } from '../steps/given-project';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { assertDefined } from '@marxan/utils';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';

export async function getFixtures() {
  const app = await bootstrapApplication();
  const creatorToken = await GivenUserIsLoggedIn(app, 'aa');
  const ownerToken = await GivenUserIsLoggedIn(app, 'dd');
  const creatorUserId = await GivenUserExists(app, 'aa');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const ownerUserId = await GivenUserExists(app, 'dd');

  const randomUserInfo = await GivenUserIsCreated(app);
  assertDefined(randomUserInfo.user.id);
  const randomUserId = randomUserInfo.user.id;

  const projectOwnerRole = ProjectRoles.project_owner;
  const projectContributorRole = ProjectRoles.project_contributor;
  const projectViewerRole = ProjectRoles.project_viewer;

  const scenarioOwnerRole = ScenarioRoles.scenario_owner;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;

  const { projectId } = await GivenProjectExists(app, creatorToken, {
    countryCode: 'BWA',
  });

  let scenarioId: string;

  const userProjectsRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );
  const usersRepo: Repository<User> = app.get(getRepositoryToken(User));

  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, creatorToken, scenarioId);
      await ProjectsTestUtils.deleteProject(app, creatorToken, projectId);
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

    GivenProjectWasCreated: async () => projectId,

    GivenScenarioWasCreated: async () => {
      const result = await ScenariosTestUtils.createScenario(
        app,
        creatorToken,
        {
          name: `Test scenario`,
          type: ScenarioType.marxan,
          projectId,
        },
      );
      scenarioId = result.data.id;

      return scenarioId;
    },

    GivenOwnerWasAddedToProject: async () =>
      await userProjectsRepo.save({
        projectId,
        roleName: projectOwnerRole,
        userId: ownerUserId,
      }),

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

    GivenUserWasAddedToProject: async () => {
      await userProjectsRepo.save({
        projectId,
        userId: randomUserInfo.user.id,
        roleName: projectContributorRole,
      });
      cleanups.push(async () => {
        await usersRepo.delete({ id: randomUserInfo.user.id });
        return;
      });
      return randomUserId;
    },

    WhenDeletingAllUsersExceptCreatorFromProject: async () => {
      await userProjectsRepo.delete({ userId: contributorUserId, projectId });
      await userProjectsRepo.delete({ userId: viewerUserId, projectId });
      await userProjectsRepo.delete({ userId: ownerUserId, projectId });
    },

    WhenChangingAllUsersExceptCreatorRole: async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          projectId,
          userId: contributorUserId,
          roleName: projectViewerRole,
        });
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          projectId,
          userId: ownerUserId,
          roleName: projectContributorRole,
        });
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          projectId,
          userId: viewerUserId,
          roleName: projectOwnerRole,
        });
    },

    WhenChangingCreatorRoleInProject: async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          projectId,
          userId: creatorUserId,
          roleName: projectContributorRole,
        });
    },

    WhenGettingScenarioUsers: async (scenarioId: string, token: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${token}`),

    ThenAllUsersInProjectAreReturnedWithTheProperRoleInScenario: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(4);
      const creatorUser = response.body.data.find(
        (user: any) => user.user.id === creatorUserId,
      );
      expect(creatorUser.roleName).toEqual(scenarioOwnerRole);
      const ownerUser = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      expect(ownerUser.roleName).toEqual(scenarioOwnerRole);
      const contributorUser = response.body.data.find(
        (user: any) => user.user.id === contributorUserId,
      );
      expect(contributorUser.roleName).toEqual(scenarioContributorRole);
      const viewerUser = response.body.data.find(
        (user: any) => user.user.id === viewerUserId,
      );
      expect(viewerUser.roleName).toEqual(scenarioViewerRole);
    },
    ThenOnlyCreatorIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(1);
      const creatorUser = response.body.data.find(
        (user: any) => user.user.id === creatorUserId,
      );
      expect(creatorUser.roleName).toEqual(scenarioOwnerRole);
    },
    ThenBothOwnersShouldBeReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);
      const creatorUser = response.body.data.find(
        (user: any) => user.user.id === creatorUserId,
      );
      expect(creatorUser.roleName).toEqual(scenarioOwnerRole);
      const ownerUser = response.body.data.find(
        (user: any) => user.user.id === creatorUserId,
      );
      expect(ownerUser.roleName).toEqual(scenarioOwnerRole);
    },
    ThenUsersWithChangedRolesShouldBeReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(4);
      const creatorUser = response.body.data.find(
        (user: any) => user.user.id === creatorUserId,
      );
      expect(creatorUser.roleName).toEqual(scenarioOwnerRole);
      const contributorUser = response.body.data.find(
        (user: any) => user.user.id === contributorUserId,
      );
      expect(contributorUser.roleName).toEqual(scenarioViewerRole);
      const viewerUser = response.body.data.find(
        (user: any) => user.user.id === viewerUserId,
      );
      expect(viewerUser.roleName).toEqual(scenarioOwnerRole);
      const ownerUser = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      expect(ownerUser.roleName).toEqual(scenarioContributorRole);
    },
  };
}
