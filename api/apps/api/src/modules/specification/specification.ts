import { AggregateRoot } from '@nestjs/cqrs';
import { v4 } from 'uuid';
import { Either, left, right } from 'fp-ts/Either';
import {
  FeatureConfig,
  FeatureConfigInput,
  FeatureState,
} from './feature-config';
import {
  SpecificationSnapshot,
  SpecificationSnapshotInput,
} from './specification.snapshot';
import { DeterminedFeatures } from './commands/determine-features.command';

import { SpecificationReadyToActivate } from './events/specification-ready-to-activate.event';
import { SpecificationPublished } from './events/specification-published.event';
import { SpecificationCreated } from './events/specification-created.event';

export class Specification extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public readonly scenarioId: string,
    private configuration: FeatureConfig[] = [],
    private draft: boolean,
    private activated: boolean,
  ) {
    super();
  }

  static from(snapshot: SpecificationSnapshotInput): Specification {
    return new Specification(
      snapshot.id,
      snapshot.scenarioId,
      snapshot.config,
      snapshot.draft,
      snapshot.activated,
    );
  }

  static new(
    forScenario: string,
    input: FeatureConfigInput[],
    draft: boolean,
  ): Specification {
    const specification = new Specification(
      v4(),
      forScenario,
      input.map((input) => ({
        ...input,
        featuresDetermined: false,
        resultFeatures: [],
      })),
      draft,
      false,
    );
    specification.apply(
      new SpecificationCreated(specification.scenarioId, specification.id),
    );
    return specification;
  }

  toSnapshot(): SpecificationSnapshot {
    return {
      id: this.id,
      scenarioId: this.scenarioId,
      draft: this.draft,
      readyToActivate:
        this.allFeaturesDetermined() && this.allFeaturesCalculated(),
      config: this.configuration,
      activated: this.activated,
      featuresDetermined: this.allFeaturesDetermined(),
    };
  }

  determineFeatures(features: DeterminedFeatures[]) {
    features.forEach((feature) => {
      const configPiece = this.configuration.find(
        (featureConfig) =>
          featureConfig.baseFeatureId === feature.baseFeatureId &&
          featureConfig.againstFeatureId === feature.againstFeatureId,
      );
      if (!configPiece) {
        return;
      }
      configPiece.resultFeatures = feature.features;
      configPiece.featuresDetermined = true;
    });

    if (this.allFeaturesDetermined() && !this.draft) {
      this.apply(
        new SpecificationPublished(
          this.id,
          this.relatedSubFeaturesRequiringCalculations(),
        ),
      );
    }
  }

  markAsCalculated(featureIds: string[]): void {
    this.configuration.forEach((featureConfig) =>
      featureConfig.resultFeatures.forEach((feature) => {
        if (featureIds.includes(feature.id)) {
          feature.calculated = true;
        }
      }),
    );

    if (this.allFeaturesCalculated() && !this.draft) {
      this.apply(new SpecificationReadyToActivate(this.id));
    }
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

  private relatedSubFeaturesRequiringCalculations(): string[] {
    return this.configuration.flatMap((featureConfig) =>
      featureConfig.resultFeatures
        .filter((feature) => !feature.calculated)
        .map((feature) => feature.id),
    );
  }
}
