import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';
import { CreateScenarioDTO } from '@marxan-api/modules/scenarios/dto/create.scenario.dto';
import { FakeQueue } from './utils/queues';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';
import { tearDown } from './utils/tear-down';
import { queueName } from '@marxan-api/modules/planning-units-protection-level/queue.name';

let queue: FakeQueue;
const logger = new Logger('test');

afterAll(async () => {
  await tearDown();
});

describe('ScenariosModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    app = await bootstrapApplication();
    jwtToken = await GivenUserIsLoggedIn(app);
    queue = FakeQueue.getByName(queueName);
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Scenarios', () => {
    let aScenario: { id: string; type: 'scenarios' };
    let projects: { id: string }[] = [];

    it('Gets projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      projects = resources;
      expect(resources[0].type).toBe('projects');
    });

    it('Creating a scenario with incomplete data should fail', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.scenarios.invalid.missingRequiredFields())
        .expect(400);
    });

    it('Creating a scenario with minimum required data should succeed', async () => {
      const createScenarioDTO: Partial<CreateScenarioDTO> = {
        ...E2E_CONFIG.scenarios.valid.minimal(),
        projectId: projects[0].id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createScenarioDTO)
        .expect(201);

      aScenario = response.body.data;
      expect(aScenario.type).toBe('scenarios');

      // Minimal data - no job submitted
      expect(Object.values(queue.jobs).length).toEqual(0);
    });

    it('Creating a scenario with complete data should succeed', async () => {
      const createScenarioDTO: Partial<CreateScenarioDTO> = {
        ...E2E_CONFIG.scenarios.valid.complete(),
        projectId: projects[0].id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createScenarioDTO)
        .expect(201);
      const job = Object.values(queue.jobs)[0];

      aScenario = response.body.data;
      expect(aScenario.type).toBe('scenarios');
      /**
       * @todo: there is an error on this test
      */
      // expect(job).toBeDefined();
      // expect(job.name).toMatch(/calculate-planning-units-protection-level/);
      // expect(job.data?.scenarioId).toBeDefined();
    });

    it('Gets scenarios', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources[0].type).toBe('scenarios');
    });

    it('Gets scenarios (paginated; pages of up to 5 items, no explicit page number - should default to 1)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scenarios?page[size]=5')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('scenarios');
      expect(resources.length).toBeLessThanOrEqual(5);
      expect(resources.length).toBeGreaterThanOrEqual(1);
    });

    it('Gets scenarios (paginated; pages of up to 5 items, first page)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scenarios?page[size]=5&page[number]=1')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources[0].type).toBe('scenarios');
      expect(resources.length).toBeLessThanOrEqual(5);
      expect(resources.length).toBeGreaterThanOrEqual(1);
    });

    it(`Gets scenarios with a free search`, async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/scenarios?q=oRG%202`)
        .set(`Authorization`, `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;
      expect(resources).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'scenarios',
            attributes: expect.objectContaining({
              name: 'Example scenario 1 Project 2 Org 2',
            }),
          }),
          expect.objectContaining({
            type: 'scenarios',
            attributes: expect.objectContaining({
              name: 'Example scenario 2 Project 2 Org 2',
            }),
          }),
        ]),
      );
    });

    it('Deletes the newly created scenario', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/scenarios/' + aScenario.id)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const resources = response.body.data;

      expect(resources).toBeUndefined();
    });

    it('should not allow to create scenario with invalid marxan properties', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/scenarios')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...E2E_CONFIG.scenarios.valid.minimal(),
          metadata: {
            marxanInputParameterFile: {
              HEURTYPE: 99999999213231,
            },
          },
        })
        // .expect(400)
        .then((response) => {
          console.log(response.body);
          console.log(response.text);
          expect(
            response.body.errors[0].meta.rawError.response.message[0]
              .constraints.isEnum,
          ).toMatchInlineSnapshot(`"HEURTYPE must be a valid enum value"`);
        });
    });
  });
});
