import { PromiseType } from 'utility-types';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ScenarioJobStatus } from '@marxan-api/modules/projects/job-status/job-status.view.api.entity';
import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import {
  JobStatusService,
  ProjectWithScenarios,
} from '@marxan-api/modules/projects/job-status';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../steps/given-project';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

describe(`when has two projects with scenarios and events`, () => {
  let result: ProjectWithScenarios;
  let scenarioIds: string[];
  let projectId: string;
  beforeEach(async () => {
    ({ scenarioIds, projectId } =
      await fixtures.givenProjectWithTwoScenariosWithOverridingEvents());
    await fixtures.givenAnotherProjectWithAScenarioWithAnEvent();

    result = await fixtures.getJobStatusService().getJobStatusFor(projectId);
  });

  it(`should return last events of every job for scenarios of the project`, () => {
    expect(result.scenarios).toEqual(
      [
        {
          jobs: [
            {
              kind: 'costSurface',
              status: 'done',
              isoDate: expect.any(String),
            },
            {
              kind: 'planningUnitsInclusion',
              status: 'failure',
              isoDate: expect.any(String),
            },
          ],
          scenarioId: scenarioIds[0],
        },
        {
          jobs: [
            {
              kind: 'costSurface',
              status: 'running',
              isoDate: expect.any(String),
            },
          ],
          scenarioId: scenarioIds[1],
        },
      ].sort((a, b) => a.scenarioId.localeCompare(b.scenarioId)),
    );
  });
});

async function getFixtures() {
  const application = await bootstrapApplication();

  const eventsRepository = application.get(ApiEventsService);
  const addedOrganizations: string[] = [];
  const addedProjects: string[] = [];
  const addedEvents: ApiEvent[] = [];

  const statusRepository: Repository<ScenarioJobStatus> = application.get(
    getRepositoryToken(ScenarioJobStatus),
  );

  const token = await GivenUserIsLoggedIn(application);

  const fixtures = {
    async givenProjectWithTwoScenariosWithOverridingEvents() {
      const { projectId, organizationId } = await GivenProjectExists(
        application,
        token,
      );
      const scenario1 = await GivenScenarioExists(
        application,
        projectId,
        token,
      );
      const scenario2 = await GivenScenarioExists(
        application,
        projectId,
        token,
      );

      const eventDtos = [
        {
          kind: API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
          topic: scenario1.id,
        },
        {
          kind: API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
          topic: scenario1.id,
        },
        {
          kind: API_EVENT_KINDS.scenario__planningUnitsInclusion__submitted__v1__alpha1,
          topic: scenario1.id,
        },
        {
          kind: API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1,
          topic: scenario1.id,
        },
        {
          kind: API_EVENT_KINDS.scenario__costSurface__submitted__v1_alpha1,
          topic: scenario2.id,
        },
      ];
      for (const eventDto of eventDtos) {
        const event = await eventsRepository.create(eventDto);
        addedEvents.push(event);
      }
      addedProjects.push(projectId);
      addedOrganizations.push(organizationId);
      return {
        projectId,
        scenarioIds: [scenario1.id, scenario2.id],
      };
    },
    async givenAnotherProjectWithAScenarioWithAnEvent() {
      const { projectId, organizationId } = await GivenProjectExists(
        application,
        token,
      );
      await GivenScenarioExists(application, projectId, token);
      const event = await eventsRepository.create({
        kind: API_EVENT_KINDS.scenario__planningUnitsInclusion__finished__v1__alpha1,
        topic: projectId,
      });
      addedOrganizations.push(organizationId);
      addedProjects.push(projectId);
      addedEvents.push(event);
    },
    async cleanup() {
      await eventsRepository.repo.remove(addedEvents);
      await Promise.all(
        addedProjects.map((projectId) =>
          ProjectsTestUtils.deleteProject(application, token, projectId),
        ),
      );
      await Promise.all(
        addedOrganizations.map((organizationId) =>
          OrganizationsTestUtils.deleteOrganization(
            application,
            token,
            organizationId,
          ),
        ),
      );
    },
    getStatusRepository() {
      return statusRepository;
    },
    getJobStatusService() {
      return application.get(JobStatusService);
    },
  };
  return fixtures;
}
