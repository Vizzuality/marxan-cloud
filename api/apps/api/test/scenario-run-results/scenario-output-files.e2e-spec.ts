import { Response } from 'supertest';
import { PromiseType } from 'utility-types';
import { createWorld } from './world';

let world: PromiseType<ReturnType<typeof createWorld>>;

beforeAll(async () => {
  world = await createWorld();
});

afterAll(async () => {
  await world?.cleanup();
});

describe(`given output zip is available`, () => {
  let zip: Response;
  beforeEach(async () => {
    // given
    await world.GivenOutputZipIsAvailable();

    // when
    zip = await world.WhenGettingZipArchive();
  });

  it(`allows to get zip archive`, async () => {
    await world.ThenZipContainsOutputFiles(zip);
  });
});
