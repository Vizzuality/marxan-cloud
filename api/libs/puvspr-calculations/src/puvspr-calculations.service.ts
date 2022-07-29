import { ScenarioFeaturesData } from '@marxan/features';
import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FeatureAmountPerProjectPlanningUnit } from './repository/puvspr-calculations.repository';

export const geoEntityManagerToken = Symbol('geo entity manager token');

export type ComputeFeatureAmountPerPlanningUnit = FeatureAmountPerProjectPlanningUnit & {
  puId: number;
};

@Injectable()
export class PuvsprCalculationsService {
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
    scenarioId: string,
  ): Promise<ComputeFeatureAmountPerPlanningUnit[]> {
    /**
     * @TODO further performance savings: limiting scans to planning_units_geom
     * by partition (we need to get the grid shape from the parent project); use
     * && operator instead of st_intersects() for bbox-based calculation of
     * intersections.
     */
    const rows: {
      featureid: string;
      puid: number;
      projectpuid: string;
      amount: number;
    }[] = await this.geoEntityManager.query(
      `
          WITH all_amount_per_planning_unit as 
          ( select
            $2 as featureId,
            pu.puid as puid,
            pu.id as projectpuid,
            ST_Area(ST_Transform(ST_Intersection(species.the_geom, pu.the_geom),3410)) as amount
          from
          (
              select
                st_union(the_geom) as the_geom
              from scenario_features_preparation sfp
              inner join features_data fd on sfp.feature_class_id = fd.id where sfp.scenario_id = $1
              AND sfp.api_feature_id = $2
              group by sfp.api_feature_id
          ) species,
          (
              select the_geom, ppu.puid as puid, ppu.id as id, spd.scenario_id
              from planning_units_geom pug
              inner join projects_pu ppu on pug.id = ppu.geom_id
              inner join scenarios_pu_data spd on ppu.id = spd.project_pu_id
              where spd.scenario_id = $1 order by ppu.puid asc
          ) pu
          where species.the_geom && pu.the_geom
          )
          select * from all_amount_per_planning_unit where amount > 0 order by puid;
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
            species.amount_from_legacy_project as amount
          from
          (
              select
               fd.project_pu_id as puid,
               fd.amount_from_legacy_project as amount_from_legacy_project
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
