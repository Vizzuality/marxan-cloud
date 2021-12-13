import { ExecutionResult } from '@marxan/marxan-output';

export abstract class BlmFinalResultsRepository {
  abstract saveBest(
    results: ExecutionResult,
    calibrationId: string,
    scenarioId: string,
    blmValue: number,
  ): Promise<void>;
}
