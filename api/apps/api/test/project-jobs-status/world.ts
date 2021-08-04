import { INestApplication } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import { API_EVENT_KINDS } from '@marxan/api-events';

import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { GivenApiEvent } from '../steps/given-api-event';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';
import * as request from 'supertest';

export const createWorld = async (app: INestApplication) => {
  const repo: Repository<ApiEvent> = app.get(getRepositoryToken(ApiEvent));
  const token = await GivenUserIsLoggedIn(app);
  const { projectId, cleanup: projectCleanup } = await GivenProjectExists(
    app,
    token,
    {
      countryCode: 'BWA',
      adminAreaLevel1Id: 'BWA.12_1',
      adminAreaLevel2Id: 'BWA.12.1_1',
    },
  );
  const scenarios: string[] = [];
  let scenarioIdWithPendingJob: string | undefined;
  let scenarioIdWithCostSurfaceFinished: string | undefined;

  return {
    projectId,
    scenarioIdWithPendingJob: () => scenarioIdWithPendingJob,
    scenarioIdWithCostSurfaceFinished: () => scenarioIdWithCostSurfaceFinished,
    GivenScenarioPlanningInclusionInProgress: async () => {
      const scenario = await GivenScenarioExists(app, projectId, token);
      scenarios.push(scenario.id);
      scenarioIdWithPendingJob = scenario.id;
      await GivenApiEvent(
        app,
        scenario.id,
        API_EVENT_KINDS.scenario__planningUnitsInclusion__submitted__v1__alpha1,
      );
    },
    GivenCostSurfaceFinished: async () => {
      const scenario = await GivenScenarioExists(app, projectId, token);
      scenarios.push(scenario.id);
      scenarioIdWithCostSurfaceFinished = scenario.id;
      await GivenApiEvent(
        app,
        scenario.id,
        API_EVENT_KINDS.scenario__costSurface__submitted__v1_alpha1,
      );
      await GivenApiEvent(
        app,
        scenario.id,
        API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
      );
    },
    WhenGettingProjectJobsStatus: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/scenarios/status`)
        .set('Authorization', `Bearer ${token}`),
    cleanup: async () => {
      await repo.delete({
        topic: In(scenarios),
      });
      await Promise.all(
        scenarios.map((scenarioId) =>
          ScenariosTestUtils.deleteScenario(app, token, scenarioId),
        ),
      );
      await projectCleanup();
    },
  };
};
