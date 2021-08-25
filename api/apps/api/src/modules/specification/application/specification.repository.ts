import { FeatureConfigInput, Specification } from '../domain';

export abstract class SpecificationRepository {
  abstract save(specification: Specification): Promise<void>;

  abstract getById(id: string): Promise<Specification | undefined>;

  abstract findAllRelatedToFeatures(
    features: string[],
  ): Promise<Specification[]>;

  abstract findAllRelatedToFeatureConfig(
    configuration: FeatureConfigInput,
  ): Promise<Specification[]>;

  abstract transaction<T>(
    code: (repo: SpecificationRepository) => Promise<T>,
  ): Promise<T>;

  abstract getLastUpdated(ids: string[]): Promise<Specification | undefined>;
}
