import { INestApplication } from '@nestjs/common';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { WhenUserGetsScenarioGapAnalysis } from '../steps/when-user-gets-scenario-gap-analysis';
import { bootstrapApplication } from '../utils/api-application';
import { WhenScenarioHasPreGapData } from './steps/when-scenario-has-pre-gap-data';
import { tearDown } from '../utils/tear-down';

let app: INestApplication;
let jwtToken: string;

beforeAll(async () => {
  app = await bootstrapApplication();
  jwtToken = await GivenUserIsLoggedIn(app);
});

afterAll(async () => {
  await Promise.all([app.close()]);
  await tearDown();
});

describe(`when user is logged in`, () => {
  describe.skip(`when scenario exists`, () => {
    let scenarioId: string;

    beforeEach(async () => {
      const seeds = await WhenScenarioHasPreGapData(app);
      scenarioId = seeds.scenarioId;
    });

    describe(`when getting scenario's gap analysis`, () => {
      let scenarioData: any;
      beforeEach(async () => {
        scenarioData = await WhenUserGetsScenarioGapAnalysis(
          app,
          scenarioId,
          jwtToken,
        );
      });

      it(`resolves to expected data`, () => {
        expect(scenarioData.data.map((entry: any) => entry.attributes))
          .toMatchInlineSnapshot(`
          Array [
            Object {
              "coverageTarget": 17,
              "coverageTargetArea": 7579079805.92,
              "met": 110.94,
              "metArea": 49461858904.37,
              "onTarget": true,
              "tag": "species",
              "totalArea": 44582822387.74,
            },
            Object {
              "coverageTarget": 17,
              "coverageTargetArea": 402884147.56,
              "met": 0,
              "metArea": 0,
              "onTarget": false,
              "tag": "species",
              "totalArea": 2369906750.34,
            },
            Object {
              "coverageTarget": 17,
              "coverageTargetArea": 1284680028.29,
              "met": 0,
              "metArea": 0,
              "onTarget": false,
              "tag": "species",
              "totalArea": 7556941342.9,
            },
            Object {
              "coverageTarget": 17,
              "coverageTargetArea": 2972007007.67,
              "met": 237.02,
              "metArea": 41436305173.17,
              "onTarget": true,
              "tag": "species",
              "totalArea": 17482394162.77,
            },
            Object {
              "coverageTarget": 17,
              "coverageTargetArea": 7981963953.47,
              "met": 105.34,
              "metArea": 49461858904.37,
              "onTarget": true,
              "tag": "species",
              "totalArea": 46952729138.08,
            },
            Object {
              "coverageTarget": 17,
              "coverageTargetArea": 4897660171.3,
              "met": 163.6,
              "metArea": 47131396118.24,
              "onTarget": true,
              "tag": "species",
              "totalArea": 28809765713.5,
            },
            Object {
              "coverageTarget": 17,
              "coverageTargetArea": 3084303782.18,
              "met": 12.84,
              "metArea": 2330463199.05,
              "onTarget": false,
              "tag": "species",
              "totalArea": 18142963424.57,
            },
          ]
        `);
      });
    });
  });
});
