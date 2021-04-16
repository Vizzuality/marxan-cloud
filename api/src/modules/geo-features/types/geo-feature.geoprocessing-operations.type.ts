import { MarxanSettingsForGeoFeature } from './geo-feature.marxan-settings.type';

interface SplitV1Settings {
  value: string;
  marxanSettings: MarxanSettingsForGeoFeature;
}

export interface GeoprocessingOpSplitV1 {
  kind: 'split/v1';
  splitByProperty: string;
  splits: SplitV1Settings[];
}

export interface GeoprocessingOpStratificationV1 {
  kind: 'stratification/v1';
  intersectWith: {
    featureId: string;
  };
  splitByProperty: string;
  splits: SplitV1Settings[];
}
