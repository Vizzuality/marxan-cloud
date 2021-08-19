import { Injectable } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import { FeatureConfigSplit } from '@marxan-api/modules/specification';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { CreateFeaturesCommand } from '../create-features.command';

@Injectable()
export class SplitQuery {
  prepareQuery(
    input: FeatureConfigSplit,
    command: CreateFeaturesCommand,
    planningAreaLocation: { id: string; tableName: string } | undefined,
    protectedAreaFilterByIds: string[],
    project: Pick<Project, 'bbox'>,
  ) {
    const parameters: (string | number)[] = [];
    const fields = {
      filterByValues: (input.selectSubSets ?? []).map(
        (s) => `$${parameters.push(s.value)}`,
      ),
      splitByProperty: `$${parameters.push(input.splitByProperty)}`,
      scenarioId: `$${parameters.push(command.scenarioId)}`,
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
      featureId: `$${parameters.push(command.input.baseFeatureId)}`,
      bbox: [
        `$${parameters.push(project.bbox[0])}`,
        `$${parameters.push(project.bbox[2])}`,
        `$${parameters.push(project.bbox[1])}`,
        `$${parameters.push(project.bbox[3])}`,
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

    const hasSubSetFilter = (input.selectSubSets ?? []).length > 0;
    const query = `
            insert into scenario_features_data as sfd (feature_class_id,
                                                     scenario_id,
                                                     fpf,
                                                     target,
                                                     prop,
                                                     total_area,
                                                     current_pa)
            WITH split as (
              WITH subsets as (
              select value as sub_value, target, fpf, prop
              from json_to_recordset('${JSON.stringify(
                input.selectSubSets ?? [],
              )}') as x(value varchar, target float8, fpf float8,
              prop float8)
              )
              SELECT distinct fpkv.feature_data_id,
              fpkv.key,
              fpkv.value,
              subsets.fpf,
              subsets.prop,
              subsets.target
              from feature_properties_kv fpkv
              left join subsets
              on fpkv.value::TEXT = subsets.sub_value:: varchar
              where fpkv.feature_id = ${fields.featureId}
              and fpkv.key = ${fields.splitByProperty} ${
      hasSubSetFilter
        ? `and fpkv.value IN(${fields.filterByValues.join(',')})`
        : ``
    }
              )
            select fd.id,
                   ${fields.scenarioId},
                   split.fpf,
                   split.target,
                   split.prop,
                   ${fields.totalArea},
                   ${fields.protectedArea}
            from split
                   join features_data as fd
                        on (split.feature_data_id = fd.id)
              ${planningAreaJoin}
              ${protectedAreaJoin}
            where st_intersects(st_makeenvelope(
                ${fields.bbox[0]},
                ${fields.bbox[2]},
                ${fields.bbox[1]},
                ${fields.bbox[3]},
                4326
              ), fd.the_geom)
            returning sfd.id as id;
          `;
    return { parameters, query };
  }
}
