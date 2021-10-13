import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { BBox } from 'geojson';

export interface ProjectsRequest extends AppInfoDTO {
  params?: {
    featureClassAndAliasFilter?: string;
    projectId?: string;
    bbox?: BBox;
    nameSearch?: string;
  } & AppInfoDTO['params'];
}
