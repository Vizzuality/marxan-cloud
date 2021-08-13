import { v4 } from 'uuid';
import {
  FeatureConfigSplit,
  FeatureConfigStratification,
  SpecificationOperation,
} from '../../feature-config';
import { Specification } from '../../specification';
import { SpecificationPublished } from '../../events/specification-published.event';
import { SpecificationGotReady } from '../../events/specification-got-ready.event';

export const getFixtures = () => {
  const scenarioId = v4();
  const baseFeatureId = v4();
  const stratificationFeatureId = v4();
  const nonCalculatedFeature = v4();

  const splitConfig: FeatureConfigSplit = {
    operation: SpecificationOperation.Split,
    baseFeatureId: baseFeatureId,
    splitByProperty: `split-prop`,
  };

  const stratificationConfig: FeatureConfigStratification = {
    operation: SpecificationOperation.Stratification,
    baseFeatureId: baseFeatureId,
    againstFeatureId: stratificationFeatureId,
  };

  const featuresFromSplit = [
    {
      id: v4(),
      calculated: true,
      featureId: v4(),
    },
    {
      id: v4(),
      calculated: true,
      featureId: v4(),
    },
  ];

  const featuresFromStratificationSomeCalculated = [
    {
      id: v4(),
      calculated: true,
      featureId: v4(),
    },
    {
      id: nonCalculatedFeature,
      calculated: false,
      featureId: v4(),
    },
  ];

  const featuresFromStratificationAllCalculated = [
    {
      id: v4(),
      calculated: true,
      featureId: v4(),
    },
    {
      id: v4(),
      calculated: true,
      featureId: v4(),
    },
  ];

  return {
    GivenCandidateDraftWasCreated: () =>
      Specification.from({
        id: v4(),
        scenarioId,
        draft: true,
        raw: {},
        config: [
          {
            ...splitConfig,
            featuresDetermined: false,
            resultFeatures: [],
          },
          {
            ...stratificationConfig,
            featuresDetermined: false,
            resultFeatures: [],
          },
        ],
      }),
    GivenCandidateWasCreated: () =>
      Specification.from({
        id: v4(),
        scenarioId,
        draft: false,
        raw: {},
        config: [
          {
            ...splitConfig,
            featuresDetermined: false,
            resultFeatures: [],
          },
          {
            ...stratificationConfig,
            featuresDetermined: false,
            resultFeatures: [],
          },
        ],
      }),
    WhenDeterminesFeatures(
      specification: Specification,
      allCalculated: boolean,
    ) {
      specification.determineFeatures([
        {
          ...splitConfig,
          features: featuresFromSplit,
        },
        {
          ...stratificationConfig,
          features: allCalculated
            ? featuresFromStratificationAllCalculated
            : featuresFromStratificationSomeCalculated,
        },
      ]);
    },
    ThenSpecificationWasNotPublished(specification: Specification) {
      expect(specification.getUncommittedEvents()).toEqual([]);
    },
    ThenSpecificationIsPublished(specification: Specification) {
      expect(specification.getUncommittedEvents()).toEqual([
        new SpecificationPublished(specification.id, [nonCalculatedFeature]),
      ]);
    },
    ThenSpecificationIsReady(specification: Specification) {
      expect(specification.getUncommittedEvents()).toEqual([
        new SpecificationGotReady(specification.id, specification.scenarioId),
      ]);
    },
    ThenSpecificationWasNotCalculated(specification: Specification) {
      expect(specification.getUncommittedEvents()).toEqual([]);
    },
  };
};
