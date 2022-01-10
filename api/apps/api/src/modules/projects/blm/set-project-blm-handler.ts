import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/Either';
import { Logger } from '@nestjs/common';

import { SetProjectBlm } from './set-project-blm';
import { ProjectBlmRepo } from '@marxan-api/modules/blm';
import { BlmValuesPolicyFactory } from './blm-values-policy-factory';

@CommandHandler(SetProjectBlm)
export class SetProjectBlmHandler
  implements IInferredCommandHandler<SetProjectBlm> {
  private readonly logger: Logger = new Logger(SetProjectBlm.name);

  constructor(
    private readonly blmRepository: ProjectBlmRepo,
    private readonly blmPolicyFactory: BlmValuesPolicyFactory,
  ) {}

  async execute({ projectId }: SetProjectBlm): Promise<void> {
    const calculator = this.blmPolicyFactory.get();
    const defaultBlm = calculator.withDefaultRange();

    const result = await this.blmRepository.create(projectId, defaultBlm);
    if (isLeft(result))
      this.logger.error(
        `Project BLM already created for project with ID: ${projectId}`,
      );
  }
}
