import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { CollectGarbage } from './collect-garbage.command';

@CommandHandler(CollectGarbage)
export class CollectGarbageHandler
  implements IInferredCommandHandler<CollectGarbage> {
  async execute({ id, projectId }: CollectGarbage): Promise<void> {
    // check if PA isn't used any longer
    // if so, delete it
  }
}
