import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Repository } from 'typeorm';
import { Scenario } from '../scenario.api.entity';

@Injectable()
export class BoundDatService {
  constructor(
    @InjectRepository(Scenario)
    private readonly scenariosRepo: Repository<Scenario>,
    @InjectRepository(PlanningUnitsGeom, DbConnections.geoprocessingDB)
    private readonly puGeomRepo: Repository<PlanningUnitsGeom>,
  ) {}

  async getContent(scenarioId: string): Promise<string> {
    const scenario = await this.scenariosRepo.findOneOrFail(scenarioId);

    const rows: {
      id1: number;
      id2: number;
      boundary: number;
    }[] = await this.puGeomRepo.query(
      `
        with pu as (
          select the_geom, ppu.puid
          from planning_units_geom pug
          inner join projects_pu ppu on pug.id = ppu.geom_id
          where ppu.project_id = $1
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
      [scenario.projectId],
    );
    return (
      'id1\tid2\tboundary\n' +
      rows
        .map((row) => [row.id1, row.id2, row.boundary.toFixed(4)].join(`\t`))
        .join('\n')
    );
  }
}
