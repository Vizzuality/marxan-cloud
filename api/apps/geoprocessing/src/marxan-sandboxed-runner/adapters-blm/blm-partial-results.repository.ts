import { Injectable } from '@nestjs/common';
import { Workspace } from '../ports/workspace';
import { existsSync, promises } from 'fs';
import { MarxanOutputParserService } from '../adapters-shared/marxan-output-parser/marxan-output-parser.service';
import { InjectRepository } from '@nestjs/typeorm';
import { BlmPartialResultEntity } from './blm-partial-results.geo.entity';
import { Repository } from 'typeorm';
import { BestSolutionService } from '../adapters-shared/marxan-output-parser/best-solution.service';
import { MarxanDirectory } from '../adapters-single/marxan-directory.service';

@Injectable()
export class BlmPartialResultsRepository {
  constructor(
    private readonly marxanOutputParser: MarxanOutputParserService,
    private readonly bestSolutionsService: BestSolutionService,
    @InjectRepository(BlmPartialResultEntity)
    private readonly repository: Repository<BlmPartialResultEntity>,
    private readonly marxanDirectory: MarxanDirectory,
  ) {}

  cancel(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async savePartialResult(
    workspace: Workspace,
    scenarioId: string,
    blmValue: number,
  ): Promise<void> {
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
        `${scenarioId} scenario calibration doesn't have a best run for ${blmValue} BLM value`,
      );
    }

    await this.repository.save({
      blmValue,
      boundaryLength: bestRun.connectivity,
      scenarioId,
      score: bestRun.score,
    });
  }
}
