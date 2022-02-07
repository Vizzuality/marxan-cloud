import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Queue } from 'bullmq';

import { calibrationQueueToken } from './blm-calibration-queue.providers';
import { JobData } from '@marxan/blm-calibration';
import {
  blmCreationFailure,
  CreateInitialScenarioBlm,
  CreationFailure,
  CreationSuccess,
} from '@marxan-api/modules/scenarios/blm-calibration/create-initial-scenario-blm.command';
import { ProjectBlmRepo } from '@marxan-api/modules/blm';
import { ScenarioBlmRepo } from '@marxan-api/modules/blm/values';
import { Either, isLeft, left, right } from 'fp-ts/Either';

@CommandHandler(CreateInitialScenarioBlm)
export class CreateInitialScenarioBlmHandler
  implements IInferredCommandHandler<CreateInitialScenarioBlm> {
  constructor(
    @Inject(calibrationQueueToken)
    private readonly queue: Queue<JobData>,
    private readonly projectBlmRepository: ProjectBlmRepo,
    private readonly scenarioBlmRepository: ScenarioBlmRepo,
  ) {}

  async execute({
    scenarioId,
    projectId,
  }: CreateInitialScenarioBlm): Promise<
    Either<CreationFailure, CreationSuccess>
  > {
    const projectBlm = await this.projectBlmRepository.get(projectId);

    if (isLeft(projectBlm)) return left(blmCreationFailure);

    const copyResult = await this.scenarioBlmRepository.copy(
      scenarioId,
      projectBlm.right,
    );
    if (isLeft(copyResult)) return left(blmCreationFailure);

    return right(true);
  }
}
