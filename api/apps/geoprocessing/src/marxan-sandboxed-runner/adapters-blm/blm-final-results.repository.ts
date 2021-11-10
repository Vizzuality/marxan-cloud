import { Injectable } from '@nestjs/common';
import { Workspace } from '../ports/workspace';
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';

@Injectable()
export class BlmFinalResultsRepository
  implements SandboxRunnerOutputHandler<void> {
  /**
   * clear previous results, move the new ones to target
   * table - everything within transaction
   *
   * would be used in main BlmRunService after all runs finished
   */

  cancel(): Promise<void> {
    return Promise.resolve(undefined);
  }

  dump(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdErr: string[] | undefined,
  ): Promise<void> {
    return Promise.resolve(undefined);
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
