import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import {
  FeatureMetadata,
  GetFeatureMetadata,
} from './ports/get-feature-metadata';
import {
  FeatureNumbers,
  GetNonGeoFeatureData,
} from './ports/get-non-geo-feature-data';
import { ScenarioFeaturesService } from './scenario-features.service';

let sut: ScenarioFeaturesService;
let metadataPort: FakeGetFeatureMetadata;
let nonGeoPort: FakeGetNonGeoFeatureData;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: GetFeatureMetadata,
        useClass: FakeGetFeatureMetadata,
      },
      {
        provide: GetNonGeoFeatureData,
        useClass: FakeGetNonGeoFeatureData,
      },
      ScenarioFeaturesService,
    ],
  }).compile();

  sut = sandbox.get(ScenarioFeaturesService);
  metadataPort = sandbox.get(GetFeatureMetadata);
  nonGeoPort = sandbox.get(GetNonGeoFeatureData);
});

describe(`find features with metadata and non-geo stats`, () => {
  const scenarioId = 'scenario-id';
  let results: unknown;

  beforeEach(async () => {
    results = await sut.getFeatures(scenarioId);
  });

  it(`proxies scenarioId to both ports`, () => {
    expect(metadataPort.caller.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "scenario-id",
        ],
      ]
    `);
    expect(nonGeoPort.caller.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "scenario-id",
        ],
      ]
    `);
  });

  it(`returns computed data`, () => {
    expect(results).toMatchInlineSnapshot(`
      Array [
        Object {
          "fpf": 1,
          "id": "feature-id-1",
          "met": 0.6,
          "metArea": 3000,
          "name": "Feature-1",
          "onTarget": true,
          "tag": "Feature Tag",
          "target": 50,
          "targetArea": 2500,
          "totalArea": 5000,
        },
        Object {
          "fpf": 1,
          "id": "feature-id-2",
          "met": 0.1,
          "metArea": 1000,
          "name": "Feature-2",
          "onTarget": false,
          "tag": "Feature Tag",
          "target": 30,
          "targetArea": 3000,
          "totalArea": 10000,
        },
      ]
    `);
  });
});

@Injectable()
class FakeGetFeatureMetadata implements GetFeatureMetadata {
  caller = jest.fn();

  async resolve(scenarioId: string): Promise<FeatureMetadata[]> {
    this.caller(scenarioId);
    return [
      {
        name: `Feature-1`,
        tag: `Feature Tag`,
        id: `feature-id-1`,
      },
      {
        name: `Feature-2`,
        tag: `Feature Tag`,
        id: `feature-id-2`,
      },
    ];
  }
}

class FakeGetNonGeoFeatureData implements GetNonGeoFeatureData {
  caller = jest.fn();

  async resolve(scenarioId: string): Promise<FeatureNumbers[]> {
    this.caller(scenarioId);
    return [
      {
        // target acquired
        id: `feature-id-1`,
        totalArea: 5000,
        metArea: 3000,
        fpf: 1,
        target: 50,
      },
      {
        // target failed to fill
        id: `feature-id-2`,
        totalArea: 10000,
        metArea: 1000,
        fpf: 1,
        target: 30,
      },
    ];
  }
}
