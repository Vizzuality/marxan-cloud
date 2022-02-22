import { createWorld } from './steps/shapefile-for-wdpa-world';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { v4 } from 'uuid';

let world: FixtureType<typeof createWorld>;

beforeEach(async () => {
  world = await createWorld();
});

test(`when worker processes the job for known project`, async () => {
  await world.GivenWdpaForProjectAlreadyExists(`old-shape-name`);
  const name = await world.WhenNewShapefileIsSubmitted();
  await delay(2000);

  expect(await world.ThenProtectedAreaIsAvailable(name)).toEqual(true);
  expect(await world.ThenProtectedAreaIsAvailable(`old-shape-name`)).toEqual(
    true,
  );
});

test(`uses provided name as protected area's "fullName"`, async () => {
  const name = await world.WhenNewShapefileIsSubmitted(`custom name`);
  await delay(2000);
  expect(await world.ThenProtectedAreaIsAvailable(name)).toEqual(true);
});

test(`adding the same shape twice succeeds and results in the latest protected area name to be set`, async () => {
  expect.assertions(1);
  const updatedProtectedAreaName = v4();
  await world.WhenNewShapefileIsSubmitted(`custom name`);
  await world.WhenNewShapefileIsSubmitted(updatedProtectedAreaName);
  await world.ThenProtectedAreaNameIsUpdated(updatedProtectedAreaName);
});

afterAll(async () => {
  await world.cleanup();
}, 500 * 1000);

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
