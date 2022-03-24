import { Injectable } from '@nestjs/common';
import { Duplex } from 'stronger-typed-streams';
import TypedEmitter from 'typed-emitter';
import { PassThrough } from 'stream';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SolutionTransformer } from './solution-row.transformer';
import { SolutionRowResult } from '../solution-row-result';
import { PuToScenarioPu } from './pu-to-scenario-pu';
import { SolutionsEvents } from '../solutions-events';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';

@Injectable()
export class SolutionsReaderService {
  constructor(
    @InjectRepository(ScenariosPuPaDataGeo)
    private readonly scenarioPuData: Repository<ScenariosPuPaDataGeo>,
  ) {}

  async from(
    outputsDirectory: string,
    scenarioId: string,
  ): Promise<TypedEmitter<SolutionsEvents>> {
    const solutionsFile = outputsDirectory + `/output_solutionsmatrix.csv`;
    const planningUnits = await this.scenarioPuData.findAndCount({
      where: {
        scenarioId,
      },
      relations: ['projectPu'],
    });
    const mapping: Record<
      number,
      string
    > = planningUnits[0].reduce<PuToScenarioPu>((previousValue, pu) => {
      previousValue[pu.projectPu.puid] = pu.id;
      return previousValue;
    }, {});
    const duplex: Duplex<SolutionRowResult, string> = new PassThrough({
      objectMode: true,
    });
    const rl = createInterface({
      input: createReadStream(solutionsFile),
      crlfDelay: Infinity,
    });

    rl.on(`line`, (line) => {
      duplex.push(line);
    });

    rl.on('close', () => {
      duplex.end();
    });
    return duplex.pipe(new SolutionTransformer(mapping));
  }
}
