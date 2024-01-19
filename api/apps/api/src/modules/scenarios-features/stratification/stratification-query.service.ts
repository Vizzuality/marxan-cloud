import { Injectable } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { FeatureConfigStratification } from '@marxan-api/modules/specification';

@Injectable()
export class StratificationQuery {
  prepareQuery(
    input: FeatureConfigStratification,
    scenarioId: string,
    specificationId: string,
    planningAreaLocation: { id: string; tableName: string } | undefined,
    protectedAreaFilterByIds: string[],
    project: Pick<Project, 'bbox'>,
    createdFeatureId: string,
  ) {
    const parameters: (string | number)[] = [];
    const fields = {
      splitByProperty:
        isDefined(input.splitByProperty) &&
        `$${parameters.push(input.splitByProperty)}`,
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
        protectedAreaFilterByIds.length > 0
          ? 'st_area(st_intersection(protected.area, ifd.intersected_geom))'
          : 'NULL',
      createdFeatureId: `$${parameters.push(createdFeatureId)}`,
      baseFeatureId: `$${parameters.push(input.baseFeatureId)}`,
      intersectedFeatureId: `$${parameters.push(input.againstFeatureId)}`,
      bbox: [
        `$${parameters.push(project.bbox[0])}`,
        `$${parameters.push(project.bbox[2])}`,
        `$${parameters.push(project.bbox[1])}`,
        `$${parameters.push(project.bbox[3])}`,
      ],
      totalArea: isDefined(planningAreaLocation)
        ? `st_area(st_intersection(pa.the_geom, ifd.intersected_geom))`
        : `NULL`,
    };
    const protectedAreaJoin = fields.protectedAreaIds
      ? `cross join (
                   select st_union(wdpa.the_geom) as area
                   from wdpa where wdpa.id in (${fields.protectedAreaIds})
                 ) as protected`
      : '';
    const planningAreaJoin = isDefined(planningAreaLocation)
      ? `left join ${planningAreaLocation.tableName} as pa on pa.id = ${fields.planningAreaId}`
      : ``;

    const hasSubSetFilter = (input.selectSubSets ?? []).length > 0;
    const hasSplit = isDefined(input.splitByProperty);
    // @TODO Because the feature stratification was abandoned for the time being, the changes for the switch from
    // area to amounts related to issue 562 could not be properly tested, but are left donehere for consistency with the other operations
    const query = `
      with inserted_features_data as (
        insert into features_data (the_geom, properties, source, feature_id)
          select st_intersection(fd.the_geom, fd2.the_geom) as intersected_geom,
                 fd.properties || fd2.properties as joined_properties,
                 'intersection',
                 ${fields.createdFeatureId}
          from features_data fd
          left join features_data fd2
              on fd2.feature_id = ${fields.intersectedFeatureId}
          where fd.feature_id = ${fields.baseFeatureId}
            and st_intersects(fd.the_geom, fd2.the_geom)
            ${hasSplit ? `and fd.properties ? ${fields.splitByProperty}` : ''}
          returning features_data.id, the_geom as intersected_geom, properties as joined_properties
      ), subsets as (
        select value as sub_value, target, fpf, prop
        from json_to_recordset('${JSON.stringify(
          input.selectSubSets ?? [],
        )}') as x(
         value varchar, target float8, fpf float8, prop float8
        )
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
      insert into scenario_features_preparation as sfp (feature_class_id,
                                                        scenario_id,
                                                        specification_id,
                                                        fpf,
                                                        target,
                                                        prop,
                                                        total_area,
                                                        current_pa)
      select ifd.id,
             ${fields.scenarioId},
             ${fields.specificationId},
             subsets.fpf,
             subsets.target,
             subsets.prop,
             (select total_amount from total_amounts ta where ta.feature_id = ${
               fields.baseFeatureId
             }),
             (select protected_amount from protected_amounts pa where pa.feature_id = ${
               fields.baseFeatureId
             } and pa.scenario_id = ${fields.scenarioId})
      from inserted_features_data ifd
             ${planningAreaJoin}
             ${
               hasSubSetFilter
                 ? `inner join subsets on subsets.sub_value = ifd.joined_properties->>${fields.splitByProperty}`
                 : ``
             }
             ${protectedAreaJoin}
      where st_intersects(st_makeenvelope(
                            ${fields.bbox[0]},
                            ${fields.bbox[1]},
                            ${fields.bbox[2]},
                            ${fields.bbox[3]},
                            4326
                            ), ifd.intersected_geom)
      returning sfp.id as id;
    `;

    return { parameters, query };
  }
}
