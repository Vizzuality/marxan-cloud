import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import {
  PlanningUnitGridShape,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
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
        isNil(project.countryId) &&
        isNil(project.adminAreaLevel1Id) &&
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
     * We still intersect in case planning unit grid is not fully included in
     * the planning area.
     */
    if (
      this.isProjectUsingCustomPlanningUnitGrid(project) &&
      this.isProjectUsingCustomPlanningArea(project)
    ) {
      return {
        planningUnitSelectionQueryPart: `type = '${PlanningUnitGridShape.fromShapefile}' and project_id = '${project.id}'`,
        planningUnitIntersectionQueryPart: `(select the_geom from planning_areas where project_id = '${project.id}')`,
      };
    }

    if (
      this.isProjectUsingRegularPlanningUnitGrid(project) &&
      this.isProjectUsingCustomPlanningArea(project)
    ) {
      return {
        planningUnitSelectionQueryPart: `type = '${project.planningUnitGridShape}' and size = ${project.planningUnitAreakm2}`,
        planningUnitIntersectionQueryPart: `(select the_geom from planning_areas where project_id = '${project.id}')`,
      };
    }

    if (
      this.isProjectUsingCustomPlanningUnitGrid(project) &&
      this.isProjectUsingGadmPlanningArea(project)
    ) {
      return {
        planningUnitSelectionQueryPart: `type = '${PlanningUnitGridShape.fromShapefile}' and project_id = '${project.id}'`,
        planningUnitIntersectionQueryPart: `(select the_geom from admin_regions where ${this.getQueryPartForAdminAreaSelectionByLevel(
          project,
        )})`,
      };
    }

    if (
      this.isProjectUsingRegularPlanningUnitGrid(project) &&
      this.isProjectUsingGadmPlanningArea(project)
    ) {
      return {
        planningUnitSelectionQueryPart: `type = '${project.planningUnitGridShape}' and size = ${project.planningUnitAreakm2}`,
        planningUnitIntersectionQueryPart: `(select the_geom from admin_regions where ${this.getQueryPartForAdminAreaSelectionByLevel(
          project,
        )})`,
      };
    }
  }

  /**
   * @debt It could be used in ProtectedAreasService.setFilters()
   */
  private getQueryPartForAdminAreaSelectionByLevel(
    adminAreaIds: Pick<
      Project,
      'countryId' | 'adminAreaLevel1Id' | 'adminAreaLevel2Id'
    >,
  ): string | undefined {
    const adminAreaId =
      adminAreaIds.adminAreaLevel2Id ??
      adminAreaIds.adminAreaLevel1Id ??
      adminAreaIds.countryId;
    const adminAreaLevel = AdminAreasService.levelFromId(adminAreaId);

    if (adminAreaLevel === 0) {
      return `gid_0 = '${adminAreaId}' and gid_1 is null and gid_2 is null`;
    }

    if (adminAreaLevel === 1) {
      return `gid_1 = '${adminAreaId}' and gid_2 is null`;
    }

    if (adminAreaLevel === 2) {
      return `gid_2 = '${adminAreaId}'`;
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
                     select id                   as pu_geom_id,
                            '${scenario.id}'     as scenario_id,
                            row_number() over () as puid
                     from planning_units_geom pug
                     where ${queryPartsForLinker.planningUnitSelectionQueryPart}
                       and st_intersects(the_geom, ${queryPartsForLinker.planningUnitIntersectionQueryPart});`;
      await this.puRepo.query(query);
    }
  }
}
