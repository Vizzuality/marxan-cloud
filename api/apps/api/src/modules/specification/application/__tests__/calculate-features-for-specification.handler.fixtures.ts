import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';
import { Either } from 'fp-ts/Either';

import {
  SpecificationGotReady,
  SpecificationOperation,
  Specification,
} from '../../domain';

import { SpecificationRepository } from '../specification.repository';
import { SpecificationNotFound } from '../specification-action-errors';

import { CalculateFeaturesForSpecification } from '../calculate-features-for-specification.command';
import { CalculateFeaturesForSpecificationHandler } from '../calculate-features-for-specification.handler';

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
      CalculateFeaturesForSpecificationHandler,
      {
        provide: SpecificationRepository,
        useClass: InMemorySpecificationRepo,
      },
    ],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(CalculateFeaturesForSpecificationHandler);
  const systemEvents = sandbox.get(EventBus);
  const repo: InMemorySpecificationRepo = sandbox.get(SpecificationRepository);

  systemEvents.subscribe((event) => events.push(event));

  return {
    async GivenCreatedSpecificationWithWithFeaturesWasCreated() {
      await repo.save(
        Specification.from({
          id: specificationId,
          scenarioId,
          draft: false,
          config: [
            {
              baseFeatureId,
              operation,
              featuresDetermined: true,
              resultFeatures: [
                {
                  id: nonCalculatedFeatureId,
                  calculated: false,
                },
                {
                  id: calculatedFeatureId,
                  calculated: true,
                },
              ],
            },
          ],
        }),
      );
      expect(
        (await repo.getById(specificationId))?.toSnapshot().readyToActivate,
      ).toEqual(false);
    },
    WhenAllFeaturesAreCalculated: async () =>
      sut.execute(
        new CalculateFeaturesForSpecification(specificationId, [
          nonCalculatedFeatureId,
        ]),
      ),
    async ThenSpecificationIsSaved() {
      expect(repo.count()).toEqual(1);
      expect(
        (await repo.getById(specificationId))?.toSnapshot().readyToActivate,
      ).toEqual(true);
    },
    ThenSpecificationIsReady() {
      expect(events).toEqual([
        new SpecificationGotReady(specificationId, scenarioId),
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
