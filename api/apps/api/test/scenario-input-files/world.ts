import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { bootstrapApplication } from '../utils/api-application';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import * as request from 'supertest';
import * as unzipper from 'unzipper';

export const createWorld = async () => {
  const app = await bootstrapApplication();
  const jwtToken = await GivenUserIsLoggedIn(app);
  const { projectId, cleanup } = await GivenProjectExists(
    app,
    jwtToken,
    {
      countryCode: `NAM`,
      name: `Humanity for living.`,
    },
    {
      name: `Alaska`,
    },
  );
  const scenario = await GivenScenarioExists(app, projectId, jwtToken, {
    name: `Save the world species`,
  });

  // TODO: fill bound.dat
  // TODO: fill puvspr.dat
  // TODO: fill puvspr_sporder.dat
  // TODO: fill spec.dat

  return {
    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, jwtToken, scenario.id);
      await cleanup();
      await app.close();
    },
    WhenGettingInputDat: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenario.id}/marxan/dat/input.dat`)
        .set('Authorization', `Bearer ${jwtToken}`),
    WhenGettingSpecDat: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenario.id}/marxan/dat/spec.dat`)
        .set('Authorization', `Bearer ${jwtToken}`),
    WhenGettingArchivedInput: () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenario.id}/marxan/input`)
        .set('Authorization', `Bearer ${jwtToken}`)
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
  };
};
