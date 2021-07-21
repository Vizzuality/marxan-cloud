import { Injectable } from '@nestjs/common';
import { existsSync, promises } from 'fs';

import { ExecutionResult } from '@marxan/marxan-output';
import { Workspace } from '../../ports/workspace';
import { Cancellable } from '../../ports/cancellable';

import { GeoOutputRepository } from './geo-output';
import { ResultParserService } from './result-parser.service';

@Injectable()
export class SolutionsOutputService implements Cancellable {
  constructor(
    private readonly geoOutputRepository: GeoOutputRepository,
    private readonly resultParserService: ResultParserService,
  ) {
    //
  }

  /**
   * @Alicia notes:
   * for the output files we will want to first run a small script in python that will do some calcs we need to do for the 5 most different solutions; and later we will need to save in the db prior a transformation the next files: output_sum.csv, outputmv_xxxx.csv and outputr_xxxx.csv
   * the other files are derived from this 3 plus the output_log and some summary of the input in the output_sen
   *
   * @Kgajowy notes:
   * Treat this class as coordinator
   * ScenariosPuOutputGeoEntity
   *
   */
  async dump(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdErr?: string[],
  ): Promise<ExecutionResult> {
    // TODO remove hardcoded `output`, parse input.dat instead
    if (!existsSync(workspace.workingDirectory + `/output/output_sum.csv`)) {
      throw new Error(`Output is missing from the marxan run.`);
    }
    if (
      !existsSync(
        workspace.workingDirectory + `/output/output_solutionsmatrix.csv`,
      )
    ) {
      throw new Error(
        `Output (solutions matrix) is missing from the marxan run.`,
      );
    }
    await this.geoOutputRepository.save(scenarioId, workspace, {
      stdOutput,
      stdErr,
    });

    const runsSummary = (
      await promises.readFile(
        workspace.workingDirectory + `/output/output_sum.csv`,
      )
    ).toString();

    return this.resultParserService.parse(runsSummary);
  }

  async cancel(): Promise<void> {
    return;
  }
}
