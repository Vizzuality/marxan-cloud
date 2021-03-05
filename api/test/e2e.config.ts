import * as faker from 'faker';
import { CreateOrganizationDTO } from 'modules/organizations/dto/create.organization.dto';
import { CreateProjectDTO } from 'modules/projects/dto/create.project.dto';
import { CreateScenarioDTO } from 'modules/scenarios/dto/create.scenario.dto';
import { PlanningUnitGridShape } from 'modules/projects/project.api.entity';
import { JobStatus, ScenarioType } from 'modules/scenarios/scenario.api.entity';
import { CreateUserDTO } from 'modules/users/dto/create.user.dto';
import { UpdateUserDTO } from 'modules/users/dto/update.user.dto';

export const E2E_CONFIG: {
  users: {
    basic: {
      aa: Partial<CreateUserDTO> & { username: string };
      bb: Partial<CreateUserDTO> & { username: string };
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
      complete: (options: unknown) => Partial<CreateProjectDTO>;
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
      }),
      complete: (options: { countryCode: string }): CreateProjectDTO => ({
        name: faker.random.words(5),
        organizationId: faker.random.uuid(),
        description: faker.lorem.paragraphs(2),
        countryId: options.countryCode,
        adminAreaLevel1Id: faker.random.alphaNumeric(7),
        adminAreaLevel2Id: faker.random.alphaNumeric(12),
        planningUnitGridShape: PlanningUnitGridShape.hexagon,
        planningUnitAreakm2: 10,
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
};
