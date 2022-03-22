import { Connection } from 'typeorm';
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
    }[] = await this.connection.query(
      `
        select pu.scenario_id as scenario_id, puid as pu_id, feature_id, ST_Area(ST_Transform(st_intersection(species.the_geom, pu.the_geom),3410)) as amount
        from
        (
            select st_union(the_geom) as the_geom, min(sfd.feature_id) as feature_id
            from scenario_features_data sfd
            inner join features_data fd on sfd.feature_class_id = fd.id where sfd.scenario_id = $1
            group by fd.feature_id
        ) species,
        (
            select the_geom, ppu.puid, spd.scenario_id
            from planning_units_geom pug
            inner join projects_pu ppu on pug.id = ppu.geom_id
            inner join scenarios_pu_data spd on ppu.id = spd.project_pu_id
            where spd.scenario_id = $1 order by ppu.puid asc
        ) pu
        where pu.scenario_id = $1 and species.the_geom && pu.the_geom
        order by puid, feature_id asc;
      `,
      [scenarioId],
    );
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
