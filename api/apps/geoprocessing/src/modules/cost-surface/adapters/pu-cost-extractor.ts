import { isDefined } from '@marxan/utils';
import { MaybeProperties } from '@marxan/utils/types';
import { FeatureCollection, GeoJSON, Geometry } from 'geojson';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';
import { CostSurfaceShapefileRecord } from '../ports/cost-surface-shapefile-record';

type MaybeCost = MaybeProperties<CostSurfaceShapefileRecord>;

export class PuCostExtractor implements PuExtractorPort {
  extract(geo: GeoJSON): CostSurfaceShapefileRecord[] {
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

    const validPUCosts = puCosts.every(this.hasACostEqualOrGreaterThanZero);

    if (!validPUCosts) {
      throw new Error(`Some of the Features has invalid cost values`);
    }

    return puCosts;
  }

  private isFeatureCollection(geo: GeoJSON): geo is FeatureCollection {
    return geo.type === 'FeatureCollection';
  }

  private hasCostValues(
    properties: MaybeCost,
  ): properties is CostSurfaceShapefileRecord {
    return (
      isDefined(properties) &&
      isDefined(properties.cost) &&
      isDefined(properties.puid)
    );
  }

  private hasACostEqualOrGreaterThanZero(
    puCost: CostSurfaceShapefileRecord,
  ): boolean {
    return puCost.cost >= 0;
  }
}
