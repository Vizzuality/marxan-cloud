import { v4 } from 'uuid';
import {
  FeatureConfigInput,
  SpecificationOperation,
} from '../../feature-config';
import { Specification } from '../../specification';
import { SpecificationCandidateCreated } from '../../events/specification-candidate-created.event';

export const getFixtures = () => {
  const scenarioId = v4();
  const baseFeatureId = v4();
  const stratificationFeatureId = v4();

  const splitConfig: FeatureConfigInput = {
    operation: SpecificationOperation.Split,
    baseFeatureId: baseFeatureId,
    splitByProperty: `split-property`,
  };

  const stratificationConfig: FeatureConfigInput = {
    operation: SpecificationOperation.Stratification,
    baseFeatureId: baseFeatureId,
    againstFeatureId: stratificationFeatureId,
    splitByProperty: `split-property-for-stratification`,
  };

  return {
    WhenDraftWithTwoConfigurationsCreates: () =>
      Specification.new(scenarioId, [splitConfig, stratificationConfig], true, {
        rawConfig: 1337,
      }),
    ThenSpecificationIsCreated(specification: Specification) {
      expect(specification.getUncommittedEvents()).toEqual([
        new SpecificationCandidateCreated(
          specification.scenarioId,
          specification.id,
          [splitConfig, stratificationConfig],
          true,
        ),
      ]);
      expect(specification.toSnapshot()).toEqual({
        id: specification.id,
        scenarioId: specification.scenarioId,
        draft: true,
        readyToActivate: false,
        raw: {
          rawConfig: 1337,
        },
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
        featuresDetermined: false,
      });
    },
  };
};
