import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import {
  PlanningUnitGridShape,
  Project,
} from '@marxan-api/modules/projects/project.api.entity';
import { Scenario } from '../scenario.api.entity';
import { isNil } from 'lodash';

@Injectable()
export class ScenarioPlanningUnitsLinkerService {
  constructor(
    @InjectRepository(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly puRepo: Repository<ScenariosPlanningUnitGeoEntity>,
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
  ) {}

  /** Currently we only support linking regular planning unit geometries
   * computed via ST_HexagonGrid or ST_SquareGrid */
  private isPlanningUnitGridShapeSupported(
    shape: PlanningUnitGridShape | undefined,
  ): boolean {
    return !isNil(shape)
      ? [PlanningUnitGridShape.hexagon, PlanningUnitGridShape.square].includes(
          shape,
        )
      : false;
  }

  /**
   * Link (existing) planning unit geometries matching project settings and
   * falling within the project bbox to the scenario being created.
   */
  async link(scenario: Scenario): Promise<void> {
    const project = await this.projectsRepo.findOneOrFail(scenario.projectId);
    if (!this.isPlanningUnitGridShapeSupported(project.planningUnitGridShape))
      throw new Error(
        'Only square or hexagonal planning unit grids are supported.',
      );
    if (isNil(project.planningUnitAreakm2) || isNil(project.bbox))
      throw new Error('Incomplete project data: this may be a bug.');

    const [xmin, ymin, xmax, ymax] = project.bbox;
    const query = `insert into scenarios_pu_data (pu_geom_id, scenario_id, puid)
    select id as pu_geom_id, '${scenario.id}' as scenario_id, row_number() over () as puid
    from planning_units_geom pug
    where
      type = '${project.planningUnitGridShape}' and
      size = '${project.planningUnitAreakm2}' and
      st_intersects(the_geom, ST_GeomFromText('MULTIPOLYGON (((${xmin} ${ymin}, ${xmin} ${ymax}, ${xmax} ${ymax}, ${xmax} ${ymin}, ${xmin} ${ymin})))', 4326));`;
    Logger.debug(query);
    await this.puRepo.query(query);
  }
}
