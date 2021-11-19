import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, right } from 'fp-ts/Either';

import { ChangeBlmRange, ChangeRangeErrors } from './change-blm-range.command';
import { ProjectBlmRepository } from '@marxan-api/modules/blm';
import { Inject } from '@nestjs/common';
import { ProjectBlmRepositoryToken } from '@marxan-api/modules/blm/values/repositories/project-blm-repository';

@CommandHandler(ChangeBlmRange)
export class ChangeBlmRangeHandler
  implements IInferredCommandHandler<ChangeBlmRange> {
  constructor(
    @Inject(ProjectBlmRepositoryToken)
    private readonly blmRepository: ProjectBlmRepository,
  ) {}

  async execute({
    projectId,
    range,
  }: ChangeBlmRange): Promise<Either<ChangeRangeErrors, true>> {
    return right(true);
  }
}
