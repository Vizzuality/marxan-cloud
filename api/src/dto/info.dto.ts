import { InfoDTO } from 'nestjs-base-service';
import { User } from 'modules/users/user.api.entity';

export type AppInfoDTO = InfoDTO<User>;
