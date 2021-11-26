import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, isLeft, isRight, left } from 'fp-ts/Either';
import { Logger } from '@nestjs/common';

import { ProjectBlm, ProjectBlmRepo } from '@marxan-api/modules/blm';

import {
  ChangeBlmRange,
  ChangeRangeErrors,
  planningUnitAreaNotFound,
  updateFailure,
} from './change-blm-range.command';
import { SetProjectBlm } from './set-project-blm';
import { BlmValuesCalculator } from './domain/blm-values-calculator';
import { PlanningUnitAreaFetcher } from '@marxan-api/modules/projects/blm/planning-unit-area-fetcher';

@CommandHandler(ChangeBlmRange)
export class ChangeBlmRangeHandler
  implements IInferredCommandHandler<ChangeBlmRange> {
  private readonly logger: Logger = new Logger(SetProjectBlm.name);

  constructor(
    private readonly blmRepository: ProjectBlmRepo,
    private readonly planningUnitAreaFetcher: PlanningUnitAreaFetcher,
  ) {}

  async execute({
    projectId,
    range,
  }: ChangeBlmRange): Promise<Either<ChangeRangeErrors, ProjectBlm>> {
    const result = await this.planningUnitAreaFetcher.execute(projectId);

    if (isLeft(result)) {
      this.logger.error(
        `Could not get Planning Unit area for project with ID: ${projectId}`,
      );

      return result;
    }

    const blmValues = BlmValuesCalculator.with(range, result.right);

    const updateResult = await this.blmRepository.update(
      projectId,
      range,
      blmValues,
    );

    if (isLeft(updateResult)) {
      this.logger.error(
        `Could not update BLM for project with ID: ${projectId}`,
      );

      return left(updateFailure);
    }

    const updatedBlmValues = await this.blmRepository.get(projectId);
    if (isRight(updatedBlmValues)) return updatedBlmValues;

    return left(planningUnitAreaNotFound);
  }
}
