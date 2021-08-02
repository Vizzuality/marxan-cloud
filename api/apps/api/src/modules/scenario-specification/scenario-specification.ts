import { AggregateRoot } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import { SpecificationId } from './specification.id';
import { CandidateSpecificationChanged } from './events/candidate-specification-changed.event';
import { SpecificationActivated } from './events/specification-activated.event';

export const NoCandidateToActivate = Symbol(
  `No scenario candidate to activate`,
);
export const SpecificationIsNoLongerACandidate = Symbol(
  `Specification is no longer a candidate.`,
);

export class ScenarioSpecification extends AggregateRoot {
  #currentActiveSpec?: SpecificationId; // a one that was published and calculations made and is marked as active (effective)
  #currentCandidateSpec?: SpecificationId;

  constructor(
    public readonly scenarioId: string,
    currentActiveSpecification?: SpecificationId,
    specificationCandidate?: SpecificationId,
  ) {
    super();
    this.#currentActiveSpec = currentActiveSpecification;
    this.#currentCandidateSpec = specificationCandidate;
  }

  assignCandidateSpecification(specificationId: SpecificationId): void {
    this.#currentCandidateSpec = specificationId;
    this.apply(new CandidateSpecificationChanged(specificationId));
  }

  activateCandidateSpecification(
    specificationId: SpecificationId,
  ): Either<
    typeof NoCandidateToActivate | typeof SpecificationIsNoLongerACandidate,
    void
  > {
    if (!this.#currentCandidateSpec) {
      return left(NoCandidateToActivate);
    }

    if (this.#currentCandidateSpec !== specificationId) {
      return left(SpecificationIsNoLongerACandidate);
    }

    this.#currentActiveSpec = this.#currentCandidateSpec;
    this.#currentCandidateSpec = undefined;
    this.apply(new SpecificationActivated(this.#currentActiveSpec));
    return right(void 0);
  }

  get currentActiveSpecification(): SpecificationId | undefined {
    return this.#currentActiveSpec;
  }

  get currentCandidateSpecification(): SpecificationId | undefined {
    return this.#currentCandidateSpec;
  }
}
