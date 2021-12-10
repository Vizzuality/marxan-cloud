import { Injectable } from '@nestjs/common';
import { SandboxRunnerOutputHandler } from '../sandbox-runner-output-handler';
import { Workspace } from '../ports/workspace';
import { RunDirectories } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/solutions-output/run-directories';
import { existsSync, promises } from 'fs';
import { GeoOutputRepository } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/solutions-output/geo-output';
import { ResultParserService } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/solutions-output/result-parser.service';
import { MarxanDirectory } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters-single/marxan-directory.service';
import { Repository } from 'typeorm';
import { BlmPartialResultEntity } from '@marxan/blm-calibration/blm-partial-results.geo.entity';
import { InjectRepository } from '@nestjs/typeorm';

type SomePartialResults = {};

@Injectable()
export class BlmPartialResultsTypeOrmRepository
  implements SandboxRunnerOutputHandler<SomePartialResults> {
  private foo = 0;
  constructor(
    @InjectRepository(BlmPartialResultEntity)
    private readonly repository: Repository<BlmPartialResultEntity>,
    private readonly geoOutputRepository: GeoOutputRepository,
    private readonly resultParserService: ResultParserService,
    private readonly marxanDirectory: MarxanDirectory,
  ) {}
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
    const resultRows = await this.resultParserService.parse(
      runsSummary,
      planningUnitsSelection,
    );

    const input = await promises.readFile(runDirectories.input + `.dat`, {
      encoding: 'utf-8',
    });
    const matcher = new RegExp(/BLM\s(.*)/);
    const blmValue = matcher.exec(input);
    if (!blmValue) throw new Error('Could not find BLM value');
    const parsedBlmValue = parseFloat(blmValue[1]);

    if (isNaN(parsedBlmValue)) throw new Error('Invalid BLM value');

    const blmPartialResults = resultRows.map((r, i) => ({
      blmValue: parsedBlmValue,
      scenarioId,
      score: r.score,
      boundaryLength: r.connectivity,
      count: i + 1,
    }));

    console.log('-------------------------------------------');
    console.dir(resultRows, { depth: Infinity });
    console.dir(blmPartialResults, { depth: Infinity });
    console.log('-------------------------------------------');
    console.log(`Called repository.save ${++this.foo} times`);

    await this.repository.save(blmPartialResults);

    return blmPartialResults;
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
