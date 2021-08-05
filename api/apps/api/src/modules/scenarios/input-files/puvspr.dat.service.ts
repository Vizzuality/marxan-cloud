import { Connection, getConnection } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { InjectConnection } from '@nestjs/typeorm';
@Injectable()
export class PuvsprDatService {
  constructor(
    @InjectConnection(DbConnections.geoprocessingDB)
    private readonly connection: Connection,
  ) {}

  async getPuvsprDatContent(scenarioId: string): Promise<string> {
    /**
     * @TODO further performance savings: limiting scans to planning_units_geom
     * by partition (we need to get the grid shape from the parent project); use
     * && operator instead of st_intersects() for bbox-based calculation of
     * intersections.
     */
    const rows: {
      scenario_id: string;
      pu_id: number;
      feature_id: number;
      amount: number;
    }[] = await this.connection.query(`
    select pu.scenario_id as scenario_id, puid as pu_id, feature_id, ST_Area(ST_Transform(st_intersection(species.the_geom, pu.the_geom),3410)) as amount
    from
    (
        select scenario_id, the_geom, sfd.feature_id
        from scenario_features_data sfd
        inner join features_data fd on sfd.feature_class_id = fd.id where sfd.scenario_id = '${scenarioId}'
    ) species,
    (
        select the_geom, spd.puid, spd.scenario_id
        from planning_units_geom pug
        inner join scenarios_pu_data spd on pug.id = spd.pu_geom_id where spd.scenario_id = '${scenarioId}' order by puid asc
    ) pu
    where pu.scenario_id = '${scenarioId}' and species.the_geom && pu.the_geom
    order by puid, feature_id asc;
    `);
    return (
      'species\tpu\tamount\n' +
      rows
        .map(
          (row) => `${row.feature_id}\t${row.pu_id}\t${row.amount.toFixed(6)}`,
        )
        .join('\n')
    );
  }
}
