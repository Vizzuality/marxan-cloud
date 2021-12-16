import { Injectable } from '@nestjs/common';
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';
import { Workspace } from '../ports/workspace';
import { ExecutionResult } from '../../../../../libs/marxan-output/src';

export const blmPartialResultsRepository = Symbol(
  'BLM partial results repository',
);

@Injectable()
export class BlmPartialResultsRepository
  implements SandboxRunnerOutputHandler<ExecutionResult> {
  constructor() {}

  cancel(): Promise<void> {
    return Promise.resolve(undefined);
  }

  /**
   * save partial results (for given blm value)
   * to some temporary table
   *
   * would be used within BlmRunnerService, passed down to RunnerService
   */
  async dump(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdErr: string[] | undefined,
  ): Promise<ExecutionResult> {
    return [];
  }

  dumpFailure(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdError: string[],
  ): Promise<void> {
    return Promise.resolve(undefined);
  }
}
