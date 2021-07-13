import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Repository } from 'typeorm';

@Injectable()
export class BoundDatService {
  constructor(
    @InjectRepository(PlanningUnitsGeom, DbConnections.geoprocessingDB)
    private readonly repo: Repository<PlanningUnitsGeom>,
  ) {}

  async getContent(scenarioId: string): Promise<string> {
    const rows: {
      id1: number;
      id2: number;
      boundary: number;
    }[] = await this.repo.query(
      `
with pu as (
    select the_geom, spd.puid
    from planning_units_geom pug
    inner join scenarios_pu_data spd on pug.id = spd.pu_geom_id
    where spd.scenario_id = $1
)
select distinct
    a.puid id1,
    b.puid id2,
    ST_Length(
        st_transform(
            ST_CollectionExtract(
                ST_Intersection(
                    a.the_geom, b.the_geom
                ),
                2
            )
            , 3410
        )
    )/1000
    boundary
from pu a, pu b
where
    a.puid < b.puid and
    ST_Touches(a.the_geom, b.the_geom)
    `,
      [scenarioId],
    );
    return (
      'id1\tid2\tboundary\n' +
      rows
        .map((row) => [row.id1, row.id2, row.boundary.toFixed(4)].join(`\t`))
        .join('\n')
    );
  }
}
