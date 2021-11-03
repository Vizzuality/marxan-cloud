import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { BBox } from 'geojson';
import { User } from '@marxan-api/modules/users/user.api.entity';

export interface ProjectsRequest extends AppInfoDTO {
  params?: {
    featureClassAndAliasFilter?: string;
    projectId?: string;
    bbox?: BBox;
    nameSearch?: string;
  } & AppInfoDTO['params'];
}

export interface ProjectsServiceRequest extends ProjectsRequest {
  authenticatedUser: User;
}
