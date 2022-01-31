import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';

export const blmCreationFailure = Symbol('could not create BLM values');
export type CreationFailure = typeof blmCreationFailure;
export type CreationSuccess = true;

export class CreateInitialBlm extends Command<
  Either<CreationFailure, CreationSuccess>
> {
  constructor(
    public readonly scenarioId: string,
    public readonly projectId: string,
  ) {
    super();
  }
}
