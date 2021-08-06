import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { DetermineFeaturesInput } from '../domain';
import { SpecificationNotFound } from './specification-action-errors';

export class DetermineFeaturesForSpecification extends Command<
  Either<typeof SpecificationNotFound, void>
> {
  constructor(
    public readonly specificationId: string,
    public readonly featuresConfig: DetermineFeaturesInput,
  ) {
    super();
  }
}
