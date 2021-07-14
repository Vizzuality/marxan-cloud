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

  async from(file: string): Promise<TypedEmitter<ReaderEvents>> {
    /**
     * get maaping of PU for given scenario
     * <number, string> -> <puid, scenarios_pu_data.id>
     *
     *
     *
     *
     */

    const duplex: Duplex<SolutionRowResult, string> = new PassThrough({
      objectMode: true,
    });
    const rl = createInterface({
      input: createReadStream(file),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      duplex.push(line);
    });

    rl.on('close', () => {
      duplex.end();
    });

    // TODO could it be that silent fails come from there?
    return duplex.pipe(
      new SolutionTransformer({
        0: '+>>>>>>>',
        1: '-1-',
        99: '-99-',
        98: '-^.^-',
      }),
    );
  }
}
