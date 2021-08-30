import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';

import {
  FeatureConfigSplit,
  Specification,
  SpecificationOperation,
  SpecificationPublished,
} from '../../domain';

import { DetermineFeatures } from '../determine-features.command';
import { DetermineFeaturesHandler } from '../determine-features.handler';
import { SpecificationRepository } from '../specification.repository';

import { InMemorySpecificationRepo } from './in-memory-specification.repo';

export const getFixtures = async () => {
  const events: IEvent[] = [];
  const specificationId = v4();
  const anotherSpecificationId = v4();
  const scenarioId = v4();

  const nonCalculatedFeatureId = v4();
  const calculatedFeatureId = v4();

  const relatedConfig: FeatureConfigSplit = {
    operation: SpecificationOperation.Split,
    baseFeatureId: v4(),
    splitByProperty: `split-prop`,
  };

  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      DetermineFeaturesHandler,
      {
        provide: SpecificationRepository,
        useClass: InMemorySpecificationRepo,
      },
    ],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(DetermineFeaturesHandler);
  const systemEvents = sandbox.get(EventBus);
  const repo: InMemorySpecificationRepo = sandbox.get(SpecificationRepository);

  systemEvents.subscribe((event) => events.push(event));

  return {
    async GivenCreatedSpecificationsWithUndeterminedFeaturesWereCreated() {
      await repo.save(
        Specification.from({
          id: specificationId,
          scenarioId,
          draft: false,
          raw: {},
          config: [
            {
              ...relatedConfig,
              featuresDetermined: false,
              resultFeatures: [],
            },
          ],
        }),
      );
      await repo.save(
        Specification.from({
          id: anotherSpecificationId,
          scenarioId,
          draft: false,
          raw: {},
          config: [
            {
              ...relatedConfig,
              operation: SpecificationOperation.Copy,
              featuresDetermined: false,
              resultFeatures: [],
            },
          ],
        }),
      );
    },
    async WhenFeaturesAreDetermined() {
      return await sut.execute(
        new DetermineFeatures(
          {
            features: [
              {
                featureId: calculatedFeatureId,
                calculated: true,
              },
              {
                featureId: nonCalculatedFeatureId,
                calculated: false,
              },
            ],
            ...relatedConfig,
          },
          specificationId,
        ),
      );
    },
    async ThenSpecificationIsSaved() {
      expect(repo.count()).toEqual(2);
      expect(
        (await repo.getById(specificationId))?.toSnapshot().featuresDetermined,
      ).toEqual(true);
      expect(
        (await repo.getById(anotherSpecificationId))?.toSnapshot()
          .featuresDetermined,
      ).toEqual(false);
    },
    ThenSpecificationIsPublished() {
      expect(events).toEqual([
        new SpecificationPublished(specificationId, [nonCalculatedFeatureId]),
      ]);
    },
    ThenNoEventIsPublished() {
      expect(events).toEqual([]);
    },
  };
};
