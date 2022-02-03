import { v4 } from 'uuid';
import { SpecificationRepository } from '@marxan-api/modules/specification/application/specification.repository';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import {
  Specification,
  SpecificationOperation,
} from '@marxan-api/modules/specification/domain';
import { bootstrapApplication } from '../utils/api-application';

export const getFixtures = async () => {
  const app = await bootstrapApplication();

  const specificationRepository = app.get(SpecificationRepository);

  const jwtToken = await GivenUserIsLoggedIn(app);
  const { projectId, cleanup } = await GivenProjectExists(app, jwtToken);
  const scenario = await GivenScenarioExists(app, projectId, jwtToken, {
    name: `Specifications ${Date.now()}`,
  });

  const splitBaseFeatureId = v4();
  const stratificationBaseFeatureId = v4();
  const stratificationAgainstFeatureId = v4();
  const calculatedFeatureId = v4();
  const calculatedForBothFeatureId = v4();
  const nonCalculatedFeatureId = v4();

  return {
    cleanup: async () => {
      await ScenariosTestUtils.deleteScenario(app, jwtToken, scenario.id);
      await cleanup();
    },
    GivenSpecificationWasCreated: async (): Promise<Specification> => {
      const specification = Specification.from({
        id: v4(),
        draft: false,
        scenarioId: scenario.id,
        raw: {
          rawConfig: 1337,
        },
        config: [
          {
            id: v4(),
            operation: SpecificationOperation.Split,
            featuresDetermined: true,
            baseFeatureId: splitBaseFeatureId,
            resultFeatures: [
              {
                featureId: calculatedFeatureId,
                calculated: true,
              },
              {
                featureId: calculatedForBothFeatureId,
                calculated: true,
              },
            ],
          },
          {
            id: v4(),
            operation: SpecificationOperation.Stratification,
            featuresDetermined: true,
            againstFeatureId: stratificationAgainstFeatureId,
            baseFeatureId: stratificationBaseFeatureId,
            resultFeatures: [
              {
                featureId: nonCalculatedFeatureId,
                calculated: false,
              },
              {
                featureId: calculatedForBothFeatureId,
                calculated: true,
              },
            ],
          },
        ],
      });
      await specificationRepository.save(specification);
      return specification;
    },
    WhenGettingSpecification: (id: string) =>
      specificationRepository.getById(id),
    ThenTheyAreEqual: (
      specification: Specification,
      restoredSpecification: Specification | undefined,
    ) => {
      expect(specification.toSnapshot()).toEqual(
        restoredSpecification?.toSnapshot(),
      );
    },
    ThenResultIncludesRelatedSpecification(
      specification: Specification,
      specifications: Specification[],
    ) {
      // as we create only one within tests..
      expect(specifications.length).toEqual(1);
      this.ThenTheyAreEqual(specification, specifications[0]);
    },
  };
};
