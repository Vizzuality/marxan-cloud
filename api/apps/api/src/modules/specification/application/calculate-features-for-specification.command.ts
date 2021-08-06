import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { SpecificationNotFound } from './specification-action-errors';

export class CalculateFeaturesForSpecification extends Command<
  Either<typeof SpecificationNotFound, void>
> {
  constructor(
    public readonly specificationId: string,
    public readonly featureIds: string[],
  ) {
    super();
  }
}
