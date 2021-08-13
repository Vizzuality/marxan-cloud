import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';

import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { SpecificationRepository } from '../specification.repository';
import { SubmitSpecificationHandler } from '../submit-specification.handler';

import { SubmitSpecification } from '../submit-specification.command';
import {
  SpecificationCandidateCreated,
  SpecificationOperation,
} from '../../domain';

import { InMemorySpecificationRepo } from './in-memory-specification.repo';
import { SpecificationFeatureStratification } from '../specification-input';

export const getFixtures = async () => {
  const scenarioId = v4();
  let specificationId: string;
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
    async WhenSubmitsValidSpecification() {
      return (specificationId = await handler.execute(
        new SubmitSpecification({
          scenarioId,
          draft: true,
          raw: {},
          features: this.input,
        }),
      ));
    },
    ThenItSavesTheSpecification() {
      expect(specificationId).toBeDefined();
      expect(repo.getById(specificationId)).toBeDefined();
      expect(repo.count()).toEqual(1);
    },
    ThenItPublishesSpecificationCandidateCreated() {
      expect(specificationId).toBeDefined();
      expect(events).toEqual([
        new SpecificationCandidateCreated(
          scenarioId,
          specificationId,
          this.input,
        ),
      ]);
    },
  };
};
