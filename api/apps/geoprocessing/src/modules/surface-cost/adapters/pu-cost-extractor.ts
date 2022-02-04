import { isDefined } from '@marxan/utils';
import { MaybeProperties } from '@marxan/utils/types';
import { FeatureCollection, GeoJSON, Geometry } from 'geojson';
import { PlanningUnitCost } from '../ports/planning-unit-cost';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';

type MaybeCost = MaybeProperties<PlanningUnitCost>;

export class PuCostExtractor implements PuExtractorPort {
  extract(geo: GeoJSON): PlanningUnitCost[] {
    if (!this.isFeatureCollection(geo)) {
      throw new Error('Only FeatureCollection is supported.');
    }
    const input: FeatureCollection<Geometry, MaybeCost> = geo;

    const puCosts = input.features
      .map((feature) => feature.properties)
      .filter(this.hasCostValues)
      .filter(this.costIsEqualOrGreaterThanZero);

    if (puCosts.length !== input.features.length) {
      throw new Error(
        `Some of the Features has an invalid cost or are missing cost and/or planning unit id.`,
      );
    }

    return puCosts.map((puCost) => ({
      puid: puCost.puid,
      cost: puCost.cost,
    }));
  }

  private isFeatureCollection(geo: GeoJSON): geo is FeatureCollection {
    return geo.type === 'FeatureCollection';
  }

  private hasCostValues(properties: MaybeCost): properties is PlanningUnitCost {
    return (
      isDefined(properties) &&
      isDefined(properties.cost) &&
      isDefined(properties.puid)
    );
  }

  private costIsEqualOrGreaterThanZero(puCost: PlanningUnitCost): boolean {
    return puCost.cost >= 0;
  }
}
