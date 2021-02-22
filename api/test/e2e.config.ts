import * as faker from 'faker';
import { JobStatus, ScenarioType } from 'modules/scenarios/scenario.api.entity';

export const E2E_CONFIG = {
  users: {
    aa: {
      username: 'aa@example.com',
      password: 'aauserpassword',
    },
  },
  scenarios: {
    valid: {
      minimal: {
        name: faker.random.words(5),
        projectId: null,
      },
      complete:
      {
        name: faker.random.words(5),
        type: ScenarioType.marxan,
        projectId: null,
        description: faker.lorem.paragraphs(2),
        metadata: {},
        country: 'esp',
        adminRegionId: faker.random.uuid(),
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
        numberOfRuns: 100,
        boundaryLengthModifier: 0,
        status: JobStatus.created,
      },
    },
    invalid: {
      missingRequiredFields: {
        name: faker.random.words(3),
        description: faker.lorem.sentence(),
      },
    },
  },
};
