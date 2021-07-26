import { v4 } from 'uuid';
import {
  FeatureConfigInput,
  ScenarioSpecification,
} from '../../scenario-specification';
import { SpecificationOperation } from '../../specification-operation';
import { SpecificationPublished } from '../../specification-published.event';
import { SpecificationActivated } from '../../specification-actived.event';

export const getFixtures = () => {
  const scenarioId = v4();
  const baseFeatureId = v4();
  const stratificationFeatureId = v4();
  const nonCalculatedFeature = v4();

  const scenarioSpec = new ScenarioSpecification(scenarioId, undefined, {
    id: v4(),
    draft: true,
    config: [],
    activated: false,
  });

  const splitConfig: FeatureConfigInput = {
    operation: SpecificationOperation.Split,
    baseFeatureId: baseFeatureId,
  };

  const stratificationConfig: FeatureConfigInput = {
    operation: SpecificationOperation.Stratification,
    baseFeatureId: baseFeatureId,
    againstFeatureId: stratificationFeatureId,
  };

  const featuresFromSplit = [
    {
      id: v4(),
      calculated: true,
    },
    {
      id: v4(),
      calculated: true,
    },
  ];

  const featuresFromStratificationSomeCalculated = [
    {
      id: v4(),
      calculated: true,
    },
    {
      id: nonCalculatedFeature,
      calculated: false,
    },
  ];

  const featuresFromStratificationAllCalculated = [
    {
      id: v4(),
      calculated: true,
    },
    {
      id: v4(),
      calculated: true,
    },
  ];

  return {
    scenarioSpec,
    GivenDraftWasSubmitted: () => {
      scenarioSpec.createCandidate([splitConfig, stratificationConfig], true);
    },
    GivenCreatedWasSubmitted: () => {
      scenarioSpec.createCandidate([splitConfig, stratificationConfig], false);
    },
    WhenFeaturesWereDetermined(allCalculated: boolean) {
      scenarioSpec.determineFeatures([
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
    ThenSpecificationIsNotPublished() {
      expect(
        scenarioSpec
          .getUncommittedEvents()
          .filter((event) => event instanceof SpecificationPublished),
      ).toEqual([]);
    },
    ThenSpecificationIsActivated() {
      const snapshot = scenarioSpec.getActiveSpecification()!;
      expect(
        scenarioSpec
          .getUncommittedEvents()
          .filter((event) => event instanceof SpecificationActivated),
      ).toEqual([new SpecificationActivated(snapshot.id)]);
      expect(snapshot.activated).toBeTruthy();
    },
    ThenSpecCandidateIsEmpty() {
      expect(scenarioSpec.getCandidateSpecification()).toBeUndefined();
    },
    ThenSpecificationIsPublished() {
      const snapshot = scenarioSpec.getCandidateSpecification()!;
      expect(
        scenarioSpec
          .getUncommittedEvents()
          .filter((event) => event instanceof SpecificationPublished),
      ).toEqual([
        new SpecificationPublished(snapshot.id, [nonCalculatedFeature]),
      ]);
    },
  };
};
