import { PromiseType } from 'utility-types';
import { INestApplication } from '@nestjs/common';

import { bootstrapApplication } from '../utils/api-application';
import { FakeQueue } from '../utils/queues';
import { createWorld } from './world';
import { pick } from 'lodash';

let app: INestApplication;
let queue: FakeQueue;
let world: PromiseType<ReturnType<typeof createWorld>>;

beforeEach(async () => {
  app = await bootstrapApplication();
  world = await createWorld(app);

  queue = FakeQueue.getByName('planning-units');
});

describe('PlanningUnitsModule (e2e)', () => {
  describe('When creating a project without Admin Areas', () => {
    beforeAll(async () => {
      queue.disposeFakeJobs();
      await world.WhenCreatingProjectWithoutAdminAreas();
    });

    it('should not trigger planning unit jobs', async () => {
      expect(Object.keys(queue.jobs).length).toEqual(0);
    });
  });

  describe(`When creating a project with Admin Areas`, () => {
    beforeAll(async () => {
      queue.disposeFakeJobs();
      await world.WhenCreatingProjectWithAdminAreas();
    });
    it('should trigger planning unit jobs', async () => {
      const job = queue.jobs[Object.keys(queue.jobs)[0]];

      expect(job.name).toEqual('create-regular-pu');
      expect(
        pick(job.data, ['adminAreaLevel1Id', 'adminAreaLevel2Id', 'countryId']),
      ).toMatchInlineSnapshot(`
        Object {
          "adminAreaLevel1Id": "NAM.8_1",
          "adminAreaLevel2Id": "NAM.8.6_1",
          "countryId": "NAM",
        }
      `);
    });
  });
});
