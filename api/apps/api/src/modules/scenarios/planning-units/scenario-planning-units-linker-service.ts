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
      [PlanningUnitGridShape.Hexagon, PlanningUnitGridShape.Square].includes(
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
      project.planningUnitGridShape === PlanningUnitGridShape.FromShapefile &&
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
        planningUnitSelectionQueryPart: `type = '${PlanningUnitGridShape.FromShapefile}' and project_id = '${project.id}'`,
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
        planningUnitSelectionQueryPart: `type = '${PlanningUnitGridShape.FromShapefile}' and project_id = '${project.id}'`,
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
      /**
       * @debt Ordering `planning_units_geom` by uuid will ensure that every
       * time a scenario is created from the same project, its planning units
       * will be selected in the same order, therefore making the `puid`
       * attribute of each planning unit stable across all the scenarios of the
       * same project.
       *
       * This could be done more robustly by linking planning units _to
       * projects_, so that puids can be assigned at that moment, and then
       * propagated to individual scenarios. However, this is an intrusive
       * change that will affect many parts of the API which should be avoided
       * at this stage.
       *
       * Without this ordering (the initial implementation did not enforce an
       * order), planning units would be selected in database order, and so
       * their `puid` attribute _may_ be stable in most cases, except when any
       * query updates relevant rows of `planning_units_geom`, which may result
       * in the database order to be changed.
       *
       * Even with ordering, this setup relies on some assumptions that should
       * be ignored in practice for the time being, such as that no updates to
       * the `admin_regions` table are performed between the creation of
       * different scenarios. Small adjustments (amending mistakes, or
       * incorporating hopefully peaceful changes to admin boundaries) may
       * result in generated grids to differ slightly, leading to different
       * `planning_unit_geom` rows to be selected for scenarios created after a
       * GADM geometries update. As ingesting GADM data is an ETL operation that
       * is currently supposed to be done only once at the time a Marxan Cloud
       * instance is set up, the logic below should still be sound, but it would
       * need to be revisited if assumptions we rely on change.
       */
      const query = `
                     with pug as (
                       select * from planning_units_geom
                       order by id
                     )
                     insert into scenarios_pu_data (pu_geom_id, scenario_id, puid)
                     select id                   as pu_geom_id,
                            '${scenario.id}'     as scenario_id,
                            row_number() over () as puid
                     from pug
                     where ${queryPartsForLinker.planningUnitSelectionQueryPart}
                       and st_intersects(the_geom, ${queryPartsForLinker.planningUnitIntersectionQueryPart});`;
      await this.puRepo.query(query);
    }
  }
}
