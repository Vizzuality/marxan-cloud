import { SpecificationSnapshot } from '@marxan-api/modules/specification/domain';
import { Query } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';

export const notFound = Symbol(`specification not found`);

export type LastUpdatedSpecificationError = typeof notFound;

export class LastUpdatedSpecification extends Query<
  Either<LastUpdatedSpecificationError, SpecificationSnapshot>
> {
  constructor(public readonly forScenario: string) {
    super();
  }
}
