import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { SpecificationOperation } from '@marxan-api/modules/specification';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { CreateFeaturesCommand } from './create-features.command';
import { FeaturesCreated } from './features-created.event';
import { CopyOperation } from './copy';
import { SplitOperation } from './split';

@CommandHandler(CreateFeaturesCommand)
export class CreateFeaturesHandler
  implements IInferredCommandHandler<CreateFeaturesCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly copyOperation: CopyOperation,
    private readonly splitOperation: SplitOperation,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
    private readonly events: ApiEventsService,
  ) {}

  async execute(command: CreateFeaturesCommand): Promise<void> {
    try {
      switch (command.input.operation) {
        case SpecificationOperation.Stratification: {
          break;
        }
        case SpecificationOperation.Copy: {
          const ids = await this.copyOperation.copy({
            scenarioId: command.scenarioId,
            specificationId: command.specificationId,
            input: command.input,
          });
          this.eventBus.publish(
            new FeaturesCreated(command.scenarioId, command.specificationId, {
              ...command.input,
              features: ids.map(({ id }) => ({ id, calculated: true })),
            }),
          );
          break;
        }
        case SpecificationOperation.Split: {
          const ids = await this.splitOperation.split({
            scenarioId: command.scenarioId,
            specificationId: command.specificationId,
            input: command.input,
          });
          this.eventBus.publish(
            new FeaturesCreated(command.scenarioId, command.specificationId, {
              ...command.input,
              features: ids.map(({ id }) => ({ id, calculated: true })),
            }),
          );
        }
      }
    } catch (error) {
      await this.events.create({
        topic: command.scenarioId,
        kind: API_EVENT_KINDS.scenario__specification__failed__v1__alpha1,
      });
      throw error;
    }
  }
}
