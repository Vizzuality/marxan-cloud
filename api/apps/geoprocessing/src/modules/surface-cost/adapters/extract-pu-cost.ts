import { isDefined } from '@marxan/utils';
import { MaybeProperties } from '@marxan/utils/types';
import { FeatureCollection, GeoJSON, Geometry } from 'geojson';
import { PlanningUnitCost } from '../ports/planning-unit-cost';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';

type Properties = {
  cost: number;
  planningUnitId: string;
};

type MaybeCost = MaybeProperties<Properties>;

export class ExtractPuCost implements PuExtractorPort {
  extract(geo: GeoJSON): PlanningUnitCost[] {
    if (!this.isFeatureCollection(geo)) {
      throw new Error('Only FeatureCollection is supported.');
    }
    const input: FeatureCollection<Geometry, MaybeCost> = geo;

    const puCosts = input.features
      .map((feature) => feature.properties)
      .filter(this.hasCostValues);

    if (puCosts.length !== input.features.length) {
      throw new Error(
        `Some of the Features are missing cost and/or planning unit id.`,
      );
    }

    return puCosts.map((puCost) => ({
      planningUnitId: puCost.planningUnitId,
      cost: puCost.cost,
    }));
  }

  private isFeatureCollection(geo: GeoJSON): geo is FeatureCollection {
    return geo.type === 'FeatureCollection';
  }

  private hasCostValues(properties: MaybeCost): properties is Properties {
    return (
      isDefined(properties) &&
      isDefined(properties.cost) &&
      isDefined(properties.planningUnitId)
    );
  }
}
