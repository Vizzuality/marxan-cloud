import { SpecificationRepository } from '../specification.repository';
import { FeatureConfigInput, Specification } from '../../domain';
import { intersection } from 'lodash';
import { v4 } from 'uuid';

export class InMemorySpecificationRepo implements SpecificationRepository {
  #memory: Record<string, Specification> = {};

  public readonly scenarioIdToCrashOnSave = v4();

  async getById(id: string): Promise<Specification | undefined> {
    return this.#memory[id];
  }

  async save(specification: Specification): Promise<void> {
    if (specification.scenarioId === this.scenarioIdToCrashOnSave) {
      throw new Error(`Database error`);
    }
    this.#memory[specification.id] = specification;
  }

  count(): number {
    return Object.keys(this.#memory).length;
  }

  async transaction(
    execute: (repo: InMemorySpecificationRepo) => Promise<Specification[]>,
  ): Promise<Specification[]> {
    return execute(this);
  }

  async findAllRelatedToFeatureConfig(
    configuration: FeatureConfigInput,
  ): Promise<Specification[]> {
    return Object.values(this.#memory)
      .flatMap((spec) =>
        spec.toSnapshot().config.flatMap((config) => ({
          specId: spec.id,
          operation: config.operation,
          baseFeatureId: config.baseFeatureId,
          againstFeatureId: config.againstFeatureId,
        })),
      )
      .filter(
        (specFeatures) =>
          specFeatures.baseFeatureId === configuration.baseFeatureId &&
          specFeatures.againstFeatureId === configuration.againstFeatureId &&
          specFeatures.operation === configuration.operation,
      )
      .map((specFeature) => this.#memory[specFeature.specId]);
  }

  async findAllRelatedToFeatures(features: string[]): Promise<Specification[]> {
    return Object.values(this.#memory)
      .flatMap((spec) =>
        spec.toSnapshot().config.flatMap((config) => ({
          specId: spec.id,
          features: config.resultFeatures.map((feature) => feature.featureId),
        })),
      )
      .filter(
        (specFeatures) =>
          intersection(features, specFeatures.features).length > 0,
      )
      .map((specFeature) => this.#memory[specFeature.specId]);
  }
}
