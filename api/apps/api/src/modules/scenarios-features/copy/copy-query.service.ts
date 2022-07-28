import { Injectable } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { FeatureConfigCopy } from '@marxan-api/modules/specification';
import { SingleSplitConfigFeatureValueStripped } from '@marxan/features-hash';

type Fields = {
  specificationId: string;
  protectedAreaIds: string | undefined;
  planningAreaId: string;
  prop: string;
  bbox: string[];
  protectedArea: string;
  scenarioId: string;
  fpf: string;
  featureId: string;
  key: string | undefined;
  value: string | undefined;
  baseFeatureId: string | undefined;
  target: string;
  totalArea: string;
};

type Joins = {
  md5HashJoin: string;
  protectedAreaJoin: string;
  planningAreaJoin: string;
  featurePropertiesKvJoin: string;
};

type Input = Pick<
  FeatureConfigCopy,
  'fpf' | 'target' | 'prop' | 'baseFeatureId'
>;
@Injectable()
export class CopyQuery {
  public prepareStatement(
    command: {
      scenarioId: string;
      specificationId: string;
      input: Input;
    },
    planningAreaLocation: { id: string; tableName: string } | undefined,
    protectedAreaFilterByIds: string[],
    project: Pick<Project, 'bbox'>,
    featureGeoOps: SingleSplitConfigFeatureValueStripped | null,
  ): {
    query: string;
    parameters: (string | number)[];
  } {
    const { parameters, fields, joins } = this.prepareParams(
      command,
      planningAreaLocation,
      protectedAreaFilterByIds,
      project,
      featureGeoOps,
    );
    const isDerivedFeature = isDefined(fields.baseFeatureId);
    const query = `
      with inserted_sfp as (
        insert into scenario_features_preparation as sfp (feature_class_id,
                                                          api_feature_id,
                                                          scenario_id,
                                                          specification_id,
                                                          fpf,
                                                          target,
                                                          prop,
                                                          total_area,
                                                          current_pa,
                                                          hash)
          select fd.id,
                 ${fields.featureId},
                 ${fields.scenarioId},
                 ${fields.specificationId},
                 ${fields.fpf},
                 ${fields.target},
                 ${fields.prop},
                 coalesce(areas_cache.total_area, ${fields.totalArea}),
                 coalesce(areas_cache.current_pa, ${fields.protectedArea}),
                 md5hash
          from features_data as fd
          ${joins.featurePropertiesKvJoin}
          ${joins.planningAreaJoin}
          ${joins.md5HashJoin}
          left join areas_cache on areas_cache.hash = md5hash
          where feature_id = ${
            isDerivedFeature ? fields.baseFeatureId : fields.featureId
          }
          and st_intersects(st_makeenvelope(
          ${fields.bbox[0]},
          ${fields.bbox[2]},
          ${fields.bbox[1]},
          ${fields.bbox[3]}, 4326), fd.the_geom)
          returning sfp.id as id, sfp.hash as hash, sfp.total_area as total_area, sfp.current_pa as current_pa
      ), inserted_cache as (
          insert into areas_cache (hash, total_area, current_pa)
          select hash, total_area, current_pa from inserted_sfp
          on conflict do nothing
      )
      select id from inserted_sfp`;
    return { parameters, query };
  }

  private prepareParams(
    command: {
      scenarioId: string;
      specificationId: string;
      input: Input;
    },
    planningAreaLocation: { id: string; tableName: string } | undefined,
    protectedAreaFilterByIds: string[],
    project: Pick<Project, 'bbox'>,
    featureGeoOps: SingleSplitConfigFeatureValueStripped | null,
  ) {
    const parameters: (string | number)[] = [];
    const usedFields: Partial<Fields> = {};
    const fields: Fields = {
      get scenarioId() {
        return (usedFields.scenarioId ??= `$${parameters.push(
          command.scenarioId,
        )}`);
      },
      get specificationId() {
        return (usedFields.specificationId ??= `$${parameters.push(
          command.specificationId,
        )}`);
      },
      get fpf() {
        return (usedFields.fpf ??= isDefined(command.input.fpf)
          ? `$${parameters.push(command.input.fpf)}`
          : `NULL`);
      },
      get target() {
        return (usedFields.target ??= isDefined(command.input.target)
          ? `$${parameters.push(command.input.target)}`
          : `NULL`);
      },
      get prop() {
        return (usedFields.prop ??= isDefined(command.input.prop)
          ? `$${parameters.push(command.input.prop)}`
          : `NULL`);
      },
      get planningAreaId() {
        return (usedFields.planningAreaId ??= isDefined(planningAreaLocation)
          ? `$${parameters.push(planningAreaLocation.id)}`
          : `NULL`);
      },
      get protectedAreaIds() {
        return (usedFields.protectedAreaIds ??=
          protectedAreaFilterByIds.length > 0
            ? protectedAreaFilterByIds
                .map((id) => `$${parameters.push(id)}::uuid`)
                .join(', ')
            : undefined);
      },
      get protectedArea() {
        return (usedFields.protectedArea ??=
          protectedAreaFilterByIds.length > 0
            ? `st_area(st_transform(st_intersection(st_intersection(pa.the_geom, fd.the_geom), (
                 select st_union(wdpa.the_geom) as area
                 from wdpa where st_intersects(st_makeenvelope(
                  ${fields.bbox[0]},
                  ${fields.bbox[2]},
                  ${fields.bbox[1]},
                  ${fields.bbox[3]},
                  4326
                ), wdpa.the_geom) and wdpa.id in (${fields.protectedAreaIds})
            )),3410))`
            : 'NULL');
      },
      get featureId() {
        return (usedFields.featureId ??= `$${parameters.push(
          command.input.baseFeatureId,
        )}`);
      },
      get bbox() {
        return (usedFields.bbox ??= [
          `$${parameters.push(project.bbox[0])}`,
          `$${parameters.push(project.bbox[1])}`,
          `$${parameters.push(project.bbox[2])}`,
          `$${parameters.push(project.bbox[3])}`,
        ]);
      },
      get totalArea() {
        return (usedFields.totalArea ??= isDefined(planningAreaLocation)
          ? `st_area(st_transform(st_intersection(pa.the_geom, fd.the_geom), 3410))`
          : `NULL`);
      },
      get baseFeatureId() {
        return (usedFields.baseFeatureId ??= isDefined(featureGeoOps)
          ? `$${parameters.push(featureGeoOps.baseFeatureId)}`
          : undefined);
      },
      get key() {
        return (usedFields.key ??= isDefined(featureGeoOps)
          ? `$${parameters.push(featureGeoOps.splitByProperty)}`
          : undefined);
      },
      get value() {
        return (usedFields.value ??=
          isDefined(featureGeoOps) && isDefined(featureGeoOps.value)
            ? `$${parameters.push(featureGeoOps.value)}`
            : undefined);
      },
    };
    const baseFeatureAndKeyAreDefined =
      isDefined(fields.baseFeatureId) && isDefined(fields.key);
    const usedJoins: Partial<Joins> = {};
    const joins: Joins = {
      get protectedAreaJoin() {
        return (usedJoins.protectedAreaJoin ??= fields.protectedAreaIds
          ? `cross join (
           select st_union(wdpa.the_geom) as area
           from wdpa where st_intersects(st_makeenvelope(
            ${fields.bbox[0]},
            ${fields.bbox[2]},
            ${fields.bbox[1]},
            ${fields.bbox[3]},
            4326
          ), wdpa.the_geom) and wdpa.id in (${fields.protectedAreaIds})
         ) as protected`
          : '');
      },
      get planningAreaJoin() {
        return (usedJoins.planningAreaJoin ??= isDefined(planningAreaLocation)
          ? `left join ${planningAreaLocation.tableName} as pa on pa.id = ${fields.planningAreaId}`
          : ``);
      },
      get md5HashJoin() {
        return (usedJoins.md5HashJoin ??= `
        cross join md5(
                ${
                  isDefined(planningAreaLocation) ? `pa.hash || '|' ||` : ''
                } fd.id || '|' ||
                ${fields.bbox[0]}::double precision || '|' ||
                ${fields.bbox[2]}::double precision || '|' ||
                ${fields.bbox[1]}::double precision || '|' ||
                ${fields.bbox[3]}::double precision
                ${
                  fields.protectedAreaIds
                    ? `|| '|' ||` +
                      fields.protectedAreaIds
                        .replace(/::uuid/g, '::text')
                        .replace(/,/g, ` || `)
                    : ''
                }
            ) as md5hash
    `);
      },
      get featurePropertiesKvJoin() {
        return (usedJoins.featurePropertiesKvJoin ??=
          isDefined(featureGeoOps) && baseFeatureAndKeyAreDefined
            ? `inner join ( 
            SELECT DISTINCT feature_data_id 
            FROM feature_properties_kv fpkv
            WHERE feature_id = ${fields.baseFeatureId}
            and fpkv.key = ${fields.key}
            ${
              fields.value
                ? `and trim('"' FROM fpkv.value::text) = trim('"' FROM ${fields.value}::text)`
                : ``
            }
            ) sfpkv
            ON sfpkv.feature_data_id = fd.id`
            : ``);
      },
    };
    return { parameters, fields, joins };
  }
}
