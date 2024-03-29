import * as request from 'supertest';
import { bootstrapApplication } from '../../utils/api-application';
import { GivenUserIsLoggedIn } from '../../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../../steps/given-project';
import { GivenUserExists } from '../../steps/given-user-exists';
import { GivenUserIsCreated } from '../../steps/given-user-is-created';
import { GivenUserIsDeleted } from '../../steps/given-user-is-deleted';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
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
  const projectViewerRole = ProjectRoles.project_viewer;
  const projectContributorRole = ProjectRoles.project_contributor;
  const projectOwnerRole = ProjectRoles.project_owner;
  const scenarioOwnerRole = Roles.scenario_owner;
  const userProjectsRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );
  const nonExistentUserId = v4();

  const randomUserInfo = await GivenUserIsCreated(app);

  return {
    GivenProjectWasCreated: async () => {
      const { projectId } = await GivenProjectExists(app, ownerUserToken);

      return projectId;
    },

    GivenViewerWasAddedToProject: async (projectId: string) => {
      return userProjectsRepo.save({
        projectId,
        roleName: projectViewerRole,
        userId: viewerUserId,
      });
    },
    GivenContributorWasAddedToProject: async (projectId: string) => {
      return userProjectsRepo.save({
        projectId,
        roleName: projectContributorRole,
        userId: contributorUserId,
      });
    },
    GivenOwnerWasAddedToProject: async (projectId: string) => {
      return userProjectsRepo.save({
        projectId,
        roleName: projectOwnerRole,
        userId: otherOwnerUserId,
      });
    },

    GivenUserWasAddedToProject: async (projectId: string) => {
      await userProjectsRepo.save({
        projectId,
        userId: randomUserInfo.user.id,
        roleName: projectOwnerRole,
      });
    },
    GivenUserIsDeleted: async () => {
      await GivenUserIsDeleted(app, randomUserInfo.accessToken);
    },

    WhenGettingProjectUsersAsNotInProject: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${otherOwnerUserToken}`),

    WhenGettingProjectUsersAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenGettingProjectUsersWithSearchTerm: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users?q=C C`)
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenGettingProjectUsersWithWrongSearchTerm: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users?q=NotAUser`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    WhenGettingProjectUsersAsContributor: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`),

    WhenGettingProjectUsersAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .get(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`),

    WhenAddingANewViewerToTheProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({ projectId, userId: viewerUserId, roleName: projectViewerRole }),
    WhenAddingANewContributorToTheProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: contributorUserId,
          roleName: projectContributorRole,
        }),
    WhenAddingANewOwnerToTheProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectOwnerRole,
        }),
    WhenChangingOwnerUserRoleAsLastOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: ownerUserId,
          roleName: projectViewerRole,
        }),
    WhenAddingANewViewerToTheProjectAsContributor: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`)
        .send({ projectId, userId: viewerUserId, roleName: projectViewerRole }),
    WhenAddingANewContributorToTheProjectAsContributor: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectContributorRole,
        }),
    WhenAddingANewOwnerToTheProjectAsContributor: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${contributorUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectOwnerRole,
        }),
    WhenAddingANewViewerToTheProjectAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectViewerRole,
        }),
    WhenAddingANewContributorToTheProjectAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`)
        .send({
          projectId,
          userId: contributorUserId,
          roleName: projectContributorRole,
        }),
    WhenAddingANewOwnerToTheProjectAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${viewerUserToken}`)
        .send({
          projectId,
          userId: otherOwnerUserId,
          roleName: projectOwnerRole,
        }),
    WhenChangingUserRole: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: viewerUserId,
          roleName: projectContributorRole,
        }),
    WhenChangingUserRoleForDeletedUser: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: randomUserInfo.user.id,
          roleName: projectContributorRole,
        }),
    WhenAddingIncorrectUserRole: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: viewerUserId,
          roleName: scenarioOwnerRole,
        }),
    WhenAddingNonsenseUserId: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: 'nonsense',
          roleName: projectOwnerRole,
        }),

    WhenAddingNonExistentUserId: async (projectId: string) =>
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/projects/${projectId}/users`)
        .set('Authorization', `Bearer ${ownerUserToken}`)
        .send({
          projectId,
          userId: nonExistentUserId,
          roleName: projectOwnerRole,
        }),
    WhenRevokingAccessToViewerFromProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${viewerUserId}`)
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenRevokingAccessToContributorFromProjectAsOwner: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(
          `/api/v1/roles/projects/${projectId}/users/${contributorUserId}`,
        )
        .set('Authorization', `Bearer ${ownerUserToken}`),
    WhenRevokingAccessToOwnerFromProjectAsOwner: async (projectId: string) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${otherOwnerUserId}`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    WhenRevokingAccessToViewerFromProjectAsContributor: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${viewerUserId}`)
        .set('Authorization', `Bearer ${contributorUserToken}`),
    WhenRevokingAccessToContributorFromProjectAsViewer: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(
          `/api/v1/roles/projects/${projectId}/users/${contributorUserId}`,
        )
        .set('Authorization', `Bearer ${viewerUserToken}`),
    WhenRevokingAccessToOwnerFromProjectAsViewer: async (projectId: string) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${otherOwnerUserId}`)
        .set('Authorization', `Bearer ${viewerUserToken}`),
    WhenRevokingAccessToOwnerFromProjectAsContributor: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${otherOwnerUserId}`)
        .set('Authorization', `Bearer ${contributorUserToken}`),

    WhenRevokingAccessToLastOwnerFromProjectAsOwner: async (
      projectId: string,
    ) =>
      await request(app.getHttpServer())
        .delete(`/api/v1/roles/projects/${projectId}/users/${ownerUserId}`)
        .set('Authorization', `Bearer ${ownerUserToken}`),

    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
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

    ThenUserNotFoundIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(404);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(
        `User with ID: ${nonExistentUserId} could not be found.`,
      );
    },

    ThenTransactionFailedIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(500);
      const error: any = response.body.errors[0];
      expect(error.title).toEqual(`Transaction failed.`);
    },

    ThenNoContentIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(204);
    },

    ThenSingleOwnerUserInProjectIsReturned: (response: request.Response) => {
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

    ThenAllUsersInProjectAfterAddingAnOwnerAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);
      const newUserCreated = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      expect(newUserCreated.roleName).toEqual(projectOwnerRole);
    },

    ThenOwnerAndViewerInProjectAreReturned: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);

      const projectRoleNames: string[] = response.body.data.map(
        (p: any) => p.roleName,
      );

      expect(projectRoleNames.sort()).toEqual([
        projectOwnerRole,
        projectViewerRole,
      ]);
    },

    ThenOwnerAndContributorInProjectAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);

      const projectRoleNames: string[] = response.body.data.map(
        (p: any) => p.roleName,
      );

      expect(projectRoleNames.sort()).toEqual([
        projectContributorRole,
        projectOwnerRole,
      ]);
    },

    ThenAllUsersInProjectAfterEveryTypeOfUserHasBeenAddedAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(4);
    },
    ThenUsersWithChangedRoleIsOnProject: (response: request.Response) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);
      const newUserCreated = response.body.data.find(
        (user: any) => user.user.id === viewerUserId,
      );
      expect(newUserCreated.roleName).toEqual(projectContributorRole);
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
      expect(firstUser.roleName).toEqual(projectContributorRole);
      expect(secondUser.roleName).toEqual(projectOwnerRole);
      expect(thirdUser.roleName).toEqual(projectOwnerRole);
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
      expect(firstUser.roleName).toEqual(projectContributorRole);
      expect(secondUser.roleName).toEqual(projectOwnerRole);
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
      expect(firstUser.roleName).toEqual(projectOwnerRole);
      expect(secondUser.roleName).toEqual(projectOwnerRole);
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
      expect(firstUser.roleName).toEqual(projectOwnerRole);
      expect(secondUser.roleName).toEqual(projectOwnerRole);
      expect(thirdUser.roleName).toEqual(projectContributorRole);
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
      expect(firstUser.roleName).toEqual(projectOwnerRole);
      expect(secondUser.roleName).toEqual(projectContributorRole);
    },
  };
};
