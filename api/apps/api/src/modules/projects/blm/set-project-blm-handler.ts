import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/Either';
import { ProjectBlmRepository } from '@marxan-api/modules/blm';

import { SetProjectBlm } from './set-project-blm';
import { ProjectBlmRepositoryToken } from '@marxan-api/modules/blm/values/repositories/project-blm-repository';
import { Inject } from '@nestjs/common';

@CommandHandler(SetProjectBlm)
export class SetProjectBlmHandler
  implements IInferredCommandHandler<SetProjectBlm> {
  constructor(
    @Inject(ProjectBlmRepositoryToken)
    private readonly blmRepository: ProjectBlmRepository,
  ) {}

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
    if (isLeft(result)) throw new Error('Project BLM already created');
  }
}
