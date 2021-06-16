import { Injectable } from '@nestjs/common';
import { SolutionsRepository } from '../../ports/solutions-repository';

import { promises } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenariosOutputResultsGeoEntity } from '@marxan/scenarios-planning-unit';

@Injectable()
export class SolutionsOutputFacade implements SolutionsRepository {
  /**
   * load entities
   * file streamers
   * ...
   */
  constructor(
    @InjectRepository(ScenariosOutputResultsGeoEntity)
    private readonly resultsRepo: Repository<ScenariosOutputResultsGeoEntity>,
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
   *
   */
  async saveFrom(rootDirectory: string, scenarioId: string): Promise<void> {
    console.log(await promises.readdir(rootDirectory));
    console.log(await promises.readdir(rootDirectory + '/output'));
    // just a sample for brevity, ideally should stream into db tables & use csv streamer
    const runsSummary = (
      await promises.readFile(rootDirectory + `/output/output_sum.csv`)
    ).toString();
    await this.resultsRepo.save(
      runsSummary
        .split('\n')
        .slice(1)
        .map((row) => {
          const [
            runId,
            score,
            cost,
            planningUnits,
            connectivity,
            connectivityTotal,
            connectivityIn,
            connectivityEdge,
            connectivityOut,
            connectivityInFraction,
            penalty,
            shortfall,
            missingValues,
            mpm,
          ] = row.split(',');
          return this.resultsRepo.create({
            scenarioId,
            scoreValue: +score,
          });
        }),
    );

    return;
  }
}
