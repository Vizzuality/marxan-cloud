import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import {
  AsyncJobsGarbageCollectorFinished,
  GarbageCollectAsyncJobs,
  GarbageCollectAsyncJobsHandler,
} from '@marxan-api/modules/async-jobs-garbage-collector';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GivenProjectExists } from '../steps/given-project';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { GivenUserExists } from '../steps/given-user-exists';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { EventBusTestUtils } from '../utils/event-bus.test.utils';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 20000);

afterEach(async () => {
  await fixtures?.cleanup();
});

it('does not send failed api events for not started async jobs', async () => {
  const projectId = await fixtures.GivenProjectExists();
  const scenarioId = await fixtures.GivenScenarioExists(projectId);
  await fixtures.GivenNoAsyncJobsFor(projectId, scenarioId);
  await fixtures.WhenExecutionAsyncJobsGarbageCollector();
  await fixtures.ThenAsyncJobsGarbageCollectorFinished();
  await fixtures.ThenNoFailedApiEventsHasBeenSendForAsyncJobs(projectId);
});

it('does not send failed api events for not stucked async jobs', async () => {
  const projectId = await fixtures.GivenProjectExists();
  const scenarioId = await fixtures.GivenScenarioExists(projectId);
  await fixtures.GivenAsyncJobsFor(projectId, scenarioId, { isStuck: false });
  await fixtures.WhenExecutionAsyncJobsGarbageCollector();
  await fixtures.ThenAsyncJobsGarbageCollectorFinished();
  await fixtures.ThenNoFailedApiEventsHasBeenSendForAsyncJobs(projectId);
});

it('sends failed api events for stuck async jobs', async () => {
  const projectId = await fixtures.GivenProjectExists();
  const scenarioId = await fixtures.GivenScenarioExists(projectId);
  await fixtures.GivenAsyncJobsFor(projectId, scenarioId, { isStuck: true });
  await fixtures.WhenExecutionAsyncJobsGarbageCollector();
  await fixtures.ThenAsyncJobsGarbageCollectorFinished();
  await fixtures.ThenFailedApiEventsHasBeenSendForAsyncJobs(projectId);
});

const getFixtures = async () => {
  const app = await bootstrapApplication([CqrsModule], [EventBusTestUtils]);
  const eventBusTestUtils = app.get(EventBusTestUtils);
  eventBusTestUtils.startInspectingEvents();

  const usersProjectsRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );
  const usersScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );
  const apiEventsRepo: Repository<ApiEvent> = app.get(
    getRepositoryToken(ApiEvent),
  );
  const sut = app.get(GarbageCollectAsyncJobsHandler);

  const token = await GivenUserIsLoggedIn(app);
  const userId = await GivenUserExists(app);

  let projectCleanUp: () => Promise<void>;
  let projectId: string;
  let scenarioId: string;

  const getApiEvents = async (resourceId: string) => {
    return apiEventsRepo.find({ where: { topic: resourceId } });
  };

  const deleteApiEvents = async (resourceId: string) => {
    await apiEventsRepo.delete({ topic: resourceId });
    const projectApiEvents = await getApiEvents(resourceId);
    expect(projectApiEvents).toHaveLength(0);
  };

  const projectSubmittedApiEvents = [
    API_EVENT_KINDS.project__grid__submitted__v1__alpha,
    API_EVENT_KINDS.project__legacy__import__submitted__v1__alpha,
    API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha,
    API_EVENT_KINDS.project__clone__submitted__v1__alpha,
    API_EVENT_KINDS.project__export__submitted__v1__alpha,
    API_EVENT_KINDS.project__import__submitted__v1__alpha,
    API_EVENT_KINDS.project__protectedAreas__submitted__v1__alpha,
  ];

  const scenarioSubmittedApiEvents = [
    API_EVENT_KINDS.scenario__calibration__submitted_v1_alpha1,
    API_EVENT_KINDS.scenario__costSurface__submitted__v1_alpha1,
    API_EVENT_KINDS.scenario__featuresWithPuIntersection__submitted__v1__alpha1,
    API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__submitted__v1__alpha1,
    API_EVENT_KINDS.scenario__planningUnitsInclusion__submitted__v1__alpha1,
    API_EVENT_KINDS.scenario__run__submitted__v1__alpha1,
    API_EVENT_KINDS.scenario__clone__submitted__v1__alpha,
    API_EVENT_KINDS.scenario__export__submitted__v1__alpha,
    API_EVENT_KINDS.scenario__import__submitted__v1__alpha,
    API_EVENT_KINDS.scenario__specification__submitted__v1__alpha1,
  ];
  const projectFailedApiEvents = [
    API_EVENT_KINDS.project__grid__failed__v1__alpha,
    API_EVENT_KINDS.project__legacy__import__failed__v1__alpha,
    API_EVENT_KINDS.project__planningUnits__failed__v1__alpha,
    API_EVENT_KINDS.project__clone__failed__v1__alpha,
    API_EVENT_KINDS.project__export__failed__v1__alpha,
    API_EVENT_KINDS.project__import__failed__v1__alpha,
    API_EVENT_KINDS.project__protectedAreas__failed__v1__alpha,
  ];

  const scenarioFailedApiEvents = [
    API_EVENT_KINDS.scenario__calibration__failed_v1_alpha1,
    API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
    API_EVENT_KINDS.scenario__featuresWithPuIntersection__failed__v1__alpha1,
    API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__failed__v1__alpha1,
    API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1,
    API_EVENT_KINDS.scenario__run__failed__v1__alpha1,
    API_EVENT_KINDS.scenario__clone__failed__v1__alpha,
    API_EVENT_KINDS.scenario__export__failed__v1__alpha,
    API_EVENT_KINDS.scenario__import__failed__v1__alpha,
    API_EVENT_KINDS.scenario__specification__failed__v1__alpha1,
  ];

  const getProjectFailedApiEvents = async (projectId: string) => {
    return apiEventsRepo.find({
      where: { topic: projectId, kind: In(projectFailedApiEvents) },
    });
  };

  const getScenarioFailedApiEvents = async (scenarioId: string) => {
    return apiEventsRepo.find({
      where: { topic: scenarioId, kind: In(scenarioFailedApiEvents) },
    });
  };
  return {
    cleanup: async () => {
      await projectCleanUp();
      await usersProjectsRepo.delete({ projectId });
      await usersScenariosRepo.delete({ scenarioId });
      await apiEventsRepo.delete({ topic: projectId });
      await apiEventsRepo.delete({ topic: scenarioId });
      eventBusTestUtils.stopInspectingEvents();
      await app.close();
    },
    GivenProjectExists: async () => {
      const project = await GivenProjectExists(app, token);
      projectId = project.projectId;
      projectCleanUp = project.cleanup;
      return projectId;
    },
    GivenScenarioExists: async (projectId: string) => {
      const scenario = await GivenScenarioExists(app, projectId, token);
      scenarioId = scenario.id;
      return scenarioId;
    },
    GivenNoAsyncJobsFor: async (projectId: string, scenarioId: string) => {
      await deleteApiEvents(projectId);
      await deleteApiEvents(scenarioId);
    },
    GivenAsyncJobsFor: async (
      projectId: string,
      scenarioId: string,
      opts: { isStuck: boolean },
    ) => {
      await deleteApiEvents(projectId);
      await deleteApiEvents(scenarioId);
      const apiEventDate = opts.isStuck ? new Date(2021, 1, 1) : new Date();
      const projectApiEventAndKind = projectSubmittedApiEvents.map((kind) => ({
        kind,
        topic: projectId,
        timestamp: apiEventDate,
      }));
      const scenarioApiEventAndKind = scenarioSubmittedApiEvents.map(
        (kind) => ({
          kind,
          topic: scenarioId,
          timestamp: apiEventDate,
        }),
      );
      return apiEventsRepo.save([
        ...projectApiEventAndKind,
        ...scenarioApiEventAndKind,
      ]);
    },
    WhenExecutionAsyncJobsGarbageCollector: () => {
      return sut.execute(new GarbageCollectAsyncJobs(userId));
    },
    ThenAsyncJobsGarbageCollectorFinished: async () => {
      await eventBusTestUtils.waitUntilEventIsPublished(
        AsyncJobsGarbageCollectorFinished,
      );
    },
    ThenFailedApiEventsHasBeenSendForAsyncJobs: async (projectId: string) => {
      const projectFailedApiEventsFound =
        await getProjectFailedApiEvents(projectId);
      expect(projectFailedApiEventsFound).toHaveLength(
        projectFailedApiEvents.length,
      );
      const scenarioFailedApiEventsFound =
        await getScenarioFailedApiEvents(scenarioId);
      expect(scenarioFailedApiEventsFound).toHaveLength(
        scenarioFailedApiEvents.length,
      );
    },
    ThenNoFailedApiEventsHasBeenSendForAsyncJobs: async (projectId: string) => {
      const projectFailedApiEventsFound =
        await getProjectFailedApiEvents(projectId);
      expect(projectFailedApiEventsFound).toHaveLength(0);
      const scenarioFailedApiEventsFound =
        await getScenarioFailedApiEvents(scenarioId);
      expect(scenarioFailedApiEventsFound).toHaveLength(0);
    },
  };
};
