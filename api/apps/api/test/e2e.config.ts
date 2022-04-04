import * as faker from 'faker';
import { CreateOrganizationDTO } from '@marxan-api/modules/organizations/dto/create.organization.dto';
import { CreateProjectDTO } from '@marxan-api/modules/projects/dto/create.project.dto';
import { CreateScenarioDTO } from '@marxan-api/modules/scenarios/dto/create.scenario.dto';
import {
  JobStatus,
  ScenarioType,
} from '@marxan-api/modules/scenarios/scenario.api.entity';
import { CreateUserDTO } from '@marxan-api/modules/users/dto/create.user.dto';
import { UpdateUserDTO } from '@marxan-api/modules/users/dto/update.user.dto';
import { IUCNCategory } from '@marxan/iucn';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';

interface CountryCodeInput {
  countryCode?: string;
  adminLevel1?: string;
  adminLevel2?: string;
}

interface CustomPlanningAreaInput {
  planningAreaId?: string;
  planningUnitGridShape?: PlanningUnitGridShape;
  planningUnitAreakm2?: number;
}

export const E2E_CONFIG: {
  users: {
    basic: {
      aa: Partial<CreateUserDTO> & { username: string };
      bb: Partial<CreateUserDTO> & { username: string };
      cc: Partial<CreateUserDTO> & { username: string };
      dd: Partial<CreateUserDTO> & { username: string };
    };
    updated: {
      bb: () => Partial<UpdateUserDTO>;
    };
  };
  organizations: {
    valid: {
      minimal: () => Partial<CreateOrganizationDTO>;
    };
  };
  projects: {
    valid: {
      minimal: () => Partial<CreateProjectDTO>;
      minimalInGivenAdminArea: (options?: {
        countryCode: string;
        adminAreaLevel1Id?: string;
        adminAreaLevel2Id?: string;
        name?: string;
      }) => Partial<CreateProjectDTO>;
      complete: (options: CountryCodeInput) => Partial<CreateProjectDTO>;
      customArea: (
        options: CustomPlanningAreaInput,
      ) => Partial<CreateProjectDTO>;
      adminRegion: (options: CountryCodeInput) => Partial<CreateProjectDTO>;
    };
    invalid: {
      incomplete: () => Partial<CreateProjectDTO>;
    };
  };
  scenarios: {
    valid: {
      minimal: () => Partial<CreateScenarioDTO>;
      complete: () => Partial<CreateScenarioDTO>;
    };
    invalid: {
      missingRequiredFields: () => Partial<CreateScenarioDTO>;
    };
  };
  planningUnits: {
    valid: Record<string, unknown>;
    invalid: Record<string, unknown>;
  };
  protectedAreas: {
    categories: {
      valid: IUCNCategory[];
    };
  };
} = {
  users: {
    basic: {
      aa: {
        username: 'aa@example.com',
        password: 'aauserpassword',
      },
      bb: {
        username: 'bb@example.com',
        password: 'bbuserpassword',
      },
      cc: {
        username: 'cc@example.com',
        password: 'ccuserpassword',
      },
      dd: {
        username: 'dd@example.com',
        password: 'dduserpassword',
      },
    },
    updated: {
      bb: () => ({
        fname: faker.name.firstName(),
        lname: faker.name.lastName(),
        displayName: `${faker.name.title()} ${faker.name.firstName()} ${faker.name.firstName()}`,
        metadata: { key1: 'value1', key2: 2, key3: true },
      }),
    },
  },
  organizations: {
    valid: {
      minimal: () => ({
        name: faker.random.words(3),
        description: faker.lorem.sentence(),
      }),
    },
  },
  projects: {
    valid: {
      minimal: () => ({
        name: faker.random.words(5),
        organizationId: faker.random.uuid(),
        planningUnitGridShape: PlanningUnitGridShape.Irregular,
        planningUnitAreakm2: 10,
      }),
      minimalInGivenAdminArea: (options?: {
        countryCode?: string;
        adminAreaLevel1Id?: string;
        adminAreaLevel2Id?: string;
        name?: string;
      }): CreateProjectDTO => ({
        name: options?.name ?? faker.random.words(5),
        organizationId: faker.random.uuid(),
        countryId: options?.countryCode ?? 'NAM',
        adminAreaLevel1Id: options?.adminAreaLevel1Id,
        adminAreaLevel2Id: options?.adminAreaLevel2Id,
        planningUnitGridShape: PlanningUnitGridShape.Hexagon,
        planningUnitAreakm2: 10,
      }),
      complete: (options: CountryCodeInput): CreateProjectDTO => ({
        name: faker.random.words(5),
        organizationId: faker.random.uuid(),
        description: faker.lorem.paragraphs(2),
        countryId: options.countryCode,
        adminAreaLevel1Id: options.adminLevel1,
        adminAreaLevel2Id: options.adminLevel2,
        planningUnitGridShape: PlanningUnitGridShape.Hexagon,
        planningUnitAreakm2: 10,
        metadata: {
          [faker.random.word()]: faker.random.words(3),
          [faker.random.word()]: faker.random.uuid(),
        },
      }),
      customArea: (options: CustomPlanningAreaInput): CreateProjectDTO => ({
        name: faker.random.words(5),
        organizationId: faker.random.uuid(),
        description: faker.lorem.paragraphs(2),
        planningAreaId: options.planningAreaId,
        planningUnitGridShape: options.planningUnitGridShape,
        planningUnitAreakm2: options.planningUnitAreakm2,
        metadata: {
          [faker.random.word()]: faker.random.words(3),
          [faker.random.word()]: faker.random.uuid(),
        },
      }),
      adminRegion: (options: CountryCodeInput): CreateProjectDTO => ({
        name: faker.random.words(5),
        organizationId: faker.random.uuid(),
        description: faker.lorem.paragraphs(2),
        countryId: options.countryCode,
        adminAreaLevel1Id: faker.random.alphaNumeric(7),
        adminAreaLevel2Id: faker.random.alphaNumeric(12),
        planningUnitGridShape: PlanningUnitGridShape.Hexagon,
        planningUnitAreakm2: 10,
        metadata: {
          [faker.random.word()]: faker.random.words(3),
          [faker.random.word()]: faker.random.uuid(),
        },
      }),
    },
    invalid: {
      incomplete: () => ({
        name: faker.random.words(5),
      }),
    },
  },
  scenarios: {
    valid: {
      minimal: () => ({
        name: faker.random.words(5),
        type: ScenarioType.marxan,
        projectId: faker.random.uuid(),
      }),
      complete: () => ({
        name: faker.random.words(5),
        type: ScenarioType.marxan,
        projectId: faker.random.uuid(),
        description: faker.lorem.paragraphs(2),
        metadata: {},
        numberOfRuns: 100,
        boundaryLengthModifier: 0,
        status: JobStatus.created,
      }),
    },
    invalid: {
      missingRequiredFields: () => ({
        name: faker.random.words(3),
        description: faker.lorem.sentence(),
      }),
    },
  },
  planningUnits: {
    valid: {
      customExtent: {},
      adminRegion: {},
    },
    invalid: {
      customExtent: {},
      adminRegion: {},
    },
  },
  protectedAreas: {
    categories: {
      valid: [
        IUCNCategory.Ia,
        IUCNCategory.Ib,
        IUCNCategory.II,
        IUCNCategory.III,
        IUCNCategory.IV,
        IUCNCategory.V,
        IUCNCategory.VI,
        IUCNCategory.NotApplicable,
        IUCNCategory.NotAssigned,
        IUCNCategory.NotReported,
      ],
    },
  },
};
