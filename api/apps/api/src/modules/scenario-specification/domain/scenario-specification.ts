import { AggregateRoot } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import { SpecificationId } from './specification.id';
import { CandidateSpecificationChanged } from './events/candidate-specification-changed.event';
import { SpecificationActivated } from './events/specification-activated.event';

export const noCandidateToActivate = Symbol(
  `No scenario candidate to activate`,
);
export const specificationIsNoLongerACandidate = Symbol(
  `Specification is no longer a candidate.`,
);

export class ScenarioSpecification extends AggregateRoot {
  #active?: SpecificationId; // a one that was published and calculations made and is marked as active (effective)
  #candidate?: SpecificationId;

  constructor(
    public readonly scenarioId: string,
    currentActiveSpecification?: SpecificationId,
    specificationCandidate?: SpecificationId,
  ) {
    super();
    this.#active = currentActiveSpecification;
    this.#candidate = specificationCandidate;
  }

  assignCandidateSpecification(specificationId: SpecificationId): void {
    this.#candidate = specificationId;
    this.apply(new CandidateSpecificationChanged(specificationId));
  }

  activateCandidateSpecification(
    specificationId: SpecificationId,
  ): Either<
    typeof noCandidateToActivate | typeof specificationIsNoLongerACandidate,
    void
  > {
    if (!this.#candidate) {
      return left(noCandidateToActivate);
    }

    if (!this.#candidate.equals(specificationId)) {
      return left(specificationIsNoLongerACandidate);
    }

    this.#active = this.#candidate;
    this.#candidate = undefined;
    this.apply(new SpecificationActivated(this.#active));
    return right(void 0);
  }

  get currentActiveSpecification(): SpecificationId | undefined {
    return this.#active;
  }

  get currentCandidateSpecification(): SpecificationId | undefined {
    return this.#candidate;
  }
}
