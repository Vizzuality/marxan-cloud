import { v4 } from 'uuid';
import { Specification } from '../../specification';
import {
  FeatureConfigInput,
  SpecificationOperation,
} from '../../feature-config';
import { SpecificationGotReady } from '../../events/specification-got-ready.event';

export const getFixtures = () => {
  const scenarioId = v4();
  const baseFeatureId = v4();
  const stratificationFeatureId = v4();
  const nonCalculatedFeatureOne = v4();
  const nonCalculatedFeatureTwo = v4();

  const splitConfig: FeatureConfigInput = {
    operation: SpecificationOperation.Split,
    baseFeatureId: baseFeatureId,
  };

  const stratificationConfig: FeatureConfigInput = {
    operation: SpecificationOperation.Stratification,
    baseFeatureId: baseFeatureId,
    againstFeatureId: stratificationFeatureId,
  };

  return {
    GivenCandidateDraftWasCreatedWithDeterminedFeatures: () =>
      Specification.from({
        id: v4(),
        scenarioId,
        draft: true,
        config: [
          {
            ...splitConfig,
            featuresDetermined: true,
            resultFeatures: [],
          },
          {
            ...stratificationConfig,
            featuresDetermined: true,
            resultFeatures: [],
          },
        ],
      }),
    GivenCandidateWasCreatedWithDeterminedFeatures: () =>
      Specification.from({
        id: v4(),
        scenarioId,
        draft: false,
        config: [
          {
            ...splitConfig,
            featuresDetermined: true,
            resultFeatures: [
              {
                id: v4(),
                calculated: true,
              },
            ],
          },
          {
            ...stratificationConfig,
            featuresDetermined: true,
            resultFeatures: [
              {
                id: nonCalculatedFeatureOne,
                calculated: false,
              },
              {
                id: nonCalculatedFeatureTwo,
                calculated: false,
              },
            ],
          },
        ],
      }),
    nonCalculatedFeatureOne,
    nonCalculatedFeatureTwo,
    WhenMarksAllAsCalculated(specification: Specification) {
      specification.markAsCalculated([
        nonCalculatedFeatureOne,
        nonCalculatedFeatureTwo,
      ]);
    },
    ThenSpecificationIsNotReady(specification: Specification) {
      expect(specification.getUncommittedEvents()).toEqual([]);
    },
    WhenFeatureIsCalculated(
      specification: Specification,
      calculatedFeature: string,
    ) {
      specification.markAsCalculated([calculatedFeature]);
    },
    ThenSpecificationIsReady(specification: Specification) {
      expect(specification.getUncommittedEvents()).toEqual([
        new SpecificationGotReady(specification.id, specification.scenarioId),
      ]);
    },
  };
};
