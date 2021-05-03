import { JobStatus } from 'modules/scenarios/scenario.api.entity';
import {
  GeoprocessingOpSplitV1,
  GeoprocessingOpStratificationV1,
} from '../types/geo-feature.geoprocessing-operations.type';
import { MarxanSettingsForGeoFeature } from '../types/geo-feature.marxan-settings.type';

class SpecForPlainGeoFeature {
  featureId!: string;
  marxanSettings!: MarxanSettingsForGeoFeature;
  geoprocessingOperations?: never;
}

class SpecForGeoFeatureWithGeoprocessing {
  featureId!: string;
  geoprocessingOperations?: Array<
    GeoprocessingOpSplitV1 | GeoprocessingOpStratificationV1
  >;
  marxanSettings?: never;
}

export class CreateGeoFeatureSetDTO {
  status!: JobStatus.draft | JobStatus.created;
  features!: Array<SpecForPlainGeoFeature | SpecForGeoFeatureWithGeoprocessing>;
}
