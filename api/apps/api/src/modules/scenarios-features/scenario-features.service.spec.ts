import { ScenarioFeaturesService } from './scenario-features.service';
import { Repository } from 'typeorm';
import { RemoteScenarioFeaturesData } from './entities/remote-scenario-features-data.geo.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { remoteConnectionName } from './entities/remote-connection-name';
import { fakeQueryBuilder } from '../../utils/__mocks__/fake-query-builder';
import { RemoteFeaturesData } from './entities/remote-features-data.geo.entity';
import { GeoFeature } from '../geo-features/geo-feature.api.entity';
import {
  getValidGeoFeature,
  getValidNonGeoData,
  getValidRemoteFeatureData,
} from './__mocks__/scenario-features.view-data';

let sut: ScenarioFeaturesService;
let geoFeatureRepoMock: jest.Mocked<Repository<GeoFeature>>;
let geoRemoteFeaturesRepoMock: jest.Mocked<Repository<RemoteFeaturesData>>;

let fakeResultResolver: jest.Mock;

beforeAll(async () => {
  fakeResultResolver = jest.fn();
  const geoFeatureToken = getRepositoryToken(GeoFeature);
  const geoRemoteScenarioFeaturesRepoToken = getRepositoryToken(
    RemoteScenarioFeaturesData,
    remoteConnectionName,
  );
  const geoRemoteFeaturesRepoToken = getRepositoryToken(
    RemoteFeaturesData,
    remoteConnectionName,
  );
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: geoRemoteScenarioFeaturesRepoToken,
        useValue: {
          metadata: {
            name: 'required-by-base-service-for-logging',
          },
          createQueryBuilder: () => fakeQueryBuilder(fakeResultResolver),
        },
      },
      {
        provide: geoFeatureToken,
        useValue: {
          find: jest.fn(),
        },
      },
      {
        provide: geoRemoteFeaturesRepoToken,
        useValue: {
          find: jest.fn(),
        },
      },
      ScenarioFeaturesService,
    ],
  }).compile();

  sut = sandbox.get(ScenarioFeaturesService);
  geoFeatureRepoMock = sandbox.get(geoFeatureToken);
  geoRemoteFeaturesRepoMock = sandbox.get(geoRemoteFeaturesRepoToken);
});

describe(`when looking for a scenario's features`, () => {
  const scenarioId = `scenarioId`;
  let result: unknown;
  beforeEach(async () => {
    // Asset
    fakeResultResolver.mockResolvedValue(getValidNonGeoData(scenarioId));
    geoFeatureRepoMock.find.mockResolvedValueOnce(getValidGeoFeature());
    geoRemoteFeaturesRepoMock.find.mockResolvedValueOnce(
      getValidRemoteFeatureData(),
    );
    // Act
    result = await sut.findAll({
      filter: {
        scenarioId,
      },
    });
  });

  it(`gets expected output`, () => {
    expect(result).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "coverageTarget": 50,
            "coverageTargetArea": 10000,
            "currentArea": 12000,
            "description": "feature-desc-1",
            "featuresDataId": "feature-uuid-1-criteria-met",
            "fpf": 1,
            "id": "some-id",
            "met": 60,
            "metArea": 12000,
            "name": "feature-alias-1",
            "onTarget": true,
            "scenarioId": "scenarioId",
            "tag": "bioregional",
            "target": 50,
            "target2": 0,
            "totalArea": 20000,
          },
          Object {
            "coverageTarget": 50,
            "coverageTargetArea": 5000,
            "currentArea": 4000,
            "description": "feature-desc-2",
            "featuresDataId": "feature-uuid-2-criteria-failed",
            "fpf": 1,
            "id": "some-another-id",
            "met": 40,
            "metArea": 4000,
            "name": "feature-alias-2",
            "onTarget": false,
            "scenarioId": "scenarioId",
            "tag": "species",
            "target": 50,
            "target2": 0,
            "totalArea": 10000,
          },
        ],
        2,
      ]
    `);
  });
});
