import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { SpecificationOperation } from '@marxan-api/modules/specification';
import { DbConnections } from '@marxan-api/ormconfig.connections';
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
  ) {}

  async execute(command: CreateFeaturesCommand): Promise<void> {
    switch (command.input.operation) {
      case SpecificationOperation.Stratification: {
        break;
      }
      case SpecificationOperation.Copy: {
        const ids = await this.copyOperation.copy({
          scenarioId: command.scenarioId,
          input: command.input,
        });
        this.eventBus.publish(
          new FeaturesCreated(command.scenarioId, {
            ...command.input,
            features: ids.map(({ id }) => ({ id, calculated: true })),
          }),
        );
        break;
      }
      case SpecificationOperation.Split: {
        const ids = await this.splitOperation.split({
          ...command,
          input: command.input,
        });
        this.eventBus.publish(
          new FeaturesCreated(command.scenarioId, {
            ...command.input,
            features: ids.map(({ id }) => ({ id, calculated: true })),
          }),
        );
      }
    }
  }
}
