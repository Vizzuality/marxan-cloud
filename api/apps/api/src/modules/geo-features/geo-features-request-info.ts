import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { BBox } from 'geojson';
import { FeatureTags } from './geo-feature-set.api.entity';

export interface GeoFeaturesRequestInfo extends AppInfoDTO {
  params?: {
    featureClassAndAliasFilter?: string;
    projectId?: string;
    bbox?: BBox;
    ids?: string[];
    featureTag?: FeatureTags | FeatureTags[];
  };
}
