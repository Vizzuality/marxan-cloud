import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { ProjectBlmRepository } from '@marxan-api/modules/blm';

import { SetProjectBlm } from './set-project-blm';

@CommandHandler(SetProjectBlm)
export class SetProjectBlmHandler
  implements IInferredCommandHandler<SetProjectBlm> {
  constructor(private readonly blmRepository: ProjectBlmRepository) {}

  async execute({ projectId }: SetProjectBlm): Promise<void> {
    // calculate ...

    // persist + error handling
    await this.blmRepository.create(projectId, [0, 1, 2, 3, 4, 5]);
  }
}
