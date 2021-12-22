import { Injectable } from '@nestjs/common';
import { ResultWithBestSolution } from '@marxan/marxan-output';
import { Workspace } from '../ports/workspace';
import { MarxanDirectory } from '../adapters-single/marxan-directory.service';
import { BestSolutionService } from '../adapters-shared/marxan-output-parser/best-solution.service';
import { MarxanOutputParserService } from '../adapters-shared/marxan-output-parser/marxan-output-parser.service';
import { existsSync, promises } from 'fs';

@Injectable()
export class BlmBestRunService {
  constructor(
    private readonly marxanOutputParser: MarxanOutputParserService,
    private readonly bestSolutionsService: BestSolutionService,
    private readonly marxanDirectory: MarxanDirectory,
  ) {}

  async getBlmCalibrationBestRun(
    workspace: Workspace,
    calibrationId: string,
    blmValue: number,
  ): Promise<ResultWithBestSolution> {
    const { fullPath: fullOutputPath } = this.marxanDirectory.get(
      'OUTPUTDIR',
      workspace.workingDirectory,
    );

    if (!existsSync(fullOutputPath + `/output_sum.csv`)) {
      throw new Error(`Output is missing from the marxan run.`);
    }

    const runsSummary = (
      await promises.readFile(fullOutputPath + `/output_sum.csv`)
    ).toString();

    const runs = this.bestSolutionsService.map(
      this.marxanOutputParser.parse(runsSummary),
    );
    const bestRun = runs.find((run) => run.best);

    if (!bestRun) {
      throw new Error(
        `${calibrationId} calibration doesn't have a best run for ${blmValue} BLM value`,
      );
    }

    return bestRun;
  }
}
