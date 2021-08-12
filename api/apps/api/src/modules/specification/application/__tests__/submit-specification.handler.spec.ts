import { PromiseType } from 'utility-types';
import { getFixtures } from './submit-specification.handler.fixtures';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`submitting valid specification`, async () => {
  const result = await fixtures.WhenValidSpecificationIsSubmitted();
  await fixtures.ThenItSavesTheSpecification(result);
  await fixtures.ThenItPublishesSpecificationCandidateCreated(result);
});

test(`submission failed`, async () => {
  const result = await fixtures.WhenInvalidSpecificationIsSubmitted();
  fixtures.ThenErrorIsReturned(result);
  fixtures.ThenNoEventsAreRaised();
});
