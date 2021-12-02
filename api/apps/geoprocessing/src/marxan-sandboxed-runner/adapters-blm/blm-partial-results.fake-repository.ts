import { Injectable } from '@nestjs/common';
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';
import { Workspace } from '../ports/workspace';

type SomePartialResults = {};

@Injectable()
export class BlmPartialResultsFakeRepository
  implements SandboxRunnerOutputHandler<SomePartialResults> {
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
  ): Promise<SomePartialResults> {
    console.log('DUMP');
    console.dir(workspace, { depth: Infinity });
    console.log(scenarioId);
    console.dir(stdOutput, { depth: Infinity });
    console.dir(stdErr, { depth: Infinity });
    return {};
  }
  dumpFailure(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdError: string[],
  ): Promise<void> {
    console.log('DUMP FAILURE');
    console.dir(workspace, { depth: Infinity });
    console.log(scenarioId);
    console.dir(stdOutput, { depth: Infinity });
    console.dir(stdError, { depth: Infinity });
    return Promise.resolve(undefined);
  }
}
