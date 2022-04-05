import { INestApplication } from '@nestjs/common';

import { GivenUserIsLoggedIn } from '../../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../../steps/given-project';

import { SubmitsProjectsPaShapefile } from './submits-projects-pa-shapefile';
import { FakeQueue } from '../../utils/queues';

import { addProtectedAreaQueueName } from '@marxan/protected-areas';
import { GivenScenarioExists } from '../../steps/given-scenario-exists';

export const createWorld = async (app: INestApplication) => {
  const jwtToken = await GivenUserIsLoggedIn(app);
  const queue = FakeQueue.getByName(addProtectedAreaQueueName);
  const {
    projectId,
    cleanup: projectCleanup,
    organizationId,
  } = await GivenProjectExists(app, jwtToken, {
    countryId: 'BWA',
    adminAreaLevel1Id: 'BWA.12_1',
    adminAreaLevel2Id: 'BWA.12.1_1',
  });
  const scenario = await GivenScenarioExists(app, projectId, jwtToken, {
    name: `${new Date().getTime()}`,
  });
  const shapeFilePath = __dirname + '/stations-shapefile.zip';

  return {
    scenarioId: scenario.id,
    projectId,
    organizationId,
    WhenSubmittingShapefileFor: (scenarioId: string) =>
      SubmitsProjectsPaShapefile(app, jwtToken, scenarioId, shapeFilePath),
    GetSubmittedJobs: () => Object.values(queue.jobs),
    cleanup: async () => Promise.all([projectCleanup()]).then(() => undefined),
  };
};
