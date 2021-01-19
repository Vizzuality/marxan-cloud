import { InfoDto } from 'nestjs-base-service';
import { User } from 'modules/users/user.entity';

export type AppInfoDto = InfoDto<User>;
