import { Injectable } from '@nestjs/common';
import { Duplex } from 'stronger-typed-streams';
import TypedEmitter from 'typed-emitter';
import { PassThrough } from 'stream';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

import { SolutionTransformer } from './solution-row.transformer';
import { SolutionRowResult } from './solution-row-result';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { PuToScenarioPu } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters/solutions-output/geo-output/solutions/pu-to-scenario-pu';
import { delay } from 'bullmq/dist/utils';

interface ReaderEvents {
  data(rows: SolutionRowResult[]): void;

  error(error: any): void;

  finish(): void;
}

@Injectable()
export class SolutionsReaderService {
  constructor(
    @InjectRepository(ScenariosPlanningUnitGeoEntity)
    private readonly scenarioPuData: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {
    //
  }

  async from(
    file: string,
    scenarioId: string,
  ): Promise<TypedEmitter<ReaderEvents>> {
    const planningUnits = await this.scenarioPuData.findAndCount({
      where: {
        scenarioId,
      },
      select: ['id', 'planningUnitMarxanId'],
    });
    console.log(`----- planning units found:`, planningUnits[1]);
    const mapping = planningUnits[0].reduce<PuToScenarioPu>(
      (previousValue, pu) => {
        previousValue[pu.planningUnitMarxanId] = pu.id;
        return previousValue;
      },
      {},
    );
    console.log(`----- keys in mapper:`, Object.keys(mapping).length);

    const duplex: Duplex<SolutionRowResult, string> = new PassThrough({
      objectMode: true,
    });
    const rl = createInterface({
      input: createReadStream(file),
      crlfDelay: Infinity,
    });

    // let test = 0;
    //
    // rl.on('line', (line) => {
    //   if (test <= 2) {
    //     duplex.push(line);
    //     test += 1;
    //   } else {
    //     duplex.end();
    //   }
    // });

    rl.on(`line`, (line) => {
      duplex.push(line);
    });

    rl.on('close', () => {
      duplex.end();
    });
    console.log(`scenarioId`, scenarioId);
    return duplex.pipe(new SolutionTransformer(mapping));
  }
}
