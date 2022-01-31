import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, isLeft, left } from 'fp-ts/Either';
import { Logger } from '@nestjs/common';

import { Blm, ProjectBlmRepo } from '@marxan-api/modules/blm';

import {
  ChangeProjectBlmRange,
  ChangeProjectRangeErrors,
  invalidRange,
  updateFailure,
} from './change-project-blm-range.command';
import { BlmValuesPolicyFactory } from './blm-values-policy-factory';

@CommandHandler(ChangeProjectBlmRange)
export class ChangeProjectBlmRangeHandler
  implements IInferredCommandHandler<ChangeProjectBlmRange> {
  private readonly logger: Logger = new Logger(ChangeProjectBlmRange.name);

  constructor(
    private readonly blmRepository: ProjectBlmRepo,
    private readonly blmPolicyFactory: BlmValuesPolicyFactory,
  ) {}

  async execute({
    projectId,
    range,
  }: ChangeProjectBlmRange): Promise<Either<ChangeProjectRangeErrors, Blm>> {
    if (this.isInvalidRange(range)) {
      this.logger.error(
        `Received invalid range [${range}] for project with ID: ${projectId}`,
      );

      return left(invalidRange);
    }

    const calculator = this.blmPolicyFactory.get();
    const blmValues = calculator.with(range);

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

    return await this.blmRepository.get(projectId);
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
