import * as stream from 'stream';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { streamToArray } from '@marxan/utils/tests/stream-to-array';

import { FeatureIdToScenarioFeatureData } from '../feature-id-to-scenario-feature-data';
import { OutputLineToDataTransformer } from './output-line-to-data.transformer';

let fixtures: FixtureType<typeof getFixtures>;
let sut: OutputLineToDataTransformer;

beforeEach(async () => {
  fixtures = await getFixtures();
  sut = new OutputLineToDataTransformer(fixtures.withMapping());
});

describe(`when piece of data has incorrect values`, () => {
  it(`should throw`, async () => {
    await expect(
      fixtures.resolvesTo(fixtures.withInvalidOutput().pipe(sut)),
    ).rejects.toMatchSnapshot();
  });
});

describe(`when every piece of data is valid`, () => {
  it(`should return parsed data`, async () => {
    const results = await fixtures.resolvesTo(
      fixtures.withValidOutput().pipe(sut),
    );
    expect(results).toMatchInlineSnapshot(`
      Array [
        ScenarioFeatureRunData {
          "amount": 0,
          "featureScenarioId": "4242a3d3-0433-4f1b-b264-685f6461abcf",
          "mpm": 1,
          "occurrences": 0,
          "runId": 0,
          "separation": 3306597,
          "target": false,
          "totalArea": 0,
        },
        ScenarioFeatureRunData {
          "amount": 0,
          "featureScenarioId": "5c7ce4eb-ab61-4dba-adf3-f34c44366d72",
          "mpm": 0,
          "occurrences": 0,
          "runId": 0,
          "separation": 3306597,
          "target": false,
          "totalArea": 1,
        },
        ScenarioFeatureRunData {
          "amount": 30000,
          "featureScenarioId": "79b524b0-ccae-4073-9a16-8855a9658172",
          "mpm": 1,
          "occurrences": 1,
          "runId": 0,
          "separation": 3306597,
          "target": true,
          "totalArea": 1,
        },
      ]
    `);
  });
});

const getFixtures = async () => {
  return {
    withMapping: (): FeatureIdToScenarioFeatureData => ({
      1: {
        id: `8de6c866-f98b-4f7d-8ef3-b5db5ae80d97`,
        prop: 0.5,
      },
      2: {
        id: `de450c37-889e-4817-8ec6-d16bd5cb47ce`,
        prop: 0.5,
      },
      3: {
        id: `fc4ad6dc-a2c1-48e2-9af5-ad8373b05d6e`,
        prop: 0.5,
      },
      4: {
        id: `79b524b0-ccae-4073-9a16-8855a9658172`,
        prop: 0.5,
      },
      5: {
        id: `5c7ce4eb-ab61-4dba-adf3-f34c44366d72`,
        prop: 0.5,
      },
      6: {
        id: `4242a3d3-0433-4f1b-b264-685f6461abcf`,
        prop: 0.5,
      },
    }),
    withValidOutput: () =>
      stream.Readable.from(
        `0,6,VALUE_6,0.000000,0.000000,0,0,0,3306597,,1.000000
0,5,VALUE_5,0.500000,0.000000,0,0,0,3306597,no,0.000000
0,4,VALUE_4,0.500000,30000.000000,0,1,0,3306597,yes,1.000000`.split(`\n`),
        {
          objectMode: true,
        },
      ),
    withInvalidOutput: () =>
      stream.Readable.from(
        `,a,VALUE_6,string-value-1,string-value-2,string-value-3,string-value-4,string-value-5,string-value-6,,string-value-7`.split(
          `\n`,
        ),
        {
          objectMode: true,
        },
      ),
    resolvesTo: async (stream: OutputLineToDataTransformer) =>
      streamToArray(stream),
  };
};
