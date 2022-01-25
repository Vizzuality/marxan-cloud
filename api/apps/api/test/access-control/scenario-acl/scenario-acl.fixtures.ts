import * as request from 'supertest';
import { bootstrapApplication } from '../../utils/api-application';
import { GivenUserIsLoggedIn } from '../../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../../steps/given-project';
import { GivenUserExists } from '../../steps/given-user-exists';
import { GivenUserIsCreated } from '../../steps/given-user-is-created';
import { GivenUserIsDeleted } from '../../steps/given-user-is-deleted';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsTestUtils } from '../../utils/projects.test.utils';
import { ScenariosTestUtils } from '../../utils/scenarios.test.utils';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { v4 } from 'uuid';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerUserToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorUserToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerUserToken = await GivenUserIsLoggedIn(app, 'cc');
  const otherOwnerUserToken = await GivenUserIsLoggedIn(app, 'dd');
  const ownerUserId = await GivenUserExists(app, 'aa');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const otherOwnerUserId = await GivenUserExists(app, 'dd');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const scenarioOwnerRole = ScenarioRoles.scenario_owner;
  const projectOwnerRole = Roles.project_owner;
  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );
  const nonExistentUserId = v4();
  const randomUserInfo = await GivenUserIsCreated(app);

  const { projectId } = await GivenProjectExists(
    app,
    ownerUserToken,
    {
      countryCode: 'AGO',
      name: `Project name ${Date.now()}`,
    },
    {
      name: `Org name ${Date.now()}`,
    },
  );

  let scenarioId: string;

  const cleanups: (() => Promise<void>)[] = [];

  return {
    cleanup: async () => {
      await ProjectsTestUtils.deleteProject(app, ownerUserToken, projectId);
      await ScenariosTestUtils.deleteScenario(app, ownerUserToken, scenarioId);
      for (const cleanup of cleanups.reverse()) {
        await cleanup();
      }
      await app.close();
    },

    GivenScenarioWasCreated: async () => {
      const result = await ScenariosTestUtils.createScenario(
        app,
        ownerUserToken,
        {
          name: `Test scenario`,
          type: ScenarioType.marxan,
          projectId,
        },
      );
      scenarioId = result.data.id;
      return result.data.id;
    },
    GivenViewerWasAddedToScenario: async (scenarioId: string) => {
      const userCreated = await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioViewerRole,
        userId: viewerUserId,
      });
      return userCreated;
    },
    GivenContributorWasAddedToScenario: async (scenarioId: string) => {
      const userCreated = await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      });
      return userCreated;
    },
    GivenOwnerWasAddedToScenario: async (scenarioId: string) => {
      const userCreated = await userScenariosRepo.save({
        scenarioId,
        roleName: scenarioOwnerRole,
        userId: otherOwnerUserId,
      });
      return userCreated;
    },
    GivenUserWasAddedToScenario: async (scenarioId: string) => {
      await userScenariosRepo.save({
        scenarioId,
        userId: randomUserInfo.user.id,
        roleName: scenarioOwnerRole,
      });
    },
    GivenUserIsDeleted: async () => {
      await GivenUserIsDeleted(app, randomUserInfo.accessToken);
    },

    WhenGettingScenarioUsersAsNotInScenario: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${otherOwnerUserToken}`),

    WhenGettingScenarioUsersAsOwner: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenGettingScenarioUsersWithSearchTerm: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/scenarios/${scenarioId}/users?q=C C`)
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenGettingScenarioUsersWithWrongSearchTerm: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/scenarios/${scenarioId}/users?q=NotAUser`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    WhenGettingScenarioUsersAsContributor: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`),

    WhenGettingScenarioUsersAsViewer: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`),

    WhenAddingANewViewerToTheScenarioAsOwner: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          scenarioId,
          userId: viewerUserId,
          roleName: scenarioViewerRole,
        }),
    WhenAddingANewContributorToTheScenarioAsOwner: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          scenarioId,
          userId: contributorUserId,
          roleName: scenarioContributorRole,
        }),
    WhenAddingANewOwnerToTheScenarioAsOwner: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          scenarioId,
          userId: otherOwnerUserId,
          roleName: scenarioOwnerRole,
        }),
    WhenAddingANewViewerToTheScenarioAsContributor: async (
      scenarioId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`)
        .send({
          scenarioId,
          userId: viewerUserId,
          roleName: scenarioViewerRole,
        }),
    WhenAddingANewContributorToTheScenarioAsContributor: async (
      scenarioId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`)
        .send({
          scenarioId,
          userId: otherOwnerUserId,
          roleName: scenarioContributorRole,
        }),
    WhenAddingANewOwnerToTheScenarioAsContributor: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`)
        .send({
          scenarioId,
          userId: otherOwnerUserId,
          roleName: scenarioOwnerRole,
        }),
    WhenAddingANewViewerToTheScenarioAsViewer: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`)
        .send({
          scenarioId,
          userId: otherOwnerUserId,
          roleName: scenarioViewerRole,
        }),
    WhenAddingANewContributorToTheScenarioAsViewer: async (
      scenarioId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`)
        .send({
          scenarioId,
          userId: contributorUserId,
          roleName: scenarioContributorRole,
        }),
    WhenAddingANewOwnerToTheScenarioAsViewer: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`)
        .send({
          scenarioId,
          userId: otherOwnerUserId,
          roleName: scenarioOwnerRole,
        }),
    WhenChangingUserRole: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          scenarioId,
          userId: viewerUserId,
          roleName: scenarioContributorRole,
        }),
    WhenAddingIncorrectUserRole: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          scenarioId,
          userId: viewerUserId,
          roleName: projectOwnerRole,
        }),
    WhenAddingNonsenseUserId: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          scenarioId,
          userId: 'nonsense',
          roleName: scenarioOwnerRole,
        }),

    WhenAddingNonExistentUserId: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/scenarios/${scenarioId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          scenarioId,
          userId: nonExistentUserId,
          roleName: scenarioOwnerRole,
        }),
    WhenRevokingAccessToViewerFromScenarioAsOwner: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/scenarios/${scenarioId}/users/${viewerUserId}`)
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenRevokingAccessToContributorFromScenarioAsOwner: async (
      scenarioId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(
          `/api/v1/roles/scenarios/${scenarioId}/users/${contributorUserId}`,
        )
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenRevokingAccessToOwnerFromScenarioAsOwner: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .delete(
          `/api/v1/roles/scenarios/${scenarioId}/users/${otherOwnerUserId}`,
        )
        .set('Authorization', `Bearer ${ownerUserToken}`),

    WhenRevokingAccessToViewerFromScenarioAsContributor: async (
      scenarioId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/scenarios/${scenarioId}/users/${viewerUserId}`)
        .set('Authorization', `Bearer ${contributorUserToken}`),
    WhenRevokingAccessToContributorFromScenarioAsViewer: async (
      scenarioId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(
          `/api/v1/roles/scenarios/${scenarioId}/users/${contributorUserId}`,
        )
        .set('Authorization', `Bearer ${viewerUserToken}`),
    WhenRevokingAccessToOwnerFromScenarioAsViewer: async (scenarioId: string) =>
      await request(app.getHttpServer())
        .delete(
          `/api/v1/roles/scenarios/${scenarioId}/users/${otherOwnerUserId}`,
        )
        .set('Authorization', `Bearer ${viewerUserToken}`),
    WhenRevokingAccessToOwnerFromScenarioAsContributor: async (
      scenarioId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(
          `/api/v1/roles/scenarios/${scenarioId}/users/${otherOwnerUserId}`,
        )
        .set('Authorization', `Bearer ${contributorUserToken}`),

    WhenRevokingAccessToLastOwnerFromScenarioAsOwner: async (
      scenarioId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/scenarios/${scenarioId}/users/${ownerUserId}`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },

    ThenNoContentIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(204);
    },

    ThenBadRequestAndUserIdMessageIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(400);
      const error: any = response.body.errors[0].meta.rawError.response;
      expect(error?.message[0]).toEqual('userId must be an UUID');
    },

    ThenBadRequestAndEnumMessageIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(400);
      const error: any = response.body.errors[0].meta.rawError.response;
      expect(error?.message[0]).toEqual('roleName must be a valid enum value');
    },

    ThenQueryFailedReturned: (response: request.Response) => {
      expect(response.status).toEqual(400);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(`Error while adding record to the database`);
    },

    ThenSingleOwnerUserInScenarioIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(1);
    },

    ThenViewerUserInformationIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].user.displayName).toEqual('User C C');
      expect(response.body.data[0].user.id).toEqual(viewerUserId);
    },

    ThenNoUserInformationIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(0);
    },

    ThenAllUsersInScenarioAfterAddingAnOwnerAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);
      const newUserCreated = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      expect(newUserCreated.roleName).toEqual(scenarioOwnerRole);
    },

    ThenAllUsersInScenarioAfterEveryTypeOfUserHasBeenAddedAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(4);
    },
    ThenUsersWithChangedRoleIsOnScenario: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);
      const newUserCreated = response.body.data.find(
        (user: any) => user.user.id === viewerUserId,
      );
      expect(newUserCreated.roleName).toEqual(scenarioContributorRole);
    },
    ThenThreeCorrectUsersAreReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(3);
      const firstUser = response.body.data.find(
        (user: any) => user.user.id === viewerUserId,
      );
      const secondUser = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      const thirdUser = response.body.data.find(
        (user: any) => user.user.id === otherOwnerUserId,
      );
      expect(firstUser.roleName).toEqual(scenarioContributorRole);
      expect(secondUser.roleName).toEqual(scenarioOwnerRole);
      expect(thirdUser.roleName).toEqual(scenarioOwnerRole);
    },
    ThenCorrectUsersAreReturnedAfterDeletionAndChangingRole: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);
      const firstUser = response.body.data.find(
        (user: any) => user.user.id === viewerUserId,
      );
      const secondUser = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      expect(firstUser.roleName).toEqual(scenarioContributorRole);
      expect(secondUser.roleName).toEqual(scenarioOwnerRole);
    },
    ThenLastTwoCorrectUsersAreReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);
      const firstUser = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      const secondUser = response.body.data.find(
        (user: any) => user.user.id === otherOwnerUserId,
      );
      expect(firstUser.roleName).toEqual(scenarioOwnerRole);
      expect(secondUser.roleName).toEqual(scenarioOwnerRole);
    },
    ThenAllUsersBeforeDeletingAnyFromAppAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(3);
      const firstUser = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      const secondUser = response.body.data.find(
        (user: any) => user.user.id === randomUserInfo.user.id,
      );
      const thirdUser = response.body.data.find(
        (user: any) => user.user.id === contributorUserId,
      );
      expect(firstUser.roleName).toEqual(scenarioOwnerRole);
      expect(secondUser.roleName).toEqual(scenarioOwnerRole);
      expect(thirdUser.roleName).toEqual(scenarioContributorRole);
    },
    ThenAllUsersExceptDeletedAreReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);
      const firstUser = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      const secondUser = response.body.data.find(
        (user: any) => user.user.id === contributorUserId,
      );
      expect(firstUser.roleName).toEqual(scenarioOwnerRole);
      expect(secondUser.roleName).toEqual(scenarioContributorRole);
    },
  };
};
