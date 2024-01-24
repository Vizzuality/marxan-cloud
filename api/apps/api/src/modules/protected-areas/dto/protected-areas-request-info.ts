import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { ProjectSnapshot } from '@marxan/projects';

export interface ProtectedAreasRequestInfo extends AppInfoDTO {
  params: {
    authenticatedUserId?: string;
    project?: ProjectSnapshot;
    fullNameAndCategoryFilter?: string;
    ids?: string[];
  };
}
