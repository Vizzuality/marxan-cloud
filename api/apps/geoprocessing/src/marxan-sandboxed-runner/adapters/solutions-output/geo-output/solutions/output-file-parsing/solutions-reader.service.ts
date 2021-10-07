import { Injectable } from '@nestjs/common';
import { Duplex } from 'stronger-typed-streams';
import TypedEmitter from 'typed-emitter';
import { PassThrough } from 'stream';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

import { SolutionTransformer } from './solution-row.transformer';
import { SolutionRowResult } from '../solution-row-result';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { PuToScenarioPu } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters/solutions-output/geo-output/solutions/output-file-parsing/pu-to-scenario-pu';
import { SolutionsEvents } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters/solutions-output/geo-output/solutions/solutions-events';

@Injectable()
export class SolutionsReaderService {
  constructor(
    @InjectRepository(ScenariosPlanningUnitGeoEntity)
    private readonly scenarioPuData: Repository<ScenariosPlanningUnitGeoEntity>,
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
      select: ['id', 'planningUnitMarxanId'],
    });
    const mapping: Record<
      number,
      string
    > = planningUnits[0].reduce<PuToScenarioPu>((previousValue, pu) => {
      previousValue[pu.planningUnitMarxanId] = pu.id;
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
