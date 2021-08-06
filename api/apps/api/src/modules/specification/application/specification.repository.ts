import { FeatureConfigInput, Specification } from '../domain';

export abstract class SpecificationRepository {
  abstract save(specification: Specification): Promise<void>;

  abstract getById(id: string): Promise<Specification | undefined>;

  abstract findAllRelatedToFeatures(
    features: string[],
  ): Promise<Specification[]>;

  abstract findAllRelatedToFeatureConfig(
    configurations: FeatureConfigInput,
  ): Promise<Specification[]>;

  abstract transaction(
    code: (repo: SpecificationRepository) => Promise<Specification[]>,
  ): Promise<Specification[]>;
}
