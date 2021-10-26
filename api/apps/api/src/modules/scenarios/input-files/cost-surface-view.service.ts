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
          this.#fixMarxanIssue(data.lockin_status) ?? 0,
        ].join(this.#separator);
        responseStream.write(`\n`);
        responseStream.write(tsvRow);
      },
    );

    queryStream.on('end', () => {
      responseStream.end();
    });
  }

  /**
   * alicia.arenzana 27.09.2021 10:24
   even though the manual covers a values 0, 1, 2 for maybe, yes and no (inclusion/exclusion)
   the software still uses the old version setup 0, 1, 2, 3 for maybe, we don't know, yes and no (exclusion/inclusion) so our 2 should be an exclusion but is intead an inclusion
   * @param lockinStatus
   */
  #fixMarxanIssue = (lockinStatus: number | null): number | null => {
    if (lockinStatus === 1) {
      return 2;
    }

    if (lockinStatus === 2) {
      return 3;
    }

    return lockinStatus;
  };
}
