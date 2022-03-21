import { Injectable } from '@nestjs/common';
import { OutputBestParsedRow } from '@marxan/marxan-output';
import { Workspace } from '../ports/workspace';
import { MarxanDirectory } from '../adapters-single/marxan-directory.service';
import { MarxanOutputBestParserService } from '../adapters-shared/marxan-output-parser/marxan-output-best-parser.service';
import { existsSync, promises } from 'fs';

@Injectable()
export class BlmPuidFromBestRunService {
  constructor(
    private readonly marxanOutputParser: MarxanOutputBestParserService,
    private readonly marxanDirectory: MarxanDirectory,
  ) {}

  async getPuidFromBestRun(
    workspace: Workspace,
  ): Promise<OutputBestParsedRow[]> {
    const { fullPath: fullOutputPath } = this.marxanDirectory.get(
      'OUTPUTDIR',
      workspace.workingDirectory,
    );

    if (!existsSync(fullOutputPath + `/output_best.csv`)) {
      throw new Error(`Output is missing from the marxan run.`);
    }

    const runsSummary = (
      await promises.readFile(fullOutputPath + `/output_best.csv`)
    ).toString();

    const puidPerRun = this.marxanOutputParser.parse(runsSummary);

    return puidPerRun;
  }
}
