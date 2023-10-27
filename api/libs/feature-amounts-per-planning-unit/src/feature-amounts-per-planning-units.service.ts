import { ScenarioFeaturesData } from '@marxan/features';
import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FeatureAmountPerProjectPlanningUnit } from './repository/feature-amounts-per-planning-unit.repository';

export const geoEntityManagerToken = Symbol('geo entity manager token');

export type ComputeFeatureAmountPerPlanningUnit =
  FeatureAmountPerProjectPlanningUnit & {
    puId: number;
  };

@Injectable()
export class FeatureAmountsPerPlanningUnitService {
  constructor(
    @Inject(geoEntityManagerToken)
    private readonly geoEntityManager: EntityManager,
  ) {}

  public async computeSpeciesId(
    featureIds: string[],
    scenarioId: string,
  ): Promise<
    {
      speciesId: number;
      featureId: string;
    }[]
  > {
    return this.geoEntityManager
      .createQueryBuilder()
      .select('min(sfd.feature_id)', 'speciesId')
      .addSelect('sfd.api_feature_id', 'featureId')
      .from(ScenarioFeaturesData, 'sfd')
      .where('sfd.api_feature_id IN (:...featureIds)', {
        featureIds,
      })
      .andWhere('sfd.scenario_id = :scenarioId', { scenarioId })
      .groupBy('sfd.api_feature_id')
      .execute();
  }

  public async computeMarxanAmountPerPlanningUnit(
    featureId: string,
    projectId: string,
    geoEntityManager?: EntityManager,
  ): Promise<ComputeFeatureAmountPerPlanningUnit[]> {
    /**
     * @TODO further performance savings: limiting scans to planning_units_geom
     * by partition (we need to get the grid shape from the parent project); use
     * && operator instead of st_intersects() for bbox-based calculation of
     * intersections.
     */
    geoEntityManager = geoEntityManager
      ? geoEntityManager
      : this.geoEntityManager;

    const rows: {
      featureid: string;
      puid: number;
      projectpuid: string;
      amount: number;
    }[] = await geoEntityManager.query(
      `
          WITH all_amount_per_planning_unit as
          ( select
              $2 as featureId,
              pu.puid as puid,
              pu.id as projectpuid,
              ST_Area(ST_Transform(ST_Intersection(species.the_geom, pu.the_geom),3410)) as amount
            from
              (
                select st_union(the_geom) as the_geom
                from features_data fd
                where fd.feature_id = $2
                group by fd.feature_id
              ) species,
              (
                select the_geom, ppu.puid as puid, ppu.id as id
                from planning_units_geom pug
                inner join projects_pu ppu on pug.id = ppu.geom_id
                where ppu.project_id = $1
                order by ppu.puid asc
              ) pu
            where species.the_geom && pu.the_geom
          )
          select * from all_amount_per_planning_unit where amount > 0 order by puid;
        `,
      [projectId, featureId],
    );

    return rows.map(({ featureid, projectpuid, puid, amount }) => ({
      featureId: featureid,
      puId: puid,
      projectPuId: projectpuid,
      amount,
    }));
  }

  public async computeLegacyAmountPerPlanningUnit(
    featureId: string,
    scenarioId: string,
  ): Promise<ComputeFeatureAmountPerPlanningUnit[]> {
    /**
     * @TODO further performance savings: limiting scans to planning_units_geom
     * by partition (we need to get the grid shape from the parent project); use
     * && operator instead of st_intersects() for bbox-based calculation of
     * intersections.
     */
    const rows: {
      puid: number;
      projectpuid: string;
      featureid: string;
      amount: number;
    }[] = await this.geoEntityManager.query(
      `
          WITH all_amount_per_planning_unit as
          ( select
            pu.puid as puid,
            pu.id as projectpuid,
            $2 as featureid,
            species.amount as amount
          from
          (
              select
               fd.project_pu_id as puid,
               fd.amount as amount
              from scenario_features_data sfd
              inner join features_data fd on
              sfd.feature_class_id = fd.id where sfd.scenario_id = $1
              AND sfd.api_feature_id = $2
          ) species
          LEFT JOIN projects_pu pu
          ON pu.id = species.puid
          )
          select * from all_amount_per_planning_unit where amount > 0  order by puid;
        `,
      [scenarioId, featureId],
    );

    return rows.map(({ featureid, projectpuid, puid, amount }) => ({
      featureId: featureid,
      puId: puid,
      projectPuId: projectpuid,
      amount,
    }));
  }
}
