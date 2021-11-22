import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, right } from 'fp-ts/Either';

import { ChangeBlmRange, ChangeRangeErrors } from './change-blm-range.command';
import { ProjectBlmRepo } from '@marxan-api/modules/blm';

@CommandHandler(ChangeBlmRange)
export class ChangeBlmRangeHandler
  implements IInferredCommandHandler<ChangeBlmRange> {
  constructor(private readonly blmRepository: ProjectBlmRepo) {}

  async execute({
    projectId,
    range,
  }: ChangeBlmRange): Promise<Either<ChangeRangeErrors, true>> {
    return right(true);
  }
}
