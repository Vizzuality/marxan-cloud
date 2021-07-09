import { Injectable } from '@nestjs/common';

import { existsSync, promises } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../../ports/workspace';
import { Cancellable } from '../../ports/cancellable';

import { MarxanExecutionMetadataRepository } from './metadata';
import { ScenariosOutputResultsApiEntity } from '@marxan/scenarios-planning-unit';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

@Injectable()
export class SolutionsOutputService implements Cancellable {
  /**
   * load entities
   * file streamers
   * ...
   */
  constructor(
    @InjectRepository(
      ScenariosOutputResultsApiEntity,
      geoprocessingConnections.apiDB.name,
    )
    private readonly resultsRepo: Repository<ScenariosOutputResultsApiEntity>,
    private readonly metadataRepository: MarxanExecutionMetadataRepository,
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
  async saveFrom(
    workspace: Workspace,
    scenarioId: string,
    stdOutput: string[],
    stdErr?: string[],
  ): Promise<void> {
    if (!existsSync(workspace.workingDirectory + `/output/output_sum.csv`)) {
      throw new Error(`Output is missing from the marxan run.`);
    }
    await this.metadataRepository.save(scenarioId, workspace, {
      stdOutput,
      stdErr,
    });

    // just a sample for brevity, ideally should stream into db tables & use csv streamer
    // const runsSummary = (
    //   await promises.readFile(
    //     workspace.workingDirectory + `/output/output_sum.csv`,
    //   )
    // ).toString();
    // await this.resultsRepo.save(
    //   runsSummary
    //     .split('\n')
    //     .slice(1)
    //     .map((row) => {
    //       const [
    //         runId,
    //         score,
    //         cost,
    //         planningUnits,
    //         connectivity,
    //         connectivityTotal,
    //         connectivityIn,
    //         connectivityEdge,
    //         connectivityOut,
    //         connectivityInFraction,
    //         penalty,
    //         shortfall,
    //         missingValues,
    //         mpm,
    //       ] = row.split(',');
    //       return this.resultsRepo.create({
    //         scenarioId,
    //         scoreValue: +score,
    //       });
    //     }),
    // );

    return;
  }

  cancel(): Promise<void> {
    // TODO if streaming will be involved, can be interrupted
    return Promise.resolve(undefined);
  }
}
