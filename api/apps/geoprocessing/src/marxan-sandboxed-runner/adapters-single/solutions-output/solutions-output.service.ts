import { Injectable } from '@nestjs/common';
import { existsSync, promises } from 'fs';

import { ExecutionResult } from '@marxan/marxan-output';
import { Workspace } from '../../ports/workspace';

import { GeoOutputRepository } from './geo-output';
import { ResultParserService } from './result-parser.service';
import { MarxanDirectory } from '../marxan-directory.service';
import { RunDirectories } from './run-directories';
import { SandboxRunnerOutputHandler } from '../../ports/sandbox-runner-output-handler';

@Injectable()
export class SolutionsOutputService
  implements SandboxRunnerOutputHandler<ExecutionResult>
{
  constructor(
    private readonly geoOutputRepository: GeoOutputRepository,
    private readonly resultParserService: ResultParserService,
    private readonly marxanDirectory: MarxanDirectory,
  ) {
    //
  }

  /**
   * @Alicia notes:
   * for the output files we will want to first run a small script in python that will do some calcs we need to do for the 5 most different solutions; and later we will need to save in the db prior a transformation the next files: output_sum.csv, outputmv_xxxx.csv and outputr_xxxx.csv
   * the other files are derived from this 3 plus the output_log and some summary of the input in the output_sen
   */
  async dump(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdErr?: string[],
  ): Promise<ExecutionResult> {
    const { fullPath: fullOutputPath } = this.marxanDirectory.get(
      'OUTPUTDIR',
      workspace.workingDirectory,
    );
    const { fullPath: fullInputPath } = this.marxanDirectory.get(
      'INPUTDIR',
      workspace.workingDirectory,
    );
    const runDirectories: RunDirectories = {
      output: fullOutputPath,
      input: fullInputPath,
      base: workspace.workingDirectory,
    };
    if (!existsSync(runDirectories.output + `/output_sum.csv`)) {
      throw new Error(`Output is missing from the marxan run.`);
    }
    if (!existsSync(runDirectories.output + `/output_solutionsmatrix.csv`)) {
      throw new Error(
        `Output (solutions matrix) is missing from the marxan run.`,
      );
    }
    const planningUnitsSelection = await this.geoOutputRepository.save(
      scenarioId,
      runDirectories,
      {
        stdOutput,
        stdError: stdErr,
      },
    );

    const runsSummary = (
      await promises.readFile(runDirectories.output + `/output_sum.csv`)
    ).toString();
    return await this.resultParserService.parse(
      runsSummary,
      planningUnitsSelection,
    );
  }

  async dumpFailure(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdError: string[],
  ) {
    const { fullPath: fullInputPath } = this.marxanDirectory.get(
      'INPUTDIR',
      workspace.workingDirectory,
    );
    await this.geoOutputRepository.saveFailure(scenarioId, fullInputPath, {
      stdOutput,
      stdError,
    });
  }

  async cancel(): Promise<void> {
    return;
  }
}
