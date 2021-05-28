import * as faker from 'faker';
import {
  PlanningUnitsJob,
  PlanningUnitGridShape,
} from '@marxan-geoprocessing/modules/planning-units/dto/create.regular.planning-units.dto';

interface OptionsWithCountryCode {
  countryCode: string;
}

export const E2E_CONFIG: {
  planningUnits: {
    creationJob: {
      valid: {
        customArea: (options: OptionsWithCountryCode) => PlanningUnitsJob;
        adminRegion: (options: OptionsWithCountryCode) => PlanningUnitsJob;
      };
      invalid: {
        customArea: (options: OptionsWithCountryCode) => PlanningUnitsJob;
        adminRegion: (options: OptionsWithCountryCode) => PlanningUnitsJob;
      };
    };
  };
} = {
  planningUnits: {
    creationJob: {
      valid: {
        customArea: (options: OptionsWithCountryCode): PlanningUnitsJob => ({
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
        adminRegion: (options: OptionsWithCountryCode): PlanningUnitsJob => ({
          countryId: options.countryCode,
          adminAreaLevel1Id: faker.random.alphaNumeric(7),
          adminAreaLevel2Id: faker.random.alphaNumeric(12),
          planningUnitGridShape: PlanningUnitGridShape.square,
          planningUnitAreakm2: 100,
        }),
      },
      invalid: {
        customArea: (options: OptionsWithCountryCode): PlanningUnitsJob => ({
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
        adminRegion: (options: OptionsWithCountryCode): PlanningUnitsJob => ({
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
