import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import * as uuid from 'uuid';
import { CreateFeaturesCommand } from './create-features.command';
import { FeaturesCreated } from './features-created.event';

@CommandHandler(CreateFeaturesCommand)
export class CreateFeaturesHandler
  implements IInferredCommandHandler<CreateFeaturesCommand> {
  constructor(private readonly eventBus: EventBus) {}

  execute(command: CreateFeaturesCommand): Promise<void> {
    this.eventBus.publish(
      new FeaturesCreated(command.scenarioId, {
        ...command.input,
        features: [
          {
            id: uuid.v4(),
            calculated: false,
          },
        ],
      }),
    );
    throw new Error('Method not implemented.');
  }
}
