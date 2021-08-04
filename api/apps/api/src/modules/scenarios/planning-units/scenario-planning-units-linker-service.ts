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
import { AdminAreasService } from '@marxan-api/modules/admin-areas/admin-areas.service';

/**
 * Literal query parts to be used in template query to select planning areas
 * relevant for the current scenario, based on parent project settings.
 */
type QueryPartsForLinker = {
  planningUnitSelectionQueryPart: string;
  planningUnitIntersectionQueryPart: string;
};
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

  private isPlanningUnitGridShapeRegular(
    shape: PlanningUnitGridShape | undefined,
  ): boolean {
    return (
      !isNil(shape) &&
      [PlanningUnitGridShape.hexagon, PlanningUnitGridShape.square].includes(
        shape,
      )
    );
  }

  private isProjectUsingCustomPlanningArea(project: Project): boolean {
    return (
      !isNil(project.planningAreaGeometryId) &&
      isNil(project.countryId) &&
      isNil(project.adminAreaLevel1Id) &&
      isNil(project.adminAreaLevel2Id)
    );
  }

  private isProjectUsingGadmPlanningArea(project: Project): boolean {
    return (
      isNil(project.planningAreaGeometryId) &&
      !(
        isNil(project.countryId) ||
        isNil(project.adminAreaLevel1Id) ||
        isNil(project.adminAreaLevel2Id)
      )
    );
  }

  private isProjectUsingRegularPlanningUnitGrid(project: Project): boolean {
    return (
      this.isPlanningUnitGridShapeRegular(project.planningUnitGridShape) &&
      !isNil(project.planningUnitAreakm2)
    );
  }

  private isProjectUsingCustomPlanningUnitGrid(project: Project): boolean {
    return (
      project.planningUnitGridShape === PlanningUnitGridShape.fromShapefile &&
      isNil(project.planningUnitAreakm2)
    );
  }

  private getQueryPartsForLinker(
    project: Project,
  ): QueryPartsForLinker | undefined {
    /**
     * @TODO selection by planning_units_geom.project_id needs project_id column
     * to be added and set.
     *
     * We still intersect in case planning unit grid is not fully included in
     * the planning area.
     */
    if (
      this.isProjectUsingCustomPlanningArea(project) &&
      this.isProjectUsingCustomPlanningUnitGrid(project)
    ) {
      return {
        planningUnitIntersectionQueryPart: `type = '${PlanningUnitGridShape.fromShapefile}' and project_id = '${project.id}'`,
        planningUnitSelectionQueryPart: `(select the_geom from planning_areas where project_id = ${project.id}`,
      };
    }

    if (
      this.isProjectUsingCustomPlanningArea(project) &&
      this.isProjectUsingRegularPlanningUnitGrid(project)
    ) {
      return {
        planningUnitIntersectionQueryPart: `type = '${PlanningUnitGridShape.fromShapefile}' and project_id = '${project.id}'`,
        planningUnitSelectionQueryPart: `type = '${project.planningUnitGridShape}' and size = ${project.planningUnitAreakm2}`,
      };
    }

    if (
      this.isProjectUsingGadmPlanningArea(project) &&
      this.isProjectUsingCustomPlanningUnitGrid(project)
    ) {
      const adminAreaId =
        project.adminAreaLevel2Id ??
        project.adminAreaLevel1Id ??
        project.countryId;
      const adminAreaLevel = AdminAreasService.levelFromId(adminAreaId);
      return {
        planningUnitIntersectionQueryPart: `(select the_geom from admin_regions where gid_${adminAreaLevel} = '${adminAreaId}')`,
        planningUnitSelectionQueryPart: `(select the_geom from planning_areas where project_id = ${project.id}`,
      };
    }

    if (
      this.isProjectUsingGadmPlanningArea(project) &&
      this.isProjectUsingRegularPlanningUnitGrid(project)
    ) {
      const adminAreaId =
        project.adminAreaLevel2Id ??
        project.adminAreaLevel1Id ??
        project.countryId;
      const adminAreaLevel = AdminAreasService.levelFromId(adminAreaId);
      return {
        planningUnitIntersectionQueryPart: `(select the_geom from admin_regions where gid_${adminAreaLevel} = '${adminAreaId}')`,
        planningUnitSelectionQueryPart: `type = '${project.planningUnitGridShape}' and size = ${project.planningUnitAreakm2}`,
      };
    }
  }

  /**
   * Link (existing) planning unit geometries matching project settings and
   * falling within the project bbox to the scenario being created.
   */
  async link(scenario: Scenario): Promise<void> {
    const project = await this.projectsRepo.findOneOrFail(scenario.projectId);
    const queryPartsForLinker = this.getQueryPartsForLinker(project);
    // If we don't have suitable settings from which to calculate intersection
    // of planning units with scenario, do nothing.
    // In practice this should not be allowed, but since this is not enforced
    // upstream yet, and since the frontend app will (should) always send all
    // that is needed, this should be fine for a first pass.
    if (queryPartsForLinker) {
      const query = `insert into scenarios_pu_data (pu_geom_id, scenario_id, puid)
      select id as pu_geom_id, '${scenario.id}' as scenario_id, row_number() over () as puid
      from planning_units_geom pug
      where
        ${queryPartsForLinker.planningUnitSelectionQueryPart} and
        st_intersects(the_geom, ${queryPartsForLinker.planningUnitIntersectionQueryPart});`;
      await this.puRepo.query(query);
    }
  }
}
