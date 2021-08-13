import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { CreateFeaturesCommand } from './create-features.command';
import { FeaturesCreated } from './features-created.event';
import { EntityManager } from 'typeorm';
import { SpecificationOperation } from '@marxan-api/modules/specification/domain';
import { InjectEntityManager } from '@nestjs/typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { assertDefined, isDefined } from '@marxan/utils';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { Logger } from '@nestjs/common';
import { ProjectsCrudService } from '@marxan-api/modules/projects/projects-crud.service';

@CommandHandler(CreateFeaturesCommand)
export class CreateFeaturesHandler
  implements IInferredCommandHandler<CreateFeaturesCommand> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectEntityManager(apiConnections.geoprocessingDB.name)
    private readonly geoEntityManager: EntityManager,
    @InjectEntityManager()
    private readonly apiEntityManager: EntityManager,
    private readonly projects: ProjectsCrudService,
  ) {}

  async execute(command: CreateFeaturesCommand): Promise<void> {
    switch (command.input.operation) {
      case SpecificationOperation.Stratification: {
        break;
      }
      case SpecificationOperation.Copy: {
        const scenario = await this.apiEntityManager
          .getRepository(Scenario)
          .findOne(command.scenarioId, {
            relations: ['project'],
          });
        assertDefined(scenario);
        const { project } = scenario;
        assertDefined(project);
        const protectedAreaFilterByIds =
          scenario.protectedAreaFilterByIds ?? [];

        const planningAreaLocation = await this.projects.locatePlanningAreaEntity(
          {
            adminAreaLevel1Id: project.adminAreaLevel1Id,
            adminAreaLevel2Id: project.adminAreaLevel2Id,
            countryId: project.countryId,
            planningAreaGeometryId: project.planningAreaGeometryId,
          },
        );

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
        const ids: { id: string }[] = await this.geoEntityManager.query(
          `
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
        `,
          parameters,
        );
        this.eventBus.publish(
          new FeaturesCreated(command.scenarioId, {
            ...command.input,
            features: ids.map(({ id }) => ({ id, calculated: true })),
          }),
        );
      }
      case SpecificationOperation.Split: {
        break;
      }
    }
  }
}
