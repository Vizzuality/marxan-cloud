import * as request from 'supertest';
import { bootstrapApplication } from '../../utils/api-application';
import { GivenUserIsLoggedIn } from '../../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../../steps/given-project';
import { GivenUserExists } from '../../steps/given-user-exists';
import { Roles } from '@marxan-api/modules/access-control/role.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsTestUtils } from '../../utils/projects.test.utils';
import { ScenariosTestUtils } from '../../utils/scenarios.test.utils';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { ScenarioType } from '@marxan-api/modules/scenarios/scenario.api.entity';

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
  const scenarioViewerRole = Roles.scenario_viewer;
  const scenarioContributorRole = Roles.scenario_contributor;
  const scenarioOwnerRole = Roles.scenario_owner;
  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );

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

    ThenAllUsersinScenarioAfterAddingAnOwnerAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(2);
      const newUserCreated = response.body.data.find(
        (user: any) => user.user.id === ownerUserId,
      );
      expect(newUserCreated.roleName).toEqual(scenarioOwnerRole);
    },

    ThenAllUsersinScenarioAfterEveryTypeOfUserHasBeenAddedAreReturned: (
      response: request.Response,
    ) => {
      expect(response.status).toEqual(200);
      expect(response.body.data).toHaveLength(4);
    },
  };
};
