import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { intersection } from 'lodash';
import { Repository } from 'typeorm';

import { isDefined } from '@marxan/utils';
import { ProjectSnapshot } from '@marxan/projects';
import { ProtectedArea } from '@marxan/protected-areas';
import { IUCNCategory } from '@marxan/iucn';

import { AdminAreasService } from '@marxan-api/modules/admin-areas/admin-areas.service';
import { PlanningAreasService } from '@marxan-api/modules/planning-areas';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { ScenarioProtectedArea } from '../scenario-protected-area';
import { ProtectedAreaKind } from '../protected-area.kind';

@Injectable()
export class SelectionGetService {
  constructor(
    @InjectRepository(ProtectedArea, DbConnections.geoprocessingDB)
    protected readonly repository: Repository<ProtectedArea>,
    private readonly planningArea: PlanningAreasService,
  ) {}

  async getFor(
    scenario: {
      id: string;
      protectedAreaIds: string[];
    },
    project: ProjectSnapshot,
  ): Promise<ScenarioProtectedArea[]> {
    const { areas, categories } = await this.getGlobalProtectedAreas(project);

    const projectCustomAreas = await this.repository.find({
      where: {
        projectId: project.id,
      },
    });

    return [
      ...categories.map((category) => ({
        name: category,
        id: category,
        kind: ProtectedAreaKind.Global,
        selected:
          intersection(scenario.protectedAreaIds, areas[category] ?? [])
            .length > 0,
      })),
      ...projectCustomAreas.map((area) => ({
        name: area.fullName ?? '',
        id: area.id,
        kind: ProtectedAreaKind.Project,
        selected: scenario.protectedAreaIds.includes(area.id),
      })),
    ];
  }

  async getGlobalProtectedAreas(
    project: Pick<
      ProjectSnapshot,
      | 'countryId'
      | 'adminAreaLevel1'
      | 'adminAreaLevel2'
      | 'adminAreaRegion'
      | 'customPlanningArea'
    >,
  ): Promise<{
    categories: string[];
    areas: Record<string, string[]>;
  }> {
    const query = this.repository
      .createQueryBuilder('wdpa')
      .select(`iucn_cat`, `iucnCategory`)
      .distinct(true);

    // debt: duplicated from protected-areas.crud
    // debt: possibly remove it at all, we have all gid's
    if (project?.adminAreaRegion) {
      const level = AdminAreasService.levelFromId(project.adminAreaRegion);
      let whereClause: string;
      if (level === 0) {
        whereClause = `gid_0 = '${project.countryId}' and gid_1 is null and gid_2 is null`;
      } else if (level === 1) {
        whereClause = `gid_0 = '${project.countryId}' and gid_1 = '${project.adminAreaLevel1}' and gid_2 is null`;
      } else if (level === 2) {
        whereClause = `gid_0 = '${project.countryId}' and gid_1 = '${project.adminAreaLevel1}' and gid_2 = '${project.adminAreaLevel2}'`;
      } else {
        // debt: extract validation to standalone function
        throw new BadRequestException(
          'An invalid administrative area id may have been provided.',
        );
      }
      query.andWhere(
        `st_intersects(the_geom, (select the_geom from admin_regions WHERE ${whereClause}))`,
      );
    }

    if (project?.customPlanningArea) {
      query.andWhere(`st_intersects(the_geom, (select the_geom from planning_areas a
        WHERE a.id = '${project.customPlanningArea}'))`);
    }

    const wdpaCategories = (await query.getRawMany())
      .map((area) => area.iucnCategory)
      .filter(isDefined);

    if (wdpaCategories.length === 0) {
      return {
        categories: [],
        areas: {},
      };
    }

    const res = await this.planningArea.locatePlanningAreaEntity({
      countryId: project.countryId,
      adminAreaLevel1Id: project.adminAreaLevel1,
      adminAreaLevel2Id: project.adminAreaLevel2,
      planningAreaGeometryId: project.customPlanningArea,
    });

    if (!res) {
      return {
        categories: [],
        areas: {},
      };
    }

    const wdpaAreas =
      await this.findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(
        res.id,
        res.tableName,
        wdpaCategories,
      );

    /**
     * There may be multiple WDPA Areas per single WDPA Category
     * for example
     *
     * GEOM_001 'V'
     * GEOM_002 'V'
     * GEOM_003 'V'
     * ...
     *
     */

    const areas: Record<string, string[]> = {};
    for (const area of wdpaAreas) {
      if (!area.iucnCategory) continue;
      areas[area.iucnCategory] ??= [];
      areas[area.iucnCategory].push(area.id);
    }
    return {
      categories: wdpaCategories,
      areas,
    };
  }

  private async findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(
    planningAreaId: string,
    planningAreaTableName: string,
    iucnCategories: IUCNCategory[],
  ): Promise<ProtectedArea[]> {
    return await this.repository
      .createQueryBuilder(`protected_area`)
      .where(
        `protected_area.iucn_cat IN (:...iucnCategories)
        AND st_intersects(protected_area.the_geom,
        (select the_geom from ${planningAreaTableName} pa WHERE pa.id = :planningAreaId));`,
        { planningAreaId, iucnCategories },
      )
      .getMany();
  }
}
