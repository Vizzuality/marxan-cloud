import { Injectable } from '@nestjs/common';
import * as stream from 'stream';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

@Injectable()
export class CostSurfaceViewService {
  constructor(
    @InjectRepository(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly spuDataRepo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {}

  async read(scenarioId: string, stream: stream.Writable): Promise<void> {
    stream.write('id\tcost\tstatus');

    // TODO make some changes upon lockin_status
    // TODO add _costs rows
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
    // typeorm query runner/builder -> stream

    queryStream.on('data', (data) => {
      const row = (data as unknown) as {
        puid: number;
        lockin_status: number | null;
        cost: number | null;
      };
      const tsvRow = [row.puid, row.lockin_status, row.cost].join('\t');
      stream.write(`\n`);
      stream.write(tsvRow);
    });
    queryStream.on('result', (data) => {
      console.log(`-result`, data);
    });
    queryStream.on('end', () => {
      // queryRunner.release();
      stream.end();
      console.log(`-end`);
    });
    queryStream.on('error', (error) => {
      // queryRunner.release();
      stream.destroy(error);
      console.log(`-error`, error);
    });

    stream.on(`finish`, () => {
      console.log(`finished?`);
    });
  }
}
