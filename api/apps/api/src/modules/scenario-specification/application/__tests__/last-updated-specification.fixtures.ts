import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';
import { CqrsModule, IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Either, isLeft, isRight, Right, right } from 'fp-ts/Either';

import { GetLastUpdatedSpecification } from '@marxan-api/modules/specification';
import { SpecificationSnapshot } from '@marxan-api/modules/specification/domain';

import { ScenarioSpecification, SpecificationId } from '../../domain';
import { ScenarioSpecificationRepo } from '../scenario-specification.repo';
import { LastUpdatedSpecificationHandler } from '../last-updated-specification.handler';
import {
  LastUpdatedSpecification,
  LastUpdatedSpecificationError,
} from '../last-updated-specification.query';

import { InMemoryScenarioSpecificationRepo } from './scenario-specification-in-memory.repo';

jest.mock('config', () => ({
  get: (str: string) => `value_${str}`,
  has: () => true,
}));

export const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ScenarioSpecificationRepo,
        useClass: InMemoryScenarioSpecificationRepo,
      },
      LastUpdatedSpecificationHandler,
      FakeGetSpecificationHandler,
    ],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(LastUpdatedSpecificationHandler);
  const repo = sandbox.get(ScenarioSpecificationRepo);
  const specificationQueryHandler = sandbox.get(FakeGetSpecificationHandler);

  return {
    WhenGettingLastUpdatedSpecification: (scenarioId: string = v4()) =>
      sut.execute(new LastUpdatedSpecification(scenarioId)),
    ThenItIsNotFound: (
      result: Either<LastUpdatedSpecificationError, SpecificationSnapshot>,
    ) => {
      expect(isLeft(result)).toBeTruthy();
    },
    GivenScenarioWasCreated: (hasCandidate: boolean, hasActive: boolean) => {
      const scenarioId = v4();
      const candidateId = v4();
      const activeId = v4();
      const scenarioSpec = new ScenarioSpecification(
        scenarioId,
        hasActive ? new SpecificationId(activeId) : undefined,
        hasCandidate ? new SpecificationId(candidateId) : undefined,
      );

      repo.save(scenarioSpec);

      specificationQueryHandler.mock.mockImplementationOnce(
        async (query: GetLastUpdatedSpecification) =>
          right({
            iAmASnapShot: true,
            id: query.ids[0],
          }),
      );

      return {
        scenarioId,
        candidateId,
        activeId,
      };
    },
    ThenSpecificationIsFound(
      result: Either<LastUpdatedSpecificationError, SpecificationSnapshot>,
      specificationId: string,
    ) {
      expect(isRight(result)).toBeTruthy();
      const snapshot = (result as Right<SpecificationSnapshot>).right;
      expect(snapshot.id).toEqual(specificationId);
    },
  };
};

@QueryHandler(GetLastUpdatedSpecification)
class FakeGetSpecificationHandler
  implements IInferredQueryHandler<GetLastUpdatedSpecification> {
  mock = jest.fn();

  execute(query: GetLastUpdatedSpecification) {
    return this.mock(query);
  }
}
