import { INestApplication } from '@nestjs/common';
import { v4 } from 'uuid';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { WhenUserGetsScenarioGapAnalysis } from '../steps/when-user-gets-scenario-gap-analysis';
import { bootstrapApplication } from '../utils/api-application';

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
    const scenarioId = v4();
    // TODO seed scenario data

    describe(`when getting scenario's gap analysis`, () => {
      let scenarioData: unknown;
      beforeEach(async () => {
        scenarioData = await WhenUserGetsScenarioGapAnalysis(
          app,
          scenarioId,
          jwtToken,
        );
      });

      it(`resolves to expected data`, () => {
        // TODO match to real data from seeder
        expect(scenarioData).toEqual({
          data: {
            attributes: [
              {
                id: 'fake-feature-id',
                fpf: 1,
                met: 0.47,
                metArea: 5000,
                name: 'fake-feature-name',
                onTarget: false,
                tag: 'tag',
                target: 0.67,
                targetArea: 8000,
                totalArea: 9000,
              },
            ],
            id: scenarioId,
            type: 'features',
          },
        });
      });
    });
  });
});
