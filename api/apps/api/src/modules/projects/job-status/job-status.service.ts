import { Injectable } from '@nestjs/common';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { ProjectsService } from '@marxan-api/modules/projects/projects.service';
import { ScenariosService } from '@marxan-api/modules/scenarios/scenarios.service';

@Injectable()
export class JobStatusService {
  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly scenariosService: ScenariosService,
    private readonly projectsService: ProjectsService,
  ) {}

  async getJobStatusFor(projectId: string): Promise<void> {
    await this.projectsService.findOne(projectId);

    // get status of project job(s) ?

    // get all scenarios for given project

    // for each scenario, find its jobs and relevant statuses

    /**
     *
     * Draft of SQL
     *
     * SELECT kind, topic, MAX(timestamp) from api_events where
     --topic in ('03fb678e-689b-473c-af80-6915685a53a8', 'ce2069ee-2925-4c73-a328-882447e6c84d') and
     ( kind like 'project.protectedAreas%' or kind like 'user.account%' )
     group by kind, topic
     */
  }
}
