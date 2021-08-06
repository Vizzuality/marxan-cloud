import { PromiseType } from 'utility-types';
import { getFixtures } from './fixtures';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`submitting valid specification`, async () => {
  await fixtures.WhenSubmitsValidSpecification();
  await fixtures.ThenItSavesTheSpecification();
  await fixtures.ThenItPublishesSpecificationCandidateCreated();
});
