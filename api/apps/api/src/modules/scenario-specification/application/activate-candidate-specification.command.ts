import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import {
  noCandidateToActivate,
  specificationIsNoLongerACandidate,
} from '../domain';

export const scenarioSpecificationNotFound = Symbol(
  `scenario specification not found`,
);

export type ActivateError =
  | typeof scenarioSpecificationNotFound
  | typeof noCandidateToActivate
  | typeof specificationIsNoLongerACandidate;

export class ActivateCandidateSpecification extends Command<
  Either<ActivateError, void>
> {
  constructor(
    public readonly scenarioId: string,
    public readonly specificationId: string,
  ) {
    super();
  }
}
