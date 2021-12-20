import { Test } from '@nestjs/testing';
import { ResultWithBestSolution } from '@marxan/marxan-output';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

import { BestSolutionService } from './best-solution.service';

import { lowestScoreRunId, subjectRows } from './__tests__/solutions';

let fixtures: FixtureType<typeof getFixtures>;
beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`selecting best solution`, async () => {
  const result = fixtures.WhenSearchingForBestSolution();
  fixtures.ThenLowestScoreIsMarked(result);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    providers: [BestSolutionService],
  }).compile();

  const sut = sandbox.get(BestSolutionService);

  return {
    WhenSearchingForBestSolution: () => sut.map(subjectRows),
    ThenLowestScoreIsMarked: (result: ResultWithBestSolution[]) => {
      expect(result.filter((solution) => solution.best)?.[0].runId).toEqual(
        lowestScoreRunId,
      );
    },
  };
};
