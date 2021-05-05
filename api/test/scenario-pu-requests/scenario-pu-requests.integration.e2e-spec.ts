import { INestApplication } from '@nestjs/common';
import { bootstrapApplication } from '../utils/api-application';
import { ScenarioPuRequestsService } from '../../src/modules/analysis/scenario-pu-request/scenario-pu-requests.service';
import { createWorld, World } from './steps/world';

let app: INestApplication;
let service: ScenarioPuRequestsService;

let world: World;

beforeAll(async () => {
  app = await bootstrapApplication();
  service = app.get(ScenarioPuRequestsService);
  world = await createWorld(app);
});

afterAll(async () => {
  await world.cleanup();
});

describe(`when trying to push invalid data`, () => {
  it(`should fail on constraint check`, async () => {
    await expect(world.WhenInsertingInvalidMultiPolygon()).rejects.toThrow();
  });

  it(`should fail on non allowed spatial type (spatialFeatureType)`, async () => {
    await expect(world.WhenInsertingNonMultiPolygon()).rejects.toThrow();
  });
});

describe(`scenarios-pu-data fetch`, () => {
  let result: unknown;

  beforeEach(async () => {
    // Asset
    await world.WhenScenarioPuRequestIsAvailable();

    // Act
    result = await service.findAll();
  });

  it(`returns valid data`, () => {
    expect(result).toEqual([
      expect.arrayContaining([
        expect.objectContaining({
          scenarioId: world.scenarioId,
          includedPlantingUnits: expect.any(Array),
          excludedPlantingUnits: [],
          includedFromGeoJson: expect.any(Object),
          includedFromShapefile: expect.any(Object),
          excludedFromGeoJson: expect.any(Object),
          excludedFromShapefile: expect.any(Object),
        }),
      ]),
      expect.any(Number),
    ]);
  });
});
