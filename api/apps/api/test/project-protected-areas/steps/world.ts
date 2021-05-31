import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { Job } from 'bullmq';

import { QueueToken } from '../../../src/modules/queue/queue.tokens';
import { GivenUserIsLoggedIn } from '../../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../../steps/given-project';

import { SubmitsProjectsPaShapefile } from './submits-projects-pa-shapefile';

export interface World {
  cleanup: () => Promise<void>;
  projectId: string;
  organizationId: string;
  WhenSubmittingShapefileFor: (projectId: string) => supertest.Test;
  GetSubmittedJobs: () => Job[];
}

export const createWorld = async (app: INestApplication): Promise<World> => {
  const jwtToken = await GivenUserIsLoggedIn(app);
  const queue = app.get(QueueToken);
  const {
    projectId,
    cleanup: projectCleanup,
    organizationId,
  } = await GivenProjectExists(app, jwtToken);
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
