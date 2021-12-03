import { createWorld } from './steps/shapefile-for-wdpa-world';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

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

test(`adding the same shape twice`, async () => {
  expect.assertions(1);
  await world.WhenNewShapefileIsSubmitted(`custom name`);
  try {
    await world.WhenNewShapefileIsSubmitted(`custom name`);
  } catch (error) {
    expect(
      error.toString().match(`wpdpa_project_geometries_project_check`),
    ).toBeTruthy();
  }
});

afterAll(async () => {
  await world.cleanup();
}, 500 * 1000);

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
