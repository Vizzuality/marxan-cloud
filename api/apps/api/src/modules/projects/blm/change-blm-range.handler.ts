import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, isLeft, isRight, left } from 'fp-ts/Either';
import { Logger } from '@nestjs/common';

import { ProjectBlm, ProjectBlmRepo } from '@marxan-api/modules/blm';

import {
  ChangeBlmRange,
  ChangeRangeErrors,
  invalidRange,
  planningUnitAreaNotFound,
  updateFailure,
} from './change-blm-range.command';
import { SetProjectBlm } from './set-project-blm';
import { PlanningUnitAreaFetcher } from './planning-unit-area-fetcher';
import { BlmValuesPolicyFactory } from './BlmValuesPolicyFactory';

@CommandHandler(ChangeBlmRange)
export class ChangeBlmRangeHandler
  implements IInferredCommandHandler<ChangeBlmRange> {
  private readonly logger: Logger = new Logger(SetProjectBlm.name);

  constructor(
    private readonly blmRepository: ProjectBlmRepo,
    private readonly planningUnitAreaFetcher: PlanningUnitAreaFetcher,
    private readonly blmPolicyFactory: BlmValuesPolicyFactory,
  ) {}

  async execute({
    projectId,
    range,
  }: ChangeBlmRange): Promise<Either<ChangeRangeErrors, ProjectBlm>> {
    if (this.isInvalidRange(range)) {
      this.logger.error(
        `Received invalid range [${range}] for project with ID: ${projectId}`,
      );

      return left(invalidRange);
    }

    const result = await this.planningUnitAreaFetcher.execute(projectId);

    if (isLeft(result)) {
      this.logger.error(
        `Could not get Planning Unit area for project with ID: ${projectId}`,
      );

      return result;
    }

    const calculator = this.blmPolicyFactory.get();
    const blmValues = calculator.with(range, result.right);

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

  private isInvalidRange(range: [number, number]) {
    return (
      !Array.isArray(range) ||
      range.length != 2 ||
      range.some((v) => v < 0) ||
      range[0] > range[1]
    );
  }
}
