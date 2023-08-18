import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Either, left, right } from 'fp-ts/Either';

import { ProjectSnapshot } from '@marxan/projects';
import { JobInput, JobOutput } from '@marxan/protected-areas';

import { ApiEventsService } from '@marxan-api/modules/api-events';

import { SelectProtectedArea } from './select-protected-area';
import {
  ChangeProtectedAreasError,
  SelectionUpdateService,
} from './selection/selection-update.service';
import { SelectionGetService } from './getter/selection-get.service';
import { ScenarioProtectedArea } from '@marxan-api/modules/scenarios/protected-area/scenario-protected-area';

@Injectable()
export class ProtectedAreaService {
  constructor(
    private readonly queue: Queue<JobInput, JobOutput>,
    private readonly apiEvents: ApiEventsService,
    private readonly selectionUpdateService: SelectionUpdateService,
    private readonly selectionGetService: SelectionGetService,
  ) {}

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
