import { v4 } from 'uuid';
import {
  FeatureConfigInput,
  ScenarioSpecification,
} from '../../scenario-specification';
import { SpecificationOperation } from '../../specification-operation';
import { CandidateSpecCreated } from '../../candidate-spec-created.event';

export const getFixtures = () => {
  const scenarioId = v4();
  const baseFeatureId = v4();
  const stratificationFeatureId = v4();

  const scenarioSpec = new ScenarioSpecification(scenarioId);

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
    scenarioSpec,
    WhenCreatingCandidateWithTwoConfigurations: () => {
      scenarioSpec.createCandidate([splitConfig, stratificationConfig], true);
    },
    ThenCandidateSpecificationWasCreated() {
      const snapshot = scenarioSpec.getCandidateSpecification();
      expect(snapshot).toBeDefined();
      expect(scenarioSpec.getUncommittedEvents()).toEqual([
        new CandidateSpecCreated(snapshot!.id, [
          splitConfig,
          stratificationConfig,
        ]),
      ]);
    },
    ThenCandidateWasReplaced(previousSpecificationId: string) {
      expect(scenarioSpec.getCandidateSpecification()?.id).not.toEqual(
        previousSpecificationId,
      );
    },
  };
};
