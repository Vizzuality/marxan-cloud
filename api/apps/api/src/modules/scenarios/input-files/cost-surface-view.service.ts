import { Injectable } from '@nestjs/common';
import * as stream from 'stream';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

@Injectable()
export class CostSurfaceViewService {
  readonly #separator = '\t';

  constructor(
    @InjectRepository(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly spuDataRepo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {}

  async read(
    scenarioId: string,
    responseStream: stream.Writable,
  ): Promise<void> {
    responseStream.write([`id`, `cost`, `status`].join(this.#separator));

    const query = await this.spuDataRepo
      .createQueryBuilder('spu')
      .select(['spu.puid', 'spu.lockin_status', 'spucd.cost'])
      .leftJoin(
        `scenarios_pu_cost_data`,
        `spucd`,
        `spucd.scenarios_pu_data_id = spu.id`,
      )
      .where(`spu.scenario_id = :scenarioId`, { scenarioId });

    const queryStream = await query.stream();
    // "pipe" does not seem to trigger
    queryStream.on(
      'data',
      (data: {
        puid: number;
        lockin_status: number | null;
        spucd_cost: number | null;
      }) => {
        const tsvRow = [
          data.puid,
          data.spucd_cost ?? 0,
          data.lockin_status ?? 0,
        ].join(this.#separator);
        responseStream.write(`\n`);
        responseStream.write(tsvRow);
      },
    );

    queryStream.on('end', () => {
      responseStream.end();
    });
  }
}
