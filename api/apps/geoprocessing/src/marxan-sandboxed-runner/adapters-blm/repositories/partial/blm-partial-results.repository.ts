import { ExecutionResult } from '@marxan/marxan-output';

export abstract class BlmPartialResultsRepository {
  abstract save(
    results: ExecutionResult,
    scenarioId: string,
    blmValue: number,
  ): Promise<void>;
}
