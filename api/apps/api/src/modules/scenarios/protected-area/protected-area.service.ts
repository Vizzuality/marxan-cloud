import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Either, left, right } from 'fp-ts/Either';

import { ProjectSnapshot } from '@marxan/projects';
import { JobInput, JobOutput } from '@marxan/protected-areas';
import { API_EVENT_KINDS } from '@marxan/api-events';

import { ApiEventsService } from '@marxan-api/modules/api-events';

import { scenarioProtectedAreaQueueToken } from './queue.providers';
import { SelectProtectedArea } from './select-protected-area';
import {
  ChangeProtectedAreasError,
  SelectionUpdateService,
} from './selection/selection-update.service';
import { SelectionGetService } from './getter/selection-get.service';
import { ScenarioProtectedArea } from '@marxan-api/modules/scenarios/protected-area/scenario-protected-area';

export const submissionFailed = Symbol(
  `System could not submit the async job.`,
);

@Injectable()
export class ProtectedAreaService {
  constructor(
    @Inject(scenarioProtectedAreaQueueToken)
    private readonly queue: Queue<JobInput, JobOutput>,
    private readonly apiEvents: ApiEventsService,
    private readonly selectionUpdateService: SelectionUpdateService,
    private readonly selectionGetService: SelectionGetService,
  ) {}

  async addShapeFor(
    projectId: string,
    scenarioId: string,
    shapefile: JobInput['shapefile'],
    name: JobInput['name'],
  ): Promise<Either<typeof submissionFailed, true>> {
    const job = await this.queue.add(`add-protected-area`, {
      projectId,
      scenarioId,
      shapefile,
      name,
    });

    // bad typing? may happen that job wasn't added
    if (!job) {
      return left(submissionFailed);
    }

    const kind = API_EVENT_KINDS.scenario__protectedAreas__submitted__v1__alpha;
    try {
      await this.apiEvents.create({
        kind,
        topic: scenarioId,
        data: {
          kind,
          scenarioId,
          projectId,
          name,
        },
      });
    } catch (error: unknown) {
      return left(submissionFailed);
    }

    return right(true);
  }

  async selectFor(
    scenario: {
      id: string;
      protectedAreaIds: string[];
      threshold: number;
    },
    project: ProjectSnapshot,
    newSelection: SelectProtectedArea[],
  ): Promise<Either<ChangeProtectedAreasError, true>> {
    return this.selectionUpdateService.selectFor(
      scenario,
      project,
      newSelection,
    );
  }

  async getFor(
    scenario: {
      id: string;
      protectedAreaIds: string[];
    },
    project: ProjectSnapshot,
  ): Promise<ScenarioProtectedArea[]> {
    return this.selectionGetService.getFor(scenario, project);
  }
}
