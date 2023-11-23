import * as faker from 'faker';
import { PlanningUnitsJob } from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';

interface OptionsWithCountryCode {
  countryCode: string;
  adminAreaLevel1Id?: string;
  adminAreaLevel2Id?: string;
  planningUnitAreakm2?: number;
  projectId?: string;
  costSurfaceId?: string;
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
          adminAreaLevel1Id:
            options.adminAreaLevel1Id ?? faker.random.alphaNumeric(7),
          adminAreaLevel2Id:
            options.adminAreaLevel2Id ?? faker.random.alphaNumeric(12),
          planningUnitGridShape: PlanningUnitGridShape.Hexagon,
          planningUnitAreakm2: options.planningUnitAreakm2 ?? 100,
          projectId:
            options.projectId ?? 'a9d965a2-35ce-44b2-8112-50bcdfe98447',
          costSurfaceId:
            options.costSurfaceId ?? '700d7cf9-011b-4adf-bbe8-4c35a100abc0',
        }),
        adminRegion: (options: OptionsWithCountryCode): PlanningUnitsJob => ({
          countryId: options.countryCode,
          adminAreaLevel1Id: faker.random.alphaNumeric(7),
          adminAreaLevel2Id: faker.random.alphaNumeric(12),
          planningUnitGridShape: PlanningUnitGridShape.Square,
          planningUnitAreakm2: options.planningUnitAreakm2 ?? 100,
          projectId:
            options.projectId ?? 'a9d965a2-35ce-44b2-8112-50bcdfe98447',
          costSurfaceId:
            options.costSurfaceId ?? '700d7cf9-011b-4adf-bbe8-4c35a100abc0',
        }),
      },
      invalid: {
        customArea: (options: OptionsWithCountryCode): PlanningUnitsJob => ({
          countryId: options.countryCode,
          adminAreaLevel1Id: faker.random.alphaNumeric(7),
          adminAreaLevel2Id: faker.random.alphaNumeric(12),
          planningUnitGridShape: PlanningUnitGridShape.Hexagon,
          planningUnitAreakm2: -100,
          projectId:
            options.projectId ?? 'a9d965a2-35ce-44b2-8112-50bcdfe98447',
          costSurfaceId:
            options.costSurfaceId ?? '700d7cf9-011b-4adf-bbe8-4c35a100abc0',
        }),
        adminRegion: (options: OptionsWithCountryCode): PlanningUnitsJob => ({
          countryId: options.countryCode,
          adminAreaLevel1Id: faker.random.alphaNumeric(7),
          adminAreaLevel2Id: faker.random.alphaNumeric(12),
          planningUnitGridShape: PlanningUnitGridShape.Square,
          planningUnitAreakm2: options.planningUnitAreakm2 ?? 100,
          projectId:
            options.projectId ?? 'a9d965a2-35ce-44b2-8112-50bcdfe98447',
          costSurfaceId:
            options.costSurfaceId ?? '700d7cf9-011b-4adf-bbe8-4c35a100abc0',
        }),
      },
    },
  },
};
