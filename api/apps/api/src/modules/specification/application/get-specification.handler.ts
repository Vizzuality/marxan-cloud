import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import { SpecificationSnapshot } from '../domain';
import {
  GetLastUpdatedSpecification,
  GetSpecificationError,
  notFound,
} from './get-specification.query';
import { SpecificationRepository } from './specification.repository';

@QueryHandler(GetLastUpdatedSpecification)
export class GetSpecificationHandler
  implements IInferredQueryHandler<GetLastUpdatedSpecification>
{
  constructor(private readonly specificationsRepo: SpecificationRepository) {}

  async execute({
    ids,
  }: GetLastUpdatedSpecification): Promise<
    Either<GetSpecificationError, SpecificationSnapshot>
  > {
    const specification = await this.specificationsRepo.getLastUpdated(ids);
    if (!specification) {
      return left(notFound);
    }
    return right(specification.toSnapshot());
  }
}
