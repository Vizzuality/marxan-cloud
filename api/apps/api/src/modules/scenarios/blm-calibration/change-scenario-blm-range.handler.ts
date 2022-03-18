import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, isLeft, left } from 'fp-ts/Either';
import { ConsoleLogger, Logger } from '@nestjs/common';

import { Blm } from '@marxan-api/modules/blm';

import {
  ChangeScenarioBlmRange,
  ChangeScenarioRangeErrors,
  invalidRange,
  updateFailure,
} from './change-scenario-blm-range.command';
import { ScenarioBlmRepo } from '@marxan-api/modules/blm/values';
import { BlmValuesPolicyFactory } from '@marxan-api/modules/projects/blm/blm-values-policy-factory';

@CommandHandler(ChangeScenarioBlmRange)
export class ChangeScenarioBlmRangeHandler
  implements IInferredCommandHandler<ChangeScenarioBlmRange>
{
  constructor(
    private readonly blmRepository: ScenarioBlmRepo,
    private readonly blmPolicyFactory: BlmValuesPolicyFactory,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(ChangeScenarioBlmRangeHandler.name);
  }

  async execute({
    scenarioId,
    range,
  }: ChangeScenarioBlmRange): Promise<Either<ChangeScenarioRangeErrors, Blm>> {
    if (this.isInvalidRange(range)) {
      this.logger.error(
        `Received invalid range [${range}] for scenario with ID: ${scenarioId}`,
      );

      return left(invalidRange);
    }
    const calculator = this.blmPolicyFactory.get();
    const blmValues = calculator.with(range);

    const updateResult = await this.blmRepository.update(
      scenarioId,
      range,
      blmValues,
    );

    if (isLeft(updateResult)) {
      this.logger.error(
        `Could not update BLM for scenario with ID: ${scenarioId}`,
      );
      return left(updateFailure);
    }

    return this.blmRepository.get(scenarioId);
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
