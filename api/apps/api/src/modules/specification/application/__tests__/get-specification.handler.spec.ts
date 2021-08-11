import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './get-specification.handler.fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`find specification with unknown id`, async () => {
  const result = await fixtures.WhenGettingSpecificationById();
  fixtures.ThenItIsNotFound(result);
});

test(`find specification with known id`, async () => {
  const specificationId = fixtures.GivenSpecificationWasCreated();
  const result = await fixtures.WhenGettingSpecificationById(specificationId);
  fixtures.ThenSpecificationSnapshotIsReturned(result);
});
