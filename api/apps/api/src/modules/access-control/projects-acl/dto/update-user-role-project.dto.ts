import { Roles } from '@marxan-api/modules/users/role.api.entity';
import { IsEnum, IsString, IsUUID } from 'class-validator';

export class UpdateUserRoleinProject {
  @IsUUID()
  userId!: string;

  @IsString()
  @IsEnum(Object.values(Roles))
  roleName?:
    | Roles.project_viewer
    | Roles.project_contributor
    | Roles.project_owner;
}
