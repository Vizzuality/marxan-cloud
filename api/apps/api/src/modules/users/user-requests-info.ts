import { AppInfoDTO } from '@marxan-api/dto/info.dto';

export interface UsersRequest extends AppInfoDTO {
  params?: {
    featureClassAndAliasFilter?: string;
    nameSearch?: string;
  } & AppInfoDTO['params'];
}

