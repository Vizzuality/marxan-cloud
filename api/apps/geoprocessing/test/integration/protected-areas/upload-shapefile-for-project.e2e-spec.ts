import { createWorld } from './steps/shapefile-for-wdpa-world';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

let world: FixtureType<typeof createWorld>;

beforeAll(async () => {
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

describe(`when providing name in job input`, () => {
  it(`uses provided name as protected area's "fullName"`, async () => {
    const name = await world.WhenNewShapefileIsSubmitted(`custom name`);
    await delay(2000);
    expect(await world.ThenProtectedAreaIsAvailable(name)).toEqual(true);
  });
});

afterAll(async () => {
  await world.cleanup();
}, 500 * 1000);

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
