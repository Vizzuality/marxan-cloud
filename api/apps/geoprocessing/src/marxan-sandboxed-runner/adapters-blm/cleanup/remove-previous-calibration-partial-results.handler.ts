import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { BlmPartialResultsRepository } from '../blm-partial-results.repository';
import { RemovePreviousCalibrationPartialResults } from './remove-previous-calibration-partial-results.command';

@CommandHandler(RemovePreviousCalibrationPartialResults)
export class RemovePreviousCalibrationPartialResultsHandler
  implements IInferredCommandHandler<RemovePreviousCalibrationPartialResults> {
  constructor(
    private readonly partialResultsRepo: BlmPartialResultsRepository,
  ) {}

  async execute({
    scenarioId,
    currentCalibrationId,
  }: RemovePreviousCalibrationPartialResults): Promise<void> {
    await this.partialResultsRepo.removePreviousPartialResults(
      scenarioId,
      currentCalibrationId,
    );
  }
}
