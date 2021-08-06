import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';
import { Either } from 'fp-ts/Either';

import {
  SpecificationPublished,
  SpecificationOperation,
  Specification,
} from '../../domain';

import { DetermineFeaturesForSpecification } from '../determine-features-for-specification.command';
import { DetermineFeaturesForSpecificationHandler } from '../determine-features-for-specification.handler';
import { SpecificationRepository } from '../specification.repository';
import { SpecificationNotFound } from '../specification-action-errors';

export const getFixtures = async () => {
  const events: IEvent[] = [];
  const specificationId = v4();
  const scenarioId = v4();

  const baseFeatureId = v4();
  const nonCalculatedFeatureId = v4();
  const calculatedFeatureId = v4();
  const operation = SpecificationOperation.Split;

  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      DetermineFeaturesForSpecificationHandler,
      {
        provide: SpecificationRepository,
        useClass: InMemorySpecificationRepo,
      },
    ],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(DetermineFeaturesForSpecificationHandler);
  const systemEvents = sandbox.get(EventBus);
  const repo: InMemorySpecificationRepo = sandbox.get(SpecificationRepository);

  systemEvents.subscribe((event) => events.push(event));

  return {
    async GivenCreatedSpecificationWithUndeterminedFeaturesWasCreated() {
      await repo.save(
        Specification.from({
          id: specificationId,
          scenarioId,
          draft: false,
          config: [
            {
              baseFeatureId,
              operation,
              featuresDetermined: false,
              resultFeatures: [],
            },
          ],
        }),
      );
      expect(
        (await repo.getById(specificationId))?.toSnapshot().featuresDetermined,
      ).toEqual(false);
    },
    async WhenAllFeaturesAreDetermined() {
      return await sut.execute(
        new DetermineFeaturesForSpecification(specificationId, {
          features: [
            {
              id: calculatedFeatureId,
              calculated: true,
            },
            {
              id: nonCalculatedFeatureId,
              calculated: false,
            },
          ],
          baseFeatureId,
          operation,
        }),
      );
    },
    async ThenSpecificationIsSaved() {
      expect(repo.count()).toEqual(1);
      expect(
        (await repo.getById(specificationId))?.toSnapshot().featuresDetermined,
      ).toEqual(true);
    },
    ThenSpecificationIsPublished() {
      expect(events).toEqual([
        new SpecificationPublished(specificationId, [nonCalculatedFeatureId]),
      ]);
    },
    ThenNoEventIsPublished() {
      expect(events).toEqual([]);
    },
    ThenErrorIsRaised(result: Either<typeof SpecificationNotFound, void>) {
      expect(result._tag).toEqual('Left');
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
