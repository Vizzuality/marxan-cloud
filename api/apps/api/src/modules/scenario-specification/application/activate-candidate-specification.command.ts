import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import {
  NoCandidateToActivate,
  SpecificationIsNoLongerACandidate,
} from '../domain';

export const ScenarioSpecificationNotFound = Symbol(
  `scenario specification not found`,
);

export type ActivateError =
  | typeof ScenarioSpecificationNotFound
  | typeof NoCandidateToActivate
  | typeof SpecificationIsNoLongerACandidate;

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
