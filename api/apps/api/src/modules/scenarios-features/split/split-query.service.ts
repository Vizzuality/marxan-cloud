import { Injectable } from '@nestjs/common';
import { antimeridianBbox, isDefined, nominatim2bbox } from '@marxan/utils';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { SingleSplitConfigFeatureValueWithId } from './split-create-features.service';

@Injectable()
export class SplitQuery {
  prepareQuery(
    {
      id: apiFeatureId,
      singleSplitFeature,
    }: SingleSplitConfigFeatureValueWithId,
    scenarioId: string,
    specificationId: string,
    planningAreaLocation: { id: string; tableName: string } | undefined,
    protectedAreaFilterByIds: string[],
    project: Pick<Project, 'bbox'>,
  ) {
    const subset = singleSplitFeature.subset;
    const { westBbox, eastBbox } = antimeridianBbox(
      nominatim2bbox(project.bbox),
    );
    const parameters: (string | number)[] = [];
    const fields = {
      filterByValue: subset ? `$${parameters.push(subset.value)}` : undefined,
      fpf: subset && subset.fpf ? `$${parameters.push(subset.fpf)}` : 'NULL',
      prop: subset && subset.prop ? `$${parameters.push(subset.prop)}` : 'NULL',
      target:
        subset && subset.target ? `$${parameters.push(subset.target)}` : 'NULL',
      splitByProperty: `$${parameters.push(
        singleSplitFeature.splitByProperty,
      )}`,
      scenarioId: `$${parameters.push(scenarioId)}`,
      specificationId: `$${parameters.push(specificationId)}`,
      planningAreaId: isDefined(planningAreaLocation)
        ? `$${parameters.push(planningAreaLocation.id)}`
        : `NULL`,
      baseFeatureId: `$${parameters.push(singleSplitFeature.baseFeatureId)}`,
      apiFeatureId: `$${parameters.push(apiFeatureId)}`,
      westBbox: [
        `$${parameters.push(westBbox[0])}`,
        `$${parameters.push(westBbox[1])}`,
        `$${parameters.push(westBbox[2])}`,
        `$${parameters.push(westBbox[3])}`,
      ],
      eastBbox: [
        `$${parameters.push(eastBbox[0])}`,
        `$${parameters.push(eastBbox[1])}`,
        `$${parameters.push(eastBbox[2])}`,
        `$${parameters.push(eastBbox[3])}`,
      ],
    };
    const planningAreaJoin = isDefined(planningAreaLocation)
      ? `left join ${planningAreaLocation.tableName} as pa on pa.id = ${fields.planningAreaId}`
      : ``;
    const query = `
      insert into scenario_features_preparation as sfp (feature_class_id,
                                                        api_feature_id,
                                                        scenario_id,
                                                        specification_id,
                                                        fpf,
                                                        target,
                                                        prop,
                                                        total_area,
                                                        current_pa)
      WITH split as (
        SELECT distinct fpkv.feature_data_id,
                        fpkv.key,
                        fpkv.value
        from feature_properties_kv fpkv
          where fpkv.feature_id = ${fields.baseFeatureId}
          and fpkv.key = ${fields.splitByProperty}
          ${
            fields.filterByValue
              ? `and trim('"' FROM fpkv.value::text) = trim('"' FROM ${fields.filterByValue}::text)`
              : ``
          }
      ),
      total_amounts as (
        select feature_id, SUM(amount) as total_amount from feature_amounts_per_planning_unit
        where feature_id = ${fields.baseFeatureId}
        group by feature_id
      ),
      protected_amounts as (
        select spd.scenario_id, fappu.feature_id, SUM(fappu.amount) as protected_amount
        from scenarios_pu_data spd inner join feature_amounts_per_planning_unit fappu on fappu.project_pu_id = spd.project_pu_id
        where spd.lockin_status = 1 and fappu.feature_id = ${
          fields.baseFeatureId
        } and spd.scenario_id = ${fields.scenarioId}
        group by spd.scenario_id, fappu.feature_id
      )
      select fd.id,
            ${fields.apiFeatureId},
             ${fields.scenarioId},
             ${fields.specificationId},
             ${fields.fpf},
             ${fields.target},
             ${fields.prop},
             (select total_amount from total_amounts ta where ta.feature_id = ${
               fields.baseFeatureId
             }),
             (select protected_amount from protected_amounts pa where pa.feature_id = ${
               fields.baseFeatureId
             } and pa.scenario_id = ${fields.scenarioId})
      from split
             join features_data as fd
                  on (split.feature_data_id = fd.id)
        ${planningAreaJoin}
        where st_intersects(ST_MakeEnvelope(${fields.westBbox
          .map((coordinate) => coordinate)
          .join(',')}, 4326), fd.the_geom)
        or st_intersects(ST_MakeEnvelope(${fields.eastBbox
          .map((coordinate) => coordinate)
          .join(',')}, 4326), fd.the_geom)
        returning sfp.id as id, sfp.feature_class_id as features_data_id;
    `;
    return { parameters, query };
  }
}
