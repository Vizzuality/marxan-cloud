import { BBox, GeoJSON } from 'geojson';
import { PuSizes } from './pu-sizes';

export class MarxanGeoJson {
  private readonly geoJson: GeoJSON & { bbox: BBox } & {
    marxanMetadata: {
      maxPuAreaSize: number;
      minPuAreaSize: number;
    };
  };

  constructor(geoJson: GeoJSON, bbox: BBox, puSizes: PuSizes) {
    this.geoJson = {
      ...geoJson,
      bbox: bbox,
      marxanMetadata: {
        maxPuAreaSize: puSizes.maxPuAreaSize,
        minPuAreaSize: puSizes.minPuAreaSize,
      },
    };
  }

  toJSON(): GeoJSON & {
    marxanMetadata?: Record<string, unknown>;
  } {
    return this.geoJson;
  }
}
