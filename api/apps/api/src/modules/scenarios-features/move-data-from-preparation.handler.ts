import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  ScenarioFeaturesPreparation,
  ScenarioFeaturesData,
} from '@marxan/features';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { MoveDataFromPreparationCommand } from './move-data-from-preparation.command';
import { DataMovedFormPreparationEvent } from '@marxan-api/modules/scenarios-features';

@CommandHandler(MoveDataFromPreparationCommand)
export class MoveDataFromPreparationHandler
  implements IInferredCommandHandler<MoveDataFromPreparationCommand>
{
  constructor(
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly entityManager: EntityManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: MoveDataFromPreparationCommand): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete(ScenarioFeaturesData, {
        scenarioId: command.scenarioId,
      });
      await transactionalEntityManager.query(
        `
          insert into scenario_features_data as sfd (id,
                                                     feature_class_id,
                                                     scenario_id,
                                                     total_area,
                                                     current_pa,
                                                     fpf,
                                                     target,
                                                     prop,
                                                     target2,
                                                     targetocc,
                                                     sepnum,
                                                     created_by,
                                                     metadata,
                                                     specification_id)
          select id,
                 feature_class_id,
                 scenario_id,
                 total_area,
                 current_pa,
                 fpf,
                 target,
                 prop,
                 target2,
                 targetocc,
                 sepnum,
                 created_by,
                 metadata,
                 specification_id
          from scenario_features_preparation sfp
          where sfp.specification_id = $1
    `,
        [command.specificationId],
      );
      await transactionalEntityManager.delete(ScenarioFeaturesPreparation, {
        specificationId: command.specificationId,
      });
    });

    this.eventBus.publish(
      new DataMovedFormPreparationEvent(
        command.scenarioId,
        command.specificationId,
      ),
    );
  }
}
