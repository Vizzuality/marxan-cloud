import { Query } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { SpecificationSnapshot } from '../domain';

export const notFound = Symbol(`specification not found`);

export type GetSpecificationError = typeof notFound;

export class GetLastUpdatedSpecification extends Query<
  Either<GetSpecificationError, SpecificationSnapshot>
> {
  constructor(public readonly ids: string[]) {
    super();
  }
}
