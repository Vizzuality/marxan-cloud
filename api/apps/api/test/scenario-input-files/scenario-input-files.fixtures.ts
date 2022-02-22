import * as request from 'supertest';
import * as unzipper from 'unzipper';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';

import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { bootstrapApplication } from '../utils/api-application';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import { GivenUserExists } from '../steps/given-user-exists';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const userNotInScenarioToken = await GivenUserIsLoggedIn(app, 'dd');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;
  const { projectId, cleanup } = await GivenProjectExists(
    app,
    ownerToken,
    {
      countryCode: `NAM`,
      name: `Humanity for living.`,
    },
    {
      name: `Alaska`,
    },
  );
  const scenario = await GivenScenarioExists(app, projectId, ownerToken, {
    name: `Save the world species`,
  });
  const scenarioId = scenario.id;
  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );

  // TODO: fill bound.dat
  // TODO: fill puvspr.dat
  // TODO: fill puvspr_sporder.dat
  // TODO: fill spec.dat

  return {
    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, ownerToken, scenario.id);
      await cleanup();
      await app.close();
    },
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
    WhenGettingInputDatAsOwner: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/input.dat`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenGettingInputDatAsContributor: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/input.dat`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenGettingInputDatAsViewer: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/input.dat`)
        .set('Authorization', `Bearer ${viewerToken}`),
    WhenGettingInputDatAsUserNotInScenario: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/input.dat`)
        .set('Authorization', `Bearer ${userNotInScenarioToken}`),
    WhenGettingSpecDatAsOwner: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/spec.dat`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenGettingSpecDatAsContributor: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/spec.dat`)
        .set('Authorization', `Bearer ${contributorToken}`),
    WhenGettingSpecDatAsViewer: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/spec.dat`)
        .set('Authorization', `Bearer ${viewerToken}`),
    WhenGettingSpecDatAsUserNotInScenario: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/dat/spec.dat`)
        .set('Authorization', `Bearer ${userNotInScenarioToken}`),
    WhenGettingArchivedInputAsOwner: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/input`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .responseType('blob'),
    WhenGettingArchivedInputAsContributor: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/input`)
        .set('Authorization', `Bearer ${contributorToken}`)
        .responseType('blob'),
    WhenGettingArchivedInputAsViewer: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/input`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .responseType('blob'),
    WhenGettingArchivedInputAsUserNotInScenario: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/input`)
        .set('Authorization', `Bearer ${userNotInScenarioToken}`)
        .responseType('blob'),
    ThenArchiveContainsRequiredFiles: async (response: request.Response) => {
      expect(response.header['content-type']).toEqual('application/zip');
      expect(response.header[`content-disposition`]).toEqual(
        `attachment; filename="input.zip"`,
      );
      const directory = await unzipper.Open.buffer(response.body);
      expect(directory.files.map((f) => f.path)).toEqual([
        'input/pu.dat',
        'input.dat',
        'input/spec.dat',
        'input/bound.dat',
        'input/puvspr.dat',
      ]);
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      expect(response.status).toEqual(403);
    },
  };
};
