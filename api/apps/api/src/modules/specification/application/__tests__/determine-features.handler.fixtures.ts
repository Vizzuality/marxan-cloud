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
  const specificationRelatedToGivenConfig = v4();
  const anotherSpecificationRelatedToGivenConfig = v4();
  const specificationWithoutRelationToGivenConfig = v4();
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
          id: specificationRelatedToGivenConfig,
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
          id: anotherSpecificationRelatedToGivenConfig,
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
          id: specificationWithoutRelationToGivenConfig,
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
        new DetermineFeatures({
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
        }),
      );
    },
    async ThenSpecificationsWithRelatedConfigAreSaved() {
      expect(repo.count()).toEqual(3);
      expect(
        (await repo.getById(specificationRelatedToGivenConfig))?.toSnapshot()
          .featuresDetermined,
      ).toEqual(true);
      expect(
        (
          await repo.getById(anotherSpecificationRelatedToGivenConfig)
        )?.toSnapshot().featuresDetermined,
      ).toEqual(true);
      expect(
        (
          await repo.getById(specificationWithoutRelationToGivenConfig)
        )?.toSnapshot().featuresDetermined,
      ).toEqual(false);
    },
    ThenSpecificationIsPublished() {
      expect(events).toEqual([
        new SpecificationPublished(specificationRelatedToGivenConfig, [
          nonCalculatedFeatureId,
        ]),
        new SpecificationPublished(anotherSpecificationRelatedToGivenConfig, [
          nonCalculatedFeatureId,
        ]),
      ]);
    },
    ThenNoEventIsPublished() {
      expect(events).toEqual([]);
    },
  };
};
