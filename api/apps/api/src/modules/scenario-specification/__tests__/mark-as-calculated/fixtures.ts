import { v4 } from 'uuid';
import { ScenarioSpecification } from '../../scenario-specification';
import { SpecificationOperation } from '../../specification-operation';
import { SpecificationActivated } from '../../../specification/specification-actived.event';

export const getFixtures = () => {
  const scenarioId = v4();
  const baseFeatureId = v4();
  const nonCalculatedFeatureOne = v4();
  const nonCalculatedFeatureTwo = v4();

  const scenarioSpec = new ScenarioSpecification(scenarioId, undefined, {
    id: v4(),
    draft: false,
    config: [
      {
        operation: SpecificationOperation.Split,
        baseFeatureId: baseFeatureId,
        featuresDetermined: true,
        resultFeatures: [
          {
            id: nonCalculatedFeatureOne,
            calculated: false,
          },
        ],
      },
      {
        operation: SpecificationOperation.Split,
        baseFeatureId: baseFeatureId,
        featuresDetermined: true,
        resultFeatures: [
          {
            id: nonCalculatedFeatureTwo,
            calculated: false,
          },
        ],
      },
    ],
    activated: false,
  });

  return {
    scenarioSpec,
    nonCalculatedFeatureOne,
    nonCalculatedFeatureTwo,
    ThenSpecificationIsNotActivated() {
      expect(scenarioSpec.getActiveSpecification()).toBeUndefined();
      expect(scenarioSpec.getUncommittedEvents()).toEqual([]);
    },
    ThenSpecificationIsActivated() {
      expect(scenarioSpec.getActiveSpecification()).toBeDefined();
      expect(scenarioSpec.getUncommittedEvents()).toEqual([
        new SpecificationActivated(scenarioSpec.getActiveSpecification()!.id),
      ]);
    },
  };
};
