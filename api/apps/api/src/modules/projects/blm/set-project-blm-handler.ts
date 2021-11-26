import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/Either';
import { Logger } from '@nestjs/common';

import { SetProjectBlm } from './set-project-blm';
import { ProjectBlmRepo } from '@marxan-api/modules/blm';
import { BlmValuesCalculator } from './domain/blm-values-calculator';
import { PlanningUnitAreaFetcher } from '@marxan-api/modules/projects/blm/planning-unit-area-fetcher';

@CommandHandler(SetProjectBlm)
export class SetProjectBlmHandler
  implements IInferredCommandHandler<SetProjectBlm> {
  private readonly logger: Logger = new Logger(SetProjectBlm.name);

  constructor(
    private readonly blmRepository: ProjectBlmRepo,
    private readonly planningUnitAreaFetcher: PlanningUnitAreaFetcher,
  ) {}

  async execute({ projectId }: SetProjectBlm): Promise<void> {
    const areaResult = await this.planningUnitAreaFetcher.execute(projectId);

    if (isLeft(areaResult)) {
      this.logger.error(
        `Could not get Planning Unit area for project with ID: ${projectId}`,
      );

      return;
    }

    const defaultBlm = BlmValuesCalculator.withDefaultRange(areaResult.right);

    const result = await this.blmRepository.create(projectId, defaultBlm);
    if (isLeft(result))
      this.logger.error(
        `Project BLM already created for project with ID: ${projectId}`,
      );
  }
}
