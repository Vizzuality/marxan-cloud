import { Injectable } from '@nestjs/common';
import { JobData } from '@marxan/blm-calibration';

import { SandboxRunner } from '../sandbox-runner';
import { WorkspaceBuilder } from '../ports/workspace-builder';
import { SandboxRunnerInputFiles } from '../sandbox-runner-input-files';
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';

@Injectable()
export class MarxanSandboxBlmRunnerService
  implements SandboxRunner<JobData, void> {
  constructor(
    private readonly workspaceService: WorkspaceBuilder,
    private readonly inputFilesHandler: SandboxRunnerInputFiles,
    private readonly outputFilesHandler: SandboxRunnerOutputHandler<void>,
  ) {}

  kill(ofScenarioId: string): void {}

  run(
    input: JobData,
    progressCallback: (progress: number) => void,
  ): Promise<void> {
    const { blmValues } = input;

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
