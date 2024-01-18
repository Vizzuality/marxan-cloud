import { GeoFeature } from './geo-feature.api.entity';

/**
 * When reporting feature min/max ranges, amounts set by users for "legacy"
 * features (that is, either features from legacy projects or features from
 * CSV files with puvspr data - for both we set `isLegacy = true`) should
 * be used verbatim; amounts calculated within the platform for features
 * uploaded from shapefiles, instead, should be divided by 1M in order to
 * report them in square km rather than in square metres (they are stored
 * in square metres in the platform's backend).
 */
export function transformMinMaxAmountsFromSquareMetresToSquareKmsForFeaturesFromShapefile(
  feature: Partial<GeoFeature> | undefined,
): { min: number | null; max: number | null } {
  let minResult = feature?.amountMin ?? null;
  let maxResult = feature?.amountMax ?? null;
  if (!feature?.isLegacy) {
    if (feature?.amountMin) {
      const minKm2 = feature.amountMin / 1_000_000;
      minResult =
        minKm2 < 1 ? parseFloat(minKm2.toFixed(4)) : Math.round(minKm2);
    }
    if (feature?.amountMax) {
      const maxKm2 = feature.amountMax / 1_000_000;
      maxResult =
        maxKm2 < 1 ? parseFloat(maxKm2.toFixed(4)) : Math.round(maxKm2);
    }
  }
  return { min: minResult, max: maxResult };
}
