import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';

import {
  FeatureConfig,
  FeatureConfigSplit,
  Specification,
  SpecificationGotReady,
} from '../../domain';

import { SpecificationRepository } from '../specification.repository';

import { CalculateFeatures } from '../calculate-features.command';
import { CalculateFeaturesHandler } from '../calculate-features.handler';

import { InMemorySpecificationRepo } from './in-memory-specification.repo';
import { SpecificationOperation } from '@marxan/specification';

export const getFixtures = async () => {
  const events: IEvent[] = [];
  const specificationRelatedToIncomingCalculatedFeature = v4();
  const specificationWithoutRelationToIncomingCalculatedFeature = v4();
  const scenarioId = v4();

  const nonCalculatedFeatureId = v4();
  const calculatedFeatureId = v4();

  const config: FeatureConfigSplit = {
    operation: SpecificationOperation.Split,
    baseFeatureId: v4(),
    splitByProperty: `property`,
  };

  const configWithOnlyCalculatedFeature: FeatureConfig = {
    ...config,
    featuresDetermined: true,
    resultFeatures: [
      {
        featureId: calculatedFeatureId,
        calculated: true,
      },
    ],
  };
  const configWithNonCalculatedFeature: FeatureConfig = {
    ...config,
    featuresDetermined: true,
    resultFeatures: [
      {
        featureId: calculatedFeatureId,
        calculated: true,
      },
      {
        featureId: nonCalculatedFeatureId,
        calculated: false,
      },
    ],
  };

  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      CalculateFeaturesHandler,
      {
        provide: SpecificationRepository,
        useClass: InMemorySpecificationRepo,
      },
    ],
  }).compile();
  await sandbox.init();

  const sut = sandbox.get(CalculateFeaturesHandler);
  const systemEvents = sandbox.get(EventBus);
  const repo: InMemorySpecificationRepo = sandbox.get(SpecificationRepository);

  systemEvents.subscribe((event) => events.push(event));

  return {
    async GivenCreatedSpecificationsWithWithFeaturesWereCreated() {
      await repo.save(
        Specification.from({
          id: specificationRelatedToIncomingCalculatedFeature,
          scenarioId,
          draft: false,
          config: [configWithNonCalculatedFeature],
          raw: {},
        }),
      );
      await repo.save(
        Specification.from({
          id: specificationWithoutRelationToIncomingCalculatedFeature,
          scenarioId,
          draft: false,
          config: [configWithOnlyCalculatedFeature],
          raw: {},
        }),
      );
    },
    WhenAllFeaturesAreCalculated: async () =>
      sut.execute(
        new CalculateFeatures(
          [nonCalculatedFeatureId],
          specificationRelatedToIncomingCalculatedFeature,
        ),
      ),
    async ThenSpecificationIsSaved() {
      expect(repo.count()).toEqual(2);
      expect(
        (
          await repo.getById(specificationRelatedToIncomingCalculatedFeature)
        )?.toSnapshot().readyToActivate,
      ).toEqual(true);
    },
    ThenSpecificationIsReady() {
      expect(events).toEqual([
        new SpecificationGotReady(
          specificationRelatedToIncomingCalculatedFeature,
          scenarioId,
        ),
      ]);
    },
    ThenNoEventIsPublished() {
      expect(events).toEqual([]);
    },
  };
};
