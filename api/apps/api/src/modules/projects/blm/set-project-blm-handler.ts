import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/Either';

import { SetProjectBlm } from './set-project-blm';
import { Logger } from '@nestjs/common';
import { ProjectBlmRepository } from '@marxan-api/modules/blm';

@CommandHandler(SetProjectBlm)
export class SetProjectBlmHandler
  implements IInferredCommandHandler<SetProjectBlm> {
  private readonly logger: Logger = new Logger(SetProjectBlm.name);

  constructor(private readonly blmRepository: ProjectBlmRepository) {}

  async execute({ projectId, planningUnitArea }: SetProjectBlm): Promise<void> {
    const cardinality = 6;
    const [min, max] = [0.001, 100];
    const initialArray = Array(cardinality - 1)
      .fill(0)
      .map((_, i) => i + 1);

    const formulaResults = initialArray.map(
      (i) => min + ((max - min) / cardinality - 1) * i,
    );
    const blmValues = [min, ...formulaResults];
    const defaultBlm = blmValues.map(
      (value) => value * Math.sqrt(planningUnitArea),
    );

    const result = await this.blmRepository.create(projectId, defaultBlm);
    if (isLeft(result))
      this.logger.error(
        `Project BLM already created for project with ID: ${projectId}`,
      );
  }
}
