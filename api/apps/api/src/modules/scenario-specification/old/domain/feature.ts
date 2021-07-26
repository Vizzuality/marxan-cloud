import { FeatureTag } from '@marxan/features/domain';
import { FeatureSubSet } from './feature-sub-set';
import { ComputedFeature } from './computed-feature';

/**
 * TODO may be useful for finding features on geo, thus leaving it
 */
export class Feature<T extends FeatureTag> {
  constructor(
    private readonly id: string,
    private readonly tag: T,
    private readonly featureSubSet: FeatureSubSet[],
    private readonly name: string,
    private readonly computedFeature: boolean,
  ) {}

  split(byKey: string): ComputedFeature[] {
    if (this.tag !== FeatureTag.Bioregional) {
      throw new Error(`Only Bioregional features can be split.`);
    }

    return this.featureSubSet
      .filter((fragment) => fragment.key === byKey)
      .map(
        (fragment) =>
          new ComputedFeature(
            `${fragment.value}`,
            this.id,
            fragment.id,
            `some-id-assigned-by-factory`,
          ),
      );
  }

  stratification(
    against: Feature<FeatureTag.Bioregional> | ComputedFeature[],
  ): ComputedFeature[] {
    if (this.computedFeature) {
      throw new Error(`Custom features cannot be layered.`);
    }

    if (this.tag !== FeatureTag.Species) {
      throw new Error(`Only Species features can be layered.`);
    }

    if (this.#isComputedFeature(against)) {
      return against.map(
        (computedFeature) =>
          new ComputedFeature(
            `${this.name} / ${computedFeature.name}`,
            this.id,
            computedFeature.id,
            `some-id-assigned-by-factory-stratification-multiple`,
          ),
      );
    }

    return [
      new ComputedFeature(
        `${this.name} / ${against.name}`,
        this.id,
        against.id,
        `some-id-assigned-by-factory-stratification-single`,
      ),
    ];
  }

  #isComputedFeature = (
    piece: Feature<FeatureTag.Bioregional> | ComputedFeature[],
  ): piece is ComputedFeature[] => Array.isArray(piece);
}
