import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { BBox } from 'geojson';

export interface GeoFeaturesRequestInfo extends AppInfoDTO {
  params?: {
    featureClassAndAliasFilter?: string;
    projectId?: string;
    bbox?: BBox;
    ids?: string[];
  };
}
