import * as faker from 'faker';
import {
  PlanningUnitsJob,
  PlanningUnitGridShape,
} from 'src/modules/planning-units/planning-units.job';

export const E2E_CONFIG: {
  planningUnits: {
    creationJob: {
      valid: {
        customArea: (options: unknown) => Partial<PlanningUnitsJob>;
        adminRegion: (options: unknown) => Partial<PlanningUnitsJob>;
      };
    };
  };
} = {
  planningUnits: {
    creationJob: {
      valid: {
        customArea: (options: { countryCode: string }): PlanningUnitsJob => ({
          countryId: options.countryCode,
          adminAreaLevel1Id: faker.random.alphaNumeric(7),
          adminAreaLevel2Id: faker.random.alphaNumeric(12),
          planningUnitGridShape: PlanningUnitGridShape.hexagon,
          planningUnitAreakm2: 100,
          extent: {
            type: 'Polygon',
            coordinates: [
              [
                [-10.0, -10.0],
                [10.0, -10.0],
                [10.0, 10.0],
                [-10.0, -10.0],
              ],
            ],
          },
        }),
        adminRegion: (options: { countryCode: string }): PlanningUnitsJob => ({
          countryId: options.countryCode,
          adminAreaLevel1Id: faker.random.alphaNumeric(7),
          adminAreaLevel2Id: faker.random.alphaNumeric(12),
          planningUnitGridShape: PlanningUnitGridShape.hexagon,
          planningUnitAreakm2: 100,
        }),
      },
    },
  },
};
