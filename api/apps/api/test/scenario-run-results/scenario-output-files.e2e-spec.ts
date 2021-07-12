import { Response } from 'supertest';
import { PromiseType } from 'utility-types';
import { createWorld } from './world';

let world: PromiseType<ReturnType<typeof createWorld>>;

beforeEach(async () => {
  world = await createWorld();
});

afterEach(async () => {
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

describe(`given metadata is not available`, () => {
  let response: any;
  beforeEach(async () => {
    // when
    response = await world.WhenGettingZipArchive();
  });

  it(`returns NotFound`, () => {
    world.ThenReturns404(response);
  });
});
