import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { getFixtures } from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`persisting specification`, async () => {
  const specification = await fixtures.GivenSpecificationWasCreated();
  const restoredSpecification = await fixtures.WhenGettingSpecification(
    specification.id,
  );
  fixtures.ThenTheyAreEqual(specification, restoredSpecification);
});

afterEach(async () => {
  await fixtures?.cleanup();
});
