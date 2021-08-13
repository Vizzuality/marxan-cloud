import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { SpecificationOperation } from '@marxan-api/modules/specification';
import { CreateFeaturesCommand } from './create-features.command';
import { FeaturesCreated } from './features-created.event';
import { CopyOperation } from './copy';

@CommandHandler(CreateFeaturesCommand)
export class CreateFeaturesHandler
  implements IInferredCommandHandler<CreateFeaturesCommand> {
  constructor(
    private readonly eventBus: EventBus,
    private readonly copyOperation: CopyOperation,
  ) {}

  async execute(command: CreateFeaturesCommand): Promise<void> {
    switch (command.input.operation) {
      case SpecificationOperation.Stratification: {
        break;
      }
      case SpecificationOperation.Copy: {
        const ids = await this.copyOperation.copy(command);
        this.eventBus.publish(
          new FeaturesCreated(command.scenarioId, {
            ...command.input,
            features: ids.map(({ id }) => ({ id, calculated: true })),
          }),
        );
        break;
      }
      case SpecificationOperation.Split: {
        break;
      }
    }
  }
}
