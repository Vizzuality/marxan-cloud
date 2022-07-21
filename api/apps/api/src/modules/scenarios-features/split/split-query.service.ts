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
      protectedAreaIds:
        protectedAreaFilterByIds.length > 0
          ? protectedAreaFilterByIds
              .map((id) => `$${parameters.push(id)}`)
              .join(', ')
          : undefined,
      protectedArea:
        protectedAreaFilterByIds.length > 0 ? 'protected.area' : 'NULL',
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
      totalArea: isDefined(planningAreaLocation)
        ? `st_area(st_intersection(pa.the_geom, fd.the_geom))`
        : `NULL`,
    };
    const protectedAreaJoin = fields.protectedAreaIds
      ? `cross join (
                   select st_area(st_union(wdpa.the_geom)) as area
                   from wdpa where wdpa.id in (${fields.protectedAreaIds})
                 ) as protected`
      : '';
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
      )
      select fd.id,
            ${fields.apiFeatureId},
             ${fields.scenarioId},
             ${fields.specificationId},
             ${fields.fpf},
             ${fields.target},
             ${fields.prop},
             ${fields.totalArea},
             ${fields.protectedArea}
      from split
             join features_data as fd
                  on (split.feature_data_id = fd.id)
        ${planningAreaJoin} ${protectedAreaJoin}
        where st_intersects(ST_MakeEnvelope(${fields.westBbox
          .map((coordinate) => coordinate)
          .join(',')}, 4326), fd.the_geom)
        or st_intersects(ST_MakeEnvelope(${fields.eastBbox
          .map((coordinate) => coordinate)
          .join(',')}, 4326), fd.the_geom)
        returning sfp.id as id;
    `;
    return { parameters, query };
  }
}
