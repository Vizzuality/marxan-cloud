import { ArePuidsAllowedAdapter } from './are-puids-allowed-adapter';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

import { fakeQueryBuilder } from '@marxan-api/utils/__mocks__/fake-query-builder';
import { validDataWithGivenPuIds } from '../__mocks__/scenario-planning-unit-geo.data';
import { DbConnections } from '@marxan-api/ormconfig.connections';

const existingPuids = ['one', 'two', 'three'];
const scenarioId = 'scenario-0000-fake-uuid';

let sut: ArePuidsAllowedAdapter;

beforeEach(async () => {
  const geoRepoToken = getRepositoryToken(
    ScenariosPlanningUnitGeoEntity,
    DbConnections.geoprocessingDB,
  );
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: geoRepoToken,
        useValue: {
          metadata: {
            name: 'required-by-base-service-for-logging',
          },
          createQueryBuilder: () => fakeQueryBuilder(jest.fn()),
        },
      },
      ArePuidsAllowedAdapter,
    ],
  }).compile();

  sut = sandbox.get(ArePuidsAllowedAdapter);
});

/**
 * [ uuids[], hasErrors ]
 */
type TestInput = [string[], boolean];

describe(`when requesting puuids`, () => {
  let findMock: jest.SpyInstance;

  beforeEach(() => {
    findMock = jest
      .spyOn(sut, 'findAll')
      .mockResolvedValue([
        validDataWithGivenPuIds(existingPuids, scenarioId),
        existingPuids.length,
      ]);
  });
  afterEach(() => {
    findMock.mockRestore();
  });

  test.each<TestInput>([
    [existingPuids, false],
    [[existingPuids[0]], false],
    [[existingPuids[0], existingPuids[1]], false],
    [[existingPuids[2], 'not-there'], true],
    [['asdf'], true],
    [[], false],
  ])(`should %p raise errors => (%p)`, async (...[uuids, expectErrors]) => {
    expect((await sut.validate(scenarioId, uuids)).errors.length > 0).toEqual(
      expectErrors,
    );
  });
});
