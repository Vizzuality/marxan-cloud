import * as faker from 'faker';
import {
  PlanningUnitsJob,
  PlanningUnitGridShape,
} from 'src/modules/planning-units/dto/create.regular.planning-units.dto';

export const E2E_CONFIG: {
  planningUnits: {
    creationJob: {
      valid: {
        customArea: (options: unknown) => PlanningUnitsJob;
        adminRegion: (options: unknown) => PlanningUnitsJob;
      };
      invalid: {
        customArea: (options: unknown) => PlanningUnitsJob;
        adminRegion: (options: unknown) => PlanningUnitsJob;
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
          planningUnitGridShape: PlanningUnitGridShape.square,
          planningUnitAreakm2: 100,
        }),
      },
      invalid: {
        customArea: (options: { countryCode: string }): PlanningUnitsJob => ({
          countryId: options.countryCode,
          adminAreaLevel1Id: faker.random.alphaNumeric(7),
          adminAreaLevel2Id: faker.random.alphaNumeric(12),
          planningUnitGridShape: PlanningUnitGridShape.hexagon,
          planningUnitAreakm2: -100,
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
          planningUnitGridShape: PlanningUnitGridShape.square,
          planningUnitAreakm2: 100,
        }),
      },
    },
  },
};
