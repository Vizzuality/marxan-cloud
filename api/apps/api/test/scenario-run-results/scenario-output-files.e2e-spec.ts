import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Response } from 'supertest';
import { getFixtures } from './scenario-output-files.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

describe(`As owner: given output zip is available`, () => {
  let zip: Response;
  beforeEach(async () => {
    // given
    await fixtures.GivenOutputZipIsAvailable();

    // when
    zip = await fixtures.WhenGettingZipArchiveAsOwner();
  });

  it(`allows to get zip archive`, async () => {
    await fixtures.ThenZipContainsOutputFiles(zip);
  });
});

describe(`As owner: given metadata is not available`, () => {
  let response: any;
  beforeEach(async () => {
    // when
    response = await fixtures.WhenGettingZipArchiveAsOwner();
  });

  it(`returns NotFound`, () => {
    fixtures.ThenReturns404(response);
  });
});

describe(`As contributor: given output zip is available`, () => {
  let zip: Response;
  beforeEach(async () => {
    // given
    await fixtures.GivenOutputZipIsAvailable();
    await fixtures.GivenContributorWasAddedToScenario();

    // when
    zip = await fixtures.WhenGettingZipArchiveAsContributor();
  });

  it(`allows to get zip archive`, async () => {
    await fixtures.ThenZipContainsOutputFiles(zip);
  });
});

describe(`As contributor: given metadata is not available`, () => {
  let response: any;
  beforeEach(async () => {
    // given
    await fixtures.GivenContributorWasAddedToScenario();

    // when
    response = await fixtures.WhenGettingZipArchiveAsContributor();
  });

  it(`returns NotFound`, () => {
    fixtures.ThenReturns404(response);
  });
});
describe(`As viewer: given output zip is available`, () => {
  let zip: Response;
  beforeEach(async () => {
    // given
    await fixtures.GivenOutputZipIsAvailable();
    await fixtures.GivenViewerWasAddedToScenario();

    // when
    zip = await fixtures.WhenGettingZipArchiveAsViewer();
  });

  it(`allows to get zip archive`, async () => {
    await fixtures.ThenZipContainsOutputFiles(zip);
  });
});

describe(`As viewer: given metadata is not available`, () => {
  let response: any;
  beforeEach(async () => {
    // given
    await fixtures.GivenViewerWasAddedToScenario();

    // when
    response = await fixtures.WhenGettingZipArchiveAsViewer();
  });

  it(`returns NotFound`, () => {
    fixtures.ThenReturns404(response);
  });
});
