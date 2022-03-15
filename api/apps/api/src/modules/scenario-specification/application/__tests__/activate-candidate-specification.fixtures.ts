import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Either, isLeft } from 'fp-ts/Either';

import {
  ScenarioSpecification,
  SpecificationActivated,
  SpecificationId,
} from '../../domain';

import { ActivateCandidateSpecificationHandler } from '../activate-candidate-specification.handler';
import { ScenarioSpecificationRepo } from '../scenario-specification.repo';
import {
  ActivateCandidateSpecification,
  ActivateError,
} from '../activate-candidate-specification.command';

import { InMemoryScenarioSpecificationRepo } from './scenario-specification-in-memory.repo';

export const getFixtures = async () => {
  const scenarioId = v4();
  const currentCandidateSpecificationId = new SpecificationId(v4());
  const differentCandidateSpecificationId = new SpecificationId(v4());
  const events: IEvent[] = [];

  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      ActivateCandidateSpecificationHandler,
      {
        provide: ScenarioSpecificationRepo,
        useClass: InMemoryScenarioSpecificationRepo,
      },
    ],
  }).compile();
  await sandbox.init();

  const scenarioSpecificationRepo: InMemoryScenarioSpecificationRepo =
    sandbox.get(ScenarioSpecificationRepo);
  const sut = sandbox.get(ActivateCandidateSpecificationHandler);
  const systemEvents = sandbox.get(EventBus);

  systemEvents.subscribe((event) => events.push(event));

  return {
    GivenScenarioSpecificationWithCandidateWasCreated: () => {
      scenarioSpecificationRepo.save(
        new ScenarioSpecification(
          scenarioId,
          undefined,
          currentCandidateSpecificationId,
        ),
      );
    },
    WhenActivatingCandidateSpecification: async () =>
      sut.execute(
        new ActivateCandidateSpecification(
          scenarioId,
          currentCandidateSpecificationId.value,
        ),
      ),
    WhenActivatingAnotherSpecification: async () =>
      sut.execute(
        new ActivateCandidateSpecification(
          scenarioId,
          differentCandidateSpecificationId.value,
        ),
      ),
    ThenScenarioSpecificationIsSaved: async () => {
      const scenarioSpecification = await scenarioSpecificationRepo.find(
        scenarioId,
      );
      expect(scenarioSpecification).toBeDefined();
      expect(scenarioSpecification!.currentActiveSpecification).toEqual(
        currentCandidateSpecificationId,
      );
      expect(
        scenarioSpecification!.currentCandidateSpecification,
      ).toBeUndefined();
    },
    ThenSpecificationIsActivated: () => {
      expect(events).toEqual([
        new SpecificationActivated(scenarioId, currentCandidateSpecificationId),
      ]);
    },
    ThenSpecificationIsNotActivated: async (
      result: Either<ActivateError, void>,
    ) => {
      expect(isLeft(result)).toBe(true);
      const scenarioSpecification = await scenarioSpecificationRepo.find(
        scenarioId,
      );
      expect(events).toEqual([]);
      expect(scenarioSpecification?.currentActiveSpecification).toBeUndefined();
    },
  };
};
