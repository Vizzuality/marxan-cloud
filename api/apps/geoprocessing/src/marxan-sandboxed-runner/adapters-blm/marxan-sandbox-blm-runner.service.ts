import { Injectable } from '@nestjs/common';
import { JobData } from '@marxan/blm-calibration';

import { SandboxRunner } from '../sandbox-runner';
import { WorkspaceBuilder } from '../ports/workspace-builder';
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';
import { BlmInputFiles } from './blm-input-files';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly inputFilesHandler: BlmInputFiles,
    private readonly outputFilesHandler: SandboxRunnerOutputHandler<void>,
  ) {}

  kill(ofScenarioId: string): void {}

  async run(
    input: JobData,
    progressCallback: (progress: number) => void,
  ): Promise<void> {
    const { blmValues } = input;
    console.log(`running BLM calibration for:`, blmValues);
    const workspaces = await this.inputFilesHandler.for(
      blmValues,
      input.assets,
    );

    for (const workspace of workspaces) {
      // run & persist
      console.log(
        `running for ${workspace.blmValue} - ${workspace.workspace.workingDirectory}`,
      );
    }

    /**
     * should have its own AbortController
     * to be able to kill underlying runs
     */

    /**
     *   for each blmValue, run (sequence, chunks...)
     *   single MarxanSandboxRunnerService
     *
     *   consider creating specific BlmPartialResultsRepository
     *   for each run so that BLM value could be attached
     */

    /**
     * assets:
     *
     * single "fetch" may be performed there
     * or the SandboxRunnerInputFiles may be implemented
     * in such way to handle "single fetch"
     */

    /**
     * it may be necessary to extract some single-run-adapters-single
     * to be used there as well (like workspace)
     */

    return Promise.resolve(undefined);
  }
}
