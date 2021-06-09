import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { ScenariosService } from '@marxan-api/modules/scenarios/scenarios.service';
import { JobStatus as Status } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { JobType } from './jobs.enum';

export { Status };

export interface Job {
  kind: JobType;
  status: Status;
}

export interface Scenario {
  scenarioId: string;
  status: Status;
  jobs: Job[];
}

@Injectable()
export class JobStatusService {
  constructor(
    private readonly apiEvents: ApiEventsService,
    private readonly scenariosService: ScenariosService,
  ) {}

  /**
   * @throws NotFoundException
   */
  async getJobStatusFor(_projectId: string): Promise<Scenario[]> {
    return [];
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
