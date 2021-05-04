import { INestApplication } from '@nestjs/common';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { WhenUserGetsScenarioGapAnalysis } from '../steps/when-user-gets-scenario-gap-analysis';
import { bootstrapApplication } from '../utils/api-application';
import { WhenScenarioHasPreGapData } from './steps/when-scenario-has-pre-gap-data';

let app: INestApplication;
let jwtToken: string;

beforeAll(async () => {
  app = await bootstrapApplication();
  jwtToken = await GivenUserIsLoggedIn(app);
});

afterAll(async () => {
  await Promise.all([app.close()]);
});

describe(`when user is logged in`, () => {
  describe(`when scenario exists`, () => {
    let scenarioId: string;

    beforeEach(async () => {
      const seeds = await WhenScenarioHasPreGapData(app);
      scenarioId = seeds.scenarioId;
    });

    describe.skip(`when getting scenario's gap analysis`, () => {
      let scenarioData: unknown;
      beforeEach(async () => {
        scenarioData = await WhenUserGetsScenarioGapAnalysis(
          app,
          scenarioId,
          jwtToken,
        );
      });

      it(`resolves to expected data`, () => {
        expect(scenarioData).toEqual({
          data: {},
        });
      });
    });
  });
});
