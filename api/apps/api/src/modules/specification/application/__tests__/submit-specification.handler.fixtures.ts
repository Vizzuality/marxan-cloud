import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';
import { Either, isLeft, isRight, Right } from 'fp-ts/Either';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';

import { SpecificationRepository } from '../specification.repository';
import { SubmitSpecificationHandler } from '../submit-specification.handler';

import {
  SubmitSpecification,
  SubmitSpecificationError,
} from '../submit-specification.command';
import {
  SpecificationCandidateCreated,
  SpecificationOperation,
} from '../../domain';

import { InMemorySpecificationRepo } from './in-memory-specification.repo';
import { SpecificationFeatureStratification } from '../specification-input';

export const getFixtures = async () => {
  const scenarioId = v4();
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: SpecificationRepository,
        useClass: InMemorySpecificationRepo,
      },
      SubmitSpecificationHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];
  const eventBus = sandbox.get(EventBus);
  const handler = sandbox.get(SubmitSpecificationHandler);
  const repo: InMemorySpecificationRepo = sandbox.get(SpecificationRepository);

  eventBus.subscribe((event) => {
    events.push(event);
  });

  return {
    input: [
      {
        operation: SpecificationOperation.Stratification,
        baseFeatureId: v4(),
        againstFeatureId: v4(),
      } as SpecificationFeatureStratification,
    ],
    async WhenValidSpecificationIsSubmitted(forScenario = scenarioId) {
      return await handler.execute(
        new SubmitSpecification({
          scenarioId: forScenario,
          draft: true,
          raw: {},
          features: this.input,
        }),
      );
    },
    ThenItSavesTheSpecification(
      result: Either<SubmitSpecificationError, string>,
    ) {
      expect(isRight(result));
      expect(repo.getById((result as Right<string>).right)).toBeDefined();
      expect(repo.count()).toEqual(1);
    },
    ThenItPublishesSpecificationCandidateCreated(
      result: Either<SubmitSpecificationError, string>,
    ) {
      expect(isRight(result));
      expect(events).toEqual([
        new SpecificationCandidateCreated(
          scenarioId,
          (result as Right<string>).right,
          this.input,
          true,
        ),
      ]);
    },
    ThenNoEventsAreRaised() {
      expect(events).toEqual([]);
    },
    WhenInvalidSpecificationIsSubmitted: () =>
      handler.execute(
        new SubmitSpecification({
          scenarioId: repo.scenarioIdToCrashOnSave,
          draft: true,
          raw: {},
          features: [
            {
              operation: SpecificationOperation.Stratification,
              baseFeatureId: v4(),
              againstFeatureId: v4(),
            },
          ],
        }),
      ),
    ThenErrorIsReturned(result: Either<SubmitSpecificationError, string>) {
      expect(isLeft(result)).toBeTruthy();
    },
  };
};
