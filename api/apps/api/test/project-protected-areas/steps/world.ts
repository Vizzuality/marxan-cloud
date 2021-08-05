import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { Job } from 'bullmq';

import { GivenUserIsLoggedIn } from '../../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../../steps/given-project';

import { SubmitsProjectsPaShapefile } from './submits-projects-pa-shapefile';
import { FakeQueue } from '../../utils/queues';
import { queueName } from '@marxan-api/modules/projects/protected-areas/queue-name';

export interface World {
  cleanup: () => Promise<void>;
  projectId: string;
  organizationId: string;
  WhenSubmittingShapefileFor: (projectId: string) => supertest.Test;
  GetSubmittedJobs: () => Job[];
}

export const createWorld = async (app: INestApplication): Promise<World> => {
  const jwtToken = await GivenUserIsLoggedIn(app);
  const queue = FakeQueue.getByName(queueName);
  const {
    projectId,
    cleanup: projectCleanup,
    organizationId,
  } = await GivenProjectExists(app, jwtToken, {
    countryCode: 'BWA',
    adminAreaLevel1Id: 'BWA.12_1',
    adminAreaLevel2Id: 'BWA.12.1_1',
  });
  const shapeFilePath = __dirname + '/stations-shapefile.zip';

  return {
    projectId,
    organizationId,
    WhenSubmittingShapefileFor: (projectId: string) =>
      SubmitsProjectsPaShapefile(app, jwtToken, projectId, shapeFilePath),
    GetSubmittedJobs: () => Object.values(queue.jobs),
    cleanup: async () => Promise.all([projectCleanup()]).then(() => undefined),
  };
};
