import { Injectable } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { FeatureConfigCopy } from '@marxan-api/modules/specification';
import { CreateFeaturesCommand } from '../create-features.command';

@Injectable()
export class CopyQuery {
  public prepareStatement(
    command: CreateFeaturesCommand & { input: FeatureConfigCopy },
    planningAreaLocation: { id: string; tableName: string } | undefined,
    protectedAreaFilterByIds: string[],
    project: Pick<Project, 'bbox'>,
  ): { query: string; parameters: (string | number)[] } {
    const parameters: (string | number)[] = [];
    const fields = {
      scenarioId: `$${parameters.push(command.scenarioId)}`,
      fpf: isDefined(command.input.fpf)
        ? `$${parameters.push(command.input.fpf)}`
        : `NULL`,
      target: isDefined(command.input.target)
        ? `$${parameters.push(command.input.target)}`
        : `NULL`,
      prop: isDefined(command.input.prop)
        ? `$${parameters.push(command.input.prop)}`
        : `NULL`,
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
        `$${parameters.push(project.bbox[1])}`,
        `$${parameters.push(project.bbox[2])}`,
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
    const query = `
          insert into scenario_features_data as sfd (feature_class_id,
                                                     scenario_id,
                                                     fpf,
                                                     target,
                                                     prop,
                                                     total_area,
                                                     current_pa)
          select fd.id,
                 ${fields.scenarioId},
                 ${fields.fpf},
                 ${fields.target},
                 ${fields.prop},
                 ${fields.totalArea},
                 ${fields.protectedArea}
          from features_data as fd
          ${planningAreaJoin}
          ${protectedAreaJoin}
          where feature_id = ${fields.featureId}
            and st_intersects(st_makeenvelope(
              ${fields.bbox[0]},
              ${fields.bbox[1]},
              ${fields.bbox[2]},
              ${fields.bbox[3]},
              4326
            ), fd.the_geom)
          returning sfd.id as id;
        `;
    return { parameters, query };
  }
}
