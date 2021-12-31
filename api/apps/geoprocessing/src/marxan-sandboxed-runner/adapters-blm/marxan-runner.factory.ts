import { ExecutionResult } from '@marxan/marxan-output';
import { JobData } from '@marxan/scenario-run-queue';
import { Injectable } from '@nestjs/common';
import { MarxanSandboxRunnerService } from '../adapters-single/marxan-sandbox-runner.service';
import { SandboxRunner } from '../ports/sandbox-runner';
import { SandboxRunnerInputFiles } from '../ports/sandbox-runner-input-files';
import { SandboxRunnerOutputHandler } from '../ports/sandbox-runner-output-handler';
import { Workspace } from '../ports/workspace';
import { WorkspaceBuilder } from '../ports/workspace-builder';
import { BlmPartialResultsRepository } from './blm-partial-results.repository';

@Injectable()
export class MarxanRunnerFactory {
  constructor(
    private readonly partialResultsRepo: BlmPartialResultsRepository,
  ) {}

  for(
    scenarioId: string,
    calibrationId: string,
    blmValue: number,
    workspace: Workspace,
  ): SandboxRunner<JobData, ExecutionResult> {
    const workspaceBuilder: WorkspaceBuilder = {
      get: async () => workspace,
    };
    const inputFilesHandler: SandboxRunnerInputFiles = {
      include: async () => {
        //do nothing
      },
      cancel: async () => {
        //do nothing
      },
    };
    const outputFilesHandler: SandboxRunnerOutputHandler<ExecutionResult> = {
      dump: async () => {
        await this.partialResultsRepo.savePartialResult(
          workspace,
          scenarioId,
          calibrationId,
          blmValue,
        );
        return [];
      },
      dumpFailure: async () => {
        // do nothing
      },
      cancel: async () => {
        // do nothing
      },
    };

    return new MarxanSandboxRunnerService(
      workspaceBuilder,
      inputFilesHandler,
      outputFilesHandler,
    );
  }
}
