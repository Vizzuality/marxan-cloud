import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';

import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { SpecificationRepository } from '../specification.repository';
import { SubmitSpecificationHandler } from '../submit-specification.handler';

import { SubmitSpecification } from '../submit-specification.command';
import {
  SpecificationOperation,
  SpecificationCandidateCreated,
  Specification,
} from '../../domain';

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
    WhenSubmitsValidSpecification: async () =>
      (specificationId = await handler.execute(
        new SubmitSpecification({
          scenarioId,
          draft: true,
          features: [
            {
              operation: SpecificationOperation.Stratification,
              baseFeatureId: v4(),
              againstFeatureId: v4(),
            },
          ],
        }),
      )),
    ThenItSavesTheSpecification() {
      expect(specificationId).toBeDefined();
      expect(repo.getById(specificationId)).toBeDefined();
      expect(repo.count()).toEqual(1);
    },
    ThenItPublishesSpecificationCandidateCreated() {
      expect(specificationId).toBeDefined();
      expect(events).toEqual([
        new SpecificationCandidateCreated(scenarioId, specificationId),
      ]);
    },
  };
};

class InMemorySpecificationRepo implements SpecificationRepository {
  #memory: Record<string, Specification> = {};

  async getById(id: string): Promise<Specification | undefined> {
    return this.#memory[id];
  }

  async save(specification: Specification): Promise<void> {
    this.#memory[specification.id] = specification;
  }

  count(): number {
    return Object.keys(this.#memory).length;
  }
}
