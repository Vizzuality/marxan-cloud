import { ScenarioFeaturesData } from '@marxan/features';
import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

export const geoEntityManagerToken = Symbol('geo entity manager token');

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
      specieId: number;
      featureId: string;
    }[]
  > {
    return this.geoEntityManager
      .createQueryBuilder()
      .select('min(sfd.feature_id)', 'specieId')
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
  ) {
    /**
     * @TODO further performance savings: limiting scans to planning_units_geom
     * by partition (we need to get the grid shape from the parent project); use
     * && operator instead of st_intersects() for bbox-based calculation of
     * intersections.
     *
     * @TODO Calculate `amount` correctly from `amount_from_legacy_project`. The
     * initial implementation is simply a placeholder so that we can use
     * `amount_from_legacy_projects` in legacy project piece importers.
     */
    const rows: {
      featureid: string;
      puid: number;
      amount: number;
    }[] = await this.geoEntityManager.query(
      `
          WITH all_amount_per_planning_unit as 
          ( select
            $2 as featureId,
            pu.puid as puid,
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
              select the_geom, ppu.puid as puid, spd.scenario_id
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

    return rows.map(({ featureid, ...rest }) => ({
      featureId: featureid,
      ...rest,
    }));
  }

  public async computeLegacyAmountPerPlanningUnit(
    featureId: string,
    scenarioId: string,
  ) {
    /**
     * @TODO further performance savings: limiting scans to planning_units_geom
     * by partition (we need to get the grid shape from the parent project); use
     * && operator instead of st_intersects() for bbox-based calculation of
     * intersections.
     *
     * @TODO Calculate `amount` correctly from `amount_from_legacy_project`. The
     * initial implementation is simply a placeholder so that we can use
     * `amount_from_legacy_projects` in legacy project piece importers.
     */
    const rows: {
      puid: number;
      featureid: string;
      amount: number;
    }[] = await this.geoEntityManager.query(
      `
          WITH all_amount_per_planning_unit as 
          ( select
            pu.puid as puid,
            $2 as featureid,
            species.amount_from_legacy_project as amount
          from
          (
              select
               the_geom as the_geom,
               sfd.amount_from_legacy_project as amount_from_legacy_project
              from scenario_features_data sfd
              inner join features_data fd on sfd.feature_class_id = fd.id where sfd.scenario_id = $1
              AND sfd.api_feature_id = $2
          ) species,
          (
              select the_geom, ppu.puid as puid, spd.scenario_id
              from planning_units_geom pug
              inner join projects_pu ppu on pug.id = ppu.geom_id
              inner join scenarios_pu_data spd on ppu.id = spd.project_pu_id
              where spd.scenario_id = $1 order by ppu.puid asc
          ) pu
          where ST_Equals(species.the_geom,pu.the_geom)
          )
          select * from all_amount_per_planning_unit where amount > 0  order by puid;
        `,
      [scenarioId, featureId],
    );

    return rows.map(({ featureid, ...rest }) => ({
      featureId: featureid,
      ...rest,
    }));
  }
}
