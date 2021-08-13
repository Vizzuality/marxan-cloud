import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import { SpecificationSnapshot } from '../domain';
import {
  GetSpecification,
  GetSpecificationError,
  notFound,
} from './get-specification.query';
import { SpecificationRepository } from './specification.repository';

@QueryHandler(GetSpecification)
export class GetSpecificationHandler
  implements IInferredQueryHandler<GetSpecification> {
  constructor(private readonly specificationsRepo: SpecificationRepository) {}

  async execute({
    id,
  }: GetSpecification): Promise<
    Either<GetSpecificationError, SpecificationSnapshot>
  > {
    const specification = await this.specificationsRepo.getById(id);
    if (!specification) {
      return left(notFound);
    }
    return right(specification.toSnapshot());
  }
}
