import { PromiseType } from 'utility-types';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { OrganizationsService } from '@marxan-api/modules/organizations/organizations.service';
import { ProjectsCrudService } from '@marxan-api/modules/projects/projects-crud.service';
import { ScenariosCrudService } from '@marxan-api/modules/scenarios/scenarios-crud.service';
import { Scenario as ScenarioEntity } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ScenarioJobStatus } from '@marxan-api/modules/projects/job-status/job-status.view.api.entity';
import { CreateOrganizationDTO } from '@marxan-api/modules/organizations/dto/create.organization.dto';
import { CreateProjectDTO } from '@marxan-api/modules/projects/dto/create.project.dto';
import { CreateScenarioDTO } from '@marxan-api/modules/scenarios/dto/create.scenario.dto';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import {
  JobStatusService,
  Scenario,
} from '@marxan-api/modules/projects/job-status';
import { E2E_CONFIG } from '../e2e.config';
import { bootstrapApplication } from '../utils/api-application';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures.cleanup();
});

describe(`when has two projects with scenarios and events`, () => {
  let result: Scenario[];
  let scenarioIds: string[];
  let projectId: string;
  beforeEach(async () => {
    ({
      scenarioIds,
      projectId,
    } = await fixtures.givenProjectWithTwoScenariosWithOverridingEvents());
    await fixtures.givenAnotherProjectWithAScenarioWithAnEvent();

    result = await fixtures.getJobStatusService().getJobStatusFor(projectId);
  });

  it(`should return last events of every job for scenarios of the project`, () => {
    expect(result).toEqual(
      [
        {
          jobs: [
            {
              kind: 'costSurface',
              status: 'done',
            },
            {
              kind: 'planningUnitsInclusion',
              status: 'failure',
            },
          ],
          scenarioId: scenarioIds[0],
        },
        {
          jobs: [
            {
              kind: 'costSurface',
              status: 'running',
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
  const organizationRepository = application.get(OrganizationsService);
  const organization = await organizationRepository.create(
    E2E_CONFIG.organizations.valid.minimal() as CreateOrganizationDTO,
  );
  const projectRepository = application.get(ProjectsCrudService);
  const addedProjects: Project[] = [];
  const scenarioRepository = application.get(ScenariosCrudService);
  const addedScenarios: ScenarioEntity[] = [];

  const addedEvents: ApiEvent[] = [];

  const statusRepository: Repository<ScenarioJobStatus> = application.get(
    getRepositoryToken(ScenarioJobStatus),
  );

  const fixtures = {
    async givenProjectWithTwoScenariosWithOverridingEvents() {
      const project = await projectRepository.create({
        ...(E2E_CONFIG.projects.valid.minimal() as CreateProjectDTO),
        organizationId: organization.id,
      });
      const scenario1 = await scenarioRepository.create({
        ...(E2E_CONFIG.scenarios.valid.minimal() as CreateScenarioDTO),
        projectId: project.id,
      });
      const scenario2 = await scenarioRepository.create({
        ...(E2E_CONFIG.scenarios.valid.minimal() as CreateScenarioDTO),
        projectId: project.id,
      });
      const eventDtos = [
        {
          kind:
            API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
          topic: scenario1.id,
        },
        {
          kind: API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
          topic: scenario1.id,
        },
        {
          kind:
            API_EVENT_KINDS.scenario__planningUnitsInclusion__submitted__v1__alpha1,
          topic: scenario1.id,
        },
        {
          kind:
            API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1,
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
      addedProjects.push(project);
      addedScenarios.push(scenario1, scenario2);
      return {
        projectId: project.id,
        scenarioIds: [scenario1.id, scenario2.id],
      };
    },
    async givenAnotherProjectWithAScenarioWithAnEvent() {
      const project = await projectRepository.create({
        ...(E2E_CONFIG.projects.valid.minimal() as CreateProjectDTO),
        organizationId: organization.id,
      });
      const scenario = await scenarioRepository.create({
        ...(E2E_CONFIG.scenarios.valid.minimal() as CreateScenarioDTO),
        projectId: project.id,
      });
      const event = await eventsRepository.create({
        kind:
          API_EVENT_KINDS.scenario__planningUnitsInclusion__finished__v1__alpha1,
        topic: project.id,
      });
      addedProjects.push(project);
      addedScenarios.push(scenario);
      addedEvents.push(event);
    },
    async cleanup() {
      await eventsRepository.repo.remove(addedEvents);
      await Promise.all(
        addedScenarios.map((scenario) =>
          scenarioRepository.remove(scenario.id),
        ),
      );
      await Promise.all(
        addedProjects.map((project) => projectRepository.remove(project.id)),
      );
      await organizationRepository.remove(organization.id);
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
