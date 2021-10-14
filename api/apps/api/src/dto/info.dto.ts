import { InfoDTO } from 'nestjs-base-service';
import { User } from '@marxan-api/modules/users/user.api.entity';

export type AppInfoDTO = InfoDTO<Pick<User, 'id'>>;
