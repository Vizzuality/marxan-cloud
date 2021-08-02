import { AggregateRoot } from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { v4 } from 'uuid';

import { SpecificationOperation } from './specification-operation';
import { FeaturesFound } from './features-found.event';
import { CandidateSpecCreated } from './candidate-spec-created.event';
import { SpecificationPublished } from './specification-published.event';
import { SpecificationActivated } from './specification-actived.event';

export class ScenarioSpecification extends AggregateRoot {
  #currentActiveSpec?: Specification; // a one that was published and calculations made and is marked as active (effective)
  #currentCandidateSpec?: Specification;

  constructor(
    public readonly scenarioId: string,
    readonly currentActiveSpecification?: SpecificationSnapshotInput,
    readonly specificationCandidate?: SpecificationSnapshotInput,
  ) {
    super();
    this.#currentActiveSpec = currentActiveSpecification
      ? Specification.from(currentActiveSpecification)
      : undefined;
    this.#currentCandidateSpec = specificationCandidate
      ? Specification.from(specificationCandidate)
      : undefined;
  }

  createCandidate(input: FeatureConfigInput[], draft: boolean) {
    this.#currentCandidateSpec = Specification.new(input, draft);

    const specSnapshot = this.#currentCandidateSpec.toSnapshot();
    this.apply(
      new CandidateSpecCreated(
        specSnapshot.id,
        specSnapshot.config.map((cfg) => ({
          baseFeatureId: cfg.baseFeatureId,
          againstFeatureId: cfg.againstFeatureId,
          operation: cfg.operation,
        })),
      ),
    );
  }

  /**
   * consumes FeaturesFound
   *
   * may lead to activating Candidate Specification
   * as long as all found features are already calculated
   * and specification was marked as 'Create'
   *
   */
  determineFeatures(features: FeaturesFound['spec']) {
    this.#currentCandidateSpec?.determineFeatures(features);
    this.publishCurrentCandidate();
  }

  /**
   * may lead to activating the Candidate Spec
   */
  markFeaturesAsCalculated(features: string[]) {
    if (this.#currentCandidateSpec?.markAsCalculated(features)) {
      this.markCandidateAsActive();
    }
  }

  getActiveSpecification = () => this.#currentActiveSpec?.toSnapshot();
  getCandidateSpecification = () => this.#currentCandidateSpec?.toSnapshot();

  private publishCurrentCandidate() {
    if (!this.#currentCandidateSpec) {
      return;
    }
    const outcome = this.#currentCandidateSpec.publish();

    if (!outcome) {
      return;
    }

    if (isLeft(outcome)) {
      // if draft, its fine
      // if created, we will wait anyway for all features
      return;
    }

    if (outcome.right === SpecCanBePublished) {
      this.apply(
        new SpecificationPublished(
          this.#currentCandidateSpec.id,
          this.#currentCandidateSpec.relatedSubFeaturesRequiringCalculations(),
        ),
      );
    }

    if (outcome.right === SpecCanBeActivated) {
      this.markCandidateAsActive();
    }
  }

  private markCandidateAsActive() {
    if (!this.#currentCandidateSpec) {
      return;
    }
    if (this.#currentCandidateSpec.activate()) {
      this.#currentActiveSpec = this.#currentCandidateSpec;
      this.#currentCandidateSpec = undefined;
      this.apply(new SpecificationActivated(this.#currentActiveSpec.id));
    }
  }
}

const DraftNotPublished = Symbol(`draft-not-published`);
const SpecMissingFeatures = Symbol(`spec-missing-features`);
const SpecCanBePublished = Symbol(`spec-can-be-published`);
const SpecCanBeActivated = Symbol(`spec-can-be-activated`);

type SpecPublishSuccess = typeof SpecCanBePublished | typeof SpecCanBeActivated;
type SpecPublishFailure = typeof DraftNotPublished | typeof SpecMissingFeatures;

class Specification {
  private constructor(
    public readonly id: string,
    private configuration: FeatureConfig[] = [],
    private draft: boolean,
    private activated: boolean,
  ) {
    //
  }

  static from(snapshot: SpecificationSnapshotInput): Specification {
    return new Specification(
      snapshot.id,
      snapshot.config,
      snapshot.draft,
      snapshot.activated,
    );
  }

  static new(input: FeatureConfigInput[], draft: boolean): Specification {
    return new Specification(
      v4(),
      input.map((input) => ({
        ...input,
        featuresDetermined: false,
        resultFeatures: [],
      })),
      draft,
      false,
    );
  }

  toSnapshot(): SpecificationSnapshot {
    return {
      id: this.id,
      draft: this.draft,
      readyToActivate:
        this.allFeaturesDetermined() && this.allFeaturesCalculated(),
      config: this.configuration,
      activated: this.activated,
      featuresDetermined: this.allFeaturesDetermined(),
    };
  }

  publish(): Either<SpecPublishFailure, SpecPublishSuccess> {
    if (this.draft) {
      return left(DraftNotPublished);
    }

    if (!this.allFeaturesDetermined()) {
      return left(SpecMissingFeatures);
    }

    if (this.allFeaturesCalculated()) {
      return right(SpecCanBeActivated);
    }

    return right(SpecCanBePublished);
  }

  activate(): boolean {
    if (this.allFeaturesCalculated() && this.allFeaturesDetermined()) {
      this.activated = true;
    }
    return this.activated;
  }

  determineFeatures(features: FeaturesFound['spec']) {
    features.forEach((feature) => {
      const configPiece = this.configuration.find(
        (featureCfg) =>
          featureCfg.baseFeatureId === feature.baseFeatureId &&
          featureCfg.againstFeatureId === feature.againstFeatureId,
      );
      if (!configPiece) {
        return;
      }
      configPiece.resultFeatures = feature.features;
      configPiece.featuresDetermined = true;
    });
  }

  markAsCalculated(
    featureIds: string[],
  ): typeof SpecCanBeActivated | undefined {
    this.configuration.forEach((featureConfig) =>
      featureConfig.resultFeatures.forEach((feature) => {
        if (featureIds.includes(feature.id)) {
          feature.calculated = true;
        }
      }),
    );

    return this.allFeaturesCalculated() ? SpecCanBeActivated : undefined;
  }

  allFeaturesDetermined(): boolean {
    return this.configuration.every(
      (featureConfig) => featureConfig.featuresDetermined,
    );
  }

  allFeaturesCalculated(): boolean {
    return this.configuration
      .flatMap((configuration) => configuration.resultFeatures)
      .every((feature) => feature.calculated);
  }

  relatedSubFeaturesRequiringCalculations(): string[] {
    return this.configuration.flatMap((featureConfig) =>
      featureConfig.resultFeatures
        .filter((feature) => !feature.calculated)
        .map((feature) => feature.id),
    );
  }
}

export interface FeatureConfigInput {
  operation: SpecificationOperation;
  baseFeatureId: string;
  againstFeatureId?: string;
}

export interface FeatureConfig extends FeatureConfigInput {
  featuresDetermined: boolean;
  resultFeatures: {
    id: string;
    calculated: boolean;
  }[];
}

interface SpecificationSnapshotInput {
  id: string;
  config: FeatureConfig[];
  draft: boolean;
  activated: boolean;
}

interface SpecificationSnapshot extends SpecificationSnapshotInput {
  readyToActivate: boolean;
  featuresDetermined: boolean;
}
