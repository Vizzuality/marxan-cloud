import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import * as request from 'supertest';
import waitForExpect from 'wait-for-expect';
import { FakeQueue } from '../utils/queues';

import { setPlanningUnitGridQueueToken } from '@marxan-api/modules/projects/planning-unit-grid/queue.providers';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const queue: FakeQueue = app.get(setPlanningUnitGridQueueToken);
  const cleanups: (() => Promise<void>)[] = [];
  return {
    cleanup: async () => {
      await Promise.all(cleanups);
      await app.close();
    },
    async GivenProjectWasCreated() {
      const { projectId, cleanup } = await GivenProjectExists(app, token, {
        name: `grid project ${Date.now()}`,
        countryCode: `NAM`,
      });
      cleanups.push(cleanup);
      return projectId;
    },
    WhenSubmittingValidGridShapefile: async (projectId: string) =>
      request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/grid`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, __dirname + '/grid-nam-shapefile.zip'),
    ThenShapefileIsSubmittedToProcessing: async (body: any) => {
      expect(body.id).toBeDefined();
      await waitForExpect(async () => {
        // using implementation details...
        const job = Object.values(queue.jobs).find((j) => j.id === body.id);
        expect(job).toBeDefined();
        expect(job!.data?.projectId).toBeDefined();
        expect(job!.data?.shapefile.filename).toMatch(/grid-nam-shapefile.zip/);
      });
    },
  };
};
